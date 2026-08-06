# HONGSON Information Hub — Implementation Guide

ไฟล์นี้เป็นคู่มือสำหรับ AI Coding Agent หรือ Developer ที่เข้ามาทำงานต่อ โดยต้องใช้ร่วมกับ

1. `plan.md`
2. `implement_plan.md`
3. `progression_plan.md`

---

## 1. ลำดับการอ่านก่อนเริ่มงาน

ทุกครั้งที่เริ่ม Session ใหม่ ให้ทำตามลำดับนี้

1. อ่าน `progression_plan.md` ก่อน เพื่อดูสถานะล่าสุด
2. อ่านเฉพาะส่วนที่เกี่ยวข้องใน `plan.md`
3. อ่านไฟล์โค้ดที่เกี่ยวข้องกับ Phase ปัจจุบัน
4. ตรวจ Repository และผลลัพธ์จริง ห้ามเชื่อ Progress เพียงอย่างเดียว
5. ระบุ Phase และงานถัดไปที่ยังไม่เสร็จ
6. ลงมือทำโดยไม่ย้อนกลับไปทำสิ่งที่เสร็จและตรวจผ่านแล้ว

หาก `progression_plan.md` ขัดแย้งกับโค้ดจริง ให้ถือโค้ดและผลทดสอบเป็นหลัก แล้วแก้ Progress ให้ตรงความจริง

---

## 2. หลักการทำงานเพื่อประหยัด Token

### ต้องทำ

- ทำทีละ Phase
- ในหนึ่ง Session ให้มุ่งจบ Milestone ที่ทดสอบได้
- อ่านเฉพาะไฟล์ที่เกี่ยวข้อง
- ใช้การค้นหาชื่อ Function หรือไฟล์ แทนการอ่านทุกไฟล์
- ใช้โครงสร้างเดิมก่อนสร้างของใหม่
- สรุปเฉพาะสิ่งจำเป็น
- อัปเดต Progress แบบกระชับแต่ครบ

### ห้ามทำ

- อ่าน Repository ทั้งหมดโดยไม่มีเหตุผล
- Rewrite ระบบทั้งชุด
- เปลี่ยน Tech Stack
- เพิ่ม Feature นอก Scope
- สร้างเอกสารซ้ำหลายไฟล์
- ทำ Refactor ใหญ่พร้อม Feature
- อธิบายโค้ดยาวโดยไม่ลงมือแก้
- อ้างว่าเสร็จโดยไม่ทดสอบ
- ทำหลาย Phase พร้อมกันจนตรวจสอบไม่ได้

---

## 3. ขั้นตอนมาตรฐานในแต่ละ Session

### Step 1 — ตรวจสถานะ

อ่านจาก `progression_plan.md`

ต้องระบุให้ได้ว่า

- Phase ปัจจุบันคืออะไร
- งานล่าสุดที่เสร็จคืออะไร
- งานที่ค้างคืออะไร
- มี Blocker หรือไม่
- ต้องการข้อมูลจาก Admin หรือไม่

### Step 2 — ตรวจของจริง

ตรวจอย่างน้อย

- Git status
- โครงสร้างไฟล์
- ไฟล์ที่ถูกระบุว่าแก้ล่าสุด
- Configuration ที่จำเป็น
- ผล Test หรือ Build ล่าสุด
- TODO/FIXME ที่เกี่ยวข้อง

### Step 3 — วางแผนรอบนี้

เขียนแผนสั้น ๆ ไม่เกิน 5–8 ข้อ

แผนต้อง

- ผูกกับ Acceptance Criteria
- ระบุไฟล์ที่จะเปลี่ยน
- ไม่ขยาย Scope
- มีวิธีทดสอบหลังแก้

### Step 4 — Implement

- แก้โค้ดตามงาน
- รักษา Backward Compatibility เท่าที่จำเป็น
- ใส่ Validation ฝั่ง Server สำหรับข้อมูลสำคัญ
- ไม่เชื่อข้อมูลจาก Frontend โดยตรง
- ไม่ฝังรหัสลับใน Client
- แยก Error Message สำหรับผู้ใช้และ Log สำหรับ Developer

### Step 5 — Test

เลือก Test ที่เหมาะกับงาน เช่น

- Static check
- Lint
- Unit test
- Apps Script test function
- Manual API test
- End-to-End checklist
- Test Upload
- Test Google Sheets write
- Test Google Drive write
- Test PDF export

ต้องบันทึกผลจริง ไม่ใช้คำว่า “น่าจะผ่าน”

### Step 6 — Update Progress

แก้ `progression_plan.md` ทุกครั้ง โดยบันทึก

- วันที่และเวลา
- Phase
- งานที่ทำ
- ไฟล์ที่แก้
- ผลทดสอบ
- สิ่งที่ยังไม่เสร็จ
- Blocker
- Next Action

