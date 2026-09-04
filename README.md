# DDoS Multi-Vector Tool

**Advanced HTTP/2 Stress Testing Framework**  
Developed by **Ai Mi 艾米**, **Jack**, and **Liu 刘梦芮**

---

## ⚠️ IMPORTANT LEGAL NOTICE

This tool is **intended solely for security research, authorized penetration testing, and educational purposes**.  
Unauthorized use against any system without explicit written permission is **illegal** and may result in criminal prosecution.  
The authors assume **no liability** for any misuse or damage caused by this software.  
**Use responsibly and only on systems you own or have permission to test.**

---

## 📖 Overview

This is a high‑performance, modular DDoS (Distributed Denial of Service) stress‑testing tool written in Node.js. It leverages two critical HTTP/2 protocol vulnerabilities:

- **CVE-2023-44487 (HTTP/2 Rapid Reset)** – allows massive request cancellation to exhaust server resources.
- **CVE-2025-8671 (MadeYouReset)** – forces the server to generate excessive `RST_STREAM` frames via malformed protocol violations.

The tool includes an intelligent **Site Detector**, **adaptive bypass mechanisms**, **proxy rotation**, and a **live dashboard** – making it a sophisticated research platform for understanding HTTP/2 attack vectors and testing defensive mitigations.

---

## ✨ Features

- **Dual attack modes**: Rapid Reset & MadeYouReset  
- **Automated target reconnaissance** – detects WAF, IP bans, and response patterns  
- **Real‑time error analysis** – translates cryptic network errors into human‑readable diagnostics  
- **Proxy rotation** – rotate through HTTP/HTTPS proxies to avoid IP‑based blocking  
- **JA3/JA4 fingerprint evasion** – randomise TLS ciphers and extensions  
- **Cloudflare/Cloudfront bypass** – manipulate headers to evade common CDN protections  
- **Adaptive backoff** – automatically slows down when rate‑limited or blocked  
- **Live CLI dashboard** – displays RPS, latency, and status code distribution  
- **Memory‑safe streaming** – prevents Node.js heap exhaustion (with proper tuning)  
- **Extensible architecture** – easy to add new attack vectors or bypass modules  

---

## 🖥️ System Requirements

- **Node.js** (v16 or later, v20+ LTS recommended)  
- **npm** (Node Package Manager)  
- **Kali Linux** or any Debian‑based Linux (tested) – works on Windows/macOS with minor adjustments  
- Minimum 4GB RAM (8GB+ recommended for high‑concurrency attacks)

---

## 🔧 Installation

### 1. Clone the repository

```bash
git clone (https://github.com/PrimeJack143/ddos-tool)
cd ddos-tool
