const taxonName = "rest"
const projectDir = "/home/dongwuxing/Documents/thesis/"
const pbdbDir = projectDir + "dataset/pbdb/"
const fossilPartitionDir = pbdbDir + "geojsonPartition/"
const fossilData = require(pbdbDir + taxonName + ".json") 
const fs = require("fs")


const fossilRecordsArr= []
fossilData.forEach(record => {
    const fossilRecord = {
        "type": "Feature",
        "properties": {
            "id": record.occurrence_no,
            "maxma": record.max_ma,
            "minma": record.min_ma,  
            "pathFromRoot": record.pathFromRoot,
            "uniqueName": record.uniqueName
        },
        "geometry": {
            "type": "Point",
            "coordinates": [record.lng, record.lat]
        }
    }
    fossilRecordsArr.push(fossilRecord)

})

partition = {
    "type": "FeatureCollection",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    "features": fossilRecordsArr
}
const fileName = fossilPartitionDir + taxonName + ".geojson"
fs.writeFile(fileName, JSON.stringify(partition, null, 2), err => {if (err) throw err}) 

