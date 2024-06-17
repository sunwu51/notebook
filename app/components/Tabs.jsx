'use client'
import React, { useEffect, useState } from "react";
import './Tabs.css'
import { cn } from "./cn";

function Item({ title, children }) {
    return <div>{children}</div>
}
function Tabs({ children, defaultIndex, fixedIndex, handleChange, ...props }) {
    if (!Array.isArray(children)) {
        children = [children]
    }
    const [currentIndex, setCurrentIndex] = useState(defaultIndex===undefined ? -1 : defaultIndex)

    useEffect(() => {if (fixedIndex !== undefined) setCurrentIndex(fixedIndex)})

    return (
        <div className='tabs-container'>
            <div className={cn('tabs-button-container ',props.className)} >
                {children.map((item, index) => (
                    <button
                        className={(index == currentIndex ? 'tabs-button-selected ' : "tabs-button ") + props.tabBtnClassName??""}
                        key={index} onClick={() => { 
                            console.log('click', index)
                            if (fixedIndex === undefined) {
                                setCurrentIndex(index)
                            } else {
                                handleChange && handleChange(index)
                            }
                        }}>
                        {item.props.title}
                    </button>
                ))}
            </div>
            {children.map((item, index) => (
                <div className={cn((index == currentIndex ? 'tabs-panel-selected ' : "tabs-panel "), props.tabPanelClassName)} key={index}>
                    {item}
                </div>
            ))}
        </div >
    );
}

export { Tabs, Item }