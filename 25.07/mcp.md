---
title: mcp
date: 2025-07-06T13:50:00+08
tags:
    - llm
    - mcp
---
# 1 mcp介绍
`MCP`（model context protocal）是最近半年，在AI领域比较火的一个概念了，他是给大模型提供上下文的一种协议。

什么是上下文呢？上下文本质就是传给大模型的`prompt`，`LLM`中很多技术概念都是围绕上下文出现的。用户自己`输入问题`就是上下文的主要部分。但是有时候用户的输入不够，这时候我们可能需要借助`RAG`和知识库来丰富上下文，知识库是用户自己准备的大量数据，通过可检索的方式在调用`LLM`前，搜索出相关的内容。再然后知识库还是不够，例如我们想要查询互联网，最新天气等，离线的知识库是肯定没有相关数据的，所以需要调用外部工具，所以有了`function calling`，这些都是来丰富上下文的。

那么`MCP`又做了什么呢？很多地方说`MCP`就是把`function calling`给规范化标准化了，有的地方也是`MCP`就是替换`function calling`的。这些说法都不太准确。`MCP`是把提供上下文的协议给规范化了，不仅对函数调用的过程，也对`RAG`的过程产生影响。

那么`RAG`和`Function calling`的现有流程中有哪些“不规范”的地方呢？

## 1.1 RAG与MCP resource
在`RAG`流程如下，我们需要自己完成`R`检索，`A`增强上下文的步骤，尤其是检索的这一步，我们需要自己在不同的知识库中，进行查询，可能用的是不同的数据库存储，不同的查询逻辑等。所以如果有多个知识库，这里就需要自己写一些定制化的逻辑。当然系统变复杂之后，我们可以把不同知识库的`RAG`封装成接口，入参是用户输入，出参是`RAG`增强后的`prompt`，这样就可以实现解耦了。但是至于这个接口怎么封装，传输方式，序列化方式等等，都是没有规范的，各个公司可以有自己的实现。

