const projectDir = "/home/dongwuxing/Documents/thesis/"
const pbdbDir = projectDir + "dataset/pbdb/"
const fs = require("fs")
const treeNodes = fs.readFile(`${pbdbDir}tree.json`, (err, input) => {
    if (err) throw err
    const data = JSON.parse(input)
    console.log(JSON.parse(data[0].children))
})
