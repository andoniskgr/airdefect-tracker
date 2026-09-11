/**
 * OpCenter Auth0 login + messenger HTML fetch/parse for A80 Off/On events.
 * Passwords are never stored — only session cookies per Firebase uid.
 */

const admin = require("firebase-admin");
const cheerio = require("cheerio");
const functions = require("firebase-functions/v1");

const OPCENTER_ORIGIN = "https://opcenter.arinc.eu";
const OPCENTER_TENANT = "aegean";
const AUTH0_ORIGIN = "https://ims-hermes-prod.uk.auth0.com";
const SESSION_COLLECTION = "opcenterSessions";
const DEFAULT_TAIL = "SX-DVY";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

class CookieJar {
  constructor(initial = "") {
    this.map = new Map();
    if (initial) {
      initial.split(";").forEach((part) => {
        const trimmed = part.trim();
        if (!trimmed) return;
        const eq = trimmed.indexOf("=");
        if (eq === -1) return;
        this.map.set(trimmed.slice(0, eq), trimmed.slice(eq + 1));
      });
    }
  }

  absorb(response) {
    const list = response.headers.getSetCookie
      ? response.headers.getSetCookie()
      : [];
    const single = response.headers.get("set-cookie");
    const entries = list.length ? list : single ? [single] : [];
    for (const entry of entries) {
      const first = String(entry).split(";")[0];
      const eq = first.indexOf("=");
      if (eq === -1) continue;
      const name = first.slice(0, eq).trim();
      const value = first.slice(eq + 1).trim();
      if (!name) continue;
      if (!value || /deleted/i.test(value)) this.map.delete(name);
      else this.map.set(name, value);
    }
  }

  header() {
    return Array.from(this.map.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }
}

async function http(jar, url, options = {}) {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    ...(options.headers || {}),
  };
  const cookie = jar.header();
  if (cookie) headers.Cookie = cookie;

  const response = await fetch(url, {
    redirect: "manual",
    ...options,
    headers,
  });
  jar.absorb(response);
  return response;
}

async function followRedirects(jar, startUrl, maxHops = 14) {
  let url = startUrl;
  let response = await http(jar, url, { method: "GET" });

  for (let i = 0; i < maxHops; i++) {
    if (response.status < 300 || response.status >= 400) {
      const text = await response.text();
      return { url, status: response.status, text };
    }
    const location = response.headers.get("location");
    if (!location) {
      const text = await response.text();
      return { url, status: response.status, text };
    }
    url = new URL(location, url).toString();
    response = await http(jar, url, { method: "GET" });
  }

  throw new Error("Too many redirects during OpCenter request.");
}

function requireAuth(context) {
  if (!context.auth?.uid) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Sign in to the MCC app first."
    );
  }
  return context.auth.uid;
}

