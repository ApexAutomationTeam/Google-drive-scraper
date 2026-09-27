// ═══════════════════════════════════════════════════
// FOLDER ID — apna folder ID yahan daalo
const FOLDER_ID = 'PASTE_YOUR_FOLDER_ID_HERE';
// ═══════════════════════════════════════════════════

function runAll() {
  var allFiles = [];
  Logger.log('Scanning folder...');

  scanFolder(FOLDER_ID, 'Root', allFiles);

  if (allFiles.length === 0) {
    Logger.log('ERROR: Koi file nahi mili! Folder ID check karo.');
    return;
  }

  Logger.log('Total files found: ' + allFiles.length);

  // ── Uploaded time ke hisaab se sort — purani pehle, nayi baad mein ──
  allFiles.sort(sortByTime);

  var sheetUrl = makeSheet(allFiles);
  var docUrl   = makeDoc(allFiles);

  Logger.log('');
  Logger.log('========== DONE ==========');
  Logger.log('SHEET : ' + sheetUrl);
  Logger.log('DOC   : ' + docUrl);
  Logger.log('==========================');
}

// ══════════════════════════════════════════════════════════
// ── DO NAYE BUTTONS — ek saath ──
// ══════════════════════════════════════════════════════════

// ── RUN TODAY — sirf aaj ki date wali files scrape ──
function runToday() {
  var allFiles = [];
  Logger.log('Scanning folder (today only)...');

  scanFolder(FOLDER_ID, 'Root', allFiles);

  if (allFiles.length === 0) {
    Logger.log('ERROR: Koi file nahi mili! Folder ID check karo.');
    return;
  }

  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

  var todayFiles = allFiles.filter(function(f) {
    return f.createdDate === today;
  });

  if (todayFiles.length === 0) {
    Logger.log('Aaj (' + today + ') koi file upload nahi hui.');
    return;
  }

  Logger.log('Aaj ki files found: ' + todayFiles.length);

  todayFiles.sort(sortByTime);

  var sheetUrl = makeSheet(todayFiles);
  var docUrl   = makeDoc(todayFiles);

  Logger.log('');
  Logger.log('========== DONE (TODAY) ==========');
  Logger.log('SHEET : ' + sheetUrl);
  Logger.log('DOC   : ' + docUrl);
  Logger.log('==================================');
}

// ── RUN MOST RECENT — jo bhi sabse aakhri (latest) date ho, sirf wahi files ──
function runMostRecent() {
  var allFiles = [];
  Logger.log('Scanning folder (most recent date only)...');

  scanFolder(FOLDER_ID, 'Root', allFiles);

  if (allFiles.length === 0) {
    Logger.log('ERROR: Koi file nahi mili! Folder ID check karo.');
    return;
  }

  // Sabse recent (latest) date dhoondo
  var latestDate = '';
  for (var i = 0; i < allFiles.length; i++) {
    if (allFiles[i].createdDate && allFiles[i].createdDate > latestDate) {
      latestDate = allFiles[i].createdDate;
    }
  }

  if (!latestDate) {
    Logger.log('Koi valid date nahi mili.');
    return;
  }

  // Sirf us latest date wali files rakho
  var recentFiles = allFiles.filter(function(f) {
    return f.createdDate === latestDate;
  });

  Logger.log('Most recent date: ' + latestDate + '  |  Files: ' + recentFiles.length);

  recentFiles.sort(sortByTime);

  var sheetUrl = makeSheet(recentFiles);
  var docUrl   = makeDoc(recentFiles);

  Logger.log('');
  Logger.log('========== DONE (MOST RECENT) ==========');
  Logger.log('SHEET : ' + sheetUrl);
  Logger.log('DOC   : ' + docUrl);
  Logger.log('========================================');
}

// ── SORT HELPER — full timestamp (time tak) ke hisaab se ──
function sortByTime(a, b) {
  return a.createdFull < b.createdFull ? -1 : (a.createdFull > b.createdFull ? 1 : 0);
}

