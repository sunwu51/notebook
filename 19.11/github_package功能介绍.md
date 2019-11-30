# github package feature介绍
package比actions功能出的还要早，主要提供了npm gem mvn gradle nuget docker等仓库的功能。
# 用处
个人感觉用户不大，对国内用户来讲基本比较鸡肋。为什么说鸡肋呢？因为相比官方仓库，github提供的仓库本身就比较小众。这样就直接导致国内没有加速站点，国内下载包很慢。

不过github集中将多种语言仓库汇总了，并且能伴随项目显示在上面，还能显示在个人的package中。比较方便的从用户维度显示有哪些仓库。
# 使用
先创建token默认的用户名密码是不能用rep功能的。[https://github.com/settings/tokens](https://github.com/settings/tokens),进入Personal access tokens，添加token,只勾选rep项和三个packages项就行。

然后就可以创建包了。