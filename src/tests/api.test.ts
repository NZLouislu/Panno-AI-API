import { POST } from '@/app/api/generate/route'
import { exec } from 'child_process'
import fs from 'fs'

// Mock next/server
jest.mock('next/server', () => ({
    NextResponse: {
        json: (body: any, init?: any) => ({
            json: async () => body,
            status: init?.status || 200,
        }),
    },
}))

// Mock child_process
jest.mock('child_process', () => ({
    exec: jest.fn(),
}))

// Mock fs and os
jest.mock('fs', () => ({
    existsSync: jest.fn().mockReturnValue(true),
    mkdirSync: jest.fn(),
    writeFileSync: jest.fn(),
    unlinkSync: jest.fn(),
    rmdirSync: jest.fn(),
}))

jest.mock('os', () => ({
    tmpdir: () => '/tmp',
}))

const createMockRequest = (body: any) => ({
    formData: async () => {
        const data = new Map();
        Object.keys(body).forEach(key => {
            if (Array.isArray(body[key])) {
                data.set(key, body[key]);
            } else {
                data.set(key, body[key]);
            }
        });
        return {
            get: (key: string) => body[key],
            getAll: (key: string) => Array.isArray(body[key]) ? body[key] : [body[key]],
        };
    },
}) as any

describe('Generate API (Hybrid Pipeline)', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        process.env.STABILITY_API_KEY = 'test-key'
        jest.spyOn(console, 'error').mockImplementation(() => { })
        jest.spyOn(console, 'log').mockImplementation(() => { })
    })

    it('returns success for valid request via hybrid pipeline', async () => {
        const mockImage = new File(['test'], 'test.png', { type: 'image/png' })
        const req = createMockRequest({
            prompt: 'test prompt',
            images: [mockImage]
        })

        const mockStdout = JSON.stringify({
            success: true,
            image: 'data:image/png;base64,mockdata'
        });

        (exec as unknown as jest.Mock).mockImplementation((cmd, options, callback) => {
            const cb = typeof options === 'function' ? options : callback;
            process.nextTick(() => cb(null, mockStdout, ''));
        })

        const response = await POST(req)
        const json = await response.json()

        expect(response.status).toBe(200)
        expect(json.success).toBe(true)
        // Check if images were "saved" (our mock should have triggered fs.writeFileSync)
        expect(fs.writeFileSync).toHaveBeenCalled()
        expect(json.method).toBe('cv_ai_hybrid')
    })

    it('returns 500 on pipeline failure', async () => {
        const mockImage = new File(['test'], 'test.png', { type: 'image/png' })
        const req = createMockRequest({
            prompt: 'fail',
            images: [mockImage]
        })

        const mockError = JSON.stringify({
            success: false,
            error: 'AI Error'
        });

        (exec as unknown as jest.Mock).mockImplementation((cmd, options, callback) => {
            const cb = typeof options === 'function' ? options : callback;
            cb(null, mockError, '')
        })

        const response = await POST(req)
        const json = await response.json()

        expect(response.status).toBe(500)
        expect(json.message).toBe('AI Error')
    })
})
