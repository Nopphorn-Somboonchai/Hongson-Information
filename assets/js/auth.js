/**
 * HONGSON Information Hub — Client Auth & Session Manager
 */

const AuthManager = {
  SESSION_KEY: 'hongson_session',

  /**
   * Attempt code login via Apps Script Backend
   * @param {string} code 
   */
  async login(code) {
    if (!code || !code.trim()) {
      return { success: false, message: 'กรุณากรอกรหัสเข้าใช้งาน' };
    }

    const result = await API.verifyCode(code.trim());

    if (result && result.success) {
      const sessionData = {
        role: result.role,
        sessionToken: result.sessionToken,
        schoolName: result.schoolName || 'โรงเรียนห้องสอนศึกษา',
        academicYear: result.academicYear || '2568',
        loggedInAt: new Date().getTime()
      };
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
      return { success: true, role: result.role, message: result.message };
    }

    return {
      success: false,
      message: result.message || 'รหัสเข้าใช้งานไม่ถูกต้อง'
    };
  },

  /**
   * Get current session data from sessionStorage
   */
  getSession() {
    try {
      const data = sessionStorage.getItem(this.SESSION_KEY);
      if (!data) return null;
      const session = JSON.parse(data);

      // Check if session has expired (12 hours limit)
      const now = new Date().getTime();
      if (now - session.loggedInAt > 43200000) {
        this.logout();
        return null;
      }
      return session;
    } catch (e) {
      return null;
    }
  },

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated() {
    return !!this.getSession();
  },

  /**
   * Check if active role matches target role
   */
  hasRole(role) {
    const session = this.getSession();
    return session ? session.role === role : false;
  },

  /**
   * Clear session & log out
   */
  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
  }
};
