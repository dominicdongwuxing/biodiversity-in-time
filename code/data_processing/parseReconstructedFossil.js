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
//console.log(grossPeriodsEnds.find(i => i <= 23.03))
// const years = [0,1,2,3,4,6,9,13,14,15,18,22,26,28,31,36,40,45,52,58,60,61,64,69,78,83,85,88,92,97,106,107,119,123,127,131,136,142,149,154,155,160,165,167,169,172,173,178,187,188,195,200,205,218,219,227,233,240,242,245,249,250,252,253,256,257,263,266,267,271,276,285,286,293,297,301,305,311,319,327,329,339,341,353,366,371,377,385,388,389,391,400,406,409]



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