### Step 7 — หยุดที่ขอบเขตเหมาะสม

เมื่อจบ Milestone หรือ Token เริ่มจำกัด ให้หยุดโดย

- ไม่ทิ้งโค้ดในสถานะพัง
- บันทึกงานค้างชัดเจน
- ระบุคำสั่งหรือไฟล์ที่ AI ตัวต่อไปต้องเริ่ม
- อัปเดต Progress ก่อนจบเสมอ

---

## 4. วิธีเลือก Phase ที่ต้องทำ

ใช้กฎนี้

1. Phase ก่อนหน้าต้องผ่าน Acceptance Criteria ที่จำเป็น
2. หากมี Blocker ให้แก้ Blocker ก่อน
3. หาก Phase ปัจจุบันยังไม่ครบ ห้ามข้ามไป Phase ถัดไป
4. อนุญาตให้เตรียม Interface ของ Phase ถัดไปได้เฉพาะเมื่อจำเป็นต่อ Phase ปัจจุบัน
5. ห้ามทำ UX Polish ก่อน Core Workflow ใช้งานได้
6. ห้ามทำ Report Builder ก่อนข้อมูลจริงถูกบันทึกและ Admin เลือกข้อมูลได้

---

## 5. แนวทาง Implementation ตาม Phase

### Phase 1 — Foundation

โฟกัส

- Repo structure
- Apps Script setup
- Google Sheets schema
- Script Properties
- Contributor/Admin code check
- Landing page
- API contract

อย่าทำ

- Dynamic Form แบบเต็ม
- Admin Dashboard แบบเต็ม
- PDF Report Builder

จบ Phase เมื่อ Connection และ Auth แบบ 2 รหัสทำงานจริง

---

### Phase 2 — Contributor Flow

โฟกัส

- Dynamic schema
- Form renderer
- Validation
- Submission ID
- Google Sheets write
- Google Drive upload
- Summary page

ควรเริ่มจากหมวดตัวอย่าง 1 หมวดที่มี

- ข้อความ
- ตัวเลข
- ตาราง
- รูป
- PDF

เมื่อ Flow ผ่านแล้วจึงเปิดใช้กับ 11 หมวดผ่าน Schema

อย่าเขียนหน้าแยก 11 หน้า หาก Schema เดียวรองรับได้

---

### Phase 3 — Admin Flow

โฟกัส

- List
- Detail
- Edit
- Include/Exclude
- Completeness
- Image ordering
- Submission selection

Admin ต้องแก้ข้อมูลได้จริง ไม่ใช่เพียงดู

ทุกการแก้ไขต้อง Persist ลง Sheets

---

### Phase 4 — Report Builder

โฟกัส

- ใช้เฉพาะข้อมูลที่ Admin เลือก
- สร้างเอกสารแบบ Deterministic
- มี Error รายขั้นตอน
- บันทึก Export History
- ไม่พยายามทำ Layout ซับซ้อนเกิน Google Docs

เริ่มจาก PDF ที่ข้อมูลครบและอ่านได้ก่อน แล้วค่อยปรับความสวยงาม

---

### Phase 5 — UX และ Validation

โฟกัส

- ลดขั้นตอน
- ข้อความภาษาไทย
- Responsive
- Paste from Excel
- Progress indicator
- Error recovery
- Data checks

ห้ามแก้ Core Architecture หากไม่มี Blocker

---

### Phase 6 — QA และ Deployment

โฟกัส

- End-to-End
- Production configuration
- Deployment documentation
- User guide
- Admin guide
- Test report
- Secret review

ห้ามถือว่าเสร็จจนทดสอบ Production URL จริง

---

## 6. หลักการจัดการไฟล์

### ไฟล์หลักที่ต้องคงไว้

- `plan.md`
- `implement_plan.md`
- `progression_plan.md`
- `README.md`

### ไฟล์ที่อาจมีตามโครงสร้างจริง

```text
/
├── index.html
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
├── apps-script/
│   ├── Code.gs
│   ├── Config.gs
│   ├── Auth.gs
│   ├── SubmissionService.gs
│   ├── FileService.gs
│   ├── AdminService.gs
│   ├── ReportService.gs
│   ├── ValidationService.gs
│   ├── appsscript.json
│   └── html/
├── docs/
├── tests/
├── plan.md
├── implement_plan.md
├── progression_plan.md
└── README.md
```

ไม่จำเป็นต้องบังคับโครงสร้างนี้ หาก Repository มีโครงสร้างที่เหมาะสมอยู่แล้ว

---

## 7. แนวทาง Error Handling

### ฝั่งผู้ใช้

ข้อความต้องบอก

- เกิดอะไรขึ้น
- ต้องทำอะไรต่อ
- ข้อมูลสูญหายหรือไม่

