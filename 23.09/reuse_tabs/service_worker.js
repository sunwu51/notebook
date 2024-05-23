var reuse = false;

// 点击的时候打开Panel
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error));

chrome.tabs.onCreated.addListener((e => console.log("tabsonCreated", e)));

chrome.tabs.onActivated.addListener(function (tabId, selectInfo) {
    console.log('active', tabId, selectInfo)
});


chrome.webNavigation.onCreatedNavigationTarget.addListener(e => console.log("onCreatedNavigationTarget", e));

chrome.webNavigation.onBeforeNavigate.addListener(e => console.log("onBeforeNavigate", e));

chrome.webNavigation.onCommitted.addListener(e => console.log("onCommitted", e));

chrome.webNavigation.onCompleted.addListener(async e => {
    console.log("onCompleted", e)
    if (e.tabId) {
        chrome.runtime.sendMessage({type: 'open', tabId: e.tabId});
    }
});

chrome.webNavigation.onDOMContentLoaded.addListener(async e => {
    console.log("onDOMContentLoaded", e)
    if (reuse && e.url && e.url.length > 0 && e.url !== 'about:blank' && e.tabId && e.frameId === 0) {
        var url = e.url.split("#")[0];
        var tabs = await chrome.tabs.query({ url });
        tabs = tabs.filter(it => it.id != e.tabId)
        if (tabs.length > 0) {
            var oldTab = tabs[0];
            // 跳转到最近打开的相同的tab
            await chrome.tabs.remove([e.tabId]);
            await chrome.windows.update(oldTab.windowId, { focused: true });
            await chrome.tabs.update(oldTab.id, { active: true });
        }
    }
});

chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
    if (msg.type === 'setting') {
        if (msg.key === 'reuse-check') reuse = msg.value;
    }
    sendResponse({ received: true });
});


// 页面关闭的时候通知插件从结果列表中删除。
chrome.tabs.onRemoved.addListener(async function (tabId, removeInfo) {
    await chrome.runtime.sendMessage({type: 'close', tabId});
});



function lcs(words, text) {
    var m = words.length, n = text.length;
    var arr = new Array(m + 1);
    for (var i = 0; i < m + 1; i++) {
        arr[i] = new Array(n + 1).fill(0);
    }

    for (var i = 1; i <= m; i++) {
        var word = words[i - 1];
        for (var j = 1; j <= n; j++) {
            if (j > word.length && text.substr(j - word.length - 1, word.length) === word) {
                arr[i][j] = 1 + arr[i - 1][j - word.length];
            } else {
                arr[i][j] = Math.max(arr[i - 1][j], arr[i][j - 1]);
            }
        }
    }
    return arr[m][n];
}
