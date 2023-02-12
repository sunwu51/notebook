# 1 安装golang
到`https://go.dev`下载和安装go，直到可以在任意路径下运行
```bash
$ go version
$ go env
```
`GOROOT`和`GOPATH`是俩重要环境变量，ROOT是go的安装目录，PATH则是包的默认安装目录。安装完之后默认会有设置两者，不需要个人去修改。
# 2 开启国内镜像代理
```bash
$ go env -w GOPROXY=https://goproxy.cn,direct
```
# 3 创建新的项目
```bash
$ mkdir hello
$ cd hello
$ go mod init github.com/sunwu51/hello #包名自己起
```
创建`app.go`，这里使用外部依赖`fiber`创建一个web server
```go
package main

import (
	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New()

	app.Get("/", func(ctx *fiber.Ctx) error {
		return ctx.SendString("hello fiber")
	})

	app.Listen(":3000")
}
```
加载依赖并运行
```bash
$ go mod tidy
$ go run .
```
# 4 vscode
安装golang插件，会提示安装`gopls` `goplay`等依赖，点击安装即可。安装完成后，需要对于一个工作空间的根目录下有`go.mod`文件，如果go项目在当前vscode项目的子目录下，可能会有一些报错，需要打开到go project为vscode工作目录。

然后就可以写go代码了，并且可以通过vscode的debug功能进行单步调试。
