/**
 * HONGSON Information Hub — Report Service
 * Generator for Google Docs Annual Report and PDF Export across all 12 categories.
 */

var ReportService = {
  /**
   * Generate comprehensive Google Docs and PDF Report from selected submissions
   * @param {Object} options Parameters including academicYear, reportTitle, includeCover, includeToc, etc.
   */
  generateReport: function(options) {
    options = options || {};
    var academicYear = options.academicYear || CONFIG.DEFAULT_ACADEMIC_YEAR;
    var reportTitle = options.reportTitle || ("รายงานสารสนเทศประจำปีการศึกษา " + academicYear);
    var includeCover = options.includeCover !== false;
    var includeToc = options.includeToc !== false;
    var generatedBy = options.generatedBy || "ผู้ดูแลระบบ (Admin)";
    
    var lock = LockService.getScriptLock();
    try {
      if (!lock.tryLock(60000)) {
        return { success: false, message: "ระบบกำลังสร้างรายงานโดยผู้ใช้อื่นอยู่ในขณะนี้ หรือกระบวนการก่อนหน้ายังไม่เสร็จสิ้น กรุณารอ 1 นาทีแล้วลองใหม่อีกครั้ง" };
      }

      var ss = SheetService.getSpreadsheet();
      if (!ss) {
        return { success: false, message: "ไม่พบ Google Spreadsheet" };
      }

      // Fetch Submissions, Data, Files, and Categories
      var subSheet = ss.getSheetByName("SUBMISSIONS");
      var dataSheet = ss.getSheetByName("DATA");
      var filesSheet = ss.getSheetByName("FILES");
      var catSheet = ss.getSheetByName("CATEGORIES");

      var categories = this.getCategoriesList(catSheet);
      var submissions = this.getSelectedSubmissions(subSheet, academicYear);
      var allData = this.getSubmissionDataMap(dataSheet);
      var allFiles = this.getSubmissionFilesMap(filesSheet);

      var timestampStr = Utilities.formatDate(new Date(), "Asia/Bangkok", "yyyy-MM-dd_HHmmss");
      var docName = "รายงานสารสนเทศ_" + academicYear + "_" + timestampStr;

      // Create new Google Document
      var doc = DocumentApp.create(docName);
      var body = doc.getBody();

      // Page Setup: Margins 0.75 in (54 pt)
      body.setMarginTop(54);
      body.setMarginBottom(54);
      body.setMarginLeft(54);
      body.setMarginRight(54);

      // Section 1: Cover Page
      if (includeCover) {
        this.renderCoverPage(body, reportTitle, academicYear, options.schoolName || CONFIG.DEFAULT_SCHOOL_NAME);
        body.appendPageBreak();
      }

      // Section 2: Preface and Table of Contents
      if (includeToc) {
        this.renderPrefaceAndToc(body, reportTitle, academicYear, categories);
        body.appendPageBreak();
      }

      // Section 3: Render 11 Category Chapters
      var totalIncludedSubmissions = 0;

      for (var i = 0; i < categories.length; i++) {
        var cat = categories[i];
        var catSubmissions = submissions[cat.category_id] || [];

        // Render category heading once
        var pHead = body.appendParagraph(cat.category_name);
        pHead.setFontSize(16);
        pHead.setBold(true);
        pHead.setForegroundColor("#1e293b");
        pHead.setSpacingBefore(16);
        pHead.setSpacingAfter(8);

        if (catSubmissions.length > 0) {
          totalIncludedSubmissions += catSubmissions.length;
          for (var s = 0; s < catSubmissions.length; s++) {
            var sub = catSubmissions[s];
            var subData = allData[sub.submission_id] || [];
            var subFiles = allFiles[sub.submission_id] || [];

            this.renderCategoryContent(body, sub, subData, subFiles);
          }
        } else {
          // Render placeholder for category with no selected submission
          var pEmpty = body.appendParagraph("\u26a0\ufe0f \u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e21\u0e35\u0e01\u0e32\u0e23\u0e04\u0e31\u0e14\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e43\u0e19\u0e2b\u0e21\u0e27\u0e14\u0e19\u0e35\u0e49\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e01\u0e32\u0e23\u0e08\u0e31\u0e14\u0e17\u0e33\u0e23\u0e32\u0e22\u0e07\u0e32\u0e19\u0e1b\u0e23\u0e30\u0e08\u0e33\u0e1b\u0e35");
          pEmpty.setFontSize(10);
          pEmpty.setItalic(true);
          pEmpty.setForegroundColor("#94a3b8");
          pEmpty.setSpacingAfter(12);
        }

        if (i < categories.length - 1) {
          body.appendParagraph("").setSpacingAfter(12);
        }
      }

      // Add Header and Footer
      this.renderHeaderAndFooter(doc, reportTitle, academicYear);

      doc.saveAndClose();

      // Folder Placement & PDF Export
      var docFile = DriveApp.getFileById(doc.getId());
      var reportFolder = this.getOrCreateReportFolder();
      
      // Move Doc file into Report Folder
      try {
        docFile.moveTo(reportFolder);
      } catch (e) {
        Logger.log("Could not move doc file: " + e.toString());
      }

      // Convert Doc to PDF Blob
      var pdfBlob = docFile.getAs("application/pdf");
      var pdfFileName = docName + ".pdf";
      pdfBlob.setName(pdfFileName);

      var pdfFile = reportFolder.createFile(pdfBlob);
      
      // Attempt to grant view access link
      try {
        pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (e) {
        Logger.log("Could not set PDF sharing: " + e.toString());
      }

      var pdfUrl = "https://drive.google.com/file/d/" + pdfFile.getId() + "/view?usp=sharing";
      var docUrl = "https://docs.google.com/document/d/" + doc.getId() + "/edit";
      var exportId = "EXP-" + Utilities.formatDate(new Date(), "Asia/Bangkok", "yyyyMMdd-HHmmss");

      // Write Export record to EXPORTS Sheet
      this.recordExportLog(ss, {
        export_id: exportId,
        academic_year: academicYear,
        generated_at: new Date().toISOString(),
        generated_by: generatedBy,
        source_submission_count: totalIncludedSubmissions,
        google_doc_id: doc.getId(),
        pdf_file_id: pdfFile.getId(),
        pdf_url: pdfUrl,
        status: "completed",
        error_message: ""
      });

      return {
        success: true,
        message: "สร้างเอกสารและ Export PDF เรียบร้อยแล้ว",
        exportId: exportId,
        academicYear: academicYear,
        sourceSubmissionCount: totalIncludedSubmissions,
        googleDocId: doc.getId(),
        docUrl: docUrl,
        pdfFileId: pdfFile.getId(),
        pdfUrl: pdfUrl,
        pdfFileName: pdfFileName,
        generatedAt: new Date().toISOString()
      };

    } catch (err) {
      Logger.log("Report generation failed: " + err.toString() + "\n" + err.stack);
      
      // Log error to EXPORTS if possible
      try {
        var ssErr = SheetService.getSpreadsheet();
        if (ssErr) {
          this.recordExportLog(ssErr, {
            export_id: "EXP-ERR-" + Date.now(),
            academic_year: academicYear,
            generated_at: new Date().toISOString(),
            generated_by: generatedBy,
            source_submission_count: 0,
            google_doc_id: "",
            pdf_file_id: "",
            pdf_url: "",
            status: "failed",
            error_message: err.toString()
          });
        }
      } catch (e) {}

      return {
        success: false,
        message: "เกิดข้อผิดพลาดในการสร้างรายงาน: " + err.toString()
      };
    } finally {
      lock.releaseLock();
    }
  },

  /**
   * Helper: Get List of Categories
   */
  getCategoriesList: function(catSheet) {
    var defaultCategories = [
      { category_id: "cat_01", category_name: "1. ข้อมูลพื้นฐานและอัตลักษณ์สถานศึกษา" },
      { category_id: "cat_02", category_name: "2. ธรรมาภิบาล เครือข่าย และชุมชน" },
      { category_id: "cat_03", category_name: "3. ทะเบียนนักเรียนและโครงสร้างชั้นเรียน" },
      { category_id: "cat_04", category_name: "4. ผลการเรียนและคุณภาพผู้เรียน" },
      { category_id: "cat_05", category_name: "5. การทดสอบภายนอก และการศึกษาต่อ" },
      { category_id: "cat_06", category_name: "6. หลักสูตร แผนการเรียน และเวลาเรียน" },
      { category_id: "cat_07", category_name: "7. นิเทศ การประเมิน และงานวิจัย" },
      { category_id: "cat_08", category_name: "8. บุคลากรและการพัฒนาวิชาชีพ" },
      { category_id: "cat_09", category_name: "9. อาคาร สถานที่ และสภาพแวดล้อม" },
      { category_id: "cat_10", category_name: "10. ห้องสมุดและแหล่งเรียนรู้" },
      { category_id: "cat_11", category_name: "11. ระบบดิจิทัลและหลักฐานสารสนเทศ" },
      { category_id: "cat_12", category_name: "12. รางวัลครู และรางวัลนักเรียน" }
    ];

    if (!catSheet || catSheet.getLastRow() <= 1) return defaultCategories;

    var rows = catSheet.getDataRange().getValues();
    var map = {};
    for (var i = 1; i < rows.length; i++) {
      var catId = rows[i][0];
      var catName = rows[i][1];
      if (catId && !map[catId]) {
        map[catId] = catName;
      }
    }

    return defaultCategories.map(function(c) {
      return {
        category_id: c.category_id,
        category_name: map[c.category_id] || c.category_name
      };
    });
  },

  /**
   * Helper: Get Submissions selected for report
   */
  getSelectedSubmissions: function(subSheet, academicYear) {
    var result = {};
    if (!subSheet || subSheet.getLastRow() <= 1) return result;

    var rows = subSheet.getDataRange().getValues();
    var headers = rows[0];

    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      var sub = {};
      for (var h = 0; h < headers.length; h++) {
        sub[headers[h]] = row[h];
      }

      var subYear = String(sub.academic_year || "");
      var selected = String(sub.selected_for_report).toLowerCase();
      var status = String(sub.status).toLowerCase();

      if ((subYear === String(academicYear) || !academicYear) && (selected === "true" || selected === "1") && status !== "excluded") {
        var catId = sub.category_id;
        if (!result[catId]) result[catId] = [];
        result[catId].push(sub);
      }
    }
    return result;
  },

  /**
   * Helper: Map DATA rows by submission_id
   */
  getSubmissionDataMap: function(dataSheet) {
    var map = {};
    if (!dataSheet || dataSheet.getLastRow() <= 1) return map;

    var rows = dataSheet.getDataRange().getValues();
    var headers = rows[0];

    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      var item = {};
      for (var h = 0; h < headers.length; h++) {
        item[headers[h]] = row[h];
      }
      var subId = item.submission_id;
      if (!map[subId]) map[subId] = [];
      map[subId].push(item);
    }
    return map;
  },

  /**
   * Helper: Map FILES rows by submission_id
   */
  getSubmissionFilesMap: function(filesSheet) {
    var map = {};
    if (!filesSheet || filesSheet.getLastRow() <= 1) return map;

    var rows = filesSheet.getDataRange().getValues();
    var headers = rows[0];

    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      var item = {};
      for (var h = 0; h < headers.length; h++) {
        item[headers[h]] = row[h];
      }
      
      var include = String(item.include_in_report).toLowerCase();
      if (include !== "false" && include !== "0") {
        var subId = item.submission_id;
        if (!map[subId]) map[subId] = [];
        map[subId].push(item);
      }
    }

    // Sort files by sort_order
    for (var sId in map) {
      map[sId].sort(function(a, b) {
        return (parseInt(a.sort_order) || 0) - (parseInt(b.sort_order) || 0);
      });
    }

    return map;
  },

  /**
   * Render Cover Page
   */
  renderCoverPage: function(body, reportTitle, academicYear, schoolName) {
    body.appendParagraph("\n\n\n");
    
    var pSchool = body.appendParagraph(schoolName);
    pSchool.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    pSchool.setFontSize(16);
    pSchool.setBold(true);
    pSchool.setForegroundColor("#475569");

    var pTitle = body.appendParagraph(reportTitle);
    pTitle.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    pTitle.setFontSize(26);
    pTitle.setBold(true);
    pTitle.setForegroundColor("#0f172a");
    pTitle.setSpacingBefore(20);
    pTitle.setSpacingAfter(20);

    var pSub = body.appendParagraph("รายงานสารสนเทศและการประเมินคุณภาพสถานศึกษาประจำปี");
    pSub.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    pSub.setFontSize(14);
    pSub.setForegroundColor("#64748b");

    body.appendParagraph("\n\n\n\n\n\n");

    var dateStr = Utilities.formatDate(new Date(), "Asia/Bangkok", "d MMMM yyyy");
    var pFooter = body.appendParagraph("จัดทำโดย: ศูนย์ข้อมูลสารสนเทศ HONGSON Information Hub\nวันที่จัดทำเอกสาร: " + dateStr);
    pFooter.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    pFooter.setFontSize(11);
    pFooter.setForegroundColor("#94a3b8");
  },

  /**
   * Render Preface and Table of Contents
   */
  renderPrefaceAndToc: function(body, reportTitle, academicYear, categories) {
    var pPrefTitle = body.appendParagraph("คำนำ");
    pPrefTitle.setFontSize(20);
    pPrefTitle.setBold(true);
    pPrefTitle.setForegroundColor("#0f172a");

    var pPrefBody = body.appendParagraph(
      "เอกสารรายงานสารสนเทศประจำปีการศึกษา " + academicYear + " ฉบับนี้ จัดทำขึ้นโดยรวบรวมและประมวลผลข้อมูลจากทั้ง 12 หมวดสารสนเทศหลักของสถานศึกษา " +
      "เพื่อใช้เป็นฐานข้อมูลกลางสำหรับการบริหารจัดการ การประกันคุณภาพการศึกษา และการวางแผนพัฒนาสถานศึกษาอย่างมีประสิทธิภาพ " +
      "ข้อมูลทั้งหมดผ่านการตรวจสอบความถูกต้องและการคัดเลือกโดยคณะทำงานผู้ดูแลระบบเรียบร้อยแล้ว"
    );
    pPrefBody.setFontSize(11);
    pPrefBody.setLineSpacing(1.25);
    pPrefBody.setSpacingAfter(24);

    var pTocTitle = body.appendParagraph("สารบัญหมวดสารสนเทศ");
    pTocTitle.setFontSize(16);
    pTocTitle.setBold(true);
    pTocTitle.setForegroundColor("#0f172a");
    pTocTitle.setSpacingAfter(12);

    for (var i = 0; i < categories.length; i++) {
      var pCat = body.appendParagraph((i + 1) + ". " + categories[i].category_name);
      pCat.setFontSize(11);
      pCat.setForegroundColor("#334155");
      pCat.setSpacingAfter(4);
    }
  },

  /**
   * Render category content (submission data and files) — heading is rendered separately
   */
  renderCategoryContent: function(body, sub, dataItems, fileItems) {
    // Metadata Banner Box
    var pMeta = body.appendParagraph(
      "📌 รหัสอ้างอิง: " + sub.submission_id + " | ผู้จัดทำ: " + (sub.sender_name || "ไม่ระบุ") + 
      " (" + (sub.sender_department || "ไม่ระบุหน่วยงาน") + ") | ข้อมูล ณ วันที่: " + (sub.data_as_of_date || "ไม่ระบุ")
    );
    pMeta.setFontSize(9.5);
    pMeta.setItalic(true);
    pMeta.setForegroundColor("#64748b");
    pMeta.setSpacingAfter(12);

    // Render Data Fields & Dynamic Tables
    if (dataItems && dataItems.length > 0) {
      for (var d = 0; d < dataItems.length; d++) {
        var item = dataItems[d];
        var valType = item.value_type || "text";
        var fieldId = item.field_id || "";
        var valStr = item.value || "";

        if (valType === "dynamic_table" || fieldId.indexOf("table") !== -1) {
          this.renderDynamicTableInDoc(body, valStr);
        } else if (valStr) {
          var pField = body.appendParagraph("• " + valStr);
          pField.setFontSize(11);
          pField.setForegroundColor("#334155");
          pField.setSpacingAfter(6);
        }
      }
    }

    // Render Images and File Attachments
    if (fileItems && fileItems.length > 0) {
      this.renderImageAttachments(body, fileItems);
    }
  },

  /**
   * Render Category Chapter with data and files
   */
  renderCategoryChapter: function(body, cat, sub, dataItems, fileItems) {
    // Heading 1: Category Name
    var pHead = body.appendParagraph(cat.category_name);
    pHead.setFontSize(16);
    pHead.setBold(true);
    pHead.setForegroundColor("#1e293b");
    pHead.setSpacingBefore(16);
    pHead.setSpacingAfter(8);

    this.renderCategoryContent(body, sub, dataItems, fileItems);
  },

  /**
   * Render Empty Category Chapter Placeholder
   */
  renderEmptyCategoryChapter: function(body, cat) {
    var pHead = body.appendParagraph(cat.category_name);
    pHead.setFontSize(16);
    pHead.setBold(true);
    pHead.setForegroundColor("#1e293b");
    pHead.setSpacingBefore(16);
    pHead.setSpacingAfter(8);

    var pEmpty = body.appendParagraph("⚠️ ยังไม่มีการคัดเลือกข้อมูลในหมวดนี้สำหรับการจัดทำรายงานประจำปี");
    pEmpty.setFontSize(10);
    pEmpty.setItalic(true);
    pEmpty.setForegroundColor("#94a3b8");
    pEmpty.setSpacingAfter(12);
  },

  /**
   * Render Dynamic Table JSON string into Document Table
   */
  renderDynamicTableInDoc: function(body, jsonStr) {
    if (!jsonStr) return;
    var rowsData = [];
    try {
      rowsData = typeof jsonStr === "string" ? JSON.parse(jsonStr) : jsonStr;
    } catch (e) {
      body.appendParagraph(jsonStr).setFontSize(10);
      return;
    }

    if (!Array.isArray(rowsData) || rowsData.length === 0) return;

    // Extract table column headers
    var headers = Object.keys(rowsData[0]);
    var tableData = [];

    // Header row
    tableData.push(headers.map(function(h) { return String(h).toUpperCase(); }));

    // Data rows
    for (var r = 0; r < rowsData.length; r++) {
      var rowObj = rowsData[r];
      var rowArray = [];
      for (var c = 0; c < headers.length; c++) {
        rowArray.push(String(rowObj[headers[c]] || ""));
      }
      tableData.push(rowArray);
    }

    // Create Document Table
    var table = body.appendTable(tableData);

    // Style Header Row
    var headerRow = table.getRow(0);
    for (var hc = 0; hc < headerRow.getNumCells(); hc++) {
      var cell = headerRow.getCell(hc);
      cell.setBackgroundColor("#1e293b");
      var p = cell.getChild(0).asParagraph();
      p.setFontSize(9.5);
      p.setBold(true);
      p.setForegroundColor("#ffffff");
      p.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    }

    // Style Data Rows
    for (var tr = 1; tr < table.getNumRows(); tr++) {
      var dataRow = table.getRow(tr);
      var bgCol = (tr % 2 === 0) ? "#f8fafc" : "#ffffff";
      for (var dc = 0; dc < dataRow.getNumCells(); dc++) {
        var dCell = dataRow.getCell(dc);
        dCell.setBackgroundColor(bgCol);
        var dp = dCell.getChild(0).asParagraph();
        dp.setFontSize(9.5);
        dp.setForegroundColor("#334155");
      }
    }

    body.appendParagraph("").setSpacingAfter(8);
  },

  /**
   * Render Images from Drive with Layouts
   */
  renderImageAttachments: function(body, fileItems) {
    var pSection = body.appendParagraph("📷 ภาพประกอบและหลักฐานอ้างอิง");
    pSection.setFontSize(12);
    pSection.setBold(true);
    pSection.setForegroundColor("#0f172a");
    pSection.setSpacingBefore(8);
    pSection.setSpacingAfter(8);

    for (var f = 0; f < fileItems.length; f++) {
      var fileRecord = fileItems[f];
      var driveId = fileRecord.drive_file_id;
      var caption = fileRecord.caption || fileRecord.original_name || "";
      var layout = fileRecord.layout || "single";

      if (!driveId) continue;

      try {
        var driveFile = DriveApp.getFileById(driveId);
        var mimeType = driveFile.getMimeType();

        // Process images only
        if (mimeType.indexOf("image/") !== -1) {
          var imageBlob = driveFile.getBlob();
          var pImg = body.appendParagraph("");
          pImg.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

          var inlineImg = pImg.appendInlineImage(imageBlob);

          // Calculate scaling width
          var maxWidth = 450;
          if (layout === "single_full") maxWidth = 500;
          else if (layout === "pair") maxWidth = 220;
          else if (layout === "grid") maxWidth = 210;

          var origW = inlineImg.getWidth();
          var origH = inlineImg.getHeight();
          if (origW > maxWidth) {
            var ratio = maxWidth / origW;
            inlineImg.setWidth(maxWidth);
            inlineImg.setHeight(Math.round(origH * ratio));
          }

          if (caption) {
            var pCap = body.appendParagraph("ภาพประกอบ: " + caption);
            pCap.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
            pCap.setFontSize(9);
            pCap.setItalic(true);
            pCap.setForegroundColor("#64748b");
            pCap.setSpacingAfter(8);
          }
        }
      } catch (err) {
        Logger.log("Could not embed image " + driveId + ": " + err.toString());
      }
    }
  },

  /**
   * Render Header and Footer
   */
  renderHeaderAndFooter: function(doc, reportTitle, academicYear) {
    var header = doc.addHeader();
    var pHead = header.appendParagraph(reportTitle + " — HONGSON Information Hub");
    pHead.setFontSize(8.5);
    pHead.setForegroundColor("#94a3b8");
    pHead.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);

    var footer = doc.addFooter();
    var pFoot = footer.appendParagraph("หน้าเอกสารรายงานสารสนเทศประจำปีการศึกษา " + academicYear);
    pFoot.setFontSize(8.5);
    pFoot.setForegroundColor("#94a3b8");
    pFoot.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  },

  /**
   * Helper: Get or Create Drive Reports Folder
   */
  getOrCreateReportFolder: function() {
    var props = CONFIG.getScriptProps();
    if (props.reportFolderId) {
      try {
        return DriveApp.getFolderById(props.reportFolderId);
      } catch (e) {
        Logger.log("Could not open reportFolderId: " + props.reportFolderId);
      }
    }

    var folders = DriveApp.getFoldersByName("HONGSON_Reports");
    if (folders.hasNext()) {
      return folders.next();
    }
    return DriveApp.createFolder("HONGSON_Reports");
  },

  /**
   * Helper: Record export action to EXPORTS tab
   */
  recordExportLog: function(ss, record) {
    var sheet = ss.getSheetByName("EXPORTS");
    if (!sheet) return;

    var row = [
      record.export_id,
      record.academic_year,
      record.generated_at,
      record.generated_by,
      record.source_submission_count,
      record.google_doc_id,
      record.pdf_file_id,
      record.pdf_url,
      record.status,
      record.error_message
    ];

    sheet.appendRow(row);
  },

  /**
   * Fetch Export History records
   */
  getExportHistory: function() {
    var ss = SheetService.getSpreadsheet();
    if (!ss) return { success: false, message: "ไม่พบ Google Spreadsheet" };

    var sheet = ss.getSheetByName("EXPORTS");
    if (!sheet || sheet.getLastRow() <= 1) {
      return { success: true, exports: [] };
    }

    var rows = sheet.getDataRange().getValues();
    var headers = rows[0];
    var list = [];

    for (var i = rows.length - 1; i >= 1; i--) {
      var row = rows[i];
      var item = {};
      for (var h = 0; h < headers.length; h++) {
        item[headers[h]] = row[h];
      }
      list.push(item);
    }

    return {
      success: true,
      exports: list
    };
  }
};
