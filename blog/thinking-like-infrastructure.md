---
title: "Thinking Like Infrastructure: Recon That Actually Finds Stuff"
description: "Moving beyond subdomain enumeration to understand attack surface through the lens of how infrastructure is actually built and operated."
pubDate: "February 11 2026"
featured: true
---

Most recon writes itself once you understand how companies actually build infrastructure. The problem isn't tooling—it's that people enumerate without thinking. They run subfinder, get 500 subdomains, call it recon, and wonder why they're not finding anything interesting.

Real recon is about understanding organizational behavior. Companies don't randomly spin up servers. Every piece of infrastructure exists for a reason, follows patterns, and leaves traces that make sense once you understand the why behind the what.

## Start with Business Logic, Not Tools

Before touching a single tool, spend time understanding what the company actually does. A fintech handles money movement. A SaaS company has customer data and billing. An e-commerce platform manages inventory and payments. Each business model implies specific infrastructure requirements.

If you're looking at a company that does video processing, you know they need:
- Storage (S3 buckets, blob storage)
- Compute (processing clusters, worker queues)
- CDN (delivery infrastructure)
- APIs (upload endpoints, webhook callbacks)

This isn't guessing—it's basic operational necessity. Video doesn't process itself. Files don't store themselves. Every feature visible to users requires backend infrastructure, and that infrastructure has patterns.

## The Naming Convention Goldmine

Companies use predictable naming because humans need systems to stay sane. Once you find one asset, you've found the template.

Let's say you discover `api-prod-us-east-1.company.com`. Break it down:
- `api` - service type
- `prod` - environment 
- `us-east-1` - region

Now you can extrapolate:
```
api-staging-us-east-1.company.com
api-prod-eu-west-1.company.com
api-dev-us-east-1.company.com
admin-prod-us-east-1.company.com
webhooks-prod-us-east-1.company.com
internal-prod-us-east-1.company.com
```

Most companies run multi-region for redundancy and have dev/staging/prod environments. They have admin panels, webhook handlers, and internal tools. These aren't lucky guesses—they're requirements of running production infrastructure at scale.

## Certificate Transparency: Reading the Build Logs

Certificate Transparency logs are essentially public build receipts. When DevOps provisions a new service, they request a cert. That cert gets logged publicly. You're not looking for secrets here—you're looking at the company's infrastructure evolution in real-time.

```bash
curl -s "https://crt.sh/?q=%.example.com&output=json" | jq -r '.[].name_value' | sort -u
```

But don't just collect domains. Read them. Look for:

**Time-based patterns**: Multiple certs issued on the same day? That's probably a deployment. Check if they share naming patterns—it might reveal the structure of an entire service cluster.

**Deprecated services**: Old certs that haven't been renewed. These systems might still be running with outdated security. Abandoned infrastructure is often poorly maintained.

**Third-party integrations**: Subdomains like `sso-okta.example.com` or `zendesk.example.com` reveal the tech stack and potential integration points.

## Cloud Provider Metadata is a Map

Cloud providers leak organizational structure through their architecture. An AWS account might have:
```
company-prod-frontend.s3.amazonaws.com
company-prod-assets.s3.amazonaws.com  
company-staging-uploads.s3.amazonaws.com
company-dev-backups.s3.amazonaws.com
```

Notice the pattern? The company likely has separate AWS accounts or at minimum separate IAM permission boundaries for each environment. This tells you:
- They follow AWS best practices (good security hygiene)
- But also means you need to check each environment separately
- Staging/dev often has relaxed security controls

Cloud services also expose compute identifiers. An EC2 instance at `ec2-52-12-34-56.compute-1.amazonaws.com` tells you they're in us-east-1. Reverse DNS on IP ranges can reveal entire cloud deployments.

## GitHub and Code Repositories: The Source Code of Infrastructure

Public repositories aren't just about finding API keys (though that happens). They reveal:

**CI/CD configurations**: `.github/workflows`, `.gitlab-ci.yml`, `Jenkinsfile` show you the deployment pipeline. Where do builds push to? What environments exist? What scripts run during deployment?

**Infrastructure as Code**: Terraform, CloudFormation, Ansible configs describe the entire infrastructure. Even if the actual resources aren't exposed, you learn the architecture, networking setup, and service dependencies.

**Dockerfile and docker-compose**: Container configs reveal internal service names, environment variables, and network topology. An internal service called `user-service` talking to `payment-api` tells you exactly what to look for.

**Historical commits**: Don't just look at main branch. Check commit history. Developers frequently commit credentials, then remove them in the next commit. The credentials are still in git history. They also hardcode staging URLs, internal IPs, and API endpoints during development.

## JavaScript: Reading the Client-Side Documentation

Modern webapps ship their API schema to the client. Open the browser console and look at network requests, but also read the actual JavaScript source:

```javascript
const API_ENDPOINTS = {
  prod: 'https://api.example.com',
  staging: 'https://api-staging.example.com',
  dev: 'https://api-dev.example.com'
}
```

