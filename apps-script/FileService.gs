/**
 * HONGSON Information Hub — File Upload & Drive Storage Service
 */

var FileService = {
  /**
   * Get target Google Drive Folder instance
   */
  getUploadFolder: function() {
    var props = CONFIG.getScriptProps();
    if (props.uploadFolderId) {
      try {
        return DriveApp.getFolderById(props.uploadFolderId);
      } catch (e) {
        Logger.log("Could not open Upload Folder ID: " + props.uploadFolderId + ", falling back to Root Drive.");
      }
    }
    return DriveApp.getRootFolder();
  },

  /**
   * Get category folder name mapping
   * @param {string} categoryId
   * @returns {string} Category Subfolder name
   */
  getCategoryFolderName: function(categoryId) {
    var catMap = {
      "cat_01": "หมวดที่ 01 - ข้อมูลพื้นฐานและอัตลักษณ์สถานศึกษา",
      "cat_02": "หมวดที่ 02 - ธรรมาภิบาล เครือข่าย และชุมชน",
      "cat_03": "หมวดที่ 03 - ทะเบียนนักเรียนและโครงสร้างชั้นเรียน",
      "cat_04": "หมวดที่ 04 - ผลการเรียนและคุณภาพผู้เรียน",
      "cat_05": "หมวดที่ 05 - การทดสอบภายนอก และการศึกษาต่อ",
      "cat_06": "หมวดที่ 06 - หลักสูตร แผนการเรียน และเวลาเรียน",
      "cat_07": "หมวดที่ 07 - นิเทศ การประเมิน และงานวิจัย",
      "cat_08": "หมวดที่ 08 - บุคลากรและการพัฒนาวิชาชีพ",
      "cat_09": "หมวดที่ 09 - อาคาร สถานที่ และสภาพแวดล้อม",
      "cat_10": "หมวดที่ 10 - ห้องสมุดและแหล่งเรียนรู้",
      "cat_11": "หมวดที่ 11 - ระบบดิจิทัลและหลักฐานสารสนเทศ",
      "cat_12": "หมวดที่ 12 - รางวัลครู และรางวัลนักเรียน"
    };
    return catMap[categoryId] || ("หมวด - " + (categoryId || "General"));
  },

  /**
   * Get or create subfolder for a specific work category inside main upload folder
   * @param {Folder} parentFolder
   * @param {string} categoryId
   * @returns {Folder}
   */
  getCategoryFolder: function(parentFolder, categoryId) {
    if (!parentFolder) return DriveApp.getRootFolder();
    var folderName = this.getCategoryFolderName(categoryId);
    try {
      var folders = parentFolder.getFoldersByName(folderName);
      if (folders.hasNext()) {
        return folders.next();
      }
      return parentFolder.createFolder(folderName);
    } catch (e) {
      Logger.log("Could not get/create category subfolder '" + folderName + "': " + e.toString());
      return parentFolder;
    }
  },

  /**
   * Save base64 file to Google Drive and return file metadata
   * @param {Object} fileObj - { name, mimeType, base64Data, caption, fieldId }
   * @param {string} submissionId
   * @param {string} categoryId
   * @returns {Object} Saved file metadata
   */
  saveFile: function(fileObj, submissionId, categoryId) {
    if (!fileObj || !fileObj.base64Data) {
      throw new Error("Missing file payload data");
    }

    var rootFolder = this.getUploadFolder();
    var folder = this.getCategoryFolder(rootFolder, categoryId);
    var bytes = Utilities.base64Decode(fileObj.base64Data);
    var blob = Utilities.newBlob(bytes, fileObj.mimeType || "application/octet-stream", fileObj.name || "upload_file");

    // Format unique file name stored in Drive
    var timestamp = Utilities.formatDate(new Date(), "Asia/Bangkok", "yyyyMMdd_HHmmss");
    var storedName = submissionId + "_" + timestamp + "_" + (fileObj.name || "file");
    blob.setName(storedName);

    var driveFile = folder.createFile(blob);
    
    // Set file permission to viewable by anyone with link if needed for preview
    try {
      driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch(e) {
      Logger.log("Notice: Could not set file sharing to ANYONE_WITH_LINK");
    }

    var fileRecordId = "FILE-" + timestamp + "-" + Math.random().toString(36).substring(2, 7);

    return {
      fileRecordId: fileRecordId,
      submissionId: submissionId,
      categoryId: categoryId,
      fieldId: fileObj.fieldId || "general_files",
      driveFileId: driveFile.getId(),
      originalName: fileObj.name || "file",
      storedName: storedName,
      mimeType: fileObj.mimeType || driveFile.getMimeType(),
      fileSize: driveFile.getSize(),
      caption: fileObj.caption || "",
      activityDate: fileObj.activityDate || Utilities.formatDate(new Date(), "Asia/Bangkok", "yyyy-MM-dd"),
      sortOrder: fileObj.sortOrder || 1,
      includeInReport: "TRUE",
      layout: fileObj.layout || "single",
      uploadedAt: Utilities.formatDate(new Date(), "Asia/Bangkok", "yyyy-MM-dd HH:mm:ss")
    };
  }
};
