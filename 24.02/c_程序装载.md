# 程序装载
建议先读`静态链接`文章，然后再看本文。

# Linux内核装载ELF
- bash输入`./xx`，bash进程调用`fork`系统调用创建一个新的进程
- 新进程调用`execve`调用指定的ELF文件
    - clibc对execve进行了变体包装提供了`execl`,`execlp`,`execle`,`execv`和`execvp`等形式，见到后知道都是`exec`系列，底层都是调用`execve`系统调用。
    - execve首先检查要执行的文件检查前128字节，看是不是ELF文件，比如`#!/usr/bin`的就不是ELF而是普通shell文件，文件头4个字节就是魔数来，前面ELF魔数是del e l f对吧，java的是cafe，shell这种就是靠`#!`两个字符即可识别格式是文本，并且解析后面的部分最终确定咋执行。判断出ELF格式，就用`load_elf_binary()`来加载elf
    - 寻找动态链接的`.interp`端，设置动态链接的路径
    - ELF的程序头表描述，对ELF文件进行映射。
    - 初始化ELF进程环境。
    - 将系统调用的返回地址修改为ELF文件的入口点，如果静态链接的ELF入口点就是嗯剪头中e_entry所指的地址，动态链接的入口点是动态连接器。
- 系统调用返回，返回值是入口点的地址，新程序就从这个地址开始执行，ELF装载完成。

gpt的回答
```
在 Linux 系统中，ELF (Executable and Linkable Format) 文件被装载到内存并开始执行的过程涉及到操作系统的多个组件，主要包括内核和动态链接器（如 ld-linux.so）。以下是该过程的简化概述：

1 启动执行：

当你在命令行输入程序名称并按下回车时，shell 会调用 exec() 系统调用来执行程序。
exec() 系统调用告诉内核加载和执行指定的程序。

2文件读取：

内核首先验证 ELF 文件的魔数（文件的前几个字节），确保其是一个有效的 ELF 文件。
然后，内核读取 ELF 文件的头部信息，以确定程序的段（如 .text、.data、.bss 等）以及它们在虚拟内存中的映射位置。

3 创建进程映像：

内核为新进程创建一个进程映像，分配必要的虚拟内存，并设置程序计数器（PC）指向入口点。
对于 ELF 文件中的每个程序段（segment），内核将它们映射到进程的虚拟地址空间。这可能涉及拷贝数据到内存，或者建立内存映射以便于惰性加载。

4 处理动态链接（如果适用）：

如果 ELF 文件是动态可执行文件，它将包含对动态链接器（如 ld-linux.so）的引用。
内核将加载动态链接器，并且实际的程序入口点实际上是动态链接器的入口点。
动态链接器读取程序的动态段（.dynamic），解析所有需要的共享库依赖，并加载它们进入内存。
动态链接器还进行符号解析，即确定程序中引用的函数和变量在哪个加载的共享库中，并将这些引用链接到正确的地址。

5 转移控制：

一旦动态链接器完成了其工作，它会将控制权转交给程序的实际入口点（通常是 _start），该入口点之后会调用 main() 函数。

6 程序执行：

现在程序已经完全装载到内存中，所有必要的链接已经完成，程序开始执行。
运行时环境：

在程序开始运行之前，C 运行时环境（CRT）会进行一些初始化工作，包括设置标准 I/O 流、调用全局构造函数等，然后才会调用 main()。

7 程序终止：

当 main() 函数返回时，C 运行时会进行清理工作，比如调用全局析构函数，并最终调用 exit() 系统调用来结束进程。
```

# 入口是_start
gcc编译的ELF默认的入口是`_start`的位置，由该函数负责处理入参环境变量等初始化操作，并最后启动`main`函数。`_start`符号来自`libc中的crt1.o`文件，（其实是他又引用的别的文件，最终是一段asm汇编代码）。

我们也可以写一个只有`_start`函数的文件，这样就需要排除c标准库来进行编译，与此同时我们也不能使用标准库给我们提供的头文件了，代码如下`mini.c`.

注意这是x86平台的linux，能找到`/glibc-2.35/sysdeps/unix/sysv/linux/x86_64/64/arch-syscall.h:#define __NR_write 1`，平台系统调用序号并不是1，需要自己去查，当然其他平台寄存器也不是这么写。
```c
// 裸机程序示例，使用 _start 作为程序入口
// 注意：这是在 Linux x86_64 架构下的示例
// 编译命令: gcc -static -nostdlib -nostartfiles -o mini mini.c

// 先从libc的sys/syscall.h找到以下定义拿过来，因为不能直接include
#define SYS_write 1 // 这是write系统调用的代号
#define SYS_exit 60 // 这是exit系统调用的代号

// 定义 _start 函数，这是执行时的程序入口点
void _start() {
    // 要写入的消息
    const char message[] = "Hello, World!\n";
    // 消息长度
    unsigned long length = sizeof(message) - 1;

    // 使用内联汇编进行系统调用
    // syscall(SYS_write, STDOUT_FILENO, message, length)
    __asm__("movq $1, %%rax\n\t"          // 系统调用号 SYS_write
            "movq $1, %%rdi\n\t"          // 文件描述符 STDOUT_FILENO
            "movq %0, %%rsi\n\t"          // 消息缓冲区的地址
            "movq %1, %%rdx\n\t"          // 消息的长度
            "syscall\n\t"
            :
            : "r"(message), "r"(length)
            : "%rax", "%rdi", "%rsi", "%rdx");

    // 使用内联汇编执行退出系统调用
    // syscall(SYS_exit, 0)
    __asm__("movq $60, %%rax\n\t"         // 系统调用号 SYS_exit
            "xor %%rdi, %%rdi\n\t"        // Exit status 0
            "syscall"
            :
            :
            : "%rax", "%rdi");
}
```
编译链接就可以运行了，建议使用静态链接
```bash
$ gcc -static -nostdlib -nostartfiles -o mini mini.c
$ ./mini
Hello, World!

$ nm mini
0000000000404000 R __bss_start
0000000000404000 R _edata
0000000000404000 R _end
0000000000401000 T _start
```
