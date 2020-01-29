# matplotlib
非常受欢迎的python数据可视化工具库。用法非常简单。
# 快速开始
```python
from matplotlib import pyplot as plt
# list可以换为np数组或pandas数组
x = [1,2,3]
y = [1,4,9]
plt.plot(x,y)
plt.show()
```

画多图subplot，添加标题title，添加轴名xlabel，添加图例legend

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/2001/matplotlib1.jpg)

# 柱状图与饼图

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/2001/matplotlib3.png)


![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/2001/matplotlib4.png)
# 其他细节
```py
# g绿色o是画点不连起来，label配合legend显示图例
plt.plot(x,y,'go',label='L1',linewidth=5)
# b蓝色--虚线
plt.plot(x,y,'b--',label='L2',linewidth=5)

# 如果为空则使用plot中的label
plt.legend()
```

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/2001/matplotlib2.png)