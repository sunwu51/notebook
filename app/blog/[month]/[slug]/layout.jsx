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
    }, []);

    // toc定位
    useEffect(()=>{
      // 这是所有标题从上到下
      var hs = [];
      document.querySelectorAll('.content-wrapper>h1>a, .content-wrapper>h2>a, .content-wrapper>h3>a, .content-wrapper>h4>a')
        .forEach(n=>hs.push(n));

      // 这是所有的toc标题
      var ts = []
      document.querySelectorAll('.toc-wrapper li>a').forEach(a=>ts.push(a));

      const handle = () => {
        let activeIndex = 0;
        for (var i=0; i<hs.length; i++) {
          let {y} = hs[i].getBoundingClientRect();
          if (y >= 20) {
            break;
          }
          if (y < 20) {
            activeIndex = i;
          }
        }
        let href = hs[activeIndex]? hs[activeIndex].href : null;
        for (var i=0; i<ts.length; i++) {
          if (href == ts[i].href) {
            if (!ts[i].classList.contains('active')) {
              ts[i].classList.add('active');
            }
          } else {
            ts[i].classList.remove('active');
          }
        }
      }
      handle();
      document.addEventListener('scroll', handle)
      return ()=>document.removeEventListener('scroll', handle)
    }, []);

    return <>
        {children}
    </>
}