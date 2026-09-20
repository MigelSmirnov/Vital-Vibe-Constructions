#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const DEFAULT_ORIGIN = "https://vitalvibeconstruction.com";
const DEFAULT_CADDYFILE = "deploy/vps/Caddyfile";
const DEFAULT_OUTPUT = "artifacts/redirect-audit/latest.json";
const DEFAULT_USER_AGENTS = [
  "Mozilla/5.0 (compatible; VitalVibeRedirectAudit/1.0)",
  "Googlebot/2.1 (+http://www.google.com/bot.html)",
  "OAI-SearchBot/1.0; +https://openai.com/searchbot",
];

function parseArgs(argv) {
  const options = {
    origin: DEFAULT_ORIGIN,
    caddyfile: DEFAULT_CADDYFILE,
    output: DEFAULT_OUTPUT,
    maxHops: 10,
    timeoutMs: 20_000,
    userAgents: [...DEFAULT_USER_AGENTS],
  };
  let customUserAgents = false;

  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (flag === "--origin" && value) options.origin = value;
    else if (flag === "--caddyfile" && value) options.caddyfile = value;
    else if (flag === "--output" && value) options.output = value;
    else if (flag === "--max-hops" && value) options.maxHops = Number(value);
    else if (flag === "--timeout-ms" && value) options.timeoutMs = Number(value);
    else if (flag === "--user-agent" && value) {
      if (!customUserAgents) options.userAgents = [];
      customUserAgents = true;
      options.userAgents.push(value);
    } else if (flag === "--help") options.help = true;
    else if (flag.startsWith("--")) throw new Error(`Unknown or incomplete option: ${flag}`);
    else continue;

    if (flag !== "--help") index += 1;
  }

  if (!Number.isInteger(options.maxHops) || options.maxHops < 1 || options.maxHops > 20) {
    throw new Error("--max-hops must be an integer from 1 to 20.");
  }
  if (!Number.isInteger(options.timeoutMs) || options.timeoutMs < 100 || options.timeoutMs > 120_000) {
    throw new Error("--timeout-ms must be an integer from 100 to 120000.");
  }
  options.origin = new URL(options.origin).origin;
  return options;
}

function parseCaddyRedirects(source) {
  const redirects = [];
  for (const [zeroBasedLine, line] of source.split(/\r?\n/).entries()) {
    const match = line.match(/^\s*redir\s+(\S+)\s+(\S+)(?:\s+(\S+))?\s*$/);
    if (!match || match[1].startsWith("#")) continue;
    const [, from, to, mode = "temporary"] = match;
    if (!from.startsWith("/") || !to.startsWith("/")) continue;
    redirects.push({ from, to, mode, line: zeroBasedLine + 1 });
  }
  return redirects;
}

function findConfiguredChains(redirects) {
  const bySource = new Map(redirects.map((redirect) => [redirect.from, redirect]));
  const findings = [];
  for (const redirect of redirects) {
    const seen = new Set([redirect.from]);
    const chain = [redirect.from, redirect.to];
    let cursor = redirect.to;
    while (bySource.has(cursor)) {
      if (seen.has(cursor)) {
        findings.push({ severity: "error", code: "configured_redirect_loop", chain });
        break;
      }
      seen.add(cursor);
      cursor = bySource.get(cursor).to;
      chain.push(cursor);
    }
    if (chain.length > 2) findings.push({ severity: "error", code: "configured_redirect_chain", chain });
  }
  return findings;
}

function compileRobotsPattern(value) {
  const escaped = value
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  return new RegExp(`^${escaped}`);
}

function parseRobots(source) {
  const groups = [];
  let agents = [];
  let rules = [];
  const flush = () => {
    if (agents.length) groups.push({ agents, rules });
    agents = [];
    rules = [];
  };

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    if (field === "user-agent") {
      if (rules.length) flush();
      agents.push(value.toLowerCase());
    } else if ((field === "allow" || field === "disallow") && agents.length && value) {
      rules.push({ type: field, value, pattern: compileRobotsPattern(value) });
    }
  }
  flush();
  return groups;
}

