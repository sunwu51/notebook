/******************** 这是搜索相关的功能 ************************** */

var sinput = document.getElementById('search-input');
var smenu = document.getElementById('search-menu');
sinput.value = ''
smenu.style.display = 'none';

var fromTabs = [], fromHistory = [], fromBookmarks = [];

smenu.addEventListener('sl-select', async (e) => {
    var value = e.detail.item.value;
    await onSelect(value);
});

sinput.addEventListener('input', async (e) => {
    var text = e.target.value;
    await onInput(text);
});

async function onInput(text) {
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
    } else {
        // 如果啥也没输入就默认展示最近查看的10个tab
        var historys = await chrome.history.search({ text: '', maxResults: 20, startTime: Date.now() - 3 * 24 * 60 * 60 * 1000 });
        fromHistory = historys.map(it => ({ history: it, score: 1})).filter(it => it.score > 0).slice(0, 10);
    }
    await renderSearch(text);
}

async function onSelect(value) {
    if (value.match(/^\d+$/)) {
        var tabId = parseInt(value);
        try {
            var tab = await chrome.tabs.get(tabId);
            await chrome.windows.update(tab.windowId, { focused: true });
            await chrome.tabs.update(tab.id, { active: true });
        } catch (e) {
            fromTabs = fromTabs.filter(it => it.tab.id != tabId)
            await renderSearch(text);
            return;
        }
    } else {
        var url = value;
        await chrome.tabs.create({ url })
        onInput(sinput.value);
    }
}
async function renderSearch(searchText) {
    sinput.value = searchText;
    var curWindow = await chrome.windows.getCurrent();
    if (fromTabs.length + fromHistory.length + fromBookmarks.length > 0) {
        smenu.style.display = 'block';
        var html = `${fromTabs.map(it => `
                <sl-menu-item value="${it.tab.id}">
                    <sl-tooltip  style="--max-width: 100rem;"  content="${it.tab.url}">
                        <sl-badge style="margin-right: 5px;" variant="success">${curWindow.id===it.tab.windowId?"当前窗口":"其他窗口"}${it.score}</sl-badge>
                    </sl-tooltip>
                    ${it.tab.title}
                </sl-menu-item>`).join('\n')}`
            + `<sl-divider></sl-divider>`
            + `${fromHistory.map(it => `
                <sl-menu-item value="${it.history.url}">
                    <sl-tooltip style="--max-width: 100rem;" content="${it.history.url}">
                        <sl-badge style="margin-right: 5px;" variant="neutral">[${formatTime(Date.now()-it.history.lastVisitTime)}]-${it.score}</sl-badge>
                    </sl-tooltip>
                    ${it.history.title}
                </sl-menu-item>`).join('\n')}`
            + `${fromBookmarks.map(it => `
                <sl-menu-item value="${it.bookmark.url}" variant="warning">
                    <sl-tooltip style="--max-width: 100rem;"  content="${it.bookmark.url}">
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
function lcs(words, text) {
    var res = 0;
    for(var i = 0; i < words.length; i++) {
        res += text.indexOf(words[i]) >= 0 ? 1 : 0;
    }
    return res;
}

function formatTime(ms) {
    var m = ms / 1000 / 60;
    if (m<180) return Math.ceil(m) + '分钟前'
    if (m<24*60) return Math.floor(m/60) + '小时前'
    return Math.floor(m/60/24) + '天前'
}

// 如果有新标签打开或者旧的标签关闭，应该触发该事件
chrome.runtime.onMessage.addListener(async function (e) {
    onInput(sinput.value);
});

onInput(sinput.value);
