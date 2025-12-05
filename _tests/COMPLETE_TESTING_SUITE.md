# KVC WebApp - Complete Testing Suite

## 📋 Overview

This is a comprehensive testing guide for the KVC WebApp project. It includes unit tests, integration tests, and end-to-end tests covering all major features.

## 🎯 Project Status

✅ **COMPLETE** - All major features are implemented and tested.

### Feature Implementation Status

| Feature | Backend | Frontend | Tests | Status |
|---------|---------|----------|-------|--------|
| Authentication | ✅ | ✅ | ✅ | COMPLETE |
| Announcements | ✅ | ✅ | ✅ | COMPLETE |
| Assignments | ✅ | ✅ | ✅ | COMPLETE |
| Grades & Transcripts | ✅ | ✅ | ✅ | COMPLETE |
| Attendance | ✅ | ✅ | ✅ | COMPLETE |
| Schedule | ✅ | ✅ | ✅ | COMPLETE |
| Exam Management | ✅ | ✅ | ✅ | COMPLETE |
| Course Materials | ✅ | ✅ | ✅ | COMPLETE |
| Advisor Management | ✅ | ✅ | ✅ | COMPLETE |
| Course Registration | ✅ | ✅ | ✅ | COMPLETE |
| Clubs & Activities | ✅ | ✅ | ✅ | COMPLETE |
| User Settings | ✅ | ✅ | ✅ | COMPLETE |
| Chat/Messaging | ✅ | ✅ | ✅ | COMPLETE |
| Export (PDF/CSV) | ✅ | ✅ | ✅ | COMPLETE |

---

## 🚀 Quick Start

### 1. Prerequisites

```bash
# Node.js v18+ and npm v9+
node --version   # v18.0.0+
npm --version    # v9.0.0+

# PostgreSQL (local or cloud)
# Check: psql --version
```

### 2. Environment Setup

**Backend `.env`** (`backend/.env`):
```env
PORT=4001
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/kvcdb"
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
OPENAI_API_KEY=sk-your-api-key
```

**Frontend `.env`** (`frontend/.env`):
```env
VITE_API_BASE=http://localhost:4001/api
```

### 3. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 4. Database Setup

```bash
# Create database
createdb kvcdb

# Run migrations
cd backend
npx prisma migrate dev
```

### 5. Start Development Servers

**Option A: Run separately**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Option B: Run both together (Windows)**
```powershell
.\START_DEV.ps1
# Then select option 3
```

### 6. Access the App

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4001/api
- **API Documentation**: http://localhost:4001/api/docs

---

## 🧪 Testing Guide

### Unit Tests

**Backend Unit Tests** - Test individual controller/service methods

```bash
cd backend

# Run all unit tests
npm test

# Run specific test file
npm test -- tests/unit/controllers/announcement.test.js

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

**Frontend Unit Tests** - Test React components and utilities

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Integration Tests

**API Integration Tests** - Test API endpoints with real database

```bash
cd backend

# Run integration tests
npm run test:integration

# Specific integration suite
npm test -- tests/integration/integration.test.js
```

What gets tested:
- ✅ Authentication flows
- ✅ Announcement CRUD operations
- ✅ Class management
- ✅ Grade retrieval
- ✅ Attendance tracking
- ✅ Error handling
- ✅ Rate limiting

### End-to-End Tests

**Frontend E2E Tests** - Test complete user workflows

```bash
cd frontend

# Install Playwright (one time)
npm install --save-dev @playwright/test

# Run E2E tests
npx playwright test

# Run in UI mode (visual)
npx playwright test --ui

# Run specific test file
npx playwright test tests/e2e/e2e.spec.js

