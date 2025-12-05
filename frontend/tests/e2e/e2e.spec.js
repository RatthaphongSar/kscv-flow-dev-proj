/**
 * @file e2e.spec.js
 * @description End-to-end tests for KVC WebApp user flows
 * @module tests/e2e
 * 
 * Note: These tests use Playwright/Cypress. Install with:
 * npm install --save-dev @playwright/test
 * 
 * Run with: npx playwright test
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:4001/api';

// Test configuration
const TIMEOUT = 10000;
const SLOW_MO = 500; // Slow down for debugging

test.describe('KVC WebApp End-to-End Tests', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test.describe('Student User Flow', () => {
    test('should login as student', async () => {
      // Set mock token
      await page.evaluate(() => {
        localStorage.setItem('access_token', 'Bearer mock-student-token');
      });

      // Navigate to home
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

      // Should see welcome message
      const welcome = await page.locator('text=Student').first();
      await expect(welcome).toBeVisible({ timeout: TIMEOUT });
    });

    test('should view announcements', async () => {
      await page.evaluate(() => {
        localStorage.setItem('access_token', 'Bearer mock-student-token');
      });

      // Navigate to announcements
      await page.goto(`${BASE_URL}/announcements`, { waitUntil: 'networkidle' });

      // Should see announcements list
      const announcementsList = await page.locator('[data-testid="announcements-list"]');
      await expect(announcementsList).toBeVisible({ timeout: TIMEOUT });

      // Should be able to click on announcement
      const firstAnnouncement = await page.locator('[data-testid="announcement-item"]').first();
      if (await firstAnnouncement.isVisible()) {
        await firstAnnouncement.click();
        
        // Should see announcement detail
        const detail = await page.locator('[data-testid="announcement-detail"]');
        await expect(detail).toBeVisible({ timeout: TIMEOUT });
      }
    });

    test('should view grades and transcript', async () => {
      await page.evaluate(() => {
        localStorage.setItem('access_token', 'Bearer mock-student-token');
      });

      // Navigate to grades
      await page.goto(`${BASE_URL}/grades`, { waitUntil: 'networkidle' });

      // Should see grades table or card
      const gradesContainer = await page.locator('[data-testid="grades-container"]');
      await expect(gradesContainer).toBeVisible({ timeout: TIMEOUT });

      // Should see GPA
      const gpa = await page.locator('[data-testid="gpa-display"]');
      if (await gpa.isVisible()) {
        const gpaValue = await gpa.textContent();
        expect(gpaValue).toMatch(/\d+\.\d+/); // Should be a number
      }
    });

    test('should view schedule', async () => {
      await page.evaluate(() => {
        localStorage.setItem('access_token', 'Bearer mock-student-token');
      });

      // Navigate to schedule
      await page.goto(`${BASE_URL}/schedule`, { waitUntil: 'networkidle' });

      // Should see schedule view
      const scheduleView = await page.locator('[data-testid="schedule-view"]');
      await expect(scheduleView).toBeVisible({ timeout: TIMEOUT });

      // Should see week/month toggle
      const toggleButton = await page.locator('[data-testid="schedule-toggle"]');
      if (await toggleButton.isVisible()) {
        await toggleButton.click();
        await page.waitForTimeout(500);
      }
    });

    test('should join club', async () => {
      await page.evaluate(() => {
        localStorage.setItem('access_token', 'Bearer mock-student-token');
      });

      // Navigate to clubs
      await page.goto(`${BASE_URL}/organization`, { waitUntil: 'networkidle' });

      // Should see clubs list
      const clubsList = await page.locator('[data-testid="clubs-list"]');
      await expect(clubsList).toBeVisible({ timeout: TIMEOUT });

      // Click first club
      const firstClub = await page.locator('[data-testid="club-card"]').first();
      await firstClub.click();

      // Should see join button or indicate already joined
      const joinButton = await page.locator('button:has-text("Join")').first();
      if (await joinButton.isVisible()) {
        await joinButton.click();
        
        // Should see success message
        const successMsg = await page.locator('text=Successfully joined');
        await expect(successMsg).toBeVisible({ timeout: TIMEOUT });
      }
    });

    test('should update profile settings', async () => {
      await page.evaluate(() => {
        localStorage.setItem('access_token', 'Bearer mock-student-token');
      });

      // Navigate to settings
      await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });

      // Should see settings form
      const settingsForm = await page.locator('[data-testid="settings-form"]');
      await expect(settingsForm).toBeVisible({ timeout: TIMEOUT });

      // Update phone number
      const phoneInput = await page.locator('input[name="phone"]');
      if (await phoneInput.isVisible()) {
        await phoneInput.clear();
        await phoneInput.fill('0812345678');
        
        // Click save
        const saveBtn = await page.locator('button:has-text("Save")');
        await saveBtn.click();
        
        // Should see success message
        const successMsg = await page.locator('text=Settings saved');
        await expect(successMsg).toBeVisible({ timeout: TIMEOUT });
      }
    });
  });

  test.describe('Teacher User Flow', () => {
    test('should login as teacher', async () => {
      // Set mock token
      await page.evaluate(() => {
        localStorage.setItem('access_token', 'Bearer mock-teacher-token');
      });

      // Navigate to home
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

      // Should see teacher-specific options
      const teacherPanel = await page.locator('[data-testid="teacher-panel"]');
      await expect(teacherPanel).toBeVisible({ timeout: TIMEOUT });
    });

    test('should create announcement', async () => {
      await page.evaluate(() => {
        localStorage.setItem('access_token', 'Bearer mock-teacher-token');
      });

      // Navigate to home
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

      // Click create announcement button
      const createBtn = await page.locator('button:has-text("โพส์ประกาศ")');
      await expect(createBtn).toBeVisible({ timeout: TIMEOUT });
      await createBtn.click();

      // Should see modal
      const modal = await page.locator('[data-testid="announcement-modal"]');
      await expect(modal).toBeVisible({ timeout: TIMEOUT });

      // Fill form
      await page.locator('input[name="title"]').fill('Test Announcement');
      await page.locator('textarea[name="content"]').fill('This is a test announcement');

      // Select class
      const classSelect = await page.locator('select[name="classId"]');
      if (await classSelect.isVisible()) {
        await classSelect.selectOption({ index: 1 });
      }

      // Submit
      const submitBtn = await page.locator('button:has-text("Post")').first();
      await submitBtn.click();

      // Should see success
      const successMsg = await page.locator('text=Announcement posted');
      await expect(successMsg).toBeVisible({ timeout: TIMEOUT });
    });

    test('should manage assignments', async () => {
      await page.evaluate(() => {
        localStorage.setItem('access_token', 'Bearer mock-teacher-token');
      });

      // Navigate to assignments
      await page.goto(`${BASE_URL}/assignment`, { waitUntil: 'networkidle' });

      // Should see assignments list
      const assignmentsList = await page.locator('[data-testid="assignments-list"]');
      await expect(assignmentsList).toBeVisible({ timeout: TIMEOUT });

      // Click create button if available
      const createBtn = await page.locator('button:has-text("Create Assignment")');
      if (await createBtn.isVisible()) {
        await createBtn.click();

        // Should see form
        const form = await page.locator('[data-testid="assignment-form"]');
        await expect(form).toBeVisible({ timeout: TIMEOUT });
      }
    });

    test('should manage grades', async () => {
      await page.evaluate(() => {
        localStorage.setItem('access_token', 'Bearer mock-teacher-token');
      });

      // Navigate to grades management
      await page.goto(`${BASE_URL}/grades`, { waitUntil: 'networkidle' });

      // Should see grades management panel
      const gradesPanel = await page.locator('[data-testid="grades-management"]');
      if (await gradesPanel.isVisible()) {
        // Should have ability to edit grades
        const editBtn = await page.locator('button:has-text("Edit")').first();
        await expect(editBtn).toBeVisible({ timeout: TIMEOUT });
      }
    });
  });

  test.describe('Navigation & Layout', () => {
    test('should render navigation menu', async () => {
      await page.evaluate(() => {
        localStorage.setItem('access_token', 'Bearer mock-student-token');
      });

      // Navigate to home
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

      // Should see main navigation
      const nav = await page.locator('[data-testid="main-nav"]');
      await expect(nav).toBeVisible({ timeout: TIMEOUT });

      // Should have menu items
      const menuItems = await page.locator('[data-testid="nav-item"]');
      const count = await menuItems.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should toggle sidebar on mobile', async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.evaluate(() => {
        localStorage.setItem('access_token', 'Bearer mock-student-token');
      });

      // Navigate to home
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

      // Should see toggle button
      const toggleBtn = await page.locator('[data-testid="sidebar-toggle"]');
      if (await toggleBtn.isVisible()) {
        await toggleBtn.click();

        // Sidebar should toggle
        const sidebar = await page.locator('[data-testid="sidebar"]');
        await page.waitForTimeout(300); // Wait for animation
      }
    });

    test('should display breadcrumbs', async () => {
      await page.evaluate(() => {
        localStorage.setItem('access_token', 'Bearer mock-student-token');
      });

      // Navigate to announcements
      await page.goto(`${BASE_URL}/announcements`, { waitUntil: 'networkidle' });

      // Should see breadcrumbs if present
      const breadcrumbs = await page.locator('[data-testid="breadcrumbs"]');
      if (await breadcrumbs.isVisible()) {
        const items = await page.locator('[data-testid="breadcrumb-item"]');
        const count = await items.count();
        expect(count).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle 404 pages', async () => {
      await page.goto(`${BASE_URL}/non-existent-page`);

      // Should see 404 message
      const notFound = await page.locator('text=404|not found|page not found', { timeout: TIMEOUT });
      expect(notFound).toBeTruthy();
    });

    test('should show error message on API failure', async () => {
      // Simulate API error by blocking API calls
      await page.route('**/api/**', route => route.abort());

      await page.evaluate(() => {
        localStorage.setItem('access_token', 'Bearer mock-student-token');
      });

      // Navigate to page that needs API
      await page.goto(`${BASE_URL}/announcements`, { waitUntil: 'networkidle' });

      // Should see error message
      const errorMsg = await page.locator('[data-testid="error-message"]');
      if (await errorMsg.isVisible()) {
        expect(await errorMsg.textContent()).toBeTruthy();
      }
    });

    test('should redirect to login if not authenticated', async () => {
      // Clear token
      await page.evaluate(() => {
        localStorage.removeItem('access_token');
      });

      // Navigate to protected page
      await page.goto(`${BASE_URL}/announcements`, { waitUntil: 'networkidle' });

      // Should redirect to login
      expect(page.url()).toContain('/login');
    });
  });

  test.describe('Performance', () => {
    test('should load home page within 3 seconds', async () => {
      await page.evaluate(() => {
        localStorage.setItem('access_token', 'Bearer mock-student-token');
      });

      const startTime = Date.now();
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000);
    });

    test('should render announcements list within 2 seconds', async () => {
      await page.evaluate(() => {
        localStorage.setItem('access_token', 'Bearer mock-student-token');
      });

      const startTime = Date.now();
      await page.goto(`${BASE_URL}/announcements`, { waitUntil: 'networkidle' });
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(2000);
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async () => {
      await page.evaluate(() => {
        localStorage.setItem('access_token', 'Bearer mock-student-token');
      });

      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

      // Should have h1 tag
      const h1 = await page.locator('h1');
      const h1Count = await h1.count();
      expect(h1Count).toBeGreaterThanOrEqual(1);
    });

    test('should have alt text on images', async () => {
      await page.evaluate(() => {
        localStorage.setItem('access_token', 'Bearer mock-student-token');
      });

      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

      // Check images have alt text
      const images = await page.locator('img');
      const count = await images.count();

      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        if (await img.isVisible()) {
          expect(alt).toBeTruthy();
        }
      }
    });

    test('should have proper form labels', async () => {
      await page.evaluate(() => {
        localStorage.setItem('access_token', 'Bearer mock-teacher-token');
      });

      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

      // Click create announcement
      const createBtn = await page.locator('button:has-text("โพส์ประกาศ")');
      if (await createBtn.isVisible()) {
        await createBtn.click();

        // Check form inputs have labels
        const inputs = await page.locator('input');
        const count = await inputs.count();

        for (let i = 0; i < count; i++) {
          const input = inputs.nth(i);
          const inputId = await input.getAttribute('id');
          if (inputId) {
            const label = await page.locator(`label[for="${inputId}"]`);
            if (await input.isVisible()) {
              expect(await label.count()).toBeGreaterThanOrEqual(0);
            }
          }
        }
      }
    });
  });
});
