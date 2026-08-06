# HONGSON Information Hub — Development Plan

> ระบบรวบรวม ตรวจสอบ และจัดทำรายงานสารสนเทศโรงเรียน  
> Tech Stack: HTML, CSS, JavaScript, Google Apps Script, Google Sheets, Google Drive, Google Docs และ GitHub Pages

---

## 1. เป้าหมายของระบบ

สร้าง Webapp สำหรับรวบรวมข้อมูลสารสนเทศจากฝ่ายหรือผู้รับผิดชอบหลายหมวด โดยรองรับข้อมูลหลายรูปแบบ ได้แก่

- ข้อความสั้นและข้อความบรรยาย
- ตัวเลขและร้อยละ
- ตารางที่เพิ่มหรือลบแถวได้
- รูปภาพหลายไฟล์
- เอกสารแนบ เช่น PDF, DOCX, XLSX, CSV, JPG และ PNG
- URL หรือแหล่งอ้างอิงจากระบบอื่น

ระบบมีผู้ใช้งานเพียง 2 บทบาท

1. **ผู้กรอกข้อมูล**
   - เข้าเว็บไซต์
   - กรอกรหัสลับสำหรับผู้กรอก
   - เลือกหมวด
   - กรอกข้อมูลหรือโยนไฟล์
   - บันทึก
   - ดูสรุปสิ่งที่ส่งและความครบถ้วน
   - จบงาน

2. **Admin**
   - เข้าเว็บไซต์
   - กรอกรหัสลับ Admin
   - ตรวจข้อมูลทุกหมวด
   - แก้ไข เพิ่ม ลบ หรือเลือกข้อมูลที่จะใช้
   - ตรวจความครบถ้วน
   - กดรวบรวมข้อมูลทั้งหมด
   - สร้างและ Export รายงาน PDF ฉบับเดียว

ระบบ **ไม่ใช้การ Login ด้วยอีเมล** และไม่สร้างบัญชีรายบุคคล

---

## 2. หลักการออกแบบ

### 2.1 ความง่ายในการใช้งาน

- ลดจำนวนขั้นตอนให้สั้นที่สุด
- ใช้รหัสลับร่วมกันเพียง 2 รหัส
- ใช้ข้อความภาษาไทยที่เข้าใจง่าย
- รองรับ Drag and Drop
- ผู้กรอกไม่ต้องกลับมาแก้ไขหลังส่ง หาก Admin แก้ไขแทนได้
- ทุกหน้าต้องใช้งานได้ดีบนคอมพิวเตอร์และโทรศัพท์

### 2.2 ความน่าเชื่อถือของข้อมูล

แม้ไม่ใช้ระบบบัญชีผู้ใช้ แต่ทุก Submission ต้องบันทึก

- ชื่อผู้ส่ง
- ฝ่าย งาน หรือกลุ่มสาระ
- เบอร์ติดต่อ
- หมวดที่ส่ง
- ปีการศึกษา
- ข้อมูล ณ วันที่
- วันที่และเวลาที่ส่ง
- เลขที่ Submission
- สถานะรายการ

### 2.3 การป้องกันข้อมูลสูญหาย

- การส่งใหม่ต้องสร้าง Submission ใหม่ ไม่เขียนทับของเดิมโดยอัตโนมัติ
- Admin เป็นผู้เลือกว่าจะใช้รายการใด
- เก็บไฟล์จริงใน Google Drive
- เก็บข้อมูลอ้างอิงไฟล์ใน Google Sheets
- มีประวัติการสร้าง PDF
- หลีกเลี่ยงการลบข้อมูลถาวรโดยไม่จำเป็น

### 2.4 การใช้ Token อย่างมีประสิทธิภาพ

- ทำงานทีละ Phase
- จบแต่ละ Phase ให้ทดสอบได้จริง
- ไม่สร้างโครงสร้างซับซ้อนเกินความจำเป็น
- ไม่เพิ่ม Feature ที่ยังไม่อยู่ใน Scope
- ใช้ไฟล์ `progression_plan.md` เป็นแหล่งข้อมูลหลักสำหรับการทำงานต่อ
- AI ตัวใหม่ต้องอ่านเฉพาะไฟล์ที่จำเป็นและโค้ดที่เกี่ยวข้องกับ Phase ปัจจุบัน

