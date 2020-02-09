# numpy
numpy中最小元素是数，即一般不用来处理字符串或者其他数据类型。numpy中元素是放在数组中的。通过下面方式引入numpy。
```py
import numpy as np
```
# 创建数组
np.array、zeros、ones、zero_like、arange、full、full_like都可以初始化一个数组。
```py
# 直接将List转为np数组，数据格式自动判断
np.array([1,2,3])

# zeros声明数值为0的数组
np.zeros(10)

# zeros第一个参数是shape(tuple类型)，然后可以接dtype，默认是float64
np.zeros((1,),dtype='int16')

# 填充个2x3的数组，每个元素的值是1
np.full((2,3),1,dtype='int16',order='C')

# 第一个参数可以是Python中的list也可以是np数组
np.full_like([1,2,3],1,dtype='int16')

# 5阶单位矩阵
np.identity(5)
```
# 基础属性
```py
# 维度
b.ndim

# 阶
b.shape

# 类型
b.dtype

# 每个元素的大小（字节）
b.itemsize

# 数组总元素个数
b.size

# 空值
np.nan
```
# 选取&赋值
```py
# 0-9组成2x5的数组
b = np.reshape(np.arange(10),(2,5))

# 打印特定元素
print(b[0,0],b[0][0])

# 打印整行或整列
print(b[0,:],b[:,0])

# 打印部分行(列)，下面是打印第1列到倒数第2列（包头不包尾）
print(b[:,1:-1])

# 步幅是2
print(b[:,1:-1:2])

# 判断每个元素是否>3,结果如下
print(b > 3)
[[False, False, False, False,  True],
 [ True,  True,  True,  True,  True]]

# 筛选出>3的这些元素,结果如下
print(b[b>3])
[4,5,6,7,8,9]

# 筛选出>3的这些元素的下标，返回结果是个tuple，tuple元素个数是数组行数。每个元素是个numpy数组。
print(np.where(b>3))

# 选定斜线，包含俩节点b[0,0],b[1,1]
print(b[[0,1],[0,1]])


# 上述选取，可以直接赋值，影响原数组

# 等shape赋值
b[:,1:3]=np.zeros((2,2))

# 赋值为一个值
b[b>3] = 3
```
# 计算
```py
# 0-9组成2x5的数组
b = np.reshape(np.arange(10),(2,5))

# 最大最小求和均值方差等数学运算
np.max(b[0,:]) # 第一行最大值
np.max(b,axis=0)# 求每一行最大组成数组axis=0代表第0维度，改为1则是每一列最大
np.sum(b)      # b所有元素和
np.mean(b)     # 期望
np.var(b)      # 方差
np.std(b)      # 标准差
np.sin(b)      # 每个元素求sin
np.linalg.det(b) # 求b的行列式
np.matmul(a,b) # 两矩阵相乘
b.T            # 转置
np.transpose(1,0,2) # 多维转置，可以重新调整维度顺序
np.dot(a,b)    # 两矩阵相乘

# 基本的加减乘除幂次方，是对每个元素都进行一次这个操作，并返回个新的数组
x1 = b + 1
x2 = b * 2
x3 = b ** 2 # 平方

# 同shape的两数组运算
x4 = x1 + x2
# 不同shape数组运算
x5 = x1 @ x2  # 两矩阵相乘

# 对每行/列进行apply运算axis=1是按照一行一个元素带入函数，=0则是一列一个元素
np.apply_along_axis(lambda x:print(x),arr=b,axis=1)

# 介绍了3个 (* 不算，这个是对位相乘)相乘的函数@ dot matmul，二维下一致，高纬度区别可以自己查
```

# 其他细节
```py
# 判断是否为空
np.isnan(b)

# 深拷贝
c = b.copy()

# 改变阶
b.reshape(2,3)

# 拼接，上下拼接俩b
np.vstack(b,b)

# 水平拼接
np.hstack(b,b)

# 加载文本文件
np.genfromtxt('1.txt',delimiter=',')

# 改变一个array类型
b.astype('int32')

# for遍历每一行,row是numpy数组类型
## 下面等价
x = b[:,1]
x = np.array([row[1] for row in b])
## 解决复杂场景：例如判断哪一行含有nan
x = np.array([np.any(np.isnan(row)) for row in b])
## 再如：数组每个元素是list或者tuple需要双重遍历
```