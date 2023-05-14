// install事件，在第一次注册的时候会触发
//  这里在install的时候进行了初始化，是将两个资源添加到了cache中
//  caches是浏览器内置的缓存对象，addALL会立即请求该资源并进行缓存
self.addEventListener('install', function(event) {
    console.log('install事件')
    event.waitUntil(
      caches.open('v1').then(function(cache) {
        return cache.addAll([
          '/23.05/sw/index.html',
          '/23.05/sw/api.json'
        ]);
      })
    );
});

// active事件，在符合scope的页面打开后，就会激活，注意install只有一次，但是激活会有很多个页面激活
//  也可以将一些初始化操作放到active中
self.addEventListener('activate', (event) => {
    console.log('activate事件，一般是新打开了页面', event)
});

// fetch事件，拦截fetch方法，当页面调用fetch方法，就会被拦截
//  这里的逻辑是结合install中的缓存设置，来判断fetch的资源是否命中缓存实现加速，否则才真正调用fetch
self.addEventListener('fetch', async (event) => {
    console.log("拦截fetch", event);
    const res = await caches.match(event.request.url);
    if(res) {
        return res;
    } else {
        return fetch(event.request); 
    }
});

// 接收来自主线程的消息，并往主线程发送消息
self.addEventListener('message', function (e) {
    console.log('主线程传到service worker', e.data);
    e.data.id ++;
    setTimeout(()=>{
        e.source.postMessage(e.data)
    }, 5000)
});