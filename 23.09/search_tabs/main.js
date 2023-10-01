var input = document.getElementById('input');
input.oninput = async e =>{
    var text = e.target.value;
    var list = [];
    if (text.trim().length > 0) {
        // 空格隔开每个关键字
        var arr = text.toLowerCase().split(" ").filter(i=>i.length > 0);
        console.log(arr);

        var tabs = await chrome.tabs.query({});
        tabs.map(tab=>{
            var score = lcs(arr, (tab.url + tab.title).toLowerCase());
            list.push({tab, score});
        });

        list = list.filter(it=>it.score > 0).sort((a, b) => b.score - a.score).slice(0, 20);
    }
    var table = document.getElementById('table');
    table.innerHTML = `
        <div>
            ${list.map(item=>`<div>${item.score} <a href="#" class="a" id="a_${item.tab.id}">${item.tab.title}</a><div>`).join('\n')}
        </div>
    `
    list.forEach(item => {
        document.getElementById(`a_${item.tab.id}`).onclick = async function(e) {
            e.preventDefault;
            var tab = item.tab;
            await chrome.windows.update(tab.windowId, {focused: true});
            await chrome.tabs.update(tab.id, {active: true});
        }
    })
}

/**
 * 
 * @param {string[]} words 例如["java", "agent", "hello"]
 * @param {string} text 例如 "hello javaagent教学"
 * @returns 匹配的单词数，上面例子就是返回2，因为java agent是按顺序并且match的
 */
function lcs(words, text) {
    // 创建一个 m+1 x n+1 的二维数组，填充0，第0行0列始终为0
    var m = words.length, n = text.length;
    var arr = new Array(m + 1);
    for (var i = 0; i < m + 1; i++) {
        arr[i] = new Array(n + 1).fill(0);
    }

    // arr[i][j]代表，words取前i个单词，text取前j个字符，的情况下，匹配的单词数
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