async function saveSession(uid, jar) {
  await admin.firestore().collection(SESSION_COLLECTION).doc(uid).set({
    cookies: jar.header(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
}

async function loadSessionJar(uid) {
  const snap = await admin
    .firestore()
    .collection(SESSION_COLLECTION)
    .doc(uid)
    .get();
  if (!snap.exists) return null;
  const data = snap.data();
  if (!data?.cookies) return null;
  if (data.expiresAt && Date.now() > Number(data.expiresAt)) return null;
  return new CookieJar(data.cookies);
}

async function clearSession(uid) {
  await admin.firestore().collection(SESSION_COLLECTION).doc(uid).delete();
}

function formatHhMm(hhmm) {
  const s = String(hhmm).replace(/\D/g, "").padStart(4, "0").slice(0, 4);
  return `${s.slice(0, 2)}:${s.slice(2, 4)}`;
}

function flightIdFromAcars(num) {
  return `A3${String(parseInt(num, 10))}`;
}

function parseFreetextEvent(text) {
  if (!text) return null;

  const off = text.match(
    /OFFRP\s+(\d+)\/(\d+)\s+([A-Z0-9]+)\/([A-Z0-9]+)\s+\.([A-Z0-9-]+)\s+\/OUT\s+(\d+)\/OFF\s+(\d+)/i
  );
  if (off) {
    return {
      type: "off",
      flightId: flightIdFromAcars(off[1]),
      departureStation: off[3].toUpperCase(),
      arrivalAirport: off[4].toUpperCase(),
      tailNumber: off[5].toUpperCase(),
      outTime: formatHhMm(off[6]),
      offTime: formatHhMm(off[7]),
      raw: off[0],
    };
  }

  const on = text.match(
    /ONRP\s+(\d+)\/(\d+)\s+([A-Z0-9]+)\/([A-Z0-9]+)\s+\.([A-Z0-9-]+)\s+\/ON\s+(\d+)/i
  );
  if (on) {
    return {
      type: "on",
      flightId: flightIdFromAcars(on[1]),
      departureStation: on[3].toUpperCase(),
      arrivalAirport: on[4].toUpperCase(),
      tailNumber: on[5].toUpperCase(),
      onTime: formatHhMm(on[6]),
      raw: on[0],
    };
  }

  return null;
}

function toAbsolute(href) {
  if (!href) return null;
  try {
    return new URL(href, `${OPCENTER_ORIGIN}/${OPCENTER_TENANT}/`).toString();
  } catch {
    return null;
  }
}

function extractLabel($, label) {
  let found = null;
  const re = new RegExp(`${label}\\s*:?\\s*(\\S+)`, "i");
  $("td, th, span, div, label, dt, strong, b, li").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    const m = text.match(re);
    if (m) found = m[1];
  });
  return found;
}

function parseMessageHtml(html, href) {
  const $ = cheerio.load(html);
  const pageText = $.text().replace(/\s+/g, " ");
  const chunk =
    pageText.match(/OFFRP[\s\S]{0,140}/i)?.[0] ||
    pageText.match(/ONRP[\s\S]{0,140}/i)?.[0] ||
    "";
  const fromFree = parseFreetextEvent(chunk || pageText);
  if (fromFree) {
    return { id: href || fromFree.raw, ...fromFree, freetext: chunk };
  }

  const isOff = /Off Event|OFFRP|OPC_A80_OFFRP/i.test(pageText);
  const isOn = /On Event|ONRP|OPC_A80_ONRP/i.test(pageText);
  if (!isOff && !isOn) return null;

  const tail =
    extractLabel($, "Tail Number") ||
    pageText.match(/SX-[A-Z0-9]{3}/i)?.[0] ||
    "";
  const flight =
    extractLabel($, "Flight ID") || pageText.match(/\bA3\d{3,4}\b/)?.[0] || "—";
  const dep =
    extractLabel($, "Departure Station") ||
    extractLabel($, "Departure") ||
    "—";
  const arr =
    extractLabel($, "Arrival Airport") || extractLabel($, "Arrival") || "—";
  const out = extractLabel($, "OUT");
  const on = extractLabel($, "ON");

  return {
    id: href || `${flight}-${tail}-${isOff ? "off" : "on"}`,
    type: isOff ? "off" : "on",
    flightId: flight,
    departureStation: dep,
    arrivalAirport: arr,
    tailNumber: String(tail).toUpperCase(),
    outTime: out ? formatHhMm(out) : undefined,
    onTime: on ? formatHhMm(on) : undefined,
    freetext: chunk,
  };
}

function collectMessageLinks(inboxHtml, tailFilter) {
  const $ = cheerio.load(inboxHtml);
  const links = new Set();
  const tailRe = new RegExp(
    String(tailFilter).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "i"
  );

  $("tr").each((_, el) => {
    const rowText = $(el).text().replace(/\s+/g, " ");
    if (!tailRe.test(rowText)) return;
    if (!/A80|Off Event|On Event|In Event|OFFRP|ONRP/i.test(rowText)) return;
    $(el)
      .find("a[href]")
      .each((__, a) => {
        const url = toAbsolute($(a).attr("href"));
        if (url) links.add(url);
      });
  });

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    const ctx = $(el).closest("tr").text().replace(/\s+/g, " ");
    const url = toAbsolute(href);
    if (!url) return;
    if (!tailRe.test(ctx) && !tailRe.test(url)) return;
    if (/messenger|message|inbox|detail|view/i.test(url)) links.add(url);
  });

  return Array.from(links).slice(0, 25);
}

function pairIntoLines(events, tailFilter) {
  const byFlight = new Map();
  for (const ev of events) {
    if (!ev?.tailNumber) continue;
    if (ev.tailNumber.toUpperCase() !== String(tailFilter).toUpperCase()) {
      continue;
    }
    const key = `${ev.tailNumber}|${ev.flightId}`;
    const current = byFlight.get(key) || {
      id: key,
      tailNumber: ev.tailNumber,
      flightId: ev.flightId || "—",
      departureStation: ev.departureStation || "—",
      outTime: "—",
      arrivalAirport: ev.arrivalAirport || "—",
      onTime: "—",
    };
    if (ev.departureStation && ev.departureStation !== "—") {
      current.departureStation = ev.departureStation;
    }
    if (ev.arrivalAirport && ev.arrivalAirport !== "—") {
      current.arrivalAirport = ev.arrivalAirport;
    }
    if (ev.type === "off" && ev.outTime) current.outTime = ev.outTime;
    if (ev.type === "on" && ev.onTime) current.onTime = ev.onTime;
    byFlight.set(key, current);
  }
  return Array.from(byFlight.values());
}

