---
slug: element-plus-upload-debug
title: Element-plus Upload Debug 记录
date: 2024-09-20 22:34:07
authors: yuluo
tags: [Element-plus]
keywords: [Element-plus, upload, Debug]
---

<!-- truncate -->

## 背景

在 Vue3 中使用 Element-plus 的文件上传组件 el-upload 组件上传至 Spring Boot 后台服务端失败，但 Postman 成功！

## 问题原因

Element-plus 中对上传的文件类型又做了一次封装，导致和后台对应的文件接受失败，出现各种各样的错误：

Element-plus 文件上传对象定义：

```ts
export interface UploadFile {
    name: string;
    percentage?: number;
    status: UploadStatus;
    size?: number;
    response?: unknown;
    uid: number;
    url?: string;
    raw?: UploadRawFile;
}

export interface UploadRawFile extends File {
    uid: number;
}
```

spring boot 后台接口

```java
    @PostMapping("/avatar")
    public Result<String> uploadAvatar(@RequestParam MultipartFile file) {

        return Result.success(uploadService.uploadAvatar(file));
    }
```

## 踩坑

### no multipart boundary was found

没有正确设置 header 中 Content-typ，在 postman 中，使用 form-data 形式上传文件，会自己设置 content-type。在 axios 中，需要手动设置

### the request was rejected because no multipart boundary was found
上传 formdata 类型的变量：

```ts
const form = new FormData()
form.append('file', file)
```

### Required part 'file' is not present.

注意上传文件时，使用 Element-plus UploadFile 属性中的 raw 属性值上传，不然就会出现此错误！

```ts
// 错误代码
const uploadFile = async (file: File) => {
    await FileAPI.uploadAvatar(file).then((res) => {
        log(res)
    })
}

// 正确代码
const uploadFile = async (file: UploadFile) => {
    await FileAPI.uploadAvatar(file.raw).then((res) => {
        log(res)
    })
}
```

## 完整代码示例

axios 接口封装

```ts
upload: async (
    url: string,
    file: File,
    config?: AxiosRequestConfig
): Promise<Result<string>> => {
    const form = new FormData()
    form.append('file', file)
    return axiosInstance.post(
        url,
        form,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
                ...(config?.headers || {}),
            },
            ...config,
        });
},
```

vue 文件中代码

```vue
// template
<el-upload class="avatar-uploader"
           action="/" :show-file-list="false" :auto-upload="false" 
           :on-change="uploadFile" accept=".jpg, .jpeg, .png">
    <el-avatar :size="75" :src="userAvatar" />
</el-upload>

// script
const uploadFile = async (file: UploadFile) => {
    await FileAPI.uploadAvatar(file.raw).then((res) => {
        log(res)
    })
}
```

spring boot：

```java
@PostMapping("/avatar")
public Result<String> uploadAvatar(@RequestParam MultipartFile file) {

    // 将所有的 HttpServletRequest 参数打印出来，以 debug 参数区别
    // System.out.println(file);
    // request.getParameterMap().forEach((k, v) -> System.out.println(k + " " + Arrays.toString(v)));
    // return Result.success("success");

    return Result.success(uploadService.uploadAvatar(file));
}
```
