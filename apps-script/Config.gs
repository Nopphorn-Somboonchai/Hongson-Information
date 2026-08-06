/**
 * HONGSON Information Hub — System Configuration
 */

var CONFIG = {
  // Default values for initial setup
  DEFAULT_CONTRIBUTOR_CODE: "HG-CONTRIB-2026",
  DEFAULT_ADMIN_CODE: "HG-ADMIN-2026",
  DEFAULT_SCHOOL_NAME: "โรงเรียนห้องสอนศึกษา",
  DEFAULT_ACADEMIC_YEAR: "2569",
  
  /**
   * Fetch configuration from ScriptProperties
   */
  getScriptProps: function() {
    var props = PropertiesService.getScriptProperties();
    return {
      contributorCode: props.getProperty("CONTRIBUTOR_CODE") || this.DEFAULT_CONTRIBUTOR_CODE,
      adminCode: props.getProperty("ADMIN_CODE") || this.DEFAULT_ADMIN_CODE,
      spreadsheetId: props.getProperty("SPREADSHEET_ID") || "",
      uploadFolderId: props.getProperty("UPLOAD_FOLDER_ID") || "",
      reportFolderId: props.getProperty("REPORT_FOLDER_ID") || "",
      docTemplateId: props.getProperty("DOC_TEMPLATE_ID") || "",
      schoolName: props.getProperty("SCHOOL_NAME") || this.DEFAULT_SCHOOL_NAME,
      academicYear: props.getProperty("CURRENT_ACADEMIC_YEAR") || this.DEFAULT_ACADEMIC_YEAR
    };
  },

  /**
   * Get safe config for Frontend (hides secrets)
   */
  getPublicConfig: function() {
    var props = this.getScriptProps();
    return {
      schoolName: props.schoolName,
      academicYear: props.academicYear,
      isConfigured: {
        spreadsheet: !!props.spreadsheetId,
        uploadFolder: !!props.uploadFolderId,
        reportFolder: !!props.reportFolderId
      }
    };
  },

  /**
   * Initialize or Update ScriptProperties
   */
  setScriptProps: function(newProps) {
    var props = PropertiesService.getScriptProperties();
    for (var key in newProps) {
      if (newProps.hasOwnProperty(key) && newProps[key]) {
        props.setProperty(key, newProps[key]);
      }
    }
    return { success: true, message: "บันทึกการตั้งค่า Script Properties เรียบร้อย" };
  }
};
