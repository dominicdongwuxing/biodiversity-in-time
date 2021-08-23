const mongoose = require("mongoose")
const { Schema } = mongoose

const UserSchema = new Schema ({
    name: {
        type: String,
    },
    age: {
        type: Number,
        required: true
    }
}) 

const WikiSchema = new Schema ({
    name: {
        type: String,
        required: true,
    },
    rank: {
        type: String,
    },
    id: {
        type: String,
        required: true,
    },
    pathFromRootById: {
        type: String,
        required: true,
    },
    pathFromRootByName: {
        type: String,
        required: true,
    }
}) 

const FossilSchema = new Schema ({
    id: {
        type: String,
        required: true
    },

    wikiRef: {
        type: String,
        required: true
    },

    name: {
        type: String,
        required: true
    },

    rank: {
        type: String,
        required: true
    },

    minma: {
        type: Number,
        required: true
    },

    maxma: {
        type: Number,
        required: true
    },

    lng: {
        type: Number,
        required: true
    },

    lat: {
        type: Number,
        required: true
    }

})


//FossilSchema.index({ minma: 1, maxma: 1 })
const Fossil = mongoose.model("Fossil", FossilSchema)
Fossil.collection.createIndex({ minma: 1, maxma: 1 })
const Wiki = mongoose.model("Wiki",WikiSchema)
Wiki.collection.createIndex({ id: 1 })
const User = mongoose.model("User",UserSchema)
module.exports = {
    Fossil,
    Wiki,
    User,
}