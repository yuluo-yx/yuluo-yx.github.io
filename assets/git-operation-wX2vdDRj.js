const n=`---
slug: opensource-git-operation-record
title: 开源 Git 操作
date: 2026-05-21 22:25:06
authors: yuluo
tags: [Github. Git]
keywords: [Github, Git]
---

<!-- truncate -->

## 背景

在参与开源或者工作的时候，经常需要提交、拉取代码。大多数公司的代码都托管在 Github 或者自建的 Gitee 上，使用 git pull 和 push 代码。

Git 操作众多，掌握常用命令是参与开源协作和日常开发的基础。

## Git 字命令解释

Git 使用比较多的子命令：

| 命令 | 一句话 | 最常用写法 |
| --- | --- | --- |
| \`git fetch\` | 下载远程更新但不合并 | \`git fetch --all --prune\` |
| \`git pull\` | 拉取远程更新并合并到本地 | \`git pull --rebase --autostash\` |
| \`git push\` | 推送本地提交到远程 | \`git push -u origin <branch>\` |
| \`git commit\` | 创建提交 | \`git commit -m "feat: xxx"\` |
| \`git branch\` | 管理分支 | \`git branch -a\` / \`git branch -D <name>\` |
| \`git checkout\` | 切换分支 / 恢复文件 | \`git checkout -b feat/xxx\` |
| \`git merge\` | 合并分支 | \`git merge --no-ff <branch>\` |
| \`git rebase\` | 变基，保持线性历史 | \`git rebase -i HEAD~3\` |
| \`git stash\` | 暂存工作区修改 | \`git stash push -u -m "desc"\` |
| \`git reset\` | 回退提交 / 取消暂存 | \`git reset --soft HEAD~1\` |
| \`git revert\` | 安全撤销线上提交 | \`git revert <commit-hash>\` |
| \`git cherry-pick\` | 挑选指定提交合入 | \`git cherry-pick <hash>\` |
| \`git tag\` | 打版本标签 | \`git tag -a v1.0.0 -m "Release"\` |
| \`git diff\` | 查看差异 | \`git diff --staged\` |
| \`git remote\` | 管理远程仓库连接 | \`git remote add upstream <url>\` |

## 关键区别

以下几个是最容易混淆的。

### 1. \`git pull\`（merge） vs \`git pull --rebase\`

两者都是 \`git fetch\` + 合并远端的组合，区别在于**合并方式**：

| | pull（默认 = merge） | pull --rebase |
| --- | --- | --- |
| 结果历史 | 产生 merge commit，分叉可见 | 线性历史，本地提交被 replay 到远端之后 |
| 冲突解决 | 一次性解决 | 逐个提交解决 |
| 是否改写 hash | 否 | 是（本地提交 hash 会变） |
| 适合 | 公共分支合入 | 个人分支同步 main |

日常同步使用 \`git pull --rebase\`，合并 feature 到公共分支使用 \`git merge --no-ff\`。

### 2. \`git stash\` / \`git stash push\` / \`git stash save\`

\`git stash save\` 是 Git 2.13 之前的旧语法，已废弃，**不支持暂存指定文件**。

\`\`\`bash
# 旧语法（不推荐）
git stash save "desc"

# 新语法（推荐）
git stash push -m "desc"           # 暂存所有修改
git stash push -m "desc" -- file   # 只暂存指定文件（save 做不到）
\`\`\`

\`git stash\` 不带子命令时等价于 \`git stash push\`，统一使用 \`git stash push -m\`。

### 3. \`git revert\` vs \`git reset\`

| | revert | reset |
| --- | --- | --- |
| 原理 | 新建一个反向提交，抵消目标改动 | 移动 HEAD 指针，丢弃提交 |
| 历史 | 保留完整记录 | 历史被改写 |
| 对远程的影响 | 直接 push 即可 | 需要 force push，影响协作者 |
| 使用场景 | **已 push 的提交（线上）** | **仅本地未 push 的提交** |

线上回退始终使用 \`revert\`；\`reset --hard\` + force push 仅适用于本地未 push 的提交。

### 4. \`git merge\` vs \`git rebase\` vs \`git cherry-pick\`

三者都用于将代码从一个分支转移到另一个分支，但方式不同：

- **merge**：合并整个分支的所有提交，保留分叉历史
- **rebase**：把当前分支的提交"搬"到目标分支后面，历史变线性
- **cherry-pick**：只挑某一个或几个提交，不合并整个分支

## Github 场景

按工作流类型分组，按需查阅对应场景。

### 提交与历史整理

#### 编辑 commit message

**最近一次（未 push）：**

\`\`\`bash
git commit --amend -m "new message"
\`\`\`

**更早的历史提交：**

\`\`\`bash
git rebase -i HEAD~3   # 回溯最近 3 次
\`\`\`

将目标提交前的 \`pick\` 改为 \`reword\`，保存后逐个编辑。rebase 交互命令速记：

| 命令 | 效果 |
| --- | --- |
| \`pick\` | 保留不变 |
| \`reword\` | 只改 message |
| \`edit\` | 暂停，改内容 + message |
| \`squash\` | 合并到上一个提交，保留 message |
| \`fixup\` | 合并到上一个提交，丢弃 message |

> 已 push 的提交 amend/rebase 后需 \`git push --force-with-lease\`。公共分支严禁 force push。

#### 压缩多个提交

PR 前把零散的 WIP 提交压缩，三种方式：

\`\`\`bash
# 方式一：交互式 rebase（最常用）
git rebase -i HEAD~4    # 除第一个外全改为 squash

# 方式二：soft reset 后重提
git reset --soft HEAD~3
git commit -m "feat: complete feature X"

# 方式三：merge 时压缩
git merge --squash feat/feature-branch
git commit -m "feat: add feature X"
\`\`\`

| 方式 | 适合 | 改写历史 |
| --- | --- | --- |
| \`rebase -i\` | 本地未 push 的提交 | 是 |
| \`reset --soft\` | 批量重做最近的提交 | 是 |
| \`merge --squash\` | 整个 feature 压缩合入 | 否 |

#### 空 commit 触发 CI

\`\`\`bash
git commit --allow-empty -m "chore: trigger CI"
\`\`\`

#### 将文件变动追加到上一个 commit

提交后发现遗漏了改动，直接追加到上一次提交而不新建 commit：

\`\`\`bash
# 把遗漏的文件 add 后追加到上次提交，不改 message
git add <file>
git commit --amend --no-edit

# 如果要同时修改 message
git commit --amend -m "new message"
\`\`\`

原理：\`--amend\` 不创建新 commit，而是用当前暂存区的内容替换上一次 commit。\`--no-edit\` 表示不改动原来的 commit message。

> 已 push 的 commit 不要 amend，否则需要 force push 覆盖远程。

### 代码同步

#### 拉取时本地有未提交的修改

三种处理方式，按推荐度排序：

\`\`\`bash
# 1. 最佳：一步到位（Git 2.14+）
git pull --rebase --autostash

# 2. 手动控制
git stash push -u -m "before pull"
git pull --rebase
git stash pop

# 3. 不冲突时直接 pull
git pull --rebase
# 失败再 stash
\`\`\`

\`--autostash\` pop 时如果冲突，stash 不会被自动删除，需要 \`git stash drop\` 手动清理。

#### Fork 同步上游仓库

\`\`\`bash
# 首次：添加上游
git remote add upstream <original-repo-url>

# 每次同步
git fetch upstream
git checkout main
git merge upstream/main
git push origin main

# 或一条命令
git fetch upstream && git checkout main && git merge upstream/main && git push origin main
\`\`\`

### 冲突与回退

#### merge 解决冲突

标准流程：

\`\`\`bash
git merge feat/feature-branch
# CONFLICT → 手动编辑冲突文件，删除 <<< === >>> 标记
git add <file>
git commit -m "merge: resolve conflict"
\`\`\`

冲突标记的含义：

\`\`\`
<<<<<<< HEAD      # 当前分支的代码
=======           # 分界线
>>>>>>> branch    # 合并进来的代码
\`\`\`

相关操作：

\`\`\`bash
git merge --abort                # 放弃合并，回到合并前
git checkout --ours <file>       # 完全采用当前分支版本
git checkout --theirs <file>     # 完全采用合并分支版本
git mergetool                    # 使用可视化工具（VS Code 等）
\`\`\`

#### 回退线上 commit

已 push 到远程的提交，用 \`revert\` 而非 \`reset\`：

\`\`\`bash
git revert <commit-hash>              # 回退单个
git revert <newer> <older>            # 回退多个（由新到旧）
git revert --no-edit <commit-hash>    # 不回退时直接提交，跳过编辑器
\`\`\`

### 敏感信息处理

#### 从历史中删除文件

**仅最近一次提交：**

\`\`\`bash
git rm --cached <file>
git commit --amend --no-edit
\`\`\`

**从整个历史中抹除**（推荐 \`git filter-repo\`）：

\`\`\`bash
# 安装: pip install git-filter-repo
git filter-repo --path <file> --invert-paths --force
\`\`\`

> 会改写整个仓库历史，所有协作者需重新 clone 或 \`git pull --rebase\`。

#### 从历史中删除密钥

比删除文件更紧急——还要**轮换密钥**。已经暴露的密钥，删历史记录只是"不再继续泄露"，无法撤回"已经被获取"。

**方案一：只改那一次 commit（推荐，影响最小）**

密钥只在某一次 commit 中引入，且该 commit 之后没有基于它的大量分支时，直接在 rebase 中定点修改：

\`\`\`bash
# 找到密钥是在哪个 commit 引入的
git log --oneline -S "secret" -- <file>

# 从那个 commit 开始交互式 rebase
git rebase -i <target-commit>~1
# 将该 commit 的 pick 改为 edit → 保存退出
# Git 会停在该 commit，此时编辑文件删除密钥
git add <file>
git commit --amend --no-edit
git rebase --continue
# 最后强制推送
git push --force-with-lease
\`\`\`

如果密钥就在最近一次 commit，更简单：

\`\`\`bash
# 编辑文件删除密钥内容
git add <file>
git commit --amend --no-edit
git push --force-with-lease
\`\`\`

**方案二：整个历史批量替换（filter-repo / BFG）**

当密钥散落在多个历史 commit 中时才需要用到。这两个工具都是**全量重写历史**，所有 commit hash 都会变。

\`\`\`bash
# 使用 filter-repo 替换密钥文本
git filter-repo --replace-text <(echo 'secret==>***REMOVED***') --force

# 或使用 BFG（Java 环境）
bfg --replace-text passwords.txt my-repo.git
\`\`\`

执行 \`filter-repo\` 后，它已经帮你完成了提交——工具会遍历所有 commit 并创建新的历史，远程分支引用会被自动移除。之后需要强制推送：

\`\`\`bash
# filter-repo 后，重新关联远程仓库并推送
git remote add origin <url>
git push --force --all
git push --force --tags
\`\`\`

同理 BFG 执行后：

\`\`\`bash
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force --all
\`\`\`

> 密钥只在一个 commit 中时优先使用方案一，仅在散落多处时才使用方案二。

### 开源协作

#### cherry-pick：只摘取特定提交

从其他分支或 PR 中挑选特定修复合入当前分支，保留原作者信息：

\`\`\`bash
git cherry-pick <commit-hash>                  # 单个
git cherry-pick <hash-A> <hash-B>              # 多个不连续
git cherry-pick <older-hash>..<newer-hash>     # 一个范围
git cherry-pick --no-commit <hash>             # 挑过来但不提交
\`\`\`

对比记忆：

- **merge** = 合并整个分支
- **cherry-pick** = 只挑几个提交
`;export{n as default};
