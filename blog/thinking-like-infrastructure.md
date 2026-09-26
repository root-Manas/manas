---
title: "Infrastructure Patterns and Recon: How Systems Betray Themselves"
description: "A technical method for turning DNS, certificate logs, code, and client-side clues into testable infrastructure hypotheses without confusing correlation with ownership."
pubDate: "February 11 2026"
updated: "2026-09-26"
image: "/public/figures/recon-og.png"
tags: "recon, infrastructure, methodology"
---

Reconnaissance is often described as collecting names and IP addresses. The difficult part comes afterward: deciding what the observations mean. An unfamiliar hostname can be a production service, an abandoned alias, a vendor tenant, or a historical artifact. A certificate can reveal a name without proving that a service is still deployed. A shared IP can connect unrelated customers. Good recon therefore looks less like a list and more like an **evidence graph**.

This method is for systems within an authorized scope. The examples use fictional `acme.example` names and synthetic observations. Passive clues can guide a review; they do not expand the permission granted by a program or asset owner.

![Fictional infrastructure evidence graph linking DNS, CT, repositories, and client code](/public/figures/recon-graph.svg)

## Model observations, entities, and hypotheses separately

An observation is a recorded fact with a source and time: “`status.acme.example` had a CNAME to a vendor host at 10:20 UTC.” An entity is the thing a fact may describe: a domain, certificate, account, cloud resource, repository, or application. A hypothesis is an interpretation: “this hostname is probably a public status service controlled by Acme.”

The distinction matters because the same observation supports more than one hypothesis. A CNAME can indicate active delegation, but a dangling record can outlive the service. A certificate SAN may contain a staging name even if the staging service no longer resolves. Keep the edge in the graph labelled **observed**, **inferred**, or **verified**.

| Evidence | What it establishes | What it does not establish |
| --- | --- | --- |
| DNS A/AAAA answer | A resolver returned an address at a time | Exclusive ownership of that address |
| CNAME to a vendor | A name delegates resolution toward a vendor | That the vendor account is live or claimable |
| Certificate SAN | A certificate was issued for the name | A reachable application exists now |
| Repository config | A committed file contains a hostname | The deployed system still uses that file |
| Client JavaScript URL | A bundle references an origin or route | The server accepts the route or trusts the caller |

