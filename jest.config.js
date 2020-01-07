module.exports = {
  preset: '',
  transformIgnorePatterns: ['/core-js/', '/@babel/runtime/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // collectCoverage: true,
  // coverageReporters: ['json', 'lcov', 'text', 'clover', 'html'],
  // collectCoverageFrom: ['src/**/*.[jt](s|sx)'],
  resetMocks: true,
  testRegex: '\\.(test|spec)\\.[jt](s|sx)?$',
  testEnvironment: 'node',
};
