package main

import (
	"fmt"
)
func f1() *int {
	u1:= 1
	u2:= 2
	u3:= 3
	
	println(&u1, &u2, &u3)
	return &u2
}
func main(){
  u:=f1()
	u2:=f1()
	fmt.Printf("%p, %p", u, u2)

}

func main2() {
  u0:= &User{age:0, name:"0"}
  u1:= User{age:1, name:"1"}
  u2 := u1
  u2.age = 3

  fmt.Printf("u0.age %d u0 %p\n", u0.age, u0)
  fmt.Printf("u1.age %d u1 %p\n", u1.age, &u1)
	u3 := new(User)
  fmt.Printf("u3.age %d u3 %p\n", u3.age, &u3)
	var i1 int32 =1
	var i2 *int32 = new(int32)
	fmt.Printf("i1 %p, i2 %p\n", &i1, i2)

	i:=1
	fmt.Printf("i %p\n", &i)

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