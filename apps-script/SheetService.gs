/**
 * HONGSON Information Hub — Sheet Service
 */

var SheetService = {
  /**
   * Get target Google Spreadsheet instance
   */
  getSpreadsheet: function() {
    var props = CONFIG.getScriptProps();
    if (props.spreadsheetId) {
      try {
        return SpreadsheetApp.openById(props.spreadsheetId);
      } catch (e) {
        Logger.log("Could not open Spreadsheet ID: " + props.spreadsheetId + ", falling back to Active Spreadsheet.");
      }
    }
    return SpreadsheetApp.getActiveSpreadsheet();
  },

  /**
   * Setup & Initialize all 6 Google Sheets tabs with headers
   */
  setupSheets: function() {
    var ss = this.getSpreadsheet();
    if (!ss) {
      return { success: false, message: "ไม่พบ Google Spreadsheet กรุณาตรวจสอบ SPREADSHEET_ID" };
    }

    var sheetSchemas = {
      "CONFIG": [
        ["KEY", "VALUE", "DESCRIPTION", "UPDATED_AT"]
      ],
      "CATEGORIES": [
        ["category_id", "category_name", "section_id", "section_name", "field_id", "field_label", "field_type", "required", "help_text", "options", "sort_order", "active"]
      ],
      "SUBMISSIONS": [
        ["submission_id", "academic_year", "category_id", "sender_name", "sender_department", "sender_phone", "data_as_of_date", "sender_note", "submitted_at", "status", "admin_note", "selected_for_report", "last_updated_at"]
      ],
      "DATA": [
        ["submission_id", "category_id", "section_id", "field_id", "value_type", "value", "row_index", "created_at", "updated_at"]
      ],
      "FILES": [
        ["file_record_id", "submission_id", "category_id", "field_id", "drive_file_id", "original_name", "stored_name", "mime_type", "file_size", "caption", "activity_date", "sort_order", "include_in_report", "layout", "uploaded_at"]
      ],
      "EXPORTS": [
        ["export_id", "academic_year", "generated_at", "generated_by", "source_submission_count", "google_doc_id", "pdf_file_id", "pdf_url", "status", "error_message"]
      ]
    };

    var createdSheets = [];

    for (var sheetName in sheetSchemas) {
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
      }
      
      // If sheet is empty, add header row
      if (sheet.getLastRow() === 0) {
        var headers = sheetSchemas[sheetName];
        sheet.getRange(1, 1, headers.length, headers[0].length).setValues(headers);
        sheet.getRange(1, 1, 1, headers[0].length).setFontWeight("bold").setBackground("#f1f5f9");
        sheet.setFrozenRows(1);
      }
      createdSheets.push(sheetName);
    }

    // Populate initial default 11 categories if CATEGORIES sheet has only headers
    this.seedDefaultCategories(ss.getSheetByName("CATEGORIES"));

    return {
      success: true,
      message: "สร้างและตั้งค่าโครงสร้าง Google Sheets ทั้ง 6 Tab เรียบร้อยแล้ว",
      sheets: createdSheets
    };
  },

  /**
   * Seed default 11 categories definitions
   */
  seedDefaultCategories: function(categoriesSheet) {
    if (!categoriesSheet || categoriesSheet.getLastRow() > 1) return;

    var defaultCategories = [
      ["cat_01", "1. ข้อมูลแม่บทและอัตลักษณ์สถานศึกษา", "sec_01", "ข้อมูลทั่วไป", "field_school_history", "ประวัติความเป็นมาและข้อมูลโรงเรียน", "textarea", "TRUE", "ระบุประวัติโดยย่อ", "", 1, "TRUE"],
      ["cat_02", "2. ธรรมาภิบาล เครือข่าย และชุมชน", "sec_01", "เครือข่ายความร่วมมือ", "field_community_networks", "สรุปเครือข่ายความร่วมมือและชุมชน", "textarea", "TRUE", "ระบุความร่วมมือกับชุมชน", "", 2, "TRUE"],
      ["cat_03", "3. ทะเบียนนักเรียนและโครงสร้างชั้นเรียน", "sec_01", "สถิตินักเรียน", "field_student_counts", "ตารางจำนวนนักเรียนแยกตามชั้นเรียน", "dynamic_table", "TRUE", "กรอกจำนวนนักเรียน", "", 3, "TRUE"],
      ["cat_04", "4. ผลการเรียนและคุณภาพผู้เรียน", "sec_01", "ผลสัมฤทธิ์ทางการเรียน", "field_academic_performance", "ผลสัมฤทธิ์ทางการเรียนทุกกลุ่มสาระ", "dynamic_table", "TRUE", "กรอกเกรดเฉลี่ยแยกวิชา", "", 4, "TRUE"],
      ["cat_05", "5. การทดสอบภายนอก การศึกษาต่อ และรางวัลนักเรียน", "sec_01", "รางวัลและความภาคภูมิใจ", "field_student_awards", "รายการรางวัลและความสำเร็จของนักเรียน", "textarea", "FALSE", "สรุปรายการรางวัล", "", 5, "TRUE"],
      ["cat_06", "6. หลักสูตร แผนการเรียน และเวลาเรียน", "sec_01", "โครงสร้างหลักสูตร", "field_curriculum_summary", "สรุปหลักสูตรสถานศึกษา", "textarea", "TRUE", "ระบุรายละเอียดหลักสูตร", "", 6, "TRUE"],
      ["cat_07", "7. นิเทศ การประเมิน และงานวิจัย", "sec_01", "งานวิจัยและพัฒนา", "field_research_list", "รายงานการวิจัยในชั้นเรียนและนวัตกรรม", "textarea", "FALSE", "ระบุผลงานวิจัย", "", 7, "TRUE"],
      ["cat_08", "8. บุคลากรและการพัฒนาวิชาชีพ", "sec_01", "ข้อมูลครูและบุคลากร", "field_staff_stats", "จำนวนครูและจำแนกตามวิทยฐานะ", "dynamic_table", "TRUE", "กรอกจำนวนบุคลากร", "", 8, "TRUE"],
      ["cat_09", "9. อาคาร สถานที่ และสภาพแวดล้อม", "sec_01", "อาคารสถานที่", "field_facility_summary", "สรุปอาคารสถานที่และห้องปฏิบัติการ", "textarea", "TRUE", "ระบุสภาพอาคารสถานที่", "", 9, "TRUE"],
      ["cat_10", "10. ห้องสมุดและแหล่งเรียนรู้", "sec_01", "แหล่งเรียนรู้", "field_library_info", "ข้อมูลห้องสมุดและแหล่งเรียนรู้", "textarea", "TRUE", "ระบุสถิติและข้อมูลห้องสมุด", "", 10, "TRUE"],
      ["cat_11", "11. ระบบดิจิทัลและหลักฐานสารสนเทศ", "sec_01", "โครงสร้างพื้นฐาน ICT", "field_ict_infrastructure", "ระบบดิจิทัล สื่อการเรียนรู้ และหลักฐานสารสนเทศ", "textarea", "TRUE", "ระบุระบบ ICT และลิงก์อ้างอิง", "", 11, "TRUE"]
    ];

    categoriesSheet.getRange(2, 1, defaultCategories.length, defaultCategories[0].length).setValues(defaultCategories);
  }
};
