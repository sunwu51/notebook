'use client'
import AwesomeSlider from 'react-awesome-slider';
import 'react-awesome-slider/dist/styles.css';
import React from 'react';



export default function Slider({children}) {
    const replaceImageDomain = (node) => {
        // 如果是 img 元素，替换 src
        if (React.isValidElement(node) && node.type === 'img') {
          return React.cloneElement(node, {
            src: node.props.src.replace('i.imgur.com', 'sunwu51.github.io/notebook')
          });
        }
        
        // 如果是 React 元素但不是 img，递归处理其子元素
        if (React.isValidElement(node) && node.props.children) {
          return React.cloneElement(node, {
            children: React.Children.map(node.props.children, replaceImageDomain)
          });
        }
        
        // 如果是其他类型的节点，直接返回
        return node;
    };
    const modifiedChildren = process.env.NODE_ENV === 'production' ? React.Children.map(children, replaceImageDomain): children;
    return (
      <div className='slider'>
        <AwesomeSlider>
          {modifiedChildren}
        </AwesomeSlider>
      </div>
    );
}
