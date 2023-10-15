var input = document.getElementById('group-input');

var btn = document.getElementById('group-btn');

btn.addEventListener('click', async (e) => {
    var value = input.value;
    var m = value.match(/^(.+)-\/(.+)\/$/)
    if (m) {
        var groupName = m[1];
        var regex = new RegExp(m[2]);
        var tabs = await chrome.tabs.query({});
        tabs = tabs.filter(item => item.url && item.url.match(regex));
        if (tabs.length <= 0) {
            alert("没有符合条件的tabs")
            return
        }
        // 谷歌-/^.*google.*$/

        var groups = await chrome.tabGroups.query({title: groupName});

        // 已经存在同名group，则把所有的tab加入到已存在的group中
        var groupId;
        if (groups && groups.length) {
            groupId = groups[0].id;
            await chrome.tabs.group({groupId, tabIds: tabs.map(it=>it.id)});
        } else {
            groupId = await chrome.tabs.group({tabIds: tabs.map(it=>it.id)});
            await chrome.tabGroups.update(groupId, {title: groupName})
        }
        // await chrome.tabGroups.move(groupId, {index: 0, windowId: chrome.windows.WINDOW_ID_CURRENT});
    } else {
        alert("输入不合法~");
    }
})