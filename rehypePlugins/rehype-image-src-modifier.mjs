import { visit } from 'unist-util-visit';
import fetch from 'node-fetch';
import fs from 'fs'
import path from 'path';
import { HttpsProxyAgent } from 'https-proxy-agent';

// const proxyUrl = 'http://localhost:7890';
// const agent = new HttpsProxyAgent(proxyUrl);

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
                else if (src.startsWith('img')) {
                    node.properties.src = src.replace('img', '/oriimg/' + month);
                }

                // 如果本地启动无法翻墙，请注释掉下面imgur这段代码
                else if (src.startsWith('https://i.imgur.com/')) {
                    let picName = src.replace('https://i.imgur.com/', '');
                    fetch(src, {agent: undefined, headers :{
                        "user-agent": "curl/7.84.0",
                        "accept": "*/*"
                    }}).then(response => {
                        if (!response.ok) {
                            throw new Error(`Failed to fetch ${src}: ${JSON.stringify(response)} ${response.status}`);
                        }
                        return response.buffer();
                    })
                    .then(buffer => {
                        if (!fs.existsSync(path.join(process.cwd(), "public", "imgur"))) {
                            fs.mkdirSync(path.join(process.cwd(), "public", "imgur"));
                        }
                        // 将图片数据写入本地文件
                        fs.writeFileSync(path.join(process.cwd(), "public", "imgur", picName), buffer);
                    })
                    node.properties.src = "/imgur/" + picName;
                }
            }
        });
    };
}

export default rehypeImageSrcModifier;
