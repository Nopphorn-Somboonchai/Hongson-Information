/**
 * HONGSON Information Hub — Submission Processing Service
 */

var SubmissionService = {
  /**
   * Fetch active category list & dynamic schema
   */
  getCategories: function() {
    var ss = SheetService.getSpreadsheet();
    var sheet = ss ? ss.getSheetByName("CATEGORIES") : null;
    
    var categoriesMap = {};
    var categoryList = [];

    if (sheet && sheet.getLastRow() > 1) {
      var data = sheet.getDataRange().getValues();
      // Skip header row
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var catId = row[0];
        var catName = row[1];
        var secId = row[2];
        var secName = row[3];
        var fieldId = row[4];
        var fieldLabel = row[5];
        var fieldType = row[6];
        var required = row[7] === true || String(row[7]).toUpperCase() === "TRUE";
        var helpText = row[8] || "";
        var options = row[9] || "";
        var sortOrder = parseInt(row[10], 10) || i;
        var active = row[11] === true || String(row[11]).toUpperCase() === "TRUE";

        if (!active) continue;

        if (!categoriesMap[catId]) {
          categoriesMap[catId] = {
            id: catId,
            name: catName,
            sortOrder: sortOrder,
            fields: []
          };
          categoryList.push(categoriesMap[catId]);
        }

        categoriesMap[catId].fields.push({
          sectionId: secId,
          sectionName: secName,
          fieldId: fieldId,
          label: fieldLabel,
          type: fieldType,
          required: required,
          helpText: helpText,
          options: options ? options.split(",").map(function(s){ return s.trim(); }) : []
        });
      }
    }

    // Sort categories by sortOrder
    categoryList.sort(function(a, b) { return a.sortOrder - b.sortOrder; });
    return categoryList;
  },

  /**
   * Save submission data and files to Google Sheets & Drive
   * @param {Object} payload
   */
  submitData: function(payload) {
    var lock = LockService.getScriptLock();
    // Wait up to 30 seconds for lock to acquire
    try {
      lock.waitLock(30000);
    } catch (e) {
      return { success: false, message: "ระบบกำลังประมวลผลข้อมูลอื่นอยู่ กรุณาลองใหม่อีกครั้ง" };
    }

    try {
      // Validate submission payload
      var valResult = ValidationService.validateSubmission(payload);
      if (!valResult.valid) {
        return { success: false, message: valResult.message, errors: valResult.errors };
      }

      var ss = SheetService.getSpreadsheet();
      if (!ss) throw new Error("ไม่สามารถเปิด Google Spreadsheet ได้");

      var submissionsSheet = ss.getSheetByName("SUBMISSIONS");
      var dataSheet = ss.getSheetByName("DATA");
      var filesSheet = ss.getSheetByName("FILES");

      if (!submissionsSheet || !dataSheet || !filesSheet) {
        // Run setupSheets if sheets are missing
        SheetService.setupSheets();
        submissionsSheet = ss.getSheetByName("SUBMISSIONS");
        dataSheet = ss.getSheetByName("DATA");
        filesSheet = ss.getSheetByName("FILES");
      }

      var props = CONFIG.getScriptProps();
      var academicYear = payload.academicYear || props.academicYear;
      var nowStr = Utilities.formatDate(new Date(), "Asia/Bangkok", "yyyy-MM-dd HH:mm:ss");
      var timeId = Utilities.formatDate(new Date(), "Asia/Bangkok", "yyyyMMdd-HHmmss");
      
      // Generate unique submission ID
      var submissionId = "SUB-" + academicYear + "-" + (payload.categoryId || "CAT").toUpperCase() + "-" + timeId + "-" + Math.floor(Math.random() * 1000);

      // 1. Insert row into SUBMISSIONS sheet
      var subRow = [
        submissionId,
        academicYear,
        payload.categoryId || "",
        payload.senderName || "",
        payload.senderDepartment || "",
        payload.senderPhone || "",
        payload.dataAsOfDate || Utilities.formatDate(new Date(), "Asia/Bangkok", "yyyy-MM-dd"),
        payload.senderNote || "",
        nowStr,
        "submitted", // status
        "",          // admin_note
        "TRUE",      // selected_for_report
        nowStr
      ];
      submissionsSheet.appendRow(subRow);

      // 2. Insert field values into DATA sheet
      var fieldValues = payload.fieldValues || {};
      var dataRows = [];

      for (var fieldId in fieldValues) {
        if (!fieldValues.hasOwnProperty(fieldId)) continue;
        var val = fieldValues[fieldId];
        var valType = typeof val;

        if (Array.isArray(val)) {
          // Dynamic table rows
          valType = "dynamic_table";
          for (var r = 0; r < val.length; r++) {
            dataRows.push([
              submissionId,
              payload.categoryId || "",
              "sec_01",
              fieldId,
              valType,
              JSON.stringify(val[r]),
              r + 1,
              nowStr,
              nowStr
            ]);
          }
        } else {
          dataRows.push([
            submissionId,
            payload.categoryId || "",
            "sec_01",
            fieldId,
            valType,
            String(val !== undefined && val !== null ? val : ""),
            1,
            nowStr,
            nowStr
          ]);
        }
      }

      if (dataRows.length > 0) {
        dataSheet.getRange(dataSheet.getLastRow() + 1, 1, dataRows.length, dataRows[0].length).setValues(dataRows);
      }

      // 3. Process attached files & insert into FILES sheet
      var attachedFiles = payload.files || [];
      var savedFilesCount = 0;
      var fileRows = [];

      for (var f = 0; f < attachedFiles.length; f++) {
        var fileObj = attachedFiles[f];
        try {
          var savedMeta = FileService.saveFile(fileObj, submissionId, payload.categoryId);
          fileRows.push([
            savedMeta.fileRecordId,
            savedMeta.submissionId,
            savedMeta.categoryId,
            savedMeta.fieldId,
            savedMeta.driveFileId,
            savedMeta.originalName,
            savedMeta.storedName,
            savedMeta.mimeType,
            savedMeta.fileSize,
            savedMeta.caption,
            savedMeta.activityDate,
            savedMeta.sortOrder,
            savedMeta.includeInReport,
            savedMeta.layout,
            savedMeta.uploadedAt
          ]);
          savedFilesCount++;
        } catch (fileErr) {
          Logger.log("Error saving file " + fileObj.name + ": " + fileErr.toString());
        }
      }

      if (fileRows.length > 0) {
        filesSheet.getRange(filesSheet.getLastRow() + 1, 1, fileRows.length, fileRows[0].length).setValues(fileRows);
      }

      return {
        success: true,
        submissionId: submissionId,
        categoryId: payload.categoryId,
        senderName: payload.senderName,
        savedFieldsCount: dataRows.length,
        savedFilesCount: savedFilesCount,
        submittedAt: nowStr,
        message: "บันทึกข้อมูลและไฟล์แนบเรียบร้อยแล้ว"
      };

    } catch (err) {
      Logger.log("SubmitData Error: " + err.toString());
      return {
        success: false,
        message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + err.toString()
      };
    } finally {
      lock.releaseLock();
    }
  }
};
