const projectDir = "/home/dongwuxing/Documents/thesis/"
const pbdbDir = projectDir + "dataset/pbdb/"
const fossilReconstructionDir = pbdbDir + "reconstructedFossilPoints/"
const timeDataDir = projectDir + "code/app/dist/resources/"
const resultDir = pbdbDir + "reconstructedAggPbdbForDb/"
const allFossilData = require(pbdbDir + "agg_pbdb_for_db.json") 
const timeData = require(timeDataDir + "intervalsNew.json")
const fs = require("fs")

// using the aggregated pbdb data, construct a wikiRef to path lookup
// which is an object with keys as wikiRef and values as corresponding
// pathFromRootById
const wikiRefPathLookup = {}
allFossilData.forEach(entry => {
    wikiRefPathLookup[entry.wikiRef] = entry.pathFromRootById
})

// construct time points the same way as seen in parseFossilData.js
const timePoints = []
timeData.forEach(interval => {
    // only consider more detailed time intervals (those with level >= 3)
    if (interval.level >= 3) {
        // take the middle time point of that interval
        const middleTime = Math.floor((interval.end + interval.start)/2)
        // only push to the result array when the time point is not older than 410 mya and is not already in the array
        if (middleTime <= 410 && !timePoints.includes(middleTime)) {
            timePoints.push(middleTime)
        }
    }
})

// iterate through each time point and construct the json file for database
// each time point has a json file with {mya: time, fossilData: [{wikiRef: Q_code, pathFromRootById: the string, coordinates: [[lng, lat]]}]}
timePoints.forEach(time => {
    const inputPath = fossilReconstructionDir + "fossilsExistingAt" + time + "mya_reconstructed_" + time + "mya.geojson"
    const outputPath = resultDir + time + "mya.json"
    fs.readFile(inputPath, "utf8", (err, data) => {
        if (err) throw err
        data = JSON.parse(data).features
        // extract all wikiRefs in the current time file
        const wikiRefArr = [...new Set(data.map(fossilRecord => fossilRecord.properties.wikiRef))]
        // initialize the result object for this time point
        const result = {"mya": time, fossilData: []}
        wikiRefArr.forEach(wikiRef => {
            // initialize the object for this wikiRef
            const fossilDataUnderWikiRef = {"wikiRef": wikiRef, "pathFromRootById": wikiRefPathLookup[wikiRef], "coordinates":[]}
            // push coordinates only if it has the current wikiRef
            fossilDataUnderWikiRef.coordinates = data.map(record => {
                if (record.properties.wikiRef === wikiRef) {
                    return record.geometry.coordinates
                }
            }).filter(i => i)
            result.fossilData.push(fossilDataUnderWikiRef)
        })
        fs.writeFile(outputPath, JSON.stringify(result, null, 2), err => {if (err) throw err}) 
    })
})



