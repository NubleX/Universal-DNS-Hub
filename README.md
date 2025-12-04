Universal and capable of bridging the gap between Cloudflare and Google Cloud Platform (GCP), I have re-architected the application to function as a multi-cloud translator.
This update introduces a "Target Infrastructure" selector. This allows the scanner to change its security rules and output formats dynamically based on where the DNS will live.
New Universal Features:
Platform-Specific Logic:
Cloudflare Mode: Understands that CNAME @ (Apex Flattening) is a valid feature, not an error. Treats TTL 1 as "Auto/Proxy".
Google Cloud Mode: Enforces strict RFC 1035 compliance (flags Apex CNAMEs). Enforces numeric TTLs (converts 1 to 300).
Infrastructure-as-Code (IaC) Exports:
Terraform (HCL): Automatically generates the google_dns_record_set or cloudflare_record Terraform code, allowing you to move from manual files to professional DevOps automation instantly.
Context-Aware AI: The Gemini Deep Scan now knows if you are targeting GCP or Cloudflare and adjusts its security recommendations accordingly (e.g., suggesting "Cloud Armor" for GCP vs "Page Rules" for Cloudflare).
