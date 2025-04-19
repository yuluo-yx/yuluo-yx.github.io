"use strict";(self.webpackChunkblog=self.webpackChunkblog||[]).push([[4582],{40930:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>i,default:()=>m,frontMatter:()=>a,metadata:()=>r,toc:()=>c});var r=n(30139),l=n(25105),o=n(89999);const a={slug:"opentelemetry-project",title:"Opentelemetry \u9879\u76ee\u89e3\u8bfb",date:new Date("2025-04-19T17:44:00.000Z"),authors:"yuluo",tags:["Opentelemetry-java-instrumentation","OT","Java","OTEL"],keywords:["OT","Java","OTEL"],image:"/img/otel/ot-1.png"},i="Opentelemetry-java-instrumentation \u89e3\u8bfb",s={authorsImageUrls:[void 0]},c=[{value:"1. \u4ec0\u4e48\u662f Opentelmetry",id:"1-\u4ec0\u4e48\u662f-opentelmetry",level:2},{value:"1.1 OpenTelmetry \u67b6\u6784",id:"11-opentelmetry-\u67b6\u6784",level:3},{value:"1.1.1 \u5ba2\u6237\u7aef",id:"111-\u5ba2\u6237\u7aef",level:3},{value:"1.1.2 Otel Collector",id:"112-otel-collector",level:4},{value:"2. Opentelmetry \u9879\u76ee",id:"2-opentelmetry-\u9879\u76ee",level:2},{value:"2.1 opentelemetry-java",id:"21-opentelemetry-java",level:3},{value:"2.2 opentelemetry-java-instrumentation",id:"22-opentelemetry-java-instrumentation",level:3},{value:"3. \u603b\u7ed3",id:"3-\u603b\u7ed3",level:2},{value:"3.1 \u53c2\u8003\u94fe\u63a5\uff1a",id:"31-\u53c2\u8003\u94fe\u63a5",level:3}];function p(e){const t={a:"a",code:"code",h2:"h2",h3:"h3",h4:"h4",img:"img",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",...(0,o.R)(),...e.components};return(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(t.h2,{id:"1-\u4ec0\u4e48\u662f-opentelmetry",children:"1. \u4ec0\u4e48\u662f Opentelmetry"}),"\n",(0,l.jsx)(t.p,{children:"Ot \u7edf\u4e00\u4e86\u53ef\u89c2\u6d4b\u7684\u4e09\u4e2a\u91cd\u8981\u7ef4\u5ea6\uff1a\u5206\u522b\u662f Trace\uff0cLog\uff0cMetrics\u3002"}),"\n",(0,l.jsx)(t.p,{children:"\u5728\u6ca1\u6709 ot \u4e4b\u524d\uff0c\u4e0d\u540c\u7ef4\u5ea6\u7684\u53ef\u89c2\u6d4b\u7ec4\u4ef6\u90fd\u662f\u4e0d\u540c\u7684\uff1a"}),"\n",(0,l.jsxs)(t.ol,{children:["\n",(0,l.jsx)(t.li,{children:"\u5728 Trace \u9886\u57df\uff1askywalking \u4e00\u76f4\u5f88\u53d7\u6b22\u8fce\uff1b"}),"\n",(0,l.jsx)(t.li,{children:"\u5728 Metrics \u9886\u57df\uff1a\u4e3b\u8981\u4ee5 Prometheus \u4e3a\u4e3b\uff0cVictoriaMetric \u4e5f\u5f88\u53d7\u6b22\u8fce\uff0c\u5360\u7528\u8d44\u6e90\u66f4\u5c11\uff1b"}),"\n",(0,l.jsx)(t.li,{children:"\u5728 Log \u9886\u57df\uff1aELK \u7ecf\u4e45\u4e0d\u8870\u3002"}),"\n"]}),"\n",(0,l.jsx)(t.p,{children:"\u4e0d\u8fc7\u4e3a\u4e86\u89e3\u51b3\u53ef\u89c2\u6d4b\u8fd9\u4e00\u95ee\u9898\uff0c\u540c\u65f6\u5f15\u5165\u4e09\u4e2a\u7ec4\u4ef6\uff0c\u5bfc\u81f4\u6280\u672f\u6808\u4f17\u591a\uff0c\u7ef4\u62a4\u9ebb\u70e6\u3002ot \u4fbf\u662f\u4e3a\u4e86\u89e3\u51b3\u8fd9\u4e2a\u95ee\u9898\uff0c\u8ba9\u5f00\u53d1\u8005\u80fd\u82b1\u8d39\u5c11\u91cf\u7cbe\u529b\u5b8c\u6210\u53ef\u89c2\u6d4b\u5efa\u8bbe\u3002"}),"\n",(0,l.jsx)(t.p,{children:"\u7531  OpenTracing\uff0cOpenCensus \u5408\u5e76\u5171\u540c\u53d1\u5c55\u800c\u6765\u3002\u73b0\u5728\u5df2\u7ecf\u662f CNCF \u7684\u9876\u7ea7\u9879\u76ee\u4e86\uff0c\u5e76\u4e14\u53d7\u5230\u4e86\u5f88\u591a\u5927\u5382\u7684\u652f\u6301\u3002"}),"\n",(0,l.jsx)(t.h3,{id:"11-opentelmetry-\u67b6\u6784",children:"1.1 OpenTelmetry \u67b6\u6784"}),"\n",(0,l.jsx)(t.p,{children:(0,l.jsx)(t.img,{alt:"ot \u67b6\u6784",src:n(4985).A+"",width:"1400",height:"670"})}),"\n",(0,l.jsx)(t.p,{children:"\u4ece\u4e0a\u56fe\u4e2d\u770b\u5230\uff0c\u6574\u4e2a Oentelmetry \u7cfb\u7edf\u53ef\u4ee5\u5206\u4e3a\u4e09\u4e2a\u7ec4\u6210\u90e8\u5206\u3002"}),"\n",(0,l.jsx)(t.h3,{id:"111-\u5ba2\u6237\u7aef",children:"1.1.1 \u5ba2\u6237\u7aef"}),"\n",(0,l.jsx)(t.p,{children:"\u5ba2\u6237\u7aef\u5c31\u662f\u6211\u4eec\u7f16\u5199\u5f97\u4e1a\u52a1\u7cfb\u7edf\u7684\u670d\u52a1\uff0c\u7528 Go \u6216\u8005 Java \u7f16\u5199\u3002\u5982\u679c\u662f Java \u5e94\u7528\uff0c\u5728 ot \u4e2d\uff0c\u53ea\u9700\u8981\u6302\u8f7d\u4e00\u4e2a agent \u5c31\u53ef\u4ee5\u91c7\u96c6\u5230\u7cfb\u7edf\u7684\u6307\u6807\uff0c\u94fe\u8def\u548c\u65e5\u5fd7\u6570\u636e\u4e0a\u4f20\u5230 Collector \u4e2d\u3002\u65e2\u67b6\u6784\u56fe\u4e2d\u7684\u5de6\u8fb9\u90e8\u5206\u3002"}),"\n",(0,l.jsx)(t.h4,{id:"112-otel-collector",children:"1.1.2 Otel Collector"}),"\n",(0,l.jsx)(t.p,{children:(0,l.jsx)(t.img,{alt:"ot collector",src:n(65250).A+"",width:"984",height:"698"})}),"\n",(0,l.jsx)(t.p,{children:"ot \u5728\u8bbe\u8ba1\u6700\u521d\u7684\u76ee\u7684\u662f\u8981\u505a\u5230\u5382\u5546\u65e0\u5173\u6027\uff0c\u4e0d\u548c\u4efb\u610f\u4e00\u4e2a\u5382\u5546\u6216\u8005\u4ea7\u54c1\u7ed1\u5b9a\u3002\u56e0\u6b64\u5728 collector \u505a\u4e86\u66f4\u9ad8\u5c42\u7684\u62bd\u8c61\u8bbe\u8ba1\u3002"}),"\n",(0,l.jsx)(t.p,{children:"\u5982\u56fe\u4e2d\u7684\u6570\u636e\u63a5\u53d7\u548c\u5bfc\u51fa\u7ec4\u4ef6\uff0cReceiver\u548c Exporter\u3002\u90fd\u91c7\u7528\u53ef\u63d2\u62d4\u7684\u8bbe\u8ba1\u65b9\u5f0f\u3002\u7b2c\u4e09\u65b9\u7684\u5f00\u53d1\u8005\u53ef\u4ee5\u57fa\u4e8e ot \u7684\u6807\u51c6\u534f\u8bae\u5f00\u53d1\u4e0d\u540c\u7684 Receiver\u548c Exporter \u7ec4\u4ef6\u6765\u517c\u5bb9\u4e0d\u540c\u7684\u4ea7\u54c1\uff0c\u4ece\u800c\u505a\u5230\u5382\u5546\u65e0\u5173\u6027\u3002"}),"\n",(0,l.jsx)(t.p,{children:"Receiver\uff1a\u7528\u4e8e\u63a5\u53d7\u5ba2\u6237\u7aef\u4e0a\u62a5\u7684\u6570\u636e\uff0c\u4e0d\u6b62\u662f\u6765\u81ea agent \u7684\u6570\u636e\uff0c\u4e5f\u6709\u53ef\u80fd\u6765\u81ea\u4e0d\u540c\u7684\u670d\u52a1\u4ea7\u54c1\u3002\u4f8b\u5982 k8s\uff0ckafka \u7b49\u3002"}),"\n",(0,l.jsx)(t.p,{children:"Exporter\uff1a\u5728\u63a5\u6536\u5230 Receiver\u7684\u6570\u636e\uff0c\u7531 collector \u5904\u7406\u4e4b\u540e\u53ef\u4ee5\u5c06\u5176\u8f93\u51fa\u5230\u4e0d\u540c\u7684\u7ec4\u4ef6\u4e2d\uff0c\u6bd4\u5982\uff1aKafka\uff0cJaeger \u7b49\u3002"}),"\n",(0,l.jsx)(t.p,{children:"\u5728\u4f7f\u7528 ot \u65f6\uff0c\u6211\u4eec\u53ef\u4ee5\u4f7f\u7528 Nginx Receiver\u63a5\u53d7\u6765\u81ea nginx \u7684\u6570\u636e\uff0c\u4f7f\u7528 MySQL Receiver\u63a5\u53d7\u6765\u81ea MySQL \u7684\u6570\u636e\u7b49\u3002\u901a\u5e38\u4f7f\u7528\u6700\u591a\u7684\u662f otel Receiver\uff0cot \u5b98\u65b9\u7684 OTLP \u534f\u8bae\u7684\u6570\u636e\u63a5\u6536\u5668\uff0c\u63a5\u53d7\u6765\u81ea ot \u7684\u4e00\u4e9b\u6307\u6807\u3002\u4f8b\u5982\u53ea\u4f7f\u7528\u4e86 Java agent \u4e0a\u62a5\u53ef\u89c2\u6d4b\u6570\u636e\u65f6\u3002"}),"\n",(0,l.jsx)(t.p,{children:"Exporter \u4e3b\u8981\u8d1f\u8d23\u5c06\u4e0d\u540c\u7684\u6307\u6807\u6570\u636e\u5199\u5165\u5230\u4e0d\u540c\u7684\u7ec4\u4ef6\u4e2d\uff0c\u4f8b\u5982\u5c06\u6307\u6807\u76f8\u5173\u6570\u636e\u5199\u5165\u5230 Prometheus\uff0c\u65e5\u5fd7\u5199\u5165\u5230 es \u7b49\u3002"}),"\n",(0,l.jsx)(t.p,{children:"\u5bf9\u6bd4\u4e4b\u4e0b\uff0cot collector \u7684 Receiver \u548c Exporter \u53ef\u4ee5\u975e\u5e38\u7075\u6d3b\u7684\u642d\u914d\uff0c\u6570\u636e\u5b58\u50a8\u7684\u53d8\u66f4\uff0c\u4e0d\u4f1a\u76f4\u63a5\u5f71\u54cd\u5230\u4e1a\u52a1\u7cfb\u7edf\u3002\u4e1a\u52a1\u7cfb\u7edf\u53ea\u9700\u8981\u6309\u7167 OTLP \u534f\u8bae\u7684\u683c\u5f0f\u4e0a\u62a5\u6570\u636e\u5373\u53ef\u3002"}),"\n",(0,l.jsx)(t.h2,{id:"2-opentelmetry-\u9879\u76ee",children:"2. Opentelmetry \u9879\u76ee"}),"\n",(0,l.jsx)(t.p,{children:"\u4ece\u4e0a\u9762\u7684\u67b6\u6784\u56fe\u4e86\u89e3\u5230\uff1aot \u7684\u6574\u4e2a\u9879\u76ee\u4e3b\u8981\u5206\u4e3a\u5ba2\u6237\u7aef\u548c collector \u7aef\u3002\u9664\u4e86 java \u4e4b\u5916\uff0cot \u8fd8\u652f\u6301\u5176\u4ed6\u8bed\u8a00\u7684\u5ba2\u6237\u7aef\u3002\u5927\u90e8\u5206\u90fd\u8fbe\u5230\u4e86\u751f\u4ea7\u53ef\u7528\u7684\u7a0b\u5ea6\u3002"}),"\n",(0,l.jsx)(t.p,{children:"\u63a5\u4e0b\u6765\uff0c\u6df1\u5165\u4e86\u89e3\u4e0b opentelemetry-java \u548c opentelemetry-java-instrumentation\u3002"}),"\n",(0,l.jsx)(t.p,{children:"\u5728\u65e5\u5e38\u4f7f\u7528\u4e2d\uff0c\u7528\u5230\u6700\u591a\u7684\u9879\u76ee\u662f\uff1aopentelemetry-java-instrumentation\u3002\u63d0\u4f9b\u4e86 ot \u7684 java agent \u3002"}),"\n",(0,l.jsx)(t.p,{children:"\u5728\u542f\u52a8\u9879\u76ee\u65f6\uff0c\u53ea\u9700\u8981\u52a0\u4e0a java agent \u5c31\u53ef\u4ee5\u81ea\u52a8\u5b9e\u73b0\u53ef\u89c2\u6d4b\u6570\u636e\u7684\u4e0a\u62a5\uff1a"}),"\n",(0,l.jsx)(t.pre,{children:(0,l.jsx)(t.code,{className:"language-shell",children:"java -javaagent:path/to/opentelemetry-javaagent.jar -jar myapp.jar\n"})}),"\n",(0,l.jsx)(t.h3,{id:"21-opentelemetry-java",children:"2.1 opentelemetry-java"}),"\n",(0,l.jsx)(t.p,{children:"opentelemetry-java-instrumentation \u57fa\u4e8e opentelemetry-java \u521b\u5efa\u3002\u662f ot Java \u7248\u672c\u7684\u6838\u5fc3\u57fa\u7840\u5e93\u3002"}),"\n",(0,l.jsx)(t.h3,{id:"22-opentelemetry-java-instrumentation",children:"2.2 opentelemetry-java-instrumentation"}),"\n",(0,l.jsx)(t.p,{children:"\u96c6\u6210\u4e86\u5e38\u7528\u7684 Java \u7684\u4e0d\u540c\u6846\u67b6\uff0c\u5e93\u7684\u53ef\u89c2\u6d4b\u6570\u636e\u3002"}),"\n",(0,l.jsxs)(t.p,{children:["\u5176\u4ed6\u9879\u76ee\u5927\u81f4\u7ed3\u6784\u7c7b\u4f3c\u3002\u4f8b\u5982 collector \u5206\u4e3a\uff1a",(0,l.jsx)(t.strong,{children:"OpenTelemetry Collector"})," \u548c ",(0,l.jsx)(t.strong,{children:"OpenTelemetry Collector Contrib"})]}),"\n",(0,l.jsx)(t.p,{children:"opentelemetry-collector\uff1a\u7531 ot \u5b98\u65b9\u7ef4\u62a4\uff0c\u63d0\u4f9b\u6700\u57fa\u7840\u7684\u6838\u5fc3\u80fd\u529b\uff1b\u6bd4\u5982\u53ea\u5305\u542b\u4e86\u6700\u57fa\u672c\u7684 otlp \u7684 receiver \u548c exporter\u3002"}),"\n",(0,l.jsx)(t.p,{children:"opentelemetry-collector-contrib\uff1a\u5305\u542b\u4e86\u5b98\u65b9\u7684 collector\uff0c\u540c\u65f6\u7ef4\u62a4\u4e86\u793e\u533a\u63d0\u4f9b\u7684\u5404\u79cd receiver \u548c exporter\uff1b\u5c31\u5982\u4e0a\u6587\u63d0\u5230\u7684\uff0c\u4e00\u4e9b\u793e\u533a\u7ec4\u4ef6\uff08pulsar\u3001MySQL\u3001Kafka\uff09\u7b49\u90fd\u7ef4\u62a4\u5728\u8fd9\u4e2a\u4ed3\u5e93\u3002"}),"\n",(0,l.jsx)(t.h2,{id:"3-\u603b\u7ed3",children:"3. \u603b\u7ed3"}),"\n",(0,l.jsx)(t.p,{children:"OpenTelemetry \u60f3\u8981\u89e3\u51b3\u7684\u662f\u6574\u4e2a\u53ef\u89c2\u6d4b\u9886\u57df\u7684\u6240\u6709\u9700\u6c42\uff0c\u505a\u5230\u771f\u6b63\u7684\u5382\u5546\u65e0\u5173\u6027\uff0c\u56e0\u6b64\u81ea\u8eab\u6709\u975e\u5e38\u591a\u7684 Receiver \u548c Exporter\u3002"}),"\n",(0,l.jsx)(t.p,{children:"\u4e0b\u4e00\u7bc7\u6587\u7ae0\u4e2d\uff0c\u5c06\u4f1a\u4ecb\u7ecd\u5982\u4f55\u5728 opentelemetry-java-instrumentation \u4ed3\u5e93\u4e2d\u4e3a Java \u5e93\u548c\u6846\u67b6\u63d0\u4f9b\u53ef\u89c2\u6d4b\u652f\u6301\u3002"}),"\n",(0,l.jsx)(t.h3,{id:"31-\u53c2\u8003\u94fe\u63a5",children:"3.1 \u53c2\u8003\u94fe\u63a5\uff1a"}),"\n",(0,l.jsx)(t.p,{children:(0,l.jsx)(t.a,{href:"https://juejin.cn/post/7358450927110357026?from=search-suggest",children:"https://juejin.cn/post/7358450927110357026?from=search-suggest"})}),"\n",(0,l.jsx)(t.p,{children:(0,l.jsx)(t.a,{href:"https://opentelemetry.io/ecosystem/registry/",children:"https://opentelemetry.io/ecosystem/registry/"})}),"\n",(0,l.jsx)(t.p,{children:(0,l.jsx)(t.a,{href:"https://github.com/open-telemetry/opentelemetry-java-instrumentation",children:"open-telemetry/opentelemetry-java-instrumentation: OpenTelemetry auto-instrumentation and instrumentation libraries for Java"})}),"\n",(0,l.jsx)(t.p,{children:(0,l.jsx)(t.a,{href:"https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md#libraries--frameworks",children:"https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md#libraries--frameworks"})})]})}function m(e={}){const{wrapper:t}={...(0,o.R)(),...e.components};return t?(0,l.jsx)(t,{...e,children:(0,l.jsx)(p,{...e})}):p(e)}},4985:(e,t,n)=>{n.d(t,{A:()=>r});const r=n.p+"assets/images/ot-1-9ecb5fc7630c2aa60d7aac6b90d569be.png"},65250:(e,t,n)=>{n.d(t,{A:()=>r});const r=n.p+"assets/images/ot-2-eabbe2f740abac90c5c8e9dc18df0b14.png"},89999:(e,t,n)=>{n.d(t,{R:()=>a,x:()=>i});var r=n(58101);const l={},o=r.createContext(l);function a(e){const t=r.useContext(o);return r.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function i(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(l):e.components||l:a(e.components),r.createElement(o.Provider,{value:t},e.children)}},30139:e=>{e.exports=JSON.parse('{"permalink":"/blog/opentelemetry-project","editUrl":"https://github.com/yuluo-yx/blog/edit/master/blog/otel/Opentelemetry-java-instrumentation \u89e3\u8bfb.md","source":"@site/blog/otel/Opentelemetry-java-instrumentation \u89e3\u8bfb.md","title":"Opentelemetry \u9879\u76ee\u89e3\u8bfb","description":"1. \u4ec0\u4e48\u662f Opentelmetry","date":"2025-04-19T17:44:00.000Z","tags":[{"inline":true,"label":"Opentelemetry-java-instrumentation","permalink":"/blog/tags/opentelemetry-java-instrumentation"},{"inline":true,"label":"OT","permalink":"/blog/tags/ot"},{"inline":true,"label":"Java","permalink":"/blog/tags/java"},{"inline":true,"label":"OTEL","permalink":"/blog/tags/otel"}],"readingTime":3.44,"hasTruncateMarker":true,"authors":[{"name":"\u7267\u751f","title":"Java & go developer","url":"https://github.com/yuluo-yx","email":"yuluo08290126@gmail.com","socials":{"x":"https://x.com/yuluo","github":"https://github.com/yuluo-yx"},"imageURL":"https://kuizuo.cn/img/logo.png","key":"yuluo","page":null}],"frontMatter":{"slug":"opentelemetry-project","title":"Opentelemetry \u9879\u76ee\u89e3\u8bfb","date":"2025-04-19T17:44:00.000Z","authors":"yuluo","tags":["Opentelemetry-java-instrumentation","OT","Java","OTEL"],"keywords":["OT","Java","OTEL"],"image":"/img/otel/ot-1.png"},"unlisted":false,"nextItem":{"title":"Spring AI \u53ef\u89c2\u6d4b\u6027","permalink":"/blog/spring-ai-alibaba-observations"}}')}}]);