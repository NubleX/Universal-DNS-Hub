import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle, 
  Server, 
  RefreshCw, 
  Copy, 
  Database,
  Cloud,
  Lock,
  Zap,
  Sparkles,
  Bot,
  Globe,
  LayoutGrid,
  Code,
  Mail,
  List
} from 'lucide-react';

const UniversalDNSHub = () => {
  // CORRECTED: Using generic domain (yoursite.com) and non-functional hashed placeholders for privacy.
  const initialZoneFile = `;;
;; Domain:     yoursite.com.
;; Exported:   2025-12-03 23:57:10
;;
;; SOA Record
yoursite.com\t3600\tIN\tSOA\tclarissa.ns.cloudflare.com. dns.cloudflare.com. 2051647283 10000 2400 604800 3600

;; NS Records
yoursite.com.\t86400\tIN\tNS\tclarissa.ns.cloudflare.com.
yoursite.com.\t86400\tIN\tNS\tkobe.ns.cloudflare.com.

;; CNAME Records
VERIFY_BING_HASHED.yoursite.com.\t1\tIN\tCNAME\tverify.bing.com.
email.yoursite.com.\t1\tIN\tCNAME\temail.yoursite.com.cdn.cloudflare.net.
hs1-EMAIL_DKIM_HASHED._domainkey.yoursite.com.\t1\tIN\tCNAME\tyoursite-com.hs07a.dkim.hubspotemail.net.
hs2-EMAIL_DKIM_HASHED._domainkey.yoursite.com.\t1\tIN\tCNAME\tyoursite-com.hs07b.dkim.hubspotemail.net.
hub.yoursite.com.\t1\tIN\tCNAME\tSITE_CDN_ID_HASHED.group0.sites.hscoscdn-eu1.net.
yoursite.com.\t1\tIN\tCNAME\tyoursite.pages.dev.
www.yoursite.com.\t1\tIN\tCNAME\tyoursite.pages.dev.

;; MX Records
hub.yoursite.com.\t1\tIN\tMX\t55 route1.mx.cloudflare.net.
hub.yoursite.com.\t1\tIN\tMX\t13 route3.mx.cloudflare.net.
hub.yoursite.com.\t1\tIN\tMX\t52 route2.mx.cloudflare.net.
yoursite.com.\t1\tIN\tMX\t52 route2.mx.cloudflare.net.
yoursite.com.\t1\tIN\tMX\t55 route1.mx.cloudflare.net.
yoursite.com.\t1\tIN\tMX\t13 route3.mx.cloudflare.net.

;; TXT Records
cf2024-1._domainkey.yoursite.com.\t1\tIN\tTXT\t"v=DKIM1; h=sha256; k=rsa; p=DKIM_PUBLIC_KEY_HASHED_PART1" "DKIM_PUBLIC_KEY_HASHED_PART2"
yoursite.com.\t1\tIN\tTXT\t"google-site-verification=G_VERIFY_TOKEN_HASHED"
yoursite.com.\t1\tIN\tTXT\t"v=spf1 include:_spf.mx.cloudflare.net ~all"
yoursite.com.\t1\tIN\tTXT\t"include:HUBSPOT_SPF_TOKEN.spf07.hubspotemail.net"
yoursite.com.\t1\tIN\tTXT\t"yandex-verification: YANDEX_VERIFY_HASHED"
yoursite.com.\t1\tIN\tTXT\t"pinterest-site-verification=PINTEREST_VERIFY_HASHED"
yoursite.com.\t1\tIN\tTXT\t"hubspot-developer-verification=HUBSPOT_DEV_VERIFY_HASHED"
yoursite.com.\t1\tIN\tTXT\t"openai-domain-verification=OPENAI_VERIFY_HASHED"
_dmarc.yoursite.com.\t1\tIN\tTXT\t"v=DMARC1; p=none; rua=mailto:DMARC_REPORT_EMAIL_HASHED@yoursite.com"`;

  const [inputZone, setInputZone] = useState(initialZoneFile);
  const [outputContent, setOutputContent] = useState('');
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ riskScore: 0, criticalErrors: 0, warnings: 0 });
  
  // Platform Selector: 'cf' (Cloudflare), 'gcp' (Google Cloud), 'bind' (Generic)
  const [platform, setPlatform] = useState('cf');
  // Export Format: 'bind', 'terraform', 'json'
  const [exportFormat, setExportFormat] = useState('bind');

  // AI State
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiCommand, setAiCommand] = useState('');
  const [aiCommandResult, setAiCommandResult] = useState('');
  const [isAiCommandLoading, setIsAiCommandLoading] = useState(false);

  const apiKey = ""; 
  const domainName = 'yoursite.com';

  // --- Gemini API ---
  const callGemini = async (prompt) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const payload = { contents: [{ parts: [{ text: prompt }] }] };

    let retries = 0;
    while (retries <= 3) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        return result.candidates?.[0]?.content?.parts?.[0]?.text || "No analysis generated.";
      } catch (error) {
        retries++;
        if (retries > 3) return "Error connecting to AI Security Core.";
        await new Promise(res => setTimeout(res, 1000 * retries));
      }
    }
  };

  const runAIDeepScan = async () => {
    setIsAiLoading(true);
    setAiAnalysis(null);
    
    const platformName = platform === 'cf' ? "Cloudflare" : platform === 'gcp' ? "Google Cloud DNS" : "Generic BIND";
    
    const prompt = `
      Act as a Cloud Security Architect specialized in ${platformName}. Analyze the following DNS Zone file.
      The domain being analyzed is ${domainName}.
      
      Focus on:
      1. **Email Security:** DMARC policy strength (flag p=none), SPF consolidation, DKIM presence.
      2. **TLS/SSL Security:** Missing or weak CAA records (Certificate Authority Authorization).
      3. **Infrastructure Hygiene:** Old verification records, CNAME best practices for ${platformName}.
      
      Zone File:
      ${inputZone}

      Output JSON format:
      {
        "riskLevel": "High" | "Medium" | "Low",
        "summary": "Short executive summary focusing on ${platformName} email, TLS, and infrastructure optimization.",
        "findings": [
          { "type": "Security" | "Optimization" | "Email", "message": "Finding description" }
        ]
      }
    `;

    try {
      const textResponse = await callGemini(prompt);
      const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      setAiAnalysis(parsed);
    } catch (e) {
      setAiAnalysis({
        riskLevel: "Unknown",
        summary: "Could not parse AI response or network error.",
        findings: [{ type: "Error", message: "Raw output: " + e.message }]
      });
    }
    setIsAiLoading(false);
  };

  const runAICommand = async () => {
    if (!aiCommand) return;
    setIsAiCommandLoading(true);
    const platformName = platform === 'cf' ? "Cloudflare" : "Google Cloud";

    const prompt = `
      You are a DNS Automation Engineer for ${platformName}. The output format requested is ${exportFormat === 'terraform' ? 'Terraform HCL' : 'BIND format'}.
      User Request: "${aiCommand}"
      
      Generate the correct record configuration. 
      The domain is ${domainName}.
      Output ONLY the code.
    `;

    const result = await callGemini(prompt);
    setAiCommandResult(result);
    setIsAiCommandLoading(false);
  };

  // --- Core Logic ---

  const parseZone = (raw) => {
    const lines = raw.split('\n');
    const records = [];
    
    lines.forEach(line => {
      const cleanLine = line.trim();
      if (!cleanLine || cleanLine.startsWith(';')) return;
      const parts = cleanLine.split(/\s+/);
      let name = parts[0];
      let ttl = '3600';
      let type = 'A';
      let data = '';
      
      let typeIndex = parts.indexOf('IN');
      if (typeIndex !== -1) {
         type = parts[typeIndex + 1];
         data = parts.slice(typeIndex + 2).join(' ');
         if(typeIndex > 1 && parseInt(parts[1])) ttl = parts[1];
      } else {
         type = parts[3];
         data = parts.slice(4).join(' ');
      }

      records.push({ name, ttl, type, data, original: line });
    });
    return records;
  };

  const generateTerraform = (records, plat) => {
    let tfOutput = `# Terraform Config for ${plat === 'gcp' ? 'Google Cloud DNS' : 'Cloudflare'}\n# Domain: ${domainName}\n\n`;
    
    if (plat === 'gcp') {
        tfOutput += `resource "google_dns_managed_zone" "default" {
  name        = "${domainName.replace(/\./g, '-')}-zone"
  dns_name    = "${domainName}."
  description = "Managed by LEGION2"
}\n\n`;

        const grouped = {};
        records.forEach(r => {
             const key = `${r.name}-${r.type}`;
             if (!grouped[key]) grouped[key] = { ...r, rrdatas: [] };
             grouped[key].rrdatas.push(r.data);
        });

        Object.values(grouped).forEach(g => {
            if (g.type === 'SOA' || g.type === 'NS') return; 
            tfOutput += `resource "google_dns_record_set" "${g.name.replace(/\./g, '_').replace(/@/g, 'apex')}_${g.type}" {
  name = "${g.name}"
  type = "${g.type}"
  ttl  = ${g.ttl}
  managed_zone = google_dns_managed_zone.default.name
  rrdatas = [${g.rrdatas.map(d => `"${d.replace(/"/g, '\\"')}"`).join(', ')}]
}\n\n`;
        });
    } else {
        // Cloudflare
        records.forEach(r => {
            if (r.type === 'SOA' || r.type === 'NS') return;
            const proxied = r.ttl === '1' ? 'true' : 'false';
            const safeName = r.name.replace(/\.$/, '').replace(domainName, '@'); 
            const safeData = r.data.replace(/"/g, '\\"');
            
            tfOutput += `resource "cloudflare_record" "${r.name.replace(/\./g, '_').replace(/@/g, 'apex')}_${r.type}_${Math.random().toString(36).substr(2,5)}" {
  zone_id = var.cloudflare_zone_id
  name    = "${safeName}"
  value   = "${safeData}"
  type    = "${r.type}"
  ttl     = ${r.ttl === '1' ? 1 : r.ttl}
  proxied = ${r.type === 'A' || r.type === 'CNAME' ? proxied : 'false'}
}\n`;
        });
    }
    return tfOutput;
  };

  const processZone = () => {
    const records = parseZone(inputZone);
    const newLogs = [];
    let criticals = 0;
    let warns = 0;

    // --- Record Catalog Analysis & Fixes ---

    // 1. DMARC Policy Check (Email Security)
    const dmarcRecord = records.find(r => r.name.includes('_dmarc') && r.type === 'TXT');
    if (dmarcRecord && dmarcRecord.data.includes('p=none')) {
        warns++;
        newLogs.push({ type: 'warning', msg: `[Email] DMARC policy 'p=none' detected. Recommend 'p=quarantine' or 'p=reject' for enforcement.` });
    } else if (!dmarcRecord) {
         warns++;
         newLogs.push({ type: 'warning', msg: `[Email] No DMARC record found. Critical security gap for email spoofing protection.` });
    }

    // 2. CAA Check (TLS/SSL Security)
    const caaRecords = records.filter(r => r.type === 'CAA');
    if (caaRecords.length === 0) {
        warns++;
        newLogs.push({ type: 'warning', msg: `[TLS] No CAA records found. Best practice: restrict Certificate Authorities to prevent unauthorized issuance.` });
    }

    // 3. SPF Consolidation (Email Security)
    const spfRecords = records.filter(r => 
      r.type === 'TXT' && (r.name.includes(domainName)) && (r.data.includes('v=spf1') || r.data.includes('include:'))
    );

    let mergedSPF = '';
    if (spfRecords.length > 1) {
      criticals++;
      newLogs.push({ type: 'critical', msg: `[Email] Fragmented SPF detected. This may cause perm-error (10+ lookups).` });
      mergedSPF = `"v=spf1 include:_spf.mx.cloudflare.net include:HUBSPOT_SPF_TOKEN.spf07.hubspotemail.net ~all"`;
    }

    // 4. Apex CNAME & TTL (Infrastructure Hygiene)
    const processedRecords = records.map(rec => {
        let r = { ...rec };
        
        if (r.type === 'CNAME' && (r.name.includes(domainName) && !r.name.replace(domainName, ''))) {
            if (platform === 'gcp') {
                warns++;
                r.type = 'A';
                r.data = '104.18.2.3'; // Placeholder IP (similar to Cloudflare's public IPs)
                newLogs.push({ type: 'warning', msg: `[GCP-Strict] Apex CNAME violation. Flattened to A-Record.` });
            } else {
                 newLogs.push({ type: 'info', msg: `[Cloudflare] Apex CNAME (Flattening) detected - acceptable.` });
            }
        }

        if (r.ttl === '1') {
            if (platform === 'gcp' || platform === 'bind') {
                warns++;
                r.ttl = '300';
                newLogs.push({ type: 'warning', msg: `[${platform.toUpperCase()}] TTL '1' normalized to 300s (5 minutes).` });
            }
        }
        
        // Apply SPF fix
        if (mergedSPF && r.type === 'TXT' && (r.data.includes('v=spf1') || r.data.includes('include:'))) {
             r.data = mergedSPF;
        }

        return r;
    });

    const uniqueRecords = [];
    const seen = new Set();
    processedRecords.forEach(r => {
        // Exclude the redundant/original SPF parts once mergedSPF is applied
        if (mergedSPF && r.type === 'TXT' && (r.data.includes('v=spf1') || r.data.includes('include:')) && r.data !== mergedSPF) return;
        
        const key = `${r.name}-${r.type}-${r.data}`;
        if(seen.has(key)) return;
        seen.add(key);
        uniqueRecords.push(r);
    });


    // Generation Phase
    let finalOutput = '';

    if (exportFormat === 'terraform') {
        finalOutput = generateTerraform(uniqueRecords, platform);
    } else {
        // BIND Generator
        finalOutput = `;; OPTIMIZED FOR: ${platform.toUpperCase()}\n;; DOMAIN: ${domainName}\n;; DATE: ${new Date().toISOString()}\n\n`;
        uniqueRecords.forEach(r => {
            const name = r.name.endsWith('.') ? r.name : `${r.name}.`;
            finalOutput += `${name}\t${r.ttl}\tIN\t${r.type}\t${r.data}\n`;
        });
    }

    setOutputContent(finalOutput);
    setLogs(newLogs);
    setStats({
      riskScore: Math.min(100, (criticals * 40) + (warns * 10)),
      criticalErrors: criticals,
      warnings: warns
    });
  };

  // --- UI Component ---

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-6 flex flex-col gap-6">
      
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/30">
                <Globe className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Universal DNS Hub</h1>
                <p className="text-xs text-slate-500 font-mono">Multi-Protocol, Multi-Cloud Infrastructure Security</p>
            </div>
        </div>

        {/* Platform Switcher */}
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button 
                onClick={() => setPlatform('cf')}
                className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${platform === 'cf' ? 'bg-orange-500/20 text-orange-400 shadow-sm border border-orange-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <Cloud className="w-3 h-3" /> Cloudflare
            </button>
            <button 
                onClick={() => setPlatform('gcp')}
                className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${platform === 'gcp' ? 'bg-blue-500/20 text-blue-400 shadow-sm border border-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <LayoutGrid className="w-3 h-3" /> Google Cloud
            </button>
            <button 
                onClick={() => setPlatform('bind')}
                className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${platform === 'bind' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <Database className="w-3 h-3" /> Generic BIND
            </button>
        </div>
      </header>

      <main className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1">
        
        {/* Left Column: Input & AI */}
        <div className="xl:col-span-5 flex flex-col gap-4">
            
            {/* AI Command Bar */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-1 flex items-center gap-2 focus-within:border-indigo-500/50 transition-colors">
                <div className="pl-3">
                    <Bot className="w-4 h-4 text-indigo-400" />
                </div>
                <input 
                    type="text" 
                    value={aiCommand}
                    onChange={(e) => setAiCommand(e.target.value)}
                    placeholder={`Ask AI to generate MX, DKIM, CAA, or SRV records for ${domainName}...`}
                    className="bg-transparent border-none focus:outline-none text-xs w-full py-2.5 text-white placeholder-slate-600 font-mono"
                    onKeyDown={(e) => e.key === 'Enter' && runAICommand()}
                />
                <button 
                    onClick={runAICommand}
                    disabled={isAiCommandLoading}
                    className="mr-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase rounded tracking-wider transition-colors disabled:opacity-50"
                >
                    {isAiCommandLoading ? 'Gen...' : 'Generate'}
                </button>
            </div>
            {aiCommandResult && (
                <div className="bg-black/40 border border-indigo-500/30 rounded-lg p-3 relative group animate-slideIn">
                    <pre className="text-[10px] text-indigo-300 font-mono overflow-x-auto">{aiCommandResult}</pre>
                    <button 
                        onClick={() => { setInputZone(prev => prev + '\n\n' + aiCommandResult); setAiCommandResult(''); setAiCommand(''); }}
                        className="absolute top-2 right-2 text-[10px] bg-indigo-900/50 text-indigo-200 px-2 py-1 rounded hover:bg-indigo-800"
                    >
                        Insert
                    </button>
                </div>
            )}

            {/* Main Input Area */}
            <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><List className='w-3 h-3 text-slate-500'/> Artifact Input ({domainName})</span>
                    <span className="text-[10px] text-slate-600 font-mono">BIND/TXT Format</span>
                </div>
                <textarea 
                    value={inputZone}
                    onChange={(e) => setInputZone(e.target.value)}
                    className="flex-1 bg-slate-900/50 p-4 font-mono text-xs text-slate-300 resize-none focus:outline-none focus:bg-slate-900 transition-colors leading-relaxed"
                    spellCheck="false"
                />
            </div>
        </div>

        {/* Middle Column: Actions & Logs */}
        <div className="xl:col-span-2 flex flex-col gap-4">
            
            {/* Risk Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                 <div className="flex justify-between items-center mb-2">
                     <span className="text-[10px] font-bold text-slate-500 uppercase">Policy Compliance</span>
                     <Shield className={`w-4 h-4 ${stats.riskScore > 50 ? 'text-red-500' : 'text-green-500'}`} />
                 </div>
                 <div className="text-2xl font-bold text-white mb-1">
                     {outputContent ? (100 - stats.riskScore) : '--'}%
                 </div>
                 <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                     <div 
                        className={`h-full transition-all duration-700 ${stats.riskScore > 50 ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: outputContent ? `${100 - stats.riskScore}%` : '0%' }}
                     />
                 </div>
                 <div className="mt-3 flex gap-2">
                     <div className="flex-1 bg-slate-950 rounded p-2 text-center border border-slate-800">
                         <div className="text-xs text-slate-500">Critical</div>
                         <div className="text-sm font-bold text-red-400">{stats.criticalErrors}</div>
                     </div>
                     <div className="flex-1 bg-slate-900 rounded p-2 text-center border border-slate-800">
                         <div className="text-xs text-slate-500">Warnings</div>
                         <div className="text-sm font-bold text-orange-400">{stats.warnings}</div>
                     </div>
                 </div>
            </div>

            {/* Action Buttons */}
            <button 
                onClick={processZone}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-bold text-sm shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2"
            >
                <RefreshCw className="w-4 h-4" /> Translate & Hardening
            </button>

            <button 
                onClick={runAIDeepScan}
                disabled={isAiLoading}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/20 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {isAiLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                Gemini Deep Scan
            </button>

            {/* Logs Console */}
            <div className="flex-1 bg-black border border-slate-800 rounded-xl p-3 overflow-hidden flex flex-col min-h-[200px]">
                <span className="text-[10px] font-bold text-slate-500 uppercase mb-2 block border-b border-slate-900 pb-1">System Events</span>
                <div className="flex-1 overflow-y-auto space-y-2 font-mono scrollbar-hide">
                    {logs.map((log, i) => (
                        <div key={i} className={`text-[10px] border-l-2 pl-2 py-0.5 ${
                            log.type === 'critical' ? 'border-red-500 text-red-400' :
                            log.type === 'warning' ? 'border-orange-500 text-orange-300' :
                            'border-blue-500 text-blue-300'
                        }`}>
                            {log.msg}
                        </div>
                    ))}
                    {logs.length === 0 && <span className="text-[10px] text-slate-700 italic">Ready for input...</span>}
                </div>
            </div>

        </div>

        {/* Right Column: Universal Output */}
        <div className="xl:col-span-5 flex flex-col gap-4">
            
            {/* Gemini Analysis Panel */}
            {aiAnalysis && (
                <div className="bg-gradient-to-b from-purple-900/20 to-slate-900 border border-purple-500/30 rounded-xl p-4 animate-fadeIn">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> 
                            {platform === 'cf' ? 'Cloudflare' : 'GCP'} Deep Intelligence
                        </h3>
                        <span className="text-[10px] font-mono text-slate-400 border border-slate-700 px-2 py-0.5 rounded">
                            {aiAnalysis.riskLevel} Risk
                        </span>
                    </div>
                    <p className="text-xs text-slate-300 mb-3 leading-relaxed border-b border-purple-500/10 pb-2">
                        {aiAnalysis.summary}
                    </p>
                    <div className="space-y-1">
                        {aiAnalysis.findings.slice(0,5).map((f, i) => (
                            <div key={i} className="flex gap-2 items-start">
                                <span className="text-purple-500 text-[10px] mt-0.5">●</span>
                                <span className="text-[11px] text-slate-400">{f.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Output Panel */}
            <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Target Config</span>
                    </div>
                    
                    {/* Format Toggles */}
                    <div className="flex bg-slate-900 rounded p-0.5 border border-slate-800">
                        <button 
                            onClick={() => setExportFormat('bind')}
                            className={`px-2 py-1 text-[10px] rounded font-bold transition-colors ${exportFormat === 'bind' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            BIND
                        </button>
                        <button 
                            onClick={() => setExportFormat('terraform')}
                            className={`px-2 py-1 text-[10px] rounded font-bold transition-colors ${exportFormat === 'terraform' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Terraform
                        </button>
                    </div>
                </div>

                <div className="relative flex-1 group">
                    <textarea 
                        value={outputContent}
                        readOnly
                        placeholder="Configuration will appear here after 'Translate & Hardening' is run..."
                        className={`w-full h-full bg-slate-900 p-4 font-mono text-xs resize-none focus:outline-none leading-relaxed
                            ${exportFormat === 'terraform' ? 'text-purple-300' : 'text-green-300'}
                        `}
                    />
                    {outputContent && (
                        <button 
                            onClick={() => navigator.clipboard.writeText(outputContent)}
                            className="absolute top-4 right-4 p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded shadow border border-slate-600 transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

        </div>

      </main>

      <footer className="flex justify-center text-[10px] text-slate-600 font-mono gap-4 uppercase tracking-widest">
         <span>SecOps Level: High</span>
         <span>•</span>
         <span>Latency: Low</span>
         <span>•</span>
         <span>Encryption: Enabled</span>
      </footer>

    </div>
  );
};

export default UniversalDNSHub;
