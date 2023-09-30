# chrome插件2
在上个月的探索中了解了chrome插件开发的基本要素，即需要一个`manifest.json`文件来描述项目的元数据信息，可以指定`content.js`像油猴脚本一样注入到页面中，也可以指定`background.js`通过单个service worker实例始终在后台运行，此外还有action也就是插件小图标的一些事件和功能。

之前文章中，基本介绍的都是比较通用的js写法（除了action），本文介绍一些`chrome`浏览器自身提供的一些api。

# 1 windows  tabs  & tabGroups
chrome可以有多个窗口windows，每个窗口里面又可以有多个标签页tabs，多个标签又可以是在一个分组下面的，window有windowId，tab有tabId，tabGroup有groupId来唯一标识。

![image](https://i.imgur.com/NfFML7q.png)

window中的重要属性就是`windowId`。

`chrome.windows`有以下几个常用的方法，这些方法都是Promise返回值，最好在async方法中，用await调用。
```js
// 创建并打开一个新的窗口
chrome.windows.create(
  createData?: object,
  callback?: function,
)

// 查询某个窗口
chrome.windows.get(
  windowId: number,
  queryOptions?: QueryOptions,
  callback?: function,
)

// 查询所有符合条件的窗口
chrome.windows.getAll(
  queryOptions?: QueryOptions,
  callback?: function,
)

// 获取当前窗口
chrome.windows.getCurrent(
  queryOptions?: QueryOptions,
  callback?: function,
)

// 关闭窗口
chrome.windows.remove(
  windowId: number,
  callback?: function,
)

// 更新窗口
chrome.windows.update(
  windowId: number,
  updateInfo: object,
  callback?: function,
)
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
chrome.tabs.create(
  createProperties: object,
  callback?: function,
)

// 复制一个tab，也算是一种创建方式
chrome.tabs.duplicate(
  tabId: number,
  callback?: function,
)

// 查询tab
chrome.tabs.get(
  tabId: number,
  callback?: function,
)

// 查询window中所有tab
chrome.tabs.getAllInWindow(
  windowId?: number,
  callback?: function,
)

// 当前tab
chrome.tabs.getCurrent(
  callback?: function,
)

// 前进后退
chrome.tabs.goBack/goForward(
  tabId?: number,
  callback?: function,
)

// 把指定tabs加入到指定group
chrome.tabs.group(
  options: object, // {groupId: 1, tabIds: [1232,21312]}
  callback?: function,
)

// 也是查询与get类似，但是查询条件更灵活
chrome.tabs.query(
  queryInfo: object,
  callback?: function,
)

// reload
chrome.tabs.reload(
  tabId?: number,
  reloadProperties?: object,
  callback?: function,
)

// 关闭标签
chrome.tabs.remove(
  tabIds: number | number[],
  callback?: function,
)

// 向特定标签的content.js发送数据，这个是交互的时候很重要的函数
chrome.tabs.sendMessage(
  tabId: number,
  message: any,
  options?: object,
  callback?: function,
)

// tabs离开group
chrome.tabs.ungroup(
  tabIds: number | [number, ...number[]],
  callback?: function,
)
```
events

![image](https://i.imgur.com/zcIFx4f.png)


tabGroups，一个tab如果不属于分组，那么他的groupId是-1，tab加入和离开分组是tabs中的方法操作的，如上，而tabGroups主要提供对分组本身的一些查询和更新等，删除的话是tabs都离开分组了，自动删除的也不是tabGroups的api操作的。

```js
// 获取分组
chrome.tabGroups.get(
  groupId: number,
  callback?: function,
)

// 更灵活的查询
chrome.tabGroups.query(
  queryInfo: object,
  callback?: function,
)

// 更新分组的颜色 标题等属性
chrome.tabGroups.update(
  groupId: number,
  updateProperties: object,
  callback?: function,
)
```

events

![image](https://i.imgur.com/kRD5IAb.png)


应用：使用上述api来实现
- 有一个input输入文本，按照url和title对chrome所有标签进行模糊搜索，选出最匹配的3条展示在下面；
- 当点击展示的某一条，可以直接切换到该标签。