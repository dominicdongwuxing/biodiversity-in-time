import React, {useState} from "react"

interface GlobalState {
    searchId: string;
    setSearchId: (value: string) => void;
    searchName: string;
    setSearchName: (value: string) => void;
    wikiRefRange: string[];
    setWikiRefRange: (value: string[]) => void;
    myaMain: number;
    setMyaMain: (value: number) => void;
    myaRange: number[];
    setMyaRange: (value: number[]) => void;
    searchDepth: number;
    setSearchDepth: (value: number) => void;
    searchMaxElement: number;
    setSearchMaxElement: (value: number) => void;
}

const GlobalStateContext = React.createContext<Partial<GlobalState>>({})

function GlobalStateProvider (props) {
    // const [searchName, setSearchName] = useState("Biota");
    // const [searchId, setSearchId] = useState("Q2382443");
    const [searchName, setSearchName] = useState("Mammalia");
    const [searchId, setSearchId] = useState("Q7377");
    const [wikiRefRange, setWikiRefRange] = useState([])
    const [myaMain, setMyaMain] = useState(Math.floor(0.0117/2));
    const [myaRange, setMyaRange] = useState([0.0117,0]);
    const [searchDepth, setSearchDepth] = useState(3);
    const [searchMaxElement, setSearchMaxElement] = useState(7);

    return (
        <GlobalStateContext.Provider value={{
            searchName, setSearchName,
            searchId, setSearchId, 
            wikiRefRange, setWikiRefRange, 
            myaMain, setMyaMain,
            myaRange, setMyaRange,
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

