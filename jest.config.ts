import path from 'path';
const rootDirectory = path.resolve(__dirname);

export default {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageThreshold: {
    global: {
      // branches: 80,
      // function: 80,
      // lines: 80,
      // statements: 80,
      branches: 0,
      function: 0,
      lines: 0,
      statements: 0,
    },
  },
  moduleDirectories: ['node_modules'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    // Define module path aliases from tsconfig.json
    '@server(.*)$': `${rootDirectory}/src$1`,
    '@config(.*)$': `${rootDirectory}/src/config$1`,
    '@tests(.*)$': `${rootDirectory}/test$1`,
    '@routes(.*)$': `${rootDirectory}/src/routes$1`,
    '@controllers(.*)$': `${rootDirectory}/src/controllers$1`,
    '@middlewares(.*)$': `${rootDirectory}/src/middlewares$1`,
    '@models(.*)$': `${rootDirectory}/src/models$1`,
    '@services(.*)$': `${rootDirectory}/src/services$1`,
  },
  reporters: [
    'default',
    [
      path.resolve(__dirname, 'node_modules', 'jest-html-reporter'),
      {
        pageTitle: 'Unit test Report',
        outputPath: 'test-report.html',
      },
    ],
  ],
  rootDir: rootDirectory,
  roots: [rootDirectory],
  setupFilesAfterEnv: [`${rootDirectory}/test/setup.ts`],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules',
    '<rootDir>/build',
    '<rootDir>/coverage',
    '<rootDir>/jenkins',
    '<rootDir>/logs',
    `${rootDirectory}/test/fixtures`,
    `${rootDirectory}/test/setup.ts`,
  ],
  transform: {
    // Define filename patterns for testing frameworks
    '^.+\\.ts$': ['ts-jest',{
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    }],
  },
  testRegex: ['(/test/.*|(\\.|/))\\.(spec|test).tsx?$'], // Define test file syntax
};
