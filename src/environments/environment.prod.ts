export const environment = {
  production: true,
  apiUrl: 'https://api.securities-app.com/api',
  appName: 'ngNextStarter',
  version: '1.0.0',
  features: {
    enableAdvancedReports: true,
    enableNotifications: true,
    enableAuditLog: true,
    enableBulkOperations: true
  },
  security: {
    jwtSecretKey: '', // Set via environment variable in production
    sessionTimeout: 1800000, // 30 minutes in milliseconds
    passwordMinLength: 8,
    passwordRequireSpecialChars: true,
    enableTwoFactorAuth: true
  },
  monitoring: {
    enableLogging: true,
    logLevel: 'error',
    enableAnalytics: true
  }
};