---

## 3. ขอบเขตข้อมูล 11 หมวด

1. ข้อมูลแม่บทและอัตลักษณ์สถานศึกษา
2. ธรรมาภิบาล เครือข่าย และชุมชน
3. ทะเบียนนักเรียนและโครงสร้างชั้นเรียน
4. ผลการเรียนและคุณภาพผู้เรียน
5. การทดสอบภายนอก การศึกษาต่อ และรางวัลนักเรียน
6. หลักสูตร แผนการเรียน และเวลาเรียน
7. นิเทศ การประเมิน และงานวิจัย
8. บุคลากรและการพัฒนาวิชาชีพ
9. อาคาร สถานที่ และสภาพแวดล้อม
10. ห้องสมุดและแหล่งเรียนรู้
11. ระบบดิจิทัลและหลักฐานสารสนเทศ

รายละเอียดช่องกรอกของแต่ละหมวดต้องกำหนดในรูปแบบ Schema เพื่อให้เพิ่ม แก้ไข หรือลดหัวข้อได้โดยไม่ต้องเขียนหน้าใหม่ทั้งหมด

---

## 4. สถาปัตยกรรมระบบ

```text
GitHub Pages
- Landing Page
- หน้าเลือกบทบาท
- UI Shell
        │
        ▼
Google Apps Script Web App
- ตรวจรหัส
- รับและตรวจข้อมูล
- จัดการ Submission
- อัปโหลดไฟล์
- อ่าน/เขียน Google Sheets
- สร้าง Google Docs
- Export PDF
        │
        ├── Google Sheets
        │   - CONFIG
        │   - CATEGORIES
        │   - SUBMISSIONS
        │   - DATA
        │   - FILES
        │   - EXPORTS
        │
        ├── Google Drive
        │   - Uploaded Files
        │   - Generated Reports
        │
        └── Google Docs Template
            - ต้นแบบรายงาน
```

### แนวทางการวาง Frontend

แนวทางหลักที่แนะนำ:

- GitHub Pages เป็นหน้าเว็บหลัก
- ส่วนฟอร์มและ Admin Panel ใช้ Apps Script HTML Service หรือฝัง Apps Script Web App ผ่าน `iframe`
- หลีกเลี่ยงการส่งไฟล์ขนาดใหญ่จาก GitHub Pages ไป Apps Script โดยตรง หากทำให้ระบบไม่เสถียร
- เลือกแนวทางที่ทดสอบแล้วว่า Upload เข้า Google Drive ได้จริง

---

## 5. โครงสร้าง Google Sheets

### 5.1 `CONFIG`

เก็บค่าระบบ เช่น

- `CURRENT_ACADEMIC_YEAR`
- `SCHOOL_NAME`
- `CONTRIBUTOR_CODE`
- `ADMIN_CODE`
- `UPLOAD_FOLDER_ID`
- `REPORT_FOLDER_ID`
- `DOC_TEMPLATE_ID`
- `MAX_FILE_SIZE_MB`
- `ALLOWED_FILE_TYPES`

รหัสลับควรเก็บใน Script Properties เป็นหลัก ส่วน Sheet เก็บเฉพาะค่าที่ไม่ลับ

### 5.2 `CATEGORIES`

กำหนดหมวดและ Schema ของฟอร์ม

ตัวอย่างคอลัมน์:

- category_id
- category_name
- section_id
- section_name
- field_id
- field_label
- field_type
- required
- help_text
- options
- sort_order
- active

ชนิดข้อมูลอย่างน้อย:

- text
- textarea
- number
- percentage
- date
- select
- checkbox
- dynamic_table
- file
- image
- url
- note

### 5.3 `SUBMISSIONS`

- submission_id
- academic_year
- category_id
- sender_name
- sender_department
- sender_phone
- data_as_of_date
- sender_note
- submitted_at
- status
- admin_note
- selected_for_report
- last_updated_at

