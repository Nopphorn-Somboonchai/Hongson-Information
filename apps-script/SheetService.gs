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

    // Populate initial default 11 categories definitions
    this.seedDefaultCategories(ss.getSheetByName("CATEGORIES"), true);

    return {
      success: true,
      message: "สร้างและตั้งค่าโครงสร้าง Google Sheets ทั้ง 6 Tab เรียบร้อยแล้ว",
      sheets: createdSheets
    };
  },

  /**
   * Seed default 12 categories definitions
   */
  seedDefaultCategories: function(categoriesSheet, force) {
    if (!categoriesSheet) return;
    
    // Check if cat_12 already exists in existing sheet
    if (!force && categoriesSheet.getLastRow() > 1) {
      var data = categoriesSheet.getDataRange().getValues();
      var hasCat12 = false;
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] === "cat_12") {
          hasCat12 = true;
          break;
        }
      }
      if (hasCat12) return;
      
      // If cat_12 is missing, append cat_12 rows to existing sheet
      var cat12Rows = [
        ["cat_12", "12. รางวัลครู และรางวัลนักเรียน", "sec_01", "รางวัลและความภาคภูมิใจของครู", "field_teacher_awards", "รายการรางวัลและความภาคภูมิใจของครู", "textarea", "FALSE", "สรุปรายการรางวัลและผลงานดีเด่นของครูและบุคลากร", "", 13, "TRUE"],
        ["cat_12", "12. รางวัลครู และรางวัลนักเรียน", "sec_01", "รางวัลและความภาคภูมิใจของนักเรียน", "field_student_awards", "รายการรางวัลและความภาคภูมิใจของนักเรียน", "textarea", "FALSE", "สรุปรายการรางวัลและความภาคภูมิใจของนักเรียน", "", 14, "TRUE"]
      ];
      categoriesSheet.getRange(categoriesSheet.getLastRow() + 1, 1, cat12Rows.length, cat12Rows[0].length).setValues(cat12Rows);
      return;
    }

    categoriesSheet.clearContents();
    var headers = [["category_id", "category_name", "section_id", "section_name", "field_id", "field_label", "field_type", "required", "help_text", "options", "sort_order", "active"]];
    var defaultCategories = [
      ["cat_01", "1. ข้อมูลพื้นฐานและอัตลักษณ์สถานศึกษา", "sec_01", "ข้อมูลทั่วไป", "field_school_history", "ประวัติความเป็นมาและข้อมูลโรงเรียน", "textarea", "TRUE", "สรุปประวัติโรงเรียนและข้อมูลทั่วไป", "", 1, "TRUE"],
      ["cat_01", "1. ข้อมูลพื้นฐานและอัตลักษณ์สถานศึกษา", "sec_01", "ข้อมูลทั่วไป", "field_vision_mission", "วิสัยทัศน์ พันธกิจ และเป้าประสงค์", "textarea", "TRUE", "ระบุวิสัยทัศน์และอัตลักษณ์สถานศึกษา", "", 2, "TRUE"],
      ["cat_02", "2. ธรรมาภิบาล เครือข่าย และชุมชน", "sec_01", "เครือข่ายความร่วมมือ", "field_community_networks", "สรุปเครือข่ายความร่วมมือและชุมชน", "textarea", "TRUE", "ระบุโครงการความร่วมมือกับชุมชนและภาคีเครือข่าย", "", 3, "TRUE"],
      ["cat_03", "3. ทะเบียนนักเรียนและโครงสร้างชั้นเรียน", "sec_01", "สถิตินักเรียน", "field_student_counts", "ตารางสถิติจำนวนนักเรียนแยกตามระดับชั้น", "dynamic_table", "TRUE", "กรอกจำนวนนักเรียนแยกตามระดับชั้น", "", 4, "TRUE"],
      ["cat_04", "4. ผลการเรียนและคุณภาพผู้เรียน", "sec_01", "ผลสัมฤทธิ์ทางการเรียน", "field_academic_performance", "ตารางผลสัมฤทธิ์ทางการเรียนจำแนกตามกลุ่มสาระ", "dynamic_table", "TRUE", "กรอกผลสัมฤทธิ์ทางการเรียน", "", 5, "TRUE"],
      ["cat_05", "5. การทดสอบภายนอก และการศึกษาต่อ", "sec_01", "ผลทดสอบและการศึกษาต่อ", "field_onet_tcas_summary", "สรุปผลการทดสอบภายนอกและการศึกษาต่อ", "textarea", "FALSE", "สรุปผลการทดสอบ O-NET/TCAS", "", 6, "TRUE"],
      ["cat_06", "6. หลักสูตร แผนการเรียน และเวลาเรียน", "sec_01", "โครงสร้างหลักสูตร", "field_curriculum_summary", "สรุปโครงสร้างหลักสูตรสถานศึกษา", "textarea", "TRUE", "ระบุรายละเอียดหลักสูตร", "", 7, "TRUE"],
      ["cat_07", "7. นิเทศ การประเมิน และงานวิจัย", "sec_01", "งานวิจัยและพัฒนา", "field_research_list", "รายงานการวิจัยในชั้นเรียนและนวัตกรรม", "textarea", "FALSE", "ระบุผลงานวิจัย", "", 8, "TRUE"],
      ["cat_08", "8. บุคลากรและการพัฒนาวิชาชีพ", "sec_01", "ข้อมูลครูและบุคลากร", "field_staff_stats", "ตารางสถิติจำนวนครูและบุคลากร", "dynamic_table", "TRUE", "กรอกจำนวนบุคลากร", "", 9, "TRUE"],
      ["cat_09", "9. อาคาร สถานที่ และสภาพแวดล้อม", "sec_01", "อาคารสถานที่", "field_facility_summary", "สรุปข้อมูลอาคารสถานที่และสิ่งอำนวยความสะดวก", "textarea", "TRUE", "ระบุสภาพอาคารสถานที่", "", 10, "TRUE"],
      ["cat_10", "10. ห้องสมุดและแหล่งเรียนรู้", "sec_01", "แหล่งเรียนรู้", "field_library_info", "ข้อมูลห้องสมุด สถิติการใช้บริการ และแหล่งเรียนรู้", "textarea", "TRUE", "ระบุสถิติและข้อมูลห้องสมุด", "", 11, "TRUE"],
      ["cat_11", "11. ระบบดิจิทัลและหลักฐานสารสนเทศ", "sec_01", "โครงสร้างพื้นฐาน ICT", "field_ict_infrastructure", "สรุประบบดิจิทัล สื่อ ICT และลิงก์หลักฐานอ้างอิง", "textarea", "TRUE", "ระบุระบบ ICT และลิงก์อ้างอิง", "", 12, "TRUE"],
      ["cat_12", "12. รางวัลครู และรางวัลนักเรียน", "sec_01", "รางวัลและความภาคภูมิใจของครู", "field_teacher_awards", "รายการรางวัลและความภาคภูมิใจของครู", "textarea", "FALSE", "สรุปรายการรางวัลและผลงานดีเด่นของครูและบุคลากร", "", 13, "TRUE"],
      ["cat_12", "12. รางวัลครู และรางวัลนักเรียน", "sec_01", "รางวัลและความภาคภูมิใจของนักเรียน", "field_student_awards", "รายการรางวัลและความภาคภูมิใจของนักเรียน", "textarea", "FALSE", "สรุปรายการรางวัลและความภาคภูมิใจของนักเรียน", "", 14, "TRUE"]
    ];

    categoriesSheet.getRange(1, 1, 1, headers[0].length).setValues(headers).setFontWeight("bold").setBackground("#f1f5f9");
    categoriesSheet.getRange(2, 1, defaultCategories.length, defaultCategories[0].length).setValues(defaultCategories);
  }
};
