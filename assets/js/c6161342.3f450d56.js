"use strict";(self.webpackChunkblog=self.webpackChunkblog||[]).push([[5867],{94903:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>d,contentTitle:()=>r,default:()=>u,frontMatter:()=>o,metadata:()=>t,toc:()=>c});var t=s(77932),i=s(25105),l=s(89999);const o={slug:"use-kind-build-k8s-cluster",title:"\u4f7f\u7528 Kind \u6a21\u62df k8s \u96c6\u7fa4",date:new Date("2025-02-09T14:26:00.000Z"),authors:"yuluo",tags:["Cloud Native","Kind","Kuberneters"],keywords:["Cloud Native","Kind","Kubernetes"],images:"/img/cloud-native/kind.png"},r=void 0,d={authorsImageUrls:[void 0]},c=[{value:"\u5b89\u88c5 Docker",id:"\u5b89\u88c5-docker",level:2},{value:"\u5b89\u88c5 Kind",id:"\u5b89\u88c5-kind",level:2},{value:"\u542f\u52a8 k8s \u96c6\u7fa4",id:"\u542f\u52a8-k8s-\u96c6\u7fa4",level:2},{value:"\u67e5\u770b\u96c6\u7fa4\u8d44\u6e90",id:"\u67e5\u770b\u96c6\u7fa4\u8d44\u6e90",level:3},{value:"Docker container \u67e5\u770b",id:"docker-container-\u67e5\u770b",level:3},{value:"\u5e38\u7528\u7684 kind \u547d\u4ee4",id:"\u5e38\u7528\u7684-kind-\u547d\u4ee4",level:2},{value:"kind K8s \u96c6\u7fa4\u7684\u505c\u6b62\u548c\u91cd\u542f",id:"kind-k8s-\u96c6\u7fa4\u7684\u505c\u6b62\u548c\u91cd\u542f",level:2}];function a(e){const n={a:"a",code:"code",h2:"h2",h3:"h3",p:"p",pre:"pre",...(0,l.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.h2,{id:"\u5b89\u88c5-docker",children:"\u5b89\u88c5 Docker"}),"\n",(0,i.jsxs)(n.p,{children:["Docker Desktop\uff1a",(0,i.jsx)(n.a,{href:"https://docs.docker.com/desktop/setup/install/mac-install/",children:"https://docs.docker.com/desktop/setup/install/mac-install/"})]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:"$ docker --version \nDocker version 27.4.0, build bde2b89\n"})}),"\n",(0,i.jsx)(n.h2,{id:"\u5b89\u88c5-kind",children:"\u5b89\u88c5 Kind"}),"\n",(0,i.jsx)(n.p,{children:"\u4f7f\u7528 kind \u6a21\u62df K8s \u96c6\u7fa4\uff1a"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:"# \u76f4\u63a5\u4f7f\u7528 brew \u5b89\u88c5\nbrew install kind\n\n# \u67e5\u770b\u7248\u672c\n$ kind --version\nkind version 0.26.0\n\n# kubectl \u7248\u672c\n$ kubectl version  \nClient Version: v1.30.5\nKustomize Version: v5.0.4-0.20230601165947-6ce0bf390ce3\n"})}),"\n",(0,i.jsx)(n.h2,{id:"\u542f\u52a8-k8s-\u96c6\u7fa4",children:"\u542f\u52a8 k8s \u96c6\u7fa4"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:'$ kind create cluster --name istio-k8s\nCreating cluster "istio-k8s" ...\n \u2713 Ensuring node image (kindest/node:v1.32.0) \ud83d\uddbc \n \u2713 Preparing nodes \ud83d\udce6  \n \u2713 Writing configuration \ud83d\udcdc \n \u2713 Starting control-plane \ud83d\udd79\ufe0f \n \u2713 Installing CNI \ud83d\udd0c \n \u2713 Installing StorageClass \ud83d\udcbe \nSet kubectl context to "kind-istio-k8s"\nYou can now use your cluster with:\n\nkubectl cluster-info --context kind-istio-k8s\n\nHave a question, bug, or feature request? Let us know! https://kind.sigs.k8s.io/#community \ud83d\ude42\n'})}),"\n",(0,i.jsx)(n.h3,{id:"\u67e5\u770b\u96c6\u7fa4\u8d44\u6e90",children:"\u67e5\u770b\u96c6\u7fa4\u8d44\u6e90"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:"$ kgpa\nNAMESPACE            NAME                                              READY   STATUS    RESTARTS   AGE\nkube-system          coredns-668d6bf9bc-62mtm                          1/1     Running   0          62s\nkube-system          coredns-668d6bf9bc-7vd5d                          1/1     Running   0          62s\nkube-system          etcd-istio-k8s-control-plane                      1/1     Running   0          70s\nkube-system          kindnet-94phb                                     1/1     Running   0          62s\nkube-system          kube-apiserver-istio-k8s-control-plane            1/1     Running   0          70s\nkube-system          kube-controller-manager-istio-k8s-control-plane   1/1     Running   0          69s\nkube-system          kube-proxy-6kz4m                                  1/1     Running   0          62s\nkube-system          kube-scheduler-istio-k8s-control-plane            1/1     Running   0          69s\nlocal-path-storage   local-path-provisioner-58cc7856b6-q6rvb           1/1     Running   0          62s\n"})}),"\n",(0,i.jsx)(n.h3,{id:"docker-container-\u67e5\u770b",children:"Docker container \u67e5\u770b"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:'$ docker ps                       \nCONTAINER ID   IMAGE                  COMMAND                   CREATED         STATUS              PORTS                       NAMES\n17df49a0e07c   kindest/node:v1.32.0   "/usr/local/bin/entr\u2026"   2 minutes ago   Up About a minute   127.0.0.1:62209->6443/tcp   istio-k8s-control-plane\n'})}),"\n",(0,i.jsx)(n.h2,{id:"\u5e38\u7528\u7684-kind-\u547d\u4ee4",children:"\u5e38\u7528\u7684 kind \u547d\u4ee4"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:"# \u83b7\u53d6\u5f53\u524d\u7684\u96c6\u7fa4\u5217\u8868\nkind get clusters\n\n# \u6307\u5b9a kubectl \u4f7f\u7528\u7684 kind \u96c6\u7fa4\nkubectl cluster-info --context \u96c6\u7fa4\u540d\u5b57\n\n# \u67e5\u770b\u67d0\u4e2a\u96c6\u7fa4\u7684\u914d\u7f6e\u4fe1\u606f\nkind get kubeconfig --name=kind\n\n# \u5220\u9664\u51e0\u5708\nkind delete cluster kind\n"})}),"\n",(0,i.jsx)(n.h2,{id:"kind-k8s-\u96c6\u7fa4\u7684\u505c\u6b62\u548c\u91cd\u542f",children:"kind K8s \u96c6\u7fa4\u7684\u505c\u6b62\u548c\u91cd\u542f"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:'# \u53ef\u4ee5\u76f4\u63a5\u4f7f\u7528 docker \u63a7\u5236\n$ docker ps \nCONTAINER ID   IMAGE                  COMMAND                   CREATED         STATUS         PORTS                       NAMES\n17df49a0e07c   kindest/node:v1.32.0   "/usr/local/bin/entr\u2026"   7 minutes ago   Up 7 minutes   127.0.0.1:62209->6443/tcp   istio-k8s-control-plane\n\n# kind \u96c6\u7fa4\u7684 container \u4e3a 17df49a0e07c\n\n# \u505c\u6b62\ndocker stop 17df49a0e07c\n\n# \u4f7f\u7528 kgpa \u9a8c\u8bc1\n$ kgpa\nThe connection to the server 127.0.0.1:62209 was refused - did you specify the right host or port?\n\n# kind \u96c6\u7fa4\u5df2\u7ecf\u6210\u529f\u505c\u6b62\n'})})]})}function u(e={}){const{wrapper:n}={...(0,l.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(a,{...e})}):a(e)}},89999:(e,n,s)=>{s.d(n,{R:()=>o,x:()=>r});var t=s(58101);const i={},l=t.createContext(i);function o(e){const n=t.useContext(l);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function r(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:o(e.components),t.createElement(l.Provider,{value:n},e.children)}},77932:e=>{e.exports=JSON.parse('{"permalink":"/blog/use-kind-build-k8s-cluster","editUrl":"https://github.com/yuluo-yx/blog/edit/master/blog/cloud-native/\u4f7f\u7528 kind \u6a21\u62df k8s \u96c6\u7fa4.md","source":"@site/blog/cloud-native/\u4f7f\u7528 kind \u6a21\u62df k8s \u96c6\u7fa4.md","title":"\u4f7f\u7528 Kind \u6a21\u62df k8s \u96c6\u7fa4","description":"\u5b89\u88c5 Docker","date":"2025-02-09T14:26:00.000Z","tags":[{"inline":true,"label":"Cloud Native","permalink":"/blog/tags/cloud-native"},{"inline":true,"label":"Kind","permalink":"/blog/tags/kind"},{"inline":true,"label":"Kuberneters","permalink":"/blog/tags/kuberneters"}],"readingTime":1.3,"hasTruncateMarker":false,"authors":[{"name":"\u7267\u751f","title":"Java & go developer","url":"https://github.com/yuluo-yx","email":"yuluo08290126@gmail.com","socials":{"x":"https://x.com/yuluo","github":"https://github.com/yuluo-yx"},"imageURL":"https://kuizuo.cn/img/logo.png","key":"yuluo","page":null}],"frontMatter":{"slug":"use-kind-build-k8s-cluster","title":"\u4f7f\u7528 Kind \u6a21\u62df k8s \u96c6\u7fa4","date":"2025-02-09T14:26:00.000Z","authors":"yuluo","tags":["Cloud Native","Kind","Kuberneters"],"keywords":["Cloud Native","Kind","Kubernetes"],"images":"/img/cloud-native/kind.png"},"unlisted":false,"prevItem":{"title":"\u672c\u5730\u90e8\u7f72\u548c\u4f7f\u7528 Dubbo-Kubernetes","permalink":"/blog/dubbo-kubernetes-local-run"},"nextItem":{"title":"\u4f7f\u7528 docusaurus \u66f4\u65b0 Blog","permalink":"/blog/blog-update"}}')}}]);