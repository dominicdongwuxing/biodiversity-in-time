const mongoose = require("mongoose")
const { Schema } = mongoose

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

const FossilPointSchema = new Schema({
    id: {type: String, required: true, index: true},
    uniqueName: {type: String, required: true, index: true},
    pathFromRoot: {type: String,required: true, index: true},
    maxma: {type: Number,required: true},
    minma: {type: Number,required: true}
})

const FossilLocationSchema = new Schema({
    id: {type: String, required: true, index: true},
    mya: {type: Number, required: true, index: true},
    coordinate: {type: [Number], required: true},
})

const TreeNode = mongoose.model("TreeNode", TreeNodeSchema)
TreeNode.collection.createIndex({pathFromRoot: 1, parent: 1, uniqueName: 1})

const FossilPoint = mongoose.model("FossilPoint", FossilPointSchema)
FossilPoint.collection.createIndex({id: 1, uniqueName: 1})

const FossilLocation = mongoose.model("FossilLocation", FossilLocationSchema)
FossilLocation.collection.createIndex({id: 1, mya: 1})

module.exports = {
    TreeNode,
    FossilLocation,
    FossilPoint 
}