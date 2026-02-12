import { generateWithFallback } from "@/lib/gemini";
import { GoogleGenerativeAI } from "@google/generative-ai";

jest.mock("@google/generative-ai");

describe("Gemini API Fallback", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.GEMINI_API_KEY = "key1";
        process.env.GEMINI_API_KEY_SECONDARY = "key2";

        // Suppress console warnings in tests
        jest.spyOn(console, 'warn').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should use the first key if successful", async () => {
        const mockGenerateContent = jest.fn().mockResolvedValue({
            response: { text: () => "Success" }
        });

        (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
            getGenerativeModel: () => ({
                generateContent: mockGenerateContent,
            }),
        }));

        const result = await generateWithFallback(async (model) => {
            return await model.generateContent("test");
        });

        expect(result.response.text()).toBe("Success");
        expect(GoogleGenerativeAI).toHaveBeenCalledTimes(1);
        expect(GoogleGenerativeAI).toHaveBeenCalledWith("key1");
    });

    it("should fallback to second key if first fails", async () => {
        const mockGenerateContent = jest.fn()
            .mockRejectedValueOnce(new Error("Quota exceeded"))
            .mockResolvedValueOnce({ response: { text: () => "Success 2" } });

        (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
            getGenerativeModel: () => ({
                generateContent: mockGenerateContent,
            }),
        }));

        const result = await generateWithFallback(async (model) => {
            return await model.generateContent("test");
        });

        expect(result.response.text()).toBe("Success 2");
        expect(GoogleGenerativeAI).toHaveBeenCalledTimes(2);
        expect(GoogleGenerativeAI).toHaveBeenNthCalledWith(1, "key1");
        expect(GoogleGenerativeAI).toHaveBeenNthCalledWith(2, "key2");
    });

    it("should throw error when all keys exhausted", async () => {
        const mockGenerateContent = jest.fn()
            .mockRejectedValue(new Error("Quota exceeded"));

        (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
            getGenerativeModel: () => ({
                generateContent: mockGenerateContent,
            }),
        }));

        await expect(generateWithFallback(async (model) => {
            return await model.generateContent("test");
        })).rejects.toThrow("Quota exceeded");

        expect(GoogleGenerativeAI).toHaveBeenCalledTimes(2);
    });
});
