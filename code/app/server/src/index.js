const { ApolloServer } = require('apollo-server');
const fs = require("fs")
const path = require("path")
const Query = require("./resolvers/Query")
const mongoose = require("mongoose")
const resolvers = {
  Query,
}

const { Fossil, Wiki } = require("./models")
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
      //Wiki.collection.drop();
      //Fossil.collection.drop();
      //console.log("A random fossil is: " + await Fossil.findOne())
      // console.log("A random wiki is: " + await Wiki.findOne())
      //console.log("A random user is: " + await User.findOne())
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

// Fossil.collection.drop();
      // Wiki.collection.drop();
      // User.collection.drop();

      // allRecords = await Fossil.find()
      // console.log("There are " + allRecords.length + " records.")

      // console.log("A random fossil is: " + await Fossil.findOne())
      // console.log("A random wiki is: " + await Wiki.findOne())
      // console.log("A random user is: " + await User.findOne())