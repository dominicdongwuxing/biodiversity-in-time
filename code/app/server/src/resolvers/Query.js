const { Fossil, Wiki } = require("../models")

const info = () => "This is the info test!"
const getFossilsAtMya = async (parent, args, context, info) => {
    const result = await Fossil.find({ maxma: { $gt: args.mya }, minma: { $lte: args.mya }})
    return result
}

const getFossilsUptoMya = async (parent, args, context, info) => {
    const result = await Fossil.find({ maxma: { $gt: args.mya }})
    return result
}

const getWikisById = async (parent, args, context, info) => {
    const result = await Wiki.find({ id: {$in: args.ids} })
    return result
}

const getWikisByName = async (parent, args, context, info) => {
    const result = await Wiki.find({ name: {$in: args.names} })
    return result
}

const getAllWikis = async (parent, args, context, info) => {
    const result = await Wiki.find()
    return result
}

const getTreeFromWikisId = async(parent, args, context, info) => {
    const fossilWikiRecords = await Wiki.find({ id: {$in: args.ids} }, "pathFromRootByName")
    const pathsByName = fossilWikiRecords.map(record => record.pathFromRootByName)
    const arrangeIntoTree = (inputPaths) => {
        // Adapted from https://gist.github.com/stephanbogner/4b590f992ead470658a5ebf09167b03d#file-index-js-L77
        const findWhere = (array, key, value) => {
          t = 0; // t is used as a counter
          while (t < array.length && array[t][key] !== value) { t++; }; // find the index where the id is the as the aValue
  
          if (t < array.length) {
              return array[t]
          } else {
              return false;
          }
        }

        const paths = inputPaths.map(path => path.split(",").slice(1))
        let tree = [];
    
        for (let i = 0; i < paths.length; i++) {
            const path = paths[i];
            let currentLevel = tree;
            for (let j = 0; j < path.length; j++) {
                const part = path[j];
                const existingPath = findWhere(currentLevel, 'name', part);
    
                if (existingPath) {
                    currentLevel = existingPath.children;
                } else {
                    const newPart = {
                        name: part,
                        //children: j == path.length-1 ? null : [],
                        children: []
                    }
    
                    currentLevel.push(newPart);
                    currentLevel = newPart.children;
                }
            }
        }
        return tree;
    } 
      
    const tree = arrangeIntoTree(pathsByName)[0]
    return tree
}

module.exports = {
    info,
    getFossilsAtMya,
    getFossilsUptoMya,
    getWikisById,
    getWikisByName,
    getAllWikis,
    getTreeFromWikisId
}

