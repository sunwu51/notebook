chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: 'index.html' });
});