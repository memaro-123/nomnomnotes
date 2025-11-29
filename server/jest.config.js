module.exports = {
  testEnvironment: 'node',
  // Don't run tests in node_modules
  testPathIgnorePatterns: ['/node_modules/'],
  // Setup files if needed
  setupFilesAfterEnv: [],
  // Force exit after tests
  forceExit: true,
  // Detect open handles
  detectOpenHandles: true,
  // Clear mocks between tests
  clearMocks: true,
  // Reset modules between tests
  resetModules: true,
  // Restore mocks between tests
  restoreMocks: true,
};