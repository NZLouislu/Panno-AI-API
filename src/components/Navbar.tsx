"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { LogIn, LogOut, User, Camera, Github, Rocket, History, Download, Share2 } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="flex items-center justify-between px-6 py-4 glass border-b border-white/10 sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-tr from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Camera className="text-white w-6 h-6" />
                </div>
                <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                    PanoAI
                </span>
            </div>

            <div className="hidden md:flex items-center gap-6">
                <button className="text-white/60 hover:text-white transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                </button>
                <button className="text-white/60 hover:text-white transition-colors flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                </button>
                <button className="text-white/60 hover:text-white transition-colors flex items-center gap-2">
                    <History className="w-4 h-4" />
                    <span>History</span>
                </button>
            </div>

            <div className="flex items-center gap-4">
                {session ? (
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-white">{session.user?.name}</p>
                            <p className="text-xs text-white/50">{session.user?.email}</p>
                        </div>
                        {session.user?.image ? (
                            <Image
                                src={session.user.image}
                                alt="Profile"
                                width={36}
                                height={36}
                                className="rounded-full border border-white/20"
                            />
                        ) : (
                            <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white/60" />
                            </div>
                        )}
                        <button
                            onClick={() => signOut()}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => signIn("google")}
                        className="btn-primary flex items-center gap-2"
                    >
                        <LogIn className="w-4 h-4" />
                        <span>Sign In</span>
                    </button>
                )}
            </div>
        </nav>
    );
}
