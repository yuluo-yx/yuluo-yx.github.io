## 🎉 牧生 Blogs

Build with React + Doucsaurus.

## 📥 运行

```bash
git clone https://github.com/yuluo-yx/blog.git
cd blog
make preview
```

> 如果 sharp 安装失败
>  设置 npm 代理，pnpm 的源本身使用的和 npm 是同样的镜像源

```shell
# 查看 pnpm 的配置信息
pnpm config list --json

# npm 换源
npm/pnpm config set registry https://registry.npmmirror.com

# npm 设置代理 pnpm 同样会使用 npm 的代理
npm config set proxy http://127.0.0.1:7890

# 安装 sharp 设置 http 代理即可，如果设置 https 代理，
# 会出现  sharp: Via proxy https://127.0.0.1:7890 no credentials 没有细看问题
npm config set https-proxy https://127.0.0.1:7890

# 删除代理
npm config delete proxy http://127.0.0.1:7890
npm config delete https-proxy https://127.0.0.1:7890
```  

Notes: 可能需要在 vscode 中设置 eslint 插件。

## 🛠️ 构建

```bash
pnpm build
```

## 📷 截图

<img width="1471" alt="Live Demo" src="https://github.com/yuluo-yx/yuluo-yx.github.io/blob/main/static/img/og.png?raw=true">

## 📝 许可证

[MIT](./LICENSE)

## 🫡 致谢

Thanks to kuizuo for making a cool blog theme. 🚀
