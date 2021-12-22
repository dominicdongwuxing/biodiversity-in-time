import React, {useState} from "react"

type flatTree = {
    leaf: boolean, 
    uniqueName: string,
    pathFromRoot: string
    color: string
} []

interface GlobalState {
    searchId: string;
    setSearchId: (value: string) => void;
    searchName: string;
    setSearchName: (value: string) => void;
    wikiRefRange: string[];
    setWikiRefRange: (value: string[]) => void;
    myaValueMap: number;
    setMyaValueMap: (value: number) => void;
    myaValueTree: number;
    setMyaValueTree: (value: number) => void;
    myaRangeMap: number[];
    setMyaRangeMap: (value: number[]) => void;
    myaRangeTree: number[];
    setMyaRangeTree: (value: number[]) => void;
    searchDepth: number;
    setSearchDepth: (value: number) => void;
    searchMaxElement: number;
    setSearchMaxElement: (value: number) => void;
    flatTree: flatTree;
    setFlatTree: (value: flatTree) => void;
    nodesOnFocus: string[];
    setNodesOnFocus: (value: string[]) => void;
}

const GlobalStateContext = React.createContext<Partial<GlobalState>>({})

function GlobalStateProvider (props) {
    const [searchName, setSearchName] = useState("Mammalia");
    const [wikiRefRange, setWikiRefRange] = useState([])
    const [myaValueMap, setMyaValueMap] = useState(Math.floor(0.0117/2));
    const [myaRangeMap, setMyaRangeMap] = useState([0.0117,0]);
    // const [myaValueTree, setMyaValueTree] = useState(Math.floor(0.0117/2));
    // const [myaRangeTree, setMyaRangeTree] = useState([0.0117,0]);
    const [myaValueTree, setMyaValueTree] = useState(26);
    const [myaRangeTree, setMyaRangeTree] = useState([28.1,23.03]);
    const [searchDepth, setSearchDepth] = useState(2);
    const [searchMaxElement, setSearchMaxElement] = useState(2);
    const [flatTree, setFlatTree] = useState([])
    const [nodesOnFocus, setNodesOnFocus] = useState([])

    return (
        <GlobalStateContext.Provider value={{
            searchName, setSearchName,
            wikiRefRange, setWikiRefRange, 
            myaValueMap, setMyaValueMap,
            myaRangeMap, setMyaRangeMap,
            myaValueTree, setMyaValueTree,
            myaRangeTree, setMyaRangeTree,
            searchDepth, setSearchDepth,
            searchMaxElement, setSearchMaxElement,
            flatTree, setFlatTree,
            nodesOnFocus, setNodesOnFocus
            }}
        >
            {props.children}
        </GlobalStateContext.Provider>
    )
}

const {Consumer} = GlobalStateContext
export {GlobalStateProvider, Consumer as GlobalStateContextConsumer, GlobalStateContext}

