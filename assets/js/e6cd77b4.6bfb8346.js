(self.webpackChunkblog=self.webpackChunkblog||[]).push([[6943],{85222:(e,t,n)=>{"use strict";n.d(t,{A:()=>s});n(58101);var r=n(25105);function s(e){return(0,r.jsx)("svg",Object.assign({viewBox:"0 0 24 24"},e,{children:(0,r.jsx)("path",{fill:"currentColor",d:"M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"})}))}},57202:(e,t,n)=>{"use strict";n.d(t,{A:()=>s});n(58101);var r=n(25105);function s(e){return(0,r.jsx)("svg",Object.assign({viewBox:"0 0 24 24"},e,{children:(0,r.jsx)("path",{fill:"currentColor",d:"M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"})}))}},89475:(e,t,n)=>{"use strict";n.d(t,{A:()=>s});n(58101);var r=n(25105);function s(e){return(0,r.jsx)("svg",Object.assign({viewBox:"0 0 24 24"},e,{children:(0,r.jsx)("path",{fill:"currentColor",d:"M4 19h6v-2H4v2zM20 5H4v2h16V5zm-3 6H4v2h13.25c1.1 0 2 .9 2 2s-.9 2-2 2H15v-2l-3 3l3 3v-2h2c2.21 0 4-1.79 4-4s-1.79-4-4-4z"})}))}},49062:(e,t,n)=>{"use strict";n.d(t,{f:()=>c});var r=n(58101),s=n(98020),o={attributes:!0,characterData:!0,childList:!0,subtree:!0};function a(e,t){var n=(0,r.useState)(),a=n[0],c=n[1],i=(0,r.useCallback)((function(){var t;c(null==(t=e.current)?void 0:t.closest("[role=tabpanel][hidden]"))}),[e,c]);(0,r.useEffect)((function(){i()}),[i]),function(e,t,n){void 0===n&&(n=o);var a=(0,s._q)(t),c=(0,s.Be)(n);(0,r.useEffect)((function(){var t=new MutationObserver(a);return e&&t.observe(e,c),function(){return t.disconnect()}}),[e,a,c])}(a,(function(e){e.forEach((function(e){"attributes"===e.type&&"hidden"===e.attributeName&&(t(),i())}))}),{attributes:!0,characterData:!1,childList:!1,subtree:!1})}function c(){var e=(0,r.useState)(!1),t=e[0],n=e[1],s=(0,r.useState)(!1),o=s[0],c=s[1],i=(0,r.useRef)(null),l=(0,r.useCallback)((function(){var e=i.current.querySelector("code");t?e.removeAttribute("style"):(e.style.whiteSpace="pre-wrap",e.style.overflowWrap="anywhere"),n((function(e){return!e}))}),[i,t]),u=(0,r.useCallback)((function(){var e=i.current,t=e.scrollWidth>e.clientWidth||i.current.querySelector("code").hasAttribute("style");c(t)}),[i]);return a(i,u),(0,r.useEffect)((function(){u()}),[t,u]),(0,r.useEffect)((function(){return window.addEventListener("resize",u,{passive:!0}),function(){window.removeEventListener("resize",u)}}),[u]),{codeBlockRef:i,isEnabled:t,isCodeScrollable:o,toggle:l}}},53100:(e,t,n)=>{"use strict";n.d(t,{A:()=>o});var r=n(94299),s=n(10596);function o(){var e=(0,s.p)().prism,t=(0,r.G)().colorMode,n=e.theme,o=e.darkTheme||n;return"dark"===t?o:n}},5181:(e,t,n)=>{"use strict";n.d(t,{Li:()=>h,M$:()=>b,Op:()=>f,_u:()=>p,wt:()=>m});var r=n(48939),s=n(34809),o=n.n(s),a=(0,r.A)(/title=(["'])(.*?)\1/,{quote:1,title:2}),c=(0,r.A)(/\{([\d,-]+)\}/,{range:1}),i={js:{start:"\\/\\/",end:""},jsBlock:{start:"\\/\\*",end:"\\*\\/"},jsx:{start:"\\{\\s*\\/\\*",end:"\\*\\/\\s*\\}"},bash:{start:"#",end:""},html:{start:"\x3c!--",end:"--\x3e"}},l=Object.assign({},i,{lua:{start:"--",end:""},wasm:{start:"\\;\\;",end:""},tex:{start:"%",end:""},vb:{start:"['\u2018\u2019]",end:""},vbnet:{start:"(?:_\\s*)?['\u2018\u2019]",end:""},rem:{start:"[Rr][Ee][Mm]\\b",end:""},f90:{start:"!",end:""},ml:{start:"\\(\\*",end:"\\*\\)"},cobol:{start:"\\*>",end:""}}),u=Object.keys(i);function d(e,t){var n=e.map((function(e){var n=l[e],r=n.start,s=n.end;return"(?:"+r+"\\s*("+t.flatMap((function(e){var t,n;return[e.line,null==(t=e.block)?void 0:t.start,null==(n=e.block)?void 0:n.end].filter(Boolean)})).join("|")+")\\s*"+s+")"})).join("|");return new RegExp("^\\s*(?:"+n+")\\s*$")}function m(e){var t,n;return null!=(t=null==e||null==(n=e.match(a))?void 0:n.groups.title)?t:""}function p(e){return Boolean(null==e?void 0:e.includes("showLineNumbers"))}function f(e){var t=e.split(" ").find((function(e){return e.startsWith("language-")}));return null==t?void 0:t.replace(/language-/,"")}function h(e,t){var n=e.replace(/\n$/,""),r=t.language,s=t.magicComments,a=t.metastring;if(a&&c.test(a)){var i=a.match(c).groups.range;if(0===s.length)throw new Error("A highlight range has been given in code block's metastring (``` "+a+"), but no magic comment config is available. Docusaurus applies the first magic comment entry's className for metastring ranges.");var l=s[0].className,m=o()(i).filter((function(e){return e>0})).map((function(e){return[e-1,[l]]}));return{lineClassNames:Object.fromEntries(m),code:n}}if(void 0===r)return{lineClassNames:{},code:n};for(var p=function(e,t){switch(e){case"js":case"javascript":case"ts":case"typescript":return d(["js","jsBlock"],t);case"jsx":case"tsx":return d(["js","jsBlock","jsx"],t);case"html":return d(["js","jsBlock","html"],t);case"python":case"py":case"bash":return d(["bash"],t);case"markdown":case"md":return d(["html","jsx","bash"],t);case"tex":case"latex":case"matlab":return d(["tex"],t);case"lua":case"haskell":return d(["lua"],t);case"sql":return d(["lua","jsBlock"],t);case"wasm":return d(["wasm"],t);case"vb":case"vba":case"visual-basic":return d(["vb","rem"],t);case"vbnet":return d(["vbnet","rem"],t);case"batch":return d(["rem"],t);case"basic":return d(["rem","f90"],t);case"fsharp":return d(["js","ml"],t);case"ocaml":case"sml":return d(["ml"],t);case"fortran":return d(["f90"],t);case"cobol":return d(["cobol"],t);default:return d(u,t)}}(r,s),f=n.split("\n"),h=Object.fromEntries(s.map((function(e){return[e.className,{start:0,range:""}]}))),b=Object.fromEntries(s.filter((function(e){return e.line})).map((function(e){var t=e.className;return[e.line,t]}))),g=Object.fromEntries(s.filter((function(e){return e.block})).map((function(e){var t=e.className;return[e.block.start,t]}))),v=Object.fromEntries(s.filter((function(e){return e.block})).map((function(e){var t=e.className;return[e.block.end,t]}))),x=0;x<f.length;){var j=f[x].match(p);if(j){var k=j.slice(1).find((function(e){return void 0!==e}));b[k]?h[b[k]].range+=x+",":g[k]?h[g[k]].start=x:v[k]&&(h[v[k]].range+=h[v[k]].start+"-"+(x-1)+","),f.splice(x,1)}else x+=1}n=f.join("\n");var y={};return Object.entries(h).forEach((function(e){var t=e[0],n=e[1].range;o()(n).forEach((function(e){null!=y[e]||(y[e]=[]),y[e].push(t)}))})),{lineClassNames:y,code:n}}function b(e){var t={color:"--prism-color",backgroundColor:"--prism-background-color"},n={};return Object.entries(e.plain).forEach((function(e){var r=e[0],s=e[1],o=t[r];o&&"string"==typeof s&&(n[o]=s)})),n}},96296:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>v});var r=n(95536),s=n(75063),o=n(58101),a=n(42128),c=n(4195);const i={siteInfo:"siteInfo_eYy8",codeBlock:"codeBlock_cKnR"};var l=n(25105),u="\u53cb\u94fe",d="\u6709\u5f88\u591a\u826f\u53cb\uff0c\u80dc\u4e8e\u6709\u5f88\u591a\u8d22\u5bcc\u3002",m="\ntitle: '\u7267\u751f'\ndescription: 'Everything Wins \ud83c\udf89'\nwebsite: 'https://yuluo-yx.github.io'\navatar: 'https://yuluo-yx.github.io/img/logo.png'\n",p=[{title:"pil0txia",description:"\u4e0d\u4f1a\u6444\u5f71\u7684\u767d\u5e3d\u5b50\u4e0d\u662f\u597d\u673a\u957f\uff01",website:"https://www.pil0txia.com/",avatar:"https://avatars.githubusercontent.com/u/41445332"}];function f(){return(0,l.jsx)("div",{className:"w-96 rounded-[var(--ifm-pre-border-radius)] border border-solid border-black border-opacity-10 text-left text-sm leading-none",children:(0,l.jsx)(r.A,{language:"yaml",title:"\u672c\u7ad9\u4fe1\u606f",className:i.codeBlock,children:m})})}function h(){return(0,l.jsxs)("section",{className:"margin-top--lg margin-bottom--lg text-center",children:[(0,l.jsx)("h1",{children:u}),(0,l.jsx)("p",{children:d})]})}var b=(0,o.memo)((function(e){var t=e.friend;return(0,l.jsxs)("li",{className:"relative flex min-h-24 cursor-pointer flex-row items-center overflow-hidden rounded-card bg-card px-4 py-1 transition-all duration-300 hover:translate-y-[-5px] hover:scale-[1.01] hover:bg-[rgba(229,231,235,0.3)] hover:shadow-[0_3px_10px_0_rgba(164,190,217,0.3)]",children:[(0,l.jsx)("img",{src:"string"==typeof t.avatar?t.avatar:t.avatar.src.src,alt:t.title,className:"size-16 min-w-16 rounded-full object-contain"}),(0,l.jsxs)("div",{className:"pl-4",children:[(0,l.jsx)("div",{className:"mb-1 flex items-center",children:(0,l.jsx)("h4",{className:"mb-0 flex-1",children:(0,l.jsx)(a.A,{to:t.website,rel:"",className:"from-ifm-color-primary to-ifm-color-primary bg-gradient-to-b bg-[length:0%_1px] bg-[0%_100%] bg-no-repeat no-underline transition-[background-size] duration-200 ease-out hover:bg-[length:100%_1px] focus:bg-[length:100%_1px]",children:t.title})})}),(0,l.jsx)("p",{className:"m-0 line-clamp-2 w-full overflow-hidden text-sm leading-[1.66]",children:t.description})]})]})}));function g(){return(0,l.jsx)("section",{className:"my-8",children:(0,l.jsx)("div",{className:"mx-auto max-w-6xl px-4 py-2",children:(0,l.jsx)("ul",{className:"grid grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3",children:p.map((function(e){return(0,l.jsx)(b,{friend:e},e.avatar)}))})})})}function v(){var e=(0,o.useRef)(null);return(0,l.jsx)(s.A,{title:u,description:d,wrapperClassName:"bg-background",children:(0,l.jsxs)(c.P.main,{ref:e,className:"my-4",children:[(0,l.jsx)(h,{}),(0,l.jsx)(g,{}),(0,l.jsx)(c.P.div,{drag:!0,dragConstraints:e,className:"sticky bottom-4 left-4 inline-flex cursor-move text-right",children:(0,l.jsx)(f,{})})]})})}},95536:(e,t,n)=>{"use strict";n.d(t,{A:()=>S});var r=n(35045),s=n(35225),o=n(25974),a=n(53100),c=n(56837),i=n(5181),l=n(58101);const u={codeBlockContainer:"codeBlockContainer_APcc"};var d=n(25105),m=["as"];function p(e){var t=e.as,n=(0,r.A)(e,m),s=(0,a.A)(),l=(0,i.M$)(s);return(0,d.jsx)(t,Object.assign({},n,{style:l,className:(0,o.cn)(n.className,u.codeBlockContainer,c.G.common.codeBlock)}))}const f={codeBlockContent:"codeBlockContent_m3Ux",codeBlockTitle:"codeBlockTitle_P25_",codeBlock:"codeBlock_qGQc",codeBlockStandalone:"codeBlockStandalone_zC50",codeBlockLines:"codeBlockLines_p187",codeBlockLinesWithNumbering:"codeBlockLinesWithNumbering_OFgW",buttonGroup:"buttonGroup_6DOT"};function h(e){var t=e.children,n=e.className;return(0,d.jsx)(p,{as:"pre",tabIndex:0,className:(0,o.cn)(f.codeBlockStandalone,"thin-scrollbar",n),children:(0,d.jsx)("code",{className:f.codeBlockLines,children:t})})}var b=n(48939),g=n(10596),v=n(49062),x=n(77533),j=n(2105),k=n(85222),y=n(57202),B=n(48915);const N={copyButtonCopied:"copyButtonCopied__QnY",copyButtonIcons:"copyButtonIcons_FhaS",copyButtonIcon:"copyButtonIcon_phi_",copyButtonSuccessIcon:"copyButtonSuccessIcon_FfTR"};function w(e){var t=e.code,n=e.className,r=(0,l.useState)(!1),s=r[0],a=r[1],c=(0,l.useRef)(void 0),i=(0,l.useCallback)((function(){(0,B.A)(t),a(!0),c.current=window.setTimeout((function(){a(!1)}),1e3)}),[t]);return(0,l.useEffect)((function(){return function(){return window.clearTimeout(c.current)}}),[]),(0,d.jsx)("button",{type:"button","aria-label":s?(0,j.T)({id:"theme.CodeBlock.copied",message:"Copied",description:"The copied button label on code blocks"}):(0,j.T)({id:"theme.CodeBlock.copyButtonAriaLabel",message:"Copy code to clipboard",description:"The ARIA label for copy code blocks button"}),title:(0,j.T)({id:"theme.CodeBlock.copy",message:"Copy",description:"The copy button label on code blocks"}),className:(0,o.cn)("clean-btn",n,N.copyButton,s&&N.copyButtonCopied),onClick:i,children:(0,d.jsxs)("span",{className:N.copyButtonIcons,"aria-hidden":"true",children:[(0,d.jsx)(k.A,{className:N.copyButtonIcon}),(0,d.jsx)(y.A,{className:N.copyButtonSuccessIcon})]})})}const C={codeLine:"codeLine_iPqp",codeLineNumber:"codeLineNumber_F4P7",codeLineContent:"codeLineContent_pOih"};function A(e){var t,n=e.line,r=e.classNames,s=e.showLineNumbers,a=e.getLineProps,c=e.getTokenProps;1===n.length&&"\n"===(null==(t=n[0])?void 0:t.content)&&(n[0].content="");var i=a({line:n,className:(0,o.cn)(r,s&&C.codeLine)}),l=n.map((function(e,t){return(0,d.jsx)("span",Object.assign({},c({token:e,key:t})),t)}));return(0,d.jsxs)("span",Object.assign({},i,{children:[s?(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)("span",{className:C.codeLineNumber}),(0,d.jsx)("span",{className:C.codeLineContent,children:l})]}):l,(0,d.jsx)("br",{})]}))}var L=n(89475);const E={wordWrapButtonIcon:"wordWrapButtonIcon_iowe",wordWrapButtonEnabled:"wordWrapButtonEnabled_gY8A"};function _(e){var t=e.className,n=e.onClick,r=e.isEnabled,s=(0,j.T)({id:"theme.CodeBlock.wordWrapToggle",message:"Toggle word wrap",description:"The title attribute for toggle word wrapping button of code block lines"});return(0,d.jsx)("button",{type:"button",onClick:n,className:(0,o.cn)("clean-btn",t,r&&E.wordWrapButtonEnabled),"aria-label":s,title:s,children:(0,d.jsx)(L.A,{className:E.wordWrapButtonIcon,"aria-hidden":"true"})})}var O=n(72355);function T(e){var t,n=e.children,r=e.className,s=void 0===r?"":r,c=e.metastring,l=e.title,u=e.showLineNumbers,m=e.language,h=(0,g.p)().prism,j=h.defaultLanguage,k=h.magicComments,y=function(e){return null==e?void 0:e.toLowerCase()}(null!=(t=null!=m?m:(0,i.Op)(s))?t:j),B=(0,a.A)(),N=(0,v.f)(),C=(0,i.wt)(c)||l,L=function(e){var t,n,r=(0,b.A)(/icon=(["'])(.*?)\1/,{quote:1,icon:2}),s=null!=(t=null==e||null==(n=e.match(r))||null==(n=n.groups)?void 0:n.icon)?t:"";return s?(0,d.jsx)(x.In,{icon:s,width:"16"}):null}(c),E=(0,i.Li)(n,{metastring:c,language:y,magicComments:k}),T=E.lineClassNames,I=E.code,S=null!=u?u:(0,i._u)(c);return(0,d.jsxs)(p,{as:"div",className:(0,o.cn)(s,y&&!s.includes("language-"+y)&&"language-"+y),children:[C&&(0,d.jsxs)("div",{className:f.codeBlockTitle,children:[L,C,(0,d.jsx)("span",{style:{flex:1,textAlign:"right"},children:y})]}),(0,d.jsxs)("div",{className:f.codeBlockContent,children:[(0,d.jsx)(O.f4,{theme:B,code:I,language:null!=y?y:"text",children:function(e){var t=e.className,n=e.style,r=e.tokens,s=e.getLineProps,a=e.getTokenProps;return(0,d.jsx)("pre",{ref:N.codeBlockRef,className:(0,o.cn)(t,f.codeBlock,"thin-scrollbar"),style:n,children:(0,d.jsx)("code",{className:(0,o.cn)(f.codeBlockLines,S&&f.codeBlockLinesWithNumbering),children:r.map((function(e,t){return(0,d.jsx)(A,{line:e,getLineProps:s,getTokenProps:a,classNames:T[t],showLineNumbers:S},t)}))})})}}),(0,d.jsxs)("div",{className:f.buttonGroup,children:[(N.isEnabled||N.isCodeScrollable)&&(0,d.jsx)(_,{className:f.codeButton,onClick:function(){return N.toggle()},isEnabled:N.isEnabled}),(0,d.jsx)(w,{className:f.codeButton,code:I})]})]})]})}var I=["children"];function S(e){var t=e.children,n=(0,r.A)(e,I),o=(0,s.A)(),a=function(e){return l.Children.toArray(e).some((function(e){return(0,l.isValidElement)(e)}))?e:Array.isArray(e)?e.join(""):e}(t),c="string"==typeof a?T:h;return(0,d.jsx)(c,Object.assign({},n,{children:a}),String(o))}},34809:(e,t)=>{function n(e){let t,n=[];for(let r of e.split(",").map((e=>e.trim())))if(/^-?\d+$/.test(r))n.push(parseInt(r,10));else if(t=r.match(/^(-?\d+)(-|\.\.\.?|\u2025|\u2026|\u22EF)(-?\d+)$/)){let[e,r,s,o]=t;if(r&&o){r=parseInt(r),o=parseInt(o);const e=r<o?1:-1;"-"!==s&&".."!==s&&"\u2025"!==s||(o+=e);for(let t=r;t!==o;t+=e)n.push(t)}}return n}t.default=n,e.exports=n},48915:(e,t,n)=>{"use strict";function r(e,t){var n=(void 0===t?{}:t).target,r=void 0===n?document.body:n;if("string"!=typeof e)throw new TypeError("Expected parameter `text` to be a `string`, got `"+typeof e+"`.");var s=document.createElement("textarea"),o=document.activeElement;s.value=e,s.setAttribute("readonly",""),s.style.contain="strict",s.style.position="absolute",s.style.left="-9999px",s.style.fontSize="12pt";var a=document.getSelection(),c=a.rangeCount>0&&a.getRangeAt(0);r.append(s),s.select(),s.selectionStart=0,s.selectionEnd=e.length;var i=!1;try{i=document.execCommand("copy")}catch(l){}return s.remove(),c&&(a.removeAllRanges(),a.addRange(c)),o&&o.focus(),i}n.d(t,{A:()=>r})}}]);