function robotsAllows(groups, userAgent, pathname) {
  const normalizedAgent = userAgent.toLowerCase();
  const matching = groups.filter((group) => group.agents.some((agent) => agent === "*" || normalizedAgent.includes(agent)));
  const specific = matching.filter((group) => group.agents.some((agent) => agent !== "*" && normalizedAgent.includes(agent)));
  const active = specific.length ? specific : matching;
  const rules = active.flatMap((group) => group.rules).filter((rule) => rule.pattern.test(pathname));
  if (!rules.length) return true;
  rules.sort((a, b) => b.value.length - a.value.length || (a.type === "allow" ? -1 : 1));
  return rules[0].type === "allow";
}

async function fetchOnce(url, userAgent, timeoutMs) {
  const response = await fetch(url, {
    redirect: "manual",
    headers: { "user-agent": userAgent, accept: "text/html,application/xhtml+xml,*/*;q=0.8" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  const location = response.headers.get("location");
  const body = response.status >= 300 && response.status < 400 ? "" : await response.text();
  return {
    url,
    status: response.status,
    location: location ? new URL(location, url).href : null,
    bodyBytes: Buffer.byteLength(body),
    bodySha256: body ? createHash("sha256").update(body).digest("hex") : null,
    body,
  };
}

async function follow(url, userAgent, { maxHops, timeoutMs }) {
  const hops = [];
  const seen = new Set();
  let current = url;

  for (let count = 0; count <= maxHops; count += 1) {
    if (seen.has(current)) return { hops, loop: current, exceeded: false };
    seen.add(current);
    const response = await fetchOnce(current, userAgent, timeoutMs);
    const { body, ...publicResponse } = response;
    hops.push(publicResponse);
    if (response.status < 300 || response.status >= 400 || !response.location) {
      return { hops, loop: null, exceeded: false, finalBody: body };
    }
    current = response.location;
  }
  return { hops, loop: null, exceeded: true };
}

async function safeFollow(url, userAgent, options) {
  try {
    return await follow(url, userAgent, options);
  } catch (error) {
    return { hops: [], loop: null, exceeded: false, error: error.message || String(error) };
  }
}

async function mapWithConcurrency(values, concurrency, mapper) {
  const results = new Array(values.length);
  let cursor = 0;
  async function worker() {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(values[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, worker));
  return results;
}

function redirectSignature(result) {
  return result.hops.map(({ status, location }) => ({ status, location }));
}

function xmlLocations(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((match) => match[1]);
}

function addFinding(findings, severity, code, detail) {
  findings.push({ severity, code, ...detail });
}

async function audit(options) {
  const caddy = await readFile(options.caddyfile, "utf8");
  const redirects = parseCaddyRedirects(caddy);
  const findings = findConfiguredChains(redirects);
  let robotsResponse;
  try {
    robotsResponse = await fetchOnce(`${options.origin}/robots.txt`, options.userAgents[0], options.timeoutMs);
  } catch (error) {
    addFinding(findings, "error", "robots_fetch_failed", { error: error.message || String(error) });
  }
  if (robotsResponse && robotsResponse.status !== 200) {
    addFinding(findings, "error", "robots_unavailable", { status: robotsResponse.status });
  }
  const robotsGroups = robotsResponse?.status === 200 ? parseRobots(robotsResponse.body) : [];
  const results = [];

  for (const redirect of redirects) {
    const expected = new URL(redirect.to, options.origin).href;
    const variants = await Promise.all(options.userAgents.map(async (userAgent) => {
      const run = await safeFollow(new URL(redirect.from, options.origin).href, userAgent, options);
      if (run.error) {
        addFinding(findings, "error", "redirect_fetch_failed", { from: redirect.from, userAgent, error: run.error });
        return { userAgent, ...run };
      }
      const final = run.hops.at(-1);
      const redirectHops = run.hops.filter((hop) => hop.status >= 300 && hop.status < 400);
      if (run.loop) addFinding(findings, "error", "live_redirect_loop", { from: redirect.from, userAgent, loop: run.loop });
      if (run.exceeded) addFinding(findings, "error", "redirect_hop_limit", { from: redirect.from, userAgent });
      if (![301, 308].includes(run.hops[0]?.status)) {
        addFinding(findings, "error", "source_not_permanent_redirect", { from: redirect.from, userAgent, status: run.hops[0]?.status });
      }
      if (redirectHops.length > 1) {
        addFinding(findings, "warning", "live_redirect_chain", { from: redirect.from, userAgent, hops: redirectHops.length });
      }
      if (final?.url !== expected || final?.status !== 200) {
        addFinding(findings, "error", "unexpected_redirect_target", { from: redirect.from, userAgent, expected, actual: final?.url, status: final?.status });
      }
      for (const hop of run.hops) {
        const hopUrl = new URL(hop.url);
        if (hopUrl.origin === options.origin && !robotsAllows(robotsGroups, userAgent, hopUrl.pathname)) {
          addFinding(findings, "error", "redirect_hop_blocked_by_robots", { from: redirect.from, userAgent, url: hop.url });
        }
      }
      return { userAgent, ...run, finalBody: undefined };
    }));
    const baseline = JSON.stringify(redirectSignature(variants[0]));
    const baselineBodyHash = variants[0].hops.at(-1)?.bodySha256;
    for (const variant of variants.slice(1)) {
      if (JSON.stringify(redirectSignature(variant)) !== baseline) {
        addFinding(findings, "error", "user_agent_redirect_mismatch", { from: redirect.from, userAgent: variant.userAgent });
      } else if (baselineBodyHash && variant.hops.at(-1)?.bodySha256 !== baselineBodyHash) {
        addFinding(findings, "warning", "user_agent_body_mismatch", { from: redirect.from, userAgent: variant.userAgent });
      }
    }
    results.push({ redirect, expected, variants });
  }

  const missingPath = `/__redirect-audit-not-found-${Date.now().toString(36)}`;
  const missing = await safeFollow(new URL(missingPath, options.origin).href, options.userAgents[0], options);
  if (missing.error) {
    addFinding(findings, "error", "not_found_probe_failed", { path: missingPath, error: missing.error });
  } else if (missing.hops.length !== 1 || missing.hops[0]?.status !== 404) {
    addFinding(findings, "error", "invalid_not_found_response", { path: missingPath, hops: redirectSignature(missing) });
  }

  const sitemapFetch = await safeFollow(`${options.origin}/sitemap.xml`, options.userAgents[0], options);
  const sitemapFinal = sitemapFetch.hops.at(-1);
  const sitemapUrls = sitemapFinal?.status === 200 ? xmlLocations(sitemapFetch.finalBody ?? "") : [];
  if (sitemapFetch.error) addFinding(findings, "error", "sitemap_fetch_failed", { error: sitemapFetch.error });
  else if (!sitemapUrls.length) addFinding(findings, "error", "sitemap_unavailable_or_empty", { status: sitemapFinal?.status });
  const sitemapResults = await mapWithConcurrency(sitemapUrls, 5, async (url) => {
    const run = await safeFollow(url, options.userAgents[0], options);
    const final = run.hops.at(-1);
    if (run.error) {
      addFinding(findings, "error", "sitemap_url_fetch_failed", { url, error: run.error });
    } else if (run.hops.length !== 1 || final?.status !== 200 || final.url !== url) {
      addFinding(findings, "error", "sitemap_url_not_direct_200", { url, hops: redirectSignature(run), finalUrl: final?.url });
    }
    return { url, hops: redirectSignature(run), finalUrl: final?.url, error: run.error };
  });

  const report = {
    generatedAt: new Date().toISOString(),
    origin: options.origin,
    summary: {
      configuredRedirects: redirects.length,
      sitemapUrls: sitemapUrls.length,
      errors: findings.filter(({ severity }) => severity === "error").length,
      warnings: findings.filter(({ severity }) => severity === "warning").length,
    },
    findings,
    redirects: results,
    notFoundProbe: { path: missingPath, hops: redirectSignature(missing) },
    sitemap: sitemapResults,
  };
  return report;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log("Usage: node tools/seo/audit-redirects.mjs [--origin URL] [--caddyfile PATH] [--output PATH] [--max-hops N] [--timeout-ms N]");
    return;
  }
  const report = await audit(options);
  await mkdir(path.dirname(options.output), { recursive: true });
  await writeFile(options.output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Redirect audit: ${report.summary.configuredRedirects} redirects, ${report.summary.sitemapUrls} sitemap URLs, ${report.summary.errors} errors, ${report.summary.warnings} warnings.`);
  if (report.summary.errors) process.exitCode = 1;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) main().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exitCode = 1;
});

export { audit, findConfiguredChains, follow, parseCaddyRedirects, parseRobots, robotsAllows };
