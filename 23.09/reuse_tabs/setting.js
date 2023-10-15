var reuseCheck = document.getElementById('reuse-check');

reuseCheck.addEventListener('sl-change', async (e)=>{
    var checked = e.target.checked;
    await chrome.storage.local.set({reuse: checked})
    await chrome.runtime.sendMessage({"type": "setting", key: "reuse-check", value: checked});
})

// 多window使用storage保持一致
setInterval(async () => {
    var {reuse} = await chrome.storage.local.get({reuse: false});
    reuseCheck.checked = reuse;
}, 300)