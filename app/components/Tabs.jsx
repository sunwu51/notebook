'use client'
import React, { useState } from "react";
import './Tabs.css'

const useTabs = (initialTab, allTabs) => {
    const [currentIndex, setCurrentIndex] = useState(initialTab);
    return {
        currentIndex,
        currentItem: allTabs[currentIndex],
        changeItem: setCurrentIndex  // (*2)
    };
};
function Item({ title, children }) {
    return <div>{children}</div>
}
function Tabs({ children, ...props }) {
    if (!Array.isArray(children)) {
        children = [children]
    }
    const { currentIndex, currentItem, changeItem } = useTabs(0, children);
    return (
        <div className='tabs-container'>
            <div className={'tabs-button-container ' + props.className} >
                {children.map((item, index) => (
                    <button
                        className={(index == currentIndex ? 'tabs-button-selected ' : "tabs-button ") + props.tabBtnClassName??""}
                        key={index} onClick={() => changeItem(index)}>
                        {item.props.title}
                    </button>
                ))}
            </div>
            {children.map((item, index) => (
                <div className={(index == currentIndex ? 'tabs-panel-selected ' : "tabs-panel ") + props.tabPanelClassName??""} key={index}>
                    {item}
                </div>
            ))}
        </div >
    );
}

export { Tabs, Item }