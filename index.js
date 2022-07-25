const {google} = require('googleapis');

// const SPREADSHEET_ID = '1PUiirLMSiO2fJonbkVcrpzfpMXhH8vVlo5s6MxnL6u4'; // actual
const SPREADSHEET_ID = '1zgjG5ZSyrV_0274UV1jcnd7yzHybuupOy0v76qpkibE'; // test
//  const HEADER_ROW = [['Title', 'Authors', 'Date', 'Updated', 'URL']];

async function authorise() {
  let publications = require('../data/publications.json');
  const numPublications = publications.length;
  const range = `Publications!3:${numPublications + 1}`;
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
    console.log(`Processing ${numPublications} publications.`);
    publications = publications.map((publication) =>
      [publication.title, publication.authors, publication.date, publication.updated,
        publication.pageViews, publication.uniqueViews, publication.averageTimeOnPage,
        publication.entrances, publication.bounceRate, publication.percentExit,
        createHyperlink(publication.url), createHyperlink(publication.github)]);
    // appendToSheet(googleSheetsInstance, auth, HEADER_ROW);
    await clearSheet(googleSheetsInstance, auth, range);
    await updateSheet(googleSheetsInstance, auth, publications, range);
    console.log(`Updated sheet at https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}.`);
  } catch (error) {
    console.error('>>> Error adding data to sheet:', error);
  }
}

function createHyperlink(url) {
  return `=HYPERLINK("${url}","${url.replace('https://', '')}")`;
}

// async function appendToSheet(googleSheetsInstance, auth, data, range) {
//   // console.log('>>>>', data);
//   await googleSheetsInstance.spreadsheets.values.append({
//     auth,
//     spreadsheetId: SPREADSHEET_ID,
//     range: RANGE,
//     resource: {values: data},
//     valueInputOption: 'USER_ENTERED',
//     insertDataOption: 'INSERT_ROWS',
//   });
// }

async function clearSheet(googleSheetsInstance, auth, range) {
  await googleSheetsInstance.spreadsheets.values.clear({
    auth,
    spreadsheetId: SPREADSHEET_ID,
    range: range,
  });
}

async function updateSheet(googleSheetsInstance, auth, data, range) {
  await googleSheetsInstance.spreadsheets.values.update({
    auth,
    spreadsheetId: SPREADSHEET_ID,
    range: range,
    valueInputOption: 'USER_ENTERED',
    resource: {values: data},
  });
}

authorise();

