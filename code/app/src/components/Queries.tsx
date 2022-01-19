import { gql } from "@apollo/client";


const FOSSILLOCATION_QUERY = gql`
  query retrieveLocations($tree: [TreeNodeInput], $mya: Int) {
    getFossilLocations (tree: $tree, mya: $mya) {
      id
      coordinate
      pathFromRoot
      mya
    }
  }
`;

const TREE_QUERY = gql`
  query retrieveTree(
    $name: String
    $maxElement: Int
    $depth: Int
    $minma: Float
    $maxma: Float
  ) {
    getTreeWithFossils(
      name: $name
      maxElement: $maxElement
      depth: $depth
      minma: $minma
      maxma: $maxma
    ) {
      name
      parent
      isLeaf
      pathFromRoot
      fossils
    }
  }
`;


export {FOSSILLOCATION_QUERY,TREE_QUERY }
