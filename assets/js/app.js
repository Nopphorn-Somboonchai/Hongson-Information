/**
 * HONGSON Information Hub — Main Frontend Application Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  activeRoleModal: null,

  init() {
    this.bindEvents();
    this.checkConfigStatus();
    this.restoreSession();
  },

  bindEvents() {
    // Open Auth Modals
    document.getElementById('btn-open-contributor')?.addEventListener('click', () => {
      this.openAuthModal('contributor');
    });

    document.getElementById('btn-open-admin')?.addEventListener('click', () => {
      this.openAuthModal('admin');
    });

    // Close Modals
    document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
      btn.addEventListener('click', () => this.closeModals());
    });

    // Code Verification Form Submission
    document.getElementById('auth-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    // Settings Modal
    document.getElementById('btn-open-settings')?.addEventListener('click', () => {
      this.openSettingsModal();
    });

    document.getElementById('settings-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSaveSettings();
    });

    // Logout
    document.querySelectorAll('.btn-logout').forEach(btn => {
      btn.addEventListener('click', () => this.handleLogout());
    });

    // Admin Sheet Setup Button
    document.getElementById('btn-setup-sheets')?.addEventListener('click', () => {
      this.handleSetupSheets();
    });
  },

  checkConfigStatus() {
    const configNotice = document.getElementById('config-warning-banner');
    if (!API.isConfigured()) {
      if (configNotice) configNotice.style.display = 'block';
    } else {
      if (configNotice) configNotice.style.display = 'none';
      this.loadPublicConfig();
    }
  },

  async loadPublicConfig() {
    const res = await API.getPublicConfig();
    if (res && res.success && res.config) {
      const yearBadge = document.getElementById('academic-year-badge');
      if (yearBadge && res.config.academicYear) {
        yearBadge.textContent = `ปีการศึกษา ${res.config.academicYear}`;
      }
    }
  },

  openAuthModal(role) {
    this.activeRoleModal = role;
    const modal = document.getElementById('auth-modal');
    const title = document.getElementById('auth-modal-title');
    const alert = document.getElementById('auth-alert');
    const input = document.getElementById('input-auth-code');

    if (alert) alert.style.display = 'none';
    if (input) input.value = '';

    if (role === 'admin') {
      title.textContent = 'เข้าสู่ระบบผู้ดูแลระบบ (Admin)';
    } else {
      title.textContent = 'เข้าสู่ระบบส่งข้อมูล (Contributor)';
    }

    modal?.classList.add('active');
    input?.focus();
  },

  openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const inputUrl = document.getElementById('input-webapp-url');
    if (inputUrl) inputUrl.value = API.webAppUrl;
    modal?.classList.add('active');
  },

  closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    this.activeRoleModal = null;
  },

  async handleLogin() {
    const input = document.getElementById('input-auth-code');
    const alert = document.getElementById('auth-alert');
    const submitBtn = document.getElementById('btn-submit-auth');
    const code = input?.value || '';

    if (!code.trim()) {
      this.showAlert(alert, 'กรุณากรอกรหัสผ่าน', 'danger');
      return;
    }

    // Show loading spinner
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> กำลังตรวจสอบ...';

    try {
      const res = await AuthManager.login(code);
      if (res.success) {
        this.closeModals();
        this.renderViewForRole(res.role);
      } else {
        this.showAlert(alert, res.message, 'danger');
      }
    } catch (err) {
      this.showAlert(alert, 'เกิดข้อผิดพลาดในการตรวจสอบรหัสผ่าน', 'danger');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'ยืนยันรหัสผ่าน';
    }
  },

  handleSaveSettings() {
    const inputUrl = document.getElementById('input-webapp-url');
    const newUrl = inputUrl?.value || '';
    if (newUrl.trim()) {
      API.setWebAppUrl(newUrl);
      this.closeModals();
      this.checkConfigStatus();
      alert('บันทึก Web App URL เรียบร้อยแล้ว');
    } else {
      alert('กรุณากรอก Web App URL ที่ถูกต้อง');
    }
  },

  handleLogout() {
    AuthManager.logout();
    this.showView('view-landing');
  },

  restoreSession() {
    const session = AuthManager.getSession();
    if (session) {
      this.renderViewForRole(session.role);
    } else {
      this.showView('view-landing');
    }
  },

  renderViewForRole(role) {
    if (role === 'admin') {
      this.showView('view-admin');
      const badge = document.getElementById('admin-user-status');
      if (badge) badge.textContent = 'บทบาท: ผู้ดูแลระบบ (Admin)';
      // Initialize Admin Engine
      if (typeof AdminEngine !== 'undefined') {
        AdminEngine.init();
      }
    } else if (role === 'contributor') {
      this.showView('view-contributor');
      const badge = document.getElementById('contributor-user-status');
      if (badge) badge.textContent = 'บทบาท: ผู้กรอกข้อมูล (Contributor)';
      // Initialize Dynamic Form Engine
      if (typeof FormEngine !== 'undefined') {
        FormEngine.init();
      }
    }
  },

  showView(viewId) {
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(viewId)?.classList.add('active');
  },

  async handleSetupSheets() {
    const statusEl = document.getElementById('sheet-setup-result');
    const session = AuthManager.getSession();
    
    if (!session || session.role !== 'admin') {
      alert('เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถกดตั้งค่า Google Sheets ได้');
      return;
    }

    if (statusEl) {
      statusEl.className = 'alert alert-info';
      statusEl.style.display = 'block';
      statusEl.textContent = 'กำลังสร้างและตั้งค่าโครงสร้าง Google Sheets ทั้ง 6 Tab...';
    }

    const res = await API.setupSheets(session.sessionToken);
    if (res && res.success) {
      if (statusEl) {
        statusEl.className = 'alert alert-success';
        statusEl.textContent = res.message;
      }
    } else {
      if (statusEl) {
        statusEl.className = 'alert alert-danger';
        statusEl.textContent = res ? res.message : 'ตั้งค่าล้มเหลว';
      }
    }
  },

  showAlert(alertEl, message, type = 'danger') {
    if (!alertEl) return;
    alertEl.className = `alert alert-${type}`;
    alertEl.textContent = message;
    alertEl.style.display = 'block';
  }
};
