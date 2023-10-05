import path from 'path';
const rootDirector = path.resolve(__dirname);

export default {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageThreshold: {
    global: {
      branches: 50,
      function: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleDirectories: ['node_modules'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    // Define module path aliases from tsconfig.json
    '@server(.*)$': `${rootDirector}/src$1`,
    '@config(.*)$': `${rootDirector}/src/config$1`,
    '@tests(.*)$': `${rootDirector}/tests$1`,
    '@domain(.*)$': `${rootDirector}/src/domain$1`,
    '@controller(.*)$': `${rootDirector}/src/controller$1`,
    '@middleware(.*)$': `${rootDirector}/src/middleware$1`,
  },
  reporters: [
    'default',
    [
      path.resolve(__dirname, 'node_modules', 'jest-html-reporter'),
      {
        pageTitle: 'Demo test Report',
        outputPath: 'test-report.html',
      },
    ],
  ],
  rootDir: rootDirector,
  roots: [rootDirector],
  setupFilesAfterEnv: [`${rootDirector}/tests/setup.ts`],
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/build',
    `${rootDirector}/tests/fixtures`,
    `${rootDirector}/tests/setup.ts`,
  ],
  transform: {
    // Define filename patterns for testing frameworks
    '^.+\\.ts$': ['ts-jest',{
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    }],
  },
  testRegex: ['((/tests/.*)|(\\.|/)(test|spec))\\.tsx?$'], // Define test file syntax
};