ตัวอย่าง

- “อัปโหลดไฟล์ `รายงาน.pdf` ไม่สำเร็จ กรุณาลองใหม่เฉพาะไฟล์นี้”
- “ยังไม่ได้กรอกจำนวนผู้เรียน ม.4”
- “บันทึกข้อมูลแล้ว แต่มี 1 ไฟล์ที่ยังไม่สำเร็จ”
- “สร้าง PDF ไม่สำเร็จในขั้นตอนแทรกรูปภาพ กรุณาตรวจสิทธิ์ไฟล์ใน Google Drive”

### ฝั่ง Log

ต้องมี

- timestamp
- operation
- submission_id หรือ export_id
- category_id
- error message
- stack trace เมื่อทำได้
- user-safe message
- technical message

---

## 8. แนวทางข้อมูลและความปลอดภัยแบบไม่ซับซ้อน

ระบบใช้รหัสร่วม 2 รหัส แต่ต้องรักษาหลักขั้นต่ำ

- ไม่เก็บรหัสใน GitHub
- ตรวจรหัสที่ Apps Script
- ใช้ Session Token อายุสั้นหากจำเป็น
- ป้องกันการเรียก Admin API โดยไม่มี Admin Session
- ตรวจชนิดและขนาดไฟล์ที่ Server
- ไม่เชื่อ MIME Type จาก Browser เพียงอย่างเดียว
- จำกัด Folder ปลายทาง
- ไม่เปิด Drive Folder เป็น Public โดยอัตโนมัติ
- Escape ข้อความก่อนแสดงใน HTML
- ใช้ Lock เมื่อเขียนเลข Submission หรือข้อมูลที่อาจชนกัน

ไม่ต้องเพิ่มระบบ OAuth หรือ Workspace Login เว้นแต่เจ้าของระบบเปลี่ยน Requirement

---

## 9. รูปแบบการอัปเดต `progression_plan.md`

ต้องอัปเดตส่วนต่อไปนี้

1. Project Status
2. Phase Status
3. Completed Work
4. Current Work
5. Tests
6. Known Issues
7. Required Inputs
8. Next Actions
9. Session Log

ห้ามลบประวัติเก่า ให้เพิ่ม Session Log ใหม่ด้านบนหรือด้านล่างตามรูปแบบเดิม

---

## 10. รูปแบบรายงานเมื่อจบ Session

ตอบเจ้าของโปรเจกต์แบบกระชับ

```text
Phase:
งานที่เสร็จ:
ไฟล์ที่แก้:
ผลทดสอบ:
งานค้าง:
สิ่งที่ต้องการจาก Admin:
Next step:
```

หากยังไม่เสร็จ ต้องไม่ใช้คำว่า “เสร็จสมบูรณ์”

---

## 11. เงื่อนไขขอข้อมูลจาก Admin

ขอเฉพาะเมื่อจำเป็นจริง เช่น

- Spreadsheet ID
- Upload Folder ID
- Report Folder ID
- Google Docs Template ID
- Apps Script Deployment URL
- GitHub Pages URL
- รหัสผู้กรอก
- รหัส Admin
- ชื่อโรงเรียนและปีการศึกษา
- โลโก้โรงเรียน
- ข้อกำหนดหน้าปก PDF

หากยังไม่จำเป็นต่อ Phase ปัจจุบัน ให้ใช้ Placeholder และบันทึกไว้ใน `Required Inputs`

---

## 12. Recovery เมื่อ Token ใกล้หมด

ให้ทำทันที

1. หยุดเพิ่ม Feature
2. ทำให้โค้ดอยู่ในสถานะ Build หรือ Run ได้
3. บันทึกไฟล์ที่แก้
4. รัน Test ที่สั้นและสำคัญที่สุด
5. อัปเดต `progression_plan.md`
6. ระบุบรรทัดหรือ Function ที่ต้องทำต่อ
7. ระบุคำสั่ง Test ที่ต้องรัน
8. ระบุ Blocker
9. จบ Session โดยไม่เริ่มงานใหม่

AI ตัวถัดไปต้องสามารถอ่าน Progress แล้วเริ่มต่อได้โดยไม่ต้องถามว่า “ทำถึงไหนแล้ว”

---

## 13. Definition of a Good Handoff

การส่งต่องานถือว่าดีเมื่อมีข้อมูลครบดังนี้

- Phase ปัจจุบัน
- Acceptance Criteria ที่ผ่านแล้ว
- Acceptance Criteria ที่ยังไม่ผ่าน
- Commit หรือไฟล์ล่าสุด
- Test ล่าสุด
- Known Issues
- Environment ที่ใช้
- Configuration ที่ยังขาด
- Next Action ที่เป็นคำสั่งชัดเจน
- ไม่มีการอ้างว่าเสร็จเกินความจริง
