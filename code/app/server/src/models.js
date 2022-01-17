const mongoose = require("mongoose")
const { Schema } = mongoose

const TreeNodeSchema = new Schema({
    name: {type: String,required: true, index: true},
    pathFromRoot: {type: String,required: true, index: true},
    parent: {type: String, index: true},
    maxma: {type: Number,required: true},
    minma: {type: Number,required: true},
    isLeaf: {type: Boolean, required: true}
})

const FossilPointSchema = new Schema({
    id: {type: String, required: true, index: true},
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
TreeNode.collection.createIndex({pathFromRoot: 1, parent: 1, name: 1})

const FossilPoint = mongoose.model("FossilPoint", FossilPointSchema)
FossilPoint.collection.createIndex({id: 1, uniqueName: 1})

const FossilLocation = mongoose.model("FossilLocation", FossilLocationSchema)
FossilLocation.collection.createIndex({id: 1, mya: 1})

module.exports = {
    TreeNode,
    FossilLocation,
    FossilPoint 
}