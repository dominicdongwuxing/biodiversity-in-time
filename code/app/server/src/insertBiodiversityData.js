const projectDir = "/home/dongwuxing/Documents/thesis/"
const pbdbDir = projectDir + "dataset/pbdb/"


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
    // insert tree data
    const treeData = JSON.parse(fs.readFileSync(pbdbDir + "tree.json")).map(node => {
      const rename = {
        pathFromRoot: node["path_from_root"],
        name: node["name"],
        parent: node["parent"],
        maxma: node["max_ma"],
        minma: node["min_ma"],
        isLeaf: node["is_leaf"]
      }
      return rename
    })

    try {
      await TreeNode.insertMany(treeData).then(()=>{console.log("All tree nodes inserted")})
    } catch (err) {
      console.error(err)
    } 

    // insert fossil point data
    const fossilPointData = JSON.parse(fs.readFileSync(pbdbDir + "fossils.json")).map(node => {
      const rename = {
        pathFromRoot: node["path_from_root"],
        maxma: node["max_ma"],
        minma: node["min_ma"],
        id: node["occurrence_no"]
      }
      return rename
    })
    // break into size of 200000 for each insertion
    const bulkSize = 200000
    const splits = Math.ceil(fossilPointData.length / bulkSize)
    for (let i = 0; i < splits; i++) {
      const dataSplit = fossilPointData.slice(i*bulkSize, (i+1)*bulkSize)
      try {
        await FossilPoint.insertMany(dataSplit).then(()=>{console.log(`All fossil points inserted ${i+1} out of ${splits}`)})
      } catch (err) {
        console.error(err)
      } 
    }

    // insert fossil location data
    // insert the fossil data by taxon names, since they are split into three main parts
    const taxonNames = ["ArthropodaBrachiopodaChordata","Mollusca","rest"]
    for (let taxonName of taxonNames) {
      // iterate through all years and insert for each year
      for (let year of years) {
        const dataDir = pbdbDir + "geojsonReconstruction/" + taxonName + "/"
        const fileName = `${dataDir}${taxonName}_reconstructed_${year}Ma.json`
        const data = JSON.parse(fs.readFileSync(fileName)).features.map(record => {
            const fieldExtration = {
                id: record.properties.id,
                mya: year,
                coordinate: record.geometry.coordinates
            }
            return fieldExtration
        })
        console.log(`${taxonName} year ${year} has data length: ${data.length}`)
        // break into size of 200000 for each insertion
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
        //console.log(`heap total: ${(mem.heapTotal/1024/1024/1024).toFixed(4)}GB; heap used: ${(mem.heapUsed/1024/1024/1024).toFixed(4)}GB\n\n`)
  
      }
    }
}

  insert().then(() => {
    db.close()
    console.log("MongoDB closed")})
      
})
