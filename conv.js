const csv = require('csv-parser')
const fs = require('fs')
const converter = require('json-2-csv')



var files = fs.readdirSync('src');
//console.log(files)

files.map((file, num) => {
    const results = [];
    // if (file=='pe v1 10min 30.csv')
    fs.createReadStream('src/' + file)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            let r = results.sort((a, b) => {
                return new Date(a.Time) - new Date(b.Time); // descending
            })
                .filter(function (entry) {
                    return (entry['Log Tag'] === 'Bought' || entry['Log Tag'] === 'Sold')
                })
                .map((x, i) => {
                    delete x['Segment'];
                    delete x['Log Message'];
                    return x
                });
            // console.log(r);
            converter.json2csv(r, (err, csv) => {
                if (err) {
                    throw err
                }
                // print CSV string
                //console.log(csv)
                // write CSV to a file
                fs.writeFileSync('out/' + file, csv)
                console.log(file, num + 1)
            })
        });
})


// fs.createReadStream('ee.csv')
//    .pipe(csv.parse({delimiter: '\t', columns: true}))
//    .pipe(csv.transform((input) => {
//        delete input['_Col3'];
//        console.log(input);
//        return input;
//    }))
//    .pipe(csv.stringify({header: true}))
//    .pipe(fs.createWriteStream(transformedPath))
//    .on('finish', () => {
//        console.log('finish....');
//    }).on('error', () => {
//        console.log('error.....');
//    });