/******************** 这是搜索相关的功能 ************************** */

var sinput = document.getElementById('search-input');
var smenu = document.getElementById('search-menu');

smenu.style.display = 'none';

sinput.addEventListener('focus', () => clearInterval(timer));
sinput.addEventListener('blur', () => timer = refreshTimer());

smenu.addEventListener('sl-select', async (e) => {
    var value = e.detail.item.value;
    await onSelect(value);
});

sinput.addEventListener('input', async (e) => {
    var text = e.target.value;
    await onInput(text);
});

async function onInput(text) {
    var fromTabs = [], fromHistory = [], fromBookmarks = [];
    if (text.trim().length > 0) {
        // 空格隔开每个关键字
        var arr = text.toLowerCase().split(" ").filter(i => i.length > 0);
        // 从当前打开的tab中找到最相似的10个，从3天内历史记录找5个，从书签找3个
        var urls = new Set();
        var tabs = await chrome.tabs.query({});
        fromTabs = tabs.map(tab => ({ tab, score: lcs(arr, (tab.url + tab.title).toLowerCase()) }))
            .filter(it => it.score > 0).sort((a, b) => b.score - a.score).slice(0, 10);
        fromTabs.forEach(it => urls.add(it.tab.url));

        var historys = await chrome.history.search({ text: '', maxResults: 1000, startTime: Date.now() - 3 * 24 * 60 * 60 * 1000 });
        fromHistory = historys.filter(it => urls.has(it.url) == false).map(it => ({ history: it, score: lcs(arr, (it.url + it.title).toLowerCase()) }))
            .filter(it => it.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);
        fromHistory.forEach(it => urls.add(it.history.url));


        var bookmarks = await chrome.bookmarks.search({});
        fromBookmarks = bookmarks.filter(it => urls.has(it.url) == false).map(it => ({ bookmark: it, score: lcs(arr, (it.url + it.title).toLowerCase()) }))
            .filter(it => it.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
        fromBookmarks.forEach(it => urls.add(it.bookmark.url));
    }
    var c = await chrome.storage.local.get({ "fromTabs": [], "fromHistory": [], "fromBookmarks": [], "searchText": "", backTab: null });
    if (equals(c.fromTabs, fromTabs) && equals(c.fromBookmarks, fromBookmarks) && equals(c.fromHistory, fromHistory) && c.searchText === text) return;
    chrome.storage.local.set({ fromTabs, fromHistory, fromBookmarks, searchText: text });
    await renderSearch();
}

async function onSelect(value) {
    var currentTab = await chrome.tabs.query({ currentWindow: true, active: true });
    if (value.match(/^\d+$/)) {
        var tabId = parseInt(value);
        try {
            var tab = await chrome.tabs.get(tabId);
            await chrome.windows.update(tab.windowId, { focused: true });
            await chrome.tabs.update(tab.id, { active: true });
            await chrome.storage.local.set({ backTab: currentTab[0] });
            renderSearch()
        } catch (e) {
            var { fromTabs } = await chrome.storage.local.get({ "fromTabs": [] });
            fromTabs = fromTabs.filter(it => it.tab.id != tabId)
            await chrome.storage.local.set({ fromTabs });
            renderSearch();
            return;
        }

    } else {
        var url = value;
        await chrome.tabs.create({ url })
        var { searchText } = await chrome.storage.local.get({ "searchText": "" })
        onInput(searchText);
    }
}
async function renderSearch() {
    var { fromTabs, fromHistory, fromBookmarks, searchText, backTab } = await chrome.storage.local.get({ "fromTabs": [], "fromHistory": [], "fromBookmarks": [], "searchText": "", backTab: null });
    sinput.value = searchText;
    if (fromTabs.length + fromHistory.length + fromBookmarks.length > 0) {
        smenu.style.display = 'block';
        var html = (backTab ? `
                        <sl-menu-item value="${backTab.id}"><sl-tooltip content="${backTab.url}"><sl-badge style="margin-right: 5px;">最近</sl-badge></sl-tooltip>${backTab.title}</sl-menu-item>` 
                    : ''
                    )
            + `${fromTabs.map(it => `
                <sl-menu-item value="${it.tab.id}">
                    <sl-tooltip content="${it.tab.url}">
                        <sl-badge style="margin-right: 5px;" variant="success">已开${it.score}</sl-badge>
                    </sl-tooltip>
                    ${it.tab.title}
                </sl-menu-item>`).join('\n')}`
            + `<sl-divider></sl-divider>`
            + `${fromHistory.map(it => `
                <sl-menu-item value="${it.history.url}">
                    <sl-tooltip content="${it.history.url}">
                        <sl-badge style="margin-right: 5px;" variant="neutral">历史${it.score}</sl-badge>
                    </sl-tooltip>
                    ${it.history.title}
                </sl-menu-item>`).join('\n')}`
            + `${fromBookmarks.map(it => `
                <sl-menu-item value="${it.bookmark.url}" variant="warning">
                    <sl-tooltip content="${it.bookmark.url}">
                        <sl-badge style="margin-right: 5px;" variant="warning">收藏${it.score}</sl-badge>
                    </sl-tooltip>
                    ${it.bookmark.title}
                </sl-menu-item>`).join('\n')}`
            + `<sl-menu-item value="https://www.google.com/search?q=${searchText}"><sl-badge style="margin-right: 5px;" variant="danger">谷歌</sl-badge>搜索${searchText}</sl-menu-item>`
            ;
        smenu.innerHTML = html;
    } else if (searchText.length > 0) {
        smenu.style.display = 'block';
        var html = `<sl-menu-item value="https://www.google.com/search?q=${searchText}"><sl-badge style="margin-right: 5px;" variant="danger">谷歌</sl-badge>搜索${searchText}</sl-menu-item>`
        smenu.innerHTML = html;
    } else {
        smenu.style.display = 'none';
        smenu.innerHTML = '';
    }
}

// function lcs(words, text) {
//     var m = words.length, n = text.length;
//     var arr = new Array(m + 1);
//     for (var i = 0; i < m + 1; i++) {
//         arr[i] = new Array(n + 1).fill(0);
//     }

//     for (var i = 1; i <= m; i++) {
//         var word = words[i - 1];
//         for (var j = 1; j <= n; j++) {
//             if (j > word.length && text.substr(j - word.length - 1, word.length) === word) {
//                 arr[i][j] = 1 + arr[i - 1][j - word.length];
//             } else {
//                 arr[i][j] = Math.max(arr[i - 1][j], arr[i][j - 1]);
//             }
//         }
//     }
//     return arr[m][n];
// }

function lcs(words, text) {
    var res = 0;
    for(var i = 0; i < words.length; i++) {
        res += text.indexOf(words[i]) >= 0 ? 1 : 0;
    }
    return res;
}


function equals(arr1, arr2) {
    var res = true;
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (var i = 0; i < arr1.length && res; i++) {
        res = res && arr1[i].id == arr2[i].id && arr1[i].title == arr2[i].title && arr1[i].url == arr2[i].url;
        if (arr1[i].tab) {
            res = res && arr1[i].tab.id == arr2[i].tab.id && arr1[i].tab.title == arr2[i].tab.title && arr1[i].tab.url == arr2[i].tab.url;
        }
    }
    return res;

}

chrome.runtime.onMessage.addListener(async function (closedTabId) {
    var { fromTabs } = await chrome.storage.local.get({ "fromTabs": [] });
    fromTabs = fromTabs.filter(it => it.tab.id != closedTabId)
    await chrome.storage.local.set({ fromTabs });
    renderSearch();
});

renderSearch();

// 多window使用storage保持一致
var timer = refreshTimer();

function refreshTimer(){
    return setInterval(async function () {
        var {searchText} = await chrome.storage.local.get({searchText: ''});
        onInput(searchText);
    }, 2000)
}
