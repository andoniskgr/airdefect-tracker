import { DefectRecord } from "@/components/defect-records/DefectRecord.types";
import { emailService, EMAIL_CONFIG } from "./emailService";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getNotifyEmails(): string[] {
  const raw = import.meta.env.VITE_DEFECT_NOTIFY_EMAILS || "";
  if (!raw.trim()) return [];
  return [
    ...new Set(
      raw
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean)
    ),
  ];
}

function buildEmailBody(
  record: DefectRecord,
  recordId: string,
  action: "created" | "updated"
): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = origin ? `${origin}/` : "";
  const verb = action === "created" ? "New defect record" : "Defect record updated";
  const reg = escapeHtml(record.registration || "—");
  const station = escapeHtml(record.station || "—");
  const defect = escapeHtml((record.defect || "").slice(0, 500));
  const remarks = escapeHtml((record.remarks || "").slice(0, 300));
  const by = escapeHtml(record.updatedBy || record.createdBy || "—");
  const when = escapeHtml(`${record.date} ${record.time}`);

  return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${verb}</h2>
        <p><strong>A/C:</strong> ${reg} &nbsp; <strong>Stand:</strong> ${station}</p>
        <p><strong>When:</strong> ${when}</p>
        <p><strong>By:</strong> ${by}</p>
        <p><strong>Record ID:</strong> ${escapeHtml(recordId)}</p>
        <div style="background-color: #f5f5f5; padding: 16px; border-radius: 6px; margin: 16px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Defect</strong></p>
          <p style="margin: 0; white-space: pre-wrap;">${defect || "—"}</p>
        </div>
        <div style="background-color: #f9f9f9; padding: 16px; border-radius: 6px; margin: 16px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Action / remarks</strong></p>
          <p style="margin: 0; white-space: pre-wrap;">${remarks || "—"}</p>
        </div>
        ${
          link
            ? `<p><a href="${escapeHtml(link)}" style="color: #007bff;">Open app</a></p>`
            : ""
        }
        <p style="color: #666; font-size: 12px;">MCC / defect tracker — configure VITE_DEFECT_NOTIFY_EMAILS to change recipients.</p>
      </div>
    `;
}

/**
 * Sends email alerts (e.g. to an address you read on your phone) when a defect is saved.
 * Requires EmailJS (same as signup emails) and VITE_DEFECT_NOTIFY_EMAILS (comma-separated).
 * Runs best-effort: failures are swallowed so saving a record is never blocked.
 */
export function notifyDefectRecordChange(
  record: DefectRecord,
  recordId: string,
  action: "created" | "updated"
): void {
  const recipients = getNotifyEmails();
  if (!recipients.length) return;
  if (!EMAIL_CONFIG.SERVICE_ID || !EMAIL_CONFIG.PUBLIC_KEY) return;

  const reg = record.registration || recordId;
  const subject =
    action === "created"
      ? `New defect — ${reg}`
      : `Defect updated — ${reg}`;
  const html = buildEmailBody(record, recordId, action);

  void (async () => {
    for (const to of recipients) {
      try {
        await emailService.sendEmail({ to, subject, html });
      } catch {
        // ignore — do not affect save flow
      }
    }
  })();
}
