'use strict';

// [START main_body]
const {google} = require('googleapis');
const sheets = google.sheets('v4');

const express = require('express');
const opn = require('open');
const path = require('path');
const fs = require('fs');

const keyfile = path.join(__dirname, 'credentials.json');
const keys = JSON.parse(fs.readFileSync(keyfile));
const scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

// Create an oAuth2 client to authorize the API call
const client = new google.auth.OAuth2(
  keys.web.client_id,
  keys.web.client_secret,
  keys.web.redirect_uris[0]);

// Generate the url that will be used for authorization
const authorizeUrl = client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
});

const spreadsheetId = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';

// Open an HTTP server to accept the OAuth callback. In this
// simple example, the only request to our webserver is to
// /oauth2callback?code=<code>
const app = express();
app.get('/oauth2callback', (req, res) => {
  const code = req.query.code;
  client.getToken(code, (err, tokens) => {
    if (err) {
      console.error('Error getting oAuth tokens:');
      throw err;
    }
    client.credentials = tokens;
    res.send('Authentication successful! Please return to the console.');
    server.close();
    writeDataToSheet(client);
  });
});
const server = app.listen(8080, () => {
  // open the browser to the authorize url to start the workflow
  opn(authorizeUrl, {wait: false});
});

function writeDataToSheet() {
  const values = [[1, 2, 3], [4, 5, 6]];
  const range = 'Sheet1'; // https://developers.google.com/sheets/api/guides/concepts#cell
  const body = {
    values: values,
  };
  sheets.spreadsheets.values.update({
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


// /**
//  * Print the names and majors of students in a sample spreadsheet:
//  * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
//  */
// function listMajors(auth) {
//   const sheets = google.sheets('v4');
//   sheets.spreadsheets.values.get(
//     {
//       auth: auth,
//       spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
//       range: 'Class Data!A2:E',
//     },
//     (err, res) => {
//       if (err) {
//         console.error('The API returned an error.');
//         throw err;
//       }
//       const rows = res.data.values;
//       if (rows.length === 0) {
//         console.log('No data found.');
//       } else {
//         console.log('Name, Major:');
//         for (const row of rows) {
//           // Print columns A and E, which correspond to indices 0 and 4.
//           console.log(`${row[0]}, ${row[4]}`);
//         }
//       }
//     }
//   );
// }
// // [END main_body]
