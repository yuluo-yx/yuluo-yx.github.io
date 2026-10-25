---
slug: apache-java-project-release-guide
title: Apache Java 项目版本发布指南
date: 2026-10-25
authors: yuluo
tags: [Apache, Java, Maven, SVN, GPG, ShenYu]
keywords: [Apache, Java, Maven, SVN, GPG, ShenYu, Release]
---

<!-- truncate -->


以 `Apache ShenYu` 为例。

## 1. 准备发布内容

每个项目各有不同，比如 ShenYu 是使用 RELEASE-NOTES.md 文件来记录每次的发版内容。有的项目是使用 changelogs 目录下以版本号来命名的 md 文件来记录内容。文件内容也大同小异。

```markdown
## ${PUBLISH.VERSION}

### New Features

1. xxx
1. xxx
...

### API Changes

1. xxx
1. xxx
...

### Enhancement

1. xxx
1. xxx
...

### Refactor

1. xxx
1. xxx
...

### Bug Fix

1. xxx
1. xxx
...
```

## 2. 创建 GPG KEY

每个发布经理只在第一次发布时创建 GPG KEY，之后发布复用此 KEY

### 2.1 安装 GPG

```
brew install gpg
```

### 2.2 创建 KEY

```shell
➜ gpg --full-gen-key

gpg (GnuPG) 2.5.24; Copyright (C) 2026 g10 Code GmbH
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Please select what kind of key you want:
   (1) RSA and RSA
   (2) DSA and Elgamal
   (3) DSA (sign only)
   (4) RSA (sign only)
   (9) ECC (sign and encrypt) *default*
  (10) ECC (sign only)
  (14) Existing key from card
  (16) ECC and Kyber
Your selection? 1
RSA keys may be between 1024 and 4096 bits long.
What keysize do you want? (3072) 4096
Requested keysize is 4096 bits
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0) 0
Key does not expire at all
Is this correct? (y/N) y

GnuPG needs to construct a user ID to identify your key.

Real name: YOUR_NAME
Email address: YOUR_NAME@apache.org
Comment: Apache ShenYu publish release GPG Key
You selected this USER-ID:
    "YOUR_NAME (Apache ShenYu publish release GPG Key) <YOUR_NAME@apache.org>"

Change (N)ame, (C)omment, (E)mail or (O)kay/(Q)uit? o
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.
gpg: WARNING: server 'keyboxd' is older than us (2.4.8 < 2.5.24)
gpg: Note: Outdated servers may lack important security fixes.
gpg: Note: Use the command "gpgconf --kill all" to restart them.
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.
gpg: WARNING: server 'keyboxd' is older than us (2.4.8 < 2.5.24)
gpg: Note: Outdated servers may lack important security fixes.
gpg: Note: Use the command "gpgconf --kill all" to restart them.
public and secret key created and signed.

gpg: revocation certificate stored as '~/.gnupg/openpgp-revocs.d/YOUR_PRIMARY_KEY_FINGERPRINT.rev'
pub   rsa4096 2026-10-11 [SC]
      YOUR_PRIMARY_KEY_FINGERPRINT
uid                      YOUR_NAME (Apache ShenYu publish release GPG Key) <YOUR_NAME@apache.org>
sub   rsa4096 2026-10-11 [E]
      YOUR_ENCRYPTION_SUBKEY_FINGERPRINT
```

在输入到 o 之后，在如下的弹窗中，输入密码（YOUR_GPG_PASSPHRASE）：

![image](/img/apache-java-project-release/image.png)

tab 键选择，创建完成，进入下一步。

### 2.3 检查 KEY

```shell
➜ gpg --list-keys ｜ grep YOUR_NAME

gpg: WARNING: server 'keyboxd' is older than us (2.4.8 < 2.5.24)
gpg: Note: Outdated servers may lack important security fixes.
gpg: Note: Use the command "gpgconf --kill all" to restart them.
pub   rsa4096 2026-10-11 [SC]
      YOUR_PRIMARY_KEY_FINGERPRINT
uid           [ultimate] YOUR_NAME (Apache ShenYu publish release GPG Key) <YOUR_NAME@apache.org>
sub   rsa4096 2026-10-11 [E]
      YOUR_ENCRYPTION_SUBKEY_FINGERPRINT
```

### 2.4 上传公钥

```shell
➜ gpg --send-key YOUR_GPG_FINGERPRINT

➜ gpg --keyserver hkps://keyserver.ubuntu.com \
    --send-key YOUR_GPG_FINGERPRINT
gpg: sending key YOUR_GPG_FINGERPRINT to hkps://keyserver.ubuntu.com# 出现如下错误时：可以加入服务器地址：gpg --keyserver hkps://keyserver.ubuntu.com \
    --send-key YOUR_GPG_FINGERPRINT
```

### 2.5 删除并重新创建

在忘记 GPG 口令或者需要新建时这样操作：

```shell
gpg --delete-secret-keys YOUR_PRIMARY_KEY_FINGERPRINT
gpg --delete-keys YOUR_PRIMARY_KEY_FINGERPRINT

# check 下
gpg --list-secret-keys --keyid-format LONG YOUR_PRIMARY_KEY_FINGERPRINT
gpg --list-keys --keyid-format LONG YOUR_PRIMARY_KEY_FINGERPRINT
```

## 3. Maven 和 SVN 预发仓库发布

### 3.1 Maven 仓库预发发布

Maven 发布需要分别配置 Apache 仓库认证和 GPG 签名。仓库认证用于上传制品，GPG 签名用于验证制品的发布者与完整性。公钥上传完成后，发布机器还需要保留对应私钥。

#### 3.1.1 准备 Maven 和账号

以下命令在 ShenYu 项目根目录执行，使用项目自带的 `./mvnw`。本次核对的代码版本为 `2.7.2-SNAPSHOT`，Maven Wrapper 为 `3.6.3`，项目要求 Java 17 或更高版本；发布时使用 Java 17。

```shell
./mvnw -v

# 预期输出Apache Maven 3.6.3 (cecedd343002696d0abb50b32b541b8a6ba2883f)
Maven home: ~/.m2/wrapper/dists/apache-maven-3.6.3-bin/cf3cf814/apache-maven-3.6.3
Java version: 25.0.2, vendor: Eclipse Adoptium, runtime: ~/.local/share/mise/installs/java/temurin-25.0.2+10.0.LTS
Default locale: en_CN, platform encoding: UTF-8
OS name: "mac os x", version: "26.5.2", arch: "aarch64", family: "mac"
```

如果提示 `Unable to locate a Java Runtime`，先检查 mise 中已安装的 Java，再使用已有的 Java 17。以下版本为本机已安装版本，其他机器按 `mise list java` 的结果调整：

```shell
mise list java
mise exec java@temurin-17.0.19+10 -- ./mvnw -v
```

后续命令均假设当前终端已加载 Java 17；否则，在 `./mvnw` 前添加相同的 `mise exec java@temurin-17.0.19+10 --` 前缀。

| 配置项 | 使用的内容 |
| --- | --- |
| Maven 仓库用户名 | Apache LDAP 用户名，例如 `YOUR_APACHE_LDAP_ID` |
| Maven 仓库密码 | Apache LDAP 密码，经 Maven 加密后填写 |
| `gpg.keyname` | GPG 签名密钥的完整指纹 |
| GPG 口令 | 第 2.2 节创建密钥时设置的密码 |
| GitHub 凭据 | 有目标仓库写权限的 GitHub 凭据 |

Apache LDAP 密码、GPG 口令和 GitHub 凭据分别使用。Maven Release Plugin 的 `-Dusername` 对应 SCM 操作，不能代替下面的 Apache 仓库认证。

#### 3.1.2 配置仓库密码加密

Maven 默认读取 `~/.m2/settings.xml`。已有配置时，先备份，再合并新增节点，保留原有的镜像、代理和其他仓库配置。

如果还没有 `~/.m2/settings-security.xml`，先生成 Maven 主密码的加密值。命令会提示输入主密码，不需要把密码写在命令行中（自己设置的 Maven 主密码，和 Apache 账号无关）：

```shell
./mvnw --encrypt-master-password

!K988JLXdK4STg@Aizaz —> {H3vIg0oLjHwHPtu174Lfqf0XHKNITtjwavTgBrS1+Y16X54Gd/QiEOBc6XVfhNwK}
```

将输出的完整加密值（包含外层花括号）填入 `~/.m2/settings-security.xml`：

```xml
<settingsSecurity>
    <master>REPLACE_WITH_ENCRYPTED_MASTER_PASSWORD</master>
</settingsSecurity>
```

`REPLACE_WITH_ENCRYPTED_MASTER_PASSWORD` 是占位符，需要整体替换。如果该文件已经配置过主密码，直接复用；更换主密码后，原先加密的仓库密码也需要重新加密。

接着加密 Apache LDAP 密码。在提示输入密码时，输入用于登录 Apache Nexus 的密码：

```shell
./mvnw --encrypt-password

!K988JLXdK4STg@Aizazadi. —> {nZUEmcvGYHMHupRsnP/r+oCZ+9orCsJnDFVQEhLRlYBqMm2yDDR3hEgikVkcD2TM}
```

保存这次输出的完整加密值，填入下一步两个 `<server>` 的 `<password>`。同一个 Apache 账号可以复用同一份加密值。

#### 3.1.3 配置 settings.xml

以下是与本次发布有关的完整配置示例。如果已有 `settings.xml`，将对应的 `<server>` 和 `<profile>` 合并到现有节点中；相同 ID 只保留一份。

```xml
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 https://maven.apache.org/xsd/settings-1.0.0.xsd">
    <servers>
        <server>
            <id>apache.snapshots.https</id>
            <username>YOUR_APACHE_LDAP_ID</username>
            <password>REPLACE_WITH_ENCRYPTED_APACHE_PASSWORD</password>
        </server>
        <server>
            <id>apache.releases.https</id>
            <username>YOUR_APACHE_LDAP_ID</username>
            <password>REPLACE_WITH_ENCRYPTED_APACHE_PASSWORD</password>
        </server>
    </servers>

    <profiles>
        <profile>
            <id>apache-release</id>
            <properties>
                <gpg.executable>gpg</gpg.executable>
                <gpg.keyname>YOUR_PRIMARY_KEY_FINGERPRINT</gpg.keyname>
                <gpg.useagent>true</gpg.useagent>
            </properties>
        </profile>
    </profiles>
</settings>
```

`YOUR_APACHE_LDAP_ID` 按实际 Apache LDAP 用户名替换，不填写邮箱地址。`REPLACE_WITH_ENCRYPTED_APACHE_PASSWORD` 替换为上一步生成的密文，保留密文自身的花括号。`gpg.keyname` 使用第 2 节记录的主密钥完整指纹；换发布经理或换密钥时同步修改。

两个仓库 ID 必须与项目继承的 `<distributionManagement>` 一致：`apache.snapshots.https` 用于快照上传，`apache.releases.https` 用于发布候选版本上传。当前 ShenYu 继承 `org.apache:apache:21`，父 POM 已定义仓库地址，因此不需要在 `settings.xml` 中重复添加上传地址。

这里通过 `-Papache-release` 显式启用签名配置。ShenYu 发行包模块中的 `release` profile 和 Apache 父 POM 中的 `apache-release` profile 用途不同：前者构建发行包，后者包含签名等发布配置。下面的完整验证命令同时启用两者。

配置完成后限制文件权限。Maven 3 的密码加密可避免直接保存明文，但不能替代对配置文件的保护；私钥和 GPG 口令交给本机 GPG 管理，不写入文档或项目仓库。

```shell
chmod 600 ~/.m2/settings.xml ~/.m2/settings-security.xml
```

#### 3.1.4 检查 GPG 私钥和签名

只有公钥不能完成发布签名。先确认本机存在对应的私钥，输出中应包含 `sec` 和指定指纹：

```shell
gpg --list-secret-keys --keyid-format LONG YOUR_GPG_FINGERPRINT
```

在交互式终端中设置 GPG 使用的终端，再对项目的 `pom.xml` 做一次签名检查。按提示输入 GPG 口令，签名结果写入 `/dev/null`，原文件不会被修改：

```shell
export GPG_TTY=$(tty)
gpg --local-user YOUR_GPG_FINGERPRINT \
    --armor --detach-sign --yes --output /dev/null pom.xml
```

命令成功退出后，继续 Maven 验证。GPG Agent 可在缓存有效期内提供口令；缓存失效时需要重新解锁。当前项目使用 `maven-gpg-plugin:1.6`，本地交互式发布使用 Agent，不额外传入 `-Dgpg.passphrase`。

#### 3.1.5 验证 Maven 配置

