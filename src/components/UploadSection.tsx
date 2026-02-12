"use client";

import { useState } from "react";
import { Upload, X, Image as ImageIcon, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadSectionProps {
    onGenerate: (prompt: string, images: File[]) => void;
    isGenerating: boolean;
}

export default function UploadSection({ onGenerate, isGenerating }: UploadSectionProps) {
    const [prompt, setPrompt] = useState("");
    const [files, setFiles] = useState<File[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="glass-card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    Upload Reference Photos
                </h3>

                <div
                    className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-white/5 transition-all cursor-pointer relative"
                    onClick={() => document.getElementById("fileInput")?.click()}
                >
                    <input
                        id="fileInput"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                        <Upload className="w-6 h-6 text-white/40" />
                    </div>
                    <div className="text-center">
                        <p className="font-medium">Click to browse or drag and drop</p>
                        <p className="text-sm text-white/30">(Supports multiple JPG/PNG photos)</p>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mt-4">
                    <AnimatePresence>
                        {files.map((file, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="relative aspect-square rounded-lg overflow-hidden group border border-white/10"
                            >
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                                    className="absolute top-1 right-1 p-1 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            <div className="glass-card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Generation Details
                </h3>

                <label className="text-xs uppercase tracking-wider text-white/40 mb-2 block">
                    Style / Description (Optional)
                </label>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A modern living room with warm sunset lighting and panoramic window views..."
                    className="w-full h-32 input-field resize-none mb-4"
                />

                <button
                    onClick={() => onGenerate(prompt, files)}
                    disabled={isGenerating || (!prompt && files.length === 0)}
                    className="w-full btn-primary py-4 flex items-center justify-center gap-2"
                >
                    {isGenerating ? (
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Generating...</span>
                        </div>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            <span>Create 360° Panorama</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
