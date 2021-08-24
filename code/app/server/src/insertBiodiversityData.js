const mongoose = require("mongoose")
const { Fossil, Wiki, User } = require("./models")
const url = "mongodb://localhost:27017/biodiversity"

mongoose.connect(url,{useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection

  db.once("open", () => {
    console.log("Connection successful")

    
    async function insert() {
      for (let i = 1; i < 11; i++) {
        const fossils = require("../../../../dataset/pbdb/pbdb_for_db/pbdb_for_db_" + i + ".json")
        try {
          await Fossil.insertMany(fossils).then(()=>{console.log("All fossils inserted, file number " + i)})
        } catch (err) {
          console.error(err)
        }        
      }

      for (let i = 1; i < 51; i++) {
        const wikis = require("../../../../dataset/wikidata/processed/flat_tree_for_db/flat_tree_for_db_" + i + ".json")
        try {
          await Wiki.insertMany(wikis).then(()=>{console.log("All wikis inserted, file number " + i)})
        } catch (err) {
          console.error(err)
        } 
      }

  }

    insert().then(() => {
      db.close()
      console.log("MongoDB closed")})
      
  })




// await User.insertMany(users, function(err, docs) {
        //   if (err) {
        //     console.log("Oh shit")
        //     console.error(err)
        //   } else {
        //     console.log("All users inserted " + i)  
        //   }
        // })

// const userChunk = [
//   [{name: "Dom", age: 27}, {name: "Silvia", age: 25}],
//   [{name: "Tom", age: 26}, {name: "Mary", age: 25}],
//   [{name: "Jack", age: 27}, {name: "", age: 25}]
// ]