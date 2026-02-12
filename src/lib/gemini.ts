import { GoogleGenerativeAI } from "@google/generative-ai";

function getApiKeys() {
    return [
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_API_KEY_SECONDARY,
    ].filter(Boolean) as string[];
}

export async function getGeminiModel(index = 0, modelName = "gemini-2.0-flash") {
    const keys = getApiKeys();
    if (index >= keys.length) {
        throw new Error("All Gemini API keys have been exhausted.");
    }

    const genAI = new GoogleGenerativeAI(keys[index]);
    return genAI.getGenerativeModel({ model: modelName });
}

export async function generateWithFallback(
    fn: (model: any) => Promise<any>,
    index = 0,
    modelName = "gemini-2.0-flash"
): Promise<any> {
    const keys = getApiKeys();
    try {
        const model = await getGeminiModel(index, modelName);
        return await fn(model);
    } catch (error: any) {
        console.warn(`API key ${index} for model ${modelName} failed, trying next...`, error.message);
        if (index + 1 < keys.length) {
            return await generateWithFallback(fn, index + 1, modelName);
        }
        throw error;
    }
}
