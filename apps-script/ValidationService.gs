/**
 * HONGSON Information Hub — Server-Side Validation Service
 * Validates submissions, fields, numbers, academic years, dynamic tables, and uploaded file constraints.
 */

var ValidationService = {
  /**
   * Validate submission payload before saving to Sheets/Drive
   * @param {Object} payload Submission payload from client
   * @return {Object} { valid: boolean, message: string, errors: Array }
   */
  validateSubmission: function(payload) {
    var errors = [];

    if (!payload) {
      return { valid: false, message: "ไม่พบข้อมูลส่งเข้าสู่ระบบ", errors: ["Missing payload"] };
    }

    // 1. Validate Sender Info
    if (!payload.senderName || payload.senderName.trim() === "") {
      errors.push("กรุณาระบุชื่อ-นามสกุล ผู้ส่งข้อมูล");
    }
    if (!payload.senderDepartment || payload.senderDepartment.trim() === "") {
      errors.push("กรุณาระบุกลุ่มงาน/ฝ่าย/โรงเรียน ผู้ส่งข้อมูล");
    }

    // 2. Validate Academic Year
    var year = parseInt(payload.academicYear, 10);
    if (isNaN(year) || year < 2500 || year > 2700) {
      errors.push("ปีการศึกษาต้องเป็นตัวเลข พ.ศ. ที่ถูกต้อง (เช่น 2569)");
    }

    // 3. Validate Category ID
    if (!payload.categoryId || payload.categoryId.trim() === "") {
      errors.push("ไม่พบรหัสหมวดสารสนเทศ");
    }

    // 4. Validate Form Data Fields & Dynamic Tables
    if (payload.data && typeof payload.data === "object") {
      for (var fieldKey in payload.data) {
        var val = payload.data[fieldKey];

        // Check if value is percentage
        if (fieldKey.toLowerCase().indexOf("percent") !== -1 || fieldKey.toLowerCase().indexOf("percentage") !== -1) {
          var num = parseFloat(val);
          if (!isNaN(num) && (num < 0 || num > 100)) {
            errors.push("ค่าร้อยละ (" + fieldKey + ") ต้องอยู่ระหว่าง 0 ถึง 100");
          }
        }

        // Validate Dynamic Tables if array
        if (Array.isArray(val)) {
          for (var i = 0; i < val.length; i++) {
            var row = val[i];
            if (typeof row === "object" && row !== null) {
              for (var colKey in row) {
                if (colKey.toLowerCase().indexOf("percent") !== -1) {
                  var pNum = parseFloat(row[colKey]);
                  if (!isNaN(pNum) && (pNum < 0 || pNum > 100)) {
                    errors.push("ตารางแถวที่ " + (i + 1) + " คอลัมน์ " + colKey + " ค่าร้อยละต้องไม่เกิน 100%");
                  }
                }
              }
            }
          }
        }
      }
    }

    // 5. Validate File Uploads
    if (Array.isArray(payload.files)) {
      var allowedTypes = [
        "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif",
        "application/pdf"
      ];
      var maxSizeBytes = 20 * 1024 * 1024; // 20 MB Base64 limit per file

      for (var f = 0; f < payload.files.length; f++) {
        var fileObj = payload.files[f];
        if (fileObj.mimeType && allowedTypes.indexOf(fileObj.mimeType.toLowerCase()) === -1) {
          errors.push("ไฟล์ '" + (fileObj.name || ("ไฟล์ที่ " + (f + 1))) + "' ไม่รองรับประเภทชนิดไฟล์นี้ (รองรับเฉพาะ JPG, PNG, WEBP และ PDF)");
        }
        if (fileObj.base64Data && fileObj.base64Data.length * 0.75 > maxSizeBytes) {
          errors.push("ไฟล์ '" + (fileObj.name || ("ไฟล์ที่ " + (f + 1))) + "' มีขนาดใหญ่เกินกำหนด (สูงสุด 20 MB)");
        }
      }
    }

    if (errors.length > 0) {
      return {
        valid: false,
        message: "การส่งข้อมูลไม่ผ่านการตรวจสอบ: " + errors[0],
        errors: errors
      };
    }

    return { valid: true, message: "ตรวจสอบข้อมูลถูกต้อง" };
  }
};