先检查最终生效的 Maven settings。默认输出会隐藏服务器密码，不添加 `-DshowPasswords=true`，也不把完整输出粘贴到公开文档：

```shell
./mvnw -N -Papache-release help:effective-settings
```

确认输出中存在 `apache.snapshots.https`、`apache.releases.https`，用户名正确，`apache-release` 中的 GPG 指纹与第 2 节一致。再查看项目最终使用的发布仓库 ID 和地址：

```shell
./mvnw -N -Papache-release help:evaluate \
    -Dexpression=project.distributionManagement.repository.id -q -DforceStdout

./mvnw -N -Papache-release help:evaluate \
    -Dexpression=project.distributionManagement.repository.url -q -DforceStdout
```

本次核对的父 POM 对应以下值：

```text
apache.releases.https
https://repository.apache.org/service/local/staging/deploy/maven2
```

然后执行本地构建和签名验证。该命令会清理构建目录、运行测试并安装到本机 Maven 仓库，不上传到远端：

```shell
./mvnw clean install -Prelease,apache-release

# 如果失败了，确认原因，如果是依赖下载失败等。可单独重试此模块，成功之后从当前模块继续执行
MAVEN_OPTS='-Djdk.tls.client.protocols=TLSv1.2 -Dhttps.protocols=TLSv1.2' \
    mise exec java@temurin-17.0.19+10 -- \
    ./mvnw -B -U -Prelease,apache-release \
    -rf :shenyu-plugin-wasm-api install

# 单独指定失败模块验证
MAVEN_OPTS='-Djdk.tls.client.protocols=TLSv1.2 -Dhttps.protocols=TLSv1.2' \
    mise exec java@temurin-17.0.19+10 -- \
    ./mvnw -B -U \
    -pl shenyu-plugin/shenyu-plugin-wasm-api -am \
    package -DskipTests -Dmaven.javadoc.skip=true

# 出现如下则成功[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  25:52 min
[INFO] Finished at: 2026-10-25T13:55:11+08:00
[INFO] ------------------------------------------------------------------------
```

预期结果为 `BUILD SUCCESS`，构建日志中执行了 `maven-gpg-plugin:1.6:sign`，相应模块的 `target` 目录下生成 `.asc` 签名文件。仅有普通构建成功不足以证明签名配置已生效。

以上检查分别验证配置解析、仓库目标和本地签名，不能证明远端上传权限。使用 Apache LDAP 账号登录 Apache Nexus，确认账号可用；项目上传权限仍需在实际部署时验证。文档末尾脚本对 `settings.xml` 的检查只查找仓库 ID 字符串，不能代替这些检查。

#### 3.1.6 进入预发发布与常见问题

配置验证通过、发布分支就绪且工作区干净后，按 ShenYu 指南进行发布预检。以下命令是 dry run，会执行构建并生成本地预检文件，不上传制品，也不创建实际发布标签：

```shell
./mvnw release:prepare -Prelease,apache-release \
    -Darguments="-Prelease,apache-release" \
    -DautoVersionSubmodules=true \
    -DpushChanges=false \
    -DdryRun=true

# 不想手动输入 version tag 等可以带着参数：
mise exec java@temurin-17.0.19+10 -- \
  ./mvnw release:prepare \
  -Prelease,apache-release \
  -Darguments="-Prelease,apache-release" \
  -DautoVersionSubmodules=true \
  -DpushChanges=false \
  -DdryRun=true \
  -DreleaseVersion=2.7.2 \
  -DdevelopmentVersion=2.7.3-SNAPSHOT \
  -Dtag=v2.7.2

# 跳过测试
追加参数即可：-Darguments="-Prelease,apache-release -DskipTests"
```

如果命令未指定 -DreleaseVersion、-DdevelopmentVersion 和 -Dtag，Maven 会交互式询问；指定这些参数后会直接使用命令行值。`-Darguments` 会传给 Release Plugin 启动的子 Maven 进程，因此这里同样显式启用两个 profile，并保留测试执行。

dry run 不会把版本变更直接写回 Git，也不会提交、创建或推送远端标签。Release Plugin 会在工作区生成用于检查的临时文件，实际文件数量取决于 Reactor 模块数量，通常包括：

```text
release.properties
pom.xml.releaseBackup
pom.xml.tag
pom.xml.next
<module>/pom.xml.releaseBackup
<module>/pom.xml.tag
<module>/pom.xml.next
```

其中：

- `pom.xml.releaseBackup`：原始开发版本 POM 的备份。
- `pom.xml.tag`：模拟发布标签 `v2.7.2` 对应的 POM，版本应为 `2.7.2`。
- `pom.xml.next`：模拟下一开发版本对应的 POM，版本应为 `2.7.3-SNAPSHOT`。
- `release.properties`：记录 `scm.tag`、各模块的 `project.rel.*` 和 `project.dev.*` 等发布元数据。

使用以下命令检查版本和标签是否符合预期：

```shell
git status --short
find . \( -name 'pom.xml.tag' -o -name 'pom.xml.next' -o -name 'pom.xml.releaseBackup' \) -print | sort
rg -n '<version>2\.7\.2</version>' --glob 'pom.xml.tag'
rg -n '<version>2\.7\.3-SNAPSHOT</version>' --glob 'pom.xml.next'
rg -n 'scm\.tag|project\.rel|project\.dev' release.properties
```

预览时重点确认：所有模块的发布版本均为 `2.7.2`；下一开发版本均为 `2.7.3-SNAPSHOT`；`scm.tag` 为 `v2.7.2`；没有意外修改模块、仓库地址或 SCM 配置。dry run 期间日志仍可能执行 `clean verify` 和测试；这只验证发布流程，不会产生远端 Git 或 Nexus 变更。

如果需要比较原始 POM 与预览 POM，可针对单个模块执行：

```shell
diff -u pom.xml.releaseBackup pom.xml.tag
diff -u pom.xml.releaseBackup pom.xml.next
```

检查完成之后，使用 `./mvnw release:clean` 清理本次预检文件。该命令会删除 `release.properties` 和 POM 备份/预览文件，不会回滚已经执行的真实 Git 或远端发布操作；如果之前有中断的 `release:prepare`，先确认并保留其恢复文件。

随后按官方指南执行真实的 `release:prepare`、推送分支及标签、`release:perform`。这些步骤会修改 Git 或上传远端制品。上传完成后在 Nexus 中将本次 staging 仓库置为 `Close`，用于后续验证和投票；`Release` 操作放到投票通过后的第 6 节。

#### 3.1.7 实际执行发布、推送 Git 与关闭 Nexus Staging

确认 dry run 通过、发布分支已创建、工作区干净，并准备好本次发布的版本信息。ShenYu 发布使用 Java 17；如果当前终端默认不是 Java 17，以下 Maven 命令统一加上 `mise exec java@temurin-17.0.19+10 --` 前缀。

```shell
export RELEASE_VERSION=2.7.2
export NEXT_VERSION=2.7.3-SNAPSHOT
export RELEASE_BRANCH="${RELEASE_VERSION}-release"
export RELEASE_TAG="v${RELEASE_VERSION}"
```

确认 Git 远端。通常将个人 fork 配置为 `origin`，将 Apache 上游仓库配置为 `upstream`。添加远端本身不会授予 Apache 仓库的写权限；是否能够推送由 GitHub 账号权限、认证方式和 Apache 仓库的服务端规则共同决定：

```shell
git remote -v

# Run only when upstream is not configured; use git remote set-url upstream ... to correct an existing URL.
git remote add upstream https://github.com/apache/shenyu.git
git remote -v
```

使用当前 GitHub 账号检查仓库权限（需要已登录 `gh`）：

```shell
gh api user --jq '{login,name}'
gh api repos/apache/shenyu --jq '{full_name,permissions}'
```

输出中的 `permissions.push` 为 `true` 只表示当前账号具备仓库级推送权限，仍可能受到 Apache 发布策略或服务端 hook 限制。先检查 Apache 上游是否已经存在本次分支和标签：

```shell
git ls-remote upstream \
  "refs/heads/${RELEASE_BRANCH}" \
  "refs/tags/${RELEASE_TAG}" \
  "refs/tags/${RELEASE_TAG}^{}"
```

如果 `origin` 是个人 fork，而 `upstream` 尚未看到这些引用，不能只把它们推送到 `origin` 后就继续执行 `release:perform`；`release:perform` 会按照根 `pom.xml` 中的 SCM 地址从 Apache 上游检出标签。没有 Apache 上游写权限时，应把 fork 中的提交和标签交给有权限的 Apache committer 或 release manager 处理，不要使用 `--force` 绕过限制。

如果之前的 `release:prepare` 被中断，先检查 `release.properties` 和 `pom.xml.releaseBackup`。确认不需要恢复后再清理；真实 `release:prepare` 成功后到 `release:perform` 完成前不要再次执行 `release:clean`：

```shell
./mvnw release:clean
```

执行真实的 `release:prepare`。`-DpushChanges=false` 会禁止 Maven 自动推送，方便人工检查提交和标签：

```shell
mise exec java@temurin-17.0.19+10 -- \
  ./mvnw release:prepare \
    -Prelease,apache-release \
    -Darguments="-Prelease,apache-release" \
    -DautoVersionSubmodules=true \
    -DpushChanges=false \
    -DreleaseVersion="${RELEASE_VERSION}" \
    -DdevelopmentVersion="${NEXT_VERSION}" \
    -Dtag="${RELEASE_TAG}"

# 如果发布失败或者需要重新开始时，执行：
mise exec java@temurin-17.0.19+10 -- \
  ./mvnw release:rollback
```

成功后检查版本、提交和标签：

```shell
git status --short
git log --oneline -5
git show --stat --oneline HEAD
git tag -n "${RELEASE_TAG}"
```

确认没有不相关改动后，先用 dry-run 检查 Apache 上游是否接受本次分支和标签。dry-run 不会真正创建远端引用：

```shell
git push --dry-run --porcelain upstream \
  "refs/heads/${RELEASE_BRANCH}:refs/heads/${RELEASE_BRANCH}" \
  "refs/tags/${RELEASE_TAG}:refs/tags/${RELEASE_TAG}"
```

如果远端尚未存在这些引用，预期会看到类似 `[new branch]` 和 `[new tag]` 的结果；这只是权限和引用更新的预检查，不代表远端已经创建成功。

dry-run 成功后，分别推送 Apache 上游的发布分支和本次标签。不要使用 `git push --all` 或 `git push --tags`，避免把其他本地分支和标签一起推送：

```shell
git push upstream \
  "refs/heads/${RELEASE_BRANCH}:refs/heads/${RELEASE_BRANCH}"
git push upstream \
  "refs/tags/${RELEASE_TAG}:refs/tags/${RELEASE_TAG}"
```

推送完成后再次验证 Apache 上游的引用和提交 ID：

```shell
git ls-remote upstream \
  "refs/heads/${RELEASE_BRANCH}" \
  "refs/tags/${RELEASE_TAG}" \
  "refs/tags/${RELEASE_TAG}^{}"
```

确认 Apache 上游已经看到发布分支和标签后，再执行 `release:perform`。该命令会按根 `pom.xml` 的 SCM 地址从标签检出代码：

```shell
./mvnw release:perform \
    -Prelease,apache-release \
    -Darguments="-Prelease,apache-release" \
    -DautoVersionSubmodules=true
```

