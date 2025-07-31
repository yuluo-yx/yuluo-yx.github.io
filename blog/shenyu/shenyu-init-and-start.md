---
slug: shenyu-init
title: Apache Shenyu 本地启动及快速入门
date: 2025-07-31 22:41:01
authors: yuluo
tags: ["shenyu", "gateway"]
keywords: ["shenyu", "gateway"]
---

<!-- truncate -->

## 1. 环境准备

本文中使用 MySQL 来作为 ShenYu 数据库，使用 Docker Compose 部署 MySQL。

> 或者使用本地 MySQL 数据库也可，使用本地数据库时跳转到 1.3 配置数据库表。

### 1.1 docker-compose.yml

```yml
services:
  db:
    image: mysql
    container_name: mysql
    restart: always
    command: --default-authentication-plugin=caching_sha2_password --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci --explicit_defaults_for_timestamp=true --lower_case_table_names=1 --max_allowed_packet=128M;
    ports:
      - 3306:3306
    volumes:
      - ./data:/var/lib/mysql
      - ./my.cnf:/etc/my.cnf:ro
      - ./log:/var/log/mysql
      - ./initdb.d:/docker-entrypoint-initdb.d
    environment:
      MYSQL_ROOT_PASSWORD: toor
```

### 1.2 MySQL 数据库配置

```conf
[mysqld]

skip-host-cache
skip-name-resolve
datadir=/var/lib/mysql
socket=/var/lib/mysql/mysql.sock
secure-file-priv=/var/lib/mysql-files
user=mysql

pid-file=/var/run/mysqld/mysqld.pid

tmpdir=/tmp
```

### 1.3 SQL 文件配置：

SQL 数据文件下载地址：https://github.com/apache/shenyu/blob/master/db/init/mysql/schema.sql

将数据文件在同级目录的 init.d 目录下并改为 init.sql.

> Tips: 或者不自动执行 sql 脚本，启动之后手动执行 sql 文件。

## 2. 工具和代码下载

本文中使用 IDEA，从 Github clone 仓库并使用 IDEA 打开。

Github：https://github.com/apache/shenyu

## 3. 编译及启动

### 3.1 安装编译

执行如下命令将 shenyu 安装到本地的 mvn 仓库，**后面启动 example 时需要用到。**

```shell
mvn clean install '-Dmaven.javadoc.skip=true' '-B' '-Drat.skip=true' '-Djacoco.skip=true' '-DskipITs' '-DskipTests'
```

### 3.2 配置修改

1. 将 shenyu-admin/src/resource/application.yml#24 中的激活配置从 h2 改为 mysql
2. 将 shenyu-admin/src/resource/application-mysql.yml#25 中的 MySQL 密码改为 1.1 中的 `toor` 或者你自己的数据库密码。

### 3.3 启动

1. 启动 Admin 管理端（作为网关控制面） org.apache.shenyu.admin.ShenyuAdminBootstrap
2. 启动 ShenYu 网关（作为网关数据面）org.apache.shenyu.bootstrap.ShenyuBootstrapApplication

### 3.4 访问 Admin 页面

浏览器访问 `http://127.0.0.1:9095`，默认的用户名密码为：admin/123456。

> 如果一切顺利，你将会看到 shenyu 网关的 Admin 页面。

## 4. Example 测试

接下来使用 shenyu-examples/shenyu-examples-http 作为测试服务，使用 IDEA 单独打开或者为其设置工作目录。

> Tips: 务必完成 3.1 的编译动作！

完成 example 启动之后，在 

## 5. 流量处理简单 Debug 

首先需要明确下面一些细节问题：



## 参考文档

1. https://shenyu.apache.org/zh/docs/deployment/deployment-before
2. https://shenyu.apache.org/zh/docs/deployment/deployment-local
3. https://github.com/deigmata-paideias/deigmata-paideias/blob/main/docker-compose-tmpl/mysql
