import { readFile } from "node:fs/promises";
import path from "node:path";

const TABLES = {
  site: "content/tables/site.yaml",
  services: "content/tables/services.yaml",
  externalApps: "content/tables/external-apps.yaml",
  media: "content/tables/media.yaml",
};

export async function loadContentTables({ root = process.cwd() } = {}) {
  const [siteTable, servicesTable, appsTable, mediaTable] = await Promise.all([
    readJsonCompatibleTable(root, TABLES.site),
    readJsonCompatibleTable(root, TABLES.services),
    readJsonCompatibleTable(root, TABLES.externalApps),
    readJsonCompatibleTable(root, TABLES.media),
  ]);

  return {
    site: requireObject(siteTable.site, "site"),
    services: requireArray(servicesTable.services, "services"),
    externalApps: requireArray(appsTable.externalApps, "externalApps"),
    media: requireArray(mediaTable.media, "media"),
  };
}

async function readJsonCompatibleTable(root, relativePath) {
  const filePath = path.join(root, relativePath);

  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Failed to read JSON-compatible content table ${relativePath}: ${error.message}`);
  }
}

function requireObject(value, name) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Expected ${name} content table value to be an object.`);
  }

  return value;
}

function requireArray(value, name) {
  if (!Array.isArray(value)) {
    throw new Error(`Expected ${name} content table value to be an array.`);
  }

  return value;
}
