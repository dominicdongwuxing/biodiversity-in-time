const { ApolloServer } = require('apollo-server');
const fs = require("fs")
const path = require("path")
const Query = require("./resolvers/Query")
const mongoose = require("mongoose")
const resolvers = {
  Query,
  MapGeometryUnion: {
    __resolveType: (obj, context, info) => {
      if (obj.type === "Polygon") {
        return "MapGeometryPolygon"
      } else {
        return "MapGeometryMultiPolygon"
      }
    }
  }
}

 

const { Fossil, Wiki, Map, TreeNode, TreeNodeSchema } = require("./models");
const { info } = require('console');
const server = new ApolloServer({
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'schema.graphql'),
    'utf8'
  ),
  resolvers,
})



//const url = "mongodb+srv://Wuxing_Dong:1A2b3c4d@biodiversityintimeclust.3vppp.mongodb.net/biodiversity?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true";
const url = "mongodb://localhost:27017/biodiversity"
//TreeNodeSchema.index({pathFromRoot: 1, parent: 1, uniqueName: 1})
// TreeNode.on('index', error => {
//     // "_id index cannot be sparse"
//     console.log(error.message);
//   });
mongoose
    .connect(url,{useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(async () => {
      console.log("MongoDB connected successfully")

      //Wiki.collection.drop();
      //Fossil.collection.drop();
      //Map.collection.drop()
      //TreeNode.collection.drop()
      //console.log("A random fossil is: " + await Fossil.findOne())
      // console.log("A random wiki is: " + await Wiki.findOne())
      //console.log("A random user is: " + await User.findOne())
      //onsole.log("A random map is: " + await Map.findOne())
      //console.log("A random tree node is: " + await TreeNode.findOne())
      server
          .listen()
          .then(({ url }) =>
            console.log(`Server is running on ${url}`)
          );

    })


process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose disconnected on app termination');
    process.exit(0);
  });
});

