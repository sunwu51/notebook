# chrome插件开发

# 写在前面
首先声明的是chrome插件可以本地开发，并将代码加载到自己的浏览器，但是如果要发布到插件市场，则需要额外的开发者注册等流程。
# 基础知识
chrome插件能做的事情很多，比如：
- 1 作为一个右上角的小图标，他能监听对于该图标的鼠标事件，也可以自己产生样式变化，这个图标叫action。
- 2 右上角图标点击后，可以弹出一个小的页面，常用于进行一些设置上的调整，这个页面叫popup。
- 3 向特定的页面注入自己写好的js脚本或者css样式（这个是常见的脚本和样式注入）。
- 4 作为后台的脚本一直运行，用到service worker技术。

chrome插件作为后台脚本运行时，能访问chrome的API，例如书签，下载等等。
# 开发常见的注入脚本插件（功能3）content_scripts
这部分chrome官网有详细的demo，[预计文章阅读时间的插件](https://developer.chrome.com/docs/extensions/mv3/getstarted/tut-reading-time/#overview)。

在这个例子中我们首先创建一个空文件夹，并添加一个重要的`manifest.json`文件，如下。
```json
{
  "manifest_version": 3,
  "name": "Reading time",
  "version": "1.0",
  "description": "Add the reading time to Chrome Extension documentation articles",
  "icons": {
    "16": "images/icon-16.png",
    "32": "images/icon-32.png",
    "48": "images/icon-48.png",
    "128": "images/icon-128.png"
  },
  "content_scripts": [
    {
      "js": ["scripts/content.js"],
      "matches": [
        "https://developer.chrome.com/docs/extensions/*",
        "https://developer.chrome.com/docs/webstore/*"
      ]
    }
  ]
}
```
我们分别介绍下每一行配置内容，前三行是必填项，声明manifest版本、插件名、插件版本。description则是一个插件描述，非必需。

`icons`部分是指定了当前插件的一个图标，是正方形，这里提供了4张，会在不同场景下分别用不同的图标，也可以只提供一张。

`content_scripts`部分是一个数组，代表向页面中注入的js和css，其中`matches`是匹配该pattern的页面才会被注入，js是指注入的脚本，css是指注入的样式文件，当然这个例子中没有css文件。

第二步就是创建这个`content.js`文件，内容如下，基本功能就是在文件上面添加一行预计要阅读几分钟的这么一行字。
```js
const article = document.querySelector("article");

// `document.querySelector` may return null if the selector doesn't match anything.
if (article) {
  const text = article.textContent;
  const wordMatchRegExp = /[^\s]+/g; // Regular expression
  const words = text.matchAll(wordMatchRegExp);
  // matchAll returns an iterator, convert to array to get word count
  const wordCount = [...words].length;
  const readingTime = Math.round(wordCount / 200);
  const badge = document.createElement("p");
  // Use the same styling as the publish information in an article's header
  badge.classList.add("color-secondary-text", "type--caption");
  badge.textContent = `⏱️ ${readingTime} min read`;

  // Support for API reference docs
  const heading = article.querySelector("h1");
  // Support for article docs with date
  const date = article.querySelector("time")?.parentNode;

  (date ?? heading).insertAdjacentElement("afterend", badge);
}
```
这是文件目录结构

![image](https://i.imgur.com/USzvmkq.png)

除了注入js，我们也可以注入css，例如强制改变背景色，注入一个`css:[my.css]`
```css
body {
    background-color: aquamarine!important;
}
```
![image](https://i.imgur.com/tglv9bn.png)

# 图标点击后出现页面（功能2）action
类似这样，点击后出现一个页面，该页面的`html/css/js`需要在manifest配置。

![image](https://i.imgur.com/qzN5nEn.png)


这个图标对应的名字叫action，请记住后面出现action的一些事件，都是对应这个图标，下面配置了默认的悬浮title和默认的点击后展示的页面。
```json
"action": {
    "default_title": "Click Me",
    "default_popup": "popup.html"
},
```
# 后台脚本（功能4）background
这个功能是chrome插件中最强大的功能，他也能操作`action`改变popup实现功能2，也能监听`action`的事件实现功能1，也能够动态的对页面注入脚本实现功能3，总之前面的`content_scripts`和`action`配置你可以都不用配置，通过`background`就能实现相同的功能。

在`manifest.json`中配置如下，除了指定一个后台常驻运行的js，还需要定一个权限范围。
```json
{
    "background": {
        "service_worker": "service_worker.js"
    },
    "permissions": [
        "scripting",
        "activeTab"
    ]
}
```

`service_worker`指定一个常驻的后台运行的脚本，在这个脚本中我们可以操作`chrome`内置的大量api，[文档](https://developer.chrome.com/docs/extensions/reference/)，比较常见的：
- action: 控制图标
- audio: 控制音频设备如麦克风
- bookmarks: 书签栏和书签
- commands: 键盘，快捷键
- contextMenus: 右键弹出的菜单栏
- cookies: cookie
- desktopCapture: 截图
- downloads: 下载
- runtime: 当前service-worker
- scripting: 在特定tab执行特定的js脚本
- system: os相关指标
- tabs: 标签相关的增删改等
- tts: 文字转语音

这里给出几个简单的用法，想了解更多，和更具体的用法还是看上面提到的文档。

在`service_worker.js`中，通过`action`的`setTitle`方法，可以改变悬浮显示的字，`setBadgeText`则是改变一个在图标上的字，很多`ON/OFF`都是显示在这。
```js
// 这是插件加载完成后会运行的hook
chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setTitle({
        title: 'Hi'
    });
    chrome.action.setBadgeText({
        text: "ON"
    })
});
```
![image](https://i.imgur.com/nlgdF24.png)
```js
// action有event监听点击事件，通过该事件，切换显示开关
chrome.action.onClicked.addListener(async (tab) => {
    let text = await chrome.action.getBadgeText({});
    text = text == 'ON' ? 'OFF' : 'ON'
    chrome.action.setBadgeText({ text });
})
```
上面这段代码实现了，开关的切换，有几个点需要注意，一个是get方法是异步的需要用`await`，然后get的参数是`{}`，因为需要是一个`details`类型，不能为空。这个代码其实实现的是全局的开关，入参tab是当前在哪个页面点击的`action`，其实可以对每个页面分别控制各自的action样式，例如分别对每个页面都实现各自的开关，而非全局开关:
```js
chrome.action.onClicked.addListener(async (tab) => {
    let text = await chrome.action.getBadgeText({tabId: tab.id});
    text = text == 'ON' ? 'OFF' : 'ON'
    chrome.action.setBadgeText({ text, tabId: tab.id });
})
```
这也是为啥需要`activeTab`这个权限的原因。
## 注入脚本
我们还申请了`scriping`权限来注入脚本，同样在`service_worker.js`中可以对页面直接注入脚本
```js
// 点击action后，动态注入脚本content.js
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    files: ['content.js']
  });
});
```
content.js
```js
console.log('hello world');
```
再比如我们也可以用`tabs API`，实现页面加载完就注入脚本的操作：
```js
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab)=>{
  console.log(tab)
    if (changeInfo.status === 'complete'){
        await chrome.action.setBadgeBackgroundColor({
            color: "#00FF00",
            tabId
        });
        await chrome.scripting.executeScript({
            target: {
                tabId
            },
            files: ['content.js']
        })
    }
});
```
此外，为了能对各个的tab进行操作我们开启如下权限在manifest.json中。
```json
{
  "host_permissions": [
    "*://*/*"
  ]
}
```