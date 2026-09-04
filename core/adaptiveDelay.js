// core/adaptiveDelay.js
class AdaptiveDelay {
    constructor() {
        this.baseDelay = 100; // ms
        this.maxDelay = 5000;
        this.currentDelay = this.baseDelay;
        this.failureCount = 0;
    }

    adjust(statusCode) {
        if (statusCode === 403 || statusCode === 429 || statusCode === 503) {
            this.failureCount++;
            // Exponential backoff
            this.currentDelay = Math.min(
                this.baseDelay * Math.pow(2, this.failureCount),
                this.maxDelay
            );
        } else {
            this.failureCount = Math.max(0, this.failureCount - 1);
            this.currentDelay = Math.max(this.baseDelay, this.currentDelay / 1.5);
        }
        return this.currentDelay;
    }

    // Burst mode: send a burst of requests then think
    getBurstSize() {
        return Math.floor(Math.random() * 20) + 5; // 5-25 requests
    }

    getThinkTime() {
        return Math.floor(Math.random() * 1000) + 200; // 200-1200ms
    }
}

module.exports = AdaptiveDelay;