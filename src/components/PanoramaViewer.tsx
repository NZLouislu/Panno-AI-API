"use client";

import React, { useEffect, useRef, useState } from 'react';

interface PanoramaViewerProps {
    imageUrl: string;
    className?: string;
}

declare global {
    interface Window {
        pannellum: any;
    }
}

const PanoramaViewer: React.FC<PanoramaViewerProps> = ({ imageUrl, className }) => {
    const viewerRef = useRef<HTMLDivElement>(null);
    const pannellumInstance = useRef<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check if pannellum is loaded
        const initViewer = () => {
            if (!window.pannellum) {
                console.warn("Pannellum not loaded yet, retrying...");
                setTimeout(initViewer, 500);
                return;
            }

            if (viewerRef.current && imageUrl) {
                // Destroy existing instance if it exists
                if (pannellumInstance.current) {
                    try {
                        pannellumInstance.current.destroy();
                    } catch (e) {
                        console.warn("Error destroying pannellum instance:", e);
                    }
                }

                try {
                    // Initialize Pannellum
                    pannellumInstance.current = window.pannellum.viewer(viewerRef.current, {
                        type: 'equirectangular',
                        panorama: imageUrl,
                        autoLoad: true,
                        showControls: true,
                        compass: false, // Set to false by default for cleaner look
                        mouseZoom: true,
                        hfov: 100,
                        vaov: 180,
                        haov: 360,
                        crossOrigin: "anonymous"
                    });
                    setError(null);
                } catch (err: any) {
                    console.error("Pannellum initialization error:", err);
                    setError(err.message);
                }
            }
        };

        initViewer();

        return () => {
            if (pannellumInstance.current) {
                try {
                    pannellumInstance.current.destroy();
                } catch (e) { }
            }
        };
    }, [imageUrl]);

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-900 text-red-400 p-4 text-center">
                <p>Error loading viewer: {error}<br />Image might be too large or inaccessible.</p>
            </div>
        );
    }

    return (
        <div
            ref={viewerRef}
            className={`w-full h-full rounded-xl overflow-hidden shadow-2xl bg-black border border-slate-700 ${className || ''}`}
        />
    );
};

export default PanoramaViewer;
