import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import os from "os";
import { GoogleGenerativeAI } from "@google/generative-ai";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
    const tempFiles: string[] = [];
    try {
        const formData = await req.formData();
        const prompt = formData.get("prompt") as string || "a photographic 360 panorama";
        const images = formData.getAll("images") as File[];

        // 1. Save uploaded images to temp directory
        const tempDir = path.join(os.tmpdir(), `panno-${Date.now()}`);
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

        for (let i = 0; i < images.length; i++) {
            const buffer = Buffer.from(await images[i].arrayBuffer());
            const fileName = path.join(tempDir, `img_${i}.png`);
            fs.writeFileSync(fileName, buffer);
            tempFiles.push(fileName);
        }

        // 2. Load Config & Keys
        const stabilityKey = process.env.Home_STABILITY_API_KEY || process.env.STABILITY_API_KEY;
        const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

        if (!stabilityKey) {
            throw new Error("Missing STABILITY_API_KEY in Environment Variables.");
        }

        let result = { image: null, method: "failed" };

        // --- CORE LOGIC: Direct Python Local Execution ---
        // Since we are in a unified Docker container on HF, we always run locally.
        try {
            const pythonScript = path.join(process.cwd(), "scripts", "processor.py");
            const imageArgs = tempFiles.map(img => `"${img}"`).join(" ");

            console.log("Unified Container: Executing specialized Python engine...");

            // Note: On HF Linux, command is 'python3'
            const { stdout } = await execAsync(`python3 "${pythonScript}" "${stabilityKey}" "${prompt.replace(/"/g, '\\"')}" ${imageArgs}`, {
                maxBuffer: 1024 * 1024 * 20,
                timeout: 120000 // 2 minute limit for heavy processing
            });

            const parsed = JSON.parse(stdout);
            if (parsed.success) {
                result = { image: parsed.image, method: "unified_hf_engine" };
            } else {
                throw new Error(parsed.error || "Stitching engine failed");
            }
        } catch (err: any) {
            console.warn("Local Engine Error, attempting Vision Fallback:", err.message);

            // --- FALLBACK: Pure AI Cloud (If Python fails) ---
            let visionPrompt = prompt;
            if (geminiKey && tempFiles.length > 0) {
                try {
                    const genAI = new GoogleGenerativeAI(geminiKey);
                    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
                    const visionResult = await model.generateContent([
                        "Describe room type and style in 10 words.",
                        { inlineData: { data: fs.readFileSync(tempFiles[0]).toString("base64"), mimeType: "image/png" } }
                    ]);
                    visionPrompt = `${prompt}. Style: ${visionResult.response.text()}`;
                } catch (e) { }
            }

            const aiFormData = new FormData();
            aiFormData.append("prompt", `${visionPrompt}, 360 panorama, rectilinear, high quality, seamless`);
            aiFormData.append("output_format", "webp");
            aiFormData.append("aspect_ratio", "21:9");

            const response = await fetch("https://api.stability.ai/v2beta/stable-image/generate/ultra", {
                method: "POST",
                headers: { "Authorization": `Bearer ${stabilityKey}`, "Accept": "application/json" },
                body: aiFormData
            });

            const data = await response.json();
            if (response.ok && data.image) {
                result = { image: `data:image/webp;base64,${data.image}`, method: "unified_pure_ai_fallback" };
            } else {
                throw new Error(data.message || "All methods failed");
            }
        }

        return NextResponse.json({
            url: result.image,
            success: true,
            method: result.method
        });

    } catch (error: any) {
        console.error("Unified Pipeline Error:", error.message);
        return NextResponse.json({
            success: false,
            message: error.message || "Process failed"
        }, { status: 500 });
    } finally {
        // Cleanup
        try {
            tempFiles.forEach(f => { if (fs.existsSync(f)) fs.unlinkSync(f); });
            const dir = path.dirname(tempFiles[0]);
            if (dir && fs.existsSync(dir)) fs.rmdirSync(dir);
        } catch (e) { }
    }
}
