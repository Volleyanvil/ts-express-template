import path from 'path';
const rootDirector = path.join(__dirname, '..');

export default {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageThreshold: {
    global: {
      branches: 80,
      function: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleDirectories: ['node_modules'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '@server(.*)$': `${rootDirector}/src$1`,
    '@config(.*)$': `${rootDirector}/src/config$1`,
    '@tests(.*)$': `${rootDirector}/test$1`,
    '@routes(.*)$': `${rootDirector}/src/routes$1`,
    '@controllers(.*)$': `${rootDirector}/src/controllers$1`,
    '@middlewares(.*)$': `${rootDirector}/src/middlewares$1`,
    '@models(.*)$': `${rootDirector}/src/models$1`,
    '@services(.*)$': `${rootDirector}/src/services$1`,
  },
  reporters: [
    'default',
    [
      path.resolve(`${rootDirector}`, 'node_modules', 'jest-html-reporter'),
      {
        pageTitle: 'E2E test Report',
        outputPath: 'test-e2e-report.html',
      },
    ],
  ],
  rootDir: rootDirector,
  setupFilesAfterEnv: [`${rootDirector}/test/setup.ts`],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules',
    '<rootDir>/build',
    '<rootDir>/coverage',
    '<rootDir>/jenkins',
    '<rootDir>/logs',
    '<rootDir>/test/fixtures',
    '<rootDir>/test/setup.ts',
  ],
  transform: {
    // Define filename patterns for testing frameworks
    '^.+\\.ts$': ['ts-jest',{
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    }],
  },
  testRegex: ['(/test/.*|(\\.|/))\\.e2e-(spec|test).tsx?$'], // Define test file syntax
};
