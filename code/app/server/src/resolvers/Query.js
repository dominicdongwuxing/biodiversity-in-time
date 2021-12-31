const { TreeNode, FossilPoint, FossilLocation } = require("../models")
const {performance} = require("perf_hooks")

const getFlatTreeByUniqueNameWithMya = async (parent, args, context, info) => {
    const start = performance.now()

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

    const getCounts = async (input) => {
        const count = await FossilPoint.countDocuments({
            pathFromRoot: {$regex: `^${input.pathFromRoot}`}, 
            minma: {$lte: args.maxma}, 
            maxma: {$gte: args.minma} })

        const fossilCountIdentifiedToName = await FossilPoint.countDocuments({
            uniqueName: input.uniqueName, 
            minma: {$lte: args.maxma}, 
            maxma: {$gte: args.minma} })
        //if (input.uniqueName === "Mammalia") console.log(`Mammalia, from ${args.maxma} to ${args.minma} fossilUnderName ${fossilCountIdentifiedToName}`)
        
        return {count, fossilCountIdentifiedToName}
    }

    const getChildren = async (inputRoot) => {
        let children = await TreeNode.find({
            parent: inputRoot.uniqueName,
            minma: {$lte: args.maxma}, 
            maxma: {$gte: args.minma}})

        for (let child of children) {
            const {count, fossilCountIdentifiedToName} = await getCounts(child)
            child.count = count
            child.fossilCountIdentifiedToName = fossilCountIdentifiedToName
        }

        children = sortAndTrimChildren(children)

        // append fossil point information to each tree node
        for (let child of children) {
            child.fossil = await FossilPoint.find({
                uniqueName: child.uniqueName, 
                minma: {$lte: args.maxma}, 
                maxma: {$gte: args.minma} })
        }
        return children
    }

    const buildTree = async(currentRoot) => {
        const depth = currentRoot.pathFromRoot.split(",").length - rootDepth
        //console.log("Checking Depth at", depth)
        if (depth <= args.depth) {
            currentRoot.leaf = (currentRoot.children[0].length == 2 || depth == args.depth) ? true : false
            // also add fossil points
            currentRoot.fossils = currentRoot.leaf ? 
                await FossilPoint.find({
                    pathFromRoot: {$regex: `^${currentRoot.pathFromRoot}`}, 
                    minma: {$lte: args.maxma}, 
                    maxma: {$gte: args.minma} }).then(res => res.map(i => i.id)) : 
                
                await FossilPoint.find({
                    uniqueName: currentRoot.uniqueName, 
                    minma: {$lte: args.maxma}, 
                    maxma: {$gte: args.minma} }).then(res => res.map(i => i.id))


            treeNodes.push(currentRoot)
            //const children = await TreeNode.find({parent: currentRoot.uniqueName, minma: {$lte: args.maxma}, maxma: {$gte: args.minma}}).then(sortAndTrimChildren)
            const children = await getChildren(currentRoot)
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
    const {count, fossilCountIdentifiedToName} = await getCounts(root)
    root.count = count
    root.fossilCountIdentifiedToName = fossilCountIdentifiedToName
    console.log(root.count,root.fossilCountIdentifiedToName)
    await buildTree(root)
    const end = performance.now()
    console.log("time in ms: ", end - start)
    //console.log(treeNodes)
    return {pathFromRoot: root.pathFromRoot, treeNodes: treeNodes}
}
const getFossilLocationFromTreeWithMya  = async (parent, args, context, info) => {
    //return []
    console.log(`mya: ${args.mya}, minma: ${args.minma}, maxma: ${args.maxma}, flatTree: ${args.flatTree.map(i => i.uniqueName)}`)
    let idToUniqueName = {}
    const allFossilIds = []
    args.flatTree.forEach(item => {
        item.fossils.forEach(fossilId => {
            idToUniqueName[fossilId] = item.uniqueName
            allFossilIds.push(fossilId)
        })
    })
    let locations = await FossilLocation.find({id: {$in: allFossilIds}, mya: args.mya})
    console.log(`amount of fossils from fossilPoint: ${allFossilIds.length}, amount of fossils from fossilLocation: ${locations.length}`)
    locations = locations.map(i => {
        return {
            id: i.id,
            coordinate: i.coordinate,
            uniqueName: idToUniqueName[i.id]
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
    getFlatTreeByUniqueNameWithMya,
    getFossilLocationFromTreeWithMya
}




const a = [
    {
        leaf: false,
        pathFromRoot: "Eukaryota,Animalia,Chordata,Mammalia,Primates",
        uniqueName: "Primates"  
    },
    {
        leaf: false,
        pathFromRoot: "Eukaryota,Animalia,Chordata,Mammalia,Primates,Cercopithecidae",
        uniqueName: "Cercopithecidae"  
    },
    {
        leaf: true,
        pathFromRoot: "Eukaryota,Animalia,Chordata,Mammalia,Primates,Cercopithecidae,Theropithecus",
        uniqueName: "Theropithecus"  
    },
    {
        leaf: true,
        pathFromRoot: "Eukaryota,Animalia,Chordata,Mammalia,Primates,Cercopithecidae,Macaca",
        uniqueName: "Macaca"  
    },
    {
        leaf: false,
        pathFromRoot: "Eukaryota,Animalia,Chordata,Mammalia,Primates,Hominidae",
        uniqueName: "Hominidae"  
    },
    {
        leaf: true,
        pathFromRoot: "Eukaryota,Animalia,Chordata,Mammalia,Primates,Hominidae,Homo",
        uniqueName: "Homo"  
    },
    {
        leaf: true,
        pathFromRoot: "Eukaryota,Animalia,Chordata,Mammalia,Primates,Hominidae,Paranthropus",
        uniqueName: "Paranthropus"  
    },

]

const b = [
    {
        leaf: false,
        pathFromRoot: "Eukaryota,Animalia,Chordata,Mammalia",
        uniqueName: "Mammalia"  
    },
    {
        leaf: false,
        pathFromRoot: "Eukaryota,Animalia,Chordata,Mammalia,Rodentia",
        uniqueName: "Rodentia"  
    },
    {
        leaf: true,
        pathFromRoot: "Eukaryota,Animalia,Chordata,Mammalia,Rodentia,Cricetidae",
        uniqueName: "Cricetidae"  
    },
    {
        leaf: true,
        pathFromRoot: "Eukaryota,Animalia,Chordata,Mammalia,Rodentia,Muridae",
        uniqueName: "Muridae"  
    },
    {
        leaf: false,
        pathFromRoot: "Eukaryota,Animalia,Chordata,Mammalia,Artiodactyla",
        uniqueName: "Artiodactyla"  
    },
    {
        leaf: true,
        pathFromRoot: "Eukaryota,Animalia,Chordata,Mammalia,Artiodactyla,Bovidae",
        uniqueName: "Bovidae"  
    },
    {
        leaf: true,
        pathFromRoot: "Eukaryota,Animalia,Chordata,Mammalia,Artiodactyla,Cervidae",
        uniqueName: "Cervidae"  
    },
    

]