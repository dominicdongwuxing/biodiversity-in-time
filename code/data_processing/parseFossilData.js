const projectDir = "/home/dongwuxing/Documents/thesis/"
const pbdbDir = projectDir + "dataset/pbdb/"
const fossilPartitionDir = pbdbDir + "timePartition/"
const timeDataDir = projectDir + "code/app/dist/resources/"
const allFossilData = require(pbdbDir + "agg_pbdb_for_db.json") 
const timeData = require(timeDataDir + "intervalsNew.json")
const fs = require("fs")


// construct timeIntervals from the timetable data. A time interval array is the [start, end] years of a clickable time interval
// (i.e., an interval on or deeper than level 3 in the timeData array) and when the middle time point is no older than
// 410 million years ago, which is the oldest trackable time for the plate tectonics. 
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

// take the fossil data and flatten them out in a long array and store in geojson
const fossilRecordsArr= []
allFossilData.forEach(wiki => {
    wiki.records.forEach(record => {
        const fossilRecord = {
            "type": "Feature",
            "properties": {
                "wikiRef": wiki.wikiRef,
                "maxma": record.maxma,
                "minma": record.minma,  
                "id": record.id
            },
            "geometry": {
                "type": "Point",
                "coordinates": record.coordinate
            }
        }
        fossilRecordsArr.push(fossilRecord)
    })
})

// split the dataset by time points --- when a fossil exists during a time point (minma <= time point <= maxma)
// it should be partitioned into the time point file.
timeIntervals.forEach (interval => {
    const start = interval[0]
    const end = interval[1]
    const middle = Math.floor((end + start)/2)
    validFossilRecords = fossilRecordsArr.filter(fossilRecord => fossilRecord.properties.minma <= start && fossilRecord.properties.maxma >= end)
    partition = {
        "type": "FeatureCollection",
        "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
        "features": validFossilRecords
    }
    const fileName = fossilPartitionDir + "from" + start + "To" + end + "mean" + middle + ".geojson"
    fs.writeFile(fileName, JSON.stringify(partition, null, 2), err => {if (err) throw err}) 
}) 