命令成功后打开 [Apache Nexus Staging Repositories](https://repository.apache.org/#stagingRepositories)，登录 Apache LDAP 账号，找到本次 `org.apache.shenyu` 的 `Open` 仓库，检查制品、`.asc` 和校验文件后点击 `Close`。`Close` 只是投票前锁定 staging 仓库，不是正式发布；投票通过前不要点击 `Release`。

记录关闭后的 staging repository ID，例如 `orgapacheshenyu-XXXX`：

```text
https://repository.apache.org/content/repositories/<STAGING_REPO_ID>/org/apache/shenyu/shenyu/<RELEASE_VERSION>/
```

官方参考资料：

- [ShenYu 主仓库发布指南](https://shenyu.apache.org/zh/community/release-guide/main-release-guide/)
- [ASF Maven 制品发布说明](https://infra.apache.org/publishing-maven-artifacts.html)
- [Maven 3 密码加密说明](https://maven.apache.org/guides/mini/guide-encryption.html)
- [Maven GPG Plugin 1.6 签名参数](https://maven.apache.org/plugins-archives/maven-gpg-plugin-1.6/sign-mojo.html)

### 3.2 SVN 仓库预发发布

安装 SVN：

brew install subversion

SVN dev 目录存放源码包、二进制包、SHA-512 文件和 GPG 签名。SVN 认证使用 Apache LDAP 账号，不要把密码写入命令行或文档。

#### 3.2.1 准备工作副本

```shell
export APACHE_USER="YOUR_APACHE_LDAP_ID"
export SVN_ROOT="$HOME/svn_release"
export SVN_RELEASE_DIR="${SVN_ROOT}/release/shenyu"
export SVN_DEV_DIR="${SVN_ROOT}/dev/shenyu"

mkdir -p "${SVN_ROOT}/release" "${SVN_ROOT}/dev"
svn checkout https://dist.apache.org/repos/dist/release/shenyu \
    "${SVN_RELEASE_DIR}" --username "${APACHE_USER}"
svn checkout https://dist.apache.org/repos/dist/dev/shenyu \
    "${SVN_DEV_DIR}" --username "${APACHE_USER}"
```

已有工作副本时使用 `svn update`，不要重复 checkout。

#### 3.2.2 更新 Apache `KEYS`

当前发布经理的公钥不在 `${SVN_RELEASE_DIR}/KEYS` 时，追加并提交一次：

```shell
export GPG_KEY="YOUR_GPG_FINGERPRINT"
cd "${SVN_RELEASE_DIR}"
svn update
gpg --show-keys --keyid-format LONG KEYS
gpg --armor --export "${GPG_KEY}" > "/tmp/shenyu-${GPG_KEY}.asc"
cat "/tmp/shenyu-${GPG_KEY}.asc" >> KEYS
svn diff --check
svn commit KEYS -m "append GPG key ${GPG_KEY} to KEYS" --username "${APACHE_USER}"
rm -f "/tmp/shenyu-${GPG_KEY}.asc"
```

如果 `KEYS` 已包含该指纹，跳过追加和提交，避免重复写入。

#### 3.2.3 提交 SVN dev 发行包

先在当前终端设置发布版本和 SVN dev 工作副本路径。`SVN_VERSION_DIR` 必须是本地 SVN 工作副本中的版本目录，不能直接使用远端 URL。若变量未设置，`"${SVN_VERSION_DIR}/"` 可能会展开为 `/`，随后 `cp` 会尝试向 macOS 根目录写入并报 `Read-only file system`；不要使用 `sudo` 绕过该错误。

```shell
export RELEASE_VERSION=2.7.2
export SVN_ROOT="${HOME}/svn_release"
export SVN_DEV_DIR="${SVN_ROOT}/dev/shenyu"

# Fail early instead of copying to / when a required variable is empty.
: "${RELEASE_VERSION:?RELEASE_VERSION is not set}"
: "${SVN_DEV_DIR:?SVN_DEV_DIR is not set}"

export SVN_VERSION_DIR="${SVN_DEV_DIR}/${RELEASE_VERSION}"
printf 'SVN_VERSION_DIR=%s\n' "${SVN_VERSION_DIR}"
if [ -e "${SVN_VERSION_DIR}" ]; then
    printf 'Version directory already exists: %s\n' "${SVN_VERSION_DIR}"
    exit 1
fi
mkdir -p "${SVN_VERSION_DIR}"
test -d "${SVN_VERSION_DIR}" && test -w "${SVN_VERSION_DIR}"

cp -f shenyu-dist/shenyu-src-dist/target/*.zip* \
    "${SVN_VERSION_DIR}/"
cp -f shenyu-dist/shenyu-bootstrap-dist/target/*.tar.gz* \
    "${SVN_VERSION_DIR}/"
cp -f shenyu-dist/shenyu-admin-dist/target/*.tar.gz* \
    "${SVN_VERSION_DIR}/"

find "${SVN_VERSION_DIR}" -maxdepth 1 -type f -print | sort
cd "${SVN_DEV_DIR}"
svn add "${RELEASE_VERSION}/"
svn status
svn diff --check
svn commit "${RELEASE_VERSION}/" \
    -m "release ${RELEASE_VERSION}" --username "${APACHE_USER}"
```

提交成功后，预发地址为：

```text
https://dist.apache.org/repos/dist/dev/shenyu/<RELEASE_VERSION>/
```

## 4. 预发版本校验

以下校验必须针对 SVN dev 中实际提交的文件执行：

```shell
cd "${SVN_DEV_DIR}/${RELEASE_VERSION}"
```

### 4.1 校验 SHA-512

```shell
for checksum in *.sha512; do
    [ -f "${checksum}" ] || continue
    shasum -a 512 -c "${checksum}"
done
```

校验失败时停止投票，不要手工修改校验值；重新生成制品后再更新 SVN dev。

### 4.2 校验 GPG 签名

```shell
gpg --import "${SVN_RELEASE_DIR}/KEYS"
for signature in *.asc; do
    [ -f "${signature}" ] || continue
    artifact="${signature%.asc}"
    [ -f "${artifact}" ] || exit 1
    gpg --verify "${signature}" "${artifact}"
done
```

签名指纹必须与本次发布经理的公钥一致，不能出现 `BAD signature`、`No public key` 或 `Can't check signature`。

### 4.3 检查源码包和二进制包

源码包必须包含 `LICENSE`、`NOTICE`，且不应包含意外的 `.jar`、`.class` 或其他编译产物；二进制包也必须包含 `LICENSE` 和 `NOTICE`。同时人工检查 `NOTICE` 年份、许可证头和第三方依赖许可证。

```shell
tmp_dir=$(mktemp -d)
unzip -q "apache-shenyu-${RELEASE_VERSION}-src.zip" -d "${tmp_dir}"
src_dir="${tmp_dir}/apache-shenyu-${RELEASE_VERSION}-src"
test -f "${src_dir}/LICENSE"
test -f "${src_dir}/NOTICE"
find "${src_dir}" -type f \( -name '*.jar' -o -name '*.class' \) -print
rm -rf "${tmp_dir}"

for archive in \
    "apache-shenyu-${RELEASE_VERSION}-bootstrap-bin.tar.gz" \
    "apache-shenyu-${RELEASE_VERSION}-admin-bin.tar.gz"; do
    tmp_dir=$(mktemp -d)
    tar xzf "${archive}" -C "${tmp_dir}"
    find "${tmp_dir}" -type f \( -name LICENSE -o -name NOTICE \) -print
    rm -rf "${tmp_dir}"
done
```

### 4.4 对比 Git 标签与源码包

```shell
tmp_dir=$(mktemp -d)
curl -fL "https://github.com/apache/shenyu/archive/refs/tags/${RELEASE_TAG}.zip" \
    -o "${tmp_dir}/github-tag.zip"
unzip -q "${tmp_dir}/github-tag.zip" -d "${tmp_dir}"
unzip -q "apache-shenyu-${RELEASE_VERSION}-src.zip" -d "${tmp_dir}"
diff -r -x shenyu-dashboard -x shenyu-examples \
    -x shenyu-integrated-test -x static \
    "${tmp_dir}/shenyu-${RELEASE_VERSION}" \
    "${tmp_dir}/apache-shenyu-${RELEASE_VERSION}-src"
rm -rf "${tmp_dir}"
```

出现未预期差异时停止投票并查明原因。

## 5. 邮件列表发起投票

### 5.1 投票前检查

确认 Git 分支和标签已推送、Maven staging 已 `Close`、SVN dev 已提交，且第 4 节所有校验通过。记录提交 ID：

```shell
git rev-list -1 "${RELEASE_TAG}"
```

### 5.2 发送 `[VOTE]` 邮件

投票至少持续 72 小时，需要至少 3 个 `+1 binding`，且不能有未解决的 `-1 binding`。将尖括号占位符替换为实际值后，发送到项目开发邮件列表：

```text
Subject: [VOTE] Release Apache ShenYu <RELEASE_VERSION>

Hello ShenYu Community,

This is a call for vote to release Apache ShenYu version <RELEASE_VERSION>.

Release notes:
https://github.com/apache/shenyu/releases/tag/v<RELEASE_VERSION>

The release candidates:
https://dist.apache.org/repos/dist/dev/shenyu/<RELEASE_VERSION>/

Maven 2 staging repository:
https://repository.apache.org/content/repositories/<STAGING_REPO_ID>/org/apache/shenyu/shenyu/<RELEASE_VERSION>/

Git tag: https://github.com/apache/shenyu/tree/v<RELEASE_VERSION>/
Release Commit ID: https://github.com/apache/shenyu/commit/<COMMIT_ID>
Keys: https://downloads.apache.org/shenyu/KEYS
Verification guide: https://shenyu.apache.org/community/release-guide/#check-release

The vote will be open for at least 72 hours.

[ ] +1 approve
[ ] +0 no opinion
[ ] -1 disapprove with the reason
```

投票期间不要点击 Nexus 的 `Release`，也不要移动 SVN dev 目录。

### 5.3 公布投票结果

投票满足 Apache 要求后，向同一邮件列表发送：

```text
Subject: [RESULT][VOTE] Release Apache ShenYu <RELEASE_VERSION>

We've received 3 +1 binding votes and <N> +1 non-binding votes:

+1, <name> (binding)
+1, <name> (binding)
+1, <name> (binding)

Vote thread: <VOTE_THREAD_URL>

Thanks everyone for taking the time to verify and vote for the release!
```

### 5.4 投票未通过时清理

发送取消投票邮件，在 Nexus 对 staging 仓库执行 `Drop`，再清理 SVN dev 目录和已推送的 Git 对象：

```shell
git checkout master
git push origin --delete "${RELEASE_TAG}"
git push origin --delete "${RELEASE_BRANCH}"
git tag -d "${RELEASE_TAG}"
git branch -d "${RELEASE_BRANCH}"
svn delete "https://dist.apache.org/repos/dist/dev/shenyu/${RELEASE_VERSION}" \
    -m "delete ${RELEASE_VERSION}" --username "${APACHE_USER}"
```

未合并的本地分支只有在确认不再需要后才使用 `git branch -D`。下一轮投票标题增加 `[ROUND 2]` 等后缀。

## 6. 正式发布 Maven 和 SVN 仓库

只有投票通过并发送结果邮件后执行本节。

### 6.1 发布 SVN 制品

```shell
svn move "https://dist.apache.org/repos/dist/dev/shenyu/${RELEASE_VERSION}" \
    "https://dist.apache.org/repos/dist/release/shenyu/" \
    -m "transfer packages for ${RELEASE_VERSION}" --username "${APACHE_USER}"
```

确认新版本可用后，再按项目策略删除旧版本：

```shell
svn delete "https://dist.apache.org/repos/dist/release/shenyu/${PREVIOUS_RELEASE_VERSION}" \
    -m "remove ${PREVIOUS_RELEASE_VERSION}" --username "${APACHE_USER}"
```

### 6.2 发布 Maven staging

在 Nexus 选择投票邮件中记录的同一个 `Closed` staging 仓库，点击 `Release`。不要重新执行 `release:perform`。

### 6.3 发布 GitHub、Docker 和分支清理

在 GitHub Releases 发布 `v<RELEASE_VERSION>`，确认 Docker 发布工作流成功。按项目权限流程将 `${RELEASE_BRANCH}` 合并回 `master`；合并完成后删除分支：

```shell
git push origin --delete "${RELEASE_BRANCH}"
git branch -d "${RELEASE_BRANCH}"
```

### 6.4 更新下载页面

更新中英文下载页、版本文档、版本页、事件页和新闻页。下载链接使用 `https://www.apache.org/dyn/closer.lua`，签名和校验文件使用 `https://downloads.apache.org/shenyu/`。

## 7. 邮件列表发布版本公告

正式发布、下载链接和镜像同步完成后，使用纯文本格式发送公告邮件：

```text
Subject: [ANNOUNCE] Apache ShenYu <RELEASE_VERSION> available

Hi,

Apache ShenYu Team is glad to announce the new release of Apache ShenYu <RELEASE_VERSION>.

Download Links: https://shenyu.apache.org/download/
Release Notes: https://github.com/apache/shenyu/releases/tag/v<RELEASE_VERSION>
Website: https://shenyu.apache.org/

ShenYu Resources:
- Issue: https://github.com/apache/shenyu/issues
- Mailing list: <SHENYU_DEV_MAILING_LIST>
- Documents: https://shenyu.apache.org/docs/index/

- Apache ShenYu Team
```

公告发送后保存邮件线程和最终下载链接。邮件中不要包含 Apache LDAP 密码、GPG 口令、Maven 密文或其他凭据。

## 验证脚本

```shell
#!/usr/bin/env bash
#
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# ----------------------------------------------------------------------------
# Apache ShenYu Release Script
# Version: 2.7.1
#
# Usage:
#   ./release.sh <step> [options]
#
# Steps:
#   1  - Prerequisites check
#   2  - Maven release:prepare dry-run
#   3  - Maven release:prepare (actual)
#   4  - Maven release:perform
#   5  - Publish to SVN dev repository
#   6  - Verify release artifacts
#   7  - Print voting email templates
#   8  - Final release (after vote passes)
#   all - Run steps 1-6 sequentially
#   clean - Rollback: delete branch, tags, and clean Maven release artifacts
#   abort - Guided cleanup after Ctrl+C or interrupted release
#
# Environment variables (can also be passed via options):
#   RELEASE_VERSION  - Version to release (default: 2.7.1)
#   NEXT_VERSION     - Next SNAPSHOT version (default: 2.7.2-SNAPSHOT)
#   GPG_KEY          - GPG key ID (default: auto-detect from git user)
#   APACHE_USER      - Apache LDAP username
#   GPG_PASSPHRASE   - GPG key passphrase
#   SHENYU_HOME      - Path to shenyu source (default: <script_dir>/shenyu or script_dir)
#   SVN_DEV_DIR      - Local SVN dev checkout dir (default: ~/svn_release/dev/shenyu)
#   SVN_RELEASE_DIR  - Local SVN release checkout dir (default: ~/svn_release/release/shenyu)
# ----------------------------------------------------------------------------

set -euo pipefail

# ========================= Signal Handling & Cleanup =========================

# Track child PIDs for cleanup
_CHILD_PIDS=()
_CURRENT_STEP=""
_MVN_RUNNING=false
_STARTED_MVN_PIDS=()

# Temporary files created during release
_RELEASE_TEMP_FILES=()

cleanup() {
    local sig="${1:-}"
    echo ""
    if [[ -n "$sig" ]]; then
        log_warn "Received ${sig}. Cleaning up..."
    else
        log_info "Cleaning up..."
    fi

    # 1. Kill tracked Maven child processes
    if [[ ${#_STARTED_MVN_PIDS[@]} -gt 0 ]]; then
        log_info "Stopping Maven processes..."
        for pid in "${_STARTED_MVN_PIDS[@]}"; do
            if kill -0 "$pid" 2>/dev/null; then
                log_info "  Killing Maven process $pid"
                kill -TERM "$pid" 2>/dev/null || true
            fi
        done
        # Wait briefly for graceful shutdown
        sleep 2
        # Force kill any remaining
        for pid in "${_STARTED_MVN_PIDS[@]}"; do
            if kill -0 "$pid" 2>/dev/null; then
                log_warn "  Force killing Maven process $pid"
                kill -KILL "$pid" 2>/dev/null || true
            fi
        done
    fi

    # 2. Kill any orphan mvn/java processes spawned by this script
    #    (only those whose command line contains shenyu and release)
    local orphan_pids
    orphan_pids=$(pgrep -f "mvn.*release" 2>/dev/null || true)
    if [[ -n "$orphan_pids" ]]; then
        log_info "Stopping orphan Maven release processes..."
        echo "$orphan_pids" | xargs kill -TERM 2>/dev/null || true
        sleep 2
        echo "$orphan_pids" | xargs kill -KILL 2>/dev/null || true
    fi

    # 3. Kill GPG signing subprocesses spawned by Maven
    local gpg_pids
    gpg_pids=$(pgrep -f "gpg.*--sign\|gpg.*--detach-sign\|gpg.*-ab" 2>/dev/null || true)
    if [[ -n "$gpg_pids" ]]; then
        log_info "Stopping GPG signing processes..."
        echo "$gpg_pids" | xargs kill -TERM 2>/dev/null || true
    fi

    # 4. Clean Maven release dry-run artifacts if we were in step 2 or 3
    if [[ "$_CURRENT_STEP" == "2" || "$_CURRENT_STEP" == "3" ]]; then
        if [[ -f "${SHENYU_HOME}/release.properties" ]]; then
            log_info "Removing release.properties from interrupted dry-run/prepare..."
            rm -f "${SHENYU_HOME}/release.properties"
        fi
        # pom.xml.releaseBackup files are created by release:prepare
        local backup_count
        backup_count=$(find "${SHENYU_HOME}" -name "pom.xml.releaseBackup" 2>/dev/null | wc -l | tr -d ' ')
        if [[ "$backup_count" -gt 0 ]]; then
            log_info "Removing ${backup_count} pom.xml.releaseBackup files..."
            find "${SHENYU_HOME}" -name "pom.xml.releaseBackup" -delete 2>/dev/null || true
        fi
    fi

    # 5. Remove temporary files tracked by this script
    for f in "${_RELEASE_TEMP_FILES[@]}"; do
        if [[ -f "$f" ]]; then
            log_info "Removing temp file: $f"
            rm -f "$f"
        fi
    done

    # 6. Git checkout back to release branch if we were in the middle of step 8 merge
    if [[ "$_CURRENT_STEP" == "8" ]]; then
        local current_branch
        current_branch=$(cd "$SHENYU_HOME" && git branch --show-current 2>/dev/null || echo "")
        if [[ "$current_branch" == "master" ]]; then
            log_warn "You were on master during step 8. Switching back to ${RELEASE_BRANCH}..."
            (cd "$SHENYU_HOME" && git checkout "${RELEASE_BRANCH}" 2>/dev/null) || true
        fi
    fi

    if [[ -n "$sig" ]]; then
        log_error "Release process aborted at step ${_CURRENT_STEP:-unknown}."
        log_error "You may need to run './release.sh clean' to fully clean up."
        log_error "Or run './release.sh abort' for guided cleanup."
        exit 130
    fi
}

# Signal handler: only do cleanup on interrupt, not on normal exit
_on_signal() {
    local sig="$1"
    _SIGNAL_RECEIVED="$sig"
    cleanup "$sig"
}

trap '_on_signal SIGINT' INT
trap '_on_signal SIGTERM' TERM

# Track a Maven process PID for cleanup
track_mvn_pid() {
    # Find the most recently started mvn process
    local pid
    pid=$(pgrep -f "org.codehaus.plexus.classworlds.launcher.Launcher" 2>/dev/null | tail -1 || true)
    if [[ -n "$pid" ]]; then
        _STARTED_MVN_PIDS+=("$pid")
    fi
}

# ========================= Configuration =========================

RELEASE_VERSION="${RELEASE_VERSION:-2.7.1}"
NEXT_VERSION="${NEXT_VERSION:-2.7.2-SNAPSHOT}"
APACHE_USER="${APACHE_USER:-}"
GPG_KEY="${GPG_KEY:-}"
GPG_PASSPHRASE="${GPG_PASSPHRASE:-}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# Default SHENYU_HOME: if script is in the parent of shenyu/, use that; otherwise use script dir
if [[ -d "${SCRIPT_DIR}/shenyu/.git" ]]; then
    _DEFAULT_SHENYU_HOME="${SCRIPT_DIR}/shenyu"
else
    _DEFAULT_SHENYU_HOME="${SCRIPT_DIR}"
fi
SHENYU_HOME="${SHENYU_HOME:-${_DEFAULT_SHENYU_HOME}}"
SVN_DEV_DIR="${SVN_DEV_DIR:-${HOME}/svn_release/dev/shenyu}"
SVN_RELEASE_DIR="${SVN_RELEASE_DIR:-${HOME}/svn_release/release/shenyu}"
RELEASE_BRANCH="${RELEASE_VERSION}-release"
GIT_TAG="v${RELEASE_VERSION}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ========================= Helper Functions =========================

log_info()    { echo -e "${GREEN}[INFO]${NC}  $*"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $*"; }
log_step()    { echo -e "\n${BLUE}========== STEP $1: $2 ==========${NC}\n"; }

confirm() {
    local prompt="$1"
    local default="${2:-n}"
    local answer
    if [[ "$default" == "y" ]]; then
        read -rp "$(echo -e "${YELLOW}${prompt} [Y/n]${NC} ")" answer
        [[ -z "$answer" || "$answer" =~ ^[Yy] ]]
    else
        read -rp "$(echo -e "${YELLOW}${prompt} [y/N]${NC} ")" answer
        [[ "$answer" =~ ^[Yy] ]]
    fi
}

require_var() {
    local name="$1"
    local value="$2"
    if [[ -z "$value" ]]; then
        log_error "Required variable $name is not set. Export it or pass it as an option."
        exit 1
    fi
}

check_command() {
    if ! command -v "$1" &>/dev/null; then
        log_error "Command '$1' is required but not found. Please install it first."
        exit 1
    fi
}

detect_gpg_key() {
    if [[ -z "$GPG_KEY" ]]; then
        # Try to find the key for the Apache user.
        # Note: in gpg --list-secret-keys output, the 'sec' (primary key) line
        # comes BEFORE the 'uid' line, so we look back (-B1), not forward (-A1).
        # `|| true` guards the pipeline: under `set -o pipefail`, a grep with no
        # match returns non-zero and would otherwise abort the whole script.
        GPG_KEY=$(gpg --list-secret-keys --keyid-format long 2>/dev/null \
            | grep -B1 "uid.*${APACHE_USER}@apache.org" \
            | grep "sec" | awk '{print $2}' | cut -d'/' -f2 | head -1 || true)
        if [[ -z "$GPG_KEY" ]]; then
            # Fallback: use the first secret key
            GPG_KEY=$(gpg --list-secret-keys --keyid-format long 2>/dev/null \
                | grep "sec" | awk '{print $2}' | cut -d'/' -f2 | head -1 || true)
        fi
    fi
    echo "$GPG_KEY"
}

mvn_release_args() {
    local args="-DskipTests"
    if [[ -n "$GPG_PASSPHRASE" ]]; then
        args="$args -Dgpg.passphrase=${GPG_PASSPHRASE}"
    fi
    echo "$args"
}

# ========================= Step 1: Prerequisites Check =========================

step_1_prerequisites() {
    log_step "1" "Prerequisites Check"

    local ok=true

    # Check required commands
    for cmd in java mvn git gpg svn curl; do
        if check_command "$cmd" 2>/dev/null; then
            local version
            version=$("$cmd" --version 2>/dev/null | head -1 || echo "unknown")
            log_info "Found $cmd: $version"
        else
            log_error "Missing required command: $cmd"
            ok=false
        fi
    done

    # Check Java version (need Java 17+)
    local java_version
    java_version=$(java -version 2>&1 | head -1 | grep -oE '[0-9]+' | head -1)
    if [[ "$java_version" -lt 17 ]]; then
        log_error "Java 17+ is required, found Java $java_version"
        ok=false
    else
        log_info "Java version: $java_version (OK)"
    fi

    # Check Maven version
    local mvn_version
    mvn_version=$(mvn --version 2>/dev/null | head -1)
    log_info "Maven: $mvn_version"

    # Check GPG keys
    GPG_KEY=$(detect_gpg_key)
    if [[ -z "$GPG_KEY" ]]; then
        log_error "No GPG secret key found. Create one with: gpg --full-gen-key"
        ok=false
    else
        log_info "GPG key: $GPG_KEY"
    fi

    # Check GPG key on keyserver
    log_info "Checking GPG key on keyserver..."
    if curl -s "https://keyserver.ubuntu.com/pks/lookup?op=index&search=${GPG_KEY}" | grep -q "pub"; then
        log_info "GPG key found on keyserver.ubuntu.com (OK)"
    else
        log_warn "GPG key NOT found on keyserver.ubuntu.com. Upload with: gpg --send-key $GPG_KEY"
    fi

    # Check Maven settings.xml
    local settings_file="${HOME}/.m2/settings.xml"
    if [[ -f "$settings_file" ]]; then
        if grep -q "apache.releases.https" "$settings_file" && grep -q "apache.snapshots.https" "$settings_file"; then
            log_info "Maven settings.xml has Apache repository credentials (OK)"
        else
            log_error "Maven settings.xml missing Apache repository credentials (apache.releases.https / apache.snapshots.https)"
            ok=false
        fi
    else
        log_error "Maven settings.xml not found at $settings_file"
        ok=false
    fi

    # Check git repository
    if [[ -d "${SHENYU_HOME}/.git" ]]; then
        local current_branch
        current_branch=$(cd "$SHENYU_HOME" && git branch --show-current)
        log_info "Git repo found, current branch: $current_branch"

        # Ensure the release branch exists; create it if missing
        if ! (cd "$SHENYU_HOME" && git show-ref --verify --quiet "refs/heads/${RELEASE_BRANCH}"); then
            if (cd "$SHENYU_HOME" && git ls-remote --heads origin "${RELEASE_BRANCH}" 2>/dev/null | grep -q .); then
                log_info "Branch ${RELEASE_BRANCH} found on remote, checking it out..."
                (cd "$SHENYU_HOME" && git checkout "${RELEASE_BRANCH}") || {
                    log_error "Failed to checkout ${RELEASE_BRANCH} from origin"
                    ok=false
                }
            elif confirm "Branch ${RELEASE_BRANCH} does not exist. Create it from current branch (${current_branch})?"; then
                (cd "$SHENYU_HOME" && git checkout -b "${RELEASE_BRANCH}") || {
                    log_error "Failed to create branch ${RELEASE_BRANCH}"
                    ok=false
                }
                log_info "✅ Created branch ${RELEASE_BRANCH}"
            else
                log_error "Release branch ${RELEASE_BRANCH} is required to proceed."
                ok=false
            fi
        fi

        # Switch to the release branch if not already on it
        current_branch=$(cd "$SHENYU_HOME" && git branch --show-current)
        if [[ "$current_branch" != "$RELEASE_BRANCH" ]]; then
            log_warn "Current branch is '$current_branch', expected '$RELEASE_BRANCH'"
            if confirm "Switch to branch $RELEASE_BRANCH?"; then
                (cd "$SHENYU_HOME" && git checkout "$RELEASE_BRANCH") || true
            fi
        fi
    else
        log_error "Not a git repository at $SHENYU_HOME"
        ok=false
    fi

    # Check for uncommitted changes
    local git_status
    git_status=$(cd "$SHENYU_HOME" && git status --porcelain)
    if [[ -n "$git_status" ]]; then
        log_warn "Uncommitted changes found:"
        echo "$git_status"
        if ! confirm "Continue with uncommitted changes?"; then
            exit 1
        fi
    else
        log_info "No uncommitted changes (OK)"
    fi

    # Prompt for GPG passphrase if not set
    if [[ -z "$GPG_PASSPHRASE" ]]; then
        log_warn "GPG_PASSPHRASE is not set."
        log_warn "You can either:"
        log_warn "  1. Export it: export GPG_PASSPHRASE='your-passphrase'"
        log_warn "  2. Ensure gpg-agent has it cached"
        log_warn "  3. Use --pinentry-mode loopback by adding to ~/.gnupg/gpg.conf"
        echo ""
        if confirm "Enter GPG passphrase now? (will be hidden)"; then
            read -rs -p "GPG Passphrase: " GPG_PASSPHRASE
            echo ""
            export GPG_PASSPHRASE
        fi
    fi

    # Check Apache user
    if [[ -z "$APACHE_USER" ]]; then
        log_error "APACHE_USER is not set"
        ok=false
    else
        log_info "Apache user: $APACHE_USER"
    fi

    echo ""
    if [[ "$ok" == true ]]; then
        log_info "✅ All prerequisites passed!"
    else
        log_error "❌ Some prerequisites failed. Please fix them before proceeding."
        exit 1
    fi
}

# ========================= Step 2: Maven release:prepare dry-run =========================

step_2_dry_run() {
    log_step "2" "Maven release:prepare dry-run"
    _CURRENT_STEP="2"

    require_var "RELEASE_VERSION" "$RELEASE_VERSION"

    cd "$SHENYU_HOME"

    log_info "Running Maven release:prepare dry-run for version ${RELEASE_VERSION}..."
    log_info "Next development version will be: ${NEXT_VERSION}"

    mvn release:prepare \
        -Prelease \
        -Darguments="$(mvn_release_args)" \
        -DautoVersionSubmodules=true \
        -DdryRun=true \
        -DreleaseVersion="${RELEASE_VERSION}" \
        -DdevelopmentVersion="${NEXT_VERSION}" \
        -Dtag="${GIT_TAG}" \
        -Dusername="${APACHE_USER}"

    if [[ $? -eq 0 ]]; then
        log_info "✅ Dry-run succeeded! Cleaning up dry-run artifacts..."
        mvn release:clean -q
        log_info "Ready to proceed with actual release:prepare."
    else
        log_error "❌ Dry-run failed. Please fix the errors above before proceeding."
        exit 1
    fi
}

# ========================= Step 3: Maven release:prepare (actual) =========================

step_3_prepare() {
    log_step "3" "Maven release:prepare (actual)"
    _CURRENT_STEP="3"

    cd "$SHENYU_HOME"

    if ! confirm "This will modify pom.xml versions and create git tags. Continue?"; then
        log_info "Aborted."
        exit 0
    fi

    log_info "Cleaning previous release artifacts..."
    mvn release:clean -q

    log_info "Running Maven release:prepare for version ${RELEASE_VERSION}..."
    log_info "Next development version: ${NEXT_VERSION}"
    log_info "pushChanges=false - you will push manually after review."
    log_info "Tag will be: ${GIT_TAG} (passed explicitly to avoid stale scm.tag in release.properties)"

    mvn release:prepare \
        -Prelease \
        -Darguments="$(mvn_release_args)" \
        -DautoVersionSubmodules=true \
        -DpushChanges=false \
        -DreleaseVersion="${RELEASE_VERSION}" \
        -DdevelopmentVersion="${NEXT_VERSION}" \
        -Dtag="${GIT_TAG}" \
        -Dusername="${APACHE_USER}"

    if [[ $? -ne 0 ]]; then
        log_error "❌ release:prepare failed. Rolling back..."
        mvn release:rollback -q 2>/dev/null || true
        exit 1
    fi

    log_info "✅ release:prepare succeeded!"
    log_info ""
    log_info "Review the changes:"
    log_info "  git log --oneline -5"
    log_info "  git tag -l 'v${RELEASE_VERSION}'"
    log_info ""

    if confirm "Push release branch and tag to origin?"; then
        git push origin "${RELEASE_BRANCH}"
        # Push ONLY the release tag, never all tags (--tags would push every
        # local tag, including stray/test ones, to the remote).
        git push origin "v${RELEASE_VERSION}"
        log_info "✅ Branch and tag v${RELEASE_VERSION} pushed."
    else
        log_warn "Branch and tag NOT pushed. Push manually with:"
        log_warn "  git push origin ${RELEASE_BRANCH}"
        log_warn "  git push origin v${RELEASE_VERSION}"
    fi
}

# ========================= Step 4: Maven release:perform =========================

step_4_perform() {
    log_step "4" "Maven release:perform"
    _CURRENT_STEP="4"

    cd "$SHENYU_HOME"

    if ! confirm "This will deploy artifacts to Apache Nexus staging repository. Continue?"; then
        log_info "Aborted."
        exit 0
    fi

    log_info "Running Maven release:perform for version ${RELEASE_VERSION}..."

    mvn release:perform \
        -Prelease \
        -Darguments="$(mvn_release_args)" \
        -DautoVersionSubmodules=true \
        -Dusername="${APACHE_USER}"

    if [[ $? -ne 0 ]]; then
        log_error "❌ release:perform failed."
        exit 1
    fi

    log_info "✅ release:perform succeeded!"
    log_info ""
    log_warn "⚠️  IMPORTANT: Go to Apache Nexus and Close the staging repository:"
    log_warn "   https://repository.apache.org/#stagingRepositories"
    log_warn "   Find the staging repo for org.apache.shenyu, select it, and click 'Close'."
    log_warn "   Note the repository ID (e.g., orgapacheshenyu-XXXX) for the vote email."
}

# ========================= Step 5: Publish to SVN dev repository =========================

step_5_svn_dev() {
    log_step "5" "Publish to SVN dev repository"
    _CURRENT_STEP="5"

    require_var "RELEASE_VERSION" "$RELEASE_VERSION"
    require_var "APACHE_USER" "$APACHE_USER"

    # Step 5a: Update KEYS file
    log_info "--- Step 5a: Update KEYS file ---"

    GPG_KEY=$(detect_gpg_key)

    if [[ -d "${HOME}/svn_release/release/shenyu" ]]; then
        log_info "Updating existing KEYS checkout..."
        cd "${HOME}/svn_release/release/shenyu"
        svn update
    else
        log_info "Checking out SVN release directory..."
        mkdir -p "${HOME}/svn_release/release"
        cd "${HOME}/svn_release/release"
        svn --username="${APACHE_USER}" co https://dist.apache.org/repos/dist/release/shenyu
        cd shenyu
    fi

    # Check if our key is already in KEYS
    if grep -q "$GPG_KEY" KEYS 2>/dev/null; then
        log_info "GPG key already in KEYS file (OK)"
    else
        log_info "Appending GPG public key to KEYS file..."
        gpg -a --export "${GPG_KEY}" >> KEYS
        if confirm "Commit KEYS update to SVN?"; then
            svn --username="${APACHE_USER}" commit -m "append to KEYS"
        fi
    fi

    # Step 5b: Copy distribution files to SVN dev
    log_info "--- Step 5b: Copy distribution files to SVN dev ---"

    if [[ -d "${SVN_DEV_DIR}" ]]; then
        log_info "Updating existing SVN dev checkout..."
        cd "${SVN_DEV_DIR}"
        svn update
    else
        log_info "Checking out SVN dev directory..."
        mkdir -p "$(dirname "${SVN_DEV_DIR}")"
        cd "$(dirname "${SVN_DEV_DIR}")"
        svn --username="${APACHE_USER}" co https://dist.apache.org/repos/dist/dev/shenyu
        cd shenyu
    fi

    local version_dir="${SVN_DEV_DIR}/${RELEASE_VERSION}"
    if [[ -d "$version_dir" ]]; then
        log_warn "Version directory already exists: $version_dir"
        if ! confirm "Remove and recreate?"; then
            log_info "Keeping existing directory."
        else
            svn delete "$version_dir" -m "remove old ${RELEASE_VERSION}" 2>/dev/null || true
            rm -rf "$version_dir"
        fi
    fi

    mkdir -p "$version_dir"

    local dist_dir="${SHENYU_HOME}/shenyu-dist"
    log_info "Copying distribution files from ${dist_dir}..."

    # Source distribution
    if ls "${dist_dir}/shenyu-src-dist/target/"*.zip* 1>/dev/null 2>&1; then
        cp -f "${dist_dir}/shenyu-src-dist/target/"*.zip* "$version_dir/"
        log_info "  ✅ Source distribution copied"
    else
        log_error "  ❌ Source distribution not found at ${dist_dir}/shenyu-src-dist/target/"
        log_error "     Make sure release:perform has been run and distributions were built."
    fi

    # Bootstrap distribution
    if ls "${dist_dir}/shenyu-bootstrap-dist/target/"*.tar.gz* 1>/dev/null 2>&1; then
        cp -f "${dist_dir}/shenyu-bootstrap-dist/target/"*.tar.gz* "$version_dir/"
        log_info "  ✅ Bootstrap distribution copied"
    else
        log_error "  ❌ Bootstrap distribution not found"
    fi

    # Admin distribution
    if ls "${dist_dir}/shenyu-admin-dist/target/"*.tar.gz* 1>/dev/null 2>&1; then
        cp -f "${dist_dir}/shenyu-admin-dist/target/"*.tar.gz* "$version_dir/"
        log_info "  ✅ Admin distribution copied"
    else
        log_error "  ❌ Admin distribution not found"
    fi

    # List files in version directory
    log_info "Files to be committed:"
    ls -la "$version_dir/"

    # Step 5c: Commit to SVN
    log_info "--- Step 5c: Commit to SVN ---"

    cd "${SVN_DEV_DIR}"
    svn add "${RELEASE_VERSION}/" 2>/dev/null || true

    if confirm "Commit release ${RELEASE_VERSION} to SVN dev?"; then
        svn --username="${APACHE_USER}" commit -m "release ${RELEASE_VERSION}"
        log_info "✅ SVN dev commit done."
    else
        log_warn "SVN commit skipped. Commit manually:"
        log_warn "  cd ${SVN_DEV_DIR} && svn --username=${APACHE_USER} commit -m 'release ${RELEASE_VERSION}'"
    fi
}

# ========================= Step 6: Verify release artifacts =========================

step_6_verify() {
    log_step "6" "Verify release artifacts"
    _CURRENT_STEP="6"

    require_var "RELEASE_VERSION" "$RELEASE_VERSION"

    local version_dir="${SVN_DEV_DIR}/${RELEASE_VERSION}"
    if [[ ! -d "$version_dir" ]]; then
        log_error "Version directory not found: $version_dir"
        log_error "Run step 5 first, or check SVN_DEV_DIR setting."
        exit 1
    fi

    cd "$version_dir"

    local all_ok=true

    # 6a: Verify sha512 checksums
    log_info "--- 6a: Verify SHA512 checksums ---"
    for sha_file in *.sha512; do
        if [[ -f "$sha_file" ]]; then
            if shasum -a 512 -c "$sha_file" 2>/dev/null; then
                log_info "  ✅ $sha_file verified"
            else
                log_error "  ❌ $sha_file FAILED"
                all_ok=false
            fi
        else
            log_warn "  No .sha512 files found. Generating checksums..."
            for artifact in apache-shenyu-${RELEASE_VERSION}-src.zip \
                            apache-shenyu-${RELEASE_VERSION}-bootstrap-bin.tar.gz \
                            apache-shenyu-${RELEASE_VERSION}-admin-bin.tar.gz; do
                if [[ -f "$artifact" ]]; then
                    shasum -a 512 "$artifact" > "${artifact}.sha512"
                    log_info "  Generated ${artifact}.sha512"
                fi
            done
        fi
    done

    # 6b: Verify GPG signatures
    log_info "--- 6b: Verify GPG signatures ---"
    if ! curl -sf https://downloads.apache.org/shenyu/KEYS -o KEYS.download 2>/dev/null; then
        log_warn "Could not download KEYS from Apache. Using local keys."
    fi
    gpg --import KEYS.download 2>/dev/null || true
    rm -f KEYS.download

    for asc_file in *.asc; do
        if [[ -f "$asc_file" ]]; then
            local artifact="${asc_file%.asc}"
            if [[ -f "$artifact" ]]; then
                if gpg --verify "$asc_file" "$artifact" 2>/dev/null; then
                    log_info "  ✅ $asc_file signature verified"
                else
                    log_error "  ❌ $asc_file signature FAILED"
                    all_ok=false
                fi
            fi
        fi
    done

    # 6c: Verify source dist contains required files
    log_info "--- 6c: Verify source distribution contents ---"
    local src_zip="apache-shenyu-${RELEASE_VERSION}-src.zip"
    if [[ -f "$src_zip" ]]; then
        local tmp_dir
        tmp_dir=$(mktemp -d)
        unzip -q "$src_zip" -d "$tmp_dir"

        local src_dir="${tmp_dir}/apache-shenyu-${RELEASE_VERSION}-src"

        # Check LICENSE and NOTICE
        for file in LICENSE NOTICE; do
            if [[ -f "${src_dir}/${file}" ]]; then
                log_info "  ✅ ${file} exists"
            else
                log_error "  ❌ ${file} MISSING"
                all_ok=false
            fi
        done

        # Check year in NOTICE
        local current_year
        current_year=$(date +%Y)
        if grep -q "$current_year" "${src_dir}/NOTICE" 2>/dev/null; then
            log_info "  ✅ NOTICE year is current ($current_year)"
        else
            log_warn "  ⚠️  NOTICE year may need updating (expected $current_year)"
        fi

        # Clean up
        rm -rf "$tmp_dir"
    else
        log_error "Source zip not found: $src_zip"
        all_ok=false
    fi

    # 6d: Verify binary distributions
    log_info "--- 6d: Verify binary distributions ---"
    for bin_file in apache-shenyu-${RELEASE_VERSION}-bootstrap-bin.tar.gz \
                     apache-shenyu-${RELEASE_VERSION}-admin-bin.tar.gz; do
        if [[ -f "$bin_file" ]]; then
            local tmp_dir
            tmp_dir=$(mktemp -d)
            tar xzf "$bin_file" -C "$tmp_dir"

            for file in LICENSE NOTICE; do
                if find "$tmp_dir" -name "$file" | head -1 | grep -q .; then
                    log_info "  ✅ ${bin_file}: ${file} exists"
                else
                    log_error "  ❌ ${bin_file}: ${file} MISSING"
                    all_ok=false
                fi
            done

            rm -rf "$tmp_dir"
        else
            log_warn "  Binary not found: $bin_file"
        fi
    done

    # 6e: Compare SVN source with GitHub tag
    log_info "--- 6e: Verify SVN source matches GitHub tag ---"
    log_info "To manually verify, run:"
    echo ""
    echo "  wget https://github.com/apache/shenyu/archive/v${RELEASE_VERSION}.zip"
    echo "  unzip v${RELEASE_VERSION}.zip"
    echo "  unzip apache-shenyu-${RELEASE_VERSION}-src.zip"
    echo "  diff -r -x 'shenyu-dashboard' -x 'shenyu-examples' -x 'shenyu-integrated-test' -x 'static' \\"
    echo "    apache-shenyu-${RELEASE_VERSION}-src shenyu-${RELEASE_VERSION}"
    echo ""

    echo ""
    if [[ "$all_ok" == true ]]; then
        log_info "✅ All verification checks passed!"
    else
        log_warn "⚠️  Some verification checks failed. Review the output above."
    fi
}

# ========================= Step 7: Print voting email templates =========================

step_7_vote_templates() {
    log_step "7" "Voting email templates"
    _CURRENT_STEP="7"

    # Get the release commit ID
    local commit_id
    commit_id=$(cd "$SHENYU_HOME" && git rev-list -1 "v${RELEASE_VERSION}" 2>/dev/null || echo "")
    if [[ -z "$commit_id" ]]; then
        log_warn "Could not resolve commit ID for tag v${RELEASE_VERSION}."
        log_warn "Make sure step 3 (release:prepare) has created the tag, or pass RELEASE_VERSION."
        commit_id="COMMIT_ID_HERE"
    fi

    # Staging repo ID: the script cannot query Nexus (needs auth), so it must be
    # supplied via the STAGING_REPO_ID env var. If absent, leave a placeholder.
    local staging_repo_id="${STAGING_REPO_ID:-}"
    if [[ -z "$staging_repo_id" ]]; then
        log_warn "STAGING_REPO_ID is not set."
        log_warn "Close the staging repo at https://repository.apache.org/#stagingRepositories,"
        log_warn "find its ID (e.g., orgapacheshenyu-XXXX), then either:"
        log_warn "  export STAGING_REPO_ID=orgapacheshenyu-XXXX && ./release.sh 7"
        log_warn "or manually replace STAGING_REPO_ID in the vote email below."
        echo ""
        staging_repo_id="STAGING_REPO_ID"
    else
        log_info "STAGING_REPO_ID = ${staging_repo_id}"
        # Best-effort: check that the staging repo URL is reachable (i.e. it has been Closed)
        local staging_url="https://repository.apache.org/content/repositories/${staging_repo_id}/org/apache/shenyu/shenyu/${RELEASE_VERSION}/"
        if curl -sf -o /dev/null --max-time 15 "$staging_url" 2>/dev/null; then
            log_info "✅ Staging repo URL is reachable (repo appears Closed): $staging_url"
        else
            log_warn "⚠️  Staging repo URL not reachable yet: $staging_url"
            log_warn "   Did you Close the staging repo in Nexus? Vote email links won't work until Closed."
        fi
        echo ""
    fi

    log_info "Auto-filled values:"
    log_info "  RELEASE_VERSION → ${RELEASE_VERSION}"
    log_info "  COMMIT_ID       → ${commit_id}"
    log_info "  STAGING_REPO_ID → ${staging_repo_id}"
    echo ""

    cat <<VOTE_EMAIL
╔══════════════════════════════════════════════════════════════════╗
║                      VOTE EMAIL                                  ║
╚══════════════════════════════════════════════════════════════════╝

Send to: dev@shenyu.apache.org
Subject: [VOTE] Release Apache ShenYu ${RELEASE_VERSION}

--- BEGIN EMAIL ---

Hello ShenYu Community,

This is a call for vote to release Apache ShenYu version ${RELEASE_VERSION}

Release notes:
https://github.com/apache/shenyu/releases/tag/v${RELEASE_VERSION}

The release candidates:
https://dist.apache.org/repos/dist/dev/shenyu/${RELEASE_VERSION}/

Maven 2 staging repository:
https://repository.apache.org/content/repositories/${staging_repo_id}/org/apache/shenyu/shenyu/${RELEASE_VERSION}/

Git tag for the release:
https://github.com/apache/shenyu/tree/v${RELEASE_VERSION}/

Release Commit ID:
https://github.com/apache/shenyu/commit/${commit_id}

Keys to verify the Release Candidate:
https://downloads.apache.org/shenyu/KEYS

Look at here for how to verify this release candidate:
https://shenyu.apache.org/community/release-guide/#check-release

The vote will be open for at least 72 hours or until necessary number of votes is reached.

Please vote accordingly:
[ ] +1 approve
[ ] +0 no opinion
[ ] -1 disapprove with the reason

Checklist for reference:
[ ] Download links are valid.
[ ] Checksums and PGP signatures are valid.
[ ] Source code distributions have correct names matching the current release.
[ ] LICENSE and NOTICE files are correct for each ShenYu repo.
[ ] All files have license headers if necessary.
[ ] No compiled archives bundled in source archive.

--- END EMAIL ---

VOTE_EMAIL

    cat <<RESULT_EMAIL
╔══════════════════════════════════════════════════════════════════╗
║                   VOTE RESULT EMAIL                              ║
╚══════════════════════════════════════════════════════════════════╝

Send to: dev@shenyu.apache.org
Subject: [RESULT][VOTE] Release Apache ShenYu ${RELEASE_VERSION}

--- BEGIN EMAIL ---

We've received 3 +1 binding votes and X +1 non-binding votes:

+1, (binding voter 1) (binding)
+1, (binding voter 2) (binding)
+1, (binding voter 3) (binding)
+1, (non-binding voter 1) (non-binding)
+1, (non-binding voter 2) (non-binding)

Vote thread:
https://lists.apache.org/thread/XXXXX

Thanks everyone for taking the time to verify and vote for the release!

--- END EMAIL ---

RESULT_EMAIL

    cat <<ANNOUNCE_EMAIL
╔══════════════════════════════════════════════════════════════════╗
║                    ANNOUNCE EMAIL                                ║
╚══════════════════════════════════════════════════════════════════╝

Send to: dev@shenyu.apache.org, announce@apache.org
Subject: [ANNOUNCE] Apache ShenYu ${RELEASE_VERSION} available

NOTE: announce@apache.org requires plain text format only.

--- BEGIN EMAIL ---

Hi,

Apache ShenYu Team is glad to announce the new release of Apache ShenYu ${RELEASE_VERSION}.

Apache ShenYu is an asynchronous, high-performance, cross-language, responsive API gateway.

Support various languages (http protocol), support Dubbo, Spring-Cloud, Grpc, Motan, Sofa, Tars and other protocols.
Plugin design idea, plugin hot swap, easy to expand.
Flexible flow filtering to meet various flow control.
Built-in rich plugin support, authentication, limiting, fuse, firewall, etc.
Dynamic flow configuration, high performance.
Support cluster deployment, A/B Test, blue-green release.

Download Links: https://shenyu.apache.org/download/
Release Notes: https://github.com/apache/shenyu/releases/tag/v${RELEASE_VERSION}
Website: https://shenyu.apache.org/

ShenYu Resources:
- Issue: https://github.com/apache/shenyu/issues
- Mailing list: dev@shenyu.apache.org
- Documents: https://shenyu.apache.org/docs/index/

- Apache ShenYu Team

--- END EMAIL ---

ANNOUNCE_EMAIL

    log_info "Emails above have RELEASE_VERSION and COMMIT_ID auto-filled."
    if [[ "$staging_repo_id" == "STAGING_REPO_ID" ]]; then
        log_warn "STAGING_REPO_ID is still a placeholder. Re-run with:"
        log_warn "  STAGING_REPO_ID=orgapacheshenyu-XXXX ./release.sh 7"
    else
        log_info "STAGING_REPO_ID filled from env: ${staging_repo_id}"
    fi
    log_info "After the vote passes (≥3 binding +1), run './release.sh 8' to finalize."
}

# ========================= Step 8: Final release (after vote passes) =========================

step_8_final_release() {
    log_step "8" "Final release (after vote passes)"
    _CURRENT_STEP="8"

    require_var "RELEASE_VERSION" "$RELEASE_VERSION"
    require_var "APACHE_USER" "$APACHE_USER"

    local prev_version
    prev_version=$(echo "$RELEASE_VERSION" | awk -F. '{printf "%d.%d.%d", $1, $2, $3-1}')
    # For 2.7.1, previous is 2.7.0

    if ! confirm "Has the vote passed with at least 3 +1 binding votes?"; then
        log_info "Cannot proceed with final release until vote passes."
        exit 0
    fi

    # 8a: SVN release
    log_info "--- 8a: Move artifacts from SVN dev to release ---"
    log_info "Running: svn mv https://dist.apache.org/repos/dist/dev/shenyu/${RELEASE_VERSION} https://dist.apache.org/repos/dist/release/shenyu/ -m 'transfer packages for ${RELEASE_VERSION}'"
    if confirm "Execute SVN move?"; then
        svn mv "https://dist.apache.org/repos/dist/dev/shenyu/${RELEASE_VERSION}" \
               "https://dist.apache.org/repos/dist/release/shenyu/" \
               -m "transfer packages for ${RELEASE_VERSION}" \
               --username="${APACHE_USER}"
        log_info "✅ SVN move done."
    fi

    log_info "--- 8a2: Delete previous version from SVN release ---"
    log_info "Previous version: ${prev_version}"
    if confirm "Delete previous version ${prev_version} from SVN release?"; then
        svn delete "https://dist.apache.org/repos/dist/release/shenyu/${prev_version}" \
                   -m "remove ${prev_version}" \
                   --username="${APACHE_USER}" 2>/dev/null || log_warn "Previous version not found or already deleted."
    fi

    # 8b: Maven release
    log_info ""
    log_info "--- 8b: Release Maven staging repository ---"
    log_info "Go to https://repository.apache.org/#stagingRepositories"
    log_info "Find the staging repo for org.apache.shenyu, select it, and click 'Release'."
    log_info ""
    log_info "Press Enter after you have released the staging repository..."
    read -r

    # 8c: GitHub release
    log_info "--- 8c: GitHub release ---"
    log_info "Go to https://github.com/apache/shenyu/releases"
    log_info "Edit the v${RELEASE_VERSION} release and click 'Publish'."
    log_info ""
    log_info "Press Enter after you have published the GitHub release..."
    read -r

    # 8d: Docker release (automatic via GitHub Actions)
    log_info "--- 8d: Docker release ---"
    log_info "Docker images are automatically published via GitHub Actions workflow (docker-publish-dockerhub.yml)."
    log_info "Monitor: https://github.com/apache/shenyu/actions"
    log_info ""
    log_info "If the workflow fails, you can build manually:"
    echo ""
    echo "  git checkout v${RELEASE_VERSION}"
    echo "  cd shenyu-dist"
    echo "  mvn clean package -Prelease"
    echo "  docker buildx create --name shenyu"
    echo "  docker buildx use shenyu"
    echo "  docker login"
    echo "  docker buildx build \\"
    echo "    -t apache/shenyu-admin:latest \\"
    echo "    -t apache/shenyu-admin:${RELEASE_VERSION} \\"
    echo "    --build-arg APP_NAME=apache-shenyu-${RELEASE_VERSION}-admin-bin \\"
    echo "    --platform=linux/arm64,linux/amd64 \\"
    echo "    -f ./shenyu-admin-dist/docker/Dockerfile --push ./shenyu-admin-dist"
    echo "  docker buildx build \\"
    echo "    -t apache/shenyu-bootstrap:latest \\"
    echo "    -t apache/shenyu-bootstrap:${RELEASE_VERSION} \\"
    echo "    --build-arg APP_NAME=apache-shenyu-${RELEASE_VERSION}-bootstrap-bin \\"
    echo "    --platform=linux/arm64,linux/amd64 \\"
    echo "    -f ./shenyu-bootstrap-dist/docker/Dockerfile --push ./shenyu-bootstrap-dist"
    echo ""

    # 8e: Merge release branch back to master
    log_info "--- 8e: Merge release branch back to master ---"
    if confirm "Merge ${RELEASE_BRANCH} back to master?"; then
        (cd "$SHENYU_HOME" && \
            git checkout master && \
            git merge "origin/${RELEASE_BRANCH}" && \
            git pull && \
            git push origin master)
        log_info "✅ Merged and pushed to master."

        if confirm "Delete release branch ${RELEASE_BRANCH}?"; then
            (cd "$SHENYU_HOME" && \
                git push origin --delete "${RELEASE_BRANCH}" 2>/dev/null || true && \
                git branch -d "${RELEASE_BRANCH}" 2>/dev/null || true)
            log_info "✅ Release branch deleted."
        fi
    fi

    # 8f: Update download pages
    log_info "--- 8f: Update download pages ---"
    log_info "⚠️  Manual steps required:"
    log_info "  1. Update English download page: https://shenyu.apache.org/download/"
    log_info "  2. Update Chinese download page: https://shenyu.apache.org/zh/download/"
    log_info "     - Use https://www.apache.org/dyn/closer.lua for download links (NOT closer.cgi or mirrors.cgi)"
    log_info "     - GPG signature and hash links must use: https://downloads.apache.org/shenyu/"
    log_info "  3. Archive documentation for ${RELEASE_VERSION}"
    log_info "  4. Update version page"
    log_info "  5. Update events page with new release event"
    log_info "  6. Update news page with new release news"
    log_info ""
    log_info "Wait at least 1 hour for Apache mirror to sync before updating download pages."

    # 8g: Send announce email
    log_info "--- 8g: Send announce email ---"
    log_info "Send the announce email (see template from step 7) to:"
    log_info "  - dev@shenyu.apache.org"
    log_info "  - announce@apache.org (plain text format only!)"

    log_info ""
    log_info "🎉 Release ${RELEASE_VERSION} process complete!"
}

# ========================= Reset (hard rollback after prepare failure) =========================

step_reset() {
    log_step "RESET" "Hard rollback to origin/master after a failed release:prepare"
    _CURRENT_STEP="reset"

    require_var "RELEASE_VERSION" "$RELEASE_VERSION"

    cd "$SHENYU_HOME"

    log_warn "This is a DESTRUCTIVE reset for the case where 'release:prepare' failed and left"
    log_warn "the workspace polluted: a leftover tag, release.properties, pom.xml.releaseBackup"
    log_warn "files, and commits that the maven-release-plugin wrote onto master / ${RELEASE_BRANCH}."
    log_warn "It restores master and (if present) ${RELEASE_BRANCH} to origin/master."
    log_warn "Nothing is pushed to the remote — only local state is reset."
    echo ""

    # Show current state so the user can confirm before destroying anything
    log_info "Current state:"
    log_info "  HEAD:            $(git rev-parse --short HEAD 2>/dev/null || echo '?')"
    log_info "  Current branch:  $(git branch --show-current 2>/dev/null || echo '?')"
    log_info "  Local master:    $(git rev-parse --short master 2>/dev/null || echo '?')"
    log_info "  origin/master:   $(git rev-parse --short origin/master 2>/dev/null || echo '?')"
    log_info "  Tag v${RELEASE_VERSION} exists locally:  $(git tag -l "v${RELEASE_VERSION}" | grep -q . && echo yes || echo no)"
    log_info "  Branch ${RELEASE_BRANCH} exists:         $(git branch --list "${RELEASE_BRANCH}" | grep -q . && echo yes || echo no)"
    local backup_count
    backup_count=$(find "${SHENYU_HOME}" -name "pom.xml.releaseBackup" 2>/dev/null | wc -l | tr -d ' ')
    log_info "  pom.xml.releaseBackup files:              ${backup_count}"
    log_info "  release.properties present:               $([[ -f release.properties ]] && echo yes || echo no)"
    echo ""

    if ! confirm "Proceed with destructive local reset?"; then
        log_info "Aborted. Nothing was changed."
        exit 0
    fi

    # 1. Fetch origin so origin/master reflects the true remote state
    log_info "Fetching origin to refresh origin/master..."
    git fetch origin --quiet

    # 2. Delete the local release tag if it exists
    if git tag -l "v${RELEASE_VERSION}" | grep -q .; then
        log_info "Deleting local tag v${RELEASE_VERSION}..."
        git tag -d "v${RELEASE_VERSION}"
    else
        log_info "No local tag v${RELEASE_VERSION} to delete."
    fi

    # 3. Reset master back to origin/master, discarding any release-plugin commits
    if git show-ref --verify --quiet "refs/heads/master"; then
        log_info "Resetting local master to origin/master..."
        git checkout master --quiet 2>/dev/null || git checkout master
        git reset --hard origin/master
    else
        log_warn "No local 'master' branch found; skipping master reset."
    fi

    # 4. Delete the release branch (it is rebuilt cleanly by step 1 on the next run)
    if git branch --list "${RELEASE_BRANCH}" | grep -q .; then
        # Make sure we are not standing on the branch we are about to delete
        if [[ "$(git branch --show-current)" == "${RELEASE_BRANCH}" ]]; then
            git checkout master --quiet
        fi
        log_info "Deleting local branch ${RELEASE_BRANCH}..."
        git branch -D "${RELEASE_BRANCH}"
    else
        log_info "No local branch ${RELEASE_BRANCH} to delete."
    fi

    # 5. Remove Maven release-plugin working files (untracked, so not removed by git reset)
    local removed_backups
    removed_backups=$(find "${SHENYU_HOME}" -name "pom.xml.releaseBackup" -delete -print 2>/dev/null | wc -l | tr -d ' ')
    if [[ "$removed_backups" -gt 0 ]]; then
        log_info "Removed ${removed_backups} pom.xml.releaseBackup file(s)."
    fi
    if [[ -f release.properties ]]; then
        rm -f release.properties
        log_info "Removed release.properties."
    fi

    # 6. Final state report
    echo ""
    log_info "✅ Reset complete. Final state:"
    log_info "  HEAD / branch:   $(git branch --show-current) @ $(git rev-parse --short HEAD)"
    log_info "  master == origin/master:  $(git rev-parse --short master) == $(git rev-parse --short origin/master)"
    log_info "  Tag v${RELEASE_VERSION}:          $(git tag -l "v${RELEASE_VERSION}" | grep -q . && echo 'still present' || echo 'gone')"
    log_info "  Branch ${RELEASE_BRANCH}:                $(git branch --list "${RELEASE_BRANCH}" | grep -q . && echo 'still present' || echo 'gone')"
    log_info "  Pom version:     $(awk '/<\/parent>/{f=1; next} f&&/<version>/{print; exit}' pom.xml | tr -d ' ')"
    log_info ""
    log_warn "⚠️  If a Nexus staging repository was created, drop it manually:"
    log_warn "   https://repository.apache.org/#stagingRepositories"
    log_warn "⚠️  If a remote tag / branch was pushed, remove it with './release.sh clean'."
    log_info ""
    log_info "Next: re-run from step 1 — './release.sh 1' will recreate ${RELEASE_BRANCH} from master."
}

# ========================= Clean / Rollback =========================

step_clean() {
    log_step "CLEAN" "Rollback release artifacts"
    _CURRENT_STEP="clean"

    require_var "RELEASE_VERSION" "$RELEASE_VERSION"

    cd "$SHENYU_HOME"

    log_warn "This will clean up Maven release artifacts and optionally delete the release branch and tag."

    # Maven release:clean
    if confirm "Run mvn release:clean?"; then
        mvn release:clean -q
        log_info "✅ Maven release artifacts cleaned."
    fi

    # Delete local tag
    if git tag -l "v${RELEASE_VERSION}" | grep -q .; then
        if confirm "Delete local tag v${RELEASE_VERSION}?"; then
            git tag -d "v${RELEASE_VERSION}"
            log_info "✅ Local tag deleted."
        fi
    fi

    # Delete remote tag
    if git ls-remote --tags origin "v${RELEASE_VERSION}" | grep -q .; then
        if confirm "Delete remote tag v${RELEASE_VERSION}?"; then
            git push origin --delete tag "v${RELEASE_VERSION}"
            log_info "✅ Remote tag deleted."
        fi
    fi

    # Delete release branch
    if git branch --list "${RELEASE_BRANCH}" | grep -q .; then
        if confirm "Delete local branch ${RELEASE_BRANCH}?"; then
            git branch -D "${RELEASE_BRANCH}"
            log_info "✅ Local branch deleted."
        fi
    fi

    if git ls-remote --heads origin "${RELEASE_BRANCH}" | grep -q .; then
        if confirm "Delete remote branch ${RELEASE_BRANCH}?"; then
            git push origin --delete "${RELEASE_BRANCH}"
            log_info "✅ Remote branch deleted."
        fi
    fi

    # Drop Nexus staging repo
    log_warn "⚠️  Remember to drop the Nexus staging repository if it was closed:"
    log_warn "   https://repository.apache.org/#stagingRepositories"

    # Delete SVN dev artifacts
    local svn_dev_url="https://dist.apache.org/repos/dist/dev/shenyu/${RELEASE_VERSION}"
    local svn_release_url="https://dist.apache.org/repos/dist/release/shenyu/${RELEASE_VERSION}"

    # Safety: refuse if the version was already promoted to SVN release (cannot be rolled back)
    if svn --non-interactive info "${svn_release_url}" >/dev/null 2>&1; then
        log_error "${RELEASE_VERSION} is already in the SVN RELEASE area."
        log_error "A promoted release cannot be removed from SVN release. Skipping dev cleanup for safety."
    elif svn --non-interactive info "${svn_dev_url}" >/dev/null 2>&1; then
        log_info "Found ${RELEASE_VERSION}/ in SVN dev. Contents:"
        svn --non-interactive list "${svn_dev_url}" 2>/dev/null || true
        echo ""
        if confirm "Delete ${RELEASE_VERSION}/ from SVN dev?"; then
            log_info "Deleting SVN dev ${RELEASE_VERSION} (using cached credentials; --non-interactive)..."
            # --non-interactive uses cached creds from keychain; if not cached, this fails
            # cleanly instead of hanging on a password prompt the script can't answer.
            if svn --non-interactive delete "${svn_dev_url}" \
                   -m "remove Apache ShenYu ${RELEASE_VERSION} RC (rollback)" \
                   --username "${APACHE_USER}"; then
                log_info "✅ SVN dev: ${RELEASE_VERSION}/ deleted."
            else
                log_error "❌ svn delete failed (credentials not cached, or network/permission error)."
                log_error "   Run it manually (it will prompt for your Apache LDAP password):"
                log_error "     svn delete ${svn_dev_url} -m 'remove ${RELEASE_VERSION} RC' --username ${APACHE_USER}"
            fi
        else
            log_warn "SVN dev deletion skipped. Delete manually if needed:"
            log_warn "  svn delete ${svn_dev_url} -m 'remove ${RELEASE_VERSION} RC' --username ${APACHE_USER}"
        fi
    else
        log_info "No ${RELEASE_VERSION}/ in SVN dev. Nothing to delete there."
    fi

    log_info "✅ Cleanup complete."
}

# ========================= Abort (guided cleanup after Ctrl+C) =========================

step_abort() {
    log_step "ABORT" "Guided cleanup after interrupted release"
    _CURRENT_STEP="abort"

    require_var "RELEASE_VERSION" "$RELEASE_VERSION"

    cd "$SHENYU_HOME"

    log_warn "This will aggressively clean up all artifacts from an interrupted release."
    echo ""

    local found_issues=false

    # 1. Kill any remaining Maven/GPG processes
    log_info "--- Checking for orphan Maven/GPG processes ---"
    local mvn_pids gpg_pids

    mvn_pids=$(pgrep -f "mvn.*release\|org.codehaus.plexus.classworlds" 2>/dev/null || true)
    if [[ -n "$mvn_pids" ]]; then
        log_warn "Found running Maven processes:"
        echo "$mvn_pids" | while read -r pid; do
            local cmd
            cmd=$(ps -p "$pid" -o command= 2>/dev/null || echo "unknown")
            log_warn "  PID $pid: $cmd"
        done
        if confirm "Kill these Maven processes?"; then
            echo "$mvn_pids" | xargs kill -TERM 2>/dev/null || true
            sleep 2
            echo "$mvn_pids" | xargs kill -KILL 2>/dev/null || true
            log_info "✅ Maven processes killed."
        fi
        found_issues=true
    else
        log_info "No running Maven processes found."
    fi

    gpg_pids=$(pgrep -f "gpg.*--sign\|gpg.*--detach-sign\|gpg.*-ab\|gpg-agent" 2>/dev/null || true)
    if [[ -n "$gpg_pids" ]]; then
        log_warn "Found running GPG processes (likely from Maven signing):"
        echo "$gpg_pids" | while read -r pid; do
            local cmd
            cmd=$(ps -p "$pid" -o command= 2>/dev/null || echo "unknown")
            log_warn "  PID $pid: $cmd"
        done
        if confirm "Kill these GPG processes?"; then
            echo "$gpg_pids" | xargs kill -TERM 2>/dev/null || true
            log_info "✅ GPG processes killed."
        fi
        found_issues=true
    else
        log_info "No running GPG processes found."
    fi

    # 2. Clean Maven release artifacts
    log_info "--- Checking for Maven release artifacts ---"
    local backup_count props_count

    backup_count=$(find "${SHENYU_HOME}" -name "pom.xml.releaseBackup" 2>/dev/null | wc -l | tr -d ' ')
    props_count=$(find "${SHENYU_HOME}" -name "release.properties" 2>/dev/null | wc -l | tr -d ' ')

    if [[ "$backup_count" -gt 0 || "$props_count" -gt 0 ]]; then
        log_warn "Found Maven release artifacts:"
        [[ "$backup_count" -gt 0 ]] && log_warn "  ${backup_count} pom.xml.releaseBackup files"
        [[ "$props_count" -gt 0 ]] && log_warn "  ${props_count} release.properties files"

        if confirm "Remove these artifacts and run mvn release:clean?"; then
            find "${SHENYU_HOME}" -name "pom.xml.releaseBackup" -delete 2>/dev/null || true
            find "${SHENYU_HOME}" -name "release.properties" -delete 2>/dev/null || true
            mvn release:clean -q 2>/dev/null || true
            log_info "✅ Maven release artifacts cleaned."
        fi
        found_issues=true
    else
        log_info "No Maven release backup files found."
    fi

    # 3. Check pom.xml version state (may be stuck mid-release)
    log_info "--- Checking pom.xml version state ---"
    local current_version
    current_version=$(cd "$SHENYU_HOME" && mvn help:evaluate -Dexpression=project.version -q -DforceStdout 2>/dev/null || echo "unknown")
    log_info "Current project version: ${current_version}"

    if [[ "$current_version" != *"-SNAPSHOT" && "$current_version" != "unknown" ]]; then
        log_warn "Project version is '${current_version}' (not a SNAPSHOT)."
        log_warn "This may mean release:prepare modified the version but release:perform was not run."
        if confirm "Run mvn release:rollback to restore SNAPSHOT version?"; then
            (cd "$SHENYU_HOME" && mvn release:rollback -q 2>/dev/null) || {
                log_error "Rollback failed. You may need to manually reset pom.xml versions."
                log_error "  git checkout -- ."
            }
            log_info "✅ Rolled back to SNAPSHOT version."
        fi
        found_issues=true
    elif [[ "$current_version" == *"-SNAPSHOT" ]]; then
        log_info "Version looks normal (SNAPSHOT)."
    fi

    # 4. Check git state
    log_info "--- Checking git state ---"
    cd "$SHENYU_HOME"

    local git_status
    git_status=$(git status --porcelain)
    if [[ -n "$git_status" ]]; then
        log_warn "Uncommitted changes found:"
        echo "$git_status" | head -20
        if [[ $(echo "$git_status" | wc -l | tr -d ' ') -gt 20 ]]; then
            log_warn "... and $(($(echo "$git_status" | wc -l) - 20)) more files"
        fi
        if confirm "Discard all uncommitted changes? (git checkout -- .)"; then
            git checkout -- .
            # Also remove untracked files from release (pom.xml.releaseBackup etc.)
            git clean -fd -- "*.releaseBackup" "release.properties" 2>/dev/null || true
            log_info "✅ Uncommitted changes discarded."
        fi
        found_issues=true
    else
        log_info "Git working tree is clean."
    fi

    # 5. Check for release tag
    log_info "--- Checking for release tag ---"
    if git tag -l "v${RELEASE_VERSION}" | grep -q .; then
        log_warn "Local tag v${RELEASE_VERSION} exists."
        if confirm "Delete local tag v${RELEASE_VERSION}?"; then
            git tag -d "v${RELEASE_VERSION}"
            log_info "✅ Local tag deleted."
        fi
        found_issues=true
    fi

    if git ls-remote --tags origin "v${RELEASE_VERSION}" 2>/dev/null | grep -q .; then
        log_warn "Remote tag v${RELEASE_VERSION} exists on origin."
        if confirm "Delete remote tag v${RELEASE_VERSION}?"; then
            git push origin --delete tag "v${RELEASE_VERSION}"
            log_info "✅ Remote tag deleted."
        fi
        found_issues=true
    fi

    if [[ ! "$found_issues" == true ]]; then
        log_info "✅ No issues found. The workspace appears clean."
    fi

    echo ""
    log_info "Abort cleanup complete."
    log_info "If you still have issues, try:"
    log_info "  1. ./release.sh clean     - Full rollback with branch/tag deletion"
    log_info "  2. git checkout -- .      - Discard all uncommitted changes"
    log_info "  3. mvn release:rollback   - Rollback version changes"
    log_info "  4. mvn release:clean      - Clean Maven release artifacts"
}

# ========================= Usage =========================

usage() {
    cat <<EOF
Apache ShenYu Release Script - v${RELEASE_VERSION}

Usage: $(basename "$0") <step> [options]

Steps:
  1       Prerequisites check
  2       Maven release:prepare dry-run
  3       Maven release:prepare (actual - modifies pom.xml and creates tags)
  4       Maven release:perform (deploys to Apache Nexus staging)
  5       Publish to SVN dev repository
  6       Verify release artifacts
  7       Print voting email templates
  8       Final release (after vote passes)
  all     Run steps 1-6 sequentially
  clean   Rollback: delete branch, tags, and clean Maven release artifacts
  reset   Hard rollback to origin/master after a failed release:prepare
          (deletes local tag + release branch, resets master, removes
          release.properties / pom.xml.releaseBackup). Local only.
  abort   Guided cleanup after Ctrl+C or interrupted release

Options:
  -v, --version VERSION        Release version (default: ${RELEASE_VERSION})
  -n, --next-version VERSION   Next SNAPSHOT version (default: ${NEXT_VERSION})
  -u, --user USERNAME          Apache LDAP username (default: ${APACHE_USER})
  -k, --gpg-key KEY_ID         GPG key ID
  -p, --gpg-passphrase PASS    GPG passphrase
  -d, --home DIR               ShenYu source directory (default: ${SHENYU_HOME})

Environment variables:
  RELEASE_VERSION, NEXT_VERSION, APACHE_USER, GPG_KEY, GPG_PASSPHRASE, SHENYU_HOME

Examples:
  # Check prerequisites
  $(basename "$0") 1

  # Dry run with GPG passphrase
  $(basename "$0") 2 -p 'my-passphrase'

  # Full release (steps 1-6)
  $(basename "$0") all -p 'my-passphrase'

  # Print vote email templates
  $(basename "$0") 7

  # Final release after vote
  $(basename "$0") 8

  # Rollback
  $(basename "$0") clean

  # Hard reset to origin/master after a failed release:prepare
  $(basename "$0") reset

  # Guided cleanup after interruption
  $(basename "$0") abort
EOF
}

# ========================= Parse Arguments =========================

parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -v|--version)
                RELEASE_VERSION="$2"
                RELEASE_BRANCH="${RELEASE_VERSION}-release"
                GIT_TAG="v${RELEASE_VERSION}"
                shift 2
                ;;
            -n|--next-version)
                NEXT_VERSION="$2"
                shift 2
                ;;
            -u|--user)
                APACHE_USER="$2"
                shift 2
                ;;
            -k|--gpg-key)
                GPG_KEY="$2"
                shift 2
                ;;
            -p|--gpg-passphrase)
                GPG_PASSPHRASE="$2"
                shift 2
                ;;
            -d|--home)
                SHENYU_HOME="$2"
                shift 2
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
}

# ========================= Main =========================

main() {
    # Handle help flag even as first arg
    if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
        usage
        exit 0
    fi

    if [[ $# -lt 1 ]]; then
        usage
        exit 1
    fi

    local step="$1"
    shift
    parse_args "$@"

    # Export GPG passphrase for subprocess
    export GPG_PASSPHRASE

    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║         Apache ShenYu ${RELEASE_VERSION} Release Script              ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    log_info "Release version: ${RELEASE_VERSION}"
    log_info "Next version:    ${NEXT_VERSION}"
    log_info "Apache user:     ${APACHE_USER}"
    log_info "Source dir:      ${SHENYU_HOME}"
    log_info "GPG key:         $(detect_gpg_key)"
    echo ""

    case "$step" in
        1)  step_1_prerequisites ;;
        2)  step_2_dry_run ;;
        3)  step_3_prepare ;;
        4)  step_4_perform ;;
        5)  step_5_svn_dev ;;
        6)  step_6_verify ;;
        7)  step_7_vote_templates ;;
        8)  step_8_final_release ;;
        all)
            step_1_prerequisites
            step_2_dry_run
            step_3_prepare
            step_4_perform
            step_5_svn_dev
            step_6_verify
            echo ""
            log_info "✅ Steps 1-6 complete! Next steps:"
            log_info "  1. Close the Nexus staging repository at https://repository.apache.org/#stagingRepositories"
            log_info "  2. Run './release.sh 7' to print voting email templates"
            log_info "  3. Send vote email to dev@shenyu.apache.org"
            log_info "  4. After vote passes, run './release.sh 8' to finalize the release"
            ;;
        clean)
            step_clean ;;
        reset)
            step_reset ;;
        abort)
            step_abort ;;
        *)
            echo "Unknown step: $step"
            usage
            exit 1
            ;;
    esac
}

main "$@"
```
