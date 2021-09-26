const { Fossil, Wiki } = require("../models")

const getFossilsAtMya = async (parent, args, context, info) => {
    const result = await Fossil.find({ maxma: { $gt: args.mya }, minma: { $lte: args.mya }})
    return result
}

const getFossilsUptoMya = async (parent, args, context, info) => {
    const result = await Fossil.find({ maxma: { $gt: args.mya }})
    return result
}

const getTreeFromWikiNameOrIdWithMya = async(parent, args, context, info) => {
    // const queryInfo = "Run new query; name: " + args.name + " maxElement: " + args.maxElement + " depth: " + args.depth
    // console.log(queryInfo)
    
    const sortAndTrimChildren = (children) => {
        return children.sort((a,b)=>{
            if (a.count < b.count) {
                return 1
            }
            if (a.count > b.count) {
                return -1
            }
            return 0
        }).slice(0,args.maxElement)
    }
    const buildTree = async(root, tree) => {
        const children = await Wiki.find({id: {$in: root.children}, minma: {$lte: args.maxma}, maxma: {$gte: args.minma}}).then(sortAndTrimChildren)

            for (let child of children) {
                // console.log(child.pathFromRootById.split(","))
                if (child.pathFromRootById.split(",").length - child.pathFromRootById.split(",").indexOf(rootId) <= args.depth) {
                    let subtree = {id: child.id, name: child.name, rank: child.rank, count: child.count, children: []}
                    subtree = await buildTree (child, subtree)
                    tree.children.push(subtree)
                }
                
            }
        return tree
    }

    let root;
    if (args.id !== "") {
        root = await Wiki.find({id: args.id, minma: {$lte: args.maxma}, maxma: {$gte: args.minma}}).then(root => root[0])
    } else {
        const name = args.name.trim().charAt(0).toUpperCase() + args.name.trim().slice(1)
        root = await Wiki.find({name: name, minma: {$lte: args.maxma}, maxma: {$gte: args.minma}}).then(root => root[0])
    }

    const rootId = root.id
    const result = await buildTree(root, {id: root.id, name: root.name, rank: root.rank, count: root.count, children: [], pathFromRootByName: root.pathFromRootByName, pathFromRootById: root.pathFromRootById})
    
    // let children = await Wiki.find({id: {$in: root.children}}).then(sortAndTrimChildren)
    // let tree = {id: root.id, name: root.name, rank: root.rank, count: root.count, children: []}
    // for (let child of children) {
    //     const grandchildren = await Wiki.find({id: {$in: child.children}}).then(sortAndTrimChildren)
    //     let subtree = {id: child.id, name: child.name, rank: child.rank, count: child.count, children: []}
    //     for (let grandchild of grandchildren) {
    //         const greatgrandchildren = await Wiki.find({id: {$in: grandchild.children}}).then(sortAndTrimChildren)
    //         let subsubtree = {id: grandchild.id, name: grandchild.name, rank: grandchild.rank, count: grandchild.count, children: []}
    //         subtree.children.push(subsubtree)
    //     }
    //     tree.children.push(subtree)
    // }
    
    return result
}

module.exports = {
    getFossilsAtMya,
    getFossilsUptoMya,
    getTreeFromWikiNameOrIdWithMya
}

