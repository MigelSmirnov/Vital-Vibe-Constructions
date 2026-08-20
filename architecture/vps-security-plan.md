# VPS Security Plan

Status: required before production cutover
Updated: 2026-08-20
Branch: `agent/architecture-sandbox`

## Security model

The public site is a static artifact. Production does not require PHP, a Node application server, a database, a CMS, or a browser-accessible admin panel.

That substantially reduces application attack surface, but the VPS still has four material security boundaries:

1. operating system and SSH access;
2. Caddy and network exposure;
3. DNS / domain-account integrity;
4. denial-of-service protection and origin exposure.

Security must be layered. Hiding software versions, changing ports, or installing one blocking tool is not sufficient by itself.

## 1. No public application admin surface

Do not add a web admin panel for deployment or content management merely for convenience.

Content remains managed through the repository and reviewed generated artifacts.

Caddy has an administrative API for configuration reloads. It is not a browser admin UI. The repository Caddyfile explicitly binds it to:

```text
127.0.0.1:2019
```

Port `2019` must never be opened in the VPS firewall or provider firewall.

## 2. SSH hardening

Preferred production access model:

- non-root administrative user;
- SSH public-key authentication only;
- `PasswordAuthentication no`;
- `PermitRootLogin no`;
- no private SSH keys stored in the repository or deployment artifact;
- separate deploy credentials from human administration where practical;
- keep provider console / rescue access available as break-glass recovery.

Preferred network model is to make SSH non-public using Tailscale, WireGuard, or a trusted VPN/management network.

If SSH must remain publicly reachable:

- restrict it by source IP where operationally possible;
- use keys only;
- rate-limit connection attempts;
- Fail2ban may be used as a secondary control, not as the primary authentication control.

Changing the SSH port can reduce log noise but is not considered a meaningful security boundary.

## 3. Firewall

Use both the VPS provider firewall, when available, and the host firewall.

Direct-origin baseline:

- allow `80/tcp` only when required for HTTP/ACME and redirect behavior;
- allow `443/tcp` for HTTPS;
- allow SSH only from the approved management path;
- deny all other unsolicited inbound traffic;
- do not expose Caddy admin port `2019`.

If Cloudflare Tunnel is selected, the preferred final state is no public inbound web ports at all; the tunnel makes outbound connections to Cloudflare and Caddy can listen only on loopback/private interfaces.

## 4. OS maintenance

Use a supported LTS Linux release.

For Ubuntu/Debian-class systems:

- enable automatic security updates (`unattended-upgrades` or equivalent);
- regularly review whether a reboot is required;
- remove unused packages and services;
- do not install a general hosting control panel unless a real operational requirement appears;
- monitor disk usage so logs or artifacts cannot fill the filesystem.

The web server process should not run as root after binding/initialization, and should not own release content.

## 5. Release filesystem permissions

Keep releases immutable after activation.

Recommended ownership model:

```text
/srv/vital-vibe/releases/<release-id>   deploy:vvc   directories 0755, files 0644
/srv/vital-vibe/current                 managed by deploy user
Caddy service user                      read-only access to site files
```

Caddy should not have write permission to the deployed HTML/image release tree.

This limits persistence if the serving process is ever compromised.

## 6. Server banners and fingerprinting

The Caddy configuration removes the HTTP `Server` response header.

This reduces passive fingerprinting but is only hygiene. A determined scanner can often infer software families through behavior, TLS fingerprints, timing, or other details.

Do not rely on banner hiding as a security boundary.

If OpenSSH exposes distribution-specific version text, the distro banner may be reduced where supported, but patching and access controls remain the real protection.

## 7. HTTP security headers

Current baseline:

- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- `X-Frame-Options: DENY`;
- restrictive `Permissions-Policy` for camera, microphone and geolocation;
- `Server` response header removed.

Do not enable HSTS before the HTTPS cutover and rollback path are proven.

Do not enforce a Content Security Policy blindly. First inventory any inline structured-data scripts, external fonts, external applications, and future analytics. Start with a tested/report-only policy if CSP is introduced, then enforce it only after the site renders and structured data remains correct.

## 8. DDoS and "site knock-down" risk

A web server firewall cannot stop a volumetric attack that saturates the VPS/provider network before traffic reaches Caddy.

Production must therefore use at least one upstream DDoS layer:

- VPS provider network DDoS protection; and/or
- a reverse proxy/CDN such as Cloudflare.

Preferred high-protection architecture, if operationally acceptable:

