/**
 * HONGSON Information Hub — Dynamic Form Engine & File Upload Handler
 */

var FormEngine = {
  activeCategory: null,
  categories: [],
  attachedFiles: [],
  dragAndDropBound: false,

  // Default 11 Categories Schema Fallback
  defaultCategories: [
    {
      id: "cat_01",
      name: "1. ข้อมูลแม่บทและอัตลักษณ์สถานศึกษา",
      fields: [
        { fieldId: "field_school_history", label: "ประวัติความเป็นมาและข้อมูลโรงเรียน", type: "textarea", required: true, helpText: "สรุปประวัติโรงเรียนและข้อมูลทั่วไป" },
        { fieldId: "field_vision_mission", label: "วิสัยทัศน์ พันธกิจ และเป้าประสงค์", type: "textarea", required: true, helpText: "ระบุวิสัยทัศน์และอัตลักษณ์สถานศึกษา" }
      ]
    },
    {
      id: "cat_02",
      name: "2. ธรรมาภิบาล เครือข่าย และชุมชน",
      fields: [
        { fieldId: "field_community_networks", label: "สรุปเครือข่ายความร่วมมือและชุมชน", type: "textarea", required: true, helpText: "ระบุโครงการความร่วมมือกับชุมชนและภาคีเครือข่าย" }
      ]
    },
    {
      id: "cat_03",
      name: "3. ทะเบียนนักเรียนและโครงสร้างชั้นเรียน",
      fields: [
        { 
          fieldId: "field_student_counts", 
          label: "ตารางสถิติจำนวนนักเรียนแยกตามระดับชั้น", 
          type: "dynamic_table", 
          required: true,
          columns: ["ระดับชั้น", "ชาย (คน)", "หญิง (คน)", "รวม (คน)"]
        }
      ]
    },
    {
      id: "cat_04",
      name: "4. ผลการเรียนและคุณภาพผู้เรียน",
      fields: [
        { 
          fieldId: "field_academic_performance", 
          label: "ตารางผลสัมฤทธิ์ทางการเรียนจำแนกตามกลุ่มสาระ", 
          type: "dynamic_table", 
          required: true,
          columns: ["กลุ่มสาระการเรียนรู้", "จำนวนนักเรียน", "ร้อยละระดับ 3 ขึ้นไป"]
        }
      ]
    },
    {
      id: "cat_05",
      name: "5. การทดสอบภายนอก การศึกษาต่อ และรางวัลนักเรียน",
      fields: [
        { fieldId: "field_onet_tcas_summary", label: "สรุปผลการทดสอบภายนอกและการศึกษาต่อ", type: "textarea", required: false },
        { fieldId: "field_student_awards", label: "รายการรางวัลและความภาคภูมิใจของนักเรียน", type: "textarea", required: false }
      ]
    },
    {
      id: "cat_06",
      name: "6. หลักสูตร แผนการเรียน และเวลาเรียน",
      fields: [
        { fieldId: "field_curriculum_summary", label: "สรุปโครงสร้างหลักสูตรสถานศึกษา", type: "textarea", required: true }
      ]
    },
    {
      id: "cat_07",
      name: "7. นิเทศ การประเมิน และงานวิจัย",
      fields: [
        { fieldId: "field_research_list", label: "รายงานการวิจัยในชั้นเรียนและนวัตกรรม", type: "textarea", required: false }
      ]
    },
    {
      id: "cat_08",
      name: "8. บุคลากรและการพัฒนาวิชาชีพ",
      fields: [
        { 
          fieldId: "field_staff_stats", 
          label: "ตารางสถิติจำนวนครูและบุคลากร", 
          type: "dynamic_table", 
          required: true,
          columns: ["ประเภทบุคลากร", "ชาย", "หญิง", "รวม"]
        }
      ]
    },
    {
      id: "cat_09",
      name: "9. อาคาร สถานที่ และสภาพแวดล้อม",
      fields: [
        { fieldId: "field_facility_summary", label: "สรุปข้อมูลอาคารสถานที่และสิ่งอำนวยความสะดวก", type: "textarea", required: true }
      ]
    },
    {
      id: "cat_10",
      name: "10. ห้องสมุดและแหล่งเรียนรู้",
      fields: [
        { fieldId: "field_library_info", label: "ข้อมูลห้องสมุด สถิติการใช้บริการ และแหล่งเรียนรู้", type: "textarea", required: true }
      ]
    },
    {
      id: "cat_11",
      name: "11. ระบบดิจิทัลและหลักฐานสารสนเทศ",
      fields: [
        { fieldId: "field_ict_infrastructure", label: "สรุประบบดิจิทัล สื่อ ICT และลิงก์หลักฐานอ้างอิง", type: "textarea", required: true }
      ]
    }
  ],

  async init() {
    await this.loadCategories();
    this.renderCategoryGrid();
  },

  async loadCategories() {
    try {
      const res = await API.getCategories();
      if (res && res.success && Array.isArray(res.categories) && res.categories.length > 0) {
        // Merge with default schema if fields are missing from API categories
        this.categories = res.categories.map(cat => {
          if (!cat.fields || cat.fields.length === 0) {
            const def = this.defaultCategories.find(d => d.id === cat.id);
            if (def && def.fields) cat.fields = def.fields;
          }
          return cat;
        });
      } else {
        this.categories = this.defaultCategories;
      }
    } catch (err) {
      console.warn("Could not load categories from API, using default categories fallback:", err);
      this.categories = this.defaultCategories;
    }
  },

  renderCategoryGrid() {
    const container = document.getElementById('category-grid-container');
    if (!container) return;

    let html = '<div class="category-grid">';
    this.categories.forEach(cat => {
      html += `
        <div class="category-card" role="button" tabindex="0" onclick="FormEngine.selectCategory('${cat.id}')">
          <div class="category-card-icon">📂</div>
          <h4>${cat.name}</h4>
          <span class="category-status-badge">คลิกเพื่อเลือกกรอกข้อมูล ➔</span>
        </div>
      `;
    });
    html += '</div>';
    container.innerHTML = html;
  },

  selectCategory(catId) {
    if (!catId) return;

    let cat = this.categories.find(c => String(c.id) === String(catId));
    
    // Fallback if not found in active categories
    if (!cat) {
      cat = this.defaultCategories.find(c => String(c.id) === String(catId));
    }

    if (!cat) {
      console.error("Category not found:", catId);
      return;
    }

    // Ensure fields array is populated
    if (!cat.fields || !Array.isArray(cat.fields) || cat.fields.length === 0) {
      const defCat = this.defaultCategories.find(d => String(d.id) === String(cat.id));
      if (defCat && defCat.fields) {
        cat.fields = defCat.fields;
      } else {
        cat.fields = [
          { fieldId: "field_general_description", label: "รายละเอียดข้อมูลสารสนเทศ", type: "textarea", required: true, helpText: "กรอกข้อมูลสารสนเทศประจำหมวด" }
        ];
      }
    }

    this.activeCategory = cat;
    this.attachedFiles = [];

    // Switch View Section
    const selectSec = document.getElementById('category-select-section');
    const formSec = document.getElementById('form-render-section');

    if (selectSec) selectSec.style.display = 'none';
    if (formSec) formSec.style.display = 'block';

    const headerTitle = document.getElementById('selected-category-title');
    if (headerTitle) headerTitle.textContent = cat.name;

    // Render Dynamic Form Fields
    this.renderFormFields(cat);

    // Scroll to top of form smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  backToCategorySelect() {
    this.activeCategory = null;
    this.attachedFiles = [];
    const selectSec = document.getElementById('category-select-section');
    const formSec = document.getElementById('form-render-section');

    if (formSec) formSec.style.display = 'none';
    if (selectSec) selectSec.style.display = 'block';
  },

  renderFormFields(cat) {
    const formContainer = document.getElementById('dynamic-fields-container');
    if (!formContainer) return;

    let html = '';

    cat.fields.forEach(field => {
      html += `<div class="form-group-card">`;
      html += `<label class="form-label">${field.label} ${field.required ? '<span style="color:var(--danger)">*</span>' : ''}</label>`;
      if (field.helpText) {
        html += `<small class="form-help-text">${field.helpText}</small>`;
      }

      switch (field.type) {
        case 'textarea':
          html += `<textarea name="${field.fieldId}" class="form-control" rows="4" placeholder="กรอกรายละเอียด..." ${field.required ? 'required' : ''}></textarea>`;
          break;

        case 'number':
          html += `<input type="number" name="${field.fieldId}" class="form-control" placeholder="0" ${field.required ? 'required' : ''}>`;
          break;

        case 'date':
          html += `<input type="date" name="${field.fieldId}" class="form-control" ${field.required ? 'required' : ''}>`;
          break;

        case 'dynamic_table':
          html += this.renderDynamicTableHTML(field);
          break;

        default:
          html += `<input type="text" name="${field.fieldId}" class="form-control" placeholder="กรอกข้อมูล..." ${field.required ? 'required' : ''}>`;
          break;
      }

      html += `</div>`;
    });

    formContainer.innerHTML = html;
    this.setupDragAndDrop();
  },

  renderDynamicTableHTML(field) {
    const columns = field.columns || ["รายการ / หัวข้อ", "จำนวน / รายละเอียด", "หมายเหตุ"];
    let html = `
      <div class="dynamic-table-wrapper" id="wrapper-${field.fieldId}">
        <table class="dynamic-table" id="table-${field.fieldId}">
          <thead>
            <tr>
              ${columns.map(c => `<th>${c}</th>`).join('')}
              <th style="width: 70px; text-align: center;">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              ${columns.map(() => `<td><input type="text" class="form-control table-input"></td>`).join('')}
              <td style="text-align: center;">
                <button type="button" class="btn-remove-row" onclick="FormEngine.removeTableRow(this)">&times;</button>
              </td>
            </tr>
          </tbody>
        </table>
        <button type="button" class="btn btn-secondary btn-sm" style="margin-top: 0.75rem;" onclick="FormEngine.addTableRow('${field.fieldId}', ${columns.length})">
          ➕ เพิ่มแถว
        </button>
      </div>
    `;
    return html;
  },

  addTableRow(fieldId, colCount) {
    const table = document.getElementById(`table-${fieldId}`);
    if (!table) return;
    const tbody = table.querySelector('tbody');
    const tr = document.createElement('tr');
    let cells = '';
    for (let i = 0; i < colCount; i++) {
      cells += `<td><input type="text" class="form-control table-input"></td>`;
    }
    cells += `<td style="text-align: center;"><button type="button" class="btn-remove-row" onclick="FormEngine.removeTableRow(this)">&times;</button></td>`;
    tr.innerHTML = cells;
    tbody.appendChild(tr);
  },

  removeTableRow(btn) {
    const tr = btn.closest('tr');
    const tbody = tr.closest('tbody');
    if (tbody.children.length > 1) {
      tr.remove();
    } else {
      alert('ต้องมีอย่างน้อย 1 แถวในตาราง');
    }
  },

  setupDragAndDrop() {
    if (this.dragAndDropBound) return;

    const dropZone = document.getElementById('file-drop-zone');
    const fileInput = document.getElementById('file-input-hidden');
    if (!dropZone || !fileInput) return;

    this.dragAndDropBound = true;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
    });

    dropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      this.handleFilesSelect(files);
    });

    dropZone.addEventListener('click', (e) => {
      if (e.target !== fileInput) {
        fileInput.click();
      }
    });

    fileInput.addEventListener('change', (e) => {
      this.handleFilesSelect(e.target.files);
    });
  },

  async handleFilesSelect(files) {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // File size limit: 25MB
      if (file.size > 25 * 1024 * 1024) {
        alert(`ไฟล์ ${file.name} มีขนาดเกิน 25MB ระบบไม่สามารถอัปโหลดได้`);
        continue;
      }

      // Check if file is already added to attachedFiles
      const isDuplicate = this.attachedFiles.some(f => f.name === file.name && f.size === file.size);
      if (isDuplicate) {
        console.warn(`ไฟล์ ${file.name} ถูกเพิ่มในรายการแล้ว`);
        continue;
      }

      const base64Data = await this.fileToBase64(file);
      this.attachedFiles.push({
        id: 'file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        name: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        base64Data: base64Data,
        caption: ''
      });
    }

    // Reset file input value so re-selecting same file triggers change event properly
    const fileInput = document.getElementById('file-input-hidden');
    if (fileInput) fileInput.value = '';

    this.renderAttachedFilesList();
  },

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Strip data:content/type;base64, prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  },

  renderAttachedFilesList() {
    const listContainer = document.getElementById('attached-files-list');
    if (!listContainer) return;

    if (this.attachedFiles.length === 0) {
      listContainer.innerHTML = '<p class="text-muted" style="font-size:0.875rem;">ยังไม่มีไฟล์ที่เลือก</p>';
      return;
    }

    let html = '<div class="files-preview-grid">';
    this.attachedFiles.forEach((f, idx) => {
      const sizeMB = (f.size / (1024 * 1024)).toFixed(2);
      const isImg = f.mimeType.startsWith('image/');

      html += `
        <div class="file-preview-card">
          <div class="file-preview-info">
            <span class="file-type-icon">${isImg ? '🖼️' : '📄'}</span>
            <div style="overflow:hidden;">
              <div class="file-name-text">${f.name}</div>
              <small class="text-muted">${sizeMB} MB</small>
            </div>
            <button type="button" class="btn-remove-file" onclick="FormEngine.removeFile(${idx})">&times;</button>
          </div>
          ${isImg ? `<input type="text" class="form-control form-control-sm" placeholder="คำบรรยายรูปภาพ (Caption)..." value="${f.caption}" onchange="FormEngine.updateCaption(${idx}, this.value)" style="margin-top:0.5rem;">` : ''}
        </div>
      `;
    });
    html += '</div>';
    listContainer.innerHTML = html;
  },

  updateCaption(index, val) {
    if (this.attachedFiles[index]) {
      this.attachedFiles[index].caption = val;
    }
  },

  removeFile(index) {
    this.attachedFiles.splice(index, 1);
    this.renderAttachedFilesList();
  },

  async handleSubmit(e) {
    e.preventDefault();
    if (!this.activeCategory) return;

    const session = AuthManager.getSession();
    if (!session || session.role !== 'contributor') {
      alert('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
      AuthManager.logout();
      App.showView('view-landing');
      return;
    }

    const form = document.getElementById('contributor-submit-form');
    const submitBtn = document.getElementById('btn-submit-contributor-data');
    const alertBox = document.getElementById('contributor-form-alert');

    // Collect sender info
    const senderName = document.getElementById('sender_name')?.value || '';
    const senderDepartment = document.getElementById('sender_department')?.value || '';
    const senderPhone = document.getElementById('sender_phone')?.value || '';
    const dataAsOfDate = document.getElementById('data_as_of_date')?.value || '';
    const senderNote = document.getElementById('sender_note')?.value || '';

    if (!senderName || !senderDepartment) {
      alert('กรุณากรอกชื่อผู้ส่ง และ ฝ่าย/กลุ่มสาระ');
      return;
    }

    // Collect field values
    const fieldValues = {};
    this.activeCategory.fields.forEach(field => {
      if (field.type === 'dynamic_table') {
        const rows = [];
        const table = document.getElementById(`table-${field.fieldId}`);
        if (table) {
          const tbodyRows = table.querySelectorAll('tbody tr');
          tbodyRows.forEach(tr => {
            const inputs = tr.querySelectorAll('.table-input');
            const rowVals = Array.from(inputs).map(inp => inp.value);
            if (rowVals.some(v => v.trim() !== '')) {
              rows.push(rowVals);
            }
          });
        }
        fieldValues[field.fieldId] = rows;
      } else {
        const inp = form.querySelector(`[name="${field.fieldId}"]`);
        fieldValues[field.fieldId] = inp ? inp.value : '';
      }
    });

    const payload = {
      sessionToken: session.sessionToken,
      academicYear: session.academicYear || '2569',
      categoryId: this.activeCategory.id,
      senderName,
      senderDepartment,
      senderPhone,
      dataAsOfDate,
      senderNote,
      fieldValues,
      files: this.attachedFiles
    };

    // Double submission prevention
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> กำลังบันทึกข้อมูลและอัปโหลดไฟล์...';
    if (alertBox) alertBox.style.display = 'none';

    try {
      const result = await API.submitData(payload);

      if (result && result.success) {
        this.showSuccessSummary(result);
      } else {
        alert(result ? result.message : 'การบันทึกข้อมูลล้มเหลว');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการส่งข้อมูล: ' + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '💾 บันทึกและส่งข้อมูลสารสนเทศ';
    }
  },

  showSuccessSummary(result) {
    const modal = document.getElementById('submission-summary-modal');
    const content = document.getElementById('summary-modal-body');

    content.innerHTML = `
      <div style="text-align:center; margin-bottom: 1.5rem;">
        <div style="font-size: 3rem;">🎉</div>
        <h3 style="color: var(--success);">ส่งข้อมูลสารสนเทศสำเร็จ!</h3>
        <p class="text-muted" style="font-size: 0.9rem;">ระบบได้บันทึกข้อมูลและไฟล์ของคุณเข้าสู่ระบบเรียบร้อยแล้ว</p>
      </div>

      <div class="summary-details-card">
        <div class="summary-detail-row">
          <span>เลขที่ Submission ID:</span>
          <strong>${result.submissionId}</strong>
        </div>
        <div class="summary-detail-row">
          <span>หมวดที่ส่ง:</span>
          <span>${this.activeCategory.name}</span>
        </div>
        <div class="summary-detail-row">
          <span>ผู้ส่งข้อมูล:</span>
          <span>${result.senderName}</span>
        </div>
        <div class="summary-detail-row">
          <span>จำนวนรายการข้อมูล:</span>
          <span>${result.savedFieldsCount} รายการ</span>
        </div>
        <div class="summary-detail-row">
          <span>จำนวนไฟล์ที่อัปโหลดสำเร็จ:</span>
          <span>${result.savedFilesCount} ไฟล์</span>
        </div>
        <div class="summary-detail-row">
          <span>เวลาบันทึก:</span>
          <span>${result.submittedAt}</span>
        </div>
      </div>
    `;

    modal.classList.add('active');
  },

  closeSummaryAndReset() {
    document.getElementById('submission-summary-modal').classList.remove('active');
    this.backToCategorySelect();
  }
};
