var ci=Object.defineProperty;var pi=(o,e,t)=>e in o?ci(o,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):o[e]=t;var W=(o,e,t)=>(pi(o,typeof e!="symbol"?e+"":e,t),t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function t(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(n){if(n.ep)return;n.ep=!0;const s=t(n);fetch(n.href,s)}})();/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const je=window,ft=je.ShadowRoot&&(je.ShadyCSS===void 0||je.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,gt=Symbol(),jt=new WeakMap;let Gt=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==gt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(ft&&e===void 0){const i=t!==void 0&&t.length===1;i&&(e=jt.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&jt.set(t,e))}return e}toString(){return this.cssText}};const ui=o=>new Gt(typeof o=="string"?o:o+"",void 0,gt),g=(o,...e)=>{const t=o.length===1?o[0]:e.reduce((i,n,s)=>i+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+o[s+1],o[0]);return new Gt(t,o,gt)},fi=(o,e)=>{ft?o.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet):e.forEach(t=>{const i=document.createElement("style"),n=je.litNonce;n!==void 0&&i.setAttribute("nonce",n),i.textContent=t.cssText,o.appendChild(i)})},zt=ft?o=>o:o=>o instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return ui(t)})(o):o;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var Je;const ze=window,Mt=ze.trustedTypes,gi=Mt?Mt.emptyScript:"",Pt=ze.reactiveElementPolyfillSupport,rt={toAttribute(o,e){switch(e){case Boolean:o=o?gi:null;break;case Object:case Array:o=o==null?o:JSON.stringify(o)}return o},fromAttribute(o,e){let t=o;switch(e){case Boolean:t=o!==null;break;case Number:t=o===null?null:Number(o);break;case Object:case Array:try{t=JSON.parse(o)}catch{t=null}}return t}},Kt=(o,e)=>e!==o&&(e==e||o==o),Qe={attribute:!0,type:String,converter:rt,reflect:!1,hasChanged:Kt},at="finalized";let J=class extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(e){var t;this.finalize(),((t=this.h)!==null&&t!==void 0?t:this.h=[]).push(e)}static get observedAttributes(){this.finalize();const e=[];return this.elementProperties.forEach((t,i)=>{const n=this._$Ep(i,t);n!==void 0&&(this._$Ev.set(n,i),e.push(n))}),e}static createProperty(e,t=Qe){if(t.state&&(t.attribute=!1),this.finalize(),this.elementProperties.set(e,t),!t.noAccessor&&!this.prototype.hasOwnProperty(e)){const i=typeof e=="symbol"?Symbol():"__"+e,n=this.getPropertyDescriptor(e,i,t);n!==void 0&&Object.defineProperty(this.prototype,e,n)}}static getPropertyDescriptor(e,t,i){return{get(){return this[t]},set(n){const s=this[e];this[t]=n,this.requestUpdate(e,s,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)||Qe}static finalize(){if(this.hasOwnProperty(at))return!1;this[at]=!0;const e=Object.getPrototypeOf(this);if(e.finalize(),e.h!==void 0&&(this.h=[...e.h]),this.elementProperties=new Map(e.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,i=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const n of i)this.createProperty(n,t[n])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const n of i)t.unshift(zt(n))}else e!==void 0&&t.push(zt(e));return t}static _$Ep(e,t){const i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}_$Eu(){var e;this._$E_=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$Eg(),this.requestUpdate(),(e=this.constructor.h)===null||e===void 0||e.forEach(t=>t(this))}addController(e){var t,i;((t=this._$ES)!==null&&t!==void 0?t:this._$ES=[]).push(e),this.renderRoot!==void 0&&this.isConnected&&((i=e.hostConnected)===null||i===void 0||i.call(e))}removeController(e){var t;(t=this._$ES)===null||t===void 0||t.splice(this._$ES.indexOf(e)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach((e,t)=>{this.hasOwnProperty(t)&&(this._$Ei.set(t,this[t]),delete this[t])})}createRenderRoot(){var e;const t=(e=this.shadowRoot)!==null&&e!==void 0?e:this.attachShadow(this.constructor.shadowRootOptions);return fi(t,this.constructor.elementStyles),t}connectedCallback(){var e;this.renderRoot===void 0&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$ES)===null||e===void 0||e.forEach(t=>{var i;return(i=t.hostConnected)===null||i===void 0?void 0:i.call(t)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$ES)===null||e===void 0||e.forEach(t=>{var i;return(i=t.hostDisconnected)===null||i===void 0?void 0:i.call(t)})}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$EO(e,t,i=Qe){var n;const s=this.constructor._$Ep(e,i);if(s!==void 0&&i.reflect===!0){const r=(((n=i.converter)===null||n===void 0?void 0:n.toAttribute)!==void 0?i.converter:rt).toAttribute(t,i.type);this._$El=e,r==null?this.removeAttribute(s):this.setAttribute(s,r),this._$El=null}}_$AK(e,t){var i;const n=this.constructor,s=n._$Ev.get(e);if(s!==void 0&&this._$El!==s){const r=n.getPropertyOptions(s),a=typeof r.converter=="function"?{fromAttribute:r.converter}:((i=r.converter)===null||i===void 0?void 0:i.fromAttribute)!==void 0?r.converter:rt;this._$El=s,this[s]=a.fromAttribute(t,r.type),this._$El=null}}requestUpdate(e,t,i){let n=!0;e!==void 0&&(((i=i||this.constructor.getPropertyOptions(e)).hasChanged||Kt)(this[e],t)?(this._$AL.has(e)||this._$AL.set(e,t),i.reflect===!0&&this._$El!==e&&(this._$EC===void 0&&(this._$EC=new Map),this._$EC.set(e,i))):n=!1),!this.isUpdatePending&&n&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var e;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach((n,s)=>this[s]=n),this._$Ei=void 0);let t=!1;const i=this._$AL;try{t=this.shouldUpdate(i),t?(this.willUpdate(i),(e=this._$ES)===null||e===void 0||e.forEach(n=>{var s;return(s=n.hostUpdate)===null||s===void 0?void 0:s.call(n)}),this.update(i)):this._$Ek()}catch(n){throw t=!1,this._$Ek(),n}t&&this._$AE(i)}willUpdate(e){}_$AE(e){var t;(t=this._$ES)===null||t===void 0||t.forEach(i=>{var n;return(n=i.hostUpdated)===null||n===void 0?void 0:n.call(i)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(e){return!0}update(e){this._$EC!==void 0&&(this._$EC.forEach((t,i)=>this._$EO(i,this[i],t)),this._$EC=void 0),this._$Ek()}updated(e){}firstUpdated(e){}};J[at]=!0,J.elementProperties=new Map,J.elementStyles=[],J.shadowRootOptions={mode:"open"},Pt==null||Pt({ReactiveElement:J}),((Je=ze.reactiveElementVersions)!==null&&Je!==void 0?Je:ze.reactiveElementVersions=[]).push("1.6.3");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var et;const Me=window,Q=Me.trustedTypes,It=Q?Q.createPolicy("lit-html",{createHTML:o=>o}):void 0,lt="$lit$",B=`lit$${(Math.random()+"").slice(9)}$`,Yt="?"+B,bi=`<${Yt}>`,F=document,fe=()=>F.createComment(""),ge=o=>o===null||typeof o!="object"&&typeof o!="function",Zt=Array.isArray,vi=o=>Zt(o)||typeof(o==null?void 0:o[Symbol.iterator])=="function",tt=`[ 	
\f\r]`,he=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Lt=/-->/g,Nt=/>/g,U=RegExp(`>|${tt}(?:([^\\s"'>=/]+)(${tt}*=${tt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Bt=/'/g,Ht=/"/g,Xt=/^(?:script|style|textarea|title)$/i,yi=o=>(e,...t)=>({_$litType$:o,strings:e,values:t}),u=yi(1),ee=Symbol.for("lit-noChange"),R=Symbol.for("lit-nothing"),Dt=new WeakMap,V=F.createTreeWalker(F,129,null,!1);function Jt(o,e){if(!Array.isArray(o)||!o.hasOwnProperty("raw"))throw Error("invalid template strings array");return It!==void 0?It.createHTML(e):e}const mi=(o,e)=>{const t=o.length-1,i=[];let n,s=e===2?"<svg>":"",r=he;for(let a=0;a<t;a++){const l=o[a];let d,c,p=-1,f=0;for(;f<l.length&&(r.lastIndex=f,c=r.exec(l),c!==null);)f=r.lastIndex,r===he?c[1]==="!--"?r=Lt:c[1]!==void 0?r=Nt:c[2]!==void 0?(Xt.test(c[2])&&(n=RegExp("</"+c[2],"g")),r=U):c[3]!==void 0&&(r=U):r===U?c[0]===">"?(r=n??he,p=-1):c[1]===void 0?p=-2:(p=r.lastIndex-c[2].length,d=c[1],r=c[3]===void 0?U:c[3]==='"'?Ht:Bt):r===Ht||r===Bt?r=U:r===Lt||r===Nt?r=he:(r=U,n=void 0);const v=r===U&&o[a+1].startsWith("/>")?" ":"";s+=r===he?l+bi:p>=0?(i.push(d),l.slice(0,p)+lt+l.slice(p)+B+v):l+B+(p===-2?(i.push(void 0),a):v)}return[Jt(o,s+(o[t]||"<?>")+(e===2?"</svg>":"")),i]};class be{constructor({strings:e,_$litType$:t},i){let n;this.parts=[];let s=0,r=0;const a=e.length-1,l=this.parts,[d,c]=mi(e,t);if(this.el=be.createElement(d,i),V.currentNode=this.el.content,t===2){const p=this.el.content,f=p.firstChild;f.remove(),p.append(...f.childNodes)}for(;(n=V.nextNode())!==null&&l.length<a;){if(n.nodeType===1){if(n.hasAttributes()){const p=[];for(const f of n.getAttributeNames())if(f.endsWith(lt)||f.startsWith(B)){const v=c[r++];if(p.push(f),v!==void 0){const j=n.getAttribute(v.toLowerCase()+lt).split(B),P=/([.?@])?(.*)/.exec(v);l.push({type:1,index:s,name:P[2],strings:j,ctor:P[1]==="."?$i:P[1]==="?"?_i:P[1]==="@"?Ri:De})}else l.push({type:6,index:s})}for(const f of p)n.removeAttribute(f)}if(Xt.test(n.tagName)){const p=n.textContent.split(B),f=p.length-1;if(f>0){n.textContent=Q?Q.emptyScript:"";for(let v=0;v<f;v++)n.append(p[v],fe()),V.nextNode(),l.push({type:2,index:++s});n.append(p[f],fe())}}}else if(n.nodeType===8)if(n.data===Yt)l.push({type:2,index:s});else{let p=-1;for(;(p=n.data.indexOf(B,p+1))!==-1;)l.push({type:7,index:s}),p+=B.length-1}s++}}static createElement(e,t){const i=F.createElement("template");return i.innerHTML=e,i}}function te(o,e,t=o,i){var n,s,r,a;if(e===ee)return e;let l=i!==void 0?(n=t._$Co)===null||n===void 0?void 0:n[i]:t._$Cl;const d=ge(e)?void 0:e._$litDirective$;return(l==null?void 0:l.constructor)!==d&&((s=l==null?void 0:l._$AO)===null||s===void 0||s.call(l,!1),d===void 0?l=void 0:(l=new d(o),l._$AT(o,t,i)),i!==void 0?((r=(a=t)._$Co)!==null&&r!==void 0?r:a._$Co=[])[i]=l:t._$Cl=l),l!==void 0&&(e=te(o,l._$AS(o,e.values),l,i)),e}class wi{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){var t;const{el:{content:i},parts:n}=this._$AD,s=((t=e==null?void 0:e.creationScope)!==null&&t!==void 0?t:F).importNode(i,!0);V.currentNode=s;let r=V.nextNode(),a=0,l=0,d=n[0];for(;d!==void 0;){if(a===d.index){let c;d.type===2?c=new Re(r,r.nextSibling,this,e):d.type===1?c=new d.ctor(r,d.name,d.strings,this,e):d.type===6&&(c=new ki(r,this,e)),this._$AV.push(c),d=n[++l]}a!==(d==null?void 0:d.index)&&(r=V.nextNode(),a++)}return V.currentNode=F,s}v(e){let t=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class Re{constructor(e,t,i,n){var s;this.type=2,this._$AH=R,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=n,this._$Cp=(s=n==null?void 0:n.isConnected)===null||s===void 0||s}get _$AU(){var e,t;return(t=(e=this._$AM)===null||e===void 0?void 0:e._$AU)!==null&&t!==void 0?t:this._$Cp}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=te(this,e,t),ge(e)?e===R||e==null||e===""?(this._$AH!==R&&this._$AR(),this._$AH=R):e!==this._$AH&&e!==ee&&this._(e):e._$litType$!==void 0?this.g(e):e.nodeType!==void 0?this.$(e):vi(e)?this.T(e):this._(e)}k(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}$(e){this._$AH!==e&&(this._$AR(),this._$AH=this.k(e))}_(e){this._$AH!==R&&ge(this._$AH)?this._$AA.nextSibling.data=e:this.$(F.createTextNode(e)),this._$AH=e}g(e){var t;const{values:i,_$litType$:n}=e,s=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=be.createElement(Jt(n.h,n.h[0]),this.options)),n);if(((t=this._$AH)===null||t===void 0?void 0:t._$AD)===s)this._$AH.v(i);else{const r=new wi(s,this),a=r.u(this.options);r.v(i),this.$(a),this._$AH=r}}_$AC(e){let t=Dt.get(e.strings);return t===void 0&&Dt.set(e.strings,t=new be(e)),t}T(e){Zt(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,n=0;for(const s of e)n===t.length?t.push(i=new Re(this.k(fe()),this.k(fe()),this,this.options)):i=t[n],i._$AI(s),n++;n<t.length&&(this._$AR(i&&i._$AB.nextSibling,n),t.length=n)}_$AR(e=this._$AA.nextSibling,t){var i;for((i=this._$AP)===null||i===void 0||i.call(this,!1,!0,t);e&&e!==this._$AB;){const n=e.nextSibling;e.remove(),e=n}}setConnected(e){var t;this._$AM===void 0&&(this._$Cp=e,(t=this._$AP)===null||t===void 0||t.call(this,e))}}class De{constructor(e,t,i,n,s){this.type=1,this._$AH=R,this._$AN=void 0,this.element=e,this.name=t,this._$AM=n,this.options=s,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=R}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(e,t=this,i,n){const s=this.strings;let r=!1;if(s===void 0)e=te(this,e,t,0),r=!ge(e)||e!==this._$AH&&e!==ee,r&&(this._$AH=e);else{const a=e;let l,d;for(e=s[0],l=0;l<s.length-1;l++)d=te(this,a[i+l],t,l),d===ee&&(d=this._$AH[l]),r||(r=!ge(d)||d!==this._$AH[l]),d===R?e=R:e!==R&&(e+=(d??"")+s[l+1]),this._$AH[l]=d}r&&!n&&this.j(e)}j(e){e===R?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class $i extends De{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===R?void 0:e}}const xi=Q?Q.emptyScript:"";class _i extends De{constructor(){super(...arguments),this.type=4}j(e){e&&e!==R?this.element.setAttribute(this.name,xi):this.element.removeAttribute(this.name)}}class Ri extends De{constructor(e,t,i,n,s){super(e,t,i,n,s),this.type=5}_$AI(e,t=this){var i;if((e=(i=te(this,e,t,0))!==null&&i!==void 0?i:R)===ee)return;const n=this._$AH,s=e===R&&n!==R||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,r=e!==R&&(n===R||s);s&&this.element.removeEventListener(this.name,this,n),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t,i;typeof this._$AH=="function"?this._$AH.call((i=(t=this.options)===null||t===void 0?void 0:t.host)!==null&&i!==void 0?i:this.element,e):this._$AH.handleEvent(e)}}class ki{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){te(this,e)}}const Wt=Me.litHtmlPolyfillSupport;Wt==null||Wt(be,Re),((et=Me.litHtmlVersions)!==null&&et!==void 0?et:Me.litHtmlVersions=[]).push("2.8.0");const Si=(o,e,t)=>{var i,n;const s=(i=t==null?void 0:t.renderBefore)!==null&&i!==void 0?i:e;let r=s._$litPart$;if(r===void 0){const a=(n=t==null?void 0:t.renderBefore)!==null&&n!==void 0?n:null;s._$litPart$=r=new Re(e.insertBefore(fe(),a),a,void 0,t??{})}return r._$AI(o),r};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var it,st;class I extends J{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e,t;const i=super.createRenderRoot();return(e=(t=this.renderOptions).renderBefore)!==null&&e!==void 0||(t.renderBefore=i.firstChild),i}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Si(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)===null||e===void 0||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)===null||e===void 0||e.setConnected(!1)}render(){return ee}}I.finalized=!0,I._$litElement$=!0,(it=globalThis.litElementHydrateSupport)===null||it===void 0||it.call(globalThis,{LitElement:I});const Ut=globalThis.litElementPolyfillSupport;Ut==null||Ut({LitElement:I});((st=globalThis.litElementVersions)!==null&&st!==void 0?st:globalThis.litElementVersions=[]).push("3.3.3");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const b=o=>e=>typeof e=="function"?((t,i)=>(customElements.define(t,i),i))(o,e):((t,i)=>{const{kind:n,elements:s}=i;return{kind:n,elements:s,finisher(r){customElements.define(t,r)}}})(o,e);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Oi=(o,e)=>e.kind==="method"&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(t){t.createProperty(e.key,o)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){typeof e.initializer=="function"&&(this[e.key]=e.initializer.call(this))},finisher(t){t.createProperty(e.key,o)}},Ai=(o,e,t)=>{e.constructor.createProperty(t,o)};function h(o){return(e,t)=>t!==void 0?Ai(o,e,t):Oi(o,e)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function Ci(o){return h({...o,state:!0})}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ei=({finisher:o,descriptor:e})=>(t,i)=>{var n;if(i===void 0){const s=(n=t.originalKey)!==null&&n!==void 0?n:t.key,r=e!=null?{kind:"method",placement:"prototype",key:s,descriptor:e(t.key)}:{...t,key:s};return o!=null&&(r.finisher=function(a){o(a,s)}),r}{const s=t.constructor;e!==void 0&&Object.defineProperty(t,i,e(i)),o==null||o(s,i)}};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function _(o,e){return Ei({descriptor:t=>{const i={get(){var n,s;return(s=(n=this.renderRoot)===null||n===void 0?void 0:n.querySelector(o))!==null&&s!==void 0?s:null},enumerable:!0,configurable:!0};if(e){const n=typeof t=="symbol"?Symbol():"__"+t;i.get=function(){var s,r;return this[n]===void 0&&(this[n]=(r=(s=this.renderRoot)===null||s===void 0?void 0:s.querySelector(o))!==null&&r!==void 0?r:null),this[n]}}return i}})}/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var nt;((nt=window.HTMLSlotElement)===null||nt===void 0?void 0:nt.prototype.assignedElements)!=null;var Ti=globalThis&&globalThis.__decorate||function(o,e,t,i){var n=arguments.length,s=n<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(o,e,t,i);else for(var a=o.length-1;a>=0;a--)(r=o[a])&&(s=(n<3?r(s):n>3?r(e,t,s):r(e,t))||s);return n>3&&s&&Object.defineProperty(e,t,s),s},ji=globalThis&&globalThis.__metadata||function(o,e){if(typeof Reflect=="object"&&typeof Reflect.metadata=="function")return Reflect.metadata(o,e)};const w=g`
:host {
  opacity: 0;
}
:host(.wired-rendered) {
  opacity: 1;
}
#overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}
svg {
  display: block;
}
path {
  stroke: currentColor;
  stroke-width: 0.7;
  fill: transparent;
}
.hidden {
  display: none !important;
}
`;class $ extends I{constructor(){super(...arguments),this.lastSize=[0,0],this.seed=Math.floor(Math.random()*2**31)}updated(e){this.wiredRender()}wiredRender(e=!1){if(this.svg){const t=this.canvasSize();if(!e&&t[0]===this.lastSize[0]&&t[1]===this.lastSize[1])return;for(;this.svg.hasChildNodes();)this.svg.removeChild(this.svg.lastChild);this.svg.setAttribute("width",`${t[0]}`),this.svg.setAttribute("height",`${t[1]}`),this.draw(this.svg,t),this.lastSize=t,this.classList.add("wired-rendered")}}fire(e,t){bt(this,e,t)}}Ti([_("svg"),ji("design:type",SVGSVGElement)],$.prototype,"svg",void 0);function zi(){return Math.floor(Math.random()*2**31)}function bt(o,e,t){o.dispatchEvent(new CustomEvent(e,{composed:!0,bubbles:!0,detail:t}))}function dt(o,e,t){if(o&&o.length){const[i,n]=e,s=Math.PI/180*t,r=Math.cos(s),a=Math.sin(s);o.forEach(l=>{const[d,c]=l;l[0]=(d-i)*r-(c-n)*a+i,l[1]=(d-i)*a+(c-n)*r+n})}}function Mi(o,e,t){const i=[];o.forEach(n=>i.push(...n)),dt(i,e,t)}function ce(o){const e=o[0],t=o[1];return Math.sqrt(Math.pow(e[0]-t[0],2)+Math.pow(e[1]-t[1],2))}function Pi(o,e,t,i){const n=e[1]-o[1],s=o[0]-e[0],r=n*o[0]+s*o[1],a=i[1]-t[1],l=t[0]-i[0],d=a*t[0]+l*t[1],c=n*l-a*s;return c?[(l*r-s*d)/c,(n*d-a*r)/c]:null}function ot(o,e,t){const i=o.length;if(i<3)return!1;const n=[Number.MAX_SAFE_INTEGER,t],s=[e,t];let r=0;for(let a=0;a<i;a++){const l=o[a],d=o[(a+1)%i];if(Qt(l,d,s,n)){if(ue(l,s,d)===0)return pe(l,s,d);r++}}return r%2===1}function pe(o,e,t){return e[0]<=Math.max(o[0],t[0])&&e[0]>=Math.min(o[0],t[0])&&e[1]<=Math.max(o[1],t[1])&&e[1]>=Math.min(o[1],t[1])}function ue(o,e,t){const i=(e[1]-o[1])*(t[0]-e[0])-(e[0]-o[0])*(t[1]-e[1]);return i===0?0:i>0?1:2}function Qt(o,e,t,i){const n=ue(o,e,t),s=ue(o,e,i),r=ue(t,i,o),a=ue(t,i,e);return!!(n!==s&&r!==a||n===0&&pe(o,t,e)||s===0&&pe(o,i,e)||r===0&&pe(t,o,i)||a===0&&pe(t,e,i))}function Ii(o,e){const t=[0,0],i=Math.round(e.hachureAngle+90);i&&dt(o,t,i);const n=Li(o,e);return i&&(dt(o,t,-i),Mi(n,t,-i)),n}function Li(o,e){const t=[...o];t[0].join(",")!==t[t.length-1].join(",")&&t.push([t[0][0],t[0][1]]);const i=[];if(t&&t.length>2){let n=e.hachureGap;n<0&&(n=e.strokeWidth*4),n=Math.max(n,.1);const s=[];for(let l=0;l<t.length-1;l++){const d=t[l],c=t[l+1];if(d[1]!==c[1]){const p=Math.min(d[1],c[1]);s.push({ymin:p,ymax:Math.max(d[1],c[1]),x:p===d[1]?d[0]:c[0],islope:(c[0]-d[0])/(c[1]-d[1])})}}if(s.sort((l,d)=>l.ymin<d.ymin?-1:l.ymin>d.ymin?1:l.x<d.x?-1:l.x>d.x?1:l.ymax===d.ymax?0:(l.ymax-d.ymax)/Math.abs(l.ymax-d.ymax)),!s.length)return i;let r=[],a=s[0].ymin;for(;r.length||s.length;){if(s.length){let l=-1;for(let c=0;c<s.length&&!(s[c].ymin>a);c++)l=c;s.splice(0,l+1).forEach(c=>{r.push({s:a,edge:c})})}if(r=r.filter(l=>!(l.edge.ymax<=a)),r.sort((l,d)=>l.edge.x===d.edge.x?0:(l.edge.x-d.edge.x)/Math.abs(l.edge.x-d.edge.x)),r.length>1)for(let l=0;l<r.length;l=l+2){const d=l+1;if(d>=r.length)break;const c=r[l].edge,p=r[d].edge;i.push([[Math.round(c.x),a],[Math.round(p.x),a]])}a+=n,r.forEach(l=>{l.edge.x=l.edge.x+n*l.edge.islope})}}return i}class Ni{constructor(e){this.helper=e}fillPolygon(e,t){return this._fillPolygon(e,t)}_fillPolygon(e,t,i=!1){let n=Ii(e,t);if(i){const r=this.connectingLines(e,n);n=n.concat(r)}return{type:"fillSketch",ops:this.renderLines(n,t)}}renderLines(e,t){const i=[];for(const n of e)i.push(...this.helper.doubleLineOps(n[0][0],n[0][1],n[1][0],n[1][1],t));return i}connectingLines(e,t){const i=[];if(t.length>1)for(let n=1;n<t.length;n++){const s=t[n-1];if(ce(s)<3)continue;const a=[t[n][0],s[1]];if(ce(a)>3){const l=this.splitOnIntersections(e,a);i.push(...l)}}return i}midPointInPolygon(e,t){return ot(e,(t[0][0]+t[1][0])/2,(t[0][1]+t[1][1])/2)}splitOnIntersections(e,t){const i=Math.max(5,ce(t)*.1),n=[];for(let s=0;s<e.length;s++){const r=e[s],a=e[(s+1)%e.length];if(Qt(r,a,...t)){const l=Pi(r,a,t[0],t[1]);if(l){const d=ce([l,t[0]]),c=ce([l,t[1]]);d>i&&c>i&&n.push({point:l,distance:d})}}}if(n.length>1){const s=n.sort((l,d)=>l.distance-d.distance).map(l=>l.point);if(ot(e,...t[0])||s.shift(),ot(e,...t[1])||s.pop(),s.length<=1)return this.midPointInPolygon(e,t)?[t]:[];const r=[t[0],...s,t[1]],a=[];for(let l=0;l<r.length-1;l+=2){const d=[r[l],r[l+1]];this.midPointInPolygon(e,d)&&a.push(d)}return a}else return this.midPointInPolygon(e,t)?[t]:[]}}class Bi extends Ni{fillPolygon(e,t){return this._fillPolygon(e,t,!0)}}class Hi{constructor(e){this.seed=e}next(){return this.seed?(2**31-1&(this.seed=Math.imul(48271,this.seed)))/2**31:Math.random()}}function ei(o,e,t,i,n){return{type:"path",ops:ve(o,e,t,i,n)}}function Di(o,e,t){const i=(o||[]).length;if(i>2){const n=[];for(let s=0;s<i-1;s++)n.push(...ve(o[s][0],o[s][1],o[s+1][0],o[s+1][1],t));return e&&n.push(...ve(o[i-1][0],o[i-1][1],o[0][0],o[0][1],t)),{type:"path",ops:n}}else if(i===2)return ei(o[0][0],o[0][1],o[1][0],o[1][1],t);return{type:"path",ops:[]}}function ti(o,e){return Di(o,!0,e)}function Wi(o,e,t,i,n){const s=[[o,e],[o+t,e],[o+t,e+i],[o,e+i]];return ti(s,n)}function ii(o,e,t,i,n){const s=si(t,i,n);return Ui(o,e,n,s).opset}function si(o,e,t){const i=Math.sqrt(Math.PI*2*Math.sqrt((Math.pow(o/2,2)+Math.pow(e/2,2))/2)),n=Math.max(t.curveStepCount,t.curveStepCount/Math.sqrt(200)*i),s=Math.PI*2/n;let r=Math.abs(o/2),a=Math.abs(e/2);const l=1-t.curveFitting;return r+=y(r*l,t),a+=y(a*l,t),{increment:s,rx:r,ry:a}}function Ui(o,e,t,i){const[n,s]=qt(i.increment,o,e,i.rx,i.ry,1,i.increment*ht(.1,ht(.4,1,t),t),t);let r=Ft(n,null,t);if(!t.disableMultiStroke&&t.roughness!==0){const[a]=qt(i.increment,o,e,i.rx,i.ry,1.5,0,t),l=Ft(a,null,t);r=r.concat(l)}return{estimatedPoints:s,opset:{type:"path",ops:r}}}function Vi(o,e,t,i,n){return ve(o,e,t,i,n,!0)}function ni(o){return o.randomizer||(o.randomizer=new Hi(o.seed||0)),o.randomizer.next()}function ht(o,e,t,i=1){return t.roughness*i*(ni(t)*(e-o)+o)}function y(o,e,t=1){return ht(-o,o,e,t)}function ve(o,e,t,i,n,s=!1){const r=s?n.disableMultiStrokeFill:n.disableMultiStroke,a=Vt(o,e,t,i,n,!0,!1);if(r)return a;const l=Vt(o,e,t,i,n,!0,!0);return a.concat(l)}function Vt(o,e,t,i,n,s,r){const a=Math.pow(o-t,2)+Math.pow(e-i,2),l=Math.sqrt(a);let d=1;l<200?d=1:l>500?d=.4:d=-.0016668*l+1.233334;let c=n.maxRandomnessOffset||0;c*c*100>a&&(c=l/10);const p=c/2,f=.2+ni(n)*.2;let v=n.bowing*n.maxRandomnessOffset*(i-e)/200,j=n.bowing*n.maxRandomnessOffset*(o-t)/200;v=y(v,n,d),j=y(j,n,d);const P=[],L=()=>y(p,n,d),X=()=>y(c,n,d),N=n.preserveVertices;return s&&(r?P.push({op:"move",data:[o+(N?0:L()),e+(N?0:L())]}):P.push({op:"move",data:[o+(N?0:y(c,n,d)),e+(N?0:y(c,n,d))]})),r?P.push({op:"bcurveTo",data:[v+o+(t-o)*f+L(),j+e+(i-e)*f+L(),v+o+2*(t-o)*f+L(),j+e+2*(i-e)*f+L(),t+(N?0:L()),i+(N?0:L())]}):P.push({op:"bcurveTo",data:[v+o+(t-o)*f+X(),j+e+(i-e)*f+X(),v+o+2*(t-o)*f+X(),j+e+2*(i-e)*f+X(),t+(N?0:X()),i+(N?0:X())]}),P}function Ft(o,e,t){const i=o.length,n=[];if(i>3){const s=[],r=1-t.curveTightness;n.push({op:"move",data:[o[1][0],o[1][1]]});for(let a=1;a+2<i;a++){const l=o[a];s[0]=[l[0],l[1]],s[1]=[l[0]+(r*o[a+1][0]-r*o[a-1][0])/6,l[1]+(r*o[a+1][1]-r*o[a-1][1])/6],s[2]=[o[a+1][0]+(r*o[a][0]-r*o[a+2][0])/6,o[a+1][1]+(r*o[a][1]-r*o[a+2][1])/6],s[3]=[o[a+1][0],o[a+1][1]],n.push({op:"bcurveTo",data:[s[1][0],s[1][1],s[2][0],s[2][1],s[3][0],s[3][1]]})}if(e&&e.length===2){const a=t.maxRandomnessOffset;n.push({op:"lineTo",data:[e[0]+y(a,t),e[1]+y(a,t)]})}}else i===3?(n.push({op:"move",data:[o[1][0],o[1][1]]}),n.push({op:"bcurveTo",data:[o[1][0],o[1][1],o[2][0],o[2][1],o[2][0],o[2][1]]})):i===2&&n.push(...ve(o[0][0],o[0][1],o[1][0],o[1][1],t));return n}function qt(o,e,t,i,n,s,r,a){const l=[],d=[],c=y(.5,a)-Math.PI/2,p=a.roughness===0;p||d.push([y(s,a)+e+.9*i*Math.cos(c-o),y(s,a)+t+.9*n*Math.sin(c-o)]);const f=Math.PI*2+(p?0:c-.01);for(let v=c;v<f;v=v+o){const j=[y(s,a)+e+i*Math.cos(v),y(s,a)+t+n*Math.sin(v)];l.push(j),d.push(j)}return p||(d.push([y(s,a)+e+i*Math.cos(c+Math.PI*2+r*.5),y(s,a)+t+n*Math.sin(c+Math.PI*2+r*.5)]),d.push([y(s,a)+e+.98*i*Math.cos(c+r),y(s,a)+t+.98*n*Math.sin(c+r)]),d.push([y(s,a)+e+.9*i*Math.cos(c+r*.5),y(s,a)+t+.9*n*Math.sin(c+r*.5)])),[d,l]}const Fi={randOffset(o,e){return o},randOffsetWithRange(o,e,t){return(o+e)/2},ellipse(o,e,t,i,n){return ii(o,e,t,i,n)},doubleLineOps(o,e,t,i,n){return Vi(o,e,t,i,n)}};function oe(o){return{maxRandomnessOffset:2,roughness:1,bowing:.85,stroke:"#000",strokeWidth:1.5,curveTightness:0,curveFitting:.95,curveStepCount:9,fillStyle:"hachure",fillWeight:3.5,hachureAngle:-41,hachureGap:5,dashOffset:-1,dashGap:-1,zigzagOffset:0,combineNestedSvgPaths:!1,disableMultiStroke:!1,disableMultiStrokeFill:!1,seed:o}}function qi(o,e){let t="";for(const i of o.ops){const n=i.data;switch(i.op){case"move":if(e&&t)break;t+=`M${n[0]} ${n[1]} `;break;case"bcurveTo":t+=`C${n[0]} ${n[1]}, ${n[2]} ${n[3]}, ${n[4]} ${n[5]} `;break;case"lineTo":t+=`L${n[0]} ${n[1]} `;break}}return t.trim()}function ie(o,e){const t=document.createElementNS("http://www.w3.org/2000/svg",o);if(e)for(const i in e)t.setAttributeNS(null,i,e[i]);return t}function ke(o,e,t=!1){const i=ie("path",{d:qi(o,t)});return e&&e.appendChild(i),i}function O(o,e,t,i,n,s){return ke(Wi(e+2,t+2,i-4,n-4,oe(s)),o)}function m(o,e,t,i,n,s){return ke(ei(e,t,i,n,oe(s)),o)}function Gi(o,e,t){return ke(ti(e,oe(t)),o,!0)}function q(o,e,t,i,n,s){return i=Math.max(i>10?i-4:i-1,1),n=Math.max(n>10?n-4:n-1,1),ke(ii(e,t,i,n,oe(s)),o)}function We(o,e){const i=new Bi(Fi).fillPolygon(o,oe(e));return ke(i,null)}function vt(o,e,t,i,n){const s=oe(n),r=si(t,i,s),a=[];let l=0;for(;l<=Math.PI*2;)a.push([o+r.rx*Math.cos(l),e+r.ry*Math.sin(l)]),l+=r.increment;return We(a,n)}var Ue=globalThis&&globalThis.__decorate||function(o,e,t,i){var n=arguments.length,s=n<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(o,e,t,i);else for(var a=o.length-1;a>=0;a--)(r=o[a])&&(s=(n<3?r(s):n>3?r(e,t,s):r(e,t))||s);return n>3&&s&&Object.defineProperty(e,t,s),s},Ve=globalThis&&globalThis.__metadata||function(o,e){if(typeof Reflect=="object"&&typeof Reflect.metadata=="function")return Reflect.metadata(o,e)};let ye=class extends ${constructor(){super(),this.elevation=1,this.disabled=!1,this.roAttached=!1,window.ResizeObserver&&(this.ro=new window.ResizeObserver(()=>{this.svg&&this.wiredRender(!0)}))}static get styles(){return[w,g`
        :host {
          display: inline-block;
          font-size: 14px;
        }
        path {
          transition: transform 0.05s ease;
        }
        button {
          position: relative;
          user-select: none;
          border: none;
          background: none;
          font-family: inherit;
          font-size: inherit;
          cursor: pointer;
          letter-spacing: 1.25px;
          text-transform: uppercase;
          text-align: center;
          padding: 10px;
          color: inherit;
          outline: none;
        }
        button[disabled] {
          opacity: 0.6 !important;
          background: rgba(0, 0, 0, 0.07);
          cursor: default;
          pointer-events: none;
        }
        button:active path {
          transform: scale(0.97) translate(1.5%, 1.5%);
        }
        button:focus path {
          stroke-width: 1.5;
        }
        button::-moz-focus-inner {
          border: 0;
        }
      `]}render(){return u`
    <button ?disabled="${this.disabled}">
      <slot @slotchange="${this.wiredRender}"></slot>
      <div id="overlay">
        <svg></svg>
      </div>
    </button>
    `}focus(){this.button?this.button.focus():super.focus()}canvasSize(){if(this.button){const e=this.button.getBoundingClientRect(),t=Math.min(Math.max(1,this.elevation),5),i=e.width+(t-1)*2,n=e.height+(t-1)*2;return[i,n]}return this.lastSize}draw(e,t){const i=Math.min(Math.max(1,this.elevation),5),n={width:t[0]-(i-1)*2,height:t[1]-(i-1)*2};O(e,0,0,n.width,n.height,this.seed);for(let s=1;s<i;s++)m(e,s*2,n.height+s*2,n.width+s*2,n.height+s*2,this.seed).style.opacity=`${(75-s*10)/100}`,m(e,n.width+s*2,n.height+s*2,n.width+s*2,s*2,this.seed).style.opacity=`${(75-s*10)/100}`,m(e,s*2,n.height+s*2,n.width+s*2,n.height+s*2,this.seed).style.opacity=`${(75-s*10)/100}`,m(e,n.width+s*2,n.height+s*2,n.width+s*2,s*2,this.seed).style.opacity=`${(75-s*10)/100}`}updated(){super.updated(),this.roAttached||this.attachResizeListener()}disconnectedCallback(){this.detachResizeListener()}attachResizeListener(){this.button&&this.ro&&(this.ro.observe(this.button),this.roAttached=!0)}detachResizeListener(){this.button&&this.ro&&this.ro.unobserve(this.button),this.roAttached=!1}};Ue([h({type:Number}),Ve("design:type",Object)],ye.prototype,"elevation",void 0);Ue([h({type:Boolean,reflect:!0}),Ve("design:type",Object)],ye.prototype,"disabled",void 0);Ue([_("button"),Ve("design:type",HTMLButtonElement)],ye.prototype,"button",void 0);ye=Ue([b("wired-button"),Ve("design:paramtypes",[])],ye);var yt=globalThis&&globalThis.__decorate||function(o,e,t,i){var n=arguments.length,s=n<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(o,e,t,i);else for(var a=o.length-1;a>=0;a--)(r=o[a])&&(s=(n<3?r(s):n>3?r(e,t,s):r(e,t))||s);return n>3&&s&&Object.defineProperty(e,t,s),s},mt=globalThis&&globalThis.__metadata||function(o,e){if(typeof Reflect=="object"&&typeof Reflect.metadata=="function")return Reflect.metadata(o,e)};let me=class extends ${constructor(){super(),this.elevation=1,this.roAttached=!1,window.ResizeObserver&&(this.resizeObserver=new window.ResizeObserver(()=>{this.svg&&this.wiredRender()}))}static get styles(){return[w,g`
        :host {
          display: inline-block;
          position: relative;
          padding: 10px;
        }
        path.cardFill {
          stroke-width: 3.5;
          stroke: var(--wired-card-background-fill);
        }
        path {
          stroke: var(--wired-card-background-fill, currentColor);
        }
      `]}render(){return u`
    <div id="overlay"><svg></svg></div>
    <div style="position: relative;">
      <slot @slotchange="${this.wiredRender}"></slot>
    </div>
    `}updated(e){const t=e.has("fill");this.wiredRender(t),this.attachResizeListener()}disconnectedCallback(){this.detachResizeListener()}attachResizeListener(){this.roAttached||(this.resizeObserver?this.resizeObserver.observe(this):this.windowResizeHandler||(this.windowResizeHandler=()=>this.wiredRender(),window.addEventListener("resize",this.windowResizeHandler,{passive:!0})),this.roAttached=!0)}detachResizeListener(){this.resizeObserver&&this.resizeObserver.unobserve(this),this.windowResizeHandler&&window.removeEventListener("resize",this.windowResizeHandler),this.roAttached=!1}canvasSize(){const e=this.getBoundingClientRect(),t=Math.min(Math.max(1,this.elevation),5),i=e.width+(t-1)*2,n=e.height+(t-1)*2;return[i,n]}draw(e,t){const i=Math.min(Math.max(1,this.elevation),5),n={width:t[0]-(i-1)*2,height:t[1]-(i-1)*2};if(this.fill&&this.fill.trim()){const s=We([[2,2],[n.width-4,2],[n.width-2,n.height-4],[2,n.height-4]],this.seed);s.classList.add("cardFill"),e.style.setProperty("--wired-card-background-fill",this.fill.trim()),e.appendChild(s)}O(e,2,2,n.width-4,n.height-4,this.seed);for(let s=1;s<i;s++)m(e,s*2,n.height-4+s*2,n.width-4+s*2,n.height-4+s*2,this.seed).style.opacity=`${(85-s*10)/100}`,m(e,n.width-4+s*2,n.height-4+s*2,n.width-4+s*2,s*2,this.seed).style.opacity=`${(85-s*10)/100}`,m(e,s*2,n.height-4+s*2,n.width-4+s*2,n.height-4+s*2,this.seed).style.opacity=`${(85-s*10)/100}`,m(e,n.width-4+s*2,n.height-4+s*2,n.width-4+s*2,s*2,this.seed).style.opacity=`${(85-s*10)/100}`}};yt([h({type:Number}),mt("design:type",Object)],me.prototype,"elevation",void 0);yt([h({type:String}),mt("design:type",String)],me.prototype,"fill",void 0);me=yt([b("wired-card"),mt("design:paramtypes",[])],me);var Se=globalThis&&globalThis.__decorate||function(o,e,t,i){var n=arguments.length,s=n<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(o,e,t,i);else for(var a=o.length-1;a>=0;a--)(r=o[a])&&(s=(n<3?r(s):n>3?r(e,t,s):r(e,t))||s);return n>3&&s&&Object.defineProperty(e,t,s),s},Fe=globalThis&&globalThis.__metadata||function(o,e){if(typeof Reflect=="object"&&typeof Reflect.metadata=="function")return Reflect.metadata(o,e)};let se=class extends ${constructor(){super(...arguments),this.checked=!1,this.disabled=!1,this.focused=!1}static get styles(){return[w,g`
      :host {
        display: inline-block;
        font-family: inherit;
      }
      :host([disabled]) {
        opacity: 0.6 !important;
        cursor: default;
        pointer-events: none;
      }
      :host([disabled]) svg {
        background: rgba(0, 0, 0, 0.07);
      }

      #container {
        display: flex;
        flex-direction: row;
        position: relative;
        user-select: none;
        min-height: 24px;
        cursor: pointer;
      }
      span {
        margin-left: 1.5ex;
        line-height: 24px;
      }
      input {
        opacity: 0;
      }
      path {
        stroke: var(--wired-checkbox-icon-color, currentColor);
        stroke-width: var(--wired-checkbox-default-swidth, 0.7);
      }
      g path {
        stroke-width: 2.5;
      }
      #container.focused {
        --wired-checkbox-default-swidth: 1.5;
      }
      `]}focus(){this.input?this.input.focus():super.focus()}wiredRender(e=!1){super.wiredRender(e),this.refreshCheckVisibility()}render(){return u`
    <label id="container" class="${this.focused?"focused":""}">
      <input type="checkbox" .checked="${this.checked}" ?disabled="${this.disabled}" 
        @change="${this.onChange}"
        @focus="${()=>this.focused=!0}"
        @blur="${()=>this.focused=!1}">
      <span><slot></slot></span>
      <div id="overlay"><svg></svg></div>
    </label>
    `}onChange(){this.checked=this.input.checked,this.refreshCheckVisibility(),this.fire("change",{checked:this.checked})}canvasSize(){return[24,24]}draw(e,t){O(e,0,0,t[0],t[1],this.seed),this.svgCheck=ie("g"),e.appendChild(this.svgCheck),m(this.svgCheck,t[0]*.3,t[1]*.4,t[0]*.5,t[1]*.7,this.seed),m(this.svgCheck,t[0]*.5,t[1]*.7,t[0]+5,-5,this.seed)}refreshCheckVisibility(){this.svgCheck&&(this.svgCheck.style.display=this.checked?"":"none")}};Se([h({type:Boolean}),Fe("design:type",Object)],se.prototype,"checked",void 0);Se([h({type:Boolean,reflect:!0}),Fe("design:type",Object)],se.prototype,"disabled",void 0);Se([Ci(),Fe("design:type",Object)],se.prototype,"focused",void 0);Se([_("input"),Fe("design:type",HTMLInputElement)],se.prototype,"input",void 0);se=Se([b("wired-checkbox")],se);var qe=globalThis&&globalThis.__decorate||function(o,e,t,i){var n=arguments.length,s=n<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(o,e,t,i);else for(var a=o.length-1;a>=0;a--)(r=o[a])&&(s=(n<3?r(s):n>3?r(e,t,s):r(e,t))||s);return n>3&&s&&Object.defineProperty(e,t,s),s},wt=globalThis&&globalThis.__metadata||function(o,e){if(typeof Reflect=="object"&&typeof Reflect.metadata=="function")return Reflect.metadata(o,e)};let we=class extends ${constructor(){super(...arguments),this.value="",this.name="",this.selected=!1}static get styles(){return[w,g`
      :host {
        display: inline-block;
        font-size: 14px;
        text-align: left;
      }
      button {
        cursor: pointer;
        outline: none;
        overflow: hidden;
        color: inherit;
        user-select: none;
        position: relative;
        font-family: inherit;
        text-align: inherit;
        font-size: inherit;
        letter-spacing: 1.25px;
        padding: 1px 10px;
        min-height: 36px;
        text-transform: inherit;
        background: none;
        border: none;
        transition: background-color 0.3s ease, color 0.3s ease;
        width: 100%;
        box-sizing: border-box;
        white-space: nowrap;
      }
      button.selected {
        color: var(--wired-item-selected-color, #fff);
      }
      button::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: currentColor;
        opacity: 0;
      }
      button span {
        display: inline-block;
        transition: transform 0.2s ease;
        position: relative;
      }
      button:active span {
        transform: scale(1.02);
      }
      #overlay {
        display: none;
      }
      button.selected #overlay {
        display: block;
      }
      svg path {
        stroke: var(--wired-item-selected-bg, #000);
        stroke-width: 2.75;
        fill: transparent;
        transition: transform 0.05s ease;
      }
      @media (hover: hover) {
        button:hover::before {
          opacity: 0.05;
        }
      }
      `]}render(){return u`
    <button class="${this.selected?"selected":""}">
      <div id="overlay"><svg></svg></div>
      <span><slot></slot></span>
    </button>`}canvasSize(){const e=this.getBoundingClientRect();return[e.width,e.height]}draw(e,t){const i=We([[0,0],[t[0],0],[t[0],t[1]],[0,t[1]]],this.seed);e.appendChild(i)}};qe([h(),wt("design:type",Object)],we.prototype,"value",void 0);qe([h(),wt("design:type",Object)],we.prototype,"name",void 0);qe([h({type:Boolean}),wt("design:type",Object)],we.prototype,"selected",void 0);we=qe([b("wired-item")],we);var re=globalThis&&globalThis.__decorate||function(o,e,t,i){var n=arguments.length,s=n<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(o,e,t,i);else for(var a=o.length-1;a>=0;a--)(r=o[a])&&(s=(n<3?r(s):n>3?r(e,t,s):r(e,t))||s);return n>3&&s&&Object.defineProperty(e,t,s),s},Oe=globalThis&&globalThis.__metadata||function(o,e){if(typeof Reflect=="object"&&typeof Reflect.metadata=="function")return Reflect.metadata(o,e)};let G=class extends I{constructor(){super(...arguments),this.disabled=!1,this.seed=zi(),this.cardShowing=!1,this.itemNodes=[]}static get styles(){return g`
      :host {
        display: inline-block;
        font-family: inherit;
        position: relative;
        outline: none;
        opacity: 0;
      }
    
      :host(.wired-disabled) {
        opacity: 0.5 !important;
        cursor: default;
        pointer-events: none;
        background: rgba(0, 0, 0, 0.02);
      }
      
      :host(.wired-rendered) {
        opacity: 1;
      }
  
      :host(:focus) path {
        stroke-width: 1.5;
      }
    
      #container {
        white-space: nowrap;
        position: relative;
      }
    
      .inline {
        display: inline-block;
        vertical-align: top
      }
    
      #textPanel {
        min-width: 90px;
        min-height: 18px;
        padding: 8px;
      }
    
      #dropPanel {
        width: 34px;
        cursor: pointer;
      }
    
      .overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
      }
    
      svg {
        display: block;
      }
    
      path {
        stroke: currentColor;
        stroke-width: 0.7;
        fill: transparent;
      }
    
      #card {
        display: block;
        position: absolute;
        background: var(--wired-combo-popup-bg, white);
        z-index: 1;
        box-shadow: 1px 5px 15px -6px rgba(0, 0, 0, 0.8);
        padding: 8px;
      }
  
      ::slotted(wired-item) {
        display: block;
      }
    `}render(){return u`
    <div id="container" @click="${this.onCombo}">
      <div id="textPanel" class="inline">
        <span>${this.value&&this.value.text}</span>
      </div>
      <div id="dropPanel" class="inline"></div>
      <div class="overlay">
        <svg></svg>
      </div>
    </div>
    <wired-card id="card" tabindex="-1" role="listbox" @mousedown="${this.onItemClick}" @touchstart="${this.onItemClick}" style="display: none;">
      <slot id="slot"></slot>
    </wired-card>
    `}refreshDisabledState(){this.disabled?this.classList.add("wired-disabled"):this.classList.remove("wired-disabled"),this.tabIndex=this.disabled?-1:+(this.getAttribute("tabindex")||0)}firstUpdated(){this.setAttribute("role","combobox"),this.setAttribute("aria-haspopup","listbox"),this.refreshSelection(),this.addEventListener("blur",()=>{this.cardShowing&&this.setCardShowing(!1)}),this.addEventListener("keydown",e=>{switch(e.keyCode){case 37:case 38:e.preventDefault(),this.selectPrevious();break;case 39:case 40:e.preventDefault(),this.selectNext();break;case 27:e.preventDefault(),this.cardShowing&&this.setCardShowing(!1);break;case 13:e.preventDefault(),this.setCardShowing(!this.cardShowing);break;case 32:e.preventDefault(),this.cardShowing||this.setCardShowing(!0);break}})}updated(e){e.has("disabled")&&this.refreshDisabledState();const t=this.svg;for(;t.hasChildNodes();)t.removeChild(t.lastChild);const i=this.shadowRoot.getElementById("container").getBoundingClientRect();t.setAttribute("width",`${i.width}`),t.setAttribute("height",`${i.height}`);const n=this.shadowRoot.getElementById("textPanel").getBoundingClientRect();this.shadowRoot.getElementById("dropPanel").style.minHeight=n.height+"px",O(t,0,0,n.width,n.height,this.seed);const s=n.width-4;O(t,s,0,34,n.height,this.seed);const r=Math.max(0,Math.abs((n.height-24)/2)),a=Gi(t,[[s+8,5+r],[s+26,5+r],[s+17,r+Math.min(n.height,18)]],this.seed);if(a.style.fill="currentColor",a.style.pointerEvents=this.disabled?"none":"auto",a.style.cursor="pointer",this.classList.add("wired-rendered"),this.setAttribute("aria-expanded",`${this.cardShowing}`),!this.itemNodes.length){this.itemNodes=[];const l=this.shadowRoot.getElementById("slot").assignedNodes();if(l&&l.length)for(let d=0;d<l.length;d++){const c=l[d];c.tagName==="WIRED-ITEM"&&(c.setAttribute("role","option"),this.itemNodes.push(c))}}}refreshSelection(){this.lastSelectedItem&&(this.lastSelectedItem.selected=!1,this.lastSelectedItem.removeAttribute("aria-selected"));const t=this.shadowRoot.getElementById("slot").assignedNodes();if(t){let i=null;for(let n=0;n<t.length;n++){const s=t[n];if(s.tagName==="WIRED-ITEM"){const r=s.value||s.getAttribute("value")||"";if(this.selected&&r===this.selected){i=s;break}}}this.lastSelectedItem=i||void 0,this.lastSelectedItem&&(this.lastSelectedItem.selected=!0,this.lastSelectedItem.setAttribute("aria-selected","true")),i?this.value={value:i.value||"",text:i.textContent||""}:this.value=void 0}}setCardShowing(e){this.card&&(this.cardShowing=e,this.card.style.display=e?"":"none",e&&setTimeout(()=>{this.shadowRoot.getElementById("slot").assignedNodes().filter(i=>i.nodeType===Node.ELEMENT_NODE).forEach(i=>{const n=i;n.requestUpdate&&n.requestUpdate()})},10),this.setAttribute("aria-expanded",`${this.cardShowing}`))}onItemClick(e){e.stopPropagation(),this.selected=e.target.value,this.refreshSelection(),this.fireSelected(),setTimeout(()=>{this.setCardShowing(!1)})}fireSelected(){bt(this,"selected",{selected:this.selected})}selectPrevious(){const e=this.itemNodes;if(e.length){let t=-1;for(let i=0;i<e.length;i++)if(e[i]===this.lastSelectedItem){t=i;break}t<0?t=0:t===0?t=e.length-1:t--,this.selected=e[t].value||"",this.refreshSelection(),this.fireSelected()}}selectNext(){const e=this.itemNodes;if(e.length){let t=-1;for(let i=0;i<e.length;i++)if(e[i]===this.lastSelectedItem){t=i;break}t<0||t>=e.length-1?t=0:t++,this.selected=e[t].value||"",this.refreshSelection(),this.fireSelected()}}onCombo(e){e.stopPropagation(),this.setCardShowing(!this.cardShowing)}};re([h({type:Object}),Oe("design:type",Object)],G.prototype,"value",void 0);re([h({type:String,reflect:!0}),Oe("design:type",String)],G.prototype,"selected",void 0);re([h({type:Boolean,reflect:!0}),Oe("design:type",Object)],G.prototype,"disabled",void 0);re([_("svg"),Oe("design:type",SVGSVGElement)],G.prototype,"svg",void 0);re([_("#card"),Oe("design:type",HTMLDivElement)],G.prototype,"card",void 0);G=re([b("wired-combo")],G);var Ge=globalThis&&globalThis.__decorate||function(o,e,t,i){var n=arguments.length,s=n<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(o,e,t,i);else for(var a=o.length-1;a>=0;a--)(r=o[a])&&(s=(n<3?r(s):n>3?r(e,t,s):r(e,t))||s);return n>3&&s&&Object.defineProperty(e,t,s),s},$t=globalThis&&globalThis.__metadata||function(o,e){if(typeof Reflect=="object"&&typeof Reflect.metadata=="function")return Reflect.metadata(o,e)};let $e=class extends I{constructor(){super(...arguments),this.elevation=5,this.open=!1}static get styles(){return g`
      #container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: var(--wired-dialog-z-index, 100);
      }
      #container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.4);
        opacity: 0;
        transition: opacity 0.5s ease;
      }
      #overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        opacity: 0;
        transform: translateY(150px);
        transition: transform 0.5s ease, opacity 0.5s ease;
      }
      .layout.vertical {
        display: -ms-flexbox;
        display: -webkit-flex;
        display: flex;
        -ms-flex-direction: column;
        -webkit-flex-direction: column;
        flex-direction: column;
      }
      .flex {
        -ms-flex: 1 1 0.000000001px;
        -webkit-flex: 1;
        flex: 1;
        -webkit-flex-basis: 0.000000001px;
        flex-basis: 0.000000001px;
      }
      wired-card {
        display: inline-block;
        background: white;
        text-align: left;
      }

      :host([open]) #container {
        pointer-events: auto;
      }
      :host([open]) #container::before {
        opacity: 1;
      }
      :host([open]) #overlay {
        opacity: 1;
        transform: none;
      }
    `}render(){return u`
    <div id="container">
      <div id="overlay" class="vertical layout">
        <div class="flex"></div>
        <div style="text-align: center; padding: 5px;">
          <wired-card .elevation="${this.elevation}"><slot></slot></wired-card>
        </div>
        <div class="flex"></div>
      </div>
    </div>
    `}updated(){this.card&&this.card.wiredRender(!0)}};Ge([h({type:Number}),$t("design:type",Object)],$e.prototype,"elevation",void 0);Ge([h({type:Boolean,reflect:!0}),$t("design:type",Object)],$e.prototype,"open",void 0);Ge([_("wired-card"),$t("design:type",me)],$e.prototype,"card",void 0);$e=Ge([b("wired-dialog")],$e);var oi=globalThis&&globalThis.__decorate||function(o,e,t,i){var n=arguments.length,s=n<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(o,e,t,i);else for(var a=o.length-1;a>=0;a--)(r=o[a])&&(s=(n<3?r(s):n>3?r(e,t,s):r(e,t))||s);return n>3&&s&&Object.defineProperty(e,t,s),s},Ki=globalThis&&globalThis.__metadata||function(o,e){if(typeof Reflect=="object"&&typeof Reflect.metadata=="function")return Reflect.metadata(o,e)};let ct=class extends ${constructor(){super(...arguments),this.elevation=1,this.roAttached=!1}static get styles(){return[w,g`
        :host {
          display: block;
          position: relative;
        }
      `]}render(){return u`<svg></svg>`}canvasSize(){const e=this.getBoundingClientRect(),t=Math.min(Math.max(1,this.elevation),5);return[e.width,t*6]}draw(e,t){const i=Math.min(Math.max(1,this.elevation),5);for(let n=0;n<i;n++)m(e,0,n*6+3,t[0],n*6+3,this.seed)}updated(){super.updated(),this.attachResizeListener()}disconnectedCallback(){this.detachResizeListener()}attachResizeListener(){this.roAttached||(this.resizeObserver?this.resizeObserver.observe(this):this.windowResizeHandler||(this.windowResizeHandler=()=>this.wiredRender(),window.addEventListener("resize",this.windowResizeHandler,{passive:!0})),this.roAttached=!0)}detachResizeListener(){this.resizeObserver&&this.resizeObserver.unobserve(this),this.windowResizeHandler&&window.removeEventListener("resize",this.windowResizeHandler),this.roAttached=!1}};oi([h({type:Number}),Ki("design:type",Object)],ct.prototype,"elevation",void 0);ct=oi([b("wired-divider")],ct);var xt=globalThis&&globalThis.__decorate||function(o,e,t,i){var n=arguments.length,s=n<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(o,e,t,i);else for(var a=o.length-1;a>=0;a--)(r=o[a])&&(s=(n<3?r(s):n>3?r(e,t,s):r(e,t))||s);return n>3&&s&&Object.defineProperty(e,t,s),s},ri=globalThis&&globalThis.__metadata||function(o,e){if(typeof Reflect=="object"&&typeof Reflect.metadata=="function")return Reflect.metadata(o,e)};let Pe=class extends ${constructor(){super(...arguments),this.disabled=!1}static get styles(){return[w,g`
        :host {
          display: inline-block;
          font-size: 14px;
          color: #fff;
        }
        button {
          position: relative;
          user-select: none;
          border: none;
          background: none;
          font-family: inherit;
          font-size: inherit;
          cursor: pointer;
          letter-spacing: 1.25px;
          text-transform: uppercase;
          text-align: center;
          padding: 16px;
          color: inherit;
          outline: none;
          border-radius: 50%;
        }
        button[disabled] {
          opacity: 0.6 !important;
          background: rgba(0, 0, 0, 0.07);
          cursor: default;
          pointer-events: none;
        }
        button::-moz-focus-inner {
          border: 0;
        }
        button ::slotted(*) {
          position: relative;
          font-size: var(--wired-icon-size, 24px);
          transition: transform 0.2s ease, opacity 0.2s ease;
          opacity: 0.85;
        }
        path {
          stroke: var(--wired-fab-bg-color, #018786);
          stroke-width: 3;
          fill: transparent;
        }

        button:focus ::slotted(*) {
          opacity: 1;
        }
        button:active ::slotted(*) {
          opacity: 1;
          transform: scale(1.15);
        }
      `]}render(){return u`
    <button ?disabled="${this.disabled}">
      <div id="overlay">
        <svg></svg>
      </div>
      <slot @slotchange="${this.wiredRender}"></slot>
    </button>
    `}canvasSize(){if(this.button){const e=this.button.getBoundingClientRect();return[e.width,e.height]}return this.lastSize}draw(e,t){const i=Math.min(t[0],t[1]),n=vt(i/2,i/2,i,i,this.seed);e.appendChild(n)}};xt([h({type:Boolean,reflect:!0}),ri("design:type",Object)],Pe.prototype,"disabled",void 0);xt([_("button"),ri("design:type",HTMLButtonElement)],Pe.prototype,"button",void 0);Pe=xt([b("wired-fab")],Pe);var _t=globalThis&&globalThis.__decorate||function(o,e,t,i){var n=arguments.length,s=n<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(o,e,t,i);else for(var a=o.length-1;a>=0;a--)(r=o[a])&&(s=(n<3?r(s):n>3?r(e,t,s):r(e,t))||s);return n>3&&s&&Object.defineProperty(e,t,s),s},ai=globalThis&&globalThis.__metadata||function(o,e){if(typeof Reflect=="object"&&typeof Reflect.metadata=="function")return Reflect.metadata(o,e)};let Ie=class extends ${constructor(){super(...arguments),this.disabled=!1}static get styles(){return[w,g`
        :host {
          display: inline-block;
          font-size: 14px;
        }
        path {
          transition: transform 0.05s ease;
        }
        button {
          position: relative;
          user-select: none;
          border: none;
          background: none;
          font-family: inherit;
          font-size: inherit;
          cursor: pointer;
          letter-spacing: 1.25px;
          text-transform: uppercase;
          text-align: center;
          padding: 10px;
          color: inherit;
          outline: none;
          border-radius: 50%;
        }
        button[disabled] {
          opacity: 0.6 !important;
          background: rgba(0, 0, 0, 0.07);
          cursor: default;
          pointer-events: none;
        }
        button:active path {
          transform: scale(0.97) translate(1.5%, 1.5%);
        }
        button:focus path {
          stroke-width: 1.5;
        }
        button::-moz-focus-inner {
          border: 0;
        }
        button ::slotted(*) {
          position: relative;
          font-size: var(--wired-icon-size, 24px);
        }
      `]}render(){return u`
    <button ?disabled="${this.disabled}">
      <slot @slotchange="${this.wiredRender}"></slot>
      <div id="overlay">
        <svg></svg>
      </div>
    </button>
    `}canvasSize(){if(this.button){const e=this.button.getBoundingClientRect();return[e.width,e.height]}return this.lastSize}draw(e,t){const i=Math.min(t[0],t[1]);e.setAttribute("width",`${i}`),e.setAttribute("height",`${i}`),q(e,i/2,i/2,i,i,this.seed)}};_t([h({type:Boolean,reflect:!0}),ai("design:type",Object)],Ie.prototype,"disabled",void 0);_t([_("button"),ai("design:type",HTMLButtonElement)],Ie.prototype,"button",void 0);Ie=_t([b("wired-icon-button")],Ie);var Rt=globalThis&&globalThis.__decorate||function(o,e,t,i){var n=arguments.length,s=n<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(o,e,t,i);else for(var a=o.length-1;a>=0;a--)(r=o[a])&&(s=(n<3?r(s):n>3?r(e,t,s):r(e,t))||s);return n>3&&s&&Object.defineProperty(e,t,s),s},kt=globalThis&&globalThis.__metadata||function(o,e){if(typeof Reflect=="object"&&typeof Reflect.metadata=="function")return Reflect.metadata(o,e)};const Yi="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";let Le=class extends ${constructor(){super(),this.elevation=1,this.src=Yi,this.roAttached=!1,window.ResizeObserver&&(this.resizeObserver=new window.ResizeObserver(()=>{this.svg&&this.wiredRender()}))}static get styles(){return[w,g`
        :host {
          display: inline-block;
          position: relative;
          line-height: 1;
          padding: 3px;
        }
        img {
          display: block;
          box-sizing: border-box;
          max-width: 100%;
          max-height: 100%;
        }
        path {
          stroke-width: 1;
        }
      `]}render(){return u`
    <img src="${this.src}">
    <div id="overlay"><svg></svg></div>
    `}updated(){super.updated(),this.attachResizeListener()}disconnectedCallback(){this.detachResizeListener()}attachResizeListener(){this.roAttached||(this.resizeObserver&&this.resizeObserver.observe?this.resizeObserver.observe(this):this.windowResizeHandler||(this.windowResizeHandler=()=>this.wiredRender(),window.addEventListener("resize",this.windowResizeHandler,{passive:!0})),this.roAttached=!0)}detachResizeListener(){this.resizeObserver&&this.resizeObserver.unobserve&&this.resizeObserver.unobserve(this),this.windowResizeHandler&&window.removeEventListener("resize",this.windowResizeHandler),this.roAttached=!1}canvasSize(){const e=this.getBoundingClientRect(),t=Math.min(Math.max(1,this.elevation),5),i=e.width+(t-1)*2,n=e.height+(t-1)*2;return[i,n]}draw(e,t){const i=Math.min(Math.max(1,this.elevation),5),n={width:t[0]-(i-1)*2,height:t[1]-(i-1)*2};O(e,2,2,n.width-4,n.height-4,this.seed);for(let s=1;s<i;s++)m(e,s*2,n.height-4+s*2,n.width-4+s*2,n.height-4+s*2,this.seed).style.opacity=`${(85-s*10)/100}`,m(e,n.width-4+s*2,n.height-4+s*2,n.width-4+s*2,s*2,this.seed).style.opacity=`${(85-s*10)/100}`,m(e,s*2,n.height-4+s*2,n.width-4+s*2,n.height-4+s*2,this.seed).style.opacity=`${(85-s*10)/100}`,m(e,n.width-4+s*2,n.height-4+s*2,n.width-4+s*2,s*2,this.seed).style.opacity=`${(85-s*10)/100}`}};Rt([h({type:Number}),kt("design:type",Object)],Le.prototype,"elevation",void 0);Rt([h({type:String}),kt("design:type",String)],Le.prototype,"src",void 0);Le=Rt([b("wired-image"),kt("design:paramtypes",[])],Le);var k=globalThis&&globalThis.__decorate||function(o,e,t,i){var n=arguments.length,s=n<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(o,e,t,i);else for(var a=o.length-1;a>=0;a--)(r=o[a])&&(s=(n<3?r(s):n>3?r(e,t,s):r(e,t))||s);return n>3&&s&&Object.defineProperty(e,t,s),s},S=globalThis&&globalThis.__metadata||function(o,e){if(typeof Reflect=="object"&&typeof Reflect.metadata=="function")return Reflect.metadata(o,e)};let x=class extends ${constructor(){super(),this.disabled=!1,this.placeholder="",this.type="text",this.autocomplete="",this.autocapitalize="",this.autocorrect="",this.required=!1,this.autofocus=!1,this.readonly=!1,this.roAttached=!1,window.ResizeObserver&&(this.resizeObserver=new window.ResizeObserver(()=>{this.svg&&this.wiredRender(!0)}))}static get styles(){return[w,g`
        :host {
          display: inline-block;
          position: relative;
          padding: 5px;
          font-family: sans-serif;
          width: 150px;
          outline: none;
        }
        :host([disabled]) {
          opacity: 0.6 !important;
          cursor: default;
          pointer-events: none;
        }
        :host([disabled]) svg {
          background: rgba(0, 0, 0, 0.07);
        }
        input {
          display: block;
          width: 100%;
          box-sizing: border-box;
          outline: none;
          border: none;
          font-family: inherit;
          font-size: inherit;
          font-weight: inherit;
          color: inherit;
          padding: 6px;
        }
        input:focus + div path {
          stroke-width: 1.5;
        }
      `]}render(){return u`
    <input name="${this.name}" type="${this.type}" placeholder="${this.placeholder}" ?disabled="${this.disabled}"
      ?required="${this.required}" autocomplete="${this.autocomplete}" ?autofocus="${this.autofocus}" minlength="${this.minlength}"
      maxlength="${this.maxlength}" min="${this.min}" max="${this.max}" step="${this.step}" ?readonly="${this.readonly}"
      size="${this.size}" autocapitalize="${this.autocapitalize}" autocorrect="${this.autocorrect}" 
      @change="${this.refire}" @input="${this.refire}">
    <div id="overlay">
      <svg></svg>
    </div>
    `}get input(){return this.textInput}get value(){const e=this.input;return e&&e.value||""}set value(e){if(this.shadowRoot){const t=this.input;if(t){t.value=e;return}}this.pendingValue=e}firstUpdated(){this.value=this.pendingValue||this.value||this.getAttribute("value")||"",delete this.pendingValue}canvasSize(){const e=this.getBoundingClientRect();return[e.width,e.height]}draw(e,t){O(e,2,2,t[0]-2,t[1]-2,this.seed)}refire(e){e.stopPropagation(),this.fire(e.type,{sourceEvent:e})}focus(){this.textInput?this.textInput.focus():super.focus()}updated(){super.updated(),this.attachResizeListener()}disconnectedCallback(){this.detachResizeListener()}attachResizeListener(){this.roAttached||(this.textInput&&this.resizeObserver&&this.resizeObserver.observe(this.textInput),this.roAttached=!0)}detachResizeListener(){this.textInput&&this.resizeObserver&&this.resizeObserver.unobserve(this.textInput),this.roAttached=!1}};k([h({type:Boolean,reflect:!0}),S("design:type",Object)],x.prototype,"disabled",void 0);k([h({type:String}),S("design:type",Object)],x.prototype,"placeholder",void 0);k([h({type:String}),S("design:type",String)],x.prototype,"name",void 0);k([h({type:String}),S("design:type",String)],x.prototype,"min",void 0);k([h({type:String}),S("design:type",String)],x.prototype,"max",void 0);k([h({type:String}),S("design:type",String)],x.prototype,"step",void 0);k([h({type:String}),S("design:type",Object)],x.prototype,"type",void 0);k([h({type:String}),S("design:type",Object)],x.prototype,"autocomplete",void 0);k([h({type:String}),S("design:type",Object)],x.prototype,"autocapitalize",void 0);k([h({type:String}),S("design:type",Object)],x.prototype,"autocorrect",void 0);k([h({type:Boolean}),S("design:type",Object)],x.prototype,"required",void 0);k([h({type:Boolean}),S("design:type",Object)],x.prototype,"autofocus",void 0);k([h({type:Boolean}),S("design:type",Object)],x.prototype,"readonly",void 0);k([h({type:Number}),S("design:type",Number)],x.prototype,"minlength",void 0);k([h({type:Number}),S("design:type",Number)],x.prototype,"maxlength",void 0);k([h({type:Number}),S("design:type",Number)],x.prototype,"size",void 0);k([_("input"),S("design:type",HTMLInputElement)],x.prototype,"textInput",void 0);x=k([b("wired-input"),S("design:paramtypes",[])],x);var Ae=globalThis&&globalThis.__decorate||function(o,e,t,i){var n=arguments.length,s=n<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(o,e,t,i);else for(var a=o.length-1;a>=0;a--)(r=o[a])&&(s=(n<3?r(s):n>3?r(e,t,s):r(e,t))||s);return n>3&&s&&Object.defineProperty(e,t,s),s},Ke=globalThis&&globalThis.__metadata||function(o,e){if(typeof Reflect=="object"&&typeof Reflect.metadata=="function")return Reflect.metadata(o,e)};let ne=class extends ${constructor(){super(...arguments),this.elevation=1}static get styles(){return[w,g`
        :host {
          display: inline-block;
          position: relative;
        }
        a, a:hover, a:visited {
          color: inherit;
          outline: none;
          display: inline-block;
          white-space: nowrap;
          text-decoration: none;
          border: none;
        }
        path {
          stroke: var(--wired-link-decoration-color, blue);
          stroke-opacity: 0.45;
        }
        a:focus path {
          stroke-opacity: 1;
        }
      `]}render(){return u`
    <a href="${this.href}" target="${this.target||""}">
      <slot></slot>
      <div id="overlay"><svg></svg></div>
    </a>
    `}focus(){this.anchor?this.anchor.focus():super.focus()}canvasSize(){if(this.anchor){const e=this.anchor.getBoundingClientRect(),t=Math.min(Math.max(1,this.elevation),5),i=e.width,n=e.height+(t-1)*2;return[i,n]}return this.lastSize}draw(e,t){const i=Math.min(Math.max(1,this.elevation),5),n={width:t[0],height:t[1]-(i-1)*2};for(let s=0;s<i;s++)m(e,0,n.height+s*2-2,n.width,n.height+s*2-2,this.seed),m(e,0,n.height+s*2-2,n.width,n.height+s*2-2,this.seed)}};Ae([h({type:Number}),Ke("design:type",Object)],ne.prototype,"elevation",void 0);Ae([h({type:String}),Ke("design:type",String)],ne.prototype,"href",void 0);Ae([h({type:String}),Ke("design:type",String)],ne.prototype,"target",void 0);Ae([_("a"),Ke("design:type",HTMLAnchorElement)],ne.prototype,"anchor",void 0);ne=Ae([b("wired-link")],ne);var Ye=globalThis&&globalThis.__decorate||function(o,e,t,i){var n=arguments.length,s=n<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(o,e,t,i);else for(var a=o.length-1;a>=0;a--)(r=o[a])&&(s=(n<3?r(s):n>3?r(e,t,s):r(e,t))||s);return n>3&&s&&Object.defineProperty(e,t,s),s},St=globalThis&&globalThis.__metadata||function(o,e){if(typeof Reflect=="object"&&typeof Reflect.metadata=="function")return Reflect.metadata(o,e)};let xe=class extends ${constructor(){super(...arguments),this.horizontal=!1,this.itemNodes=[],this.itemClickHandler=this.onItemClick.bind(this)}static get styles(){return[w,g`
      :host {
        display: inline-block;
        font-family: inherit;
        position: relative;
        padding: 5px;
        outline: none;
      }
      :host(:focus) path {
        stroke-width: 1.5;
      }
      ::slotted(wired-item) {
        display: block;
      }
      :host(.wired-horizontal) ::slotted(wired-item) {
        display: inline-block;
      }
      `]}render(){return u`
    <slot id="slot" @slotchange="${()=>this.requestUpdate()}"></slot>
    <div id="overlay">
      <svg id="svg"></svg>
    </div>
    `}firstUpdated(){this.setAttribute("role","listbox"),this.tabIndex=+(this.getAttribute("tabindex")||0),this.refreshSelection(),this.addEventListener("click",this.itemClickHandler),this.addEventListener("keydown",e=>{switch(e.keyCode){case 37:case 38:e.preventDefault(),this.selectPrevious();break;case 39:case 40:e.preventDefault(),this.selectNext();break}})}updated(){if(super.updated(),this.horizontal?this.classList.add("wired-horizontal"):this.classList.remove("wired-horizontal"),!this.itemNodes.length){this.itemNodes=[];const e=this.shadowRoot.getElementById("slot").assignedNodes();if(e&&e.length)for(let t=0;t<e.length;t++){const i=e[t];i.tagName==="WIRED-ITEM"&&(i.setAttribute("role","option"),this.itemNodes.push(i))}}}onItemClick(e){e.stopPropagation(),this.selected=e.target.value,this.refreshSelection(),this.fireSelected()}refreshSelection(){this.lastSelectedItem&&(this.lastSelectedItem.selected=!1,this.lastSelectedItem.removeAttribute("aria-selected"));const t=this.shadowRoot.getElementById("slot").assignedNodes();if(t){let i=null;for(let n=0;n<t.length;n++){const s=t[n];if(s.tagName==="WIRED-ITEM"){const r=s.value||"";if(this.selected&&r===this.selected){i=s;break}}}this.lastSelectedItem=i||void 0,this.lastSelectedItem&&(this.lastSelectedItem.selected=!0,this.lastSelectedItem.setAttribute("aria-selected","true")),i?this.value={value:i.value||"",text:i.textContent||""}:this.value=void 0}}fireSelected(){this.fire("selected",{selected:this.selected})}selectPrevious(){const e=this.itemNodes;if(e.length){let t=-1;for(let i=0;i<e.length;i++)if(e[i]===this.lastSelectedItem){t=i;break}t<0?t=0:t===0?t=e.length-1:t--,this.selected=e[t].value||"",this.refreshSelection(),this.fireSelected()}}selectNext(){const e=this.itemNodes;if(e.length){let t=-1;for(let i=0;i<e.length;i++)if(e[i]===this.lastSelectedItem){t=i;break}t<0||t>=e.length-1?t=0:t++,this.selected=e[t].value||"",this.refreshSelection(),this.fireSelected()}}canvasSize(){const e=this.getBoundingClientRect();return[e.width,e.height]}draw(e,t){O(e,0,0,t[0],t[1],this.seed)}};Ye([h({type:Object}),St("design:type",Object)],xe.prototype,"value",void 0);Ye([h({type:String}),St("design:type",String)],xe.prototype,"selected",void 0);Ye([h({type:Boolean}),St("design:type",Object)],xe.prototype,"horizontal",void 0);xe=Ye([b("wired-listbox")],xe);var Ce=globalThis&&globalThis.__decorate||function(o,e,t,i){var n=arguments.length,s=n<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(o,e,t,i);else for(var a=o.length-1;a>=0;a--)(r=o[a])&&(s=(n<3?r(s):n>3?r(e,t,s):r(e,t))||s);return n>3&&s&&Object.defineProperty(e,t,s),s},Ze=globalThis&&globalThis.__metadata||function(o,e){if(typeof Reflect=="object"&&typeof Reflect.metadata=="function")return Reflect.metadata(o,e)};let K=class extends ${constructor(){super(...arguments),this.value=0,this.min=0,this.max=100,this.percentage=!1}static get styles(){return[w,g`
      :host {
        display: inline-block;
        position: relative;
        width: 400px;
        height: 42px;
        font-family: sans-serif;
      }
      .labelContainer {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .progressLabel {
        color: var(--wired-progress-label-color, #000);
        font-size: var(--wired-progress-font-size, 14px);
        background: var(--wired-progress-label-background, rgba(255,255,255,0.9));
        padding: 2px 6px;
        border-radius: 4px;
        letter-spacing: 1.25px;
      }
      path.progbox {
        stroke: var(--wired-progress-color, rgba(0, 0, 200, 0.8));
        stroke-width: 2.75;
        fill: none;
      }
      .overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
      }
      `]}render(){return u`
    <div id="overlay" class="overlay">
      <svg></svg>
    </div>
    <div class="overlay labelContainer">
      <div class="progressLabel">${this.getProgressLabel()}</div>
    </div>
    `}getProgressLabel(){return this.percentage?this.max===this.min?"%":Math.floor((this.value-this.min)/(this.max-this.min)*100)+"%":""+this.value}wiredRender(e=!1){super.wiredRender(e),this.refreshProgressFill()}canvasSize(){const e=this.getBoundingClientRect();return[e.width,e.height]}draw(e,t){O(e,2,2,t[0]-2,t[1]-2,this.seed)}refreshProgressFill(){if(this.progBox&&(this.progBox.parentElement&&this.progBox.parentElement.removeChild(this.progBox),this.progBox=void 0),this.svg){let e=0;const t=this.getBoundingClientRect();if(this.max>this.min){e=(this.value-this.min)/(this.max-this.min);const i=t.width*Math.max(0,Math.min(e,100));this.progBox=We([[0,0],[i,0],[i,t.height],[0,t.height]],this.seed),this.svg.appendChild(this.progBox),this.progBox.classList.add("progbox")}}}};Ce([h({type:Number}),Ze("design:type",Object)],K.prototype,"value",void 0);Ce([h({type:Number}),Ze("design:type",Object)],K.prototype,"min",void 0);Ce([h({type:Number}),Ze("design:type",Object)],K.prototype,"max",void 0);Ce([h({type:Boolean}),Ze("design:type",Object)],K.prototype,"percentage",void 0);K=Ce([b("wired-progress")],K);var ae=globalThis&&globalThis.__decorate||function(o,e,t,i){var n=arguments.length,s=n<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(o,e,t,i);else for(var a=o.length-1;a>=0;a--)(r=o[a])&&(s=(n<3?r(s):n>3?r(e,t,s):r(e,t))||s);return n>3&&s&&Object.defineProperty(e,t,s),s},Ee=globalThis&&globalThis.__metadata||function(o,e){if(typeof Reflect=="object"&&typeof Reflect.metadata=="function")return Reflect.metadata(o,e)};let Y=class extends ${constructor(){super(...arguments),this.checked=!1,this.disabled=!1,this.focused=!1}static get styles(){return[w,g`
      :host {
        display: inline-block;
        font-family: inherit;
      }
      :host([disabled]) {
        opacity: 0.6 !important;
        cursor: default;
        pointer-events: none;
      }
      :host([disabled]) svg {
        background: rgba(0, 0, 0, 0.07);
      }

      #container {
        display: flex;
        flex-direction: row;
        position: relative;
        user-select: none;
        min-height: 24px;
        cursor: pointer;
      }
      span {
        margin-left: 1.5ex;
        line-height: 24px;
      }
      input {
        opacity: 0;
      }
      path {
        stroke: var(--wired-radio-icon-color, currentColor);
        stroke-width: var(--wired-radio-default-swidth, 0.7);
      }
      g path {
        stroke-width: 0;
        fill: var(--wired-radio-icon-color, currentColor);
      }
      #container.focused {
        --wired-radio-default-swidth: 1.5;
      }
      `]}focus(){this.input?this.input.focus():super.focus()}wiredRender(e=!1){super.wiredRender(e),this.refreshCheckVisibility()}render(){return u`
    <label id="container" class="${this.focused?"focused":""}">
      <input type="checkbox" .checked="${this.checked}" ?disabled="${this.disabled}" 
        @change="${this.onChange}"
        @focus="${()=>this.focused=!0}"
        @blur="${()=>this.focused=!1}">
      <span><slot></slot></span>
      <div id="overlay"><svg></svg></div>
    </label>
    `}onChange(){this.checked=this.input.checked,this.refreshCheckVisibility(),this.fire("change",{checked:this.checked})}canvasSize(){return[24,24]}draw(e,t){q(e,t[0]/2,t[1]/2,t[0],t[1],this.seed),this.svgCheck=ie("g"),e.appendChild(this.svgCheck);const i=Math.max(t[0]*.6,5),n=Math.max(t[1]*.6,5);q(this.svgCheck,t[0]/2,t[1]/2,i,n,this.seed)}refreshCheckVisibility(){this.svgCheck&&(this.svgCheck.style.display=this.checked?"":"none")}};ae([h({type:Boolean}),Ee("design:type",Object)],Y.prototype,"checked",void 0);ae([h({type:Boolean,reflect:!0}),Ee("design:type",Object)],Y.prototype,"disabled",void 0);ae([h({type:String}),Ee("design:type",String)],Y.prototype,"name",void 0);ae([h(),Ee("design:type",Object)],Y.prototype,"focused",void 0);ae([_("input"),Ee("design:type",HTMLInputElement)],Y.prototype,"input",void 0);Y=ae([b("wired-radio")],Y);var li=globalThis&&globalThis.__decorate||function(o,e,t,i){var n=arguments.length,s=n<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(o,e,t,i);else for(var a=o.length-1;a>=0;a--)(r=o[a])&&(s=(n<3?r(s):n>3?r(e,t,s):r(e,t))||s);return n>3&&s&&Object.defineProperty(e,t,s),s},Zi=globalThis&&globalThis.__metadata||function(o,e){if(typeof Reflect=="object"&&typeof Reflect.metadata=="function")return Reflect.metadata(o,e)};let pt=class extends I{constructor(){super(...arguments),this.radioNodes=[],this.checkListener=this.handleChecked.bind(this)}static get styles(){return g`
      :host {
        display: inline-block;
        font-family: inherit;
        outline: none;
      }
      :host ::slotted(*) {
        padding: var(--wired-radio-group-item-padding, 5px);
      }
    `}render(){return u`<slot id="slot" @slotchange="${this.slotChange}"></slot>`}connectedCallback(){super.connectedCallback(),this.addEventListener("change",this.checkListener)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("change",this.checkListener)}handleChecked(e){const t=e.detail.checked,i=e.target,n=i.name||"";t?(this.selected=t&&n||"",this.fireSelected()):i.checked=!0}slotChange(){this.requestUpdate()}firstUpdated(){this.setAttribute("role","radiogroup"),this.tabIndex=+(this.getAttribute("tabindex")||0),this.addEventListener("keydown",e=>{switch(e.keyCode){case 37:case 38:e.preventDefault(),this.selectPrevious();break;case 39:case 40:e.preventDefault(),this.selectNext();break}})}updated(){const t=this.shadowRoot.getElementById("slot").assignedNodes();if(this.radioNodes=[],t&&t.length)for(let i=0;i<t.length;i++){const n=t[i];if(n.tagName==="WIRED-RADIO"){this.radioNodes.push(n);const s=n.name||"";this.selected&&s===this.selected?n.checked=!0:n.checked=!1}}}selectPrevious(){const e=this.radioNodes;if(e.length){let t=null,i=-1;if(this.selected){for(let n=0;n<e.length;n++)if(e[n].name===this.selected){i=n;break}i<0?t=e[0]:(i--,i<0&&(i=e.length-1),t=e[i])}else t=e[0];t&&(t.focus(),this.selected=t.name,this.fireSelected())}}selectNext(){const e=this.radioNodes;if(e.length){let t=null,i=-1;if(this.selected){for(let n=0;n<e.length;n++)if(e[n].name===this.selected){i=n;break}i<0?t=e[0]:(i++,i>=e.length&&(i=0),t=e[i])}else t=e[0];t&&(t.focus(),this.selected=t.name,this.fireSelected())}}fireSelected(){bt(this,"selected",{selected:this.selected})}};li([h({type:String}),Zi("design:type",String)],pt.prototype,"selected",void 0);pt=li([b("wired-radio-group")],pt);var Z=globalThis&&globalThis.__decorate||function(o,e,t,i){var n=arguments.length,s=n<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(o,e,t,i);else for(var a=o.length-1;a>=0;a--)(r=o[a])&&(s=(n<3?r(s):n>3?r(e,t,s):r(e,t))||s);return n>3&&s&&Object.defineProperty(e,t,s),s},le=globalThis&&globalThis.__metadata||function(o,e){if(typeof Reflect=="object"&&typeof Reflect.metadata=="function")return Reflect.metadata(o,e)};let H=class extends ${constructor(){super(...arguments),this.disabled=!1,this.placeholder="",this.autocomplete="",this.autocorrect="",this.autofocus=!1}static get styles(){return[w,g`
        :host {
          display: inline-block;
          position: relative;
          padding: 10px 40px 10px 5px;
          font-family: sans-serif;
          width: 180px;
          outline: none;
        }
        :host([disabled]) {
          opacity: 0.6 !important;
          cursor: default;
          pointer-events: none;
        }
        :host([disabled]) svg {
          background: rgba(0, 0, 0, 0.07);
        }
        input {
          display: block;
          width: 100%;
          box-sizing: border-box;
          outline: none;
          border: none;
          font-family: inherit;
          font-size: inherit;
          font-weight: inherit;
          color: inherit;
          padding: 6px;
        }
        
        input[type=search]::-ms-clear {  display: none; width : 0; height: 0; }
        input[type=search]::-ms-reveal {  display: none; width : 0; height: 0; }
        input[type="search"]::-webkit-search-decoration,
        input[type="search"]::-webkit-search-cancel-button,
        input[type="search"]::-webkit-search-results-button,
        input[type="search"]::-webkit-search-results-decoration {
          display: none;
        }

        .thicker path {
          stroke-width: 1.5;
        }

        button {
          position: absolute;
          top: 0;
          right: 2px;
          width: 32px;
          height: 100%;
          box-sizing: border-box;
          background: none;
          border: none;
          cursor: pointer;
          outline: none;
          opacity: 0;
        }
      `]}render(){return u`
    <input type="search" placeholder="${this.placeholder}" ?disabled="${this.disabled}"
      autocomplete="${this.autocomplete}" ?autofocus="${this.autofocus}" 
      autocapitalize="${this.autocapitalize}" autocorrect="${this.autocorrect}" 
      @change="${this.refire}" @input="${this.refire}">
    <div id="overlay">
      <svg></svg>
    </div>
    <button @click="${()=>this.value=""}"></button>
    `}get input(){return this.textInput}get value(){const e=this.input;return e&&e.value||""}set value(e){if(this.shadowRoot){const t=this.input;t&&(t.value=e),this.refreshIconState()}else this.pendingValue=e}wiredRender(e=!1){super.wiredRender(e),this.refreshIconState()}firstUpdated(){this.value=this.pendingValue||this.value||this.getAttribute("value")||"",delete this.pendingValue}canvasSize(){const e=this.getBoundingClientRect();return[e.width,e.height]}draw(e,t){O(e,2,2,t[0]-2,t[1]-2,this.seed),this.searchIcon=ie("g"),this.searchIcon.classList.add("thicker"),e.appendChild(this.searchIcon),q(this.searchIcon,t[0]-30,(t[1]-30)/2+10,20,20,this.seed),m(this.searchIcon,t[0]-10,(t[1]-30)/2+30,t[0]-25,(t[1]-30)/2+15,this.seed),this.closeIcon=ie("g"),this.closeIcon.classList.add("thicker"),e.appendChild(this.closeIcon),m(this.closeIcon,t[0]-33,(t[1]-30)/2+2,t[0]-7,(t[1]-30)/2+28,this.seed),m(this.closeIcon,t[0]-7,(t[1]-30)/2+2,t[0]-33,(t[1]-30)/2+28,this.seed)}refreshIconState(){this.searchIcon&&this.closeIcon&&(this.searchIcon.style.display=this.value.trim()?"none":"",this.closeIcon.style.display=this.value.trim()?"":"none")}refire(e){this.refreshIconState(),e.stopPropagation(),this.fire(e.type,{sourceEvent:e})}};Z([h({type:Boolean,reflect:!0}),le("design:type",Object)],H.prototype,"disabled",void 0);Z([h({type:String}),le("design:type",Object)],H.prototype,"placeholder",void 0);Z([h({type:String}),le("design:type",Object)],H.prototype,"autocomplete",void 0);Z([h({type:String}),le("design:type",Object)],H.prototype,"autocorrect",void 0);Z([h({type:Boolean}),le("design:type",Object)],H.prototype,"autofocus",void 0);Z([_("input"),le("design:type",HTMLInputElement)],H.prototype,"textInput",void 0);H=Z([b("wired-search-input")],H);var de=globalThis&&globalThis.__decorate||function(o,e,t,i){var n=arguments.length,s=n<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(o,e,t,i);else for(var a=o.length-1;a>=0;a--)(r=o[a])&&(s=(n<3?r(s):n>3?r(e,t,s):r(e,t))||s);return n>3&&s&&Object.defineProperty(e,t,s),s},Te=globalThis&&globalThis.__metadata||function(o,e){if(typeof Reflect=="object"&&typeof Reflect.metadata=="function")return Reflect.metadata(o,e)};let D=class extends ${constructor(){super(...arguments),this.min=0,this.max=100,this.step=1,this.disabled=!1,this.canvasWidth=300}static get styles(){return[w,g`
      :host {
        display: inline-block;
        position: relative;
        width: 300px;
        box-sizing: border-box;
      }
      :host([disabled]) {
        opacity: 0.45 !important;
        cursor: default;
        pointer-events: none;
        background: rgba(0, 0, 0, 0.07);
        border-radius: 5px;
      }
      input[type=range] {
        width: 100%;
        height: 40px;
        box-sizing: border-box;
        margin: 0;
        -webkit-appearance: none;
        background: transparent;
        outline: none;
        position: relative;
      }
      input[type=range]:focus {
        outline: none;
      }
      input[type=range]::-ms-track {
        width: 100%;
        cursor: pointer;
        background: transparent;
        border-color: transparent;
        color: transparent;
      }
      input[type=range]::-moz-focus-outer {
        outline: none;
        border: 0;
      }
      input[type=range]::-moz-range-thumb {
        border-radius: 50px;
        background: none;
        cursor: pointer;
        border: none;
        margin: 0;
        height: 20px;
        width: 20px;
        line-height: 1;
      }
      input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        border-radius: 50px;
        background: none;
        cursor: pointer;
        border: none;
        height: 20px;
        width: 20px;
        margin: 0;
        line-height: 1;
      }
      .knob{
        fill: var(--wired-slider-knob-color, rgb(51, 103, 214));
        stroke: var(--wired-slider-knob-color, rgb(51, 103, 214));
      }
      .bar {
        stroke: var(--wired-slider-bar-color, rgb(0, 0, 0));
      }
      input:focus + div svg .knob {
        stroke: var(--wired-slider-knob-outline-color, #000);
        fill-opacity: 0.8;
      }
      `]}get value(){return this.input?+this.input.value:this.min}set value(e){this.input?this.input.value=`${e}`:this.pendingValue=e,this.updateThumbPosition()}firstUpdated(){this.value=this.pendingValue||+(this.getAttribute("value")||this.value||this.min),delete this.pendingValue}render(){return u`
    <div id="container">
      <input type="range" 
        min="${this.min}"
        max="${this.max}"
        step="${this.step}"
        ?disabled="${this.disabled}"
        @input="${this.onInput}">
      <div id="overlay">
        <svg></svg>
      </div>
    </div>
    `}focus(){this.input?this.input.focus():super.focus()}onInput(e){e.stopPropagation(),this.updateThumbPosition(),this.input&&this.fire("change",{value:+this.input.value})}wiredRender(e=!1){super.wiredRender(e),this.updateThumbPosition()}canvasSize(){const e=this.getBoundingClientRect();return[e.width,e.height]}draw(e,t){this.canvasWidth=t[0];const i=Math.round(t[1]/2);m(e,0,i,t[0],i,this.seed).classList.add("bar"),this.knob=q(e,10,i,20,20,this.seed),this.knob.classList.add("knob")}updateThumbPosition(){if(this.input){const e=+this.input.value,t=Math.max(this.step,this.max-this.min),i=(e-this.min)/t;this.knob&&(this.knob.style.transform=`translateX(${i*(this.canvasWidth-20)}px)`)}}};de([h({type:Number}),Te("design:type",Object)],D.prototype,"min",void 0);de([h({type:Number}),Te("design:type",Object)],D.prototype,"max",void 0);de([h({type:Number}),Te("design:type",Object)],D.prototype,"step",void 0);de([h({type:Boolean,reflect:!0}),Te("design:type",Object)],D.prototype,"disabled",void 0);de([_("input"),Te("design:type",HTMLInputElement)],D.prototype,"input",void 0);D=de([b("wired-slider")],D);var Ot=globalThis&&globalThis.__decorate||function(o,e,t,i){var n=arguments.length,s=n<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(o,e,t,i);else for(var a=o.length-1;a>=0;a--)(r=o[a])&&(s=(n<3?r(s):n>3?r(e,t,s):r(e,t))||s);return n>3&&s&&Object.defineProperty(e,t,s),s},di=globalThis&&globalThis.__metadata||function(o,e){if(typeof Reflect=="object"&&typeof Reflect.metadata=="function")return Reflect.metadata(o,e)};let Ne=class extends ${constructor(){super(...arguments),this.spinning=!1,this.duration=1500,this.value=0,this.timerstart=0,this.frame=0}static get styles(){return[w,g`
        :host {
          display: inline-block;
          position: relative;
        }
        path {
          stroke: currentColor;
          stroke-opacity: 0.65;
          stroke-width: 1.5;
          fill: none;
        }
        .knob {
          stroke-width: 2.8 !important;
          stroke-opacity: 1;
        }
      `]}render(){return u`<svg></svg>`}canvasSize(){return[76,76]}draw(e,t){q(e,t[0]/2,t[1]/2,Math.floor(t[0]*.8),Math.floor(.8*t[1]),this.seed),this.knob=vt(0,0,20,20,this.seed),this.knob.classList.add("knob"),e.appendChild(this.knob),this.updateCursor()}updateCursor(){if(this.knob){const e=[Math.round(38+25*Math.cos(this.value*Math.PI*2)),Math.round(38+25*Math.sin(this.value*Math.PI*2))];this.knob.style.transform=`translate3d(${e[0]}px, ${e[1]}px, 0) rotateZ(${Math.round(this.value*360*2)}deg)`}}updated(){super.updated(),this.spinning?this.startSpinner():this.stopSpinner()}startSpinner(){this.stopSpinner(),this.value=0,this.timerstart=0,this.nextTick()}stopSpinner(){this.frame&&(window.cancelAnimationFrame(this.frame),this.frame=0)}nextTick(){this.frame=window.requestAnimationFrame(e=>this.tick(e))}tick(e){this.spinning?(this.timerstart||(this.timerstart=e),this.value=Math.min(1,(e-this.timerstart)/this.duration),this.updateCursor(),this.value>=1&&(this.value=0,this.timerstart=0),this.nextTick()):this.frame=0}};Ot([h({type:Boolean}),di("design:type",Object)],Ne.prototype,"spinning",void 0);Ot([h({type:Number}),di("design:type",Object)],Ne.prototype,"duration",void 0);Ne=Ot([b("wired-spinner")],Ne);var At=globalThis&&globalThis.__decorate||function(o,e,t,i){var n=arguments.length,s=n<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(o,e,t,i);else for(var a=o.length-1;a>=0;a--)(r=o[a])&&(s=(n<3?r(s):n>3?r(e,t,s):r(e,t))||s);return n>3&&s&&Object.defineProperty(e,t,s),s},Ct=globalThis&&globalThis.__metadata||function(o,e){if(typeof Reflect=="object"&&typeof Reflect.metadata=="function")return Reflect.metadata(o,e)};let Be=class extends ${constructor(){super(),this.name="",this.label="",window.ResizeObserver&&(this.resizeObserver=new window.ResizeObserver(()=>{this.svg&&this.wiredRender()}))}static get styles(){return[w,g`
        :host {
          display: inline-block;
          position: relative;
          padding: 10px;
        }
      `]}render(){return u`
    <div>
      <slot @slotchange="${this.wiredRender}"></slot>
    </div>
    <div id="overlay"><svg></svg></div>
    `}updated(){super.updated(),this.attachResizeListener()}disconnectedCallback(){this.detachResizeListener()}attachResizeListener(){this.resizeObserver&&this.resizeObserver.observe?this.resizeObserver.observe(this):this.windowResizeHandler||(this.windowResizeHandler=()=>this.wiredRender(),window.addEventListener("resize",this.windowResizeHandler,{passive:!0}))}detachResizeListener(){this.resizeObserver&&this.resizeObserver.unobserve&&this.resizeObserver.unobserve(this),this.windowResizeHandler&&window.removeEventListener("resize",this.windowResizeHandler)}canvasSize(){const e=this.getBoundingClientRect();return[e.width,e.height]}draw(e,t){O(e,2,2,t[0]-4,t[1]-4,this.seed)}};At([h({type:String}),Ct("design:type",Object)],Be.prototype,"name",void 0);At([h({type:String}),Ct("design:type",Object)],Be.prototype,"label",void 0);Be=At([b("wired-tab"),Ct("design:paramtypes",[])],Be);var Et=globalThis&&globalThis.__decorate||function(o,e,t,i){var n=arguments.length,s=n<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(o,e,t,i);else for(var a=o.length-1;a>=0;a--)(r=o[a])&&(s=(n<3?r(s):n>3?r(e,t,s):r(e,t))||s);return n>3&&s&&Object.defineProperty(e,t,s),s},hi=globalThis&&globalThis.__metadata||function(o,e){if(typeof Reflect=="object"&&typeof Reflect.metadata=="function")return Reflect.metadata(o,e)};let He=class extends I{constructor(){super(...arguments),this.pages=[],this.pageMap=new Map}static get styles(){return[w,g`
        :host {
          display: block;
          opacity: 1;
        }
        ::slotted(.hidden) {
          display: none !important;
        }
    
        :host ::slotted(.hidden) {
          display: none !important;
        }
        #bar {
          display: -ms-flexbox;
          display: -webkit-flex;
          display: flex;
          -ms-flex-direction: row;
          -webkit-flex-direction: row;
          flex-direction: row;
        }
      `]}render(){return u`
    <div id="bar">
      ${this.pages.map(e=>u`
      <wired-item role="tab" .value="${e.name}" .selected="${e.name===this.selected}" ?aria-selected="${e.name===this.selected}"
        @click="${()=>this.selected=e.name}">${e.label||e.name}</wired-item>
      `)}
    </div>
    <div>
      <slot @slotchange="${this.mapPages}"></slot>
    </div>
    `}mapPages(){if(this.pages=[],this.pageMap.clear(),this.slotElement){const e=this.slotElement.assignedNodes();if(e&&e.length){for(let t=0;t<e.length;t++){const i=e[t];if(i.nodeType===Node.ELEMENT_NODE&&i.tagName.toLowerCase()==="wired-tab"){const n=i;this.pages.push(n);const s=n.getAttribute("name")||"";s&&s.trim().split(" ").forEach(r=>{r&&this.pageMap.set(r,n)})}}this.selected||this.pages.length&&(this.selected=this.pages[0].name),this.requestUpdate()}}}firstUpdated(){this.mapPages(),this.tabIndex=+(this.getAttribute("tabindex")||0),this.addEventListener("keydown",e=>{switch(e.keyCode){case 37:case 38:e.preventDefault(),this.selectPrevious();break;case 39:case 40:e.preventDefault(),this.selectNext();break}})}updated(){const e=this.getElement();for(let t=0;t<this.pages.length;t++){const i=this.pages[t];i===e?i.classList.remove("hidden"):i.classList.add("hidden")}this.current=e||void 0,this.current&&this.current.wiredRender&&requestAnimationFrame(()=>requestAnimationFrame(()=>this.current.wiredRender()))}getElement(){let e;return this.selected&&(e=this.pageMap.get(this.selected)),e||(e=this.pages[0]),e||null}selectPrevious(){const e=this.pages;if(e.length){let t=-1;for(let i=0;i<e.length;i++)if(e[i]===this.current){t=i;break}t<0?t=0:t===0?t=e.length-1:t--,this.selected=e[t].name||""}}selectNext(){const e=this.pages;if(e.length){let t=-1;for(let i=0;i<e.length;i++)if(e[i]===this.current){t=i;break}t<0||t>=e.length-1?t=0:t++,this.selected=e[t].name||""}}};Et([h({type:String}),hi("design:type",String)],He.prototype,"selected",void 0);Et([_("slot"),hi("design:type",HTMLSlotElement)],He.prototype,"slotElement",void 0);He=Et([b("wired-tabs")],He);var C=globalThis&&globalThis.__decorate||function(o,e,t,i){var n=arguments.length,s=n<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(o,e,t,i);else for(var a=o.length-1;a>=0;a--)(r=o[a])&&(s=(n<3?r(s):n>3?r(e,t,s):r(e,t))||s);return n>3&&s&&Object.defineProperty(e,t,s),s},T=globalThis&&globalThis.__metadata||function(o,e){if(typeof Reflect=="object"&&typeof Reflect.metadata=="function")return Reflect.metadata(o,e)};let A=class extends ${constructor(){super(...arguments),this.disabled=!1,this.rows=2,this.maxrows=0,this.autocomplete="",this.autofocus=!1,this.inputmode="",this.placeholder="",this.required=!1,this.readonly=!1}static get styles(){return[w,g`
        :host {
          display: inline-block;
          position: relative;
          font-family: sans-serif;
          width: 400px;
          outline: none;
          padding: 4px;
        }
        :host([disabled]) {
          opacity: 0.6 !important;
          cursor: default;
          pointer-events: none;
        }
        :host([disabled]) svg {
          background: rgba(0, 0, 0, 0.07);
        }
        textarea {
          position: relative;
          outline: none;
          border: none;
          resize: none;
          background: inherit;
          color: inherit;
          width: 100%;
          font-size: inherit;
          font-family: inherit;
          line-height: inherit;
          text-align: inherit;
          padding: 10px;
          box-sizing: border-box;
        }
      `]}render(){return u`
    <textarea id="textarea" autocomplete="${this.autocomplete}" ?autofocus="${this.autofocus}" inputmode="${this.inputmode}"
      placeholder="${this.placeholder}" ?readonly="${this.readonly}" ?required="${this.required}" ?disabled="${this.disabled}"
      rows="${this.rows}" minlength="${this.minlength}" maxlength="${this.maxlength}"
      @change="${this.refire}" @input="${this.refire}"></textarea>
    <div id="overlay">
      <svg></svg>
    </div>
    `}get textarea(){return this.textareaInput}get value(){const e=this.textarea;return e&&e.value||""}set value(e){if(this.shadowRoot){const t=this.textarea;if(t){t.value=e;return}}this.pendingValue=e}firstUpdated(){this.value=this.pendingValue||this.value||this.getAttribute("value")||"",delete this.pendingValue}canvasSize(){const e=this.getBoundingClientRect();return[e.width,e.height]}draw(e,t){O(e,4,4,t[0]-4,t[1]-4,this.seed)}refire(e){e.stopPropagation(),this.fire(e.type,{sourceEvent:e})}};C([h({type:Boolean,reflect:!0}),T("design:type",Object)],A.prototype,"disabled",void 0);C([h({type:Number}),T("design:type",Object)],A.prototype,"rows",void 0);C([h({type:Number}),T("design:type",Object)],A.prototype,"maxrows",void 0);C([h({type:String}),T("design:type",Object)],A.prototype,"autocomplete",void 0);C([h({type:Boolean}),T("design:type",Object)],A.prototype,"autofocus",void 0);C([h({type:String}),T("design:type",Object)],A.prototype,"inputmode",void 0);C([h({type:String}),T("design:type",Object)],A.prototype,"placeholder",void 0);C([h({type:Boolean}),T("design:type",Object)],A.prototype,"required",void 0);C([h({type:Boolean}),T("design:type",Object)],A.prototype,"readonly",void 0);C([h({type:Number}),T("design:type",Number)],A.prototype,"minlength",void 0);C([h({type:Number}),T("design:type",Number)],A.prototype,"maxlength",void 0);C([_("textarea"),T("design:type",HTMLTextAreaElement)],A.prototype,"textareaInput",void 0);A=C([b("wired-textarea")],A);var Xe=globalThis&&globalThis.__decorate||function(o,e,t,i){var n=arguments.length,s=n<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(o,e,t,i);else for(var a=o.length-1;a>=0;a--)(r=o[a])&&(s=(n<3?r(s):n>3?r(e,t,s):r(e,t))||s);return n>3&&s&&Object.defineProperty(e,t,s),s},Tt=globalThis&&globalThis.__metadata||function(o,e){if(typeof Reflect=="object"&&typeof Reflect.metadata=="function")return Reflect.metadata(o,e)};let _e=class extends ${constructor(){super(...arguments),this.checked=!1,this.disabled=!1}static get styles(){return[w,g`
      :host {
        display: inline-block;
        cursor: pointer;
        position: relative;
        outline: none;
      }
      :host([disabled]) {
        opacity: 0.4 !important;
        cursor: default;
        pointer-events: none;
      }
      :host([disabled]) svg {
        background: rgba(0, 0, 0, 0.07);
      }
      input {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        cursor: pointer;
        opacity: 0;
      }
      .knob {
        transition: transform 0.3s ease;
      }
      .knob path {
        stroke-width: 0.7;
      }
      .knob.checked {
        transform: translateX(48px);
      }
      path.knobfill {
        stroke-width: 3 !important;
        fill: transparent;
      }
      .knob.unchecked path.knobfill {
        stroke: var(--wired-toggle-off-color, gray);
      }
      .knob.checked path.knobfill {
        stroke: var(--wired-toggle-on-color, rgb(63, 81, 181));
      }
      `]}render(){return u`
    <div style="position: relative;">
      <svg></svg>
      <input type="checkbox" .checked="${this.checked}" ?disabled="${this.disabled}"  @change="${this.onChange}">
    </div>
    `}focus(){this.input?this.input.focus():super.focus()}wiredRender(e=!1){super.wiredRender(e),this.refreshKnob()}onChange(){this.checked=this.input.checked,this.refreshKnob(),this.fire("change",{checked:this.checked})}canvasSize(){return[80,34]}draw(e,t){O(e,16,8,t[0]-32,18,this.seed).classList.add("toggle-bar"),this.knob=ie("g"),this.knob.classList.add("knob"),e.appendChild(this.knob);const n=vt(16,16,32,32,this.seed);n.classList.add("knobfill"),this.knob.appendChild(n),q(this.knob,16,16,32,32,this.seed)}refreshKnob(){if(this.knob){const e=this.knob.classList;this.checked?(e.remove("unchecked"),e.add("checked")):(e.remove("checked"),e.add("unchecked"))}}};Xe([h({type:Boolean}),Tt("design:type",Object)],_e.prototype,"checked",void 0);Xe([h({type:Boolean,reflect:!0}),Tt("design:type",Object)],_e.prototype,"disabled",void 0);Xe([_("input"),Tt("design:type",HTMLInputElement)],_e.prototype,"input",void 0);_e=Xe([b("wired-toggle")],_e);var z=globalThis&&globalThis.__decorate||function(o,e,t,i){var n=arguments.length,s=n<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(o,e,t,i);else for(var a=o.length-1;a>=0;a--)(r=o[a])&&(s=(n<3?r(s):n>3?r(e,t,s):r(e,t))||s);return n>3&&s&&Object.defineProperty(e,t,s),s},M=globalThis&&globalThis.__metadata||function(o,e){if(typeof Reflect=="object"&&typeof Reflect.metadata=="function")return Reflect.metadata(o,e)};let E=class extends ${constructor(){super(),this.src="",this.autoplay=!1,this.loop=!1,this.muted=!1,this.playsinline=!1,this.playing=!1,this.timeDisplay="",window.ResizeObserver&&(this.resizeObserver=new window.ResizeObserver(()=>{this.svg&&this.wiredRender()}))}static get styles(){return[w,g`
        :host {
          display: inline-block;
          position: relative;
          line-height: 1;
          padding: 3px 3px 68px;
          --wired-progress-color: var(--wired-video-highlight-color, rgb(51, 103, 214));
          --wired-slider-knob-color: var(--wired-video-highlight-color, rgb(51, 103, 214));
        }
        video {
          display: block;
          box-sizing: border-box;
          max-width: 100%;
          max-height: 100%;
        }
        path {
          stroke-width: 1;
        }
        #controls {
          position: absolute;
          pointer-events: auto;
          left: 0;
          bottom: 0;
          width: 100%;
          box-sizing: border-box;
          height: 70px;
        }
        .layout.horizontal {
          display: -ms-flexbox;
          display: -webkit-flex;
          display: flex;
          -ms-flex-direction: row;
          -webkit-flex-direction: row;
          flex-direction: row;
          -ms-flex-align: center;
          -webkit-align-items: center;
          align-items: center;
          padding: 5px 10px;
        }
        .flex {
          -ms-flex: 1 1 0.000000001px;
          -webkit-flex: 1;
          flex: 1;
          -webkit-flex-basis: 0.000000001px;
          flex-basis: 0.000000001px;
        }
        wired-progress {
          display: block;
          width: 100%;
          box-sizing: border-box;
          height: 20px;
          --wired-progress-label-color: transparent;
          --wired-progress-label-background: transparent;
        }
        wired-icon-button span {
          font-size: 16px;
          line-height: 16px;
          width: 16px;
          height: 16px;
          padding: 0px;
          font-family: sans-serif;
          display: inline-block;
        }
        #timeDisplay {
          padding: 0 20px 0 8px;
          font-size: 13px;
        }
        wired-slider {
          display: block;
          max-width: 200px;
          margin: 0 6px 0 auto;
        }
      `]}render(){return u`
    <video 
      .autoplay="${this.autoplay}"
      .loop="${this.loop}"
      .muted="${this.muted}"
      .playsinline="${this.playsinline}"
      src="${this.src}"
      @play="${()=>this.playing=!0}"
      @pause="${()=>this.playing=!1}"
      @canplay="${this.canPlay}"
      @timeupdate="${this.updateTime}">
    </video>
    <div id="overlay">
      <svg></svg>
    </div>
    <div id="controls">
      <wired-progress></wired-progress>
      <div class="horizontal layout center">
        <wired-icon-button @click="${this.togglePause}">
          <span>${this.playing?"||":"▶"}</span>
        </wired-icon-button>
        <div id="timeDisplay">${this.timeDisplay}</div>
        <div class="flex">
          <wired-slider @change="${this.volumeChange}"></wired-slider>
        </div>
        <div style="width: 24px; height: 24px;">
          <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g><path style="stroke: none; fill: currentColor;" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></g></svg>
        </div>
      </div>
    </div>
    `}updated(){super.updated(),this.attachResizeListener()}disconnectedCallback(){this.detachResizeListener()}attachResizeListener(){this.resizeObserver&&this.resizeObserver.observe?this.resizeObserver.observe(this):this.windowResizeHandler||(this.windowResizeHandler=()=>this.wiredRender(),window.addEventListener("resize",this.windowResizeHandler,{passive:!0}))}detachResizeListener(){this.resizeObserver&&this.resizeObserver.unobserve&&this.resizeObserver.unobserve(this),this.windowResizeHandler&&window.removeEventListener("resize",this.windowResizeHandler)}wiredRender(){super.wiredRender(),this.progressBar&&this.progressBar.wiredRender(!0)}canvasSize(){const e=this.getBoundingClientRect();return[e.width,e.height]}draw(e,t){O(e,2,2,t[0]-4,t[1]-4,this.seed)}updateTime(){this.video&&this.progressBar&&(this.progressBar.value=this.video.duration?Math.round(this.video.currentTime/this.video.duration*100):0,this.timeDisplay=`${this.getTimeDisplay(this.video.currentTime)} / ${this.getTimeDisplay(this.video.duration)}`)}getTimeDisplay(e){const t=Math.floor(e/60),i=Math.round(e-t*60);return`${t}:${i}`}togglePause(){this.video&&(this.playing?this.video.pause():this.video.play())}volumeChange(){this.video&&this.slider&&(this.video.volume=this.slider.value/100)}canPlay(){this.slider&&this.video&&(this.slider.value=this.video.volume*100)}};z([h({type:String}),M("design:type",Object)],E.prototype,"src",void 0);z([h({type:Boolean}),M("design:type",Object)],E.prototype,"autoplay",void 0);z([h({type:Boolean}),M("design:type",Object)],E.prototype,"loop",void 0);z([h({type:Boolean}),M("design:type",Object)],E.prototype,"muted",void 0);z([h({type:Boolean}),M("design:type",Object)],E.prototype,"playsinline",void 0);z([h(),M("design:type",Object)],E.prototype,"playing",void 0);z([h(),M("design:type",Object)],E.prototype,"timeDisplay",void 0);z([_("wired-progress"),M("design:type",K)],E.prototype,"progressBar",void 0);z([_("wired-slider"),M("design:type",D)],E.prototype,"slider",void 0);z([_("video"),M("design:type",HTMLVideoElement)],E.prototype,"video",void 0);E=z([b("wired-video"),M("design:paramtypes",[])],E);class ut extends I{constructor(){super();W(this,"handleInput",async t=>{var i=t.target.value,n=[],s=i.toLowerCase().split(" ").filter(l=>l.length>0),r=await chrome.tabs.query({});r.map(l=>{var d=Xi(s,(l.url+l.title).toLowerCase());n.push({tab:l,score:d})}),n=n.filter(l=>l.score>0).sort((l,d)=>d.score-l.score).slice(0,20),this.list=[],this.selectedIndex=0;var a=this;setTimeout(()=>{a.list=n},0)});W(this,"arrowDownUpOrEnter",async t=>{var i=this.shadowRoot.getElementById("listbox");if((t.keyCode===40||t.keyCode===38||t.keyCode===13)&&i){t.preventDefault(),i.focus();var n=new KeyboardEvent("keydown",{key:t.key,code:t.code,keyCode:t.keyCode});i.dispatchEvent(n)}});W(this,"keyDown",async t=>{var i=this.shadowRoot.getElementById("listbox"),n=this.shadowRoot.getElementById("input");if(t.keyCode===13){var i=this.shadowRoot.querySelector("#listbox");this.handleClick({index:i.selected});return}if(t.keyCode<37||t.keyCode>40){i.blur(),n.shadowRoot.querySelector("input").focus();var s=new KeyboardEvent("keydown",{key:t.key,code:t.code,keyCode:t.keyCode});n.dispatchEvent(s)}});W(this,"handleClick",async({index:t})=>{this.selectedIndex=t;var{tab:i,socre:n}=this.list[t];await chrome.windows.update(i.windowId,{focused:!0}),await chrome.tabs.update(i.id,{active:!0})});this.list=[],this.selectedIndex=0}render(){return u`
            <div class="container">
                <div class="item">
                    <wired-input @input="${this.handleInput}" @keydown="${this.arrowDownUpOrEnter}" autofocus="true" width="500" id="input"></wired-input>
                </div>
                <div class="item" id="combo">
                    ${this.list.length?u`<wired-listbox id="listbox" selected="${this.selectedIndex}"  @keydown="${this.keyDown}"
                            style="--wired-item-selected-color: darkred; --wired-item-selected-bg: pink;">
                        ${this.list.map((t,i)=>u`<wired-item value="${i}" @click="${()=>this.handleClick({index:i})}">
                                ${t.score} ${t.tab.title}
                            </wired-item>`)}
                        </wired-listbox>
                        `:null}        
                </div>
            </div>
        `}}W(ut,"styles",g`
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
        `),W(ut,"properties",{list:{},selectedIndex:{}});customElements.define("w-container",ut);function Xi(o,e){for(var t=o.length,i=e.length,n=new Array(t+1),s=0;s<t+1;s++)n[s]=new Array(i+1).fill(0);for(var s=1;s<=t;s++)for(var r=o[s-1],a=1;a<=i;a++)a>r.length&&e.substr(a-r.length-1,r.length)===r?n[s][a]=1+n[s-1][a-r.length]:n[s][a]=Math.max(n[s-1][a],n[s][a-1]);return n[t][i]}
