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
      // Return clear error if Web App URL is missing
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
  }
};
