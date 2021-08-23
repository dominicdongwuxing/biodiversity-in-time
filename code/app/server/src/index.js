const { ApolloServer } = require('apollo-server');
const fs = require("fs")
const path = require("path")
const Query = require("./resolvers/Query")
const mongoose = require("mongoose")
const resolvers = {
  Query,
}

const { Fossil, Wiki, User } = require("./models")
const server = new ApolloServer({
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'schema.graphql'),
    'utf8'
  ),
  resolvers,
})



//const url = "mongodb+srv://Wuxing_Dong:1A2b3c4d@biodiversityintimeclust.3vppp.mongodb.net/biodiversity?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true";
const url = "mongodb://localhost:27017/biodiversity"
mongoose
    .connect(url,{useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(async () => {
      console.log("MongoDB connected successfully")

      //Fossil.collection.drop();
      //Wiki.collection.drop();
      //User.collection.drop();

      // allRecords = await Fossil.find()
      // console.log("There are " + allRecords.length + " records.")

      // console.log("A random fossil is: " + await Fossil.findOne())
      // console.log("A random wiki is: " + await Wiki.findOne())
      //console.log("A random user is: " + await User.findOne())



      const mya = 100

      // get all data needed
      const fossilRecords = await Fossil.find({ maxma: { $gt: mya }, minma: { $lte: mya }})
      const fossilWikiIds = [...new Set(fossilRecords.map(fossil => fossil.wikiRef))]
      const fossilWikiRecords = await Wiki.find({ id: {$in: fossilWikiIds} }, "pathFromRootByName")
      //const pathsById = fossilWikiRecords.map(record => record.pathFromRootById)
      const pathsByName = fossilWikiRecords.map(record => record.pathFromRootByName)
      // const ancestralWikiIds = [...new Set (pathsById.map(path => {
      //   const splits = path.split(",")
      //   return splits.slice(1,splits.length-1)
      // }).reduce((a,b) => a.concat(b)))]
      // const ancestralWikiRecords = await Wiki.find({ id: {$in: ancestralWikiIds}})
      // const allWikiRecords = [...new Set(fossilWikiRecords.concat(ancestralWikiRecords))]

      //console.log("Number of fossil records: " + fossilRecords.length)
      //console.log(mya + " mya")
      //console.log("Number of wiki entries: " + [...new Set(allWikiRecords.map(a=>a.id))].length)
      //console.log("Number of wiki names: " + [...new Set(allWikiRecords.map(a=>a.name))].length)



      // build nested tree from allWikiRecords and paths
      const arrangeIntoTree = (inputPaths) => {
          // Adapted from https://gist.github.com/stephanbogner/4b590f992ead470658a5ebf09167b03d#file-index-js-L77
          const findWhere = (array, key, value) => {
            t = 0; // t is used as a counter
            while (t < array.length && array[t][key] !== value) { t++; }; // find the index where the id is the as the aValue
    
            if (t < array.length) {
                return array[t]
            } else {
                return false;
            }
          }
          
          const paths = inputPaths.map(path => path.split(",").slice(1))
          let tree = [];
      
          for (let i = 0; i < paths.length; i++) {
              const path = paths[i];
              let currentLevel = tree;
              for (let j = 0; j < path.length; j++) {
                  const part = path[j];
                  const existingPath = findWhere(currentLevel, 'name', part);
      
                  if (existingPath) {
                      currentLevel = existingPath.children;
                  } else {
                      const newPart = {
                          name: part,
                          //children: j == path.length-1 ? null : [],
                          children: []
                      }
      
                      currentLevel.push(newPart);
                      currentLevel = newPart.children;
                  }
              }
          }
          return tree;
      } 
        
      const tree = arrangeIntoTree(pathsByName)[0]
      //console.log(tree.children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0])


      // const testTime = async (mya) => {
        
      //   await buildTreeAtMya(mya)
      //   console.timeEnd("buildTreeAtMya")
      // }

      // testTime(mya)



      

      

      // server
      //     .listen()
      //     .then(({ url }) =>
      //       console.log(`Server is running on ${url}`)
      //     );

    })


process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose disconnected on app termination');
    process.exit(0);
  });
});

