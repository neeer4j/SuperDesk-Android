module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@gluestack-ui|lucide-react-native|react-native-reanimated|react-native-gesture-handler)/)'
  ],
};
