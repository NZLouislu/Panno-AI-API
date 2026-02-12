const https = require('https');

const keys = [
    'sk-EXpDPvj0PnYh2l5cof3JDGctgYUrWHVN1DjvDxDHi9e7Vq7Z',
    'sk-KSUPdEt40yyHwWkymuCA9w5gefrfgJPha5gH23l5Mjdsn6Hq',
    'sk-xwPk8wHR3hZR9Ya11LnXci0A70N2QxIwVv9gO43VZ5H3QCrN'
];

function checkBalance(key) {
    return new Promise((resolve) => {
        console.log(`\nChecking Key: ${key.substring(0, 10)}...`);

        const options = {
            hostname: 'api.stability.ai',
            path: '/v1/user/balance',
            method: 'GET',
            headers: {
                Authorization: `Bearer ${key}`
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const json = JSON.parse(data);
                    console.log(`✅ Status: OK`);
                    console.log(`💰 Credits: ${json.credits}`);
                } else {
                    console.log(`❌ Status: ${res.statusCode}`);
                    console.log(`📝 Response: ${data}`);
                    if (res.statusCode === 402) {
                        console.log('⚠️ Result: Out of credits (402 Payment Required)');
                    } else if (res.statusCode === 401) {
                        console.log('⚠️ Result: Invalid API Key (401 Unauthorized)');
                    }
                }
                resolve();
            });
        });

        req.on('error', (e) => {
            console.error(`❌ Request Error: ${e.message}`);
            resolve();
        });

        req.end();
    });
}

async function run() {
    for (const key of keys) {
        await checkBalance(key);
    }
}

run();
