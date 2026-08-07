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

    // Default Fallback Categories Schema (12 Categories)
    var defaultCategories = [
      { id: "cat_01", name: "1. ข้อมูลพื้นฐานและอัตลักษณ์สถานศึกษา", sortOrder: 1, fields: [
        { sectionId: "sec_01", sectionName: "ข้อมูลทั่วไป", fieldId: "field_school_history", label: "ประวัติความเป็นมาและข้อมูลโรงเรียน", type: "textarea", required: true, helpText: "สรุปประวัติโรงเรียนและข้อมูลทั่วไป", options: [] },
        { sectionId: "sec_01", sectionName: "ข้อมูลทั่วไป", fieldId: "field_vision_mission", label: "วิสัยทัศน์ พันธกิจ และเป้าประสงค์", type: "textarea", required: true, helpText: "ระบุวิสัยทัศน์และอัตลักษณ์สถานศึกษา", options: [] }
      ]},
      { id: "cat_02", name: "2. ธรรมาภิบาล เครือข่าย และชุมชน", sortOrder: 2, fields: [
        { sectionId: "sec_01", sectionName: "เครือข่ายความร่วมมือ", fieldId: "field_community_networks", label: "สรุปเครือข่ายความร่วมมือและชุมชน", type: "textarea", required: true, helpText: "ระบุโครงการความร่วมมือกับชุมชนและภาคีเครือข่าย", options: [] }
      ]},
      { id: "cat_03", name: "3. ทะเบียนนักเรียนและโครงสร้างชั้นเรียน", sortOrder: 3, fields: [
        { sectionId: "sec_01", sectionName: "สถิตินักเรียน", fieldId: "field_student_counts", label: "ตารางสถิติจำนวนนักเรียนแยกตามระดับชั้น", type: "dynamic_table", required: true, helpText: "กรอกจำนวนนักเรียนแยกตามระดับชั้น", options: [] }
      ]},
      { id: "cat_04", name: "4. ผลการเรียนและคุณภาพผู้เรียน", sortOrder: 4, fields: [
        { sectionId: "sec_01", sectionName: "ผลสัมฤทธิ์ทางการเรียน", fieldId: "field_academic_performance", label: "ตารางผลสัมฤทธิ์ทางการเรียนจำแนกตามกลุ่มสาระ", type: "dynamic_table", required: true, helpText: "กรอกผลสัมฤทธิ์ทางการเรียน", options: [] }
      ]},
      { id: "cat_05", name: "5. การทดสอบภายนอก และการศึกษาต่อ", sortOrder: 5, fields: [
        { sectionId: "sec_01", sectionName: "ผลทดสอบและการศึกษาต่อ", fieldId: "field_onet_tcas_summary", label: "สรุปผลการทดสอบภายนอกและการศึกษาต่อ", type: "textarea", required: false, helpText: "สรุปผลการทดสอบ O-NET/TCAS", options: [] }
      ]},
      { id: "cat_06", name: "6. หลักสูตร แผนการเรียน และเวลาเรียน", sortOrder: 6, fields: [
        { sectionId: "sec_01", sectionName: "โครงสร้างหลักสูตร", fieldId: "field_curriculum_summary", label: "สรุปโครงสร้างหลักสูตรสถานศึกษา", type: "textarea", required: true, helpText: "ระบุรายละเอียดหลักสูตร", options: [] }
      ]},
      { id: "cat_07", name: "7. นิเทศ การประเมิน และงานวิจัย", sortOrder: 7, fields: [
        { sectionId: "sec_01", sectionName: "งานวิจัยและพัฒนา", fieldId: "field_research_list", label: "รายงานการวิจัยในชั้นเรียนและนวัตกรรม", type: "textarea", required: false, helpText: "ระบุผลงานวิจัย", options: [] }
      ]},
      { id: "cat_08", name: "8. บุคลากรและการพัฒนาวิชาชีพ", sortOrder: 8, fields: [
        { sectionId: "sec_01", sectionName: "ข้อมูลครูและบุคลากร", fieldId: "field_staff_stats", label: "ตารางสถิติจำนวนครูและบุคลากร", type: "dynamic_table", required: true, helpText: "กรอกจำนวนบุคลากร", options: [] }
      ]},
      { id: "cat_09", name: "9. อาคาร สถานที่ และสภาพแวดล้อม", sortOrder: 9, fields: [
        { sectionId: "sec_01", sectionName: "อาคารสถานที่", fieldId: "field_facility_summary", label: "สรุปข้อมูลอาคารสถานที่และสิ่งอำนวยความสะดวก", type: "textarea", required: true, helpText: "ระบุสภาพอาคารสถานที่", options: [] }
      ]},
      { id: "cat_10", name: "10. ห้องสมุดและแหล่งเรียนรู้", sortOrder: 10, fields: [
        { sectionId: "sec_01", sectionName: "แหล่งเรียนรู้", fieldId: "field_library_info", label: "ข้อมูลห้องสมุด สถิติการใช้บริการ และแหล่งเรียนรู้", type: "textarea", required: true, helpText: "ระบุสถิติและข้อมูลห้องสมุด", options: [] }
      ]},
      { id: "cat_11", name: "11. ระบบดิจิทัลและหลักฐานสารสนเทศ", sortOrder: 11, fields: [
        { sectionId: "sec_01", sectionName: "โครงสร้างพื้นฐาน ICT", fieldId: "field_ict_infrastructure", label: "สรุประบบดิจิทัล สื่อ ICT และลิงก์หลักฐานอ้างอิง", type: "textarea", required: true, helpText: "ระบุระบบ ICT และลิงก์อ้างอิง", options: [] }
      ]},
      { id: "cat_12", name: "12. รางวัลครู และรางวัลนักเรียน", sortOrder: 12, fields: [
        { sectionId: "sec_01", sectionName: "รางวัลและความภาคภูมิใจของครู", fieldId: "field_teacher_awards", label: "รายการรางวัลและความภาคภูมิใจของครู", type: "textarea", required: false, helpText: "สรุปรายการรางวัลและผลงานดีเด่นของครูและบุคลากร", options: [] },
        { sectionId: "sec_01", sectionName: "รางวัลและความภาคภูมิใจของนักเรียน", fieldId: "field_student_awards", label: "รายการรางวัลและความภาคภูมิใจของนักเรียน", type: "textarea", required: false, helpText: "สรุปรายการรางวัลและความภาคภูมิใจของนักเรียน", options: [] }
      ]}
    ];

    // Merge missing default categories if not present in categoryList
    for (var d = 0; d < defaultCategories.length; d++) {
      var defCat = defaultCategories[d];
      var found = false;
      for (var c = 0; c < categoryList.length; c++) {
        if (categoryList[c].id === defCat.id) {
          found = true;
          break;
        }
      }
      if (!found) {
        categoryList.push(defCat);
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

      var rawPhone = payload.senderPhone ? String(payload.senderPhone).trim() : "";
      var phoneVal = (rawPhone && rawPhone.startsWith("0")) ? "'" + rawPhone : rawPhone;

      // 1. Insert row into SUBMISSIONS sheet
      var subRow = [
        submissionId,
        academicYear,
        payload.categoryId || "",
        payload.senderName || "",
        payload.senderDepartment || "",
        phoneVal,
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
