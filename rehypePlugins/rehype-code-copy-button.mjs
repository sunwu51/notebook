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
        }
      }
    });
  }
}
