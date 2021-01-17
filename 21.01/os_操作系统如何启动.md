# 操作系统如何启动
# 1 基本概念
BIOS是指基本IO处理系统，一开始是放在主板ROM中的，启动时会加载到内存的固定地址(真实地址)；

操作系统一开始是放在DISK上的；

BootLoader是加载OS到内存的，一开始也是放到磁盘的第一个主引导扇区，启动时也是加载到内存的固定地址(真实地址)。

![image](https://i.imgur.com/2cFYn2a.png)

![image](https://i.imgur.com/MewrsXk.png)
# 2 过程
打开电源-->主板中内置的BIOS系统启动-->BIOS检测各种外设-->Boootloader装载OS-->OS启动完成