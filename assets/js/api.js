/**
 * HONGSON Information Hub — API Service Layer
 */

const API = {
  // Default URL or configured deployment URL
  webAppUrl: localStorage.getItem('WEB_APP_URL') || '',

  /**
   * Set custom Web App URL
   */
  setWebAppUrl(url) {
    if (url) {
      this.webAppUrl = url.trim();
      localStorage.setItem('WEB_APP_URL', this.webAppUrl);
    }
  },

  /**
   * Check if backend API URL is configured
   */
  isConfigured() {
    return !!this.webAppUrl;
  },

  /**
   * Universal Request Handler
   * @param {string} action - Backend action target
   * @param {Object} payload - Data payload to send
   * @param {string} method - 'POST' or 'GET'
   */
  async request(action, payload = {}, method = 'POST') {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: "ยังไม่ได้ตั้งค่า Apps Script Web App URL กรุณาตั้งค่า URL ในระบบก่อนใช้งาน"
      };
    }

    try {
      let response;
      const requestPayload = { action, ...payload };

      if (method === 'POST') {
        response = await fetch(this.webAppUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(requestPayload)
        });
      } else {
        const queryParams = new URLSearchParams({ action, ...payload }).toString();
        response = await fetch(`${this.webAppUrl}?${queryParams}`);
      }

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("API Request Failed:", error);
      return {
        success: false,
        message: `การเชื่อมต่อกับเซิร์ฟเวอร์ล้มเหลว (${error.message})`
      };
    }
  },

  /**
   * Verify Auth Code with Apps Script Backend
   */
  async verifyCode(code) {
    return await this.request('verifyCode', { code }, 'POST');
  },

  /**
   * Fetch categories list and schema
   */
  async getCategories() {
    return await this.request('getCategories', {}, 'GET');
  },

  /**
   * Submit submission data and attached files
   */
  async submitData(payload) {
    return await this.request('submitData', payload, 'POST');
  },

  /**
   * Fetch system public configuration
   */
  async getPublicConfig() {
    return await this.request('getPublicConfig', {}, 'GET');
  },

  /**
   * Trigger Google Sheets setup
   */
  async setupSheets(sessionToken) {
    return await this.request('setupSheets', { sessionToken }, 'POST');
  },

  /**
   * Fetch Admin Dashboard Overview Data
   */
  async getAdminDashboard(sessionToken) {
    return await this.request('getAdminDashboard', { sessionToken }, 'POST');
  },

  /**
   * Fetch Detailed Submission Data
   */
  async getSubmissionDetail(sessionToken, submissionId) {
    return await this.request('getSubmissionDetail', { sessionToken, submissionId }, 'POST');
  },

  /**
   * Update Submission Details, Data Fields & File Settings
   */
  async updateSubmission(sessionToken, payload) {
    return await this.request('updateSubmission', { sessionToken, ...payload }, 'POST');
  },

  /**
   * Toggle Submission Report Selection Boolean
   */
  async toggleReportSelection(sessionToken, submissionId, selected) {
    return await this.request('toggleReportSelection', { sessionToken, submissionId, selected }, 'POST');
  },

  /**
   * Generate PDF & Google Docs Report
   */
  async generateReport(sessionToken, reportOptions = {}) {
    return await this.request('generateReport', { sessionToken, ...reportOptions }, 'POST');
  },

  /**
   * Fetch Export History Records from EXPORTS Sheet
   */
  async getExportHistory(sessionToken) {
    return await this.request('getExportHistory', { sessionToken }, 'POST');
  }
};