# Debug mode
npx playwright test --debug
```

What gets tested:
- ✅ Student login and workflows
- ✅ Teacher announcement creation
- ✅ Grade viewing
- ✅ Schedule management
- ✅ Club joining
- ✅ Profile updates
- ✅ Navigation
- ✅ Error handling
- ✅ Performance (load times)
- ✅ Accessibility

---

## 📊 Test Coverage

### Backend Coverage Goals

```
Controllers:    90%+
Services:       85%+
Routes:         80%+
Overall:        85%+
```

Generate coverage report:
```bash
npm test -- --coverage
```

### Frontend Coverage Goals

```
Components:     80%+
Hooks:          85%+
Services:       90%+
Overall:        80%+
```

---

## 🧬 Test Structure

### Backend Tests

```
backend/tests/
├── unit/
│   ├── controllers/          # Controller method tests
│   │   ├── announcement.test.js
│   │   ├── assignment.test.js
│   │   ├── grade.test.js
│   │   ├── attendance.test.js
│   │   ├── export.test.js
│   │   └── ...
│   ├── services/            # Service logic tests
│   ├── middleware/          # Middleware tests
│   └── utils/               # Utility function tests
└── integration/
    ├── integration.test.js   # API endpoint tests
    ├── auth.test.js         # Auth flow tests
    └── workflows.test.js    # Complete workflows
```

### Frontend Tests

```
frontend/tests/
├── unit/
│   ├── components/          # React component tests
│   ├── hooks/              # Custom hooks tests
│   ├── services/           # API service tests
│   └── utils/              # Utility function tests
├── integration/
│   └── page-flows.test.js   # Multi-component flows
└── e2e/
    └── e2e.spec.js         # Complete user workflows
```

---

## 🔍 Running Specific Tests

### By Feature

```bash
# Announcements
cd backend
npm test -- announcement.test.js

# Grades
npm test -- grade.test.js

# Attendance
npm test -- attendance.test.js

# Export
npm test -- export.test.js
```

### By Test Type

```bash
# Only unit tests
npm test -- tests/unit

# Only integration tests
npm test -- tests/integration

# Only E2E tests (frontend)
cd frontend
npx playwright test
```

### By Status

```bash
# Run only failing tests
npm test -- --bail

# Run only matching test names
npm test -- --testNamePattern="should create announcement"

# Show test descriptions
npm test -- --verbose
```

---

## 📈 Performance Testing

### Backend Performance

```bash
# Generate load test
npx artillery quick -d 60 -r 10 http://localhost:4001/api/classes

# Or use provided script
node _scripts/load-test.js
```

### Frontend Performance

```bash
# Run Lighthouse audit
npx lighthouse http://localhost:5173 --view

# Check bundle size
cd frontend
npm run analyze
```

---

## 🐛 Debugging Tests

### Backend

```bash
# Debug mode with inspector
node --inspect-brk node_modules/.bin/jest

# Or use VS Code debugger (launch.json configured)
# Just press F5
```

### Frontend

```bash
# Debug with browser devtools
npx playwright test --debug

# Or run with VS Code debugger
# Press F5 with playwright configuration
```

---

## ✅ Pre-Commit Testing

Before committing, run this:

```bash
# Backend
cd backend
npm run test      # Run tests
npm run lint      # Run ESLint
npm run format    # Format code

# Frontend
cd frontend
npm run test      # Run tests
npm run lint      # Run ESLint
npm run format    # Format code
```

Or use the provided pre-commit script:

```bash
./.github/hooks/pre-commit
```

---

## 📱 Mobile Testing

### Responsive Design Tests

```bash
# Frontend E2E tests include responsive checks
cd frontend

# Run mobile specific tests
npx playwright test --grep "mobile"

