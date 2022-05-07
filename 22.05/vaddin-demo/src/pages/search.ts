import { LitElement, html, css, PropertyValueMap } from 'lit';
import { customElement, state } from 'lit/decorators.js'
import { TrieNode, TrieTree } from '../utils/trie.js';
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
        width: 50%;
        max-width: 600px;
        margin-top: 2%;
      }

      li:hover{
        font-size: 25px;
        color: #650acc;
      }
    `
  ];

  @state()
  _trie = new TrieTree()

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

  private _onchange(e: Event) {
    
    var {value} = this.shadowRoot.getElementById("input") as TextField;
    if(!value || value.length<2){
      this._data = [];
      return;
    }
    var res = this._trie.startsWith(value);
    this._data = res.splice(0, 10);
  }
  render() {
    return html`<div class="container">
      <div class="search">
      <vaadin-text-field id='input' style="width: 100%" @input=${this._onchange} aria-label="search"  placeholder="Search" clear-button-visible>
        <vaadin-icon icon="vaadin:search" slot="prefix"></vaadin-icon>
      </vaadin-text-field>
      <div style="width: 100%; background-color: #cfd3da; border-radius:5px; margin-top:-12px;">
        <ul id="ul">
          ${this._data.map((data) =>
            html`<li>${data}</li>`
          )}
        </ul>
      </div>
      </div>
    </div>`;
  }
}
