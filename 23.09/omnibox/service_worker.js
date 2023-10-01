console.log("hi")

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

chrome.scripting.registerContentScripts( [
    {id:"content3", js: ['./content3.js'], matches: ['https://*/*']}
])

chrome.action.onClicked.addListener(async ()=>{
    var tabs = await chrome.tabs.query({active: true, currentWindow: true})
    var currentTab = tabs[0];
    await chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        files: ['content2.js'],
    });

    

    var scripts = await chrome.scripting.getRegisteredContentScripts();
    console.log(scripts);
});

