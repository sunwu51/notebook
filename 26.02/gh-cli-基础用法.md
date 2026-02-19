---
title: GitHub CLI Basics
tags:
  - github
  - gh
  - cli
  - git
  - pull-request
  - issue
---

# GitHub CLI（`gh`）基础用法速查

`gh` 是 GitHub 官方命令行工具，用来在终端里完成很多原本要在网页上做的事（如创建 PR、处理 Issue、查看 Actions、发 Release）。

> 一句话理解：`git` 负责“本地版本管理 + 代码同步”，`gh` 负责“GitHub 平台操作”。两者互补，不冲突。

---

## 1. `gh` 和 `git` 的定位区别

### `git` 擅长

- 本地仓库管理：`init`、`add`、`commit`、`branch`、`merge`
- 远程同步：`fetch`、`pull`、`push`
- 历史操作：`log`、`rebase`、`cherry-pick`

### `gh` 擅长

- GitHub 账号与仓库操作：登录、创建仓库、Fork、Clone
- Pull Request 全流程：创建、查看、评论、合并
- Issue 管理：创建、分配、标记、关闭
- CI/CD 与发布：查看 Actions、创建 Release

---

## 2. 安装与登录

### 安装（示例）

```bash
# macOS
brew install gh

# Windows（scoop）
scoop install gh

# Windows（winget）
winget install --id GitHub.cli
```

### 首次登录

```bash
gh auth login
```

常见流程：

1. 选择 `GitHub.com`（或企业版）
2. 选择协议（HTTPS/SSH）
3. 通过浏览器完成授权

检查登录状态：

```bash
gh auth status
```

退出登录：

```bash
gh auth logout
```

---

## 3. 仓库相关基础命令

### 克隆仓库

```bash
gh repo clone owner/repo
```

### 创建新仓库

```bash
gh repo create
```

可选参数示例：

```bash
gh repo create my-project --public --clone
```

### 查看仓库信息

```bash
gh repo view
gh repo view owner/repo --web
```

### Fork 仓库

```bash
gh repo fork owner/repo --clone
```

---

## 4. Pull Request（PR）常用流程

### 创建 PR

```bash
gh pr create
```

常用参数：

```bash
gh pr create \
  --base main \
  --head feature/login \
  --title "feat: add login page" \
  --body "Implement login UI and API integration"
```

### 查看 PR

```bash
gh pr list
gh pr view 123
gh pr view 123 --web
```

### 审查与合并 PR

```bash
gh pr review 123 --approve
gh pr merge 123 --squash --delete-branch
```

---

## 5. Issue 常用流程

### 创建 Issue

```bash
gh issue create
```

### 查看与筛选

```bash
gh issue list
gh issue list --assignee @me
gh issue view 456
```

### 编辑与关闭

```bash
gh issue edit 456 --add-label bug --assignee @me
gh issue close 456
```

---

## 6. Actions / Release 常用命令

### 查看工作流运行

```bash
gh run list
gh run view <run-id>
gh run watch
```

### 管理 Release

```bash
gh release create v1.0.0 --title "v1.0.0" --notes "First stable release"
gh release list
gh release view v1.0.0
```

---

## 7. `gh` 相比 `git` 的独特之处（重点）

1. **直接操作 GitHub 平台对象**  
   `git` 不提供 PR/Issue/Actions 的原生命令，而 `gh` 可以一条命令完成。

2. **减少网页来回切换**  
   例如从创建分支、提交、推送到发起 PR，几乎都可在终端完成。

3. **交互式引导更友好**  
   `gh pr create`、`gh auth login` 等命令会引导你填写关键字段，适合团队规范化流程。

4. **与 CI/CD 结合紧密**  
   可直接查看 Actions 结果、跟踪运行状态，适合快速排查构建失败。

5. **可脚本化自动化**  
   `gh` 命令能嵌入 Shell 脚本，用于批量仓库治理、自动发布、日报收集等。

---

## 8. `git` 与 `gh` 命令对照（常见场景）

| 场景 | `git` | `gh` |
|---|---|---|
| 克隆仓库 | `git clone <url>` | `gh repo clone owner/repo` |
| 创建远程仓库 | 无（需网页/API） | `gh repo create` |
| 提交代码 | `git add/commit/push` | 仍以 `git` 为主 |
| 发起 Pull Request | 无原生命令 | `gh pr create` |
| 查看/合并 PR | 无原生命令 | `gh pr view` / `gh pr merge` |
| 管理 Issue | 无原生命令 | `gh issue *` |
| 查看 GitHub Actions | 无原生命令 | `gh run *` |

---

## 9. 推荐的日常工作流（实用）

```bash
# 1) 拉代码
gh repo clone owner/repo
cd repo

# 2) 开发并提交（git）
git checkout -b feature/awesome
git add .
git commit -m "feat: awesome change"
git push -u origin feature/awesome

# 3) 发起 PR（gh）
gh pr create --base main --head feature/awesome --fill

# 4) 跟踪 CI
gh run watch

# 5) 合并 PR
gh pr merge --squash --delete-branch
```

---

## 10. 总结

- `git`：管理代码版本本身（本地与远程同步）
- `gh`：管理 GitHub 协作流程（PR/Issue/Actions/Release）
- 最佳实践：**本地开发用 `git`，平台协作用 `gh`**

这套组合可以明显减少网页操作，提高团队协作效率。
