import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createServer } from "node:http";
import {
  findConfiguredChains,
  follow,
  parseCaddyRedirects,
  parseRobots,
  robotsAllows,
} from "./audit-redirects.mjs";

let server;
let origin;

before(async () => {
  server = createServer((request, response) => {
    if (request.url === "/old") {
      response.writeHead(301, { location: "/new" }).end();
    } else if (request.url === "/new") {
      response.writeHead(200, { "content-type": "text/plain" }).end("ok");
    } else if (request.url === "/loop") {
      response.writeHead(302, { location: "/loop" }).end();
    } else {
      response.writeHead(404).end("missing");
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});

after(async () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));

test("parses Caddy redirects and reports configured chains", () => {
  const redirects = parseCaddyRedirects("redir /a /b permanent\nredir /b /c permanent\n");
  assert.equal(redirects.length, 2);
  assert.ok(findConfiguredChains(redirects).some(({ code }) => code === "configured_redirect_chain"));
});

test("applies longest robots.txt rule with Allow winning ties", () => {
  const groups = parseRobots("User-agent: *\nDisallow: /private\nAllow: /private/public\n");
  assert.equal(robotsAllows(groups, "Googlebot", "/private/file"), false);
  assert.equal(robotsAllows(groups, "Googlebot", "/private/public/page"), true);
});

test("captures redirect hops and loops without auto-following", async () => {
  const result = await follow(`${origin}/old`, "audit", { maxHops: 5, timeoutMs: 1_000 });
  assert.deepEqual(result.hops.map(({ status }) => status), [301, 200]);
  assert.equal(result.hops.at(-1).url, `${origin}/new`);

  const loop = await follow(`${origin}/loop`, "audit", { maxHops: 5, timeoutMs: 1_000 });
  assert.equal(loop.loop, `${origin}/loop`);
});
