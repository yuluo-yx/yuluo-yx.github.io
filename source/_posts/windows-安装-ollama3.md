---
layout: blog
title: Windows 电脑部署 ollama3 并安装 llama3
date: 2024-07-18 16:36:22
tags: 
- AI
- Ollama3
# 文章首页封面图
index_img: /img/ai/ai-2.png
# 文章页顶部大图
banner_img: /img/ai/ai-2.png
categories:
- AI
- Technology 
- Study
---

> 部署中为了尽可能减少对本地环境的污染，使用 Docker 安装！

github: https://github.com/ollama/ollama

## 准备部署文件

```yml
version: '3.8'

services:
   ollama:
     volumes:
       - ./models:/root/.ollama  # 将本地文件夹挂载到容器中的 /root/.ollama 目录 （模型下载位置）
     container_name: ollama
     pull_policy: always
     tty: true
     restart: unless-stopped
     image: ollama/ollama:latest
     ports:
       - 11434:11434  # Ollama API 端口

   open-webui:
     build:
       context: .
       args:
         OLLAMA_BASE_URL: '/ollama'
       dockerfile: Dockerfile
     image: ghcr.io/open-webui/open-webui:main
     container_name: open-webui
     volumes:
       - ./open-webui:/app/backend/data  # 前端页面数据挂载位置
     depends_on:
       - ollama
     ports:
       - ${OPEN_WEBUI_PORT-3005}:8080
     environment:
       - 'OLLAMA_BASE_URL=http://ollama:11434'
       - 'WEBUI_SECRET_KEY='
     extra_hosts:
       - host.docker.internal:host-gateway
     restart: unless-stopped
```

之后使用 `docker compose up -d` 等待一段时间之后，docker images pull 成功。即可执行下一步。

## 下载 LLM 模型

LLM 模型参考：

| **Model**          | **Parameters** | **Size** | **Download**                   |
| ------------------ | -------------- | -------- | ------------------------------ |
| Llama 3            | 8B             | 4.7GB    | `ollama run llama3`            |
| qwen               | 4b             | 2.3G     | `ollama run qwen:4b`           |
| Llama 3            | 70B            | 40GB     | `ollama run llama3:70b`        |
| Phi-3              | 3,8B           | 2.3GB    | `ollama run phi3`              |
| Mistral            | 7B             | 4.1GB    | `ollama run mistral`           |
| Neural Chat        | 7B             | 4.1GB    | `ollama run neural-chat`       |
| Starling           | 7B             | 4.1GB    | `ollama run starling-lm`       |
| Code Llama         | 7B             | 3.8GB    | `ollama run codellama`         |
| Llama 2 Uncensored | 7B             | 3.8GB    | `ollama run llama2-uncensored` |
| LLaVA              | 7B             | 4.5GB    | `ollama run llava`             |
| Gemma              | 2B             | 1.4GB    | `ollama run gemma:2b`          |
| Gemma              | 7B             | 4.8GB    | `ollama run gemma:7b`          |
| Solar              | 10.7B          | 6.1GB    | `ollama run solar`             |

这里选择最小体积且最好用的模型： llama3:4b 模型，qwen:4b 模型质量很差。

```shell
ollama3 run llama3
```

成功之后会看到下面这样：

```shell
root@c5e5ff20a533:/# ollama run llama3
pulling manifest 
pulling 6a0746a1ec1a... 100% ▕██████████████████████████████████████████████████████████████████████████████████████████████████████████▏ 4.7 GB                         
pulling 4fa551d4f938... 100% ▕██████████████████████████████████████████████████████████████████████████████████████████████████████████▏  12 KB                         
pulling 8ab4849b038c... 100% ▕██████████████████████████████████████████████████████████████████████████████████████████████████████████▏  254 B                         
pulling 577073ffcc6c... 100% ▕██████████████████████████████████████████████████████████████████████████████████████████████████████████▏  110 B                         
pulling 3f8eb4da87fa... 100% ▕██████████████████████████████████████████████████████████████████████████████████████████████████████████▏  485 B                         
verifying sha256 digest 
writing manifest 
removing any unused layers 
success 
>>> 你好
💖 你好！我很高兴地看到你的消息！ 😊

>>> 你能介绍下自己吗
😊 I'd be happy to introduce myself.

My name is LLaMA, and I'm a large language model trained by Meta AI. I'm a computer program designed to understand and generate human-like text, so we can have 
conversations like this one! 🤖

I was trained on a massive dataset of text from the internet, which allows me to learn about various topics, including history, science, culture, and more. This 
training enables me to answer questions, provide information, and even engage in creative writing or storytelling.

As a conversational AI, my goal is to assist and entertain users like you. I'm designed to be helpful, friendly, and respectful, so please feel free to ask me 
anything or share your thoughts with me! 💬
```

下载后的模型将被挂载到在 `./models` 文件中。

## 访问

上面已经介绍了一种访问方式，通过 run 的方式。下面介绍通过 web ui 和 api 的方式访问。

### API

```shell
curl http://localhost:11434/api/generate -d '{
    "model":"llama3",
    "prompt": "请分别翻译成中文、韩文、日文 -> Meta Llama 3: The most capable openly available LLM to date",
    "stream": false
}'

curl http://localhost:11434/api/chat -d '{
  "model": "llama3",
  "messages": [
    {
      "role": "user",
      "content": "why is the sky blue?"
    }
  ],
  "stream": true
}'
```

### Web ui

浏览器访问 localhost:3005即可。

![image-20240718162933068](/img/ai/ai-1.png)
