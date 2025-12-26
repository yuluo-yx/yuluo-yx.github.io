---
slug: use-kind-build-k8s-cluster
title: 使用 Kind 模拟 k8s 集群
date: 2025-02-09 14:26:00
authors: yuluo
tags: [Cloud Native, Kind, Kuberneters]
keywords: [Cloud Native, Kind,  Kubernetes]
image: /img/cloud-native/kind.png
---

<!-- truncate -->

## 安装 Docker

Docker Desktop：[https://docs.docker.com/desktop/setup/install/mac-install/](https://docs.docker.com/desktop/setup/install/mac-install/)

```shell
$ docker --version 
Docker version 27.4.0, build bde2b89
```

## 安装 Kind
使用 kind 模拟 K8s 集群：

```shell
# 直接使用 brew 安装
brew install kind

# 查看版本
$ kind --version
kind version 0.26.0

# kubectl 版本
$ kubectl version  
Client Version: v1.30.5
Kustomize Version: v5.0.4-0.20230601165947-6ce0bf390ce3
```

## 启动 k8s 集群
```shell
$ kind create cluster --name istio-k8s
Creating cluster "istio-k8s" ...
 ✓ Ensuring node image (kindest/node:v1.32.0) 🖼 
 ✓ Preparing nodes 📦  
 ✓ Writing configuration 📜 
 ✓ Starting control-plane 🕹️ 
 ✓ Installing CNI 🔌 
 ✓ Installing StorageClass 💾 
Set kubectl context to "kind-istio-k8s"
You can now use your cluster with:

kubectl cluster-info --context kind-istio-k8s

Have a question, bug, or feature request? Let us know! https://kind.sigs.k8s.io/#community 🙂
```

### 查看集群资源
```shell
$ kgpa
NAMESPACE            NAME                                              READY   STATUS    RESTARTS   AGE
kube-system          coredns-668d6bf9bc-62mtm                          1/1     Running   0          62s
kube-system          coredns-668d6bf9bc-7vd5d                          1/1     Running   0          62s
kube-system          etcd-istio-k8s-control-plane                      1/1     Running   0          70s
kube-system          kindnet-94phb                                     1/1     Running   0          62s
kube-system          kube-apiserver-istio-k8s-control-plane            1/1     Running   0          70s
kube-system          kube-controller-manager-istio-k8s-control-plane   1/1     Running   0          69s
kube-system          kube-proxy-6kz4m                                  1/1     Running   0          62s
kube-system          kube-scheduler-istio-k8s-control-plane            1/1     Running   0          69s
local-path-storage   local-path-provisioner-58cc7856b6-q6rvb           1/1     Running   0          62s
```

### Docker container 查看
```shell
$ docker ps                       
CONTAINER ID   IMAGE                  COMMAND                   CREATED         STATUS              PORTS                       NAMES
17df49a0e07c   kindest/node:v1.32.0   "/usr/local/bin/entr…"   2 minutes ago   Up About a minute   127.0.0.1:62209->6443/tcp   istio-k8s-control-plane
```

## 常用的 kind 命令
```shell
# 获取当前的集群列表
kind get clusters

# 指定 kubectl 使用的 kind 集群
kubectl cluster-info --context 集群名字

# 查看某个集群的配置信息
kind get kubeconfig --name=kind

# 删除几圈
kind delete cluster kind
```

## kind K8s 集群的停止和重启
```shell
# 可以直接使用 docker 控制
$ docker ps 
CONTAINER ID   IMAGE                  COMMAND                   CREATED         STATUS         PORTS                       NAMES
17df49a0e07c   kindest/node:v1.32.0   "/usr/local/bin/entr…"   7 minutes ago   Up 7 minutes   127.0.0.1:62209->6443/tcp   istio-k8s-control-plane

# kind 集群的 container 为 17df49a0e07c

# 停止
docker stop 17df49a0e07c

# 使用 kgpa 验证
$ kgpa
The connection to the server 127.0.0.1:62209 was refused - did you specify the right host or port?

# kind 集群已经成功停止
```
