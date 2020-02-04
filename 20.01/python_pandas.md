# pandas
pandas是数据分析常用的一个库，如果和numpy对比的话，numpy的特点是偏向数的处理，形式一般是多维数组。pandas则偏向于各种数据的处理，形式主要是二维数据，有着列名和行索引。

pandas中最终要的数据类型是DataFrame和Series，前者是二维数组，后者是一列数据。DataFrame的索引顺序是先行后列。
```py
import pandas as pd

data = [[1,2,3],[4,5,6]]
columns = ["c1","c2","c3"]
index = ["a","b"]

df = pd.DataFrame(data,columns=columns,index=index)
```
# 基础属性
```py
# 列名，是个numpy数组
df.columns

#行名
df.index
```
# 选取
推荐使用loc或者iloc选取元素，iloc用行列的序号，loc则是使用行列名。
```py
# 选一列，选出的类型是Series
# 以下三者等价
print(df["c1"])
print(df.c1)
print(df.loc[:,'c1'])
print(df.iloc[:,1])

# 选一行
print(df.loc["a"])
print(df.iloc[0])

# 选某个值
print(df.iloc[1,1])

# iloc用法与numpy一样
print(df.iloc[[0],[0,2]])

# 筛选符合条件的用法，下面用法不能用loc/iloc
print(df[df>3])
```
将df比作数据库，可以实现各种sql查询
```py
# select c1,c3 from df where c2>3 and c3<8 
print(df.loc[(df["c2"]>3) & (df["c3"]<8]),['c1','c3']])

# select * from df order by c1 order by c2 desc
print(df.sort_values(['c1','c2'],ascending=[1,0]))

# select count(c1) from df where c4 like '%a%'
df['c4'] = ["abc","cde"]
print(df.loc[df.c4.str.contains('c'),'c1'].count())
# contains、startswith、endswith都是常见的方法
# count、sum、max、min、std等用法类似

# groupby
```
# 赋值
```py
# 添加一列
df['c4']=["abc","cde"]

# 添加一行
# 如果使用了ignore_index=True，所有的行名都会被清除，按照0开始自增重新命名
df = df.append({'c1':7,'c2':8,'c3':9},ignore_index=True)

# 如果不想丢失原来的index名则需要append个series
df = df.append(pd.Series({'c1':7,'c2':8,name='d'),'c3':9})

# 使用loc/iloc赋值
df.iloc[1] = [1,2,3]
# 一整行赋值为1
df.iloc[1] = 1

# 基于条件赋值
df.loc[df['c1']<4,'c1'] = 4
```