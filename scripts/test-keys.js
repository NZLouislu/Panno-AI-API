const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

const logFile = "api_testing_log.txt";
fs.writeFileSync(logFile, "Starting API Key Tests\n\n");

function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + "\n");
}

const keys = [
    process.env.Gemini_API,
    process.env.AULouis_Gemini_API,
    process.env.Blog_Gemini_API,
    process.env.Tasky_Gemini_API,
    process.env.Marie_Gemini_API,
    process.env.AILouis_Gemini_API,
].filter(Boolean);

async function testKey(key, index) {
    log(`\n--- Testing Key ${index}: ${key.substring(0, 10)}... ---`);
    const genAI = new GoogleGenerativeAI(key);

    // Test 1: Basic Ping with 2.0-flash
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent("ping");
        const response = await result.response;
        log(`[Key ${index}] 2.0-flash OK`);
    } catch (error) {
        log(`[Key ${index}] 2.0-flash FAILED: ${error.message}`);
    }

    // Test 2: Specific Image Generation with 2.5-flash-image
    try {
        const imgModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
        const imgResult = await imgModel.generateContent("test");
        const imgResponse = await imgResult.response;
        log(`[Key ${index}] 2.5-flash-image OK`);
        return true;
    } catch (error) {
        log(`[Key ${index}] 2.5-flash-image FAILED: ${error.message}`);
        return false;
    }
}

async function runTests() {
    log(`Found ${keys.length} keys in current environment.`);
    if (keys.length === 0) {
        log("No keys found! Make sure you run with: node --env-file=.env scripts/test-keys.js");
        return;
    }
    for (let i = 0; i < keys.length; i++) {
        await testKey(keys[i], i);
    }
    log("\nTests completed.");
}

runTests();
