const { Fossil, Wiki } = require("../models")

const info = () => "This is the info test!"
const getFossilsByMya = async (parent, args, context, info) => {
    const result = await Fossil.find({ maxma: { $gt: args.mya }, minma: { $lte: args.mya }})
    return result
}
const getWikisById = async (parent, args, context, info) => {
    const result = await Wiki.find({ id: {$in: args.id} })
    return result
}

const getWikisByName = async (parent, args, context, info) => {
    const result = await Wiki.find({ id: {$in: args.name} })
    return result
}

module.exports = {
    info,
    getFossilsByMya,
    getWikisById,
    getWikisByName,
}

