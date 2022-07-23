const csv = require('csvtojson'); // https://www.npmjs.com/package/csvtojson
const glob = require('glob');
const fs = require('fs');

const publications = require('./data/publications.json');

const JSON_FILE_PATH = 'data/analytics-export.json';

let analyticsData = [];
let numFilepathsProcessed = 0;

const HEADERS = ['page', 'pageViews', 'uniqueViews', 'averageTimeOnPage', 'entrances',
  'bounceRate', 'percentExit', 'pageValue'];

// 1. Get paths for all CSV files in the data directory.
// 2. Foe each path, convert CSV to JSON, and add that JSON to the analyticsData array.
// 3. When complete, write analyticsData to a file.
function getConvertWrite() {
  glob('./data/*.csv', {}, (error, filepaths) => {
    if (error) {
      console.error('Error getting paths or CSV files:', error);
    } else {
      const numFilepaths = filepaths.length;
      console.log(`Found ${numFilepaths} CSV files.\n`);
      try {
        for (const filepath of filepaths) {
          csvToJson(filepath).then((jsonArray) => {
            // First five rows (items in array) from Google Analytics export are info and headers.
            analyticsData = analyticsData.concat(jsonArray.slice(5));
            numFilepathsProcessed++;
            if (numFilepathsProcessed === filepaths.length) {
              fs.writeFile(JSON_FILE_PATH, JSON.stringify(analyticsData, null, 2), () => {
                console.log(`\nWrote analytics export data for ${analyticsData.length} items to ${JSON_FILE_PATH}\n`);
              });
              addAnalyticsDataToPublications();
            }
          });
        }
      } catch (error) {
        console.log('Error converting CSV to JSON for filepath', error);
      }
    }
  });
}

async function csvToJson(filepath) {
  try {
    const json = await csv({headers: HEADERS}).fromFile(filepath);
    console.log(`Converted CSV data from ${filepath} to JSON.`);
    return json;
  } catch (error) {
    console.error(`Error parsing CSV from ${filepath}: `, error);
  }
}

// Add analytics data to publications data.
function addAnalyticsDataToPublications() {
  try {
    for (let publication of publications) {
      const analyticsItem = analyticsData.find((item) => item.page === publication.page);
      publication = Object.assign(publication, analyticsItem);
    }
    fs.writeFile('data/publications.json', JSON.stringify(publications, null, 2), () => {
      console.log('Wrote data/publications.json');
    });
  } catch (error) {
    console.log('Error adding analytics data to publication data', error);
  }
}

getConvertWrite();
