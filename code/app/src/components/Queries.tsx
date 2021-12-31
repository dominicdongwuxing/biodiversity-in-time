import { gql } from "@apollo/client";

const FOSSILPOINT_QUERY = gql`
  query retrieveFossilPoints($minma: Float, $maxma: Float) {
    getFossilsDuringMya(mya: $mya) {
      wikiRef
      lat
      lng
    }
  }
`;

const FOSSILLOCATION_QUERY = gql`
  query retrieveFossilPoints($flatTree: [FlatTreeElementForSearch], $minma: Float, $maxma: Float, $mya: Int) {
    getFossilLocationFromTreeWithMya (flatTree: $flatTree, minma: $minma, maxma: $maxma, mya: $mya) {
      id
      coordinate
      uniqueName
    }
  }
`;

const TREE_QUERY = gql`
  query retrieveFlatTree(
    $uniqueName: String
    $maxElement: Int
    $depth: Int
    $minma: Float
    $maxma: Float
  ) {
    getFlatTreeByUniqueNameWithMya(
      uniqueName: $uniqueName
      maxElement: $maxElement
      depth: $depth
      minma: $minma
      maxma: $maxma
    ) {
      pathFromRoot
      treeNodes {
        uniqueName
        parent
        fossilCountIdentifiedToName
        count
        leaf
        pathFromRoot
        fossils
      }
    }
  }
`;


export {FOSSILPOINT_QUERY, FOSSILLOCATION_QUERY,TREE_QUERY }

// query retrieveTreeFromWikiNameOrIdWithMya(
//   $name: String
//   $maxElement: Int
//   $depth: Int
//   $id: String
//   $minma: Float
//   $maxma: Float
// ) {
//   getTreeFromWikiNameOrIdWithMya(
//     name: $name
//     maxElement: $maxElement
//     depth: $depth
//     id: $id
//     minma: $minma
//     maxma: $maxma
//   ) {
//     name
//     id
//     rank
//     count
//     pathFromRootByName
//     pathFromRootById
//     children {
//       name
//       id
//       rank
//       count
//       children {
//         name
//         id
//         rank
//         count
//         children {
//           name
//           id
//           rank
//           count
//           children {
//             name
//             id
//             rank
//             count
//             children {
//               name
//               id
//               rank
//               count
//               children {
//                 name
//                 id
//                 rank
//                 count
//               }
//             }
//           }
//         }
//       }
//     }
//   }
// }