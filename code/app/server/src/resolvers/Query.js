const { Fossil } = require("../models")

const info = () => "This is the info test!"
const getFossilsByMya = async (parent, args, context, info) => {
    const result = await Fossil.find({ maxma: { $gt: args.mya }, minma: { $lte: args.mya }})
    return result
}
const getTree = (parent, args) => {
    return trees.find(tree => tree.name == args.name)
}

module.exports = {
    info,
    getFossilsByMya,
    getTree,
}

const trees = [
    {
        "name": "Nola",
        "rank": "",
        "id": "Q72288",
        "children": [
            {
                "name": "Nola lobmayeri",
                "rank": "Q7432",
                "id": "Q21348305"
            }
        ]
    },
    {
        "name": "incertae sedis",
        "rank": "",
        "id": "Q235536",
        "children": [
            {
                "name": "Staphylotrichum longicolle",
                "rank": "Q7432",
                "id": "Q104838369"
            },
            {
                "name": "Plenodomus biglobosus",
                "rank": "Q7432",
                "id": "Q104946056"
            },
            {
                "name": "Dactylaria candida",
                "rank": "Q7432",
                "id": "Q105032367"
            },
            {
                "name": "Plenodomus lindquistii",
                "rank": "Q7432",
                "id": "Q104989334"
            },
            {
                "name": "Fuscopostia leucomallella",
                "rank": "Q7432",
                "id": "Q104945115"
            },
            {
                "name": "Starmerella magnoliae",
                "rank": "Q7432",
                "id": "Q104962312"
            }
        ]
    },
    {
        "name": "Ichnofossils",
        "rank": "",
        "id": "Q23012932",
        "children": [
            {
                "name": "Trichophycus",
                "rank": "Q34740",
                "id": "Q19844907",
                "children": [
                    {
                        "name": "Trichophycus pedum",
                        "rank": "Q7432",
                        "id": "Q841634"
                    }
                ]
            },
            {
                "name": "Heimdallia",
                "rank": "Q34740",
                "id": "Q5699591"
            },
            {
                "name": "Neosauroides",
                "rank": "Q34740",
                "id": "Q26856809",
                "children": [
                    {
                        "name": "Neosauroides koreaensis",
                        "rank": "Q7432",
                        "id": "Q51607598"
                    }
                ]
            },
            {
                "name": "Paleodictyon",
                "rank": "Q34740",
                "id": "Q7127150",
                "children": [
                    {
                        "name": "Paleodictyon nodosum",
                        "rank": "Q7432",
                        "id": "Q7127151"
                    }
                ]
            },
            {
                "name": "Ambergrisichnus",
                "rank": "Q34740",
                "id": "Q105084908"
            },
            {
                "name": "Asteriatites",
                "rank": "Q34740",
                "id": "Q4810660",
                "children": [
                    {
                        "name": "Asteriacites lumbricalis",
                        "rank": "Q7432",
                        "id": "Q23013191"
                    }
                ]
            },
            {
                "name": "Gnathichnus",
                "rank": "Q34740",
                "id": "Q5574126",
                "children": [
                    {
                        "name": "Gnathichnus pentax",
                        "rank": "Q7432",
                        "id": "Q105406441"
                    }
                ]
            },
            {
                "name": "Isopodichnus",
                "rank": "Q34740",
                "id": "Q6086224"
            },
            {
                "name": "Dimorphichnus",
                "rank": "Q34740",
                "id": "Q36453484"
            },
            {
                "name": "Cruziana",
                "rank": "Q34740",
                "id": "Q5190350"
            },
            {
                "name": "Monomorphichnus",
                "rank": "Q34740",
                "id": "Q16917332"
            },
            {
                "name": "Protichnites",
                "rank": "Q34740",
                "id": "Q7251819"
            }
        ]
    }
]