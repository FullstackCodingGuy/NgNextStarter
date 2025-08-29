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
  sanitizer: {
    // When true, client will perform conservative HTML-escaping of string fields
    // in request bodies. Prefer to keep this OFF in production unless the
    // backend contract expects escaped values.
    enabled: true,
    // Whitelist of request body field names to sanitize. If empty, all string
    // fields will be escaped when sanitizer.enabled === true. Use caution.
    whitelist: ['comment', 'notes', 'description'],
    // Blacklist of fields to always skip (e.g., binary blobs, base64 content)
    blacklist: ['file', 'attachment', 'imageData']
  },
  monitoring: {
    enableLogging: true,
    logLevel: 'debug',
    enableAnalytics: false
  }
};