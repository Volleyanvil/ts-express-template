import path from 'path';
const rootDirector = path.resolve(__dirname);

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
      path.resolve(__dirname, 'node_modules', 'jest-html-reporter'),
      {
        pageTitle: 'Demo test Report',
        outputPath: 'test-report.html',
      },
    ],
  ],
  rootDir: rootDirector,
  roots: [rootDirector],
  setupFilesAfterEnv: [`${rootDirector}/test/setup.ts`],
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/build',
    `${rootDirector}/test/fixtures`,
    `${rootDirector}/test/setup.ts`,
  ],
  transform: {
    // Define filename patterns for testing frameworks
    '^.+\\.ts$': ['ts-jest',{
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    }],
  },
  testRegex: ['((/test/.*)|(\\.|/)(test|spec))\\.tsx?$'], // Define test file syntax
};
