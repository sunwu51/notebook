# chrome插件2
在上个月的探索中了解了chrome插件开发的基本要素，即需要一个`manifest.json`文件来描述项目的元数据信息，可以指定`content.js`像油猴脚本一样注入到页面中，也可以指定`background.js`通过单个service worker实例始终在后台运行，此外还有action也就是插件小图标的一些事件和功能。但是之前说的比较浅显。

# chrome插件运行的本质
插件本身最简单的情况下就是一段js代码，与正常的页面中的js不同，插件的运行环境和能操作的权限范围是不同的。

**运行环境**：

正常的页面js只在当前页面下运行，与其他页面隔离。插件的运行环境则有三种：
- 1 插件可以自己提供html页面，地址栏是`chrome-extension://<ext-id>/index.html`，在插件html页面中可以自己引入自己目录下的js文件来运行。例如`SwithcyOmega`插件的管理页面就是。
- 2 以`Service Worker`的形式，单例运行，占用一个后台线程，长期运行，所有的功能基本都在这个后台线程的js中运行，与每个页面是隔离的，无法访问dom也无法访问每个页面自己的变量，但是可以通过消息的方式互传数据进行交互。大多数插件都是这个形式。
- 3 注入到页面中运行，这就和页面自己的js一样了，既可以访问dom也可以访问页面自己js中的变量，与油猴运行环境一致。

**权限范围**：

页面自己的js没有绝大多数chrome的api权限，而插件可以在manifest中声明和申请使用chrome的api，有了这些权限脚本就可以实现诸如：访问收藏夹、历史记录、打开新页面、修改右键菜单、动态注入脚本等等功能。

api官方文档：https://developer.chrome.com/docs/extensions/reference

api官方例子：https://github.com/GoogleChrome/chrome-extensions-samples

之前文章中，基本介绍的都是比较通用的js写法（除了action），下面介绍一些`chrome`浏览器自身提供的一些api，注意使用时，需要申请权限。

# 1 windows  tabs  & tabGroups
chrome可以有多个窗口windows，每个窗口里面又可以有多个标签页tabs，多个标签又可以是在一个分组下面的，window有windowId，tab有tabId，tabGroup有groupId来唯一标识。

