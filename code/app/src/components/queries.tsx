import { gql } from "@apollo/client";

const ID_QUERY = gql`
  query retrieveWikiIdByName ($name: String) {
    getWikiIdByName(name: $name) 
  }
`;

const MAP_AND_FOSSIL_QUERY = gql`
  query retrieveMapAndFossils($maxma: Float, $minma: Float, $wikiRef: String) {
  #   getMapAtMya(mya: $mya) {
  #     mya
  #     type
  #     features {
  #       type
  #       properties {
  #         name
  #       }
  #       geometry {
  #         __typename
  #         ... on MapGeometryMultiPolygon {
  #           coordinatesMultiPolygon: coordinates
  #         }
  #         ... on MapGeometryPolygon {
  #           coordinatesPolygon: coordinates
  #         }
  #       }
  #     }
  #   }

    getFossilsDuringMyaByRoot (wikiRef: $wikiRef, minma: $minma, maxma: $maxma) {
      coordinates
      wikiRef
    }
  }
`;

const FOSSIL_QUERY = gql`
  query retrieveFossilsDuringMya($minma: Float, $maxma: Float) {
    getFossilsDuringMya(mya: $mya) {
      wikiRef
      lat
      lng
    }
  }
`;

const TREE_QUERY = gql`
  query retrieveTreeFromWikiNameOrIdWithMya(
    $name: String
    $maxElement: Int
    $depth: Int
    $id: String
    $minma: Float
    $maxma: Float
  ) {
    getTreeFromWikiNameOrIdWithMya(
      name: $name
      maxElement: $maxElement
      depth: $depth
      id: $id
      minma: $minma
      maxma: $maxma
    ) {
      name
      id
      rank
      count
      pathFromRootByName
      pathFromRootById
      children {
        name
        id
        rank
        count
        children {
          name
          id
          rank
          count
          children {
            name
            id
            rank
            count
            children {
              name
              id
              rank
              count
              children {
                name
                id
                rank
                count
                children {
                  name
                  id
                  rank
                  count
                }
              }
            }
          }
        }
      }
    }
  }
`;


export {ID_QUERY, MAP_AND_FOSSIL_QUERY, FOSSIL_QUERY, TREE_QUERY }