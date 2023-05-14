importScripts('test.js');

self.addEventListener('message', e => {
    console.log("来自main的消息", e.data)
    self.postMessage(e.data); // 将接收到的数据直接返回
});