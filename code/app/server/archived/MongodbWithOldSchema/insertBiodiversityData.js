const mongoose = require("mongoose")
const { Fossil, Wiki, User, TreeNode } = require("./models")
const url = "mongodb://localhost:27017/biodiversity"

mongoose.connect(url,{useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection

  db.once("open", () => {
    console.log("Connection successful")

    
    async function insert() {

      // const wikis = require("../../../../dataset/wikidata/processed/fossil_related_flat_tree_for_db.json")
      //   try {
      //     await Wiki.insertMany(wikis).then(()=>{console.log("All wikis inserted")})
      //   } catch (err) {
      //     console.error(err)
      //   } 
      
      const treeNodes = require("../../../../dataset/pbdb/tree.json")
      try {
        await TreeNode.insertMany(treeNodes).then(()=>{console.log("All tree nodes inserted")})
      } catch (err) {
        console.error(err)
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