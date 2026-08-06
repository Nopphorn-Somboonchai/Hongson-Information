/**
 * HONGSON Information Hub — Authentication Module
 */

var Auth = {
  /**
   * Verify input authorization code against server secrets
   * @param {string} code - The secret code entered by the user
   * @returns {Object} Authentication result
   */
  verifyCode: function(code) {
    if (!code || typeof code !== 'string') {
      return { success: false, message: "กรุณาระบุรหัสผ่านเข้าใช้งาน" };
    }

    var cleanCode = code.trim();
    var props = CONFIG.getScriptProps();

    if (cleanCode === props.adminCode) {
      var token = this.generateSessionToken("admin");
      return {
        success: true,
        role: "admin",
        sessionToken: token,
        schoolName: props.schoolName,
        academicYear: props.academicYear,
        message: "เข้าสู่ระบบในฐานะผู้ดูแลระบบ (Admin) สำเร็จ"
      };
    }

    if (cleanCode === props.contributorCode) {
      var token = this.generateSessionToken("contributor");
      return {
        success: true,
        role: "contributor",
        sessionToken: token,
        schoolName: props.schoolName,
        academicYear: props.academicYear,
        message: "เข้าสู่ระบบในฐานะผู้กรอกข้อมูล (Contributor) สำเร็จ"
      };
    }

    return {
      success: false,
      message: "รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง"
    };
  },

  /**
   * Generate simple session token with role and timestamp
   */
  generateSessionToken: function(role) {
    var timestamp = new Date().getTime();
    var raw = role + ":" + timestamp + ":" + Math.random().toString(36).substring(2, 9);
    return Utilities.base64Encode(raw);
  },

  /**
   * Verify session token validity
   */
  verifySessionToken: function(token, requiredRole) {
    if (!token) return false;
    try {
      var decoded = Utilities.newBlob(Utilities.base64Decode(token)).getDataAsString();
      var parts = decoded.split(":");
      var role = parts[0];
      var timestamp = parseInt(parts[1], 10);
      var now = new Date().getTime();

      // Token expires in 12 hours (43,200,000 ms)
      if (now - timestamp > 43200000) return false;

      if (requiredRole && role !== requiredRole && role !== "admin") {
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }
};
