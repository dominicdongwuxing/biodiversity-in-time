const mongoose = require("mongoose")
const { Schema } = mongoose

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
    },
    pathFromRootByRank: {
        type: String,
        required: true,
    },
    maxma: {
        type: Number,
        required: true,
    },
    minma: {
        type: Number,
        required: true,
    },
    count: {
        type: Number,
        required: true,
    },
    children: {
        type: [String],
        required: true,
    }
}) 

const FossilSchema = new Schema ({
    wikiRef: {
        type: String,
        required: true
    },

    pathFromRootById: {
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

    coordinates: {
        type: [[Number]],
        required: true
    },

})

const MapProptertySchema = new Schema({
    name: {
        type: String
    }
})

const MapGeometrySchema = new Schema({
    type: {
        type: String
    },

    coordinates: Schema.Types.Mixed

})

const MapFeatureSchema = new Schema ({
    type: {
        type: String
    },

    properties: {
        type: MapProptertySchema
    },

    geometry: {
        type: MapGeometrySchema
    }
})

const MapSchema = new Schema ({
    mya: {
        type: Number
    },

    type: {
        type: String
    },

    features: {
        type: [MapFeatureSchema]
    }
})

const TreeNodeSchema = new Schema({
    name: {type: String,required: true, index: true},
    uniqueName: {type: String, required: true, index: true},
    rank: {type: String,required: true},
    pathFromRoot: {type: String,required: true, index: true},
    wikiRef: {type: String},
    parent: {type: String, index: true},
    count: {type: Number,required: true},
    maxma: {type: Number,required: true},
    minma: {type: Number,required: true},
    fossilCountIdentifiedToName: {type: Number, required: true},
    children: {type: [String]}
})

//FossilSchema.index({ minma: 1, maxma: 1 })
const Fossil = mongoose.model("Fossil", FossilSchema)
Fossil.collection.createIndex({ wikiRef: 1, minma: 1, maxma: 1 })
const Wiki = mongoose.model("Wiki",WikiSchema)
Wiki.collection.createIndex({ id: 1, minma: 1, maxma: 1 })

const Map = mongoose.model("Map", MapSchema)


const TreeNode = mongoose.model("TreeNode", TreeNodeSchema)
TreeNode.collection.createIndex({pathFromRoot: 1, parent: 1, uniqueName: 1})
//TreeNodeSchema.index()
module.exports = {
    Fossil,
    Wiki,
    Map,
    TreeNode,
    TreeNodeSchema
}