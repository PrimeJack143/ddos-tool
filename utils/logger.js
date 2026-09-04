const fs = require('fs');

class Logger {
    constructor(logFile = 'attack.log') {
        this.logFile = logFile;
    }

    log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const entry = `[${timestamp}] [${level}] ${message}\n`;
        console.log(entry.trim());
        fs.appendFileSync(this.logFile, entry);
    }

    error(message) {
        this.log(message, 'ERROR');
    }

    warn(message) {
        this.log(message, 'WARN');
    }

    info(message) {
        this.log(message, 'INFO');
    }

    debug(message) {
        this.log(message, 'DEBUG');
    }
}

module.exports = Logger;
