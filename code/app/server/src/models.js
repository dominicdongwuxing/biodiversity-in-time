const mongoose = require("mongoose")
const { Schema } = mongoose

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

const Fossil = mongoose.model("Fossil", FossilSchema, "wikiLinkedFossils")
module.exports = {
    Fossil
}