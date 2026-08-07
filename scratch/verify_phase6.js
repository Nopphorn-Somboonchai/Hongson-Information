/**
 * HONGSON Information Hub — Phase 6 E2E & QA Verification Suite
 * Tests JavaScript syntax, DOM ID alignment, Apps Script logic integrity,
 * Data validation rules, Report building logic, and Edge case scenarios.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('🚀 HONGSON Information Hub — Phase 6 E2E Verification');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// ------------------------------------------------------------------
// 1. JavaScript Syntax Verification (Frontend JS Files)
// ------------------------------------------------------------------
console.log('▶ TEST GROUP 1: Frontend JavaScript Syntax Verification');
const jsFiles = ['api.js', 'auth.js', 'app.js', 'form.js', 'admin.js'];

jsFiles.forEach(file => {
  const filePath = path.join(ROOT_DIR, 'assets', 'js', file);
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    new vm.Script(code);
    assert(true, `assets/js/${file} syntax check`);
  } catch (err) {
    assert(false, `assets/js/${file} syntax error: ${err.message}`);
  }
});

// ------------------------------------------------------------------
// 2. Apps Script (.gs) Syntax Verification
// ------------------------------------------------------------------
console.log('\n▶ TEST GROUP 2: Apps Script (.gs) Syntax Verification');
const gsFiles = [
  'Code.gs',
  'Config.gs',
  'Auth.gs',
  'SheetService.gs',
  'FileService.gs',
  'SubmissionService.gs',
  'AdminService.gs',
  'ReportService.gs',
  'ValidationService.gs'
];

gsFiles.forEach(file => {
  const filePath = path.join(ROOT_DIR, 'apps-script', file);
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    new vm.Script(code);
    assert(true, `apps-script/${file} syntax check`);
  } catch (err) {
    assert(false, `apps-script/${file} syntax error: ${err.message}`);
  }
});

// ------------------------------------------------------------------
// 3. DOM Element IDs Alignment Check (index.html vs JS files)
// ------------------------------------------------------------------
console.log('\n▶ TEST GROUP 3: DOM Element IDs Alignment Check');
const htmlContent = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');

const idRegex = /id=["']([^"']+)["']/g;
const htmlIds = new Set();
let match;
while ((match = idRegex.exec(htmlContent)) !== null) {
  htmlIds.add(match[1]);
}

const requiredIds = [
  'view-landing',
  'view-contributor',
  'view-admin',
  'btn-open-contributor',
  'btn-open-admin',
  'auth-modal',
  'auth-modal-title',
  'input-auth-code',
  'btn-submit-auth',
  'category-grid-container',
  'category-select-section',
  'form-render-section',
  'selected-category-title',
  'dynamic-fields-container',
  'file-drop-zone',
  'file-input-hidden',
  'attached-files-list',
  'contributor-submit-form',
  'btn-submit-contributor-data',
  'submission-summary-modal',
  'summary-modal-body',
  'admin-search-input',
  'admin-filter-category',
  'admin-filter-status',
  'admin-submissions-tbody',
  'admin-edit-modal',
  'admin-report-modal',
  'btn-open-report-builder',
  'btn-start-generate-report',
  'report-progress-bar',
  'report-history-tbody',
  'settings-modal',
  'btn-open-settings',
  'input-webapp-url',
  'settings-form'
];

requiredIds.forEach(id => {
  assert(htmlIds.has(id), `DOM Element ID #${id} exists in index.html`);
});

// ------------------------------------------------------------------
// 4. Data Validation Engine Unit & Edge Case Simulation
// ------------------------------------------------------------------
console.log('\n▶ TEST GROUP 4: Data Validation Engine & Edge Cases');
const validationCode = fs.readFileSync(path.join(ROOT_DIR, 'apps-script', 'ValidationService.gs'), 'utf8');

const sandbox = {
  console: console,
  result: null
};
vm.createContext(sandbox);
vm.runInContext(validationCode, sandbox);

// Valid Submission Simulation
const validPayload = {
  senderName: 'สมชาย ใจดี',
  senderDepartment: 'กลุ่มสาระวิทยาศาสตร์',
  senderPhone: '0812345678',
  academicYear: '2568',
  dataAsOfDate: '2568-03-31',
  categoryId: 'cat_01',
  data: {
    school_vision: 'มุ่งมั่นพัฒนาการศึกษา',
    student_pass_percent: '85.5'
  },
  files: []
};

const validRes = sandbox.ValidationService.validateSubmission(validPayload);
assert(validRes.valid === true, 'Validation passes for valid submission payload');

// Edge Case 1: Missing Required Sender Fields
const missingSenderPayload = Object.assign({}, validPayload, { senderName: '' });
const missingSenderRes = sandbox.ValidationService.validateSubmission(missingSenderPayload);
assert(missingSenderRes.valid === false && missingSenderRes.errors.some(e => e.includes('ชื่อ-นามสกุล')), 'Validation rejects missing sender name');

// Edge Case 2: Invalid Academic Year (Out of range)
const invalidYearPayload = Object.assign({}, validPayload, { academicYear: '1999' });
const invalidYearRes = sandbox.ValidationService.validateSubmission(invalidYearPayload);
assert(invalidYearRes.valid === false && invalidYearRes.errors.some(e => e.includes('ปีการศึกษา')), 'Validation rejects invalid academic year');

// Edge Case 3: Percentage out of 0-100 range
const invalidPercentPayload = JSON.parse(JSON.stringify(validPayload));
invalidPercentPayload.data.student_pass_percent = '150';
const invalidPercentRes = sandbox.ValidationService.validateSubmission(invalidPercentPayload);
assert(invalidPercentRes.valid === false && invalidPercentRes.errors.some(e => e.includes('100')), 'Validation rejects percentage > 100%');

// Edge Case 4: Oversized file simulation (> 25MB Base64)
const oversizedFilePayload = JSON.parse(JSON.stringify(validPayload));
oversizedFilePayload.files = [{
  name: 'huge_document.pdf',
  mimeType: 'application/pdf',
  base64Data: 'A'.repeat(35 * 1024 * 1024) // ~35MB
}];
const oversizedRes = sandbox.ValidationService.validateSubmission(oversizedFilePayload);
assert(oversizedRes.valid === false && oversizedRes.errors.some(e => e.includes('ใหญ่เกินกำหนด')), 'Validation rejects oversized file (> 25MB Base64)');

// Edge Case 5: Invalid File Type
const invalidMimePayload = JSON.parse(JSON.stringify(validPayload));
invalidMimePayload.files = [{
  name: 'malicious.exe',
  mimeType: 'application/x-msdownload',
  base64Data: 'A'.repeat(1024)
}];
const invalidMimeRes = sandbox.ValidationService.validateSubmission(invalidMimePayload);
assert(invalidMimeRes.valid === false && invalidMimeRes.errors.some(e => e.includes('ไม่รองรับประเภทชนิดไฟล์นี้')), 'Validation rejects unallowed MIME type (.exe)');

// Valid File Case: Office documents (.xlsx, .docx)
const excelFilePayload = JSON.parse(JSON.stringify(validPayload));
excelFilePayload.files = [{
  name: 'รายชื่อ.xlsx',
  mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  base64Data: 'A'.repeat(1024)
}];
const excelRes = sandbox.ValidationService.validateSubmission(excelFilePayload);
assert(excelRes.valid === true, 'Validation accepts valid .xlsx Excel document');

// ------------------------------------------------------------------
// 5. Admin & Report Builder Logic Verification
// ------------------------------------------------------------------
console.log('\n▶ TEST GROUP 5: Admin & Report Builder Logic Verification');

const adminJs = fs.readFileSync(path.join(ROOT_DIR, 'assets', 'js', 'admin.js'), 'utf8');

assert(adminJs.includes('escapeHtml: function'), 'admin.js contains escapeHtml helper method');
assert(adminJs.includes('openReportModal'), 'admin.js contains openReportModal function');
assert(adminJs.includes('startReportGeneration'), 'admin.js contains startReportGeneration function');
assert(adminJs.includes('admin-file-layout'), 'admin.js contains Photo Layout selector');

const reportGs = fs.readFileSync(path.join(ROOT_DIR, 'apps-script', 'ReportService.gs'), 'utf8');
assert(reportGs.includes('generateReport: function'), 'ReportService.gs contains generateReport method');
assert(reportGs.includes('getExportHistory: function'), 'ReportService.gs contains getExportHistory method');
assert(reportGs.includes('generateReport'), 'ReportService.gs contains generateReport generator');
assert(reportGs.includes('single_full') || reportGs.includes('pair'), 'ReportService.gs supports Photo Layout types');

// ------------------------------------------------------------------
// 6. Security Secret Review Audit
// ------------------------------------------------------------------
console.log('\n▶ TEST GROUP 6: Security & Secret Review Audit');

const jsFilesAll = fs.readdirSync(path.join(ROOT_DIR, 'assets', 'js')).map(f => path.join(ROOT_DIR, 'assets', 'js', f));
let hardcodedSecretsFound = false;

jsFilesAll.forEach(filePath => {
  const code = fs.readFileSync(filePath, 'utf8');
  if (code.includes('HG-CONTRIB-') || code.includes('HG-ADMIN-')) {
    console.error(`  ⚠️ Secret string found in ${filePath}`);
    hardcodedSecretsFound = true;
  }
});

assert(!hardcodedSecretsFound, 'No hardcoded contributor/admin secrets found in Frontend JavaScript assets');

// ------------------------------------------------------------------
// Summary Report
// ------------------------------------------------------------------
console.log('\n====================================================');
console.log(`📊 Phase 6 Verification Summary: ${passedTests}/${totalTests} Tests Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('====================================================\n');

if (passedTests === totalTests) {
  console.log('🎉 ALL PHASE 6 E2E QA TESTS PASSED SUCCESSFULLY!\n');
} else {
  console.error('❌ SOME TESTS FAILED. PLEASE FIX ISSUES BEFORE DELIVERY.\n');
  process.exit(1);
}
