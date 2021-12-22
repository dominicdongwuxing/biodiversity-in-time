const { ApolloServer } = require('apollo-server');
const fs = require("fs")
const path = require("path")
const Query = require("./resolvers/Query")
const mongoose = require("mongoose")
const resolvers = {
  Query,
}

 

const { TreeNode, FossilPoint, FossilLocation } = require("./models");
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

      //TreeNode.collection.drop()
      //console.log("A random tree node is: " + await TreeNode.findOne())

      //FossilPoint.collection.drop()
      //console.log("A random fossil point is: " + await FossilPoint.findOne())

      //FossilLocation.collection.drop()
      //console.log("A random fossil location is: " + await FossilLocation.findOne())

      // FossilLocation.collection.getIndexes({full: true}).then(indexes => {
      //   console.log("indexes:", indexes);
      // }).catch(console.error);
      
      //FossilLocation.count({}, (err, count) => console.log(`Number: ${count}`))
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