Developers do this constantly. Feature flags, internal API routes, admin endpoints—all exposed in client code because someone needed to test something and forgot to remove it.

Use browser dev tools to check:
- localStorage (API keys, tokens)
- sessionStorage (temporary credentials)
- Service Workers (cached API responses)
- Web Workers (background processing logic)

Run `Object.keys(window)` in console. Look for anything app-specific. Run `console.log(window.appConfig)` or similar. Developers attach config objects to the global scope all the time.

## DNS Enumeration: Beyond Brute Force

DNS isn't just about finding subdomains—it's about understanding infrastructure topology.

**Zone transfers** (usually disabled but worth checking):
```bash
dig @ns1.example.com example.com AXFR
```

**SPF records reveal email infrastructure**:
```bash
dig example.com TXT | grep spf
```
This shows which mail servers and services (SendGrid, Mailgun, G Suite) are authorized to send mail. Each integration is a potential attack surface.

**DMARC records show monitoring systems**:
```bash
dig _dmarc.example.com TXT
```
The `rua=` field contains email addresses where reports are sent, often revealing internal domains or third-party security services.

**CAA records limit certificate authorities**:
```bash
dig example.com CAA
```
Tells you which CAs the company trusts. If they only allow one CA, that's potentially a social engineering vector (call the CA impersonating the company).

## Reverse IP Lookups and Neighbor Analysis

Shared hosting and cloud infrastructure means IP addresses often host multiple services. If you find one interesting server, check what else is on that IP or nearby IPs.

```bash
# Find other domains on same IP
curl "https://api.hackertarget.com/reverseiplookup/?q=52.12.34.56"

# Check IP neighbors (same subnet)
for i in {1..255}; do 
  dig -x 52.12.34.$i +short
done
```

Companies often use sequential IPs for related services. Finding `db-prod.example.com` at `52.12.34.10` might mean `db-staging.example.com` is at `52.12.34.11`.

## Favicon Hashing: Infrastructure Fingerprinting

Default admin panels, frameworks, and dashboards serve default favicons. These can be hashed and searched across the internet.

```bash
curl -s https://target.com/favicon.ico | md5sum
```

Search that hash on Shodan:
```
http.favicon.hash:12345678
```

You'll find every instance of that admin panel, framework, or appliance running across the internet, including potentially unlinked instances belonging to your target.

## Wayback Machine: Infrastructure Archaeology

The Internet Archive captures historical snapshots of websites. Old versions might reveal:
- Deprecated APIs still running
- Development/staging URLs accidentally linked
- Historical subdomains
- Old directory structures

```bash
curl "http://web.archive.org/cdx/search/cdx?url=*.example.com&output=json&fl=original&collapse=urlkey"
```

Companies rarely decommission infrastructure properly. That old API from 2019? Might still be running with outdated security.

## Social Engineering Infrastructure Discovery

People talk. Engineers especially:
- Job postings mention tech stacks (AWS, Kubernetes, specific frameworks)
- Conference talks reveal architecture decisions
- Blog posts discuss migration strategies
- Stack Overflow questions include internal domain names
- LinkedIn profiles list technologies used

Search for `example.com site:stackoverflow.com` or `example.com site:github.com`. Engineers post code snippets, debug logs, and configuration examples containing internal details.

## Target Selection: Not All Infrastructure is Equal

Once you have a map, prioritize:

**High-value, low-security targets**:
- Staging/dev environments (often less monitored)
- Legacy systems (outdated patches)
- Acquired companies' infrastructure (inconsistent security)
- Third-party integrations (shared responsibility confusion)

**Internal tools exposed externally**:
- Admin panels
- Employee-only apps
- CI/CD dashboards
- Monitoring systems

**Data storage**:
- S3 buckets (public read/write)
- Database endpoints (MongoDB, Redis)
- Backup servers

## Putting It Together: A Real Workflow

1. **Business analysis**: What does the company do? What infrastructure is required?

2. **Initial enumeration**: Passive DNS (crt.sh, VirusTotal), public repos, tech blog posts

3. **Pattern recognition**: Find naming conventions, extrapolate environments/regions

4. **Expansion**: Use discovered patterns to find related infrastructure

5. **Fingerprinting**: Identify technologies, frameworks, and services running

6. **Prioritization**: Focus on staging, legacy, and poorly maintained systems

7. **Validation**: Verify discovered assets are actually accessible and relevant

## The Mindset Shift

Stop thinking like a scanner. Think like an engineer who needs to understand a new codebase. Read the infrastructure the way you'd read code:
- What patterns exist?
- Why was it built this way?
- What constraints did they face?
- Where are the natural weak points?

Companies build predictably because infrastructure requires predictability. Your job is to understand their system well enough that finding the next piece of infrastructure feels inevitable, not lucky.

Good recon doesn't depend on finding that one weird trick. It's about building a mental model of the target's infrastructure so complete that discovering new assets is a logical next step, not a random find.
