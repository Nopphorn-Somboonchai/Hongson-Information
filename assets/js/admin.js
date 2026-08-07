/**
 * HONGSON Information Hub — Admin Dashboard & Submission Management Engine
 */

var AdminEngine = {
  dashboardData: null,
  submissions: [],
  categories: [],
  activeSubmissionDetail: null,
  filterCategory: 'all',
  filterStatus: 'all',
  searchQuery: '',

  init: function () {
    this.bindEvents();
    this.fetchDashboard();
  },

  bindEvents: function () {
    var self = this;

    // Search input handler
    var searchInput = document.getElementById('admin-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', function (e) {
        self.searchQuery = e.target.value.toLowerCase().trim();
        self.applyFilters();
      });
    }

    // Category filter dropdown
    var catSelect = document.getElementById('admin-filter-category');
    if (catSelect) {
      catSelect.addEventListener('change', function (e) {
        self.filterCategory = e.target.value;
        self.applyFilters();
      });
    }

    // Status filter dropdown
    var statusSelect = document.getElementById('admin-filter-status');
    if (statusSelect) {
      statusSelect.addEventListener('change', function (e) {
        self.filterStatus = e.target.value;
        self.applyFilters();
      });
    }

    // Refresh Dashboard button
    var refreshBtn = document.getElementById('btn-admin-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function () {
        self.fetchDashboard();
      });
    }

    // Open Report Builder Modal button
    var reportBtn = document.getElementById('btn-open-report-builder');
    if (reportBtn) {
      reportBtn.addEventListener('click', function () {
        self.openReportModal();
      });
    }
  },

  /**
   * Fetch complete Dashboard overview from Apps Script Backend
   */
  fetchDashboard: async function () {
    var session = AuthManager.getSession();
    if (!session || session.role !== 'admin') {
      return;
    }

    var loadingNotice = document.getElementById('admin-loading-indicator');
    if (loadingNotice) loadingNotice.style.display = 'block';

    try {
      var res = await API.getAdminDashboard(session.sessionToken);
      if (res && res.success) {
        this.dashboardData = res;
        this.submissions = res.submissions || [];
        this.categories = res.categoryStats || [];
        this.renderStatsOverview(res.metrics, res.warnings);
        this.renderCategoryCards(res.categoryStats);
        this.populateCategoryFilterDropdown(res.categoryStats);
        this.applyFilters();
      } else {
        // Render empty/offline fallback view if API fails
        this.renderFallbackView(res ? res.message : "ไม่สามารถโหลดข้อมูลจากเซิร์ฟเวอร์ได้");
      }
    } catch (err) {
      console.error("Fetch Dashboard Error:", err);
      this.renderFallbackView("เกิดข้อผิดพลาดในการโหลดข้อมูล Admin Dashboard");
    } finally {
      if (loadingNotice) loadingNotice.style.display = 'none';
    }
  },

  renderFallbackView: function (msg) {
    var container = document.getElementById('admin-dashboard-container');
    if (container) {
      container.innerHTML = `
        <div class="alert alert-warning" style="margin-bottom: 1.5rem;">
          <strong>⚠️ โหมดออฟไลน์ / ข้อผิดพลาด:</strong> ${msg}
          <br><small>กรุณาตรวจสอบการตั้งค่า Apps Script Web App URL หรือรหัสเข้าใช้งาน</small>
        </div>
      `;
    }
  },

  /**
   * Render Top Statistics Overview Cards & Warnings
   */
  renderStatsOverview: function (metrics, warnings) {
    var statsContainer = document.getElementById('admin-stats-overview');
    if (!statsContainer) return;

    var m = metrics || { completenessPercentage: 0, submittedCategoriesCount: 0, totalCategories: 11, totalSubmissionsCount: 0, pendingReviewCount: 0 };

    statsContainer.innerHTML = `
      <div class="stat-card accent">
        <div class="stat-icon">📊</div>
        <div class="stat-value">${m.completenessPercentage}%</div>
        <div class="stat-label">ความครอบคลุมสารสนเทศ (${m.submittedCategoriesCount}/${m.totalCategories} หมวด)</div>
        <div class="progress-bar-bg" style="margin-top: 0.5rem; height: 6px; background: rgba(255,255,255,0.2); border-radius: 4px; overflow: hidden;">
          <div class="progress-bar-fill" style="width: ${m.completenessPercentage}%; height: 100%; background: var(--accent-light); transition: width 0.4s ease;"></div>
        </div>
      </div>
      <div class="stat-card primary">
        <div class="stat-icon">📥</div>
        <div class="stat-value">${m.totalSubmissionsCount}</div>
        <div class="stat-label">รายการส่งข้อมูลทั้งหมด</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-icon">⏳</div>
        <div class="stat-value">${m.pendingReviewCount}</div>
        <div class="stat-label">รายการรอ Admin ตรวจสอบ</div>
      </div>
      <div class="stat-card info">
        <div class="stat-icon">⚠️</div>
        <div class="stat-value">${warnings ? warnings.length : 0}</div>
        <div class="stat-label">ข้อสังเกต / ข้อความเตือน</div>
      </div>
    `;

    // Render Warnings Box if present
    var warningContainer = document.getElementById('admin-warnings-box');
    if (warningContainer) {
      if (warnings && warnings.length > 0) {
        warningContainer.style.display = 'block';
        warningContainer.innerHTML = `
          <div class="alert alert-warning" style="margin-bottom: 1.5rem;">
            <strong>⚠️ ตรวจพบข้อสังเกตเกี่ยวกับความครบถ้วนของข้อมูล (${warnings.length} รายการ):</strong>
            <ul style="margin-top: 0.5rem; margin-bottom: 0; padding-left: 1.25rem; font-size: 0.9rem;">
              ${warnings.map(w => `<li>${w}</li>`).join('')}
            </ul>
          </div>
        `;
      } else {
        warningContainer.style.display = 'none';
      }
    }
  },

  /**
   * Render Grid Cards for 11 Categories
   */
  renderCategoryCards: function (categoryStats) {
    var container = document.getElementById('admin-category-cards-grid');
    if (!container) return;

    if (!categoryStats || categoryStats.length === 0) {
      container.innerHTML = `<p class="text-muted">ไม่พบข้อมูลหมวดสารสนเทศ</p>`;
      return;
    }

    var html = categoryStats.map(cat => {
      var isSubmitted = cat.submissionCount > 0;
      var statusBadge = isSubmitted
        ? `<span class="badge badge-success">✓ ส่งแล้ว (${cat.submissionCount})</span>`
        : `<span class="badge badge-warning">⏳ ยังไม่ส่ง</span>`;

      return `
        <div class="admin-cat-card ${isSubmitted ? 'submitted' : 'missing'}" onclick="AdminEngine.filterByCategory('${cat.id}')">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
            <strong style="color: var(--text-heading); font-size: 0.95rem;">${cat.name}</strong>
            ${statusBadge}
          </div>
          <div style="margin-top: 0.75rem; font-size: 0.85rem; color: var(--text-muted);">
            ${isSubmitted
          ? `ผู้ส่งล่าสุด: <strong>${cat.lastSenderName || '-'}</strong><br>ส่งเมื่อ: ${cat.lastSubmittedAt || '-'}`
          : `ยังไม่มีผู้รับผิดชอบส่งข้อมูลหมวดนี้`}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  },

  populateCategoryFilterDropdown: function (categoryStats) {
    var catSelect = document.getElementById('admin-filter-category');
    if (!catSelect) return;

    var currentVal = catSelect.value || 'all';
    var optionsHtml = `<option value="all">📂 ทุกหมวดสารสนเทศ (11 หมวด)</option>`;
    optionsHtml += categoryStats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    catSelect.innerHTML = optionsHtml;
    catSelect.value = currentVal;
  },

  filterByCategory: function (catId) {
    this.filterCategory = catId;
    var catSelect = document.getElementById('admin-filter-category');
    if (catSelect) catSelect.value = catId;
    this.applyFilters();
  },

  /**
   * Apply Search & Category/Status Filters to Submissions List
   */
  applyFilters: function () {
    var self = this;
    var filtered = this.submissions.filter(sub => {
      // Category filter
      if (self.filterCategory !== 'all' && sub.categoryId !== self.filterCategory) {
        return false;
      }
      // Status filter
      if (self.filterStatus !== 'all' && sub.status !== self.filterStatus) {
        return false;
      }
      // Search query filter
      if (self.searchQuery) {
        var matchId = sub.submissionId.toLowerCase().includes(self.searchQuery);
        var matchSender = (sub.senderName || '').toLowerCase().includes(self.searchQuery);
        var matchDept = (sub.senderDepartment || '').toLowerCase().includes(self.searchQuery);
        var matchCat = (sub.categoryName || '').toLowerCase().includes(self.searchQuery);
        if (!matchId && !matchSender && !matchDept && !matchCat) return false;
      }
      return true;
    });

    this.renderSubmissionsTable(filtered);
  },

  /**
   * Render Submissions Data Table
   */
  renderSubmissionsTable: function (submissionsList) {
    var tbody = document.getElementById('admin-submissions-tbody');
    var countEl = document.getElementById('admin-filtered-count');

    if (countEl) countEl.textContent = `แสดง ${submissionsList.length} จาก ${this.submissions.length} รายการ`;
    if (!tbody) return;

    if (submissionsList.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">
            🔍 ไม่พบข้อมูล Submission ที่ตรงกับเงื่อนไขการค้นหา
          </td>
        </tr>
      `;
      return;
    }

    var self = this;
    tbody.innerHTML = submissionsList.map((sub, idx) => {
      var statusBadge = '';
      switch (sub.status) {
        case 'reviewed':
          statusBadge = `<span class="badge badge-success">✓ ตรวจแล้ว</span>`;
          break;
        case 'needs_review':
          statusBadge = `<span class="badge badge-warning">⚠️ ต้องแก้ไข</span>`;
          break;
        case 'excluded':
          statusBadge = `<span class="badge badge-muted">🚫 คัดออก</span>`;
          break;
        default:
          statusBadge = `<span class="badge badge-info">📥 ส่งแล้ว</span>`;
      }

      var selectedCheck = sub.selectedForReport
        ? `<input type="checkbox" checked onchange="AdminEngine.handleToggleReport('${sub.submissionId}', this.checked)" title="เลือกสำหรับสร้างรายงาน">`
        : `<input type="checkbox" onchange="AdminEngine.handleToggleReport('${sub.submissionId}', this.checked)" title="เลือกสำหรับสร้างรายงาน">`;

      return `
        <tr>
          <td>${idx + 1}</td>
          <td>
            <strong style="font-family: monospace; color: var(--accent-light); font-size: 0.85rem;">${sub.submissionId}</strong>
          </td>
          <td><strong>${sub.categoryName || sub.categoryId}</strong></td>
          <td>
            <div>${sub.senderName || '-'}</div>
            <small style="color: var(--text-muted); display: block;">${sub.senderDepartment || ''} ${sub.senderPhone ? '📞 ' + this.formatPhone(sub.senderPhone) : ''}</small>
            ${sub.senderNote ? `<small style="color: var(--color-accent-light, #3b82f6); display: block;" title="หมายเหตุผู้ส่ง">💬 หมายเหตุผู้ส่ง: <strong>${this.escapeHtml(sub.senderNote)}</strong></small>` : ''}
          </td>
          <td style="font-size: 0.85rem;">${sub.submittedAt || '-'}</td>
          <td style="text-align: center;">
            <span class="badge badge-secondary" style="font-size: 0.8rem;">📎 ${sub.fileCount} ไฟล์</span>
          </td>
          <td style="text-align: center;">${selectedCheck}</td>
          <td style="text-align: center;">${statusBadge}</td>
          <td style="text-align: center;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="AdminEngine.openDetailModal('${sub.submissionId}')">
              👁️ ตรวจสอบ/แก้ไข
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  /**
   * Handle Quick Checkbox Toggle for Report Selection
   */
  handleToggleReport: async function (submissionId, selected) {
    var session = AuthManager.getSession();
    if (!session || session.role !== 'admin') return;

    var res = await API.toggleReportSelection(session.sessionToken, submissionId, selected);
    if (res && res.success) {
      var target = this.submissions.find(s => s.submissionId === submissionId);
      if (target) target.selectedForReport = selected;
    } else {
      alert("ไม่สามารถเปลี่ยนสถานะได้: " + (res ? res.message : "เกิดข้อผิดพลาด"));
      this.fetchDashboard();
    }
  },

  /**
   * Open Submission Review & Edit Modal
   */
  openDetailModal: async function (submissionId) {
    var session = AuthManager.getSession();
    if (!session || session.role !== 'admin') return;

    var modal = document.getElementById('admin-edit-modal');
    var modalBody = document.getElementById('admin-edit-modal-body');
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
      <div style="text-align: center; padding: 3rem;">
        <div class="spinner" style="width: 2.5rem; height: 2.5rem; margin-bottom: 1rem;"></div>
        <p>กำลังโหลดข้อมูลรายละเอียด Submission ${submissionId}...</p>
      </div>
    `;
    modal.classList.add('active');

    try {
      var res = await API.getSubmissionDetail(session.sessionToken, submissionId);
      if (res && res.success) {
        this.activeSubmissionDetail = res;
        this.renderEditForm(res);
      } else {
        modalBody.innerHTML = `
          <div class="alert alert-danger">
            <strong>⚠️ เกิดข้อผิดพลาด:</strong> ${res ? res.message : "ไม่พบข้อมูล"}
          </div>
        `;
      }
    } catch (err) {
      console.error("Open Detail Modal Error:", err);
      modalBody.innerHTML = `
        <div class="alert alert-danger">
          <strong>⚠️ เกิดข้อผิดพลาดในการโหลดข้อมูล</strong>
        </div>
      `;
    }
  },

  /**
   * Render Edit Form inside Admin Detail Modal
   */
  renderEditForm: function (detailData) {
    var modalBody = document.getElementById('admin-edit-modal-body');
    if (!modalBody) return;

    var sub = detailData.submission;
    var fields = detailData.fieldValues || {};
    var files = detailData.files || [];

    // Find schema for category
    var catSchema = (FormEngine.defaultCategories || []).find(c => c.id === sub.categoryId) || { fields: [] };

    var html = `
      <div class="dashboard-header" style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
        <div>
          <h3 style="margin: 0; color: var(--accent-light);">📝 ตรวจสอบและแก้ไข Submission: ${sub.submissionId}</h3>
          <small style="color: var(--text-muted);">ส่งเมื่อ: ${sub.submittedAt}</small>
        </div>
      </div>

      <form id="admin-submission-edit-form" onsubmit="AdminEngine.handleSaveEdit(event)">
        <!-- Section A: Metadata & Status Controls -->
        <div class="form-section-card">
          <h4>👤 ข้อมูลผู้ส่งและสถานะรายการ</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
            <div class="form-group">
              <label class="form-label">ชื่อผู้ส่งข้อมูล</label>
              <input type="text" id="edit-sender-name" class="form-control" value="${this.escapeHtml(sub.senderName || '')}" required>
            </div>
            <div class="form-group">
              <label class="form-label">ฝ่าย / งาน / กลุ่มสาระ</label>
              <input type="text" id="edit-sender-dept" class="form-control" value="${this.escapeHtml(sub.senderDepartment || '')}" required>
            </div>
            <div class="form-group">
              <label class="form-label">เบอร์โทรศัพท์</label>
              <input type="text" id="edit-sender-phone" class="form-control" value="${this.escapeHtml(this.formatPhone(sub.senderPhone || ''))}">
            </div>
            <div class="form-group">
              <label class="form-label">ข้อมูล ณ วันที่</label>
              <input type="date" id="edit-data-date" class="form-control" value="${this.formatDateForInput(sub.dataAsOfDate)}">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-top: 0.5rem;">
            <div class="form-group">
              <label class="form-label">สถานะการตรวจสอบ (Status)</label>
              <select id="edit-status" class="form-control" style="font-weight: 600;">
                <option value="submitted" ${sub.status === 'submitted' ? 'selected' : ''}>📥 submitted (รอตรวจ)</option>
                <option value="needs_review" ${sub.status === 'needs_review' ? 'selected' : ''}>⚠️ needs_review (ต้องแก้ไขเพิ่มเติม)</option>
                <option value="reviewed" ${sub.status === 'reviewed' ? 'selected' : ''}>✓ reviewed (ตรวจเรียบร้อยแล้ว)</option>
                <option value="excluded" ${sub.status === 'excluded' ? 'selected' : ''}>🚫 excluded (คัดออกจากรายงาน)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">การเลือกใช้ในรายงาน PDF</label>
              <select id="edit-selected-report" class="form-control">
                <option value="true" ${sub.selectedForReport ? 'selected' : ''}>✅ นำไปใช้ในรายงาน PDF</option>
                <option value="false" ${!sub.selectedForReport ? 'selected' : ''}>❌ ไม่นำไปใช้ในรายงาน PDF</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-top: 0.5rem;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="color: var(--accent-light); font-weight: 600;">💬 หมายเหตุจากผู้ส่ง (Contributor Note)</label>
              <input type="text" id="edit-sender-note" class="form-control" placeholder="ไม่มีหมายเหตุจากผู้ส่ง" value="${this.escapeHtml(sub.senderNote || '')}">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 600;">📝 หมายเหตุ Admin (Admin Note)</label>
              <input type="text" id="edit-admin-note" class="form-control" placeholder="บันทึกข้อความสำหรับ Admin เช่น ข้อมูลปรับแก้ตัวเลขแล้ว..." value="${this.escapeHtml(sub.adminNote || '')}">
            </div>
          </div>
        </div>

        <!-- Section B: Category Fields & Dynamic Tables -->
        <div class="form-section-card">
          <h4>📋 ข้อมูลสารสนเทศ ( editable fields )</h4>
          <div id="admin-fields-container" style="margin-top: 1rem;">
            ${this.renderEditableFields(catSchema.fields, fields)}
          </div>
        </div>

        <!-- Section C: File Attachments Manager -->
        <div class="form-section-card">
          <h4>📎 จัดการไฟล์และรูปภาพหลักฐาน (${files.length} ไฟล์)</h4>
          <p class="form-help-text">ท่านสามารถปรับเปลี่ยน Caption, สลับ Include/Exclude รายรูป และกำหนด Photo Layout สำหรับสร้าง PDF ได้ที่นี่</p>
          <div id="admin-files-container" style="margin-top: 1rem;">
            ${this.renderFilesManager(files)}
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
          <button type="button" class="btn btn-secondary" onclick="AdminEngine.closeDetailModal()">ยกเลิก</button>
          <button type="submit" class="btn btn-primary btn-lg" id="btn-save-admin-edit">
            💾 บันทึกการแก้ไขข้อมูล
          </button>
        </div>
      </form>
    `;

    modalBody.innerHTML = html;
  },

  /**
   * Helper to render editable schema fields & dynamic tables
   */
  renderEditableFields: function (schemaFields, currentValues) {
    if (!schemaFields || schemaFields.length === 0) {
      // Fallback if schema not pre-defined: render raw keys
      var keys = Object.keys(currentValues);
      if (keys.length === 0) return `<p class="text-muted">ไม่มีข้อมูลฟิลด์</p>`;
      return keys.map(k => {
        var val = currentValues[k];
        if (Array.isArray(val)) {
          return this.renderEditableTable(k, k, val);
        } else {
          return `
            <div class="form-group">
              <label class="form-label">${k}</label>
              <input type="text" class="form-control admin-field-input" data-field-id="${k}" value="${this.escapeHtml(val || '')}">
            </div>
          `;
        }
      }).join('');
    }

    return schemaFields.map(f => {
      var val = currentValues[f.fieldId] !== undefined ? currentValues[f.fieldId] : '';
      if (f.type === 'dynamic_table') {
        var tableData = Array.isArray(val) ? val : [];
        return this.renderEditableTable(f.fieldId, f.label, tableData);
      } else if (f.type === 'textarea') {
        return `
          <div class="form-group">
            <label class="form-label">${f.label}</label>
            <textarea class="form-control admin-field-input" data-field-id="${f.fieldId}" rows="4">${this.escapeHtml(val)}</textarea>
          </div>
        `;
      } else {
        return `
          <div class="form-group">
            <label class="form-label">${f.label}</label>
            <input type="${f.type === 'number' ? 'number' : 'text'}" class="form-control admin-field-input" data-field-id="${f.fieldId}" value="${this.escapeHtml(val)}">
          </div>
        `;
      }
    }).join('');
  },

  /**
   * Helper to render editable dynamic table
   */
  renderEditableTable: function (fieldId, label, tableRows) {
    var sampleObj = tableRows.length > 0 ? tableRows[0] : { "รายการ/หัวข้อ": "", "จำนวน/รายละเอียด": "" };
    var headers = Object.keys(sampleObj);

    var rowsHtml = tableRows.map((rowObj, rIdx) => {
      var cellsHtml = headers.map(h => {
        return `<td><input type="text" class="form-control form-control-sm admin-table-cell" data-field-id="${fieldId}" data-row="${rIdx}" data-col="${h}" value="${this.escapeHtml(rowObj[h] || '')}"></td>`;
      }).join('');
      return `
        <tr data-table-row-id="${rIdx}">
          ${cellsHtml}
          <td style="text-align: center;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="this.closest('tr').remove()" style="color: var(--danger);">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="form-group" style="margin-bottom: 1.5rem;">
        <label class="form-label" style="font-weight: 600; color: var(--accent-light);">📊 ${label}</label>
        <div class="dynamic-table-container">
          <table class="dynamic-table" id="admin-table-${fieldId}">
            <thead>
              <tr>
                ${headers.map(h => `<th>${h}</th>`).join('')}
                <th style="width: 50px;">ลบ</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  /**
   * Helper to render Files Manager List in Admin Modal
   */
  renderFilesManager: function (filesList) {
    if (!filesList || filesList.length === 0) {
      return `<p class="text-muted">ไม่มีไฟล์เอกสารหรือรูปภาพแนบใน Submission นี้</p>`;
    }

    return filesList.map((file, idx) => {
      var isImage = (file.mimeType || '').startsWith('image/');
      var previewThumb = isImage
        ? `<div class="file-icon" style="background: var(--bg-card-hover); display:flex; align-items:center; justify-content:center; font-size:1.5rem;">🖼️</div>`
        : `<div class="file-icon" style="background: var(--bg-card-hover); display:flex; align-items:center; justify-content:center; font-size:1.5rem;">📄</div>`;

      var driveLink = file.driveViewUrl
        ? `<a href="${file.driveViewUrl}" target="_blank" class="btn btn-secondary btn-sm" style="font-size:0.8rem;">🔗 เปิดใน Google Drive</a>`
        : '';

      return `
        <div class="file-edit-item-card" data-file-record-id="${file.fileRecordId}" style="background: var(--bg-primary); border: 1px solid var(--border-color); padding: 1rem; border-radius: var(--radius-sm); margin-bottom: 1rem;">
          <div style="display: flex; gap: 1rem; align-items: flex-start; flex-wrap: wrap;">
            ${previewThumb}
            <div style="flex: 1; min-width: 200px;">
              <strong style="color: var(--text-heading); font-size: 0.95rem;">${this.escapeHtml(file.originalName)}</strong>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">
                ขนาด: ${Math.round((file.fileSize || 0) / 1024)} KB | MIME: ${file.mimeType} | อัปโหลด: ${file.uploadedAt}
              </div>
              <div style="margin-top: 0.5rem;">${driveLink}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <label style="font-size: 0.85rem; font-weight: 600; cursor: pointer;">
                <input type="checkbox" class="admin-file-include-check" ${file.includeInReport ? 'checked' : ''}> ใช้ในรายงาน PDF
              </label>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px dashed var(--border-color);">
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 0.8rem;">คำอธิบายภาพ/ไฟล์ (Caption)</label>
              <input type="text" class="form-control form-control-sm admin-file-caption" value="${this.escapeHtml(file.caption || '')}" placeholder="ระบุคำบรรยายรูป...">
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 0.8rem;">ลำดับการแสดงผล (Sort Order)</label>
              <input type="number" class="form-control form-control-sm admin-file-sort" value="${file.sortOrder || (idx + 1)}" min="1">
            </div>
            ${isImage ? `
              <div class="form-group" style="margin: 0;">
                <label class="form-label" style="font-size: 0.8rem;">รูปแบบวางภาพ (Layout)</label>
                <select class="form-control form-control-sm admin-file-layout">
                  <option value="single" ${file.layout === 'single' ? 'selected' : ''}>🖼️ ภาพเดี่ยว (Single)</option>
                  <option value="pair" ${file.layout === 'pair' ? 'selected' : ''}>🖼️🖼️ ภาพคู่ (Pair 2x1)</option>
                  <option value="grid" ${file.layout === 'grid' ? 'selected' : ''}>🧩 ภาพชุด (Grid 2x2)</option>
                  <option value="full" ${file.layout === 'full' ? 'selected' : ''}>📑 เต็มหน้า (Full Page)</option>
                </select>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Handle Save Changes from Admin Detail Modal
   */
  handleSaveEdit: async function (e) {
    e.preventDefault();
    if (!this.activeSubmissionDetail) return;

    var session = AuthManager.getSession();
    if (!session || session.role !== 'admin') return;

    var submitBtn = document.getElementById('btn-save-admin-edit');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner"></span> กำลังบันทึก...`;
    }

    var subId = this.activeSubmissionDetail.submission.submissionId;

    // Gather Metadata
    var senderName = document.getElementById('edit-sender-name')?.value;
    var senderDept = document.getElementById('edit-sender-dept')?.value;
    var senderPhone = document.getElementById('edit-sender-phone')?.value;
    var dataDate = document.getElementById('edit-data-date')?.value;
    var status = document.getElementById('edit-status')?.value;
    var selectedForReport = document.getElementById('edit-selected-report')?.value === 'true';
    var senderNote = document.getElementById('edit-sender-note')?.value;
    var adminNote = document.getElementById('edit-admin-note')?.value;

    // Gather Field Values
    var fieldValues = {};
    document.querySelectorAll('.admin-field-input').forEach(input => {
      var fid = input.getAttribute('data-field-id');
      if (fid) fieldValues[fid] = input.value;
    });

    // Gather Dynamic Tables
    var tables = document.querySelectorAll('.dynamic-table[id^="admin-table-"]');
    tables.forEach(tbl => {
      var fid = tbl.id.replace('admin-table-', '');
      var rowsData = [];
      var headers = Array.from(tbl.querySelectorAll('thead th')).map(th => th.textContent.trim()).filter(h => h !== 'ลบ');

      tbl.querySelectorAll('tbody tr').forEach(tr => {
        var rowObj = {};
        var cells = tr.querySelectorAll('.admin-table-cell');
        cells.forEach((cell, cIdx) => {
          var colName = headers[cIdx] || `col_${cIdx}`;
          rowObj[colName] = cell.value;
        });
        if (Object.keys(rowObj).length > 0) {
          rowsData.push(rowObj);
        }
      });
      fieldValues[fid] = rowsData;
    });

    // Gather Files Meta
    var filesMeta = [];
    document.querySelectorAll('.file-edit-item-card').forEach(card => {
      var recordId = card.getAttribute('data-file-record-id');
      var includeCheck = card.querySelector('.admin-file-include-check');
      var captionInput = card.querySelector('.admin-file-caption');
      var sortInput = card.querySelector('.admin-file-sort');
      var layoutSelect = card.querySelector('.admin-file-layout');

      filesMeta.push({
        fileRecordId: recordId,
        includeInReport: includeCheck ? includeCheck.checked : true,
        caption: captionInput ? captionInput.value : '',
        sortOrder: sortInput ? parseInt(sortInput.value, 10) : 1,
        layout: layoutSelect ? layoutSelect.value : 'single'
      });
    });

    var payload = {
      submissionId: subId,
      senderName: senderName,
      senderDepartment: senderDept,
      senderPhone: senderPhone,
      dataAsOfDate: dataDate,
      status: status,
      selectedForReport: selectedForReport,
      senderNote: senderNote,
      adminNote: adminNote,
      fieldValues: fieldValues,
      filesMeta: filesMeta
    };

    try {
      var res = await API.updateSubmission(session.sessionToken, payload);
      if (res && res.success) {
        alert("บันทึกการแก้ไขเรียบร้อยแล้ว");
        this.closeDetailModal();
        this.fetchDashboard();
      } else {
        alert("ไม่สามารถบันทึกได้: " + (res ? res.message : "เกิดข้อผิดพลาด"));
      }
    } catch (err) {
      console.error("Save Edit Error:", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อบันทึกข้อมูล");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "💾 บันทึกการแก้ไขข้อมูล";
      }
    }
  },

  closeDetailModal: function () {
    var modal = document.getElementById('admin-edit-modal');
    if (modal) modal.classList.remove('active');
    this.activeSubmissionDetail = null;
  },

  /**
   * Open Report Builder Modal and Initialize Status
   */
  openReportModal: function () {
    var modal = document.getElementById('admin-report-modal');
    if (!modal) return;

    modal.classList.add('active');

    // Reset Result Box & Progress Box
    var resultBox = document.getElementById('report-result-box');
    var progressBox = document.getElementById('report-progress-box');
    if (resultBox) resultBox.style.display = 'none';
    if (progressBox) progressBox.style.display = 'none';

    // Render 11 Categories Completeness Checklist
    this.renderReportCompletenessChecklist();

    // Load Export History Logs
    this.loadExportHistory();
  },

  /**
   * Close Report Builder Modal
   */
  closeReportModal: function () {
    var modal = document.getElementById('admin-report-modal');
    if (modal) modal.classList.remove('active');
  },

  /**
   * Calculate and Render 11 Categories Completeness Checklist
   */
  renderReportCompletenessChecklist: function () {
    var container = document.getElementById('report-categories-checklist');
    var badge = document.getElementById('report-completeness-badge');
    if (!container) return;

    var defaultCategories = [
      { id: "cat_01", name: "1. ข้อมูลพื้นฐานและอัตลักษณ์สถานศึกษา" },
      { id: "cat_02", name: "2. ธรรมาภิบาล เครือข่าย และชุมชน" },
      { id: "cat_03", name: "3. ทะเบียนนักเรียนและโครงสร้างชั้นเรียน" },
      { id: "cat_04", name: "4. ผลการเรียนและคุณภาพผู้เรียน" },
      { id: "cat_05", name: "5. การทดสอบภายนอก การศึกษาต่อ และรางวัลนักเรียน" },
      { id: "cat_06", name: "6. หลักสูตร แผนการเรียน และเวลาเรียน" },
      { id: "cat_07", name: "7. นิเทศ การประเมิน และงานวิจัย" },
      { id: "cat_08", name: "8. บุคลากรและการพัฒนาวิชาชีพ" },
      { id: "cat_09", name: "9. อาคาร สถานที่ และสภาพแวดล้อม" },
      { id: "cat_10", name: "10. ห้องสมุดและแหล่งเรียนรู้" },
      { id: "cat_11", name: "11. ระบบดิจิทัลและหลักฐานสารสนเทศ" }
    ];

    var selectedCount = 0;
    var totalCat = defaultCategories.length;

    var html = defaultCategories.map(cat => {
      // Find selected submissions for this category
      var catSubmissions = (this.submissions || []).filter(s => {
        var isCat = s.categoryId === cat.id;
        var isSelected = (s.selectedForReport === true || s.selectedForReport === 'true' || s.selectedForReport === '1');
        var isNotExcluded = s.status !== 'excluded';
        return isCat && isSelected && isNotExcluded;
      });

      var hasSelected = catSubmissions.length > 0;
      if (hasSelected) selectedCount++;

      var statusText = hasSelected
        ? `<span class="badge badge-success">✓ เลือกแล้ว (${catSubmissions.length})</span>`
        : `<span class="badge badge-warning">⚠️ ยังไม่เลือก</span>`;

      return `
        <div class="report-checklist-card ${hasSelected ? 'ready' : 'empty'}">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
            <strong style="font-size: 0.85rem; color: var(--text-heading);">${cat.name}</strong>
            ${statusText}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;

    if (badge) {
      var completenessPct = Math.round((selectedCount / totalCat) * 100);
      badge.textContent = `พร้อมแล้ว ${selectedCount} จาก ${totalCat} หมวด (${completenessPct}%)`;
      badge.className = selectedCount === totalCat ? 'badge badge-success' : 'badge badge-warning';
    }
  },

  /**
   * Handle Start Report Generation Trigger
   */
  startReportGeneration: async function () {
    var self = this;
    var session = AuthManager.getSession();
    if (!session || session.role !== 'admin') {
      alert("กรุณาเข้าสู่ระบบด้วยสิทธิ์ Admin ก่อนทำรายการ");
      return;
    }

    var academicYear = document.getElementById('report-input-year')?.value || "2568";
    var reportTitle = document.getElementById('report-input-title')?.value || ("รายงานสารสนเทศประจำปีการศึกษา " + academicYear);
    var includeCover = document.getElementById('report-opt-cover')?.checked !== false;
    var includeToc = document.getElementById('report-opt-toc')?.checked !== false;
    var includeImages = document.getElementById('report-opt-images')?.checked !== false;

    var startBtn = document.getElementById('btn-start-generate-report');
    var progressBox = document.getElementById('report-progress-box');
    var progressBar = document.getElementById('report-progress-bar');
    var statusText = document.getElementById('report-status-text');
    var resultBox = document.getElementById('report-result-box');

    var originalBtnText = startBtn ? startBtn.innerHTML : '';
    if (startBtn) {
      startBtn.disabled = true;
      startBtn.innerHTML = '⏳ กำลังประมวลผลการสร้างรายงาน...';
    }
    if (resultBox) resultBox.style.display = 'none';

    if (progressBox) progressBox.style.display = 'block';
    if (progressBar) progressBar.style.width = '20%';
    if (statusText) statusText.textContent = "กำลังรวบรวมข้อมูลสารสนเทศที่ถูกเลือกทั้ง 11 หมวด...";

    var progressInterval;
    var currentPct = 20;

    progressInterval = setInterval(() => {
      if (currentPct < 85) {
        currentPct += 5;
        if (progressBar) progressBar.style.width = `${currentPct}%`;
        if (currentPct === 40 && statusText) statusText.textContent = "กำลังสร้างโครงสร้างเอกสาร Google Docs และฟอร์แมตหัวข้อ...";
        if (currentPct === 60 && statusText) statusText.textContent = "กำลังสร้างตารางข้อมูลภาษาไทย และดึงรูปภาพจาก Google Drive...";
        if (currentPct === 80 && statusText) statusText.textContent = "กำลังแปลงเอกสารเป็น PDF และบันทึกลง Drive Folder...";
      }
    }, 1500);

    try {
      var payload = {
        reportTitle: reportTitle,
        academicYear: academicYear,
        includeCover: includeCover,
        includeToc: includeToc,
        includeImages: includeImages
      };

      var res = await API.generateReport(session.sessionToken, payload);
      clearInterval(progressInterval);

      if (res && res.success) {
        if (progressBar) progressBar.style.width = '100%';
        if (statusText) statusText.textContent = "✓ การสร้างรายงานและ Export PDF เสร็จสมบูรณ์!";

        setTimeout(() => {
          if (progressBox) progressBox.style.display = 'none';
          if (resultBox) {
            resultBox.style.display = 'block';
            resultBox.innerHTML = `
              <div class="alert alert-success" style="padding: 1.25rem;">
                <h4 style="margin-bottom: 0.5rem; color: #166534;">🎉 สร้างเอกสารและ Export PDF เรียบร้อยแล้ว!</h4>
                <p style="margin-bottom: 1rem; font-size: 0.9rem;">
                  รายงานสารสนเทศถูกบันทึกลงใน Google Drive Folder เรียบร้อยแล้ว (ประกอบด้วย ${res.sourceSubmissionCount || 0} รายการส่งข้อมูล)
                </p>
                <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                  <a href="${res.docUrl}" target="_blank" class="btn btn-secondary btn-sm" style="background: #ffffff; color: #1e293b;">
                    📝 เปิดดู/แก้ไขใน Google Docs
                  </a>
                  <a href="${res.pdfUrl}" target="_blank" class="btn btn-accent btn-sm">
                    📥 เปิดดู / ดาวน์โหลดไฟล์ PDF
                  </a>
                </div>
              </div>
            `;
          }
          // Reload export history
          self.loadExportHistory();
        }, 800);

      } else {
        if (progressBox) progressBox.style.display = 'none';
        alert("ไม่สามารถสร้างรายงานได้: " + (res ? res.message : "เกิดข้อผิดพลาดในการประมวลผล"));
      }

    } catch (err) {
      clearInterval(progressInterval);
      if (progressBox) progressBox.style.display = 'none';
      console.error("Generate Report Error:", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์เพื่อสร้างรายงาน");
    } finally {
      if (startBtn) {
        startBtn.disabled = false;
        startBtn.innerHTML = originalBtnText;
      }
    }
  },

  /**
   * Load Export History records from EXPORTS sheet
   */
  loadExportHistory: async function () {
    var session = AuthManager.getSession();
    if (!session || session.role !== 'admin') return;

    var tbody = document.getElementById('report-history-tbody');
    if (!tbody) return;

    try {
      var res = await API.getExportHistory(session.sessionToken);
      if (res && res.success) {
        this.renderExportHistory(res.exports || []);
      } else {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--danger); padding:1rem;">ไม่สามารถดึงประวัติได้: ${res ? res.message : ''}</td></tr>`;
      }
    } catch (err) {
      console.error("Fetch Export History Error:", err);
    }
  },

  /**
   * Render Export History Table
   */
  renderExportHistory: function (exportsList) {
    var tbody = document.getElementById('report-history-tbody');
    if (!tbody) return;

    if (!exportsList || exportsList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:1.5rem;">ยังไม่มีประวัติการ Export รายงาน</td></tr>`;
      return;
    }

    var self = this;
    var html = exportsList.map(exp => {
      var statusBadge = exp.status === 'completed'
        ? `<span class="badge badge-success">สำเร็จ</span>`
        : `<span class="badge badge-danger">ล้มเหลว</span>`;

      var safeExportId = self.escapeHtml(exp.export_id);
      var safeYear = self.escapeHtml(exp.academic_year || '-');
      var safeDate = exp.generated_at ? new Date(exp.generated_at).toLocaleString('th-TH') : '-';

      var pdfBtn = exp.pdf_url
        ? `<a href="${self.escapeHtml(exp.pdf_url)}" target="_blank" class="btn btn-secondary btn-sm" style="font-size:0.75rem;">📥 เปิด PDF</a>`
        : `<span class="text-muted">-</span>`;

      var docBtn = exp.google_doc_id
        ? `<a href="https://docs.google.com/document/d/${self.escapeHtml(exp.google_doc_id)}/edit" target="_blank" class="btn btn-secondary btn-sm" style="font-size:0.75rem;">📝 Google Doc</a>`
        : '';

      return `
        <tr>
          <td><strong style="font-size: 0.85rem; font-family: monospace;">${safeExportId}</strong></td>
          <td>${safeYear}</td>
          <td>${safeDate}</td>
          <td style="text-align: center;">${exp.source_submission_count || 0}</td>
          <td style="text-align: center;">${statusBadge}</td>
          <td style="text-align: center;">
            <div style="display: flex; gap: 0.25rem; justify-content: center;">
              ${docBtn}
              ${pdfBtn}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    tbody.innerHTML = html;
  },

  escapeHtml: function (str) {
    if (typeof str !== 'string') return str || '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  formatDateForInput: function (dateVal) {
    if (!dateVal) return '';
    var str = String(dateVal).trim();
    if (str.includes('T')) {
      return str.split('T')[0];
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }
    var d = new Date(str);
    if (!isNaN(d.getTime())) {
      var year = d.getFullYear();
      var month = String(d.getMonth() + 1).padStart(2, '0');
      var day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return str;
  },

  formatPhone: function (val) {
    if (val === null || val === undefined) return '';
    var str = String(val).trim();
    if (str && !str.startsWith('0') && /^\d{9}$/.test(str)) {
      return '0' + str;
    }
    return str;
  }
};
