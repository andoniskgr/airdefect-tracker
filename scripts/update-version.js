#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get version type from command line argument
const versionType = process.argv[2] || "patch";

// Path to version.json
const versionPath = path.join(__dirname, "../src/version.json");

// Read current version
const versionData = JSON.parse(fs.readFileSync(versionPath, "utf8"));

// Parse version number
const [major, minor, patch] = versionData.version.split(".").map(Number);

let newVersion;

// Increment based on version type
switch (versionType) {
  case "major":
    newVersion = `${major + 1}.0.0`;
    break;
  case "minor":
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case "patch":
  default:
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

// Update version data
const updatedVersionData = {
  ...versionData,
  version: newVersion,
  lastUpdated: new Date().toISOString(),
};

// Write back to file
fs.writeFileSync(versionPath, JSON.stringify(updatedVersionData, null, 2));

console.log(
  `Version updated from ${versionData.version} to ${newVersion} (${versionType})`
);
console.log(`Updated at: ${updatedVersionData.lastUpdated}`);
