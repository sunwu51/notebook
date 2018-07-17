# 脚本语言漫谈
在很多面试要求中都要求会至少一种常用的脚本语言，那么脚本语言在程序界的作用和定位是什么样子的呢？

# shell和python
我们先来看看最常见得两个脚本语言：shell和python。也是很多职位要求要会的脚本。

shell脚本不同于其他语言脚本，他不需要安装环境，在linux或者mac下可以直接运行，他就是将终端的指令，都记录到一个文件中，按顺序执行他们。shell脚本可以读取和设置系统环境变量，并且可以使用`$PATH`下的应用指令。因为以上特性，所以在很多特定场景下shell是最好的甚至是唯一的选择，比如Dockerfile中RUN的指令只能用shell。一般shell脚本来进行文件创建修改删除等操作，很少用来写相对复杂的业务。

python脚本功能更为丰富了，在功能稍微复杂的时候，python是比shell更好的一个选择。因为shell中的数据模型、封装好的方法都较少，所以真正处理东西的时候就不方便了。比如实现一个文件的wordcount统计：
```python
res={}
for sentence in open('a.js').read().split():
    for word in sentence.split():
        if  word in res.keys():
            res[word]=res[word]+1
        else:
            res[word]=0
print res
```
python语法相对简洁，不过有些全局函数如open len map filter等需要在多写中记住，三目运算写法复杂也是槽点，另外没有++这种写法。
# JavaScript和PHP
js、php外加perl是使用度第二阶梯的脚本了，不过我不会perl这里就先不提他。js很多人觉得只试用于网页或者说浏览器，不能成大气候。php很多人印象中就是写网页的，嵌入到html中的<?php ?>标签。

这些看法都是片面的，nodejs兴起以来，一直流行着一个定律：所有可以用 JavaScript 编写的程序，最终都会出现 JavaScript 的版本。毫不夸张的讲js可以胜任python脚本实现的任何功能。我个人就一直在用js写脚本，这大大提高我的效率，而且js的书写中总有很多惊喜。比如上面的wordcout的例子：
```javascript
var fs = require('fs')
var res={}
fs.readFileSync('a.js').toString().split("\n").forEach(it=>{
    it.split(' ').forEach(i=>{
        res[i]===undefined?res[i]=0:res[i]++;
    })
})
console.log(res)
```
js的方法都是对象点出来的，用起来比较舒服。而且闭包使用非常方便，完美转换json格式。缺点就是nodejs并不是各大操作系统自带的环境，需要自行安装。

php也可以用来写各种场景的脚本，只是php web相关的库会比较多，很多人都是拿他写web去了，例如上面wordcount的php版本如下
```php
<?php
$res=[];
foreach(explode("\n",file_get_contents('a.js')) as $sentence){
    foreach(explode(" ",$sentence) as $word){
        $res[$word]++;
    }
}
var_dump($res);
```

# groovy和lua
groovy致力于构建dsl，是基于jvm平台的，需要的环境较为复杂，一般要有java环境和groovy环境才行。一般在一些java的项目中会用到groovy的脚本，比如Jenkinsfile。groovy版本的wordcount如下
```groovy
def res= new HashMap<String,Integer>()
new File('a.js').text.eachLine {
    line-> line.split(' ').each {
        if(res.get(it))
            res.put(it,res.get(it)+1)
        else
            res.put(it,1)
    }
}
res.each { println(it) }
```
groovy兼容所有的java语法，且提供大量语法糖，如上def就是声明变量的写法。each函数中it变量代表每个元素，也是固定的语法糖，如果一个函数最后一个参数是闭包，则这个参数可以写在()后面。如果一个函数只有一个参数，则不用写(),如print 123。

lua则是c语言写的一种语言，语法简练，性能很高，常用于很多服务器上的一些执行规则的配置，如nginx有大量lua。