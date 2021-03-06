const { Fossil, Wiki, Map, TreeNode } = require("../models")
const {performance} = require("perf_hooks")

const getFlatTreeByUniqueNameWithMya = async (parent, args, context, info) => {
    const start = performance.now()

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

    const buildTree = async(root) => {
        const depth = root.pathFromRoot.split(",").length - rootDepth
        //console.log("Checking Depth at", depth)
        if (depth <= args.depth) {
            root.leaf = root.children.length == 0 || depth == args.depth ? true : false
            treeNodes.push(root)
            const children = await TreeNode.find({parent: root.uniqueName, minma: {$lte: args.maxma}, maxma: {$gte: args.minma}}).then(sortAndTrimChildren)
            for (let child of children) {
                await buildTree (child)
            }
        }
    }
    
    const treeNodes = []
    let root
    const uniqueName = args.uniqueName.charAt(0).toUpperCase() + args.uniqueName.slice(1)
    root = await TreeNode.find({uniqueName: uniqueName, minma: {$lte: args.maxma}, maxma: {$gte: args.minma}}).then(res => res[0])
    
    // if unique name cannot be found then it is one of the repetitive names and the unique name is the pathFromRoot
    if (!root) {
        // then just take the first one one of the repetitive names as root
        // NEED FIX HERE! 
        root = await TreeNode.find({name: args.uniqueName, minma: {$lte: args.maxma}, maxma: {$gte: args.minma}}).then(res => res[0])
    }
    root.parent = null
    const rootDepth = root.pathFromRoot.split(",").length
    await buildTree(root)
    const end = performance.now()
    console.log("time in ms: ", end - start)
    
    return {pathFromRoot: root.pathFromRoot, treeNodes: treeNodes}
}

const getWikiIdByName = async (parent, args, context, info) => {
    let id
    const name = args.name.trim().charAt(0)+ args.name.trim().slice(1)
    await Wiki.find({name: name}).then(results => id = results[0].id)
    return id
}

const test = async (parent, args, context, info) => {
    const start = performance.now()
    const result = await Fossil.find({wikiRef: "Q7377"})
    console.log(result[0].coordinates.length)
    const end = performance.now()
    console.log(end - start)
    return result
}

const getFossilsDuringMyaByRoot= async (parent, args, context, info) => {
    const start = performance.now()
    const maxElement = 7
    const collectWikiRefsFromRoot = async (root) => {
        const sortAndTrimChildren = (children) => {
            return children.sort((a,b)=>{
                if (a.count < b.count) {
                    return 1
                }
                if (a.count > b.count) {
                    return -1
                }
                return 0
            }).slice(0,maxElement)
        }

        const children = await Wiki.find({id: {$in: root.children}, minma: {$lte: args.maxma}, maxma: {$gte: args.minma}}).then(sortAndTrimChildren)
        for (let child of children) {
            wikiRefs.push(child.id)
            await collectWikiRefsFromRoot(child)
        }
        // console.log(wikiRefs)
    }

    // if wikiRef is a name then convert it to the corresponding id
    let rootId = args.wikiRef

    if (isNaN(rootId.slice(1,2))) {
        const rootName = rootId.trim().charAt(0)+ rootId.trim().slice(1)
        root = await Wiki.find({name: rootName}).then(root => rootId = root[0].id)
    } 


    //let wikiRefs = [rootId]

    //const pathLookUp = await Wiki.find({}, "id pathFromRootById").then(arr => arr.reduce((obj, item) => (obj[item.id] = item.pathFromRootById, obj) ,{}))
    //console.log(pathLookUp)
    //await collectWikiRefsFromRoot(root)
    // console.log(wikiRefs)
    let result = await Fossil.find({minma: {$lte: args.maxma}, maxma: {$gte: args.minma}}).then(result => {
        return result.filter(item => item.pathFromRootById.includes(rootId))
    })

    //result = result.filter(item => pathLookUp[item.wikiRef].includes(rootId))
    const end = performance.now()
    console.log(end - start)
    return result
}

const getMapAtMya = async (parent, args, context, info) => {
    const result = await Map.find({mya: args.mya})
    return result[0]
}

const getTreeFromWikiNameOrIdWithMya = async(parent, args, context, info) => {
    // const queryInfo = "Run new query; name: " + args.name + " maxElement: " + args.maxElement + " depth: " + args.depth
    // console.log(queryInfo)
    const start = performance.now()
    
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
                const currentDepth = child.pathFromRootById.split(",").length - child.pathFromRootById.split(",").indexOf(rootId)
                //console.log("checking depth ", currentDepth)
                if ( currentDepth <= args.depth) {
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
        const name = args.name.trim().charAt(0)+ args.name.trim().slice(1)
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

    const end = performance.now()
    console.log("time in ms: ", end - start)
    
    return result
}

module.exports = {
    getFossilsDuringMyaByRoot,
    getMapAtMya,
    getTreeFromWikiNameOrIdWithMya,
    getWikiIdByName,
    getFlatTreeByUniqueNameWithMya,
    test
}
