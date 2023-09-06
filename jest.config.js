module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/test/**/*.test.ts"],
    testPathIgnorePatterns: ["/node_modules/", "/dist/", "src/prisma/reflect/*", "src/prisma/types/*"],
    collectCoverage: true,
    collectCoverageFrom: ["src/**/*.ts", "!src/prisma/reflect/**", "!src/prisma/types/**", "!src/@types/**"],
    coverageDirectory: "coverage",
    coverageReporters: ["json", "lcov", "text", "clover", "html"],
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
};
  