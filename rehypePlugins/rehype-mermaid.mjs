import { visit } from 'unist-util-visit';
import { toString } from 'hast-util-to-string';


async function convert(src) {
    let start = new Date().getTime()
    const resp = await fetch(`https://mermaid-iframe-production.up.railway.app/convert`, {
      method: 'POST', headers: { 'Content-Type': 'application/json'}, body: JSON.stringify({diagrams: [src]})
    });
    const {results} = await resp.json();
    console.log('results: ' + results)
    console.log('convert cost: ' + (new Date().getTime() - start))
    return results[0]
}

export default function rehypeMermaid() {
  return async (tree) => {
    const nodesToProcess = [];

    visit(tree, 'element', (node) => {
      if (
        node.tagName === 'code' &&
        node.properties?.className?.includes('language-mermaid')
      ) {
        nodesToProcess.push(node);
      }
    });

    for (const node of nodesToProcess) {
      const codeNode = node;
      const mermaidCode = toString(codeNode);
      const svgResult = await convert(mermaidCode)
      const svgContent = svgResult.value.svg
      const svgComponentNode = {
        type: 'element',
        tagName: 'WrapperComponent',
        properties: {
          svgString: svgContent,
        },
        children: []
      };
      
      // 替换原来的 code 节点
      Object.assign(node, svgComponentNode);
    }
  };
}