สถานะขั้นต่ำ:

- submitted
- needs_review
- reviewed
- excluded

### 5.4 `DATA`

- submission_id
- category_id
- section_id
- field_id
- value_type
- value
- row_index
- created_at
- updated_at

### 5.5 `FILES`

- file_record_id
- submission_id
- category_id
- field_id
- drive_file_id
- original_name
- stored_name
- mime_type
- file_size
- caption
- activity_date
- sort_order
- include_in_report
- layout
- uploaded_at

### 5.6 `EXPORTS`

- export_id
- academic_year
- generated_at
- generated_by
- source_submission_count
- google_doc_id
- pdf_file_id
- pdf_url
- status
- error_message

---

## 6. Workflow หลัก

### 6.1 ผู้กรอกข้อมูล

```text
หน้าแรก
→ เลือก "ส่งข้อมูล"
→ กรอกรหัสผู้กรอก
→ เลือกหมวด
→ กรอกข้อมูลผู้ส่ง
→ กรอกข้อมูลตาม Schema
→ ลากไฟล์หรือเลือกรูปภาพ
→ ตรวจสอบก่อนส่ง
→ บันทึก
→ ระบบสร้าง Submission ID
→ แสดงหน้าสรุปและคำเตือน
→ จบ
```

### 6.2 Admin

```text
หน้าแรก
→ เลือก "ผู้ดูแลระบบ"
→ กรอกรหัส Admin
→ Dashboard 11 หมวด
→ ตรวจ Submission
→ แก้ไขหรือคัดออก
→ เลือกรายการสำหรับรายงาน
→ ตรวจ Checklist ความครบถ้วน
→ Preview
→ สร้าง Google Docs
→ Export PDF
→ บันทึกประวัติ
```

---

# Phase การพัฒนา

ระบบแบ่งเป็น 6 Phase เพื่อให้ทำงานเป็นช่วงที่ชัดเจน แต่ไม่ซอยย่อยจนเปลือง Token

---

## Phase 1 — Foundation และโครงสร้างโปรเจกต์

### เป้าหมาย

สร้างฐานโปรเจกต์ที่พร้อมพัฒนาต่อ โดยยังไม่เน้นความสวยงามขั้นสุดท้าย

### งานที่ต้องทำ

1. ตรวจสอบ Repository และไฟล์เดิม หากมี
2. กำหนดโครงสร้างโฟลเดอร์
3. สร้างหน้า Landing Page
4. สร้างปุ่ม
   - ส่งข้อมูล
   - ผู้ดูแลระบบ
5. สร้าง Modal หรือหน้ากรอกรหัส
6. สร้าง Apps Script Project
7. สร้าง Script Properties
8. สร้าง Google Sheets พร้อมหัวตารางทั้ง 6 Sheet
9. สร้าง Google Drive Folder
   - uploads
   - reports
10. สร้าง API Contract เบื้องต้นระหว่าง Frontend กับ Apps Script
11. สร้าง Error Handling กลาง
12. สร้าง Loading, Success และ Error State

### Deliverables

- โครงสร้าง Repository
- Landing Page ใช้งานได้
- Apps Script เชื่อมกับ Google Sheets ได้
- ตรวจรหัสผู้กรอกและรหัส Admin ได้
- Configuration ไม่ฝังรหัสไว้ใน Frontend
- README ระบุวิธีตั้งค่าเบื้องต้น

### Acceptance Criteria

- รหัสผู้กรอกเปิดหน้าผู้กรอกได้
- รหัส Admin เปิดหน้า Admin ได้
- รหัสผิดแสดงข้อความที่เข้าใจง่าย
- Refresh หน้าแล้วไม่มีข้อมูลสำคัญค้างผิดบทบาท
- Frontend เชื่อม Apps Script ได้จริง
- ไม่มี Secret อยู่ใน GitHub Repository

---

## Phase 2 — ระบบผู้กรอกและการรับไฟล์

### เป้าหมาย

ทำให้ผู้กรอกสามารถส่งข้อมูลจริงได้ตั้งแต่ต้นจนจบ

