import { visit } from 'unist-util-visit';

function rehypeImageSrcModifier() {
    return (tree) => {
        var month = '00.00', mnode = null
        let lastNumberedH1 = null;

        visit(tree, 'element', (node) => {
            if (node.tagName === 'h1' && node.properties && typeof node.properties.id === 'string') {
                const id = node.properties.id;
                if (/^\d+$/.test(id)) {
                    lastNumberedH1 = node;
                }
            }
        });

        if (lastNumberedH1) {
            month = lastNumberedH1.children[0].children[0].value;
            visit(tree, 'element', (node, index, parent) => {
                if (node === lastNumberedH1 && parent && typeof index === 'number') {
                    parent.children.splice(index, 1);
                    return [visit.SKIP, index];
                }
            });
        }
        visit(tree, 'element', (node) => {
            if (node.tagName === 'img' && node.properties && node.properties.src) {
                const src = node.properties.src;
                if (src.startsWith('./img')) {
                    node.properties.src = src.replace('./img', '/oriimg/' + month);
                }
                if (src.startsWith('img')) {
                    node.properties.src = src.replace('img', '/oriimg/' + month);
                }
            }
        });
    };
}

export default rehypeImageSrcModifier;
