import { WiredButton, WiredListbox, WiredInput, WiredSearchInput, WiredCard, WiredDivider,WiredLink } from "wired-elements"
import { LitElement, html, css } from 'lit';

class Container extends LitElement {
    static styles = css`
        .container {
            margin: auto;
            padding: auto;
            display: flex;
            flex-direction: column;
        }
        .item {
            margin: auto;
        }
        wired-input {
            width: 800px;
            font-size: 22px;
        }
        wired-listbox {
            margin-top: -5px;
            width: 800px;
        }
        wired-item {
            font-size: 18px;
        }
        `;

    static properties = {
        list: {},
        selectedIndex: {},
    };

    constructor() {
        super();
        this.list = [];
        this.selectedIndex = 0;
    }

    handleInput = async e =>{
        var text = e.target.value;
        var list = [];

        // 空格隔开每个关键字
        var arr = text.toLowerCase().split(" ").filter(i=>i.length > 0);

        var tabs = await chrome.tabs.query({});
        tabs.map(tab=>{
            var score = lcs(arr, (tab.url + tab.title).toLowerCase());
            list.push({tab, score});
        });

        list = list.filter(it=>it.score > 0).sort((a, b) => b.score - a.score).slice(0, 20);
        this.list = [];
        this.selectedIndex = 0;
        var that=this;
        setTimeout(()=>{that.list = list}, 0);
    }

    arrowDownUpOrEnter = async e => {
        var listbox = this.shadowRoot.getElementById('listbox')
        if ((e.keyCode === 40 || e.keyCode === 38 || e.keyCode === 13) && listbox) {
            e.preventDefault();
            listbox.focus();
            var event = new KeyboardEvent('keydown', {
                key: e.key,
                code: e.code,
                keyCode: e.keyCode,
            });
            listbox.dispatchEvent(event);
        }
    }

    keyDown = async e => {
        var listbox = this.shadowRoot.getElementById('listbox')
        var input = this.shadowRoot.getElementById('input')

        // 回车
        if (e.keyCode === 13) {
            var listbox = this.shadowRoot.querySelector("#listbox");
            this.handleClick({index: listbox.selected});
            return;
        }


        if (e.keyCode < 37 || e.keyCode > 40) {
            listbox.blur();
            input.shadowRoot.querySelector('input').focus();
            var event = new KeyboardEvent('keydown', {
                key: e.key,
                code: e.code,
                keyCode: e.keyCode,
            });
            input.dispatchEvent(event);
        }
    }


    handleClick = async ({index}) => {
        this.selectedIndex = index;
        var {tab, socre} = this.list[index];
        await chrome.windows.update(tab.windowId, {focused: true});
        await chrome.tabs.update(tab.id, {active: true});
    }

    render() {
        return html`
            <div class="container">
                <div class="item">
                    <wired-input @input="${this.handleInput}" @keydown="${this.arrowDownUpOrEnter}" autofocus="true" width="500" id="input"></wired-input>
                </div>
                <div class="item" id="combo">
                    ${
                        !this.list.length ? null : 
                        html`<wired-listbox id="listbox" selected="${this.selectedIndex}"  @keydown="${this.keyDown}"
                            style="--wired-item-selected-color: darkred; --wired-item-selected-bg: pink;">
                        ${this.list.map((item, index)=>
                            html`<wired-item value="${index}" @click="${()=>this.handleClick({index})}">
                                ${item.score} ${item.tab.title}
                            </wired-item>`)}
                        </wired-listbox>
                        `
                    }        
                </div>
            </div>
        `;
    }
}
customElements.define('w-container', Container);


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