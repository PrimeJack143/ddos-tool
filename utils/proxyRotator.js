// utils/proxyRotator.js
const axios = require('axios');

class ProxyRotator {
    constructor(proxyList) {
        this.proxies = proxyList || [];
        this.currentIndex = 0;
    }

    async fetchProxies() {
        // Fetch from proxy sources
        try {
            const response = await axios.get('https://api.proxyscrape.com/?request=getproxies');
            this.proxies = response.data.split('\n').filter(p => p.trim());
        } catch (err) {
            console.error('Failed to fetch proxies:', err.message);
        }
    }

    getNextProxy() {
        if (this.proxies.length === 0) return null;
        const proxy = this.proxies[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
        return proxy;
    }

    rotateOnFailure() {
        this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
        return this.proxies[this.currentIndex];
    }
}

module.exports = ProxyRotator;