const {google} = require('googleapis');

const publications = require('./data/publications.json');

const spreadsheetData = publications.map((publication) => [publication.title, publication.authors]);
console.log(spreadsheetData);

const SPREADSHEET_ID = '1PUiirLMSiO2fJonbkVcrpzfpMXhH8vVlo5s6MxnL6u4';

async function authorise() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'keys.json',
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });
    const authClientObject = await auth.getClient();
    const googleSheetsInstance = google.sheets({version: 'v4', auth: authClientObject});
    setValue(googleSheetsInstance, auth);
  } catch (error) {
    console.error('>>> Auth error:', error);
  }
}

async function setValue(googleSheetsInstance, auth) {
  await googleSheetsInstance.spreadsheets.values.update({
    auth,
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1',
    valueInputOption: 'USER_ENTERED',
    resource: {values: spreadsheetData},
  });
}

authorise();

