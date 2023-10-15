var reuse = true;

// 点击的时候打开Panel
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error));

// 页面commit的时候检查是不是已经打开了相同url的tab，如果有则跳转过去
chrome.webNavigation.onCommitted.addListener(
    async ({tabId, url}) => {
        if (url.length > 0 && reuse) {
            // 如果有已经打开的，相同url的tab
            var tabs = await chrome.tabs.query({url});
            tabs = tabs.filter(it=> it.id != tabId)
            if(tabs.length > 0){
                var oldTab = tabs[0];
                // 跳转到最近打开的相同的tab
                await chrome.tabs.remove([tabId]);
                await chrome.windows.update(oldTab.windowId, {focused: true});
                await chrome.tabs.update(oldTab.id, {active: true});
            }
        }
    }
)

chrome.runtime.onMessage.addListener(async (msg) => {
    if (msg.type === 'setting') {
        if (msg.key === 'reuse-check') reuse = msg.value;
    }
});


// 页面关闭的时候通知插件从结果列表中删除。
chrome.tabs.onRemoved.addListener(async function (tabId, removeInfo) {
    await chrome.runtime.sendMessage(tabId);
});



function lcs(words, text) {
    var m = words.length, n = text.length;
    var arr = new Array(m + 1);
    for (var i = 0; i < m + 1; i++) {
        arr[i] = new Array(n + 1).fill(0);
    }

    for (var i = 1; i <= m; i++) {
        var word = words[i-1];
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