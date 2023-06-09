const fs = require('fs');
const devcert = require('devcert');
// Get env
require('dotenv').config();

(
    async () => {

        const cert = await devcert.certificateFor('dev.visgraph');

        // Write cert.cert to environment variable SSL_CRT_FILE
        // Write cert.key to environment variable SSL_KEY_FILE
        if (!process.env.SSL_KEY_FILE) {
            throw new Error('SSL_KEY_FILE environment variable not set');
        }
        if (!process.env.SSL_CRT_FILE) {
            throw new Error('SSL_CRT_FILE environment variable not set');
        }

        fs.writeFileSync(process.env.SSL_CRT_FILE, cert.cert);
        fs.writeFileSync(process.env.SSL_KEY_FILE, cert.key);
    }
)();
