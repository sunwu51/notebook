# 自己记录的一些笔记

生成的静态网页: [https://www.xiaogenban1993.com](https://www.xiaogenban1993.com)



[sourcegraph](https://sourcegraph.com/search?q=repo:%5Egithub%5C.com/sunwu51/notebook%24+&patternType=literal)


## 在线写文章（可选功能）

站点内置了一个在线编辑器：导航栏点"✍️ 写"，用 GitHub 登录后即可左边写 Markdown/MDX、右边实时预览（与文章页使用同一套渲染流程），点"发布"直接提交到仓库，Vercel 随后自动部署。草稿会自动保存在浏览器 localStorage 中。

**不配置下面的环境变量时，这个功能不可用，但不影响博客的正常浏览和构建。**

fork 之后按下面的步骤配置：

### 1. 创建 GitHub App

GitHub → Settings → Developer settings → GitHub Apps → New GitHub App：

| 设置项 | 值 |
|---|---|
| Homepage URL | 你的站点地址，如 `https://your-domain.com` |
| Redirect URI（Callback URL） | `https://your-domain.com/api/auth/callback`；本地调试再加一条 `http://localhost:3000/api/auth/callback` |
| Expire user authorization tokens | 保持勾选（token 8 小时过期） |
| Webhook → Active | **取消勾选** |
| Repository permissions → Contents | **Read and write** |
| Where can this GitHub App be installed | Only on this account |

创建后：

1. 在 **Credentials** 页点 **Generate a new client secret**（只显示一次，请立即保存）。
2. 在 **Install App** 页把它安装到你 fork 的仓库（Only select repositories）。**不做这一步，登录可以成功，但发布会失败。**
3. 记下 **Client ID**。

> 不用 GitHub App 也可以用 OAuth App：配置方法类似，但需额外设置 `GH_OAUTH_SCOPE=public_repo`。注意 OAuth App 的 token 能写你所有的公开仓库，权限比 GitHub App 大。

### 2. 配置环境变量

本地开发：在项目根目录创建 `.env.local`（已被 `.gitignore` 忽略）；线上：在 Vercel 项目 Settings → Environment Variables 中添加，**修改后需要重新部署才生效**。

```bash
# GitHub App 的凭据
GH_CLIENT_ID=
GH_CLIENT_SECRET=
# 用于加密登录 cookie 的随机字符串（至少 16 位），如：openssl rand -hex 32
SESSION_SECRET=
# 允许写文章的 GitHub 数字 id（不是用户名）：
#   curl https://api.github.com/users/<你的用户名>   取返回里的 "id"
ALLOWED_GITHUB_ID=

# 以下为可选项
# 要提交的仓库与分支，默认 sunwu51/notebook 和 master，fork 后务必改成你自己的仓库
GH_REPO=your-name/notebook
GH_BRANCH=master
# 仅 OAuth App 需要
# GH_OAUTH_SCOPE=public_repo
```

> fork 之后一定要设置 `GH_REPO`，否则会尝试往原作者的仓库提交（当然没有权限，会失败）。

### 3. 使用

1. `npm install && npm run dev`，打开 `http://localhost:3000`，点导航栏"✍️ 写"。
2. 首次会跳转 GitHub 授权；只有 `ALLOWED_GITHUB_ID` 对应的账号能进入。
3. 填写目录（`YY.MM`，如 `26.12`，不存在会自动创建）和文件名，写完点"发布"。发布前会先编译一遍，MDX 有语法错误会被拦下，避免把站点构建搞挂。

### 注意事项

- 发布会直接提交到 `GH_BRANCH`，每次发布触发一次 Vercel 构建；同名文件会被**覆盖**，没有冲突提示。
- 文章 front matter 请带上 `date`，首页排序依赖它。
- 登录有效期 8 小时，过期后预览会提示重新登录，本地草稿不会丢。
- 回调地址依赖访问域名：用 `www` 和不带 `www` 的域名访问是两个不同的回调地址，都要用的话需在 App 的 Redirect URI 里都加上。
- 预览/发布接口设置了 `maxDuration = 30`，Vercel Hobby 套餐的函数时长上限更低，超大文章编译可能超时。
