'use client'
import { useEffect, useState } from "react"
import { Tabs, Item } from "./Tabs"

const k = "selectedYearIndex";
function YearsTabs({children}) {
    const [index, setIndex] = useState(0);
    
    useEffect(() => {
        const sesIndex = sessionStorage.getItem(k) ?? 0;
        setIndex(sesIndex);
    },[]);

    return <Tabs fixedIndex={index}
            handleChange={(i) => {
                console.log('handle change', i)
                sessionStorage.setItem(k, i); 
                setIndex(i);} }
            >
        {children}
    </Tabs>

}

export {YearsTabs, Item}