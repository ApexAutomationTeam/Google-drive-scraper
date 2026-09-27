# Google-drive-scraper
Google Apps Script to scan Drive folders recursively and export details to Google Sheets &amp; Docs.
Markdown
# 📂 Google Drive Scraper & Reporter (Advanced)

> 💡 **Community Project**: This is one of many automation solutions open-sourced by **[Apex Automation Team](https://apexautomationteam.com/)**. Visit our website to explore more enterprise workflow automations, custom AI integrations, and scripting tools!

An advanced, production-ready Google Apps Script tool that recursively crawls Google Drive folders (both Personal and Shared Drives), extracts nested files with exact timestamps, and automatically builds color-coded **Google Sheets** and executive **Google Docs** reports.

---

## ⚡ Execution Modes (Functions)

The script provides three specialized execution entry points:

1. **`runAll`**: Scans the complete folder hierarchy, orders all files chronologically by full upload time (oldest to newest), and outputs reports.
2. **`runToday`**: Scans the folder and filters **only** files uploaded on the current date (`yyyy-MM-dd`), perfect for daily standup updates or end-of-day archiving.
3. **`runMostRecent`**: Automatically locates the latest upload date across the drive folder and indexes **only** that latest batch, ideal for monitoring periodic uploads.

---

## 🚀 Key Features

* **Recursive Subfolder Traversal:** Deep crawls subfolders down to any nested depth automatically.
* **Shared Drives Support:** Built-in `supportsAllDrives: true` and `includeItemsFromAllDrives: true` allows seamless indexing on enterprise Workspace drives.
* **Batch Pagination (1000+ Files):** Uses Drive API `nextPageToken` loops to scan massive file directories reliably.
* **Precise Timestamp Tracking:** Formats both date-only strings (for filtering) and detailed `YYYY-MM-DD HH:mm` timestamps with timezone alignment.
* **Dual Formatted Exports:**
  * **Google Sheets:** Color-coded rows by file type (PDF, Sheets, Docs, Slides, CSV, Folders), frozen sticky headers, auto-adjusted column widths, and direct URLs.
  * **Google Docs:** Clean list view featuring bold filenames, clickable link previews, and parent folder path breadcrumbs ready for Slack or email sharing.
* **Crash-Resilient:** Silent error-catching ensures an inaccessible subfolder doesn't break the entire scan.

---

## 🛠️ Setup & Usage Instructions

### 1. Open Google Apps Script
1. Navigate to [script.google.com](https://script.google.com/) and create a **New project**.

### 2. Enable Google Drive API Service
1. In the left navigation bar, click the **`+`** icon next to **Services**.
2. Select **Drive API** (Version **v3**).
3. Click **Add**.

### 3. Configure Script & Folder ID
1. Paste the script from `DriveScraper.js` into the Apps Script editor.
2. In line 3, replace `YOUR_GOOGLE_DRIVE_FOLDER_ID` with your folder ID:
   ```javascript
   const FOLDER_ID = 'YOUR_GOOGLE_DRIVE_FOLDER_ID';
(Found in your Drive folder URL: drive.google.com/drive/folders/<FOLDER_ID>)

4. Execute
In the top toolbar dropdown, select your desired function: runAll, runToday, or runMostRecent.

Click ▶ Run.

Accept Google authorization permissions on the first run.

Open the Execution Log at the bottom to view the direct links to your newly generated Google Sheet and Google Doc.

🏢 About Apex Automation Team
We build custom integrations, AI agents, and enterprise workflows to save businesses hundreds of manual hours.

Website: https://apexautomationteam.com/

Inquiries & Automation Requests: Connect with us through our website.

How to Run in Google Apps ScriptOpen Google Apps Script:

Go to script.google.com/home and click on New project.   

1️⃣ Paste the CodeIn the Apps Script editor, press Ctrl + A → Delete → paste this code.   Paste your folder ID in line 3:   JavaScriptconst FOLDER_ID = 'YOUR_FOLDER_ID_HERE';
2️⃣ Add the Drive API Service (if not already added)On the left sidebar, click the + icon next to Services.   Find Drive API in the list → click Add (Version v3).   
3️⃣ Select the FunctionIn the top toolbar dropdown, select runAll (or runToday / runMostRecent).   
4️⃣ Run the ScriptClick ▶ Run.   When the permissions popup appears, grant access by clicking Allow.  
5️⃣ ResultsGoogle Sheet — All files organized with color coding by file type.   Google Doc — Formatted list: File Name → URL → File Name → URL (ready to copy and paste into Slack).   
