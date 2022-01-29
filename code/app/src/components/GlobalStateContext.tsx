import React, {useState} from "react"

type currentTree = {
    isLeaf: boolean, 
    name: string,
    parent: string,
    pathFromRoot: string
    color: string,
    fossils: string[]
} []

interface GlobalState {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    mya: number;
    setMya: (value: number) => void;
    maxma: number;
    setMaxma: (value: number) => void;
    minma: number;
    setMinma: (value: number) => void;
    depth: number;
    setDepth: (value: number) => void;
    maxElement: number;
    setMaxElement: (value: number) => void;
    currentTree: currentTree;
    setCurrentTree: (value: currentTree) => void;
    treeFocusNode: string;
    setTreeFocusNode: (value: string) => void;
    mapFocusNode: string[];
    setMapFocusNode: (value: string[]) => void;
}

const GlobalStateContext = React.createContext<Partial<GlobalState>>({})

function GlobalStateProvider (props) {
    const [searchTerm, setSearchTerm] = useState("Primates")
    const [mya, setMya] = useState(Math.floor(0.0117/2))
    const [maxma, setMaxma] = useState(0.0117)
    const [minma, setMinma] = useState(0)
    const [depth, setDepth] = useState(2)
    const [maxElement, setMaxElement] = useState(2)
    const [currentTree, setCurrentTree] = useState([])
    const [mapFocusNode, setMapFocusNode] = useState([])
    const [treeFocusNode, setTreeFocusNode] = useState("")

    return (
        <GlobalStateContext.Provider value={{
            searchTerm, setSearchTerm,
            mya, setMya,
            maxma, setMaxma,
            minma, setMinma,
            maxElement, setMaxElement,
            depth, setDepth,
            currentTree, setCurrentTree,
            mapFocusNode, setMapFocusNode,
            treeFocusNode, setTreeFocusNode
            }}
        >
            {props.children}
        </GlobalStateContext.Provider>
    )
}

const {Consumer} = GlobalStateContext
export {GlobalStateProvider, Consumer as GlobalStateContextConsumer, GlobalStateContext}

