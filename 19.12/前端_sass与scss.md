# sass
sass和scss区别是啥？scss是sass的一种语法，原来的sass语法是用空格隔开的，不兼容css。这样不太好。所以sass3之后引入了scss规范，完全兼容css语法。
# 基本用法
```scss
// 1 $表示变量，后面可以直接使用变量名。变量类型可以是数字，字符串，list，maps（后面俩不讲自己看文档）
$ppp:10px;
p{
    font-size: $ppp;
}
// 2 {}嵌套表示多级选择器
div{
    p{
        font-size: 10px;
    }
}
// 3 &表示父选择器，一般是:hover这种场景下或者要获取父选择器字符串使用
div{
    &:hover{
        color:red;
    }
    // #{&}获取div这个字符串
    .#{&}_ok{
        color:blue
    }
}
```
# 指令
```scss
// 1 import引入foo.scss文件，该语句可以嵌套在其他选择器内部
@import "foo"

// 2 extend样式继承
.a{
  color:red;
}
.b{
  @extend .a;
  font-size:10px;
}

// 3 mixin混合，混合和继承不一样，混合是定义一段样式之后可以直接搬过来用
@mixin c{
  color:red;
  font-size: 10px;
}
.d{
  @include c; //这里会把c原封不动挪到这里来。注！！！c不是个class，也不会被编译成class
  color:green;
}
//mixin还可以传入参数
@mixin c($c){
  color:$c;
  font-size: 10px;
}
.d{
  @include c(red); 
  color:green;
}

// 4 函数指令
@function get-width($n) {
  @return "#{100/$n}%" ;
}
```

参考gist： https://gist.github.com/sunwu51/09d8e4cd044f4db8edeafde410c4a345