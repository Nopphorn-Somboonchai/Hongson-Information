/**
 * HONGSON Information Hub — Main Apps Script Controller
 * Route incoming web API requests and return formatted JSON response.
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "ping";
  var response;

  switch (action) {
    case "ping":
      response = { success: true, message: "HONGSON Information Hub API is online", timestamp: new Date().toISOString() };
      break;

    case "getPublicConfig":
      response = { success: true, config: CONFIG.getPublicConfig() };
      break;

    case "setupSheets":
      response = SheetService.setupSheets();
      break;

    default:
      response = { success: false, message: "Unrecognized GET action: " + action };
  }

  return createJsonResponse(response);
}

function doPost(e) {
  var data = {};
  try {
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }
  } catch (err) {
    return createJsonResponse({ success: false, message: "Invalid JSON payload: " + err.toString() });
  }

  var action = data.action || "";
  var response;

  switch (action) {
    case "verifyCode":
      response = Auth.verifyCode(data.code);
      break;

    case "setupSheets":
      if (!Auth.verifySessionToken(data.sessionToken, "admin")) {
        response = { success: false, message: "สิทธิ์การเข้าถึงไม่ถูกต้อง หรือ Session หมดอายุ" };
      } else {
        response = SheetService.setupSheets();
      }
      break;

    case "getPublicConfig":
      response = { success: true, config: CONFIG.getPublicConfig() };
      break;

    default:
      response = { success: false, message: "Unrecognized POST action: " + action };
  }

  return createJsonResponse(response);
}

/**
 * Output helper to craft JSON response with standard CORS settings
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
