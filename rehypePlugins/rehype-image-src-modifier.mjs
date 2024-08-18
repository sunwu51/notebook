import { visit } from 'unist-util-visit';
import fetch from 'node-fetch';
import fs from 'fs'
import path from 'path';


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
                    node.properties.src = src.replace('./img', `https://raw.githubusercontent.com/sunwu51/notebook/master/${month}/img`);
                }
                else if (src.startsWith('img')) {
                    node.properties.src = src.replace('img', `https://raw.githubusercontent.com/sunwu51/notebook/master/${month}/img`);
                }
                // 如果本地启动无法翻墙，本地build请注释掉下面imgur这段代码
                else if (process.env.NODE_ENV === 'production' && src.startsWith('https://i.imgur.com/')) {
                    // let picName = src.replace('https://i.imgur.com/', '/api/imgur?filename=');
                    let picName = src.replace('https://i.imgur.com/', 'https://raw.githubusercontent.com/sunwu51/notebook/gh-pages/');
                    node.properties.src = picName;
                }
            }
        });
    };
}

export default rehypeImageSrcModifier;