### งานที่ต้องทำ

1. สร้างหน้าเลือก 11 หมวด
2. โหลด Schema จาก `CATEGORIES`
3. สร้าง Dynamic Form Renderer
4. รองรับชนิดข้อมูลหลัก
   - text
   - textarea
   - number
   - percentage
   - date
   - select
   - dynamic_table
   - file
   - image
5. สร้าง Drag and Drop Upload
6. ตรวจชนิดไฟล์และขนาดไฟล์
7. รองรับหลายไฟล์
8. ให้ใส่ Caption และจัดลำดับรูป
9. สร้างข้อมูลผู้ส่ง
10. ตรวจ Required Fields
11. บันทึกข้อมูลเป็น Submission ใหม่
12. Upload ไฟล์เข้า Google Drive
13. บันทึก Metadata ลง `FILES`
14. สร้าง Submission ID
15. สร้างหน้าสรุปหลังส่ง
16. แสดงรายการที่ครบและสิ่งที่ยังขาด
17. ป้องกันกดส่งซ้ำจากการคลิกหลายครั้ง

### Deliverables

- Contributor Flow ใช้งานได้ครบ
- Submission ถูกบันทึกลง Sheets
- ไฟล์ถูกบันทึกเข้า Drive
- หน้าสรุปหลังส่ง
- Validation ฝั่ง Client และ Server

### Acceptance Criteria

- ผู้ใช้ส่งข้อความ ตัวเลข ตาราง รูป และ PDF ได้
- ส่งซ้ำแล้วไม่เขียนทับ Submission เดิม
- ทุก Submission มีผู้ส่ง หมวด ปี และเวลา
- Upload ล้มเหลวต้องแจ้งว่าไฟล์ใดล้มเหลว
- การส่งข้อมูลสำเร็จต้องแสดง Submission ID
- ไม่มีรายการครึ่งกลางที่ระบบแจ้งว่าสำเร็จทั้งที่ไฟล์ไม่ครบ

---

## Phase 3 — Admin Dashboard และการตรวจแก้ข้อมูล

### เป้าหมาย

ทำให้ Admin ตรวจ แก้ไข และคัดเลือกข้อมูลได้จากหน้าเดียว

### งานที่ต้องทำ

1. สร้าง Dashboard 11 หมวด
2. แสดง
   - จำนวน Submission
   - ผู้ส่งล่าสุด
   - จำนวนข้อมูล
   - จำนวนไฟล์
   - ความครบถ้วน
   - สถานะ
3. สร้างหน้ารายการ Submission
4. สร้างหน้า Detail
5. แสดงข้อมูลทุกชนิดอย่างอ่านง่าย
6. เปิดไฟล์จาก Google Drive ได้
7. แก้ไขข้อความและตัวเลข
8. แก้ไขข้อมูลใน Dynamic Table
9. เพิ่ม ลบ และเรียงไฟล์
10. เลือก Layout รูปภาพ
11. เลือก Include/Exclude รายการ
12. เลือก Submission ที่ใช้ในรายงาน
13. เพิ่ม Admin Note
14. ทำ Checklist ความครบถ้วน
15. แสดง Warning เมื่อ
    - ข้อมูลไม่ครบ
    - ปีข้อมูลไม่ตรง
    - ผลรวมไม่ตรง
    - ไม่มีหลักฐาน
    - มี Submission ซ้ำ
16. ทำ Auto-save หรือ Save ที่ชัดเจน
17. ป้องกันข้อมูลชนกันระหว่างบันทึก

### Deliverables

- Admin Dashboard
- Submission Review
- Edit และ Selection
- Completeness Checklist
- สถานะรายหมวด

### Acceptance Criteria

- Admin เห็นข้อมูลทุก Submission
- Admin แก้ไขได้และข้อมูลคงอยู่หลัง Refresh
- Admin คัด Submission ออกจากรายงานได้
- Admin เลือกรูปที่จะใช้และลำดับได้
- Dashboard สะท้อนข้อมูลจริงจาก Sheets
- ไม่มีการแก้ไขหนึ่งหมวดแล้วกระทบอีกหมวดโดยไม่ตั้งใจ

