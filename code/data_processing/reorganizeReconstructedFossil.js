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

// construct time intervals the same way as seen in parseFossilData.js 
const timeIntervals = []
timeData.forEach(interval => {
    // only consider more detailed time intervals (those with level >= 3)
    if (interval.level >= 3) {
        // take the middle time point of that interval
        const middleTime = Math.floor((interval.end + interval.start)/2)
        // only push to the result array when the middle time point is not older than 410 mya 
        if (middleTime <= 410) {
            timeIntervals.push([interval.start, interval.end])
        }
    }
})

// iterate through each time interval and construct the json file for database
// each time point has a json file with {mya: time, fossilData: [{wikiRef: Q_code, pathFromRootById: the string, coordinates: [[lng, lat]]}]}
timeIntervals.forEach(interval => {
    const start = interval[0]
    const end = interval[1]
    const middle = Math.floor((end + start)/2)
    const inputPath = fossilReconstructionDir + "from" + start + "To" + end + "mean" + middle + "_reconstructed_" + middle + ".geojson"
    const outputPath = resultDir + "from" + start + "To" + end + "mean" + middle + "_reconstructed_" + middle + ".json"
    fs.readFile(inputPath, "utf8", (err, data) => {
        if (err) throw err
        data = JSON.parse(data).features
        // extract all wikiRefs in the current time file
        const wikiRefArr = [...new Set(data.map(fossilRecord => fossilRecord.properties.wikiRef))]
        // initialize the result object for this time point
        const result = {"start": start, "end": end, fossilData: []}
        wikiRefArr.forEach(wikiRef => {
            // initialize the object for this wikiRef
            const fossilDataUnderWikiRef = {"wikiRef": wikiRef, "pathFromRootById": wikiRefPathLookup[wikiRef], "records":[]}
            // push coordinates only if it has the current wikiRef
            fossilDataUnderWikiRef.records = data
                .filter(fossilRecord => fossilRecord.properties.wikiRef == wikiRef)
                .map(fossilRecord => {
                    return {"id":fossilRecord.properties.id,"coordinate":fossilRecord.geometry.coordinates}
                })
            result.fossilData.push(fossilDataUnderWikiRef)
        })
        fs.writeFile(outputPath, JSON.stringify(result, null, 2), err => {if (err) throw err}) 
    })
})



