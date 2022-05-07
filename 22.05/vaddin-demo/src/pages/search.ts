import { LitElement, html, css, PropertyValueMap } from 'lit';
import { customElement, state } from 'lit/decorators.js'
import { TrieNode, TrieTree } from '../utils/trie.js';
import axios from 'axios';
import {merge} from '../utils/promise'
import 'wired-elements/lib/wired-card.js';
import "../vaadin.js";
import { TextField } from '../vaadin.js';

@customElement('w-search')
export class Search extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
        height: 100%;
      }
      .container{
        display: flex;
        justify-content: center;
        height: 100%;
      }
      .search{
        width: 80%;
        min-width: 380px;
        max-width: 600px;
        margin-top: 2%;
      }

      li:hover{
        color: #ffffff;
        background: #7cadec;
        border-radius: 5px;
      }
      .lidetail {
        display: none;
      }
      li:hover .lidetail {
        display: block;
      }
      li:hover .liex {
        display: none;
      }
      li:hover .lidetail p{
        margin: 3px 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      li:hover > div {
        display: flex;
        flex-direction: column;
      }

      .suggest{
        width: 100%;
        background-color: rgb(245, 248, 253);
        border-radius: 6px;
        margin-top: 0px;
        border: solid aliceblue;
      }
      ul{
        margin:0;
        padding: 0;
      }
      li{
        list-style: none;
        padding: 5px 30px;
      }
      li > div{
        display: flex;
        justify-content: space-between;
      }
      li > div > .liex{
        max-width: 50%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `
  ];

  @state()
  _trie = new TrieTree()

  @state()
  _inputValue = ""

  @state()
  _data = []

  // protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
   
  // }

  connectedCallback(): void {
    super.connectedCallback()
    var _this = this;
    fetch("/api/list.json").then(res=>res.json()).then(list=>{
      var tmp = new TrieTree()
      list.forEach(it=>tmp.insert(it, it))
      _this._trie = tmp;
    })
  }

  private async _onchange(e: Event) {
    var {value} = this.shadowRoot.getElementById("input") as TextField;
    this._inputValue = value;
    if(!value || value.length<2){
      this._data = [];
      return;
    }
    var res = this._trie.startsWith(value);
    var data = await this._fetchDetail(res.splice(0, 10))
    this._data = data;
    console.log(data)
  }

  async _fetchDetail(words) {
    var result =[]
    var promises = words.map(word=>axios(`/api/dict/${word}.json`))
    console.log(promises)
    result = await merge(promises)
    result = result.map(it=> it? it.data: it)
    return result;
  }

  render() {
    var msg = null
    if (this._inputValue.length == 0) {
      msg = `请输入要查询的单词`
    } else if  (this._inputValue.length < 2 ){
      msg = `请输入至少两个字母`
    } else if (this._data.length == 0){
      msg = "词库中没有该单词..."
    }
    return html`<div class="container">
      <div class="search">
      <vaadin-text-field id='input' style="width: 100%" @input=${this._onchange} aria-label="search"  placeholder="Search" clear-button-visible>
        <vaadin-icon icon="vaadin:search" slot="prefix"></vaadin-icon>
      </vaadin-text-field>
      <div class="suggest">
        <ul id="ul">
          ${
           msg ? html`<p style='padding: 0px 30px;'>${msg}</p>` :
              this._data.map((data) =>
                html`<li>
                  <div>
                    <div class="liword">${data.word}</div>
                    <div class="liex">${data.explains.join(';')}</div>
                    <div class="lidetail">
                      ${
                        data.explains.map(ex=>
                          html`<p>${ex}</p>`  
                        )
                      }
                    </div>
                  </div>
                </li>`
              )
          }
        </ul>
      </div>
      </div>
    </div>`;
  }
}
