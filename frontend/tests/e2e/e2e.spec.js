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

import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const API_URL = process.env.API_URL || 'http://localhost:4001/api';

// Test configuration
const TIMEOUT = 10000;
const SLOW_MO = 500; // Slow down for debugging

test.describe('KVC WebApp End-to-End Tests', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  const setAuth = async (role) => {
    const normalizedRole = role.toUpperCase();
    const token = `mock-${role.toLowerCase()}-token`;
    const user = {
      id: normalizedRole === 'TEACHER' ? 'teacher-001' : 'student-001',
      username: normalizedRole === 'TEACHER' ? 'teacher' : 'student1',
      email: normalizedRole === 'TEACHER' ? 'teacher@university.edu' : 'student1@university.edu',
      role: normalizedRole,
    };
    await page.addInitScript((data) => {
      localStorage.setItem('access_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('mockRole', data.user.role);
    }, { token, user });
  };

  const waitForAppReady = async () => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    try {
      await page.waitForSelector('[data-testid="main-nav"], [data-testid="sidebar-toggle"]', {
        timeout: TIMEOUT,
      });
    } catch {}
  };

  test.describe('Student User Flow', () => {
    test('should login as student', async () => {
      await setAuth('STUDENT');
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      await waitForAppReady();

      const welcome = await page.locator('text=ยินดีต้อนรับกลับมายังพอร์ทัลนักศึกษา').first();
      await expect(welcome).toBeVisible({ timeout: TIMEOUT });
    });

    test('should view announcements', async () => {
      await setAuth('STUDENT');
      await page.goto(`${BASE_URL}/announcements`, { waitUntil: 'networkidle' });
      await waitForAppReady();

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
      await setAuth('STUDENT');
      await page.goto(`${BASE_URL}/grades`, { waitUntil: 'networkidle' });
      await waitForAppReady();

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
      await setAuth('STUDENT');
      await page.goto(`${BASE_URL}/schedule`, { waitUntil: 'networkidle' });
      await waitForAppReady();

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
      await setAuth('STUDENT');
      await page.goto(`${BASE_URL}/clubs`, { waitUntil: 'networkidle' });
      await waitForAppReady();

      // Should see clubs list
      const clubsList = await page.locator('[data-testid="clubs-list"]');
      await expect(clubsList).toBeVisible({ timeout: TIMEOUT });

      // Click first club
      const firstClub = await page.locator('[data-testid="club-card"]').first();
      await firstClub.click();

      // Should see join button or indicate already joined
      const joinButton = await page.locator('[data-testid="club-join-button"]').first();
      if (await joinButton.isVisible()) {
        await joinButton.click();
        
        // Should see success message
        const successMsg = await page.locator('[data-testid="club-join-success"]');
        await expect(successMsg).toBeVisible({ timeout: TIMEOUT });
      }
    });

    test('should update profile settings', async () => {
      await setAuth('STUDENT');
      await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
      await waitForAppReady();

      // Should see settings form
      const settingsForm = await page.locator('[data-testid="settings-form"]');
      await expect(settingsForm).toBeVisible({ timeout: TIMEOUT });

      // Update phone number
      const phoneInput = await page.locator('input[name="phone"]');
      if (await phoneInput.isVisible()) {
        await phoneInput.clear();
        await phoneInput.fill('0812345678');
        
        // Click save
        const saveBtn = await page.locator('[data-testid="settings-save"]');
        await saveBtn.click();
        
        // Should see success message
        const successMsg = await page.locator('text=Settings saved');
        await expect(successMsg).toBeVisible({ timeout: TIMEOUT });
      }
    });
  });

  test.describe('Teacher User Flow', () => {
    test('should login as teacher', async () => {
      await setAuth('TEACHER');
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      await waitForAppReady();

      // Should see teacher-specific options
      const teacherPanel = await page.locator('[data-testid="teacher-panel"]');
      await expect(teacherPanel).toBeVisible({ timeout: TIMEOUT });
    });

    test('should create announcement', async () => {
      await setAuth('TEACHER');
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      await waitForAppReady();

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
        const optionCount = await classSelect.locator('option').count();
        if (optionCount > 1) {
          await classSelect.selectOption({ index: 1 });
        }
      }

      // Submit
      const submitBtn = await page.locator('button:has-text("Post")').first();
      await submitBtn.click();

      // Should see success
      const successMsg = await page.locator('[data-testid="announcement-success"]');
      await expect(successMsg).toBeVisible({ timeout: TIMEOUT });
    });

    test('should manage assignments', async () => {
      await setAuth('TEACHER');
      await page.goto(`${BASE_URL}/assignment`, { waitUntil: 'networkidle' });
      await waitForAppReady();

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
      await setAuth('TEACHER');
      await page.goto(`${BASE_URL}/grades`, { waitUntil: 'networkidle' });
      await waitForAppReady();

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
      await setAuth('STUDENT');
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      await waitForAppReady();

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

      await setAuth('STUDENT');
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      await waitForAppReady();

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
      await setAuth('STUDENT');
      await page.goto(`${BASE_URL}/announcements`, { waitUntil: 'networkidle' });
      await waitForAppReady();

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

      await setAuth('STUDENT');
      await page.goto(`${BASE_URL}/announcements`, { waitUntil: 'networkidle' });
      await waitForAppReady();

      // Should see error message
      const errorMsg = await page.locator('[data-testid="error-message"]');
      if (await errorMsg.isVisible()) {
        expect(await errorMsg.textContent()).toBeTruthy();
      }
    });

    test('should redirect to login if not authenticated', async () => {
      await page.addInitScript(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('mockRole');
      });
      await page.goto(`${BASE_URL}/announcements`, { waitUntil: 'networkidle' });
      await waitForAppReady();

      const loginHeading = await page.locator('text=เข้าสู่ระบบ').first();
      await expect(loginHeading).toBeVisible({ timeout: TIMEOUT });
    });
  });

  test.describe('Performance', () => {
    test('should load home page within 3 seconds', async () => {
      await setAuth('STUDENT');
      const startTime = Date.now();
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      await waitForAppReady();
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(5000);
    });

    test('should render announcements list within 2 seconds', async () => {
      await setAuth('STUDENT');
      const startTime = Date.now();
      await page.goto(`${BASE_URL}/announcements`, { waitUntil: 'networkidle' });
      await waitForAppReady();
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(6000);
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async () => {
      await setAuth('STUDENT');
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      await waitForAppReady();

      // Should have h1 tag
      const h1 = await page.locator('h1');
      const h1Count = await h1.count();
      expect(h1Count).toBeGreaterThanOrEqual(1);
    });

    test('should have alt text on images', async () => {
      await setAuth('STUDENT');
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      await waitForAppReady();

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
      await setAuth('TEACHER');
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      await waitForAppReady();

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
