// core/detector.js
const axios = require('axios');
const dns = require('dns');
const net = require('net');

/**
 * SiteDetector – comprehensive target status and error analysis
 * Detects if the target is up, measures response time, and provides
 * human‑readable diagnostics for every type of failure.
 */
class SiteDetector {
    /**
     * @param {string} target – full URL (e.g., https://example.com)
     */
    constructor(target) {
        this.target = target;
        this.status = {
            isUp: false,
            responseTime: 0,
            statusCode: 0,
            errors: [],
            detectionTime: new Date(),
            ip: null,
        };
    }

    /**
     * Primary detection routine – tries HTTP, falls back to TCP, then DNS.
     * @returns {Promise<Object>} the enriched status object
     */
    async detect() {
        const start = Date.now();
        try {
            const response = await axios.get(this.target, {
                timeout: 5000,
                validateStatus: () => true, // accept any HTTP status
            });

            this.status.isUp = response.status < 500;
            this.status.statusCode = response.status;
            this.status.responseTime = Date.now() - start;

            // Analyze HTTP status for error messages
            const httpError = this.analyzeHttpStatus(response.status);
            if (httpError) {
                this.status.errors.push(httpError);
            }

            // Check for common WAF headers that indicate blocking
            const wafHeaders = ['cf-ray', 'x-sucuri-id', 'x-akamai-transformed'];
            const hasWaf = wafHeaders.some(h => response.headers[h.toLowerCase()]);
            if (hasWaf && response.status === 403) {
                this.status.errors.push('WAF detected – try bypass headers / proxy rotation');
            }

        } catch (err) {
            this.status.isUp = false;
            // Use the enhanced TLS/network error analyzer
            this.status.errors.push(this.analyzeTlsError(err));
            // Also try TCP check as fallback
            await this.tcpCheck();
        }

        // Always perform DNS check for IP resolution
        await this.dnsCheck();

        // If no errors so far, but still down, mark as unknown
        if (!this.status.isUp && this.status.errors.length === 0) {
            this.status.errors.push('Unknown connectivity issue – check target manually');
        }

        this.status.detectionTime = new Date();
        return this.status;
    }

    /**
     * TCP connectivity test – useful when HTTP fails due to TLS or application errors.
     * @returns {Promise<void>}
     */
    async tcpCheck() {
        const url = new URL(this.target);
        const port = url.port || (url.protocol === 'https:' ? 443 : 80);

        return new Promise((resolve) => {
            const socket = new net.Socket();
            const timeout = 3000;

            socket.setTimeout(timeout);
            socket.on('connect', () => {
                this.status.isUp = true;
                socket.destroy();
                resolve();
            });
            socket.on('timeout', () => {
                this.status.errors.push('TCP Timeout – target not responding on port');
                socket.destroy();
                resolve();
            });
            socket.on('error', (err) => {
                const analyzed = this.analyzeTlsError(err);
                this.status.errors.push(`TCP: ${analyzed}`);
                resolve();
            });
            socket.connect(port, url.hostname);
        });
    }

    /**
     * DNS resolution check – captures domain resolution failures.
     * @returns {Promise<void>}
     */
    async dnsCheck() {
        const url = new URL(this.target);
        return new Promise((resolve) => {
            dns.lookup(url.hostname, (err, address) => {
                if (err) {
                    const analyzed = this.analyzeTlsError(err);
                    this.status.errors.push(`DNS: ${analyzed}`);
                } else {
                    this.status.ip = address;
                }
                resolve();
            });
        });
    }

    /**
     * Comprehensive error analyzer for TLS, network, and DNS errors.
     * Maps common Node.js error codes to human‑readable strings.
     * @param {Error} err – the error object from any network operation
     * @returns {string} descriptive error message
     */
    analyzeTlsError(err) {
        const code = err.code || '';
        const map = {
            'ECONNRESET': 'Connection Reset (target dropping RST)',
            'ETIMEDOUT': 'Timeout (target not responding)',
            'EPROTO': 'Protocol Error (target may have patched HTTP/2)',
            'EADDRNOTAVAIL': 'IP Ban (your source IP is blocked)',
            'ECONNREFUSED': 'Connection Refused (port closed or firewall)',
            'ENOTFOUND': 'DNS Resolution Failed (domain does not exist)',
            'EAI_AGAIN': 'DNS Temporary Failure (try again)',
            'CERT_HAS_EXPIRED': 'SSL Certificate Expired (target misconfigured)',
            'UNABLE_TO_VERIFY_LEAF_SIGNATURE': 'Self‑signed Certificate (WAF may be MITM)',
            'EHOSTUNREACH': 'No route to host (network down)',
            'ENETUNREACH': 'Network unreachable',
            'EACCES': 'Permission denied (local firewall)',
        };
        return map[code] || `Unknown Error: ${err.message} (${code || 'no code'})`;
    }

    /**
     * HTTP status code analyzer – returns error description for 4xx/5xx.
     * @param {number} status – HTTP status code
     * @returns {string|null} error description, or null if status is success (2xx/3xx)
     */
    analyzeHttpStatus(status) {
        if (status === 403) return 'WAF Block (403 Forbidden) – try different headers';
        if (status === 429) return 'Rate Limiting (429) – slow down or rotate IPs';
        if (status === 503) return 'Service Unavailable (503) – target overloaded (good!)';
        if (status === 502) return 'Bad Gateway (502) – upstream proxy failing';
        if (status === 504) return 'Gateway Timeout (504) – backend taking too long';
        if (status >= 500) return `Server Error (${status}) – likely crashed or misconfigured`;
        if (status >= 400) return `Client Error (${status}) – request rejected`;
        return null; // 2xx or 3xx – not an error
    }

    /**
     * Pretty‑prints the status to the console.
     */
    logStatus() {
        console.log('\n========== TARGET STATUS ==========');
        console.log(`Target: ${this.target}`);
        console.log(`Status: ${this.status.isUp ? '✅ UP' : '❌ DOWN'}`);
        console.log(`Response Time: ${this.status.responseTime}ms`);
        console.log(`Status Code: ${this.status.statusCode}`);
        if (this.status.ip) {
            console.log(`Resolved IP: ${this.status.ip}`);
        }
        console.log(`Errors: ${this.status.errors.length > 0 ? this.status.errors.join('; ') : 'None'}`);
        console.log('====================================\n');
    }
}

module.exports = SiteDetector;