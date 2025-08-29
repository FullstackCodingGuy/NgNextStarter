export const environment = {
  production: true,
  apiUrl: 'https://api.securities-app.com/api',
  appName: 'ngNextStarter',
  version: '1.0.0',
  features: {
    enableAdvancedReports: true,
    enableNotifications: true,
    enableAuditLog: true,
  enableBulkOperations: true,
  developerMode: false,
  enableBanking: false,
  bankingUseMock: false
  },
  security: {
    jwtSecretKey: '', // Set via environment variable in production
  localEncryptionKey: '', // Set via environment variable or build secret in production
    sessionTimeout: 1800000, // 30 minutes in milliseconds
    passwordMinLength: 8,
    passwordRequireSpecialChars: true,
    enableTwoFactorAuth: true
  },
  sanitizer: {
    enabled: false,
    whitelist: [],
    blacklist: ['file', 'attachment', 'imageData']
  },
  monitoring: {
    enableLogging: true,
    logLevel: 'error',
    enableAnalytics: true
  }
};