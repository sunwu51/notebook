import { visit } from 'unist-util-visit';
import { h } from 'hastscript';
import crypto from "crypto";

export default function rehypeCodeCopyButton() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'pre') {
        const codeElement = node.children.find(child => child.tagName === 'code');
        if (codeElement) {
          const btnid = crypto.randomUUID();
          const button = h('button', {
            type: 'button',
            className: 'copy-code-button',
            id: btnid,
            'data-copy-code-button': true
          }, 'Copy');
          node.properties.className = [...node.properties.className ?? [], 'pre-with-code'];
          node.children.push(button);
          const scriptContent = `
            document.getElementById("${btnid}").addEventListener('click', (e) => {
              var btn = e.target;
              var codeBlock = btn.closest('pre').querySelector('code').innerText;
              navigator.clipboard.writeText(codeBlock).then(() => {
                btn.innerText = 'Copied!';
                setTimeout(() => { btn.innerText = 'Copy'; }, 2000);
              }).catch(err => {
                console.error('Failed to copy code:', err);
              });
            });`;
          const src = "data:application/javascript;base64," + Buffer.from(scriptContent).toString('base64');
          const script = h('script', { src: src });
          node.children.push(script);
        }
      }
    });
  }
}
