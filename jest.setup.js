import '@testing-library/jest-dom'

// Mock global URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url')

// Mock ResizeObserver
global.ResizeObserver = class {
    observe() { }
    unobserve() { }
    disconnect() { }
}

// Mock next/image
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img {...props} alt={props.alt} />
    },
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => {
    return new Proxy({}, {
        get: (target, prop) => {
            const Icon = (props) => <div data-testid={`icon-${String(prop)}`} {...props} />
            Icon.displayName = String(prop)
            return Icon
        }
    })
})

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
}))
// Mock global fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, url: 'mock-url' }),
    })
);
