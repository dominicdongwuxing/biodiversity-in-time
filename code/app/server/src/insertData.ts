// // this is from MongoDB altas website
// const { MongoClient } = require('mongodb');
// //import  { MongoClient}  from 'mongodb';
// const uri = "mongodb+srv://Wuxing_Dong:1A2b3c4d@biodiversityintimeclust.3vppp.mongodb.net/fossilsAndTrees?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(async(err) => {
//   //const collection = client.db("sample_analytics").collection("devic");
//   const myCollection = client.db("sample_analytics").collection("accounts");
//   // perform actions on the collection object
//   console.log(await myCollection.findOne())
//   client.close();
// });


// this is from MongoDB official docs
const { MongoClient } = require("mongodb");
const fossils = require("../../../../dataset/pbdb/pbdb.json");
console.log("fossil loaded")
// Replace the following with your Atlas connection string                                                                                                                                        
const url = "mongodb+srv://Wuxing_Dong:1A2b3c4d@biodiversityintimeclust.3vppp.mongodb.net/fossilsAndTrees?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true";
const client = new MongoClient(url);
const dbName = "fossilsAndTrees";
async function run() {
    try {
        await client.connect();
        console.log("Connected correctly to server");
        const db = client.db(dbName);
        const col = db.collection("wikiLinkedFossils");
        const p = await col.insert(fossils);
        const myDoc = await col.findOne();
        console.log(myDoc);
    } catch (err) {
        console.log(err.stack);
    }
    finally {
        await client.close();
    }
}
run().catch(console.dir);


