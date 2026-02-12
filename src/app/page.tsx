"use client";

import { useState, useEffect, Suspense } from "react";
import Navbar from "@/components/Navbar";
import UploadSection from "@/components/UploadSection";
import dynamic from "next/dynamic";
const PanoramaViewer = dynamic(() => import("@/components/PanoramaViewer"), { ssr: false });
import { History as HistoryIcon, Maximize2, Download, Share2, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Panorama {
    id: string;
    url: string;
    prompt: string;
    timestamp: Date;
}

export default function Home() {
    const [currentPano, setCurrentPano] = useState<Panorama | null>(null);
    const [history, setHistory] = useState<Panorama[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("pano-history");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    // Only keep local or known stable URLs
                    const filtered = parsed.filter(item =>
                        item.url && (
                            item.url.startsWith("/") ||
                            item.url.startsWith("data:") ||
                            item.url.includes("threejs.org") ||
                            item.url.includes("polyhaven.org")
                        )
                    );
                    setHistory(filtered);
                    if (filtered.length > 0) setCurrentPano(filtered[0]);
                }
            } catch (e) {
                console.error("Failed to load history");
            }
        }
    }, []);

    useEffect(() => {
        if (history.length > 0) {
            try {
                // Limit history to last 10 items to save LocalStorage space
                const limitedHistory = history.slice(0, 10);
                localStorage.setItem("pano-history", JSON.stringify(limitedHistory));
            } catch (e) {
                console.warn("Storage quota exceeded, history not fully saved");
                // If quota exceeded, try saving fewer items
                try {
                    localStorage.setItem("pano-history", JSON.stringify(history.slice(0, 3)));
                } catch (innerError) {
                    console.error("Critical storage failure:", innerError);
                }
            }
        }
    }, [history]);

    const handleGenerate = async (prompt: string, images: File[]) => {
        setIsGenerating(true);

        try {
            const formData = new FormData();
            formData.append("prompt", prompt);
            images.forEach(img => formData.append("images", img));

            const response = await fetch("/api/generate", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to generate panorama");
            }

            const newPano = {
                id: Math.random().toString(36).substr(2, 9),
                url: result.url,
                prompt: prompt || "Generated from photos",
                timestamp: new Date(),
            };

            setCurrentPano(newPano);
            setHistory(prev => [newPano, ...prev]);
        } catch (error: any) {
            console.error("Generate error:", error);
            alert(`Generation Error: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col">
            <Navbar />

            <div className="flex-1 container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side - Controls */}
                <div className="lg:col-span-4 xl:col-span-3">
                    <UploadSection onGenerate={handleGenerate} isGenerating={isGenerating} />
                </div>

                {/* Right Side - Viewer / Gallery */}
                <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
                    <div className="glass-card flex-1 min-h-[500px] flex flex-col p-4">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Maximize2 className="w-5 h-5 text-primary" />
                                Immersive View
                            </h3>
                            {currentPano && (
                                <div className="flex gap-2">
                                    <button className="p-2 glass hover:bg-white/10 rounded-lg transition-colors border-white/5">
                                        <Download className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 glass hover:bg-white/10 rounded-lg transition-colors border-white/5">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 relative min-h-[400px]">
                            <AnimatePresence mode="wait">
                                {currentPano ? (
                                    <motion.div
                                        key={currentPano.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.05 }}
                                        className="w-full h-full absolute inset-0"
                                    >
                                        <Suspense fallback={<div className="w-full h-full bg-slate-900 animate-pulse" />}>
                                            <PanoramaViewer imageUrl={currentPano.url} />
                                        </Suspense>
                                    </motion.div>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-4 glass rounded-2xl border-white/5 border-dashed border-2">
                                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center animate-pulse">
                                            <Layers className="w-10 h-10" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xl font-semibold">No panoramas yet</p>
                                            <p className="text-sm">Upload some photos and start generating your first immersive 360° view.</p>
                                        </div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Gallery Section */}
                    <div className="glass-card">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <HistoryIcon className="w-5 h-5 text-primary" />
                                Your Gallery
                            </h3>
                            <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-white/40">
                                {history.length} Creations
                            </span>
                        </div>

                        {history.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {history.map((pano) => (
                                    <button
                                        key={pano.id}
                                        onClick={() => setCurrentPano(pano)}
                                        className={`group relative aspect-video rounded-xl overflow-hidden border transition-all ${currentPano?.id === pano.id ? 'border-primary ring-2 ring-primary/50' : 'border-white/10 hover:border-white/30'
                                            }`}
                                    >
                                        <img src={pano.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Maximize2 className="w-6 h-6" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-white/10 gap-2">
                                <HistoryIcon className="w-8 h-8" />
                                <p>No history available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <footer className="mt-auto py-8 text-center text-white/30 text-sm border-t border-white/5 glass">
                <p>© 2024 PanoAI Scene Engine • Powered by Gemini Vision</p>
            </footer>
        </main>
    );
}
