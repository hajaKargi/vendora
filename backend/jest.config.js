module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
    testMatch: [
      '**/tests/**/*.test.ts',
      '**/?(*.)+(spec|test).ts'
    ],
    transformIgnorePatterns: ['<rootDir>/node_modules/'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1'
    }
  };