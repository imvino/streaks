const fs = require('fs');
const csv = require('csv-parser');
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017/';
const dbName = 'algoChart';
const collectionName = 'csv';

async function importCSV() {
    let client;
    try {
        client = await MongoClient.connect(uri);
        console.log('Connected to MongoDB');

        const db = client.db(dbName);
        const coll = db.collection(collectionName);

        const files = fs.readdirSync('nov');
        const promises = [];
        const results = [];
        for (const file of files) {
            if (file.includes('.csv')) {
                try {
                    const data = await parseCSVFile('nov/' + file);
                    const f = {
                        name: file.replace(".csv", ""),
                        expiry: file.includes('X') ? 'next' : 'current',
                        data: data,
                    };
                    results.push(f);
                } catch (error) {
                    console.error(`Error parsing CSV file ${file}:`, error.message);
                }
            }
        }

        const transformedResult = [];

        results.forEach(item => {
            // Extract values from the original item
            let { name, expiry, data } = item;

            // If the name contains 'X' and the expiry is 'next', update the name
            if (name.includes('X') && expiry === 'next') {
                name = name.replace(' X', '');
            }

            // Find or create the entry in the result array
            let resultItem = transformedResult.find(result => result.algo_name === name);

            if (!resultItem) {
                resultItem = {
                    algo_name: name,
                    current: [],
                    next: []
                };
                transformedResult.push(resultItem);
            }

            // Extract values from the data objects and push to the appropriate array
            const transformedData = data.map(obj => [
                obj['Log Tag'],
                obj.Symbol,
                parseFloat(obj['Trigger Price']),
                Date.parse(obj.Time) / 1000
            ]);

            // Assign data based on the expiry value
            if (expiry === 'current') {
                resultItem.current = transformedData;
            } else if (expiry === 'next') {
                resultItem.next = transformedData;
            }
        });

        console.log(transformedResult[0].current);

        promises.push(coll.insertOne({ month: 'nov', data: transformedResult }));

        await Promise.all(promises);
        console.log('Data imported successfully');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
    } finally {
        if (client) {
            await client.close();
            console.log('Disconnected from MongoDB');
        }
    }
}

async function parseCSVFile(filePath) {
    return new Promise((resolve, reject) => {
        const dataset = [];
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => {
              dataset.push(data);
          })
          .on('end', () => {
              resolve(dataset);
          })
          .on('error', (error) => {
              reject(error);
          });
    });
}


importCSV().catch(console.error);