async function loginOpCenter(username, password) {
  const jar = new CookieJar();
  const start = `${OPCENTER_ORIGIN}/${OPCENTER_TENANT}/authentication/login?`;
  const first = await followRedirects(jar, start);

  const $ = cheerio.load(first.text);
  const state =
    $('input[name="state"]').val() ||
    new URL(first.url).searchParams.get("state");

  if (!state) {
    if (
      /opcenter\.arinc\.eu/i.test(first.url) &&
      !/login|auth0/i.test(first.url)
    ) {
      return jar;
    }
    throw new Error("Could not start OpCenter Auth0 login (missing state).");
  }

  const postUrl = /\/u\/login/i.test(first.url)
    ? first.url
    : `${AUTH0_ORIGIN}/u/login?state=${encodeURIComponent(state)}`;

  const body = new URLSearchParams({
    state: String(state),
    username: String(username),
    password: String(password),
  });

  let response = await http(jar, postUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: AUTH0_ORIGIN,
      Referer: postUrl,
    },
    body: body.toString(),
  });

  let url = postUrl;
  let finalText = "";
  for (let i = 0; i < 14; i++) {
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) break;
      url = new URL(location, url).toString();
      response = await http(jar, url, { method: "GET" });
      continue;
    }
    finalText = await response.text();
    break;
  }

  if (
    /wrong email or password|wrong email or username|invalid.*password/i.test(
      finalText
    )
  ) {
    throw new Error("OpCenter login failed: check username/password.");
  }

  if (
    /mfa|one-time password|otp|verify your identity|guardian/i.test(finalText)
  ) {
    throw new Error(
      "OpCenter login requires MFA, which automated polling cannot complete."
    );
  }

  if (!/opcenter\.arinc\.eu/i.test(url)) {
    const home = await followRedirects(
      jar,
      `${OPCENTER_ORIGIN}/${OPCENTER_TENANT}/`
    );
    url = home.url;
  }

  const probe = await followRedirects(
    jar,
    `${OPCENTER_ORIGIN}/${OPCENTER_TENANT}/messenger/`
  );
  if (/\/authentication\/login|\/u\/login|auth0\.com/i.test(probe.url)) {
    throw new Error(
      "OpCenter login did not establish a session (SSO/MFA may be required)."
    );
  }

  return jar;
}

async function fetchMovementsForJar(jar, tailNumber = DEFAULT_TAIL) {
  const candidates = [
    `${OPCENTER_ORIGIN}/${OPCENTER_TENANT}/messenger/`,
    `${OPCENTER_ORIGIN}/${OPCENTER_TENANT}/messenger`,
    `${OPCENTER_ORIGIN}/${OPCENTER_TENANT}/messages/`,
    `${OPCENTER_ORIGIN}/${OPCENTER_TENANT}/`,
  ];

  let inboxHtml = "";
  let inboxUrl = "";

  for (const candidate of candidates) {
    const page = await followRedirects(jar, candidate);
    if (/\/authentication\/login|\/u\/login|auth0\.com/i.test(page.url)) {
      throw new Error("OpCenter session expired. Please sign in again.");
    }
    inboxHtml = page.text;
    inboxUrl = page.url;
    if (/A80|Tail|OFFRP|ONRP|In Event|messenger|inbox/i.test(page.text)) {
      break;
    }
  }

  if (!inboxHtml) {
    throw new Error("Could not load OpCenter messenger inbox HTML.");
  }

  const links = collectMessageLinks(inboxHtml, tailNumber);
  const events = [];

  const embedded =
    inboxHtml.match(/OFFRP[\s\S]{0,120}|ONRP[\s\S]{0,120}/gi) || [];
  for (const chunk of embedded) {
    const parsed = parseFreetextEvent(chunk);
    if (parsed) events.push({ id: parsed.raw, ...parsed });
  }

  for (const link of links) {
    try {
      const detail = await followRedirects(jar, link);
      if (/\/authentication\/login|auth0\.com/i.test(detail.url)) continue;
      const parsed = parseMessageHtml(detail.text, link);
      if (parsed) events.push(parsed);
    } catch {
      // ignore single-message failures
    }
  }

  if (events.length === 0) {
    const $ = cheerio.load(inboxHtml);
    $("tr").each((_, el) => {
      const text = $(el).text().replace(/\s+/g, " ").trim();
      if (!new RegExp(tailNumber, "i").test(text)) return;
      const flight = text.match(/\bA3\d{3,4}\b/)?.[0] || "—";
      const airports = text.match(/\b[A-Z]{4}\b/g) || [];
      events.push({
        id: `${flight}-row-${events.length}`,
        type: /on event|onrp/i.test(text) ? "on" : "off",
        flightId: flight,
        tailNumber: String(tailNumber).toUpperCase(),
        departureStation: airports[0] || "—",
        arrivalAirport: airports[1] || "—",
        outTime: "—",
        onTime: "—",
      });
    });
  }

  return {
    lines: pairIntoLines(events, tailNumber),
    meta: {
      inboxUrl,
      messageLinks: links.length,
      eventsParsed: events.length,
      fetchedAt: new Date().toISOString(),
    },
  };
}

async function loginAndStore(uid, username, password) {
  const jar = await loginOpCenter(username, password);
  await saveSession(uid, jar);
  return jar;
}

module.exports = {
  DEFAULT_TAIL,
  requireAuth,
  loginAndStore,
  loadSessionJar,
  clearSession,
  saveSession,
  fetchMovementsForJar,
};
