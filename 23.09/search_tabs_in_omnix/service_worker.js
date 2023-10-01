chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: 'src/dist/index.html' });
});

chrome.omnibox.onInputChanged.addListener(async function (text, suggest) {
    var list = [];
    if (text.trim().length > 0) {
        // 空格隔开每个关键字
        var arr = text.toLowerCase().split(" ").filter(i=>i.length > 0);

        var tabs = await chrome.tabs.query({});
        tabs.map(tab=>{
            var score = lcs(arr, (tab.url + tab.title).toLowerCase());
            list.push({tab, score});
        });

        list = list.filter(it=>it.score > 0).sort((a, b) => b.score - a.score).slice(0, 20);
    }
    suggest(
        list.map(item=>{
            return {
                content: `${item.score}_${item.tab.id}_${item.tab.url}`,
                description: `切换到<url>${item.tab.title}</url>`,
                deletable: true
            }
        })
    );
});

chrome.omnibox.onInputEntered.addListener(async function (text, disposition) {
    var arr = text.split('_');
    try {
        var tabId = parseInt(arr[1]);
        var tab = await chrome.tabs.get(tabId);
        await chrome.windows.update(tab.windowId, {focused: true});
        await chrome.tabs.update(tab.id, {active: true});
    } catch(e) {}
})




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