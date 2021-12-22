const projectDir = "/home/dongwuxing/Documents/thesis/"
const pbdbDir = projectDir + "dataset/pbdb/"
const taxonName = "rest"
const dataDir = pbdbDir + "geojsonReconstruction/" + taxonName + "/"
const years = require(`${pbdbDir}years.json`)
const mongoose = require("mongoose")
const { FossilLocation, FossilPoint, TreeNode } = require("./models")
const url = "mongodb://localhost:27017/biodiversity"
const fs = require("fs")

const options = {
  useNewUrlParser: true, 
  useUnifiedTopology: true, 
  useCreateIndex: true,
}

mongoose.connect(url, options)
const db = mongoose.connection

// let data = require(pbdbDir + "/fossilDataPartition/rest.json")
// data = data.map(record => {
//   const alteredRecord = {
//     "id": record["occurrence_no"],
//     "maxma": record["max_ma"],
//     "minma": record["min_ma"],
//     "uniqueName": record["uniqueName"],
//     "pathFromRoot": record["pathFromRoot"]
//   }
//   return alteredRecord
// })

// data = data.slice(200000,400000)

// console.log(data.length)

db.once("open", () => {
  console.log("Connection successful")

  
  async function insert() {
    // const treeNodes = require("../../../../dataset/pbdb/tree.json")
    // try {
    //   await TreeNode.insertMany(treeNodes).then(()=>{console.log("All tree nodes inserted")})
    // } catch (err) {
    //   console.error(err)
    // } 

    
    for (let year of years) {
      const fileName = `${dataDir}${taxonName}_reconstructed_${year}Ma.json`
      const data = JSON.parse(fs.readFileSync(fileName)).features.map(record => {
          const alteredRecord = {
              id: record.properties.id,
              mya: year,
              coordinate: record.geometry.coordinates
          }
          return alteredRecord
      })
      console.log(`year ${year} has data length: ${data.length}`)
      const bulkSize = 200000
      const splits = Math.ceil(data.length / bulkSize)
      for (let i = 0; i < splits; i++) {
        const dataSplit = data.slice(i*bulkSize, (i+1)*bulkSize)
        try {
          await FossilLocation.insertMany(dataSplit).then(()=>{console.log(`All fossil location inserted at year ${year} ${i+1} out of ${splits}`)})
        } catch (err) {
          console.error(err)
        } 
      }

      const mem = process.memoryUsage()
      console.log(`heap total: ${(mem.heapTotal/1024/1024/1024).toFixed(4)}GB; heap used: ${(mem.heapUsed/1024/1024/1024).toFixed(4)}GB\n\n`)

    }
}

  insert().then(() => {
    db.close()
    console.log("MongoDB closed")})
      
})
