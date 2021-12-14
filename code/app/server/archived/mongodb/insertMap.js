const mongoose = require("mongoose")
const { Map } = require("./models")
const fs = require("fs")
const url = "mongodb://localhost:27017/biodiversity"

mongoose.connect(url,{useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection

  db.once("open", () => {
    console.log("Connection successful")

    
    async function insert() {

      for (let i = 0; i < 2; i++) {
        let data = fs.readFileSync('../../../../dataset/tectonics/Matthews_etal_GPC_2016_Coastlines/reconstructed_' + i + '.00Ma.geojson')
        data = JSON.parse(data);
        const features = data.features.map((feature) => {
            return {"type": feature.type, "properties": {"name":feature.properties.NAME}, "geometry": feature.geometry}
        })
        data = {"mya": i, "type": data.type, "features": features}

          try {
            await Map.create(data).then(()=>{console.log("Map data inserted, file number " + i)})
          } catch (err) {
            //console.error(err)
            console.log("error occurred")
          }        

        // const mapData = JSON.parse(fs.readFileSync("../../../../dataset/tectonics/Matthews_etal_GPC_2016_Coastlines/" + i + ".geojson"))
        
      }


      // const mapData = JSON.parse(fs.readFileSync("../../../../dataset/tectonics/Matthews_etal_GPC_2016_Coastlines/test.geojson"))
      // //const mapData = {"mya": 1002, "type":"test", "features": [{"type":"test","properties":{"name":"test"},"geometry":{"type":"test","coordinates":[[[2,3],[3,5]]]}},{"type":"test","properties":{"name":"test2"},"geometry":{"type":"test2","coordinates":[[[2,2],[2,5]]]}}]}
      // try {
      //   await Map.create(mapData).then(()=>{console.log("Map data inserted, test")})
      // } catch (err) {
      //   console.error(err)
      // }  

    //   //const mapData = require("../../../../dataset/tectonics/Matthews_etal_GPC_2016_Coastlines/1.geojson")
    //   const mapData = fs.readFileSync("../../../../dataset/tectonics/Matthews_etal_GPC_2016_Coastlines/1.geojson")
    //   //console.log(mapData)
    }

    insert().then(() => {
      db.close()
      console.log("MongoDB closed")})
      
  })
