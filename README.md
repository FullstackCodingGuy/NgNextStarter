# Securities Position Keeping System

A comprehensive Angular 20 application for managing securities portfolios with enterprise-level security, OWASP compliance, and modern best practices.

## 🚀 Features

### Core Features
- **Authentication & Authorization**: JWT-based authentication with role-based access control (RBAC)
- **Dashboard**: Real-time portfolio overview with performance metrics and sector allocation
- **Securities Management**: CRUD operations for managing securities positions
- **User Management**: Admin interface for managing users and roles
- **Responsive Design**: Mobile-first design using Angular Material

### Security Features
- **OWASP Compliance**: Implements OWASP security guidelines
- **Input Validation**: Client and server-side validation with sanitization
- **XSS Protection**: Content Security Policy and input sanitization
- **CSRF Protection**: Anti-forgery tokens and secure headers
- **Secure Authentication**: Strong password requirements, JWT tokens
- **Role-Based Access**: Fine-grained permissions system

### Technical Features
- **Modern Angular 20**: Latest Angular features and standalone components
- **Material Design**: Professional UI with Angular Material
- **Enterprise Architecture**: Scalable folder structure with core/shared/features
- **State Management**: Observable patterns with RxJS
- **Lazy Loading**: Route-based code splitting for performance
- **TypeScript**: Type-safe development with strict mode

## 🏗️ Architecture

```
src/
├── app/
│   ├── core/                 # Core services, guards, interceptors
│   │   ├── guards/          # Authentication and authorization guards
│   │   ├── interceptors/    # HTTP interceptors for security headers
│   │   ├── models/          # TypeScript interfaces and types
│   │   └── services/        # Core business services
│   ├── shared/              # Reusable components and modules
│   │   ├── components/      # Shared UI components
│   │   └── modules/         # Shared feature modules
│   ├── features/            # Feature modules (lazy-loaded)
│   │   ├── auth/           # Authentication (login/register)
│   │   ├── dashboard/      # Main dashboard
│   │   ├── securities/     # Securities management
│   │   └── users/          # User management
│   └── layouts/            # Application layouts
│       ├── auth-layout/    # Layout for authentication pages
│       └── main-layout/    # Main application layout
└── environments/          # Environment configurations
```

## 🛡️ Security Implementation

### OWASP Top 10 Protection
1. **Injection**: Input validation and parameterized queries
2. **Broken Authentication**: Strong password policies, JWT tokens
3. **Sensitive Data Exposure**: Encrypted storage, HTTPS only
4. **XML External Entities**: Input sanitization
5. **Broken Access Control**: Role-based permissions
6. **Security Misconfiguration**: Security headers, CSP
7. **Cross-Site Scripting**: Input sanitization, output encoding
8. **Insecure Deserialization**: Safe JSON parsing
9. **Components with Vulnerabilities**: Regular dependency updates
10. **Insufficient Logging**: Comprehensive audit trail

### Security Headers
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security

## 🚦 Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher
- Angular CLI 20.x

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/FullstackCodingGuy/NgNextStarter.git
   cd NgNextStarter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   ng serve
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

### Demo Credentials
- **Email**: admin@securities.com
- **Password**: Admin123!

## 🔧 Available Scripts

```bash
# Development server
ng serve

# Build for production
ng build --configuration production

# Run unit tests
ng test

# Run end-to-end tests
ng e2e

# Code linting
ng lint

# Code formatting
npm run format
```

## 📱 User Interface

### Login Page
- Secure authentication form
- Password visibility toggle
- Form validation with real-time feedback
- Demo credentials for testing

### Dashboard
- Portfolio value overview with gain/loss indicators
- Top performing securities table
- Sector allocation visualization
- Quick action buttons

### Navigation
- Responsive sidebar navigation
- User menu with profile/settings/logout
- Role-based menu items
- Professional toolbar design

## 🎨 Design System

- **Color Palette**: Material Design color scheme
- **Typography**: Roboto font family
- **Components**: Angular Material components
- **Responsive**: Mobile-first responsive design
- **Accessibility**: WCAG 2.1 AA compliant

## 🔐 Authentication & Authorization

### User Roles
- **Admin**: Full system access
- **Manager**: Portfolio and user management
- **Analyst**: Read/write access to securities
- **Viewer**: Read-only access

### Authentication Flow
1. User submits credentials
2. Server validates and returns JWT token
3. Token stored securely in localStorage (encrypted)
4. Token included in all API requests
5. Auto-logout on token expiration

## 📊 Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Security Position
```typescript
interface SecurityPosition {
  id: string;
  securityId: string;
  securityName: string;
  securityType: SecurityType;
  quantity: number;
  marketValue: number;
  bookValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  portfolioId: string;
  // ... additional fields
}
```

## 🌐 Environment Configuration

### Development
- Local API endpoints
- Debug logging enabled
- Extended session timeout
- Development-friendly settings

### Production
- Secure API endpoints
- Error-only logging
- Short session timeout
- Two-factor authentication enabled

## 🧪 Testing Strategy

### Unit Tests
- Component testing with Angular Testing Utilities
- Service testing with dependency injection
- Guard and interceptor testing
- Model validation testing

### E2E Tests
- User authentication flows
- Navigation and routing
- Form submissions
- Data display and interactions

### Security Testing
- Input validation testing
- Authentication bypass attempts
- Authorization boundary testing
- XSS and injection testing

## 📈 Performance Optimizations

- **Lazy Loading**: Feature modules loaded on demand
- **OnPush Change Detection**: Optimized change detection strategy
- **Tree Shaking**: Unused code elimination
- **Bundle Optimization**: Webpack optimizations
- **Image Optimization**: Responsive images and lazy loading

## 🔧 Development Guidelines

### Code Style
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Consistent naming conventions

### Component Architecture
- Standalone components where possible
- Single responsibility principle
- Reusable component design
- Proper input/output handling

### Service Layer
- Injectable services with proper DI
- Observable-based data flow
- Error handling strategies
- Caching where appropriate

## 🚀 Deployment

### Build for Production
```bash
ng build --configuration production
```

### Docker Deployment
```dockerfile
FROM nginx:alpine
COPY dist/securities-app /usr/share/nginx/html
EXPOSE 80
```

### Environment Variables
```bash
API_URL=https://api.securities-app.com
JWT_SECRET=your-secret-key
SESSION_TIMEOUT=1800000
```

## 📚 Additional Resources

- [Angular Documentation](https://angular.dev)
- [Angular Material](https://material.angular.io)
- [OWASP Security Guidelines](https://owasp.org)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Review the documentation and examples

---

**Built with ❤️ using Angular 20 and modern web technologies**