---

## Phase 4 — Report Builder และ Export PDF

### เป้าหมาย

รวบรวมข้อมูลที่ผ่านการเลือกและสร้าง PDF ฉบับเดียวได้จริง

### งานที่ต้องทำ

1. สร้าง Google Docs Template
2. กำหนดลำดับ 11 หมวด
3. สร้างหน้าปก
4. สร้างคำนำ
5. สร้างสารบัญ
6. สร้าง Heading ตามหมวดและหัวข้อ
7. แปลงข้อมูลข้อความลงเอกสาร
8. สร้างตารางจาก Dynamic Table
9. สร้างกราฟจากข้อมูลตัวเลขที่กำหนด
10. แทรกรูปจาก Google Drive
11. รองรับ Layout
    - ภาพเดี่ยว
    - ภาพคู่
    - ภาพชุด
    - ภาพเต็มหน้า
12. ใส่ Caption
13. ใส่เลขหน้า Header และ Footer
14. สร้าง Google Docs ฉบับกลาง
15. Export เป็น PDF
16. บันทึก PDF ลง Drive
17. บันทึกประวัติใน `EXPORTS`
18. แสดงลิงก์เปิดและดาวน์โหลด
19. รองรับการสร้างใหม่เมื่อแก้ข้อมูล

### Deliverables

- Report Builder
- Google Docs Output
- PDF Output
- Export History

### Acceptance Criteria

- PDF รวมข้อมูลจากทุกหมวดที่เลือก
- ข้อมูลที่ Exclude ไม่ปรากฏ
- รูปและตารางไม่ล้นหน้าอย่างรุนแรง
- ภาษาไทยไม่เพี้ยน
- มีเลขหน้าและหัวข้อครบ
- PDF เปิดได้และถูกบันทึกลง Drive
- หาก Export ล้มเหลว ระบบต้องบอกขั้นตอนที่ล้มเหลว

---

## Phase 5 — UX Refinement และ Data Validation

### เป้าหมาย

ลดความสับสนและข้อผิดพลาดก่อนใช้งานจริง

### งานที่ต้องทำ

1. ปรับ UI ให้เป็นภาษาคนใช้งานจริง
2. ลดข้อความเทคนิค
3. ปรับ Responsive
4. เพิ่ม Empty State
5. เพิ่มคำแนะนำในแต่ละหมวด
6. เพิ่ม Confirmation เฉพาะจุดสำคัญ
7. เพิ่ม Progress Indicator ตอน Upload และ Export
8. เพิ่มระบบตรวจผลรวม
9. เพิ่มระบบตรวจปีข้อมูล
10. เพิ่มระบบตรวจฟิลด์สำคัญ
11. เพิ่มการรองรับ Paste จาก Excel ใน Dynamic Table
12. เพิ่ม Preview ไฟล์และรูป
13. ทดสอบไฟล์ชื่อภาษาไทย
14. ทดสอบอินเทอร์เน็ตช้า
15. ปรับข้อความ Error ให้ผู้ใช้แก้ปัญหาได้เอง

### Deliverables

- UI พร้อมใช้งานจริง
- Validation ครบ
- Mobile Friendly
- Error Message ที่เข้าใจง่าย

### Acceptance Criteria

- ผู้ใช้ใหม่สามารถส่งข้อมูลได้โดยไม่ต้องมีคู่มือยาว
- ปุ่มหลักเด่นและไม่สร้างความสับสน
- ใช้งานบน Chrome Desktop และ Mobile ได้
- ไฟล์ภาษาไทยอัปโหลดได้
- ข้อมูลไม่หายเมื่อเกิด Error ระหว่างส่ง
- Admin เห็นปัญหาความครบถ้วนก่อน Export

---

## Phase 6 — QA, Deployment และส่งมอบ

### เป้าหมาย

ตรวจระบบ End-to-End และเตรียมส่งมอบแบบทำงานต่อได้

### งานที่ต้องทำ

