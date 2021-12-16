import React, {useState} from "react"

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
}

const GlobalStateContext = React.createContext<Partial<GlobalState>>({})

function GlobalStateProvider (props) {
    const [searchName, setSearchName] = useState("Mammalia");
    const [wikiRefRange, setWikiRefRange] = useState([])
    const [myaValueMap, setMyaValueMap] = useState(Math.floor(0.0117/2));
    const [myaRangeMap, setMyaRangeMap] = useState([0.0117,0]);
    const [myaValueTree, setMyaValueTree] = useState(Math.floor(0.0117/2));
    const [myaRangeTree, setMyaRangeTree] = useState([0.0117,0]);
    const [searchDepth, setSearchDepth] = useState(3);
    const [searchMaxElement, setSearchMaxElement] = useState(3);

    return (
        <GlobalStateContext.Provider value={{
            searchName, setSearchName,
            wikiRefRange, setWikiRefRange, 
            myaValueMap, setMyaValueMap,
            myaRangeMap, setMyaRangeMap,
            myaValueTree, setMyaValueTree,
            myaRangeTree, setMyaRangeTree,
            searchDepth, setSearchDepth,
            searchMaxElement, setSearchMaxElement
            }}
        >
            {props.children}
        </GlobalStateContext.Provider>
    )
}

const {Consumer} = GlobalStateContext
export {GlobalStateProvider, Consumer as GlobalStateContextConsumer, GlobalStateContext}

