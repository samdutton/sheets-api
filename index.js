const express = require('express');
const {google} = require('googleapis');
const app = express();
// app.set('view engine', 'ejs');

const spreadsheetId = '1PUiirLMSiO2fJonbkVcrpzfpMXhH8vVlo5s6MxnL6u4';

// app.post('/', async (req, res) => {
//   const {request, name} = req.body;
// });

const port = 3000;
app.listen(port, ()=>{
  console.log(`server started on ${port}`);
});

async function authorise() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'keys.json',
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });
    const authClientObject = await auth.getClient();
    const googleSheetsInstance = google.sheets({version: 'v4', auth: authClientObject})
    setValue(googleSheetsInstance, auth);
  } catch (error) {
    console.log('>>> Auth error', error);
  }
}

async function setValue(googleSheetsInstance, auth) {
  await googleSheetsInstance.spreadsheets.values.update({
    auth,
    spreadsheetId,
    range: 'Sheet1',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [['Foofoo', 'Barbar'], ['bling', 'blong']],
    },
  });
}

authorise();