1. ทดสอบ Contributor Flow ทุกหมวด
2. ทดสอบ Admin Flow
3. ทดสอบส่งซ้ำ
4. ทดสอบหลายไฟล์
5. ทดสอบไฟล์ผิดประเภท
6. ทดสอบไฟล์เกินขนาด
7. ทดสอบ Submission ไม่ครบ
8. ทดสอบแก้ไขและ Refresh
9. ทดสอบ Export PDF หลายรอบ
10. ทดสอบ Permission ของ Drive
11. ทดสอบ GitHub Pages Production
12. ทดสอบ Apps Script Deployment
13. ตรวจ Secret
14. ตรวจ Console Error
15. ตรวจ Apps Script Execution Log
16. สร้างคู่มือติดตั้ง
17. สร้างคู่มือ Admin แบบย่อ
18. สร้างคู่มือผู้กรอกแบบหนึ่งหน้า
19. อัปเดต README
20. อัปเดต `progression_plan.md` เป็นสถานะส่งมอบ

### Deliverables

- Production URL
- Apps Script Deployment URL
- Google Sheets Template
- Google Docs Template
- Drive Folder Structure
- README
- คู่มือใช้งาน
- Test Report

### Acceptance Criteria

- ผู้กรอกส่งข้อมูลจบได้
- Admin ตรวจและแก้ไขได้
- Export PDF ได้จริง
- ไม่มี Error ระดับ Blocker
- การตั้งค่าทั้งหมดมีเอกสาร
- AI หรือ Developer คนใหม่สามารถทำงานต่อได้จาก 3 ไฟล์หลัก

---

## 7. สิ่งที่ไม่อยู่ใน Scope รุ่นแรก

เพื่อควบคุมเวลาและ Token ห้ามเพิ่มสิ่งต่อไปนี้โดยไม่ได้รับอนุมัติ

- Login ด้วย Google Workspace
- ระบบสมาชิก
- Permission รายบุคคล
- การส่งอีเมลแจ้งเตือน
- การแจ้งเตือนผ่าน LINE
- ระบบอนุมัติหลายชั้น
- Version Control ระดับเอกสาร
- AI วิเคราะห์ข้อความอัตโนมัติ
- OCR เอกสาร
- Mobile App
- ระบบ Public Report Portal
- รองรับหลายโรงเรียน

---

## 8. กฎคุณภาพของโค้ด

- แยก Configuration ออกจาก Logic
- ไม่ฝัง Secret ใน Frontend
- ใช้ชื่อ Function และตัวแปรที่สื่อความหมาย
- มี Error Handling ทุกจุดที่เรียกบริการภายนอก
- หลีกเลี่ยงไฟล์ขนาดใหญ่เกินไป
- ไม่ทำ Refactor ใหญ่โดยไม่เกี่ยวกับ Phase ปัจจุบัน
- ทุก Phase ต้องมีวิธีทดสอบ
- ไม่ถือว่าเสร็จเพียงเพราะ Build ผ่าน
- ต้องทดสอบ Workflow จริงตั้งแต่ผู้ใช้กดปุ่มจนข้อมูลถูกบันทึก
- อัปเดต `progression_plan.md` หลังทำงานทุกครั้ง

---

## 9. Definition of Done ของทั้งระบบ

ระบบถือว่าเสร็จเมื่อ

1. ผู้กรอกเข้าด้วยรหัสร่วมได้
2. เลือกหมวดและกรอกข้อมูลได้
3. Drag and Drop ไฟล์ได้
4. บันทึก Submission ใหม่ได้
5. แสดงสรุปหลังส่งได้
6. Admin เข้าด้วยรหัส Admin ได้
7. Admin เห็นข้อมูลทุกหมวด
8. Admin แก้ไขและคัดเลือกข้อมูลได้
9. Admin ตรวจความครบถ้วนได้
10. ระบบรวบรวมทุกหมวดเป็น Google Docs ได้
11. ระบบ Export PDF ได้
12. PDF เปิดได้และจัดเก็บใน Drive
13. README และคู่มือครบ
14. ไม่มี Blocker ใน End-to-End Test
15. `progression_plan.md` ระบุสถานะจริงล่าสุด
