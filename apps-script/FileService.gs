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

    var folder = this.getUploadFolder();
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
