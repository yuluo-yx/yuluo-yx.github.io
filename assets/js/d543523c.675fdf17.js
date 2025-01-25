"use strict";(self.webpackChunkblog=self.webpackChunkblog||[]).push([[3834],{33109:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>a,contentTitle:()=>l,default:()=>m,frontMatter:()=>s,metadata:()=>n,toc:()=>u});const n=JSON.parse('{"id":"column/microservice/introduction","title":"\u5fae\u670d\u52a1","description":"\u8fd9\u91cc\u5c06\u4f1a\u653e\u4e00\u4e9b\u548c\u5fae\u670d\u52a1\u76f8\u5173\u7684\u6587\u6863...","source":"@site/docs/column/microservice/introduction.mdx","sourceDirName":"column/microservice","slug":"/microservice-introduction","permalink":"/docs/microservice-introduction","draft":false,"unlisted":false,"tags":[{"inline":true,"label":"column\uff0cmicroservice","permalink":"/docs/tags/column\uff0cmicroservice"},{"inline":true,"label":"Spring Boot","permalink":"/docs/tags/spring-boot"},{"inline":true,"label":"go-zero","permalink":"/docs/tags/go-zero"}],"version":"current","frontMatter":{"id":"introduction","slug":"/microservice-introduction","title":"\u5fae\u670d\u52a1","date":"2025-01-25T00:00:00.000Z","authors":"yuluo","tags":["column\uff0cmicroservice","Spring Boot","go-zero"],"keywords":["column","microservice","Spring Boot","go-zero"]},"sidebar":"column","previous":{"title":"\u5927\u6a21\u578b\u4e13\u680f--AI RAG","permalink":"/docs/LLMs-AI-RAG"},"next":{"title":"Ribbon \u8d1f\u8f7d\u5747\u8861","permalink":"/docs/ribbon-source"}}');var o=t(25105),i=t(89999),c=t(64011);const s={id:"introduction",slug:"/microservice-introduction",title:"\u5fae\u670d\u52a1",date:new Date("2025-01-25T00:00:00.000Z"),authors:"yuluo",tags:["column\uff0cmicroservice","Spring Boot","go-zero"],keywords:["column","microservice","Spring Boot","go-zero"]},l="\u5fae\u670d\u52a1",a={},u=[];function d(e){const r={h1:"h1",header:"header",p:"p",...(0,i.R)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(r.header,{children:(0,o.jsx)(r.h1,{id:"\u5fae\u670d\u52a1",children:"\u5fae\u670d\u52a1"})}),"\n",(0,o.jsx)(r.p,{children:"\u8fd9\u91cc\u5c06\u4f1a\u653e\u4e00\u4e9b\u548c\u5fae\u670d\u52a1\u76f8\u5173\u7684\u6587\u6863..."}),"\n","\n",(0,o.jsx)(c.A,{})]})}function m(e={}){const{wrapper:r}={...(0,i.R)(),...e.components};return r?(0,o.jsx)(r,{...e,children:(0,o.jsx)(d,{...e})}):d(e)}},64011:(e,r,t)=>{t.d(r,{A:()=>x});t(58101);var n=t(63394),o=t(49387),i=t(42128),c=t(28031),s=t(50696),l=t(2105),a=t(71655);const u={cardContainer:"cardContainer_sGAR",cardTitle:"cardTitle_Q56X",cardDescription:"cardDescription_siM2"};var d=t(25105);function m(e){var r=e.href,t=e.children;return(0,d.jsx)(i.A,{href:r,className:(0,n.A)("card padding--lg",u.cardContainer),children:t})}function p(e){var r=e.href,t=e.icon,o=e.title,i=e.description;return(0,d.jsxs)(m,{href:r,children:[(0,d.jsxs)(a.A,{as:"h2",className:(0,n.A)("text--truncate",u.cardTitle),title:o,children:[t," ",o]}),i&&(0,d.jsx)("p",{className:(0,n.A)("text--truncate",u.cardDescription),title:i,children:i})]})}function f(e){var r,t,n=e.item,i=(0,o.Nr)(n),s=(t=(0,c.W)().selectMessage,function(e){return t(e,(0,l.T)({message:"1 item|{count} items",id:"theme.docs.DocCard.categoryDescription.plurals",description:"The default description for a category card in the generated index about how many items this category includes"},{count:e}))});return i?(0,d.jsx)(p,{href:i,icon:"\ud83d\uddc3\ufe0f",title:n.label,description:null!=(r=n.description)?r:s(n.items.length)}):null}function h(e){var r,t,n=e.item,i=(0,s.A)(n.href)?"\ud83d\udcc4\ufe0f":"\ud83d\udd17",c=(0,o.cC)(null!=(r=n.docId)?r:void 0);return(0,d.jsx)(p,{href:n.href,icon:i,title:n.label,description:null!=(t=n.description)?t:null==c?void 0:c.description})}function g(e){var r=e.item;switch(r.type){case"link":return(0,d.jsx)(h,{item:r});case"category":return(0,d.jsx)(f,{item:r});default:throw new Error("unknown item type "+JSON.stringify(r))}}function v(e){var r=e.className,t=(0,o.$S)();return(0,d.jsx)(x,{items:t.items,className:r})}function x(e){var r=e.items,t=e.className;if(!r)return(0,d.jsx)(v,Object.assign({},e));var i=(0,o.d1)(r);return(0,d.jsx)("section",{className:(0,n.A)("row",t),children:i.map((function(e,r){return(0,d.jsx)("article",{className:"col col--6 margin-bottom--lg",children:(0,d.jsx)(g,{item:e})},r)}))})}},28031:(e,r,t)=>{t.d(r,{W:()=>a});var n=t(58101),o=t(4152),i=["zero","one","two","few","many","other"];function c(e){return i.filter((function(r){return e.includes(r)}))}var s={locale:"en",pluralForms:c(["one","other"]),select:function(e){return 1===e?"one":"other"}};function l(){var e=(0,o.A)().i18n.currentLocale;return(0,n.useMemo)((function(){try{return r=e,t=new Intl.PluralRules(r),{locale:r,pluralForms:c(t.resolvedOptions().pluralCategories),select:function(e){return t.select(e)}}}catch(n){return console.error('Failed to use Intl.PluralRules for locale "'+e+'".\nDocusaurus will fallback to the default (English) implementation.\nError: '+n.message+"\n"),s}var r,t}),[e])}function a(){var e=l();return{selectMessage:function(r,t){return function(e,r,t){var n=e.split("|");if(1===n.length)return n[0];n.length>t.pluralForms.length&&console.error("For locale="+t.locale+", a maximum of "+t.pluralForms.length+" plural forms are expected ("+t.pluralForms.join(",")+"), but the message contains "+n.length+": "+e);var o=t.select(r),i=t.pluralForms.indexOf(o);return n[Math.min(i,n.length-1)]}(t,r,e)}}}},89999:(e,r,t)=>{t.d(r,{R:()=>c,x:()=>s});var n=t(58101);const o={},i=n.createContext(o);function c(e){const r=n.useContext(i);return n.useMemo((function(){return"function"==typeof e?e(r):{...r,...e}}),[r,e])}function s(e){let r;return r=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:c(e.components),n.createElement(i.Provider,{value:r},e.children)}}}]);