// filter the reconstruction results from GPlates and save the final result as fossil location dataset in json
taxonName = "rest"//"Mollusca"//"ArthropodaBrachiopodaChordata"
const projectDir = "/home/dongwuxing/Documents/thesis/"
const reconstructedDir = projectDir + "dataset/pbdb/geojsonReconstruction/" + taxonName + "/"
const fs = require("fs")

// years are all the middle value rounded to Int for all time periods that are at or above level 3
let years = []
// grossPeriodsStarts are the ending years of all level 3 time periods with middle value less than 410
let grossPeriodsEnds = []
const intervals = require(projectDir + "code/app/dist/resources/intervalsPhanerozoic.json")
let count = 0
intervals.forEach(interval => {
    if (interval.level >= 3) {
        const middle = Math.round((interval.start + interval.end) / 2)
        if (!years.includes(middle) && middle <= 410) {
            years.push(middle)
        }
        if (interval.level == 3 && middle <= 410) {
            grossPeriodsEnds.push(interval.end)
        }
    }
})

years.sort((a,b) => a-b)
grossPeriodsEnds.sort((a,b) => b-a)

async function filterFossil () {
    for (let year of years) {
        console.log("processing year " + year + "...")
        // find the earliest level 3 end year that this year meets
        const end = grossPeriodsEnds.find(i => i <= year)
        let fileName = taxonName + "_reconstructed_" + year + "Ma.json"
        //const data = require(reconstructedDir + fileName)
        const data = JSON.parse(fs.readFileSync(reconstructedDir + fileName))
        console.log("before filter length: ", data.features.length)
        data.features = data.features.filter(record => record.properties.maxma >= end)
        console.log("after filter length: ",data.features.length)
        await writeFile(reconstructedDir + fileName, year, data)
        //fs.writeFileSync(reconstructedDir + fileName, JSON.stringify(data))
        console.log(year + " done")
    }
}

function writeFile(fullFileName, year, data) {
    return new Promise(resolve => {
        fs.writeFile(fullFileName, JSON.stringify(data), err => {
            console.log(`file at ${year} is written`)
            resolve(err)
        })
    })
}

filterFossil()
