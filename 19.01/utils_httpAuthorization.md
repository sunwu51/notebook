# http authorization
在web应用中用户的身份是如何进行认证的。
## 1 session
早期的应用主要是通过session的方式进行认证，session是指存在服务端的一组数据，而cookie是存在浏览器的一组数据，他们的本质都是键值对。

session可以通过cookie来存储sessionId来进行交互，例如用户登录成功后，服务端存储一个随机生成的`sessionId-用户信息`的键值对。然后将这个sessionId返回给浏览器，浏览器在cookie中只存储这个sessionId。然后之后的交互中因为每次http都携带cookie所以服务端每次都拿到这个id并在已经存过的session中查找是否有这条数据，然后身份就认证了。

![image](img/auth1.jpg)
## 2 authorization
cookie不专门针对身份认证，服务端存储session需要占用内存。authorization则是专门针对身份认证的，且服务端不用专门存什么东西。authorization的形式为：
```
Authorization: <type> <content>  
```
这里只介绍最常见的两种类型basic和bearer。

### 2.1 basic
basic类型的content是用户名+密码进行base64编码后的字符串。使用rest请求的工具时可以注意到这点：  
![image](img/auth1.gif)  
服务端可以用base64解码然后拿到用户名密码，然后就可以检验用户身份了，因为每个请求都携带这个authorization，所以就相当于所有的请求中都携带着用户名和密码来和服务端进行交互。

![image](img/auth2.jpg)

优点：简单实用。缺点：安全性差，直接把账密放在每次请求中，一定不要用http协议这样会被抓包解析（base64是编码不是加密），而要用https。服务端压力较大，每次请求服务端要拿出账密，然后查询数据库，给数据库压力较大（之前的session是存到内存不访问数据库）。  
### 2.2 bearer
bearer类型的content一般是token，这种交互类型一般是登录后，服务端返回一个用户信息加密后的字符串(即token)，然后浏览器之后的请求一直把这个token放在authorization中。

服务端能拿到这个token然后用配套的解密方式解析出用户的信息。

![image](img/auth3.jpg)  

优点：不用额外的像session那样的存储，也不用每次都查询数据库。缺点：加密的信息一般都比较长，每次携带导致数据传输量较大。
## 3 jwt
jwt(json web token)是一种bearer的形式。我在之前的项目中用过java版本的。

jwt的构成主要是header+payload+sign三部分，其中header是对算法和token类型的描述，例如`{ "alg": "HS256", "typ": "JWT"}`。当然是要base64编码一下。

payload中存的是claim(可以理解为k-v)，有些k是jwt预设的例如iss（签发者）,exp（过期时间戳）, sub（面向的用户）, aud（接收方）, iat（签发时间）当然也可以不用。另外一些k就是自己定义的了。这些k-v组成一个json字符串，然后base64编码就是payload了。

sign即签名，`sign=hash(header+'.'+payload,secret)`这里的hash算法要使用header中指定好的。secret则是只有服务端知道的。

官网这张图很明显的表明了token的构成  
![image](img/auth4.jpg)

到这里我们知道了原来jwt并没有加密的过程，而只是把用户的信息进行了原文和签名的传输。服务端需要验证签名是否正确，然后就可以决定是否认可payload中的内容了。
## 3.1 golang版本的jwt
下载相关包如下
```
go get github.com/dgrijalva/jwt-go
```
封装一个加解密的包
```go
package me

import (
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"time"
)

var hmacSampleSecret []byte= []byte("123")

func Encode(m map[string]string) (string,error){
	claims:=jwt.MapClaims{
		"exp": time.Now().Add(10*time.Second).Unix(),
	}
	for k,v:=range m{
		claims[k]=v
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign and get the complete encoded token as a string using the secret
	tokenString, err := token.SignedString(hmacSampleSecret)

	return tokenString,err
}
func Decode(tokenString string)(*jwt.Token,error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Don't forget to validate the alg is what you expect:
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}

		// hmacSampleSecret is a []byte containing your secret, e.g. []byte("my_secret_key")
		return hmacSampleSecret, nil
	})
	return token,err
}
```
然后在main函数中调用测试
```go
package main

import (
	"fmt"
	"me"
	"time"
)
func catchErr(err error){
	if err!=nil{
		fmt.Println(err)
	}
}
func main(){
	m:=make(map[string]string)
	m["foo"]="bar"
	tokenString,err:=me.Encode(m)
	catchErr(err)
	fmt.Println(tokenString)

	time.Sleep(11*time.Second)
	token,err2:=me.Decode(tokenString)
	catchErr(err2)
	//token.Header
	fmt.Println(token.Header)
	fmt.Println(token.Claims)
	fmt.Println(token.Valid)

}

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1NDY3NjMzMTIsImZvbyI6ImJhciJ9.mBv3clAc_Nnw-VhbOMvMQ-qy7okVavXfRAKmWqxJy_w
//Token is expired
//map[alg:HS256 typ:JWT]
//map[exp:1.546763312e+09 foo:bar]
//false
```
注意Encode函数中添加了过期时间是10s后，然后main函数中在Decode之前sleep了11s，导致token过期，虽然能解析出里面的内容，但是验证返回的是false。