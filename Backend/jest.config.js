const config = {
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.js',
    '<rootDir>/src/**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  moduleFileExtensions: ['js', 'json', 'node'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.{js}',
    '!src/**/*.config.js',
    '!src/server.js',
    '!src/app.js',
    '!src/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  testTimeout: 30000,
};

export default config;
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

