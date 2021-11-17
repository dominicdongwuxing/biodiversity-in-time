const projectDir = "/home/dongwuxing/Documents/thesis/"
const dataDir = projectDir + "code/app/dist/resources/"
const timeData = require(dataDir + "intervalsNew.json")
const fs = require("fs")

const timePoints = []
timeData.forEach(interval => {
    // only consider more detailed time intervals (those with level >= 3)
    if (interval.level >= 3) {
        // take the middle time point of that interval
        const middleTime = Math.floor((interval.end + interval.start)/2)
        // only push to the result array when the middle time point is not older than 410 mya 
        if (middleTime <= 410 && !timePoints.includes(middleTime)) {
            timePoints.push(middleTime)
        }
    }
})

const plateIDArr = []
timePoints.forEach(timePoint => {
    const inputPath = dataDir + "tectonicData/reconstructed_" + timePoint + ".00Ma.geojson"
    const fileContent = fs.readFileSync(inputPath, "utf8")
    data = JSON.parse(fileContent).features
    const IDs = [...new Set(data.map(shape => shape.properties.PLATEID1))]

    IDs.forEach(id => {
        if (!plateIDArr.includes(id)) {
            plateIDArr.push(id)
        }
    })

})

const fileName = dataDir + "plateID.json"
fs.writeFile(fileName, JSON.stringify(plateIDArr), err => {if (err) throw err}) 


