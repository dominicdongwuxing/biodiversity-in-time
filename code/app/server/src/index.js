const { ApolloServer } = require('apollo-server');
const fs = require("fs")
const path = require("path")
const Query = require("./resolvers/Query")
const mongoose = require("mongoose")
const { Fossil } = require("./models")
const resolvers = {
  Query,
}

const server = new ApolloServer({
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'schema.graphql'),
    'utf8'
  ),
  resolvers,
})



const url = "mongodb+srv://Wuxing_Dong:1A2b3c4d@biodiversityintimeclust.3vppp.mongodb.net/fossilsAndTrees?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true";
const dbName = "fossilsAndTrees";

mongoose
    .connect(url,{useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
      console.log("MongoDB connected successfully")
      server
          .listen()
          .then(({ url }) =>
            console.log(`Server is running on ${url}`)
          );
    })



