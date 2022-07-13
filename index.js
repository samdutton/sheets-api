const {google} = require('googleapis');

const publicationsData = require('./data/publications.json');
const publicationsDataWithoutAuthors = require('./data/publications-without-authors.json');

const SPREADSHEET_ID = '1PUiirLMSiO2fJonbkVcrpzfpMXhH8vVlo5s6MxnL6u4';
const RANGE = 'Publications!2:100000';

async function authorise() {
  let auth;
  try {
    auth = new google.auth.GoogleAuth({
      keyFile: 'keys.json',
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });
  } catch (error) {
    console.error('>>> Auth error:', error);
  }
  try {
    const authClientObject = await auth.getClient();
    const googleSheetsInstance = google.sheets({version: 'v4', auth: authClientObject});
    clearSheet(googleSheetsInstance, auth);
    const publicationsWithAuthors = publicationsData.map((publication) =>
      [publication.title, publication.authors, publication.date, publication.updated, publication.url]);
    appendToSheet(googleSheetsInstance, auth, publicationsWithAuthors);
    const publicationsWithoutAuthors = publicationsDataWithoutAuthors.map((publication) =>
      [publication.title, publication.authors, publication.date, publication.updated, publication.url]);
    // console.log(publicationsWithoutAuthors);
    appendToSheet(googleSheetsInstance, auth, publicationsWithoutAuthors);
  } catch (error) {
    console.error('>>> Error adding data to sheet:', error);
  }
}

async function appendToSheet(googleSheetsInstance, auth, data, range) {
  // console.log('>>>>', data);
  await googleSheetsInstance.spreadsheets.values.append({
    auth,
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
    resource: {values: data},
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
  });
}

async function clearSheet(googleSheetsInstance, auth) {
  await googleSheetsInstance.spreadsheets.values.clear({
    auth,
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
  });
}

// async function updateSheet(googleSheetsInstance, auth, data) {
//   // console.log('>>>>', data);
//   await googleSheetsInstance.spreadsheets.values.update({
//     auth,
//     spreadsheetId: SPREADSHEET_ID,
//     range: RANGE,
//     valueInputOption: 'USER_ENTERED',
//     resource: {values: data},
//   });
// }

authorise();

