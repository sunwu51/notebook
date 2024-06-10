'use client'

import { useEffect } from "react"

export default function BlogLayout({ children }) {
    useEffect(()=>{
        // 注册复制代码的按钮功能
        const btns = document.querySelectorAll('.copy-code-button')
        const handleClick = (event) => {
            const button = event.target;
            const codeElement = button.closest('pre').querySelector('code');
            if (codeElement) {
              const codeContent = codeElement.textContent;
              // 复制到剪贴板
              navigator.clipboard.writeText(codeContent).then(() => {
                button.innerText = 'Copied!';
                setTimeout(() => { button.innerText = 'Copy'; }, 2000);
              }).catch(err => {
                console.error('Failed to copy code:', err);
              });
            }
          };
      
          btns.forEach(button => {
            button.addEventListener('click', handleClick);
          });
      
          // 清理函数，组件卸载时移除事件监听器
          return () => {
            btns.forEach(button => {
              button.removeEventListener('click', handleClick);
            });
          };
    }, [])
    return <>
        {children}
    </>
}