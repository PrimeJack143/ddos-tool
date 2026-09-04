// core/dashboard.js
const chalk = require('chalk');

class Dashboard {
    constructor() {
        this.stats = {
            rps: 0,
            avgLatency: 0,
            p50: 0,
            p95: 0,
            statusCounts: { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 }
        };
        this.latencies = [];
    }

    update(stats) {
        Object.assign(this.stats, stats);
        this.render();
    }

    render() {
        console.clear();
        console.log(chalk.cyan('========== DDoS ATTACK DASHBOARD =========='));
        console.log(chalk.green(`RPS: ${this.stats.rps}`));
        console.log(chalk.yellow(`Avg Latency: ${this.stats.avgLatency}ms`));
        console.log(chalk.magenta(`p50: ${this.stats.p50}ms | p95: ${this.stats.p95}ms`));
        console.log(chalk.blue(`Status: 2xx=${this.stats.statusCounts['2xx']} 3xx=${this.stats.statusCounts['3xx']} 4xx=${this.stats.statusCounts['4xx']} 5xx=${this.stats.statusCounts['5xx']}`));
        console.log(chalk.cyan('============================================='));
    }
}

module.exports = Dashboard;