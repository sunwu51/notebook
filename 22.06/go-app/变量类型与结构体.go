package main

import (
	"fmt"
)



func main() {

	// 变量 完整语法 var $name $type
	var a int // int=int计算机位数一般是int64

	// 最常用的3种赋初值方式
	var b int32 = 1
	c := 2
	var d = 3

	// 常量 就是把变量的var改为const
	const e = 4
	fmt.Println(a, b, c, d, e) //打印0 1 2 3 4

	// 变量类型主要有5种，字符串、数字、布尔、数组、map。
	// string [u]int[8/16/32/64] float32/64 bool []type 
	fmt.Printf("a = %v, and type of a is %T\n", a, a)

	// 结构体的声明
 	f1, f2 := func1()
	fmt.Println(f1, f2)

	func2(&f1)
	fmt.Println(f1, f2)


	// time.Sleep(time.Duration(100) * time.Second)
	// const d = 50
	// var b = 20
	// c := 30 // 最常见的自动类型推断的赋值方式
	// c = 40 // 赋值后修改值，去掉冒号
	// e:= User {age:120, name:"123"} // 结构体赋值，默认在栈上
	// e2:= &User {age:120, name:"123"} // 取地址，如果逃逸则堆上
	// .age, e2.age)

}

// 结构体分配到栈还是堆上，取决于是否逃逸
func func1() (User, *User) {
	var f1 = User{age: 22, name: "frank"}
	var f2 = User{age: 22, name: "frank"}
	var num = 10
	fmt.Println(&num)
	return f1, &f2
}

func  func2(u *User) {
	u.age++
}

// 结构体
type User struct{
	age int32
	name string 
}