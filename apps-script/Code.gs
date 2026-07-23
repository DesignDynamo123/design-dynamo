/**
 * Design Dynamo — booking form → Google Sheet
 *
 * Receives a POST from book.html and appends one row per booking.
 *
 * Writes to the client-meetings sheet. The sheet URL is intentionally not
 * recorded here — see SPREADSHEET_ID below.
 *
 * SETUP (once)
 * 1. Open the sheet → Extensions → Apps Script. Delete the starter code, paste this file.
 * 2. In the toolbar dropdown pick `setupSheet` → Run.
 *    Google asks for permission the first time — approve it.
 *    This creates the "Bookings" tab, writes the header row, and formats the
 *    contact column as text so "+91…" isn't mangled into a formula.
 * 3. Deploy → New deployment → gear icon → Web app.
 *      Execute as:      Me
 *      Who has access:  Anyone     ← required. "Anyone with a Google account"
 *                                    silently fails for logged-out visitors.
 * 4. Copy the /exec URL and paste it into SHEET_ENDPOINT at the top of js/book.js.
 * 5. Open the /exec URL in a browser — it should reply
 *    {"result":"success","message":"Design Dynamo booking endpoint is live."}
 *
 * After ANY later edit to this file: Deploy → Manage deployments → edit (pencil)
 * → Version: New version → Deploy. Saving alone does not update the live URL.
 */

/**
 * Leave EMPTY when the script is bound to the sheet — i.e. you opened it via
 * Extensions -> Apps Script from the spreadsheet itself, which is the setup
 * described above. Bound scripts reach their own sheet through
 * getActiveSpreadsheet(), so no ID is needed.
 *
 * Deliberately not hardcoded: this repo is the deploy source for the site, and
 * the host serves every file in it, so anything written here is public. Only
 * fill this in if you run the script standalone, and if you do, keep that copy
 * out of the repo.
 */
var SPREADSHEET_ID = "";

/** Tab the bookings land in — created automatically if it doesn't exist. */
var SHEET_NAME = "Bookings";

/** Column order — must match the order of values appended in doPost. */
var HEADERS = [
  "Timestamp",
  "Company name",
  "Company brief",
  "Requirement",
  "Person's name",
  "Designation",
  "Contact no.",
  "Heard from",
];

var CONTACT_COL = 7;   // 1-indexed position of "Contact no." in HEADERS

/**
 * Run once from the editor. Safe to re-run — it only rewrites the header row,
 * never the bookings below it.
 */
function setupSheet() {
  var sheet = getSheet_();

  sheet.getRange(1, 1, 1, HEADERS.length)
    .setValues([HEADERS])
    .setFontWeight("bold");
  sheet.setFrozenRows(1);

  // phone numbers are text, not numbers: keeps leading +, 0s and spaces intact
  sheet.getRange(2, CONTACT_COL, sheet.getMaxRows() - 1, 1).setNumberFormat("@");

  // the brief is long-form — give it room and wrap it
  sheet.setColumnWidth(3, 420);
  sheet.getRange(1, 3, sheet.getMaxRows(), 1).setWrap(true);

  sheet.autoResizeColumns(1, 2);
  sheet.autoResizeColumns(4, HEADERS.length - 3);
}

function getSheet_() {
  // openById works whether the script is bound to the sheet or standalone
  var ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  return sheet;
}

function doPost(e) {
  // one writer at a time, so two submissions in the same second can't collide on a row
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);

    var data = JSON.parse(e.postData.contents);

    // server-side guard: a tampered-with client can't write blank rows
    var required = ["company", "brief", "requirement", "name", "designation", "contact", "source"];
    for (var i = 0; i < required.length; i++) {
      if (!String(data[required[i]] || "").trim()) {
        return json_({ result: "error", message: "Missing field: " + required[i] });
      }
    }

    var sheet = getSheet_();
    if (sheet.getLastRow() === 0) setupSheet();

    sheet.appendRow([
      new Date(),
      data.company,
      data.brief,
      data.requirement,
      data.name,
      data.designation,
      data.contact,
      data.source,
    ]);

    // re-apply text format in case the row landed past the pre-formatted range
    sheet.getRange(sheet.getLastRow(), CONTACT_COL).setNumberFormat("@");

    return json_({ result: "success" });
  } catch (err) {
    return json_({ result: "error", message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Visiting the /exec URL in a browser — confirms the deployment is live. */
function doGet() {
  return json_({ result: "success", message: "Design Dynamo booking endpoint is live." });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