// ── RECURSIVE SCAN — Shared + Own Drives ───────────
function scanFolder(folderId, parentPath, results) {
  var pageToken = null;
  do {
    try {
      var params = {
        q: "'" + folderId + "' in parents and trashed = false",
        fields: 'nextPageToken, files(id, name, mimeType, createdTime, modifiedTime)',
        pageSize: 1000,
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        orderBy: 'folder,name'
      };
      if (pageToken) { params.pageToken = pageToken; }

      var res   = Drive.Files.list(params);
      var items = res.files || [];
      pageToken = res.nextPageToken;

      for (var i = 0; i < items.length; i++) {
        var f = items[i];
        results.push(getInfo(f, parentPath));
        if (f.mimeType === 'application/vnd.google-apps.folder') {
          scanFolder(f.id, parentPath + ' > ' + f.name, results);
        }
      }
    } catch(e) {
      Logger.log('Folder error (' + folderId + '): ' + e.message);
      break;
    }
  } while (pageToken);
}

// ── FILE INFO ───────────────────────────────────────
function getInfo(f, parentPath) {
  var mime = f.mimeType;
  var id   = f.id;
  var type = 'File';
  var url  = 'https://drive.google.com/file/d/' + id + '/view?usp=drive_link';

  if (mime === 'application/vnd.google-apps.folder') {
    type = 'Folder';
    url  = 'https://drive.google.com/drive/folders/' + id;
  } else if (mime === 'application/pdf') {
    type = 'PDF';
  } else if (mime === 'application/vnd.google-apps.spreadsheet') {
    type = 'Google Sheet';
    url  = 'https://docs.google.com/spreadsheets/d/' + id + '/edit';
  } else if (mime === 'application/vnd.google-apps.document') {
    type = 'Google Doc';
    url  = 'https://docs.google.com/document/d/' + id + '/edit';
  } else if (mime === 'application/vnd.google-apps.presentation') {
    type = 'Slides';
    url  = 'https://docs.google.com/presentation/d/' + id + '/edit';
  } else if (f.name && f.name.indexOf('.xlsx') > -1) {
    type = 'Excel';
  } else if (f.name && f.name.indexOf('.xls') > -1) {
    type = 'Excel';
  } else if (f.name && f.name.indexOf('.docx') > -1) {
    type = 'Word';
  } else if (f.name && f.name.indexOf('.pptx') > -1) {
    type = 'PPT';
  } else if (f.name && f.name.indexOf('.ppt') > -1) {
    type = 'PPT';
  } else if (f.name && f.name.indexOf('.pdf') > -1) {
    type = 'PDF';
  } else if (f.name && f.name.indexOf('.csv') > -1) {
    type = 'CSV';
  } else if (f.name && f.name.indexOf('.zip') > -1) {
    type = 'ZIP';
  }

  var tz = Session.getScriptTimeZone();

  // Date-only (filtering ke liye) + Date&Time (display ke liye)
  var createdDate      = f.createdTime  ? Utilities.formatDate(new Date(f.createdTime),  tz, 'yyyy-MM-dd')        : '';
  var createdDateTime  = f.createdTime  ? Utilities.formatDate(new Date(f.createdTime),  tz, 'yyyy-MM-dd HH:mm') : '';
  var modifiedDateTime = f.modifiedTime ? Utilities.formatDate(new Date(f.modifiedTime), tz, 'yyyy-MM-dd HH:mm') : '';

  return {
    name            : f.name,
    type            : type,
    url             : url,
    id              : id,
    parent          : parentPath,
    createdDate     : createdDate,          // sirf date — filter ke liye
    createdDateTime : createdDateTime,      // date + time — display ke liye
    createdFull     : f.createdTime || '',  // raw timestamp — exact sorting ke liye
    modifiedDateTime: modifiedDateTime
  };
}

// ── GOOGLE SHEET ────────────────────────────────────
function makeSheet(allFiles) {
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MM-yyyy');
  var ss = SpreadsheetApp.create('Drive_Sheet_' + today);
  var sh = ss.getActiveSheet();
  sh.setName('All Files');

  // Header row
  sh.appendRow(['#', 'File Name', 'Type', 'URL', 'File ID', 'Parent Folder', 'Uploaded (Date & Time)', 'Modified (Date & Time)']);

  var headerRange = sh.getRange(1, 1, 1, 8);
  headerRange.setBackground('#1a73e8');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);
  headerRange.setFontFamily('Arial');

  // Data rows
  for (var i = 0; i < allFiles.length; i++) {
    var f = allFiles[i];
    sh.appendRow([i + 1, f.name, f.type, f.url, f.id, f.parent, f.createdDateTime, f.modifiedDateTime]);

    var bg = '#ffffff';
    if (f.type === 'Folder')                                           { bg = '#fff3cd'; }
    else if (f.type === 'PDF')                                         { bg = '#fce4ec'; }
    else if (f.type === 'Google Sheet' || f.type === 'Excel')          { bg = '#e8f5e9'; }
    else if (f.type === 'Google Doc'   || f.type === 'Word')           { bg = '#e3f2fd'; }
    else if (f.type === 'Slides'       || f.type === 'PPT')            { bg = '#f3e5f5'; }
    else if (f.type === 'CSV')                                         { bg = '#e0f7fa'; }

    if (bg !== '#ffffff') {
      sh.getRange(i + 2, 1, 1, 8).setBackground(bg);
    }
  }

  // Column widths
  sh.setFrozenRows(1);
  sh.setColumnWidth(1, 45);
  sh.setColumnWidth(2, 270);
  sh.setColumnWidth(3, 120);
  sh.setColumnWidth(4, 360);
  sh.setColumnWidth(5, 200);
  sh.setColumnWidth(6, 200);
  sh.setColumnWidth(7, 150);
  sh.setColumnWidth(8, 150);

  Logger.log('Sheet ready: ' + ss.getUrl());
  return ss.getUrl();
}

// ── GOOGLE DOC — Beautiful Formatting ──────────────
function makeDoc(allFiles) {
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MM-yyyy');
  var doc  = DocumentApp.create('Drive_Doc_' + today);
  var body = doc.getBody();

  body.setMarginTop(36);
  body.setMarginBottom(36);
  body.setMarginLeft(54);
  body.setMarginRight(54);

  // Main Title
  var title = body.appendParagraph('Drive Files');
  title.setHeading(DocumentApp.ParagraphHeading.HEADING1);
  title.setForegroundColor('#1a73e8');
  title.setFontFamily('Arial');
  title.setBold(true);
  title.setSpacingAfter(4);

  // Subtitle
  var sub = body.appendParagraph(today + '   |   Total: ' + allFiles.length + ' items');
  sub.setFontSize(10);
  sub.setForegroundColor('#888888');
  sub.setItalic(true);
  sub.setSpacingAfter(16);

  // Top divider
  body.appendHorizontalRule();

  // Each file entry
  for (var i = 0; i < allFiles.length; i++) {
    var f = allFiles[i];

    // File Name — Bold, dark
    var namePara = body.appendParagraph(f.name);
    namePara.setBold(true);
    namePara.setFontSize(11);
    namePara.setForegroundColor('#202124');
    namePara.setFontFamily('Arial');
    namePara.setSpacingBefore(12);
    namePara.setSpacingAfter(2);
    namePara.setItalic(false);

    // URL — Blue
    var urlPara = body.appendParagraph('\uD83D\uDD17  ' + f.url);
    urlPara.setBold(false);
    urlPara.setFontSize(10);
    urlPara.setForegroundColor('#1155cc');
    urlPara.setFontFamily('Arial');
    urlPara.setItalic(false);
    urlPara.setSpacingBefore(2);
    urlPara.setSpacingAfter(2);

    // Parent folder — if not Root
    if (f.parent && f.parent !== 'Root') {
      var parentPara = body.appendParagraph('\uD83D\uDCC2  ' + f.parent);
      parentPara.setFontSize(9);
      parentPara.setForegroundColor('#999999');
      parentPara.setItalic(true);
      parentPara.setBold(false);
      parentPara.setSpacingAfter(2);
    }

    // Uploaded date + time
    if (f.createdDateTime) {
      var datePara = body.appendParagraph('\uD83D\uDCC5  Uploaded: ' + f.createdDateTime);
      datePara.setFontSize(9);
      datePara.setForegroundColor('#aaaaaa');
      datePara.setItalic(true);
      datePara.setBold(false);
      datePara.setSpacingAfter(8);
    }

    // Divider between files
    body.appendHorizontalRule();
  }

  doc.saveAndClose();
  Logger.log('Doc ready: ' + doc.getUrl());
  return doc.getUrl();
}
