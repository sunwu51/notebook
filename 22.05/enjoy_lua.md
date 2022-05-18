# lua
lua是C语言写的一门非常简单的脚本语言，他的主要作用不是实现功能，例如拿lua去做IO、集合数据存储、多线程并发等等都是不合适的，lua的主要定位是做流程控制，例如我们用c语言写好了一些功能函数，比如读写数据库、发邮件等等。然后lua因为可以引入c语言库，就可以负责判断是哪种情况，然后执行写好的c函数。

所以lua主要用来做简单的数字、字符处理和ifelse判断就可以，其他的交给c/c++就好了。

# 基础语法
```lua
-- 1 基础的变量赋值
a = 10 -- 默认的变量声明都是全局的，所有文件生效的，是存到_G这个table中的
local a = 10 -- 加了local才不是全局变量
a = 10.1
a = "string"
a = 'string' -- 字符串可以是单引号，也可以双引号
a = [[fdsafdsaf
sdaf]] --双括号等于js中的``
a, b = 1,2 -- 多重赋值
tb = {1, 'haha', 3} -- table功能类似tuple
print(tb[1]) -- ！！！注意lua的table 下标从1开始，这里会打印1
tb = {a = "aaa", b = 123, d = function(a) print(a) end} -- table也可以设置key
print(tb.a, tb['b'])  --两种方式都可以访问，类似js
print(xx, tb.zz, tb[1000]) -- 不存在的变量，越界等，都是nil，而不是异常报错

-- 2 函数声明与使用
function f(a, b)
    return a, b  -- 函数可以多返回值
end
print(f(1,2))

-- 3 table的操作
tb = {1, 2, 3, 4}
#tb -- #可以用来求table或者字符串长度
table.insert(tb, 5) -- 在最后插入，table是_G.table的缩写，table本身是个table，内部又有insert这个key是个function而已
table.insert(tb, 1, "--") -- 在指定下标插入元素

table.remove(tb, 1) -- 删除指定下标元素
tb = {a=1, b=2}
tb.a = nil -- 字符串下标的不能用remove删除需要直接设置为nil


-- 4 string操作
str = 'aBca'
str:upper() --下面方法只可以直接用`变量:methd(第二个参数开始)`作为简写
string.upper(str)
string.lower(str)
string.char(0x30,0x31) --ascii数字转字符串
string.gsub(str, 'a', 'A') --replace所有a为A，a是正则
string.find(str, 'Bc', 1) --返回含有的字符串下标开始和结束，这里返回2 3，注意返回俩数，最后一个参数可以不写，默认是0，从第几个字符开始搜索
string.find("a123f", "%d+") --返回2 4 %d是数字而不是\d，转义也是有%,例如%.就是.的转义。
string.match("a123f", "%d+") --返回123
string.match("a123f", "%d(%d)(%d)") --返回2 3括号内的组会分别作为多返回值返回

string.reverse(str) -- 翻转
string.format('num is %d', 4) --与printf类似
string.len(str) --等价于#str
"123".."456" -- 连接字符串
string.sub(str, 2, 3) --截取第2到3（含）个字符
-- 下面实现lua没有的split的函数
util = {}
function util.Split(str, sep)
    local sep, fields = sep or ":", {}
    local pattern = string.format("([^%s]+)", sep)
    str:gsub(pattern, function (c) fields[#fields + 1] = c end)
    return fields
end


-- 5 循环
a = 0
while(a < 10)
do
   print(a)
   a = a + 1 -- lua不支持++ 和+=
end

for i=10,1,-1 do -- 10到1，步长-1 
    print(i) -- 注意for循环内不能修改i的值，写了等于没写
end

for k, v in pairs({'a', 'b'}) do
    print(k, v) -- 打印1 a  2 b
end

-- 6 判断
a = 1
if a > 1 then
    print('>1')
elseif a<1 then -- 注意elseif的写法
    print('<1')
else 
    print(1)
end

print(1 >= 1)
print(1 ~= 1) --不等于是~=
if 0 then     -- lua中0是true。nil才是false
    print('0 is true')
end

-- 7 与或非的返回值
a = 1
b = nil
a and b -- nil
a or b -- 1
not b -- true
not a -- false
a > 10 and a or 10 -- 用and or模拟三目运算
```
正则语法与传统正则稍有区别

![image](https://i.imgur.com/KRlzmbu.png)
# 使用包
中文社区有大佬做的特别全的[文档](https://wiki.luatos.com/_static/lua53doc/contents.html)。其中列出了lua sdk的重要的包，像math、os、string、table、io、debug等等，当然也有c去调lua的时候用的库`lua_`开头的那些。

math常用方法`math.random()`[0,1)之间的随机数。`math.ceil(x)`返回不小于 x 的最小整数值。

调用自己的lua文件，使用requie
```lua
require('hello') --运行当前文件下的hello.lua文件，并返回运行后的值，文件可以直接return值，注意不带lua后缀
require('lib.hello') -- ./lib/hello.lua文件
require('lib.hello') -- 多次require只运行一次，就会缓存结果。这也是为了防止a引b，a引c，b引c，c防止运行两次导致非预期结果
```

协程，lua的协程共用一个主线程。
```lua
t1 = coroutine.create(function()
    print(1)
    end
) -- 创建协程，并不开始执行

coroutine.resume(t1) -- 开始或继续运行协程



t2 = coroutine.create(function()
    print(1)
    local a, b,c = coroutine.yield(1, 2, 3)
    print(a, b, c) -- 4 5 6
    end
) -- yield挂起并返回给resume函数
print(coroutine.resume(t1)) -- 1 2 3
coroutine.resume(t1, 4, 5, 6) -- 继续执行，并传入参数
```
sleep没有内置sleep函数，需要调用os，执行shell语句
```lua
function sleep(n) -- shell sleep n秒
   os.execute("sleep " .. n)
end
```
![image](https://i.imgur.com/TLLEzQD.png)
读写文件
```lua
-- 也可以io.open文件后read，但是常用下面的逐行操作
for line in io.lines('filename') do
    print(line)
end

-- 传统的写和读
file = io.open('./text.txt', 'a') --a追加 w重写
io.output(file)
io.write('hahaha\n')
io.close(file)

file = io.open('./text.txt', 'r')
io.input(file)
print(io.read())
io.close(file)
```
# 案例
猜数游戏
```lua
num = math.ceil(math.random(1,100))
-- print(num)

while(1) 
do
    line = io.read("*l")
    my_num = tonumber(line)
    if my_num == num then
        print('you win')
    break
    elseif my_num > num then
        print('too big')
    else
        print('too small')
    end
end
```