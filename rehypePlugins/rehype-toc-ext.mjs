import { visit } from 'unist-util-visit';

export default function rehypeTocExt() {
  return (tree) => {
    let tocNav = null;
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName === 'nav' && node.properties && node.properties.className && node.properties.className.includes('toc')) {
        tocNav = node;
        parent.children.splice(index, 1); // Remove the nav.toc from its original position
      }
    });
    const { children } = tree;
    const container = {
      type: 'element',
      tagName: 'div',
      properties: { className: ['container-wrapper', 'container'] },
      children: [],
    };
    const contentDiv = {
      type: 'element',
      tagName: 'div',
      properties: { className: ['content-wrapper'] },
      children: [],
    };
    const tocDiv = {
      type: 'element',
      tagName: 'div',
      properties: { className: ['toc-wrapper'] },
      children: [tocNav],
    };
    while (children.length > 0) {
      contentDiv.children.push(children.shift());
    }
    container.children.push(contentDiv);
    container.children.push(tocDiv);
    children.push(container);
  };
}
