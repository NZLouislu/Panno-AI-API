const nextJest = require('next/jest')

const createJestConfig = nextJest({
    dir: './',
})

const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    collectCoverage: true,
    coverageThreshold: {
        global: {
            branches: 30,
            functions: 50,
            lines: 50,
            statements: 50,
        },
    },
    transformIgnorePatterns: [
        '/node_modules/(?!lucide-react)/'
    ],
}

module.exports = createJestConfig(customJestConfig)