![image](https://i.imgur.com/NfFML7q.png)

window中的重要属性就是`windowId`。

`chrome.windows`有以下几个常用的方法（不用记，大体有个印象，用到时候再查官方文档即可），这些方法都是Promise返回值，最好在async方法中，用await调用。
```js
// 创建并打开一个新的窗口
chrome.windows.create(createData?: object,callback?: function,)

// 查询某个窗口
chrome.windows.get(windowId: number,queryOptions?: QueryOptions,callback?: function,)

// 查询所有符合条件的窗口
chrome.windows.getAll(queryOptions?: QueryOptions,callback?: function,)

// 获取当前窗口
chrome.windows.getCurrent(queryOptions?: QueryOptions,callback?: function,)

// 关闭窗口
chrome.windows.remove(windowId: number,callback?: function,)

// 更新窗口
chrome.windows.update(windowId: number,updateInfo: object,callback?: function,)
```
窗口也可以被动监听一些事件：
```js
chrome.windows.onBoundsChanged.addListener(callback: function,) // resize
chrome.windows.onCreated.addListener(callback: function,filters?: object,) // create
chrome.windows.onFocusChanged.addListener(callback: function,filters?: object,) // focus change
chrome.windows.onRemoved.addListener(callback: function,filters?: object,) // remove(close)

callback 函数形式如下：
(windowId: number) => void
```

tab中的重要属性: tabId、 windowId、 groupId、url、title、active、index

`chrome.tabs`则是对于标签的api，他的方法比windows多很多，这里列出了一部分，全部的方法请参考文档`https://developer.chrome.com/docs/extensions/reference/tabs/`
```js
// 创建tab，创建属性中，可以包含windowId, url, active等重要的属性， promise返回创建的tab
chrome.tabs.create(createProperties: object,callback?: function,)

// 复制一个tab，也算是一种创建方式
chrome.tabs.duplicate(tabId: number,callback?: function,)

// 查询tab
chrome.tabs.get(tabId: number,callback?: function,)

// 查询window中所有tab
chrome.tabs.getAllInWindow(windowId?: number,callback?: function,)

// 当前tab
chrome.tabs.getCurrent(callback?: function,)

// 前进后退
chrome.tabs.goBack/goForward(tabId?: number,callback?: function,)

// 把指定tabs加入到指定group
chrome.tabs.group(options: object, // {groupId: 1, tabIds: [1232,21312]}
callback?: function,)

// 也是查询与get类似，但是查询条件更灵活
chrome.tabs.query(queryInfo: object,callback?: function,)

// reload
chrome.tabs.reload(tabId?: number,reloadProperties?: object,callback?: function,)

// 关闭标签
chrome.tabs.remove(tabIds: number | number[],callback?: function,)

// 向特定标签的content.js发送数据，这个是交互的时候很重要的函数
chrome.tabs.sendMessage(
  tabId: number,
  message: any,
  options?: object,
  callback?: function,
)

// tabs离开group
chrome.tabs.ungroup(tabIds: number | [number, ...number[]],callback?: function,)

// 更新tab，例如active更新为true
chrome.tabs.update(tabId?: number,updateProperties: object,callback?: function,)
```
events

![image](https://i.imgur.com/zcIFx4f.png)


tabGroups，一个tab如果不属于分组，那么他的groupId是-1，tab加入和离开分组是tabs中的方法操作的，如上，而tabGroups主要提供对分组本身的一些查询和更新等，删除的话是tabs都离开分组了，自动删除的也不是tabGroups的api操作的。

```js
// 获取分组
chrome.tabGroups.get(groupId: number,callback?: function,)

// 更灵活的查询
chrome.tabGroups.query(queryInfo: object,callback?: function,)

// 更新分组的颜色 标题等属性
chrome.tabGroups.update(groupId: number,updateProperties: object,callback?: function,)
```

events

![image](https://i.imgur.com/kRD5IAb.png)


应用：使用上述api来实现
- 有一个input输入文本，按照url和title对chrome所有标签进行模糊搜索，选出最匹配的3条展示在下面；
- 当点击展示的某一条，可以直接切换到该标签。

效果如下，点击右上角插件图标action进入搜索页面，在input中输入可以模糊搜索匹配的tabs，点击tab，可以切换到该页面。

![image](https://i.imgur.com/Lr6SeBm.gif)

具体代码可以参考[./search_tabs](./search_tabs)。

# 2 onmibox
窗口、标签、标签组是组成浏览器最基本的“容器”，而`onmibox`则是每个标签都要有的导航栏，或者准确点叫地址栏。

我们可以通过地址栏，获取用户输入的地址栏的信息，可以下拉弹出提示，例如默认chrome的地址栏就会根据你输入的文本给出一些建议的地址，可能是之前经常访问的地址，也可能是已经打开的一些tab。

![image](https://i.imgur.com/Q96zhGe.png)

onmibox的使用一般是在`manifest.json`中声明关键字来触发当前插件。
```json
{
  "name": "search tabs in omnibox",
  "version": "1.0",
  "omnibox": { "keyword" : "w" },
  "icons": {
    "16": "16-full-color.png"
  },
  "background": {
    "persistent": false,
    "scripts": ["background.js"]
  }
}
```
当输入`w`+空格的时候，就会变成下图样子，插件名字在左边有个竖线隔开，接下来输入的东西都是会给到插件`service_worker.js`内部对omnibox的监听。

![image](https://i.imgur.com/msqrbPi.png)

例如
```js
chrome.omnibox.setDefaultSuggestion({
    description:
      "<match>github</match>.com <url>https://www.github.com</url>"
});

// service_worker.js
chrome.omnibox.onInputChanged.addListener(async function (text, suggest) {
    if (text === "java") {
      suggest({
        content: "java官方文档",
        description: `<url>https://docs.oracle.com/en/java/</url>`,
        deletable: true
      })
    } else if (text === 'js') {
      suggest([
        {
          content: "MDN",
          description: `<url>https://developer.mozilla.org/zh-CN/docs/Web/JavaScript</url>`,
          deletable: true
        },
        {
          content: "js菜鸟教程",
          description: `<url>https://www.runoob.com/js/js-tutorial.html</url>`,
          deletable: true
        },
      ])
    }
});
```
当输入`w `进入插件模式，然后输入`js`会得到下图效果，通过上下键可以切换suggest，地址栏会展示content内容，而下拉部分展示description内容，其中desc部分logo始终为插件的logo，即插件提供的suggest，而desc中有`<url>` `<dim>`和`<match>`分别是颜色url是蓝色，dim是灰色，和粗细上有所区别。

![image](https://i.imgur.com/6zoBqV3.png)

地址栏的api内容很少，唯一的一个方法就是上面看到的`setDefaultSuggestion`，几个event如下：
```js
// 输入change的时候，最常用的
chrome.omnibox.onInputChanged.addListener(callback:(text: string, suggest: function) => void)
// 选择某条suggest的时候，最常用的
chrome.omnibox.onInputEntered.addListener(callback:(text: string, disposition: OnInputEnteredDisposition) => void)
// 开始输入第一个字符的时候，不常用
chrome.omnibox.onInputStarted.addListener(callback: ()=>void)
// 删除建议的时候，不常用
chrome.omnibox.onDeleteSuggestion.addListener(callback: (text: string) => void)
// 更不常用了
chrome.omnibox.onInputCancelled.addListener(callback: function,)
```

应用：上一个应用的功能不错，但是只能在插件提供的页面中运行有些受限，这里有了omnibox的api，可以将其改造成也能在地址栏中运行。

代码参考[./search_tabs_in_omnix](./search_tabs_in_omnix)

![image](https://i.imgur.com/stCVAL3.png)

# 3 bookmarks history
书签和浏览历史记录，这两个就像个人的数据库，存储了一些url信息，这两个的api提供了增删改查的功能，对各种写操作也提供了hook，因为使用并不是很频繁这里不展开介绍，就把官网的截图往这里放一下，当然了使用的时候注意manifest中需要加对应的权限。

bookemarks:

![image](https://i.imgur.com/Ls1mQ1F.png)

history:

![image](https://i.imgur.com/C5fjcYc.png)

应用：有了历史记录和书签，上面的应用也可以进一步改造，原来是搜索已经打开的tab，现在可以加上近三天的历史记录和所有的书签了。

代码自己写吧，在上面代码上稍微改造即可。

# 4 contextMenus commands
`contextMenus`右键的菜单，提供了增删改的接口，即我们可以自定义自己的右键出现的菜单，并且提供了`onClicked` event，用来监听当我们自定义的菜单被点击之后，需要运行什么功能。

`commands`键盘的指令，在manifest中配置`commands`属性，指定键盘组合键和触发的行为名称，service_worker中`onCommand`事件能监听键盘的触发，进而执行相关的js行为。

# 5 scripting
运行脚本，或者叫注入脚本的api，可以访问tab自身的上下文的变量，其作用与油猴基本一致。脚本注入一般要申请的权限`"permissions": ["scripting", "activeTab"]`，如果是多个tab，activeTab需要改为`tabs`。

methods:
```js
// 需要指定一个tab，来注入一个或多个js文件，该方法是tab存在后，对其进行注入
chrome.scripting.executeScript(injection: ScriptInjection,callback?: function,)

// 与前者类似，是注入css
chrome.scripting.insertCSS(injection: CSSInjection,callback?: function,)

// 注册要注入的脚本和匹配的targetUrl，这个是在页面打开前注册，页面打开后自动注入，与前面时机不同
chrome.scripting.registerContentScripts(scripts: RegisteredContentScript[],callback?: function,)

// 不解释
chrome.scripting.getRegisteredContentScripts(filter?: ContentScriptFilter,callback?: function)
chrome.scripting.removeCSS(injection: CSSInjection,callback?: function,)
chrome.scripting.unregisterContentScripts(filter?: ContentScriptFilter,callback?: function,)
chrome.scripting.updateContentScripts(scripts: RegisteredContentScript[],callback?: function,)
```
申请权限，与注入`content1.js`到所有新开的页面，注意这里直接在manifest.json中配置的`content1.js`与调用`registerContentScripts`
```json
...
    "permissions": [
        "tabs",
        "scripting"
    ],
    "host_permissions": [
        "https://*/*",
        "http://*/*"
    ],
    "content_scripts": [
        {
            "js": [
                "content1.js"
            ],
            "matches": [
                "https://*/*",
                "http://*/*"
            ]
        }
    ]
...
```
点击action立即对当前页注入`content2.js`，多次点击会多次注入。
```js
// 点击action立即对当前页注入 content2
chrome.action.onClicked.addListener(async ()=>{
    var tabs = await chrome.tabs.query({active: true, currentWindow: true})
    var currentTab = tabs[0];
    chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        files: ['content2.js'],
    });   
});
```
content1是提前manifest注册的自动注入,content2是点击action时单次注入，content1类似的也可以在service_worker中注入:
```js
chrome.scripting.registerContentScripts( [
    {id:"content3", js: ['./content3.js'], matches: ['https://*/*']}
])
```
只有在service_worker中注册的，才能通过`getRegisteredContentScripts`获取，即content3能get到，content1是get不到的。

# 6 runtime
runtime非常重要，一方面他和service_worker的生命周期密切相关，另一方面runtime api中是和页面或者说`content.js`进行交互的。

场景1，只操作一次的行为，例如contextMenus的注册都是一次性的，右键注册的时候，之前没有在`onInstalled`的时候注册，导致插件总是报错说id已经存在了，无法再次注册。按理说service_worker中的代码只会运行一遍在install的时候，但是有时候更新和卸载的操作会导致清理不干净。
```js
chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: "tld",
    title: "locale",
    type: 'normal',
    contexts: ['selection']
  });
});
```

场景2，service_worker.js和content.js进行消息交互的时候

service_worker发，content收：
```js
// service_worker
chrome.tabs.sendMessage(tabId, message, options, callback)

// content
chrome.runtime.onMessage.addListener()
```

![image](https://i.imgur.com/boSs0tQ.png)

content发，service_worker收
```js
// content，extensionId不写则默认发给自己这个插件
chrome.runtime.sendMessage(
  extensionId?: string,
  message: any,
  options?: object,
  callback?: function,
)

// service_worker
chrome.runtime.onMessage.addListener()
```