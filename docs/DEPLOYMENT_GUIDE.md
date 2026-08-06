# 🚀 คู่มือการติดตั้งและตั้งค่าระบบ (Deployment & Setup Guide)
**ระบบสารสนเทศโรงเรียน HONGSON Information Hub**

---

## 📌 บทนำ
เอกสารนี้เป็นคู่มือสำหรับ Developer หรือ System Administrator ในการติดตั้ง ตั้งค่า และวางระบบ **HONGSON Information Hub** ตั้งแต่เริ่มต้นจนเปิดใช้งานจริงบน Production Environment (Google Apps Script Web App & GitHub Pages)

---

## 🏗️ สถาปัตยกรรมระบบ (System Architecture)

```text
               +----------------------------------+
               |   GitHub Pages (Frontend Host)   |
               |  - Single Page Application (SPA) |
               |  - Vanilla HTML5 / CSS3 / JS     |
               +----------------------------------+
                                |
                   HTTPS REST API (JSON Payload)
                                |
                                v
               +----------------------------------+
               |  Google Apps Script (GAS Backend)|
               |  - doGet / doPost API Router     |
               |  - Auth Verification Engine      |
               |  - Submission & File Processor   |
               |  - Docs & PDF Report Builder     |
               +----------------------------------+
                                |
        +-----------------------+-----------------------+
        |                                               |
        v                                               v
+-----------------------+               +-----------------------+
|     Google Sheets     |               |     Google Drive      |
| - CONFIG              |               | - Uploaded Files Dir  |
| - CATEGORIES (Schema) |               | - Generated PDF Dir   |
| - SUBMISSIONS         |               |                       |
| - DATA                |               +-----------------------+
| - FILES               |                           |
| - EXPORTS             |                           v
+-----------------------+               +-----------------------+
                                        |  Google Docs Engine   |
                                        | - Cover Page          |
                                        | - Table & Image Layout|
                                        +-----------------------+
```

---

## 📑 ขั้นตอนการตั้งค่าระบบ (Step-by-Step Setup)

