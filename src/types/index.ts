export interface Panorama {
    id: string;
    url: string;
    prompt: string;
    timestamp: Date;
}

export interface UserSession {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        id?: string;
    };
}
