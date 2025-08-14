export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'ngNextStarter',
  version: '1.0.0',
  features: {
    enableAdvancedReports: true,
    enableNotifications: true,
    enableAuditLog: true,
  enableBulkOperations: true,
  developerMode: true,
  enableBanking: true,
  bankingUseMock: true
  },
  security: {
    jwtSecretKey: 'dev-secret-key-change-in-production',
  // Used to encrypt small bits of data locally (e.g., cached user profile)
  // In production, set this via environment variables or build-time replacement.
  localEncryptionKey: 'dev-local-encryption-key',
    sessionTimeout: 3600000, // 1 hour in milliseconds
    passwordMinLength: 8,
    passwordRequireSpecialChars: true,
    enableTwoFactorAuth: false
  },
  monitoring: {
    enableLogging: true,
    logLevel: 'debug',
    enableAnalytics: false
  }
};