### ขั้นตอนที่ 1: เตรียม Google Sheets และ Google Drive Folders
1. เข้าสู่ [Google Drive](https://drive.google.com) ด้วยบัญชี Google Workspace ของโรงเรียน
2. สร้างโฟลเดอร์หลักชื่อ `HONGSON Information System 2569`
3. สร้างโฟลเดอร์ย่อย 2 โฟลเดอร์:
   - `Uploaded Files` (สำหรับเก็บไฟล์แนบจากผู้กรอก) -> **คัดลอก Folder ID**
   - `Generated Reports` (สำหรับเก็บไฟล์ PDF รายงาน) -> **คัดลอก Folder ID**
4. สร้าง Google Sheets ใหม่ชื่อ `HONGSON_Information_Database` -> **คัดลอก Spreadsheet ID**

---

### ขั้นตอนที่ 2: ติดตั้ง Google Apps Script Backend
1. ใน Google Sheets ที่สร้างขึ้น ไปที่เมนู **ส่วนขยาย (Extensions) -> Apps Script**
2. ตั้งชื่อโปรเจกต์ Apps Script ว่า `Hongson-Information-Backend`
3. สร้างไฟล์ใน Apps Script Editor และคัดลอกโค้ดจากโฟลเดอร์ `apps-script/` ทั้งหมด 10 ไฟล์:
   - `appsscript.json` (เปิด View -> Show manifest file)
   - `Code.gs` (Router หลัก)
   - `Config.gs` (Properties Manager)
   - `Auth.gs` (Server Auth)
   - `SheetService.gs` (Sheets Schema & Data Seeding)
   - `FileService.gs` (Drive Storage Engine)
   - `SubmissionService.gs` (Submissions & Lock Handler)
   - `AdminService.gs` (Admin Dashboard API)
   - `ReportService.gs` (Google Docs & PDF Exporter)
   - `ValidationService.gs` (Server Data Validation)

---

### ขั้นตอนที่ 3: ตั้งค่า Script Properties (รหัสลับ และ IDs)
1. ในหน้า Apps Script ไปที่ **การตั้งค่าโปรเจกต์ (Project Settings ⚙️)**
2. เลื่อนลงมาที่หัวข้อ **คุณสมบัติของสคริปต์ (Script Properties)**
3. เพิ่มรายการ Property ต่อไปนี้:

| Property Key | Example Value | คำอธิบาย |
|---|---|---|
| `CONTRIBUTOR_CODE` | `HG-CONTRIB-2026` | รหัสลับสำหรับผู้กรอกข้อมูล |
| `ADMIN_CODE` | `HG-ADMIN-2026` | รหัสลับสำหรับผู้ดูแลระบบ |
| `SPREADSHEET_ID` | `1A2b3C4d5E...` | ID ของ Google Sheets |
| `UPLOAD_FOLDER_ID` | `1X2y3Z...` | ID โฟลเดอร์ Uploaded Files ใน Drive |
| `REPORT_FOLDER_ID` | `1R2e3P...` | ID โฟลเดอร์ Generated Reports ใน Drive |

---

### ขั้นตอนที่ 4: การทำให้ใช้งานได้ (Deploy Web App)
1. ที่มุมขวาบนของ Apps Script Editor คลิก **การทำให้ใช้งานได้ (Deploy) -> การทำให้ใช้งานได้ใหม่ (New deployment)**
2. คลิกเลือกประเภท: **เว็บแอป (Web App)**
3. ตั้งค่าการเข้าถึง:
   - **คำอธิบาย:** `HONGSON Web App Production v1.0`
   - **เรียกใช้ในฐานะ (Execute as):** `ฉัน (Me - อีเมลของคุณ)`
   - **ผู้มีสิทธิ์เข้าถึง (Who has access):** `ทุกคน (Anyone)`
4. คลิก **การทำให้ใช้งานได้ (Deploy)**
5. ยืนยันสิทธิ์การเข้าถึงบัญชี Google (Authorize Access)
6. **คัดลอก URL ของเว็บแอป (Web App URL)** (เช่น `https://script.google.com/macros/s/.../exec`)

---

### ขั้นตอนที่ 5: เริ่มต้นสร้างตารางใน Google Sheets (Setup Sheets)
1. เปิดหน้า Web App หรือใช้งานปุ่ม **⚙️ ตั้งค่า Web App & สร้างโครงสร้าง Sheets** บน Frontend
2. ระบบจะเรียกใช้ฟังก์ชัน `setupSheets()` ใน `SheetService.gs`
3. ตรวจสอบใน Google Sheets จะพบ 6 Tabs ถูกสร้างขึ้นอัตโนมัติ:
   - `CONFIG`, `CATEGORIES` (พร้อมข้อมูล 11 หมวดเริ่มต้น), `SUBMISSIONS`, `DATA`, `FILES`, `EXPORTS`

---

### ขั้นตอนที่ 6: นำ Frontend ขึ้น GitHub Pages
1. Push โค้ดทั้งหมดขึ้น GitHub Repository (เช่น `https://github.com/<username>/Hongson-Information`)
2. ไปที่ **Settings -> Pages** ใน GitHub Repository
3. เลือก Source: `Deploy from a branch`, Branch: `main` / `/ (root)` แล้วกด **Save**
4. เมื่อ GitHub Pages สร้างเสร็จแล้ว ให้เปิด URL (เช่น `https://<username>.github.io/Hongson-Information`)
5. คลิกปุ่ม ⚙️ บนมุมขวาบนของหน้าเว็บ นำ **Web App URL** ที่ได้จากขั้นตอนที่ 4 มาใส่แล้วกด **บันทึกการตั้งค่า**

---

## 🔒 ข้อควรระวังและการตรวจสอบความปลอดภัย (Security Check)
1. **ห้ามนำ Script Properties ใส่ไว้ใน Client-side JS:** รหัสลับ `CONTRIBUTOR_CODE` และ `ADMIN_CODE` ต้องอยู่เฉพาะใน Script Properties ของ Apps Script เท่านั้น
2. **Permission ของ Google Drive:** ตรวจสอบว่าโฟลเดอร์ `Uploaded Files` และ `Generated Reports` ตั้งค่าสิทธิ์การเข้าถึงให้เรียบร้อย
3. **Execution Limit ใน Apps Script:** การ Export รายงาน PDF ขนาดใหญ่อาจใช้เวลา 30-90 วินาที ซึ่งอยู่ภายใต้ขีดจำกัด 6 นาทีของ Google Apps Script Free Tier