This is consistent with [OWASP’s attack-surface guidance](https://wstg.owasp.org/latest/4-Web_Application_Security_Testing/01-Information_Gathering/04-Attack_Surface_Identification/), which treats domains, virtual hosts, exposed services, certificates, and non-obvious application paths as distinct pieces of the map.

## DNS is topology with caveats

DNS provides a distributed naming system, not an asset inventory. An authoritative zone can contain A, AAAA, CNAME, MX, TXT, and other records with different operational roles; a recursive resolver can return a cached answer subject to TTL. [RFC 1034](https://www.rfc-editor.org/rfc/rfc1034) explains the domain tree and authoritative zones. A record’s presence is evidence of naming intent, while its target and current response are evidence about routing at the time of observation.

For `api.acme.example`, collect the exact queried name, record type, answer, resolver, TTL, and timestamp. Follow a CNAME chain rather than treating the first alias as an IP. Record both A and AAAA; a service may behave differently over IPv6. Compare authoritative answers with recursive answers when a discrepancy matters. Do not treat the apparent country or provider of an anycast or CDN IP as the application’s origin location.

Cloud-specific aliases complicate the picture. Amazon Route 53 alias records can route to AWS resources and appear to an external DNS client as ordinary records of the selected type; the alias property is visible through Route 53 configuration rather than a generic DNS answer. [AWS Route 53 documentation](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-choosing-alias-non-alias.html) describes the distinction. This is one reason to mark provider attribution as a hypothesis unless corroborated by owner-controlled records or configuration.

## Certificate transparency is a history of issuance

Certificate Transparency (CT) logs are publicly auditable, append-only records of certificate issuance. They are useful for discovering names in certificate Subject Alternative Name (SAN) entries and for constructing a timeline of certificate activity. [RFC 6962](https://www.rfc-editor.org/rfc/rfc6962) describes the Merkle-tree design and the distinction between a signed promise to log and later inclusion proof.

For each candidate name, record the certificate’s validity interval, issuer, SAN list, log timestamp, and whether the name currently resolves. Watch for wildcard names: `*.acme.example` says much less about the existence of any one host than a specific SAN does. Duplicate certificates and renewal automation can also make a name appear important simply because it appears often. CT can support a discovery hypothesis; it does not prove that a server was exposed, reachable, or in scope.

## Repositories and client bundles reveal dependency shapes

Public code and documentation can reveal deployment assumptions: environment-variable names, status endpoints, CDN paths, service identifiers, or configuration templates. Search for exact domains, package names, and vendor-specific patterns, then inspect commit age and repository ownership. A fork or archived example is a weaker clue than a current repository controlled by the target. [GitHub’s code navigation guidance](https://docs.github.com/en/repositories/working-with-files/using-files/navigating-code-on-github) describes how to follow symbols and references instead of relying on a single string match.

Client-side JavaScript is another dependency map. A bundle may contain an API base URL, a GraphQL operation name, or a feature flag. Treat these as **references**, not authorization. The application may have dead code, environment-specific branches, or server-side access checks. The safe next step is to document the candidate and confirm its scope before making active requests.

## Turn clues into a testable architecture sketch

Suppose a fictional organization has these observations:

1. DNS returns `app.acme.example` as a CNAME to a CDN hostname.
2. A CT log shows `api.acme.example` in a recent SAN entry.
3. A public repository contains `PUBLIC_API_BASE=https://api.acme.example` in an example deployment file.
4. The current application bundle requests `/v2/session` from that API origin.

Together they support a stronger hypothesis that an API sits behind the application than any clue alone. They still do not prove who owns the origin, whether the endpoint is in scope, or whether `/v2/session` accepts any particular method. A useful graph keeps the timestamps and provenance attached to each edge, then identifies what owner confirmation or permitted observation would resolve the remaining uncertainty.

<div class="simulation" data-sim="recon"><h3>Evidence-weighting exercise</h3><p>Select fictional clues and see how a provisional confidence score changes. This is a teaching heuristic, not a probability or authorization decision.</p><div class="sim-ui">Interactive exercise loading…</div></div>

## A repeatable workflow

**1. Anchor scope.** Record the exact domains, programs, accounts, and exclusions supplied by the owner. A discovered neighbor is not automatically in scope.

**2. Collect passive observations.** Query permitted public DNS records and CT logs, inspect public owner-controlled documentation, and record timestamps, source URLs, and raw values. Avoid collapsing “seen in a log” into “currently live.”

**3. Normalize identities.** Keep hostnames, IPs, organizations, certificates, and vendor tenants as different node types. An IP may be shared; an organization name may be a string coincidence.

**4. Form explicit hypotheses.** Write “likely CDN front end because…” or “possible abandoned alias because…”. Attach a confidence level and a disconfirming test. Use evidence from independent sources where possible.

**5. Verify only within scope.** Any request that touches a service, account, or vendor endpoint should follow the program’s rules. Record what the active test actually observed, including error responses and timing, rather than converting an inference into a finding.

**6. Revisit the graph.** Infrastructure changes. TTLs expire, certificates renew, and deployment files become stale. A useful map has timestamps and can be updated without rewriting its history.

The goal is not maximum hostname count. It is a map that another researcher or owner can audit: what was observed, what was inferred, what remains uncertain, and which permitted action would make the next answer more reliable.

### Sources and further reading

- [OWASP WSTG, Attack Surface Identification](https://wstg.owasp.org/latest/4-Web_Application_Security_Testing/01-Information_Gathering/04-Attack_Surface_Identification/)
- [RFC 1034, Domain Concepts and Facilities](https://www.rfc-editor.org/rfc/rfc1034)
- [RFC 6962, Certificate Transparency](https://www.rfc-editor.org/rfc/rfc6962)
- [AWS Route 53, alias and CNAME records](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-choosing-alias-non-alias.html)
