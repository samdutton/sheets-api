/* exported gapiLoaded */
/* exported gisLoaded */
/* exported handleAuthClick */
/* exported handleSignoutClick */
/* global gapi google */

// TODO(developer): Set to client ID and API key from the Developer Console
const CLIENT_ID = '143457350477-o0igus8n1ijsilfh9dejruic0htgtnbe.apps.googleusercontent.com';
const API_KEY = 'AIzaSyACvBPVzFOyHUd6sV27hUzrJTj_mmiWHic';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

let tokenClient;
let gapiInited = false;
let gisInited = false;

document.getElementById('authorize_button').style.visibility = 'hidden';
document.getElementById('signout_button').style.visibility = 'hidden';

/**
 * Callback after api.js is loaded.
 */
// eslint-disable-next-line no-unused-vars
function gapiLoaded() {
  gapi.load('client', intializeGapiClient);
};

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function intializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;
  maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
// eslint-disable-next-line no-unused-vars
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '', // defined later
  });
  gisInited = true;
  maybeEnableButtons();
};

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.getElementById('authorize_button').style.visibility = 'visible';
  }
}

/**
 *  Sign in the user upon button click.
 */
// eslint-disable-next-line no-unused-vars
function handleAuthClick() {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw (resp);
    }
    document.getElementById('signout_button').style.visibility = 'visible';
    document.getElementById('authorize_button').innerText = 'Refresh';
    // await listMajors();
    await createSheet();
  };

  if (gapi.client.getToken() === null) {
    // Prompt the user to select a Google Account and ask for consent to share their data
    // when establishing a new session.
    tokenClient.requestAccessToken({prompt: 'consent'});
  } else {
    // Skip display of account chooser and consent dialog for an existing session.
    tokenClient.requestAccessToken({prompt: ''});
  }
};

/**
 *  Sign out the user upon button click.
 */
// eslint-disable-next-line no-unused-vars
function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken('');
    document.getElementById('content').innerText = '';
    document.getElementById('authorize_button').innerText = 'Authorize';
    document.getElementById('signout_button').style.visibility = 'hidden';
  }
};

/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
// async function listMajors() {
//   let response;
//   try {
//     // Fetch first 10 files
//     response = await gapi.client.sheets.spreadsheets.values.get({
//       spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
//       range: 'Class Data!A2:E',
//     });
//   } catch (err) {
//     document.getElementById('content').innerText = err.message;
//     return;
//   }
//   const range = response.result;
//   if (!range || !range.values || range.values.length == 0) {
//     document.getElementById('content').innerText = 'No values found.';
//     return;
//   }
//   // Flatten to string to display
//   const output = range.values.reduce(
//     (str, row) => `${str}${row[0]}, ${row[4]}\n`,
//     'Name, Major:\n');
//   document.getElementById('content').innerText = output;
// }


// spreadsheetId: 1UVnmXKJDXBcOY-QMiko1wMS9kFk9jsUitNlBVtR6KLg
// function makeApiCall() {
//      var params = {
//        // The spreadsheet to request.
//        spreadsheetId: 'my-spreadsheet-id',  // TODO: Update placeholder value.

//        // The ranges to retrieve from the spreadsheet.
//        ranges: [],  // TODO: Update placeholder value.

//        // True if grid data should be returned.
//        // This parameter is ignored if a field mask was set in the request.
//        includeGridData: false,  // TODO: Update placeholder value.
//      };

//      var request = gapi.client.sheets.spreadsheets.get(params);
//      request.then(function(response) {
//        // TODO: Change code below to process the `response` object:
//        console.log(response.result);
//      }, function(reason) {
//        console.error('error: ' + reason.result.error.message);
//      });
//    }

async function createSheet() {
  const title = 'Author analytics';
  gapi.client.sheets.spreadsheets.create({
    properties: {
      title: title,
    },
  }).then((response) => {
    console.log('Created sheet. Response: ', response);
    document.getElementById('content').innerHTML =
      `<a href="${response.result.spreadsheetUrl}">${response.result.properties.title}</a>`;
    writeDataToSheet(response.result.spreadsheetId);
  }).catch((error) => {
    console.error('Error creating sheet: ', error);
  });
}

function writeDataToSheet(spreadsheetId) {
  const values = [[1, 2, 3]];
  const range = 'Sheet1'; // https://developers.google.com/sheets/api/guides/concepts#cell
  const body = {
    values: values,
  };
  gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId,
    range: range,
    // https://developers.google.com/sheets/api/reference/rest/v4/ValueInputOption
    valueInputOption: 'USER_ENTERED',
    resource: body,
  }).then((response) => {
    const result = response.result;
    console.log(`${result.updatedCells} cells updated.`);
  }).catch((error) => {
    console.error('Error writing data to sheet: ', error.result.error.message);
  });
}
