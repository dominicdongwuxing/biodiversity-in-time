const { TreeNode, FossilPoint, FossilLocation } = require("../models")
const {performance} = require("perf_hooks")

const getTreeWithFossils = async (parent, args, context, info) => {
    const start = performance.now()

    // rank the siblings with number of fossils in each node's subtree and take the top args.maxElement 
    const sortAndTrimChildren = (children) => {
        children = children.filter(i => i.count)
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

    // get the top args.maxElement number of children of a node with fossils attached to the subtree during the time period
    const getChildren = async (inputRoot) => {
        let children = await TreeNode.find({
            parent: inputRoot.pathFromRoot,
            minma: {$lte: args.maxma}, 
            maxma: {$gte: args.minma}})

        for (let child of children) {
            // calculate the relative depth with respect to the result tree's root
            const depth = child.pathFromRoot.split(",").length - rootDepth
            // if the node is already a leaf node, or it reaches the requested depth, then it is a lead node
            // for the current tree to be returned
            child.isLeaf = (child.isLeaf || depth == args.depth) ? true : false
            if (child.isLeaf) {
                // if the node is leaf node for the result tree, then we find fossils under its subtree
                // i.e. the fossils with pathFromRoot that starts from the node's pathFromRoot
                child.fossils = await FossilPoint.find({
                    pathFromRoot: {$regex: `^${child.pathFromRoot}`}, 
                    minma: {$lte: args.maxma}, 
                    maxma: {$gte: args.minma} }).then(res => res.map(i => i.id)) 
                // the count on fossils in its subtree is just the length of fossils 
                child.count = child.fossils.length
            } else {
                // if the node is not leaf node for the result tree, then we find fossils attached to this node
                // i.e. the fossils with pathFromRoot that equals the node's pathFromRoot
                child.fossils = await FossilPoint.find({
                    pathFromRoot: child.pathFromRoot, 
                    minma: {$lte: args.maxma}, 
                    maxma: {$gte: args.minma} }).then(res => res.map(i => i.id))
                // we still need to count the number of fossils belonging to its subtree
                child.count = await FossilPoint.countDocuments({
                    pathFromRoot: {$regex: `^${child.pathFromRoot}`}, 
                    minma: {$lte: args.maxma}, 
                    maxma: {$gte: args.minma} })
            }
        }
        // only take the top children ranked by number of fossils during the time period attachde to its subtree
        children = sortAndTrimChildren(children)

        return children
    }

    const buildTree = async(currentRoot) => {
        // if the node has no fossils (then it's the root node), then get fossils attached to it
        // in the same way as in getChildren
        if (!currentRoot.fossils) {
            currentRoot.fossils = await FossilPoint.find({
            pathFromRoot: currentRoot.pathFromRoot, 
            minma: {$lte: args.maxma}, 
            maxma: {$gte: args.minma} }).then(res => res.map(i => i.id))
        }
        // add this node to the flat tree
        treeNodes.push(currentRoot)
        // calculate the relative depth with respect to the result tree's root
        const depth = currentRoot.pathFromRoot.split(",").length - rootDepth
        // recursively build flat tree by visiting its children
        // if the current relative depth is still less than the requested depth
        if (depth < args.depth) {
            const children = await getChildren(currentRoot)
            for (let child of children) {
                await buildTree (child)
            }
        }
    }
    
    // init the flat tree to be returned
    const treeNodes = []

    let root

    // if the search term includes , then is a pathFromRoot, otherwise it is name
    if (args.searchTerm.includes(",")) {
        root = await TreeNode.find({pathFromRoot: args.searchTerm, minma: {$lte: args.maxma}, maxma: {$gte: args.minma}}).then(res => res[0])
    } else {
        // capitalize the name and trim white spaces at both ends
        const name = args.searchTerm.trim().charAt(0).toUpperCase() + args.searchTerm.trim().slice(1)
    
        // find the root by its name, note that if the name contains "-", then it is one of the repetitive names, then we will get up to 
        // two results, and we keep the one that contains the name after "-" in its pathFromRoot
        if (name.includes("-")) {
            root = await TreeNode.find({name: name.split("-")[0], minma: {$lte: args.maxma}, maxma: {$gte: args.minma}}).then(res => {
                for (let i of res){
                    if (i.pathFromRoot.pathFromRoot.includes(name.split("-")[1])) return i
                }
            })
        } else {
            root = await TreeNode.find({name: name, minma: {$lte: args.maxma}, maxma: {$gte: args.minma}}).then(res => res[0])
        }
    }
    
    
    
    // although the root may have parent in the tree of life, with respect to the result tree, it should have no parent
    root.parent = null
    // compute the depth of root with respect to Eukaryota, the common root
    const rootDepth = root.pathFromRoot.split(",").length
    await buildTree(root)
    const end = performance.now()
    console.log("time in ms: ", end - start)
    return treeNodes
}
const getFossilLocations  = async (parent, args, context, info) => {
    //return []
    //console.log(`mya: ${args.mya}, minma: ${args.minma}, maxma: ${args.maxma}, flatTree: ${args.flatTree.map(i => i.uniqueName)}`)
    // create a id to name look up object
    let idToPath = {}
    // extract all IDs in a list
    const allFossilIds = []
    args.tree.forEach(node => {
        node.fossils.forEach(fossilId => {
            idToPath[fossilId] = node.pathFromRoot
            allFossilIds.push(fossilId)
        })
    })
    let locations = await FossilLocation.find({id: {$in: allFossilIds}, mya: args.mya})
    console.log(`amount of fossils from fossilPoint: ${allFossilIds.length}, amount of fossils from fossilLocation: ${locations.length}`)
    locations = locations.map(i => {
        return {
            id: i.id,
            coordinate: i.coordinate,
            pathFromRoot: idToPath[i.id],
            mya: args.mya
        }
    })
    return locations

//     const nodes = args.flatTree.filter(i => !i.leaf)
//     const leaves = args.flatTree.filter(i => i.leaf)
//     const fossilsAtNodes = await FossilPoint.find({uniqueName: {$in: nodes.map(i => i.uniqueName)}, minma: {$lte: args.maxma}, maxma: {$gte: args.minma}}).then(res => res.map(fossil => {return {id: fossil.id, uniqueName: fossil.uniqueName}}))
//     //console.log(`All nodes have ${fossilsAtNodes.length} fossils`)
//     let fossilsAtLeaves = []
//     for (let leaf of leaves) {
//         const result = await FossilPoint.find({pathFromRoot: {$regex: `^${leaf.pathFromRoot}`}, minma: {$lte: args.maxma}, maxma: {$gte: args.minma}}).then(res => res.map(fossil => {return {id: fossil.id, uniqueName: leaf.uniqueName}}))
//         fossilsAtLeaves = fossilsAtLeaves.concat(result)
//         console.log(`leaf ${leaf.uniqueName} has ${result.length} fossils`)
//     }
//     console.log(`all leaves have ${fossilsAtLeaves.length} fossils`)
//     const allFossils = fossilsAtNodes.concat(fossilsAtLeaves)
//     let idToUniqueName = {}
//     allFossils.forEach(fossil => {
//         idToUniqueName[fossil.id] = fossil.uniqueName
//     })
//     let locations = await FossilLocation.find({id: {$in: allFossils.map(i => i.id)}, mya: args.mya})
//     console.log(`amount of fossils from fossilPoint: ${allFossils.length}, amount of fossils from fossilLocation: ${locations.length}`)
    
//     allPointIds = allFossils.map(i => i.id)
//     allLocationIds = locations.map(i => i.id)
//     // if (allLocationsIds.length < allPointIds.length) {
//     //     for (let i of allPointIds) {
//     //         if (!allLocationIds.includes(i)) console.log(`missing fossil location for ${i}`)
//     //     }
//     // }
//     locations = locations.map(i => {
//         return {
//             id: i.id,
//             coordinate: i.coordinate,
//             uniqueName: idToUniqueName[i.id]
//         }
//     })
 
//     return locations
}


module.exports = {
    getTreeWithFossils,
    getFossilLocations
}




