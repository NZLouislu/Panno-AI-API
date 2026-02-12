import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "PanoAI - 360° Scene Creator",
    description: "Generate immersive 360-degree panoramas from photos or text using AI.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link
                    rel="stylesheet"
                    href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"
                />
                <script
                    src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"
                    async
                ></script>
            </head>
            <body className={`${inter.className} min-h-screen antialiased`} suppressHydrationWarning>
                <AuthProvider>

                    <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900 to-black overflow-hidden">
                        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full animate-glow opacity-30" />
                        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/20 blur-[120px] rounded-full animate-glow opacity-30 delay-1000" />
                    </div>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