# Test specific breakpoint
npx playwright test --grep "tablet|mobile"
```

Breakpoints tested:
- Mobile: 375px (iPhone)
- Tablet: 768px (iPad)
- Desktop: 1920px (Full screen)

---

## 🔐 Security Testing

### OWASP Top 10 Coverage

Tests include checks for:
- ✅ SQL Injection
- ✅ XSS (Cross-Site Scripting)
- ✅ CSRF (Cross-Site Request Forgery)
- ✅ Authentication flaws
- ✅ Sensitive data exposure
- ✅ XML External Entities (XXE)
- ✅ Broken access control

Run security tests:
```bash
npm run test:security
```

---

## 🚢 CI/CD Pipeline

### GitHub Actions

Tests run automatically on:
- ✅ Push to main
- ✅ Pull requests
- ✅ Scheduled daily

View pipeline: `.github/workflows/`

```bash
# Run locally as GitHub Actions would
act -j test-backend
act -j test-frontend
act -j test-e2e
```

---

## 📊 Test Reports

### Generate Reports

```bash
# Backend coverage report
cd backend
npm test -- --coverage
# HTML report: coverage/index.html

# JUnit XML report (for CI/CD)
npm test -- --reporters=default --reporters=jest-junit

# Frontend coverage
cd frontend
npm test -- --coverage
```

---

## 🤝 Contributing Tests

### Adding New Tests

1. **Unit Test** (test a single function)
```javascript
describe('MyFunction', () => {
  test('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = myFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

2. **Integration Test** (test multiple components together)
```javascript
describe('Feature Flow', () => {
  test('should complete user flow', async () => {
    // Setup
    const res1 = await api.post('/endpoint1');
    const res2 = await api.post('/endpoint2', res1.data);
    
    // Assert
    expect(res2.status).toBe(200);
  });
});
```

3. **E2E Test** (test full user workflow)
```javascript
test('should complete workflow', async ({ page }) => {
  // Navigate
  await page.goto('http://localhost:5173');
  
  // Interact
  await page.click('button');
  
  // Assert
  await expect(page.locator('success-message')).toBeVisible();
});
```

---

## 🎓 Test Examples by Feature

### Testing Announcements

```javascript
// Unit test - controller method
test('should create announcement', () => {
  const controller = require('announcement.controller');
  const res = { json: jest.fn() };
  controller.create(req, res);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ title }));
});

// Integration test - full API
test('POST /api/announcements should create', async () => {
  const res = await request(app)
    .post('/api/announcements')
    .send({ title, content });
  expect(res.status).toBe(201);
});

// E2E test - user workflow
test('teacher can create announcement', async ({ page }) => {
  await page.click('button:has-text("Post")');
  await page.fill('input[name="title"]', 'Test');
  await page.click('button:has-text("Submit")');
  await expect(page.locator('success')).toBeVisible();
});
```

---

## 🔧 Troubleshooting

### Issue: "Cannot connect to database"
```bash
# Check if PostgreSQL is running
psql -c "SELECT 1"

# Create database if missing
createdb kvcdb

# Reset migrations
npx prisma migrate reset
```

### Issue: "Port 5173 already in use"
```powershell
# Kill process using port
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use different port
VITE_PORT=5174 npm run dev
```

### Issue: "Tests timing out"
```bash
# Increase timeout
npm test -- --testTimeout=20000

# Check if services are running
curl http://localhost:4001/api/health
```

### Issue: "Tests failing in CI but passing locally"
```bash
# Clear cache
npm test -- --clearCache

# Run with debug output
DEBUG=* npm test
```

---

## 📚 Resources

- **Jest Documentation**: https://jestjs.io/
- **Playwright Documentation**: https://playwright.dev/
- **React Testing Library**: https://testing-library.com/react
- **Supertest**: https://github.com/visionmedia/supertest

---

## 📞 Support

For issues or questions:
1. Check test output for specific error messages
2. Review test logs: `npm test -- --verbose`
3. Check GitHub Issues
4. Contact development team

---

## 🎉 Success Criteria

All tests pass when:
- ✅ Unit tests: 100% pass rate
- ✅ Integration tests: 100% pass rate
- ✅ E2E tests: 100% pass rate
- ✅ Code coverage: >80% overall
- ✅ No console errors or warnings
- ✅ All features work as documented

**Ready for production deployment!** 🚀

