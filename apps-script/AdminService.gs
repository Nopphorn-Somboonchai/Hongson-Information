/**
 * HONGSON Information Hub — Admin Dashboard & Submission Management Service
 */

var AdminService = {
  /**
   * Get Admin Dashboard Overview data
   */
  getAdminDashboard: function() {
    var ss = SheetService.getSpreadsheet();
    if (!ss) {
      return { success: false, message: "ไม่สามารถเปิด Google Spreadsheet ได้" };
    }

    var categories = SubmissionService.getCategories();
    var catMap = {};
    for (var c = 0; c < categories.length; c++) {
      catMap[categories[c].id] = categories[c].name;
    }

    var submissionsSheet = ss.getSheetByName("SUBMISSIONS");
    var filesSheet = ss.getSheetByName("FILES");
    var dataSheet = ss.getSheetByName("DATA");

    var submissionsList = [];
    var catStats = {};

    // Initialize category stats for all 11 categories
    for (var i = 0; i < categories.length; i++) {
      var cat = categories[i];
      catStats[cat.id] = {
        id: cat.id,
        name: cat.name,
        submissionCount: 0,
        lastSubmittedAt: null,
        lastSenderName: "",
        status: "missing" // missing, submitted, reviewed
      };
    }

    // Map file counts per submissionId
    var fileCountMap = {};
    if (filesSheet && filesSheet.getLastRow() > 1) {
      var filesData = filesSheet.getDataRange().getValues();
      for (var f = 1; f < filesData.length; f++) {
        var subId = filesData[f][1]; // submission_id
        fileCountMap[subId] = (fileCountMap[subId] || 0) + 1;
      }
    }

    // Map data fields count per submissionId
    var dataCountMap = {};
    if (dataSheet && dataSheet.getLastRow() > 1) {
      var dataValues = dataSheet.getDataRange().getValues();
      for (var d = 1; d < dataValues.length; d++) {
        var sId = dataValues[d][0]; // submission_id
        dataCountMap[sId] = (dataCountMap[sId] || 0) + 1;
      }
    }

    var pendingReviewCount = 0;

    if (submissionsSheet && submissionsSheet.getLastRow() > 1) {
      var subData = submissionsSheet.getDataRange().getValues();
      for (var s = 1; s < subData.length; s++) {
        var row = subData[s];
        var subItem = {
          submissionId: row[0],
          academicYear: row[1],
          categoryId: row[2],
          categoryName: catMap[row[2]] || row[2],
          senderName: row[3],
          senderDepartment: row[4],
          senderPhone: this.formatPhone(row[5]),
          dataAsOfDate: this.formatDateValue(row[6]),
          senderNote: row[7],
          submittedAt: this.formatDateTimeValue(row[8]),
          status: row[9] || "submitted",
          adminNote: row[10] || "",
          selectedForReport: row[11] === true || String(row[11]).toUpperCase() === "TRUE",
          lastUpdatedAt: this.formatDateTimeValue(row[12] || row[8]),
          fileCount: fileCountMap[row[0]] || 0,
          dataCount: dataCountMap[row[0]] || 0
        };

        submissionsList.push(subItem);

        if (subItem.status === "submitted" || subItem.status === "needs_review") {
          pendingReviewCount++;
        }

        // Update category stats
        if (catStats[subItem.categoryId]) {
          catStats[subItem.categoryId].submissionCount++;
          catStats[subItem.categoryId].lastSubmittedAt = subItem.submittedAt;
          catStats[subItem.categoryId].lastSenderName = subItem.senderName;
          if (subItem.selectedForReport && subItem.status !== "excluded") {
            catStats[subItem.categoryId].status = subItem.status === "reviewed" ? "reviewed" : "submitted";
          }
        }
      }
    }

    // Sort submissionsList descending by submittedAt
    submissionsList.sort(function(a, b) {
      return new Date(b.submittedAt) - new Date(a.submittedAt);
    });

    // Calculate completeness metrics & warnings
    var submittedCats = 0;
    var warnings = [];
    var currentYear = CONFIG.getScriptProps().academicYear || "2568";

    for (var catIdKey in catStats) {
      var cs = catStats[catIdKey];
      if (cs.submissionCount > 0) {
        submittedCats++;
      } else {
        warnings.push("ยังไม่มีข้อมูลส่งในหมวด " + cs.name);
      }
      if (cs.submissionCount > 1) {
        warnings.push("พบข้อมูลส่งซ้ำหลายรายการในหมวด " + cs.name + " (" + cs.submissionCount + " รายการ)");
      }
    }

    return {
      success: true,
      academicYear: currentYear,
      metrics: {
        totalCategories: categories.length,
        submittedCategoriesCount: submittedCats,
        totalSubmissionsCount: submissionsList.length,
        pendingReviewCount: pendingReviewCount,
        completenessPercentage: Math.round((submittedCats / categories.length) * 100)
      },
      categoryStats: Object.keys(catStats).map(function(k) { return catStats[k]; }),
      submissions: submissionsList,
      warnings: warnings
    };
  },

  /**
   * Get detailed view for a single submission
   * @param {string} submissionId
   */
  getSubmissionDetail: function(submissionId) {
    if (!submissionId) {
      return { success: false, message: "ไม่ได้ระบุ Submission ID" };
    }

    var ss = SheetService.getSpreadsheet();
    if (!ss) {
      return { success: false, message: "ไม่สามารถเปิด Google Spreadsheet ได้" };
    }

    var subSheet = ss.getSheetByName("SUBMISSIONS");
    var dataSheet = ss.getSheetByName("DATA");
    var filesSheet = ss.getSheetByName("FILES");

    var submission = null;
    if (subSheet && subSheet.getLastRow() > 1) {
      var subValues = subSheet.getDataRange().getValues();
      for (var i = 1; i < subValues.length; i++) {
        if (subValues[i][0] === submissionId) {
          var row = subValues[i];
          submission = {
            submissionId: row[0],
            academicYear: row[1],
            categoryId: row[2],
            senderName: row[3],
            senderDepartment: row[4],
            senderPhone: this.formatPhone(row[5]),
            dataAsOfDate: this.formatDateValue(row[6]),
            senderNote: row[7],
            submittedAt: this.formatDateTimeValue(row[8]),
            status: row[9] || "submitted",
            adminNote: row[10] || "",
            selectedForReport: row[11] === true || String(row[11]).toUpperCase() === "TRUE",
            lastUpdatedAt: this.formatDateTimeValue(row[12])
          };
          break;
        }
      }
    }

    if (!submission) {
      return { success: false, message: "ไม่พบข้อมูล Submission ID: " + submissionId };
    }

    // Read DATA fields
    var fieldValues = {};
    if (dataSheet && dataSheet.getLastRow() > 1) {
      var dValues = dataSheet.getDataRange().getValues();
      for (var d = 1; d < dValues.length; d++) {
        var dRow = dValues[d];
        if (dRow[0] === submissionId) {
          var fieldId = dRow[3];
          var valType = dRow[4];
          var rawVal = dRow[5];

          if (valType === "dynamic_table") {
            if (!fieldValues[fieldId]) fieldValues[fieldId] = [];
            try {
              fieldValues[fieldId].push(JSON.parse(rawVal));
            } catch(e) {
              fieldValues[fieldId].push({});
            }
          } else {
            fieldValues[fieldId] = rawVal;
          }
        }
      }
    }

    // Read FILES
    var filesList = [];
    if (filesSheet && filesSheet.getLastRow() > 1) {
      var fValues = filesSheet.getDataRange().getValues();
      for (var f = 1; f < fValues.length; f++) {
        var fRow = fValues[f];
        if (fRow[1] === submissionId) {
          var driveId = fRow[4];
          filesList.push({
            fileRecordId: fRow[0],
            submissionId: fRow[1],
            categoryId: fRow[2],
            fieldId: fRow[3],
            driveFileId: driveId,
            originalName: fRow[5],
            storedName: fRow[6],
            mimeType: fRow[7],
            fileSize: fRow[8],
            caption: fRow[9] || "",
            activityDate: fRow[10] || "",
            sortOrder: parseInt(fRow[11], 10) || (filesList.length + 1),
            includeInReport: fRow[12] === true || String(fRow[12]).toUpperCase() === "TRUE",
            layout: fRow[13] || "single",
            uploadedAt: fRow[14],
            driveViewUrl: driveId ? "https://drive.google.com/file/d/" + driveId + "/view" : ""
          });
        }
      }
    }

    // Sort files by sortOrder
    filesList.sort(function(a, b) { return a.sortOrder - b.sortOrder; });

    return {
      success: true,
      submission: submission,
      fieldValues: fieldValues,
      files: filesList
    };
  },

  /**
   * Update submission details, field values & file metadata
   * @param {Object} payload
   */
  updateSubmission: function(payload) {
    if (!payload || !payload.submissionId) {
      return { success: false, message: "ไม่ได้ระบุ Submission ID สำหรับแก้ไข" };
    }

    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(30000);
    } catch(e) {
      return { success: false, message: "ระบบกำลังประมวลผลข้อมูลอื่นอยู่ กรุณาลองใหม่อีกครั้ง" };
    }

    try {
      var ss = SheetService.getSpreadsheet();
      if (!ss) throw new Error("ไม่สามารถเปิด Google Spreadsheet ได้");

      var subSheet = ss.getSheetByName("SUBMISSIONS");
      var dataSheet = ss.getSheetByName("DATA");
      var filesSheet = ss.getSheetByName("FILES");

      var nowStr = Utilities.formatDate(new Date(), "Asia/Bangkok", "yyyy-MM-dd HH:mm:ss");

      // 1. Update SUBMISSIONS sheet
      if (subSheet && subSheet.getLastRow() > 1) {
        var subData = subSheet.getDataRange().getValues();
        for (var i = 1; i < subData.length; i++) {
          if (subData[i][0] === payload.submissionId) {
            var rowNum = i + 1;
            if (payload.senderName !== undefined) subSheet.getRange(rowNum, 4).setValue(payload.senderName);
            if (payload.senderDepartment !== undefined) subSheet.getRange(rowNum, 5).setValue(payload.senderDepartment);
            if (payload.senderPhone !== undefined) {
              var pStr = String(payload.senderPhone).trim();
              var phoneVal = (pStr && pStr.startsWith("0")) ? "'" + pStr : pStr;
              subSheet.getRange(rowNum, 6).setValue(phoneVal);
            }
            if (payload.dataAsOfDate !== undefined) subSheet.getRange(rowNum, 7).setValue(payload.dataAsOfDate);
            if (payload.senderNote !== undefined) subSheet.getRange(rowNum, 8).setValue(payload.senderNote);
            if (payload.status !== undefined) subSheet.getRange(rowNum, 10).setValue(payload.status);
            if (payload.adminNote !== undefined) subSheet.getRange(rowNum, 11).setValue(payload.adminNote);
            if (payload.selectedForReport !== undefined) {
              subSheet.getRange(rowNum, 12).setValue(payload.selectedForReport ? "TRUE" : "FALSE");
            }
            subSheet.getRange(rowNum, 13).setValue(nowStr);
            break;
          }
        }
      }

      // 2. Update DATA sheet fields if payload.fieldValues provided
      if (payload.fieldValues && dataSheet) {
        var categoryId = payload.categoryId || "";
        
        // Remove existing DATA rows for this submissionId
        if (dataSheet.getLastRow() > 1) {
          var dData = dataSheet.getDataRange().getValues();
          for (var d = dData.length - 1; d >= 1; d--) {
            if (dData[d][0] === payload.submissionId) {
              dataSheet.deleteRow(d + 1);
            }
          }
        }

        // Insert new updated rows
        var newRows = [];
        for (var fieldId in payload.fieldValues) {
          if (!payload.fieldValues.hasOwnProperty(fieldId)) continue;
          var val = payload.fieldValues[fieldId];
          var valType = typeof val;

          if (Array.isArray(val)) {
            valType = "dynamic_table";
            for (var r = 0; r < val.length; r++) {
              newRows.push([
                payload.submissionId,
                categoryId,
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
            newRows.push([
              payload.submissionId,
              categoryId,
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

        if (newRows.length > 0) {
          dataSheet.getRange(dataSheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
        }
      }

      // 3. Update FILES metadata if payload.filesMeta provided
      if (payload.filesMeta && filesSheet && filesSheet.getLastRow() > 1) {
        var fData = filesSheet.getDataRange().getValues();
        var filesMetaMap = {};
        for (var fm = 0; fm < payload.filesMeta.length; fm++) {
          var item = payload.filesMeta[fm];
          filesMetaMap[item.fileRecordId] = item;
        }

        for (var f = 1; f < fData.length; f++) {
          var recId = fData[f][0];
          if (filesMetaMap[recId]) {
            var filePayload = filesMetaMap[recId];
            var fRowNum = f + 1;
            if (filePayload.caption !== undefined) filesSheet.getRange(fRowNum, 10).setValue(filePayload.caption);
            if (filePayload.activityDate !== undefined) filesSheet.getRange(fRowNum, 11).setValue(filePayload.activityDate);
            if (filePayload.sortOrder !== undefined) filesSheet.getRange(fRowNum, 12).setValue(filePayload.sortOrder);
            if (filePayload.includeInReport !== undefined) {
              filesSheet.getRange(fRowNum, 13).setValue(filePayload.includeInReport ? "TRUE" : "FALSE");
            }
            if (filePayload.layout !== undefined) filesSheet.getRange(fRowNum, 14).setValue(filePayload.layout);
          }
        }
      }

      return {
        success: true,
        submissionId: payload.submissionId,
        updatedAt: nowStr,
        message: "บันทึกการแก้ไขข้อมูลเรียบร้อยแล้ว"
      };

    } catch(err) {
      Logger.log("UpdateSubmission Error: " + err.toString());
      return { success: false, message: "เกิดข้อผิดพลาดในการบันทึกการแก้ไข: " + err.toString() };
    } finally {
      lock.releaseLock();
    }
  },

  /**
   * Quick toggle selected_for_report boolean
   */
  toggleReportSelection: function(submissionId, selected) {
    if (!submissionId) {
      return { success: false, message: "ไม่ได้ระบุ Submission ID" };
    }

    var ss = SheetService.getSpreadsheet();
    if (!ss) return { success: false, message: "ไม่สามารถเปิด Google Spreadsheet ได้" };

    var subSheet = ss.getSheetByName("SUBMISSIONS");
    if (subSheet && subSheet.getLastRow() > 1) {
      var data = subSheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] === submissionId) {
          var rowNum = i + 1;
          var valStr = selected ? "TRUE" : "FALSE";
          subSheet.getRange(rowNum, 12).setValue(valStr);
          subSheet.getRange(rowNum, 13).setValue(Utilities.formatDate(new Date(), "Asia/Bangkok", "yyyy-MM-dd HH:mm:ss"));
          return {
            success: true,
            submissionId: submissionId,
            selectedForReport: selected,
            message: "อัปเดตการเลือกสำหรับรายงานเรียบร้อยแล้ว"
          };
        }
      }
    }

    return { success: false, message: "ไม่พบข้อมูล Submission ID: " + submissionId };
  },

  /**
   * Date & DateTime Formatting Helpers
   */
  formatDateValue: function(val) {
    if (!val) return "";
    if (Object.prototype.toString.call(val) === "[object Date]") {
      return Utilities.formatDate(val, "Asia/Bangkok", "yyyy-MM-dd");
    }
    var str = String(val).trim();
    if (str.indexOf("T") !== -1) {
      str = str.split("T")[0];
    }
    return str;
  },

  formatDateTimeValue: function(val) {
    if (!val) return "";
    if (Object.prototype.toString.call(val) === "[object Date]") {
      return Utilities.formatDate(val, "Asia/Bangkok", "yyyy-MM-dd HH:mm:ss");
    }
    return String(val);
  },

  formatPhone: function(val) {
    if (val === null || val === undefined) return "";
    var str = String(val).trim();
    if (str && !str.startsWith("0") && /^\d{9}$/.test(str)) {
      return "0" + str;
    }
    return str;
  }
};
