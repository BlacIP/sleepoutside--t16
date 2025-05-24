export default {
  rootDir: './src',
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/test/**/*.test.js',
  ],
  moduleNameMapper: {
    // Handle CSS imports (if any in JS/MJS files)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // You might need to add more mappers if you import other static assets
    // For example, for image files:
    // '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/../__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.m?js$': 'babel-jest',
  },
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
};
