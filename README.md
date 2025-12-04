# Universal DNS Hub

## Multi-Cloud Infrastructure Hardening & Automation Tool

This tool is designed for cybersecurity researchers and DevOps professionals to analyze, harden, and translate DNS configurations across various platforms, including Cloudflare and Google Cloud DNS. It leverages the Gemini API for deep security auditing and uses platform-specific logic (e.g., CNAME flattening rules, TTL normalization) to ensure compliance and security hygiene. This allows users to enforce consistent security policies and best practices regardless of their current cloud provider, making infrastructure migration and multi-cloud environments significantly less error-prone.

## Key Features

Multi-Cloud Context: Toggle between Cloudflare, Google Cloud, and Generic BIND rules to analyze and generate configuration that is natively compliant with the target environment. For example, Cloudflare's CNAME Flattening at the zone apex (@) is treated as a valid feature, whereas it is flagged as an RFC 1035 violation when targeting Google Cloud DNS, where such a record would be strictly prohibited. This context-awareness is crucial for successful deployment.

Policy Enforcement: Automated consolidation of fragmented SPF records (which often exceed the 10-lookup limit and cause email deliverability failures) and robust flagging of weak DMARC policies (p=none). Furthermore, the tool checks for critical security omissions like missing CAA (Certificate Authority Authorization) records, which are essential for preventing unauthorized issuance of TLS/SSL certificates for your domain by restricting which Certificate Authorities are trusted.

AI Record Generation: Use natural language (via Gemini) to quickly generate complex or specific records (such as highly-prioritized MX records, new DKIM selectors, restrictive CAA entries, or SRV records for service discovery) directly into the desired BIND or Terraform output format. This feature drastically reduces manual lookups and syntax errors.

Infrastructure-as-Code (IaC) Export: Generate clean BIND zone files, which are the industry standard for DNS management, or platform-specific Terraform HCL code. This enables seamless integration into existing CI/CD pipelines, allowing security improvements to be deployed programmatically and tracked via version control.

## Deployment (GitHub Pages)

Since this application is a single-file React component, deployment is extremely straightforward using a static hosting service.

Steps for Setup:

Initialize Repository:

```
mkdir universal-dns-hub
cd universal-dns-hub
git init
```


Add Files:

Save the code from the UniversalDNSHub.jsx component (from the chat history) into a file named UniversalDNSHub.jsx.
Save the code above into a file named index.html.
Save this text into a file named README.md.
Commit and Push:

```
git add .
git commit -m "Initial commit of Universal DNS Hub"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```