```text
Internet
  -> Cloudflare edge (proxied DNS, DDoS/WAF/cache)
  -> protected origin path
  -> Caddy
  -> static release
```

Stronger origin-hiding option:

```text
Internet
  -> Cloudflare edge
  -> Cloudflare Tunnel
  -> loopback/private Caddy listener
  -> static release
```

Cloudflare Tunnel avoids publishing the web origin as a directly reachable HTTP endpoint. If used together with private/VPN SSH, the VPS can have no intentionally public service port.

Do not publish the new VPS IP in temporary DNS records, test subdomains, mail records, public documentation, or repository files if origin hiding is a goal.

If using proxied DNS rather than Tunnel, restrict origin HTTP(S) to the proxy's documented source networks once certificate and operational behavior are validated.

## 9. DNS and registrar security

Domain compromise can bypass every VPS control.

Before cutover:

- enable strong MFA on registrar and DNS-provider accounts;
- use unique credentials;
- enable registrar/domain transfer lock;
- review account recovery email/phone;
- enable DNSSEC when supported and operationally understood;
- export or record the complete pre-cutover DNS zone;
- do not expose provider API tokens in GitHub variables, files, chat transcripts, or shell history unnecessarily.

Use least-privilege scoped DNS tokens if automated DNS changes are added later.

## 10. GitHub and CI security

Current `VPS bundle check` is intentionally read-only and has no server credentials.

Before automatic deployment is introduced:

- keep deployment restricted to protected/default branch releases;
- require successful project and bundle checks;
- use a dedicated deploy credential with minimum server privileges;
- never permit pull-request code from untrusted branches to access production secrets;
- pin or periodically review third-party Actions used in deployment;
- keep deployment artifacts tied to `DEPLOYMENT_COMMIT` and preserve checksums/digests.

The first production release should remain manual so the cutover and rollback procedures are proven before credentials are introduced to CI.

## 11. Logging and monitoring

Minimum production monitoring:

- Caddy service health;
- TLS/certificate state;
- disk utilization;
- system security updates/reboot requirement;
- SSH authentication failures if public SSH exists;
- uptime checks for homepage and one deep canonical route;
- unusual 4xx/5xx rates;
- DNS record changes where provider notifications support them.

Do not collect excessive visitor data solely for security. Logs should have a retention policy.

## 12. Backups and recovery

The website content itself is recoverable from Git and validated CI artifacts, so the important backup/recovery targets are:

- DNS zone state;
- Caddy/server configuration;
- deployment scripts;
- currently active and previous release identifiers;
- any future secrets/configuration not stored in Git.

Keep at least one previous known-good release on the VPS for immediate symlink rollback.

GitHub Pages remains a separate hosting-level rollback until the VPS has proven stable.

## 13. Controls intentionally not required today

Because production is a static site with no login/database/API, do not add complexity without a threat or operational reason:

- no database firewall rules because there is no production database;
- no `/admin` hiding tricks because there is no web admin;
- no CAPTCHA on pages without forms/login;
- no PHP/Node process manager;
- no hosting panel such as cPanel/Plesk;
- no WAF rule maze for nonexistent application endpoints.

If a contact form, customer portal, CMS, payment flow, or private API is introduced later, it gets a separate threat model before activation.

## Required pre-cutover security checklist

- [ ] supported VPS OS installed and patched
- [ ] non-root admin account works
- [ ] SSH keys work and password authentication is disabled
- [ ] root SSH login disabled
- [ ] provider and host firewall reviewed
- [ ] Caddy admin API confirmed loopback-only
- [ ] Caddy config validates successfully
- [ ] automatic security updates enabled
- [ ] release tree read-only to Caddy
- [ ] domain/DNS-provider MFA enabled
- [ ] current DNS zone exported
- [ ] DDoS/origin-protection mode explicitly chosen
- [ ] HTTPS tested before final DNS cutover when possible
- [ ] HSTS still disabled during first cutover
- [ ] rollback release and GitHub Pages fallback documented
- [ ] external uptime monitor configured after cutover

## Decision still required

Before final server configuration, choose one public-edge model:

1. **Provider-protected direct Caddy** — simplest, origin IP public.
2. **Cloudflare proxied DNS + restricted origin** — better DDoS/cache/WAF, origin should be filtered to proxy traffic where practical.
3. **Cloudflare Tunnel + private SSH** — smallest public attack surface; no intentionally public origin web/SSH port required.

For this static site, option 3 provides the strongest practical origin isolation if Cloudflare dependency is acceptable. Option 2 is a strong simpler compromise.
