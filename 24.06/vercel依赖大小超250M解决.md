---
title: vercel依赖大小超250M解决
date: 2024-06-09 23:17:00+8
tags:
    - vercel
    - blog
    - next.js
---

# 现象
笔记ci流程挂了

![image](https://i.imgur.com/xw6vza2.png)

特别大的单个文件没有，都是一些碎文件。

![image](https://i.imgur.com/aVLj1cT.png)

主要还是一些图片文件比较大，这些图片有两类
- 1 为了兼容新老博客系统，单独copy到`public/oriimg/`目录下的图片。
- 2 为了避免`imgur`被墙，导致看不到图片，把所有图片拉取到了本地。

# 解决
## 解决本地图片问题
针对第一个情况，删除`public/oriimg/`目录，将原来重定向到`oriimg`路径的代码修改为直接指向`github`.
```diff
- node.properties.src = src.replace('./img', '/oriimg/' + month);
+ node.properties.src = src.replace('./img', `https://raw.githubusercontent.com/sunwu51/notebook/master/${month}/img`);
```

然后`.vercelignore`中，就可以忽略`*.gif`格式的文件，动图格式的文件比较大，只有早期的笔记中才用了`gif`。

## 解决imgur下载图片问题
直接注释掉`imgur`的下载显然就解决了，但是这样图片链接是直连`imgur`，这样会导致国内用户不翻墙看不到图片，另一个解决方案是运行时转发请求。

即我们把`public/imgur`目录删除掉，然后创建`app/api/imgur/route.js`一个api函数，来处理get请求，将所有的`/api/imgur?filename=xx`的请求转发到`https://i.imgur.com/${filename}`，实现代理，这样只要能访问我的域名，就能代理到`imgur`保证图片的可访问性。

```js :route.js
export async function GET(request) {
    // 从请求 URL 中获取参数
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
  
    // 确保文件名存在
    if (!filename) {
      return new Response(JSON.stringify({ error: 'Filename is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  
    // 目标服务器的 URL
    const targetUrl = `https://i.imgur.com/${filename}`;

    console.log(targetUrl)
    try {
      // 转发请求到目标服务器
      const response = await fetch(targetUrl, {
        headers :{
            "user-agent": "curl/7.84.0",
            "accept": "*/*"
        },
      });
  
      // 获取目标服务器的响应
      const responseBody = await response.arrayBuffer();
  
      // 返回目标服务器的响应
      return new Response(responseBody, {
        status: response.status,
        headers: {
          // 复制目标服务器的 Content-Type 和其他相关头信息
          'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
          'Content-Length': response.headers.get('Content-Length'),
        },
      });
    } catch (error) {
      // 错误处理
      console.error('Error forwarding request:', error);
      return new Response(JSON.stringify({ error: 'Error forwarding request' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
}
```

接下来修改插件代码，把所有`imgur`域名，改为我们自己的代理地址。
```mjs :rehypePlugins/rehype-image-src-modifier.mjs
if (process.env.NODE_ENV === 'production' && src.startsWith('https://i.imgur.com/')) {
    let picName = src.replace('https://i.imgur.com/', '/api/imgur?filename=');
    node.properties.src = picName;
}
```