
/**
 * CONFIGURATION
 * ID ของ Google Sheet ใหม่ที่คุณระบุ
 */
const SPREADSHEET_ID = '1Zsk3xcmZykE2-PajtNWHfFKHkx8gjToZoPWEFmIk_pU';

function getDb() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

// -----------------------------------------------------------------------------
// SETUP FUNCTION (รันครั้งแรกครั้งเดียวเพื่อสร้างตาราง)
// -----------------------------------------------------------------------------
function setupDatabase() {
  const ss = getDb();
  
  // 1. Setup UserData Sheet
  let userSheet = ss.getSheetByName('UserData');
  if (!userSheet) {
    userSheet = ss.insertSheet('UserData');
    // Header
    userSheet.getRange('A1:D1').setValues([['Username', 'Password', 'Division', 'IsAdmin']]);
    // Default Admin User
    userSheet.appendRow(['admin', 'admin123', 'Admin', 'TRUE']);
    // Default Normal User
    userSheet.appendRow(['1111', '1234', 'Customer Service', 'FALSE']);
  }

  // 2. Setup ScoreData Sheet
  let scoreSheet = ss.getSheetByName('ScoreData');
  if (!scoreSheet) {
    scoreSheet = ss.insertSheet('ScoreData');
    // Header
    scoreSheet.getRange('A1:H1').setValues([['Division', 'Quarter', 'Score1', 'Score2', 'Score3', 'Score4', 'Score5', 'Comment']]);
  }
}

// -----------------------------------------------------------------------------
// API HANDLERS
// -----------------------------------------------------------------------------

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getDivisions') {
    return responseJSON(getDivisions());
  }
  
  if (action === 'getScores') {
    const division = e.parameter.division;
    return responseJSON(getScores(division));
  }
  
  return responseJSON({ status: 'error', message: 'Invalid action' });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'login') {
      const result = doLogin(data);
      return responseJSON(result);
    }
    
    if (action === 'saveScores') {
      const result = saveScores(data);
      return responseJSON(result);
    }
    
    return responseJSON({ status: 'error', message: 'Invalid action' });
  } catch (err) {
    return responseJSON({ status: 'error', message: err.toString() });
  }
}

// -----------------------------------------------------------------------------
// LOGIC FUNCTIONS
// -----------------------------------------------------------------------------

function doLogin(params) {
  const ss = getDb();
  const sheet = ss.getSheetByName('UserData');
  if (!sheet) return null;

  const data = sheet.getDataRange().getDisplayValues(); // Read as String
  const inputUser = String(params.username).trim();
  const inputPass = String(params.password).trim();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const sheetUser = String(row[0]).trim();
    const sheetPass = String(row[1]).trim();
    
    if (sheetUser === inputUser && sheetPass === inputPass) {
      return {
        username: sheetUser,
        division: row[2],
        isAdmin: String(row[3]).toUpperCase() === 'TRUE'
      };
    }
  }
  return null;
}

function getScores(division) {
  const ss = getDb();
  const sheet = ss.getSheetByName('ScoreData');
  if (!sheet) return {};
  
  const data = sheet.getDataRange().getDisplayValues();
  const result = {};
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowDiv = row[0];
    const quarter = parseInt(row[1]);
    
    if (division && division !== 'all' && rowDiv !== division) continue;
    if (!rowDiv) continue;
    
    if (!result[rowDiv]) result[rowDiv] = { quarters: {} };
    
    result[rowDiv].quarters[quarter] = {
      scores: {
        1: Number(row[2]) || 0,
        2: Number(row[3]) || 0,
        3: Number(row[4]) || 0,
        4: Number(row[5]) || 0,
        5: Number(row[6]) || 0
      },
      comment: row[7] || ''
    };
  }
  return result;
}

function getDivisions() {
  const ss = getDb();
  const sheet = ss.getSheetByName('UserData');
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getDisplayValues();
  const divisions = [];
  const seen = {};
  
  for (let i = 1; i < data.length; i++) {
    const div = data[i][2];
    const isAdmin = String(data[i][3]).toUpperCase() === 'TRUE';
    if (div && div !== 'Admin' && !isAdmin && !seen[div]) {
      divisions.push(div);
      seen[div] = true;
    }
  }
  return divisions;
}

function saveScores(params) {
  const ss = getDb();
  let sheet = ss.getSheetByName('ScoreData');
  const data = sheet.getDataRange().getDisplayValues();
  let rowIndex = -1;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === params.division && parseInt(data[i][1]) === params.quarter) {
      rowIndex = i + 1;
      break;
    }
  }
  
  const rowData = [
    params.scores[1], params.scores[2], params.scores[3], 
    params.scores[4], params.scores[5], params.comment
  ];
  
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 3, 1, 6).setValues([rowData]);
  } else {
    sheet.appendRow([params.division, params.quarter, ...rowData]);
  }
  return { success: true };
}
