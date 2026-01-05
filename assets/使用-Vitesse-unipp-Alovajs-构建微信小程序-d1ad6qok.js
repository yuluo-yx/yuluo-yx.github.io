const n=`---
slug: use-vitesse-unipp-and-alovajs-build-wechatminiapp
title: 使用 Vitesse unipp & Alovajs 构建微信小程序
date: 2024-09-10 22:57:50
authors: yuluo
tags: [Vue3, Uniapp, 微信小程序]
keywords: [Vue3, Uniapp, 微信小程序]
---

<!-- truncate -->

## 组件介绍

> Vitesse Uni App：https://vitesse-docs.netlify.app/
>
> UI：https://uview-plus.jiangruyi.com/components/intro.html
>
> 编辑器：VScode 安装 Volar（Vue Offices）插件

## 创建项目

\`\`\`shell
pnpm create uni <project-name> -t vitesse
\`\`\`

## 创建页面

参考：https://vitesse-docs.netlify.app/getting-started/views

创建方式非常简单，即看即会

## 引入 UI 库

> 这步稍微有些麻烦。
>
> 安装文档地址：https://uview-plus.jiangruyi.com/components/install.html
>
> 配置文档地址：https://uview-plus.jiangruyi.com/components/npmSetting.html

### 安装 Sass

\`\`\`shell
// 安装sass
npm i sass -D

// 安装sass-loader，注意需要版本10，否则可能会导致vue与sass的兼容问题而报错
npm i sass-loader@10 -D
\`\`\`

#### 安装依赖

\`\`\`shell
npm install uview-plus
npm install dayjs
npm install clipboard
\`\`\`

#### 引入 JS 库

\`\`\`js
// main.js
import uviewPlus from 'uview-plus'

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  app.use(uviewPlus)
  return {
    app
  }
}
// #endif
\`\`\`

#### 引入全局 CSS

\`\`\`css
/* uni.scss */
@import 'uview-plus/theme.scss';
\`\`\`

#### 引入基础样式

\`\`\`css
<style lang="scss">
 /* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
 @import "uview-plus/index.scss";
</style>
\`\`\`

#### 配置 easycom 模式

参考：https://uview-plus.jiangruyi.com/components/npmSetting.html#%E9%85%8D%E7%BD%AEeasycom%E7%BB%84%E4%BB%B6%E6%A8%A1%E5%BC%8F

\`\`\`json
// pages.json
{
 "easycom": {
  "autoscan": true,
  // 注意一定要放在custom里，否则无效，https://ask.dcloud.net.cn/question/131175
  "custom": {
   "^u--(.*)": "uview-plus/components/u-$1/u-$1.vue",
   "^up-(.*)": "uview-plus/components/u-$1/u-$1.vue",
         "^u-([^-].*)": "uview-plus/components/u-$1/u-$1.vue"
  }
 },
 
 // 此为本身已有的内容
 "pages": [
  // ......
 ]
}
\`\`\`

#### 配置 typescript 支持

\`\`\`json
{
 "compilerOptions": {
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "lib": ["esnext", "dom"],
    "types": [
        "@dcloudio/types",
        "uview-plus/types"
    ]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"]
}
\`\`\`

## 启动项目查看

\`\`\`shell
npm run dev:h5
\`\`\`

![预览图片](/img/wechat/image.png)

### 踩坑记录

在 pages.json 中配置 easycom 配置时，再次重新启动项目，会导致 pages.json 中的文件刷新，然后 ui 样式引入失效，需要在 pages.config.json 中配置

\`\`\`ts
import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  pages: [],
  globalStyle: {
    backgroundColor: '@bgColor',
    backgroundColorBottom: '@bgColorBottom',
    backgroundColorTop: '@bgColorTop',
    backgroundTextStyle: '@bgTxtStyle',
    navigationBarBackgroundColor: '#000000',
    navigationBarTextStyle: '@navTxtStyle',
    navigationBarTitleText: 'Vitesse-Uni',
    navigationStyle: 'custom',
  },
  // tabBar: {
  //   backgroundColor: "@tabBgColor",
  //   borderStyle: "@tabBorderStyle",
  //   color: "@tabFontColor",
  //   selectedColor: "@tabSelectedColor",
  // },
  "easycom": {
  "autoscan": true,
  "custom": {
   "^u--(.*)": "uview-plus/components/u-$1/u-$1.vue",
   "^up-(.*)": "uview-plus/components/u-$1/u-$1.vue",
         "^u-([^-].*)": "uview-plus/components/u-$1/u-$1.vue"
  }
 },
})
]
\`\`\`

## 使用 alova.js 作为小程序的请求工具

官网：https://alova.js.org/zh-CN/

unipp 插件：https://alova.js.org/zh-CN/resource/request-adapter/uniapp

### 安装

\`\`\`shell
npm install @alova/adapter-uniapp --save
\`\`\`

### 封装

index.ts

\`\`\`ts
//index.ts
import { createAlova } from 'alova'
import AdapterUniapp from '@alova/adapter-uniapp';
 
export const AlovaInstance = createAlova({
  
  baseURL: 'http://localhost:8080/api/v1/',

  // https://alova.js.org/zh-CN/resource/request-adapter/uniapp#%E5%88%9B%E5%BB%BA-alova
  ...AdapterUniapp(),
 
  // 请求拦截器
  beforeRequest() {
    
  },
  // 响应拦截器
  responded: {
     
  }

})
\`\`\`

api.ts

\`\`\`ts
import { AlovaInstance } from './index'
 
const headers = { 'Content-Type': 'application/json;charset=UTF-8' }
const timeout = 5000
 
export const Alova = {

  createGet(url: string, params?: Record<string, any>) {
    return AlovaInstance.Get(url, {
      headers,
      params,
      timeout
    })
  },

  createPost(url: string, data: Record<string, any>, params: Record<string, any>) {
    return AlovaInstance.Post(url, data, {
      params
    })
  },

  createTodoPut(url: string, data: Record<string, any>, params: Record<string, any>) {
    return AlovaInstance.Put(url,data, {
      params
    })
  },

  createDelete(url: string, data?: Record<string, any>, params?: Record<string, any>) {
    return AlovaInstance.Put(url,data, {
      params
    })
  }

}
\`\`\`

service.ts

\`\`\`ts
import {Alova} from "./api"

// Law notice
export const getLawNotice = () => {return Alova.createGet("law")}

\`\`\`

调用：

\`\`\`ts
<script lang="ts" setup>
import {getLawNotice} from "../alova/service"
import {concatenate, ulg} from "../utils/strings/index";

// data
const content = ref<string>("")
// const law 

// request api
const getLawList = async () => {
  await getLawNotice().then((result: any) => {
    // check status code
    if (result.statusCode === 200) {
      // get data
      let lawList = result.data.data;
      for (let i = 0; i < lawList.length; i++) {
        let text = lawList[i].text;
        // ulg(text)
        content.value = concatenate(content.value, " ", text)
      }
    }
  }).catch((err: any) => {
    alert(err)
  })
}
\`\`\`
`;export{n as default};
