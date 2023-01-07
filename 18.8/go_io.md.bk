# IO
## 1 文件IO
读写文件，如果是简单的读写，可以使用封好的`io/ioutil`包的WriteFile和ReadFile方法，读写的参数都是`[]byte`的内容。这里和`string`格式的互转就是强制转换。
```go
package main

import (
	"fmt"
	"io/ioutil"
)
func check(e error) {
	if e != nil {
		panic(e)
	}
}
func main() {
	d1 := []byte("hello\ngo\n")
	err := ioutil.WriteFile("test.log", d1, 0644)
	check(err)
	b, err := ioutil.ReadFile("test.log")
	if err != nil {
		fmt.Print(err)
	}
	str := string(b)
	fmt.Println(str)
}
```

## 2 数据库IO(mysql为例)
操作数据库这里使用`gorm`框架进行快速操作
```go
package main

import (
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"github.com/jinzhu/gorm"
)
func checkErr(e error) {
	if e != nil {
		panic(e)
	}
}
//*******************声明模型和表名 注意自增和主键的注解
type Project struct{
	Id   int `gorm:"primary_key;AUTO_INCREMENT"`
	Ak_project_id int
	Title string
}
//默认表名为projects
func (Project) TableName() string{
	return "project"
}
//******************增删改查操作
func main() {
	db, err := gorm.Open("mysql", "root:@tcp(127.0.0.1:3306)/test?charset=utf8")
	checkErr(err)
	
	//增  id既然为自增这里写0即可
	db.Save(Project{0,111,"save"})
	projects:=make([]Project,10)
	//删
	db.Where("title like '%save%'").Delete(Project{})

	//改
	db.Model(&Project{}).Where("id = ?",1).Update("title","update title")

	//查一个
	p:=Project{}
	db.Where("id=?",1).Find(&p)
	fmt.Println(p)
	
	//查所有
	db.Find(&projects)
	fmt.Println(projects)
	defer db.Close()
}
```
## 3 网络IO
简单的TCP服务 [参考](https://github.com/astaxie/build-web-application-with-golang/blob/master/zh/08.1.md) 

简单的WEB服务 [参考](https://github.com/astaxie/build-web-application-with-golang/blob/master/zh/03.2.md)

gin框架下的WEB服务 [参考](http://microfrank.top/go/)