![image](https://sunwu51.github.io/notebook/UCTMTkL.png)

而`MCP`就是这样一个规范，他规定接口的出入参采用`jsonrpc2.0`格式规范，并且规定了传输协议有`stdio`和`httpstram`2种形式，[参考](https://modelcontextprotocol.io/docs/concepts/transports)，`MCP`就是在原有的链路调用中，在`ai应用`和RAG数据库查询之间加了一层适配层，这样`ai应用`就可以不用关心数据库调用部分的细节，如下图：

![image](https://i.imgur.com/u8f90Et.png)

`MCP server`通过配置的方式注册到`ai应用`如`cherry studio`中，配置文件类似这样：
```json
{
  "mcpServers": {
    "github.com/modelcontextprotocol/servers/tree/main/src/github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "xxx"
      },
      "disabled": false,
      "autoApprove": []
    },
    "demo": {
      "command": "node",
      "args": [
        "C:\\Users\\sunwu\\Desktop\\code\\mcp-node\\src\\a1.mjs"
      ],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```
主要就是配置了`command`+`args`的启动指令，在配置第一次保存后，`ai应用`通过标准的接口去初始化，查询`mcpserver`中有哪些可用的资源，如下图是`claude dev`这个工具接入`MCP server`的截图，可以看到每个接入的mcp中的`tools`和`resources`，后者就是对应的静态资源数据的检索，其实对应的是`RAG`或者知识库的概念，即静态的、只读的、供查询的数据的接口，`resources`类型。

![image](https://i.imgur.com/vRckVW7.png)

在知识库查询过程中，流程中插入了`MCP server`这个中间层

![image](https://i.imgur.com/ShmjsEd.png)

## 1.2 function calling与MCP tool
`tool`和`resource`只是类型不同，流程上都需要对`MCP server`进行调用，所以和前面流程一致。`MCP tool`算是对`function calling`流程的增强

在原来的`function calling`流程中，用户把函数列表和问题一起发给`LLM`，后者根据上下文决定要调用某个函数后，将函数名和入参返回，再由`Ai app`调用具体的函数，最后这一步同样没有形成规范，如何调用，怎么调用等，不同的应用和插件都有自定义的形式，所以`MCP server`同样是规范化了这一步。下图是原来`function calling`流程

![image](https://i.imgur.com/jbzxs5Q.png)

引入`MCP`后再函数调用者里套一层`MCP server`来标准化`AI app`的代码，但这其实还不够，因为`function calling`是部分模型支持的功能，有些模型可能不支持，为了让所有模型都能支持`MCP tool`，所以这里大多数支持`MCP client`的模型都采用定制化`System prompt`的形式。这里我们用`cherry studio`这个支持`MCP`的工具为例，先创建一个`demo`的`mcp server`他有个`add`函数运行加法，至于`MCP server`怎么写我们后面再说，这里我们先看流程。

![image](https://i.imgur.com/k1sCyTP.png)

然后诱导大模型用`demo-add`运行加法

![image](https://i.imgur.com/DKHuDC3.png)

抓包看到第一个请求，就返回了，将使用`add`来运算

![image](https://i.imgur.com/oTPrDKD.png)

这是因为`System prompt`中有列出可以使用的`MCP server`，我们之前也提到过`claude dev`也是类似的方式来让不支持`function calling`的模型，能够调用工具函数的。

![image](https://i.imgur.com/9p3gMDG.png)

返回的结果中有prompt中预设好的xml格式的函数调用描述，包括了函数名，函数参数：

![image](https://i.imgur.com/3vX7uct.png)

此时`cherry studio`会识别`xml`，调用这个`mcp server`，调用返回3，然后将调用结果也给大模型再传过去，这是第二次`LLM`调用：

![image](https://i.imgur.com/qOVvKam.png)

此时大模型应该总结下这个调用结果直接返回就好了，不过我这次调用的时候，大模型又尝试再次调用了`add`函数，所以这里有两次调用。所以我这个例子中调用了两次`add`，但是问题不大。
## 1.3 小结
上面例子中可以看出`MCP`其实没有提供功能和内容上的本质变化，只是在索要更多上下文的`RAG` `function calling`等流程中加了一层中间层。单页带来了很多好处，让`RAG`和`tool`的接入更加规范化了。

比如之前在`coze`中接入插件，要符合`coze`的插件标准，如果后续`agent`想切到别的平台，还需要对插件进行修改。但是如果各个平台都支持`MCP`标准的话，`ai app`的切换，就不影响插件的切换了。

# 2 MCP server
`MCP server`主要有三种形式，一种是位于本机（ai app所在的机器），执行的内容也是本机，例如本机的文件操作；第二种是位于本机，但是执行内容是远程调用，例如`github`的`mcp server`可以查询`github`热点，就是远程调用的gh的API；第三种是`mcp server`本身就运行在远程服务器。

![image](https://i.imgur.com/u8f90Et.png)

其中需要低延迟和操作系统或本地软件权限的，都是第一种，例如：文件操作、控制浏览器、控制桌面等；需要远程服务接口支持的则是第二种为主，例如刚才提到的`github`的`mcp server`，他就是在本机运行一个代理，来接受`ai app`的请求，通过转换后发送到`remote endpoint`；最后如果想要灵活的控制`mcp server`的升级、收集用户数据等，也会采用第三种方案，用单独的服务器运行`mcp server`，不过这种比较少。

## 2.1 写一个
```bash
$ mkdir mcp-node && cd mcp-node
$ npm init -y
$ npm i @modelcontextprotocol/sdk
$ vim index.mjs
```
把官方`ts`库的代码贴到`index.mjs`里，虽然官方说是`ts-sdk`，但是没有用`ts`语法，直接在`js`中也能运行
```js :index.mjs
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server
const server = new McpServer({
  name: "demo-server",
  version: "1.0.0"
});

// Add an addition tool
server.registerTool("add",
  {
    title: "Addition Tool",
    description: "Add two numbers",
    inputSchema: { a: z.number(), b: z.number() }
  },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }]
  })
);

// Add a dynamic greeting resource
server.registerResource(
  "greeting",
  new ResourceTemplate("greeting://{name}", { list: undefined }),
  { 
    title: "Greeting Resource",      // Display name for UI
    description: "Dynamic greeting generator"
  },
  async (uri, { name }) => ({
    contents: [{
      uri: uri.href,
      text: `Hello, ${name}!`
    }]
  })
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
server.connect(transport);
```
直接运行`node a1.mjs`，窗口会阻塞没有任何反应，这是因为当前使用的是`stdio`交互模式的`StdioServerTransport`，需要将`jsonrpc2.0`的request通过`stdio`的形式传入进来，才会有反应，像下面这样：

![image](https://i.imgur.com/iYYnCo2.png)

但是这个控制台`echo`的方式实在是太麻烦了，所以为了方便调试可以使用`npm i -g @modelcontextprotocol/inspector`，然后运行`mcp-inspector`，打开给的带token的url。

![image](https://i.imgur.com/en1w8qh.png)

打开后如下填写，主要是运行我们的`index.mjs`文件，这个`inspector`会与我们运行起来的进行的`stdio`进行交互。

![image](https://i.imgur.com/V5XsJy2.png)

连接本质是`initailize`的过程，此时我们可以看到如下页面，通过`list xx`按钮可以展示有哪些资源和工具。

![image](https://i.imgur.com/YCLcyxg.png)

这里我们在`tool`中展示下所有的函数，然后点击add，输入入参，点击run，得到了最后的结果，这就是测试了。

![image](https://i.imgur.com/8M6Nu1D.png)

我们会看下，server的代码`new McpServer`是创建了`McpServer`，`registerTool`和`registerResource`则是分别注册了一个`tool`和一个`resource`，前者实现了加法，后者会返回打招呼。最后通过`StdioServerTransport`这个最简单的`stdio`交互的方式来启动server，注意只有本机可以用这个，如果是远程的话，需要用`httpstream`的形式。

# 3 MCP client
`client`的作用就是来调用`server`，要根据`stdio` `httpstream`具体是那种传输形式和server进行匹配的交互。此外在`ai app`中要支持可配置`mcpserver`，所以有些工具例如`chatbox`等是不支持`mcp`的，而另外一些如`cherry studio`是支持的，这是因为后者集成了`MCP client`的功能，能对`MCP server`进行调用。

`client`也有对应的`sdk`，这里我就不展示了，因为自己暂时没有写`MCP client`的需求，一般是自己写`ai app`或者平台才需要自己写`client`。
