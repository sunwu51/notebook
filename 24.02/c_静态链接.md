# 静态链接
准备一个hello.c文件
```c
#include<stdio.h>
int main() {
    printf("Hello World\n");
    return 0;
}
```
# 1 编译链接的主要过程
## 第一步 预处理
`预处理`过程就是把所有的`#`开头的不管是头文件引用还是宏定义给干掉，替换成原始代码。
```bash
$ gcc -E -o hello.i hello.c # -E指定只进行预处理
```
得到的[hello.i](./link/hello.i)文件有17k这么大，都是`#include<stdio.h>`这一行引入的，因为有传染效应，该文件中的`#`也要被替换为源码。
## 第二步 编译
编译的过程就是将预处理后的`hello.i`文件，转换成汇编语言。
```bash
$ gcc -S -o hello.s hello.i # -S指定进行编译不进行汇编

# 或者
$ gcc -S -o hello.s hello.c
```
编译过程就是词法、语法、语意分析、还有各种优化，生成中间表达式或者叫中间文件，这也就是编译器前端的工作，之后由后端转为机器码/汇编代码。这里不展开，总之得到了汇编文件[hello.s](./link/hello.s)可以打开后，看到对应的汇编代码。
## 第三步 汇编
汇编是把汇编代码转换为机器码，机器码是给机器看的，所以之前的文件，人是可以看懂的，但是机器码就很难看懂了，机器码本身就是个二进制文件了。
```bash
$ gcc -c -o hello.o hello.c
```
[hello.o](./link/hello.o)文件是Object格式，一般叫做目标文件，该文件已经是二进制可执行文件的格式了，但是还不能直接运行，因为当前的目标文件，是一个可重定位目标文件，并没有达到最终的可执行的状态。还需要关键一步，也就是链接。
## 第四步 链接
链接就是本文接下来要讲述的过程，我们从上面拿到的`hello.o`文件开始。
# 2 读目标文件
我们说`hello.o`是个不可读的二进制文件，但是有一些系统内置的工具可以帮助我们来读取该文件。这里介绍两个`readelf`和`objdump`工具。

`readelf`顾名思义就是读取elf文件的工具，那为啥是elf文件呢，我们不是读取的目标文件吗。这是因为elf（Executable and Linkable Format）文件是一个二进制可执行文件的重要格式规范，目标文件就是改格式规范下的。

`ELF`文件主要由3部分组成：
- `ELF头部（ELF Header）`：位于文件开头，包含了描述整个文件的基本信息，如文件的类型（是可执行文件、可重定位文件还是共享对象文件）、目标机器类型（如x86、ARM等）、入口地址（如果文件是可执行文件）、ELF版本和各个段（Section）的位置信息等。ELF头部使得操作系统能够理解文件的基本结构和如何加载它。
- `节头（Section Header）`：这一部分包含了一系列的条目，每个条目都描述文件中的一个节（section），例如.text、.data、.bss、.rodata、.symtab等。每个条目中包含了节的名称、类型、大小、地址、对齐约束等信息。节是文件的组成部分，用于存储程序的代码、数据、符号表、重定位信息等。
- `节（Sections）`：实际的代码和数据都存储在这些节中。常见的节包括：
.text：存放程序的执行代码。
.data：存放已初始化的全局变量和静态变量。
.bss：存放未初始化的全局变量和静态变量。
.rodata：存放只读数据，如字符串常量。
.symtab和.dynsym：存放符号表，用于名称解析和动态链接。
.rel.text、.rel.data等：存放重定位信息。
.dynamic：存放动态链接信息。
.note：存放注释信息。

实际排布上`Section Header`在`Section`后面。

## ELF header
`hello.o`的elf header部分如下，Magic部分是文件最初的几个字节，表示文件的类型是EFL类型；后面是一些其他元信息，注意在这部分中还显示声明了其他几个部分的地址和大小，比如`program headers`这里就是0字节，也就是没有这部分。
```bash
$ readelf -h hello.o
ELF Header:
  Magic:   7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00 
  Class:                             ELF64
  Data:                              2's complement, little endian
  Version:                           1 (current)
  OS/ABI:                            UNIX - System V
  ABI Version:                       0
  Type:                              REL (Relocatable file)
  Machine:                           Advanced Micro Devices X86-64
  Version:                           0x1
  Entry point address:               0x0
  Start of program headers:          0 (bytes into file)
  Start of section headers:          600 (bytes into file)
  Flags:                             0x0
  Size of this header:               64 (bytes)
  Size of program headers:           0 (bytes)
  Number of program headers:         0
  Size of section headers:           64 (bytes)
  Number of section headers:         14
  Section header string table index: 13
```
## section headers
因为没有`program header`部分，我们直接用`-S`查看`section headers`如下，主要记录了每个section的名字，类型，地址（这里都是0之后解释）等信息。
```bash
$ readelf -S  hello.o
There are 14 section headers, starting at offset 0x258:

Section Headers:
  [Nr] Name              Type             Address           Offset
       Size              EntSize          Flags  Link  Info  Align
  [ 0]                   NULL             0000000000000000  00000000
       0000000000000000  0000000000000000           0     0     0
  [ 1] .text             PROGBITS         0000000000000000  00000040
       000000000000001e  0000000000000000  AX       0     0     1
  [ 2] .rela.text        RELA             0000000000000000  00000198
       0000000000000030  0000000000000018   I      11     1     8
  [ 3] .data             PROGBITS         0000000000000000  0000005e
       0000000000000000  0000000000000000  WA       0     0     1
  [ 4] .bss              NOBITS           0000000000000000  0000005e
       0000000000000000  0000000000000000  WA       0     0     1
  [ 5] .rodata           PROGBITS         0000000000000000  0000005e
       000000000000000c  0000000000000000   A       0     0     1
  [ 6] .comment          PROGBITS         0000000000000000  0000006a
       000000000000002c  0000000000000001  MS       0     0     1
  [ 7] .note.GNU-stack   PROGBITS         0000000000000000  00000096
       0000000000000000  0000000000000000           0     0     1
  [ 8] .note.gnu.pr[...] NOTE             0000000000000000  00000098
       0000000000000020  0000000000000000   A       0     0     8
  [ 9] .eh_frame         PROGBITS         0000000000000000  000000b8
       0000000000000038  0000000000000000   A       0     0     8
  [10] .rela.eh_frame    RELA             0000000000000000  000001c8
       0000000000000018  0000000000000018   I      11     9     8
  [11] .symtab           SYMTAB           0000000000000000  000000f0
       0000000000000090  0000000000000018          12     4     8
  [12] .strtab           STRTAB           0000000000000000  00000180
       0000000000000013  0000000000000000           0     0     1
  [13] .shstrtab         STRTAB           0000000000000000  000001e0
       0000000000000074  0000000000000000           0     0     1
Key to Flags:
  W (write), A (alloc), X (execute), M (merge), S (strings), I (info),
  L (link order), O (extra OS processing required), G (group), T (TLS),
  C (compressed), x (unknown), o (OS specific), E (exclude),
  D (mbind), l (large), p (processor specific)
```
## section
为了更好的理解，我们使用`objdump`来配合查看section内部的具体内容，结果如下，我们注意到`.rodata`部分内容就是字符换`Hello World\n\0`印证之前说的这部分是存储数据的，`.comment`是存储了gcc编译器的信息不用管，`.note.xx`也是一些基础信息，`eh_frame`处理异常信息用先不管。

`.text`则是存储的"源代码"也就是机器码，直接对照下面最后部分的汇编代码。
```bash
 $ objdump -s -d hello.o

hello.o:     file format elf64-x86-64

Contents of section .text:
 0000 f30f1efa 554889e5 488d0500 00000048  ....UH..H......H
 0010 89c7e800 000000b8 00000000 5dc3      ............].  
Contents of section .rodata:
 0000 48656c6c 6f20576f 726c6400           Hello World.    
Contents of section .comment:
 0000 00474343 3a202855 62756e74 75203131  .GCC: (Ubuntu 11
 0010 2e342e30 2d317562 756e7475 317e3232  .4.0-1ubuntu1~22
 0020 2e303429 2031312e 342e3000           .04) 11.4.0.    
Contents of section .note.gnu.property:
 0000 04000000 10000000 05000000 474e5500  ............GNU.
 0010 020000c0 04000000 03000000 00000000  ................
Contents of section .eh_frame:
 0000 14000000 00000000 017a5200 01781001  .........zR..x..
 0010 1b0c0708 90010000 1c000000 1c000000  ................
 0020 00000000 1e000000 00450e10 8602430d  .........E....C.
 0030 06550c07 08000000                    .U......        

Disassembly of section .text:

0000000000000000 <main>:
   0:   f3 0f 1e fa             endbr64 
   4:   55                      push   %rbp
   5:   48 89 e5                mov    %rsp,%rbp
   8:   48 8d 05 00 00 00 00    lea    0x0(%rip),%rax        # f <main+0xf>
   f:   48 89 c7                mov    %rax,%rdi
  12:   e8 00 00 00 00          call   17 <main+0x17>
  17:   b8 00 00 00 00          mov    $0x0,%eax
  1c:   5d                      pop    %rbp
  1d:   c3                      ret   
```
通过`readelf -a`可以查看所有信息，我们把上述没有展示的信息放到下面，主要是展开了section的`entries`，我们重点关注下`.symtab`也就是符号表的内容，这里有6项，其中第0项是个留空的不管。
```bash
$ readelf -a hello.o
...

Relocation section '.rela.text' at offset 0x198 contains 2 entries:
  Offset          Info           Type           Sym. Value    Sym. Name + Addend
00000000000b  000300000002 R_X86_64_PC32     0000000000000000 .rodata - 4
000000000013  000500000004 R_X86_64_PLT32    0000000000000000 puts - 4

Relocation section '.rela.eh_frame' at offset 0x1c8 contains 1 entry:
  Offset          Info           Type           Sym. Value    Sym. Name + Addend
000000000020  000200000002 R_X86_64_PC32     0000000000000000 .text + 0
No processor specific unwind information to decode

Symbol table '.symtab' contains 6 entries:
   Num:    Value          Size Type    Bind   Vis      Ndx Name
     0: 0000000000000000     0 NOTYPE  LOCAL  DEFAULT  UND 
     1: 0000000000000000     0 FILE    LOCAL  DEFAULT  ABS hello.c
     2: 0000000000000000     0 SECTION LOCAL  DEFAULT    1 .text
     3: 0000000000000000     0 SECTION LOCAL  DEFAULT    5 .rodata
     4: 0000000000000000    30 FUNC    GLOBAL DEFAULT    1 main
     5: 0000000000000000     0 NOTYPE  GLOBAL DEFAULT  UND puts

No version information found in this file.

Displaying notes found in: .note.gnu.property
  Owner                Data size        Description
  GNU                  0x00000010       NT_GNU_PROPERTY_TYPE_0
```
后面的几个size为0的分别为`FILE`类型，这是指向文件本身的Name就是文件名`hello.c`，`SECTION`类型的`.text`和`.rodata`声明了自己有这两个section。

`main`是当前文件中声明的函数，函数和变量都是符号，函数是`FUNC`类型，变量则是`OBJECT`类型，例如将代码修改如下，得到的符号表就会多个v1.
```c
#include<stdio.h>

int v1 = 1;

int main() {
    printf("Hello World\n");
    return 0;
}

/*
   Num:    Value          Size Type    Bind   Vis      Ndx Name
     0: 0000000000000000     0 NOTYPE  LOCAL  DEFAULT  UND 
     1: 0000000000000000     0 FILE    LOCAL  DEFAULT  ABS hello.c
     2: 0000000000000000     0 SECTION LOCAL  DEFAULT    1 .text
     3: 0000000000000000     0 SECTION LOCAL  DEFAULT    5 .rodata
     4: 0000000000000000     4 OBJECT  GLOBAL DEFAULT    3 v1
     5: 0000000000000000    30 FUNC    GLOBAL DEFAULT    1 main
     6: 0000000000000000     0 NOTYPE  GLOBAL DEFAULT  UND puts
*/
```
最后解释下`puts`这个是编译器进行了优化将`printf`替换为`puts`了，使用的gcc版本如下
```
gcc version 11.4.0 (Ubuntu 11.4.0-1ubuntu1~22.04)
```
其他版本或者换成clang某个版本后没有该优化结果如下：
```bash
Symbol table '.symtab' contains 7 entries:
   Num:    Value          Size Type    Bind   Vis      Ndx Name
     0: 0000000000000000     0 NOTYPE  LOCAL  DEFAULT  UND 
     1: 0000000000000000     0 FILE    LOCAL  DEFAULT  ABS hello.c
     2: 0000000000000000     0 SECTION LOCAL  DEFAULT    2 .text
     3: 0000000000000000    13 OBJECT  LOCAL  DEFAULT    5 .L.str
     4: 0000000000000000    37 FUNC    GLOBAL DEFAULT    2 main
     5: 0000000000000000     0 NOTYPE  GLOBAL DEFAULT  UND printf
```
这里我们注意到printf类型是NOTYPE，未定义的类型，因为他的Ndx值是UND即未定义，换句话说`printf`函数不是当前文件定义的，是在`stdio`中定义的，需要在链接这一步给重定位了，clang的结果中`.L.str`就是字符串`Hello World\n\0`13个字的存放大小。

可以看出不同编译器，不同版本，甚至不同os和cpu架构都可能会生成不同的elf。
## 理解汇编代码中的地址
我们上面通过objdump反编译出了汇编代码如下，我们详细分析一下每一部分的含义。
```s
0000000000000000 <main>:
   0:   f3 0f 1e fa             endbr64 
   4:   55                      push   %rbp
   5:   48 89 e5                mov    %rsp,%rbp
   8:   48 8d 05 00 00 00 00    lea    0x0(%rip),%rax        # f <main+0xf>
   f:   48 89 c7                mov    %rax,%rdi
  12:   e8 00 00 00 00          call   17 <main+0x17>
  17:   b8 00 00 00 00          mov    $0x0,%eax
  1c:   5d                      pop    %rbp
  1d:   c3                      ret   
```
首先是main函数其实地址为0，左侧一列是偏移量，可以看到总体便宜量也就是main函数大小是`0x1d`这么大。

前三行解释：

第一行`endbr64`是一个比较新的指令它与Intel的控制流强化技术有关，跳过不管。第二行的`push %rbp`是非常常见的函数第一行执行的指令，用于将基指针寄存器`（Base Pointer，rbp）`的内容压入栈中。rbp 寄存器通常用于在函数调用中保存栈的基地址。`push %rbp` 通常在函数的序言（prologue）部分出现，保存当前函数的栈基指针，为设置新的栈帧做准备。第三行和第二行是配合的`mov %rsp, %rbp` 是 x86_64 汇编中的一个常见指令，它的作用是将栈指针`（Stack Pointer）`寄存器 `rsp` 的当前值移动（复制）到基指针（Base Pointer）寄存器 rbp 中。这个操作通常是在函数调用的开头执行的，作为创建一个新的栈帧（Stack Frame）的一部分。

第4-5行：

`lea 0x0(%rip),%rax`lea用于加载有效地址，`%rip` 是 x86_64 架构中的指令指针（Instruction Pointer），又称程序计数器（Program Counter）,`0x0(%rip)`就是从`当前指令的下一条指令`加上偏移量0的地址也就是下一行`0x0f`的地址，lea作用是让`rax=0xf`，RAX 是累加器寄存器（Accumulator Register）通常也用来存储函数返回值。`mov    %rax,%rdi`则是将rdi目的索引寄存器（Destination Index Register）【RDI 用来传递第一个整数或指针参数给函数。如果函数有多个参数，后续的参数会按照特定的顺序使用 RSI、RDX、RCX、R8 和 R9 寄存器。】也复制为rax的值。这里第4-5行，看似不明所以，其实是为了准备helloworld字符串，如果把`0x0(%rip)`换成字符串的地址，就好理解了，即将字符串地址赋给rax，然后赋给rdi，rdi是作为接下来调用的函数的第一个入参的，也就是对应第6行call printf的第一个入参。

第6-9行：

`call 17`就是执行便宜量为17的地方的函数，其实是执行`printf`但是因为没有在当前文件中声明，需要依赖链接后确定最终地址，这里17就是第7行的地址，即和之前。第7行`mov    $0x0,%eax`将立即数0复制给`rax`的低32位，rax前面介绍过是用来存储返回值的，这个0也就是最终的返回值，当然如果我们将代码改成`return 1`这里就变成了`mov    $0x1,%eax`.`pop %rbp`函数出栈，ret出栈后返回调用者。


到这里我们大概理明白了这一小段汇编代码的作用，其中地址的部分有些奇怪，很多都是复制了当前的执行地址，而不是数据或函数，或者统一叫做符号的实际地址，而真正替换为实际的地址，需要用到链接过程了。
# 3 静态链接
将`hello.o`静态链接为可执行文件`hello`
```bash
$ gcc -static -o hello hello.o
```
因为`hello.c`中使用了`printf`方法，该函数来自libc牵扯的东西非常多，所以静态链接后`hello`文件有几百k太大了不方便我们分析，所以这里我们重新创建两个文件`a.c`和`b.c`，即按照《程序员的自我修养》的demo走一遍。
```c
//a.c
extern int shared;
int main() {
     int a = 100;
     swap(&a, &shared);
}
```
```c
//b.c
int shared = 1;

void swap(int* a, int* b) {
     // 不用额外空间进行swap的代码
     *a ^= *b ^= *a ^= *b;
}
```
通过gcc分别获得目标文件`a.o和b.o`，注意`-fno-stack-protector`是指定禁用栈保护，这样防止添加`__stack_chk_fail`这个符号。
```bash
$ gcc -fno-stack-protector -c b.c a.c
```

## 静态链接后，section的重定位情况
通过`objdump`查看两者汇编代码如下：
```bash
$ objdump -d a.o
a.o:     file format elf64-x86-64
Disassembly of section .text:
0000000000000000 <main>:
   0:   f3 0f 1e fa             endbr64 
   4:   55                      push   %rbp
   5:   48 89 e5                mov    %rsp,%rbp
   8:   48 83 ec 10             sub    $0x10,%rsp
   c:   c7 45 fc 64 00 00 00    movl   $0x64,-0x4(%rbp)
  13:   48 8d 45 fc             lea    -0x4(%rbp),%rax
  17:   48 8d 15 00 00 00 00    lea    0x0(%rip),%rdx        # 1e <main+0x1e>
  1e:   48 89 d6                mov    %rdx,%rsi
  21:   48 89 c7                mov    %rax,%rdi
  24:   b8 00 00 00 00          mov    $0x0,%eax
  29:   e8 00 00 00 00          call   2e <main+0x2e>
  2e:   b8 00 00 00 00          mov    $0x0,%eax
  33:   c9                      leave  
  34:   c3                      ret                    
```
在a中我们同样发现调用swap函数的地址是` call   2e <main+0x2e>`也就是下一条指令地址占位了，以及第一个参数rdi的赋值其实是给了0x64也就是100给了栈-4的地址（还记得栈向下生长吧，然后int占4byte），第二个参数rsi是00 00 00 00作为占位符了。

```bash
$ objdump -d b.o
b.o:     file format elf64-x86-64
Disassembly of section .text:
0000000000000000 <swap>:
   0:   f3 0f 1e fa             endbr64 
   4:   55                      push   %rbp
   5:   48 89 e5                mov    %rsp,%rbp
   8:   48 89 7d f8             mov    %rdi,-0x8(%rbp)
   c:   48 89 75 f0             mov    %rsi,-0x10(%rbp)
  10:   48 8b 45 f8             mov    -0x8(%rbp),%rax
  14:   8b 10                   mov    (%rax),%edx
  16:   48 8b 45 f0             mov    -0x10(%rbp),%rax
  1a:   8b 00                   mov    (%rax),%eax
  1c:   31 c2                   xor    %eax,%edx
  1e:   48 8b 45 f8             mov    -0x8(%rbp),%rax
  22:   89 10                   mov    %edx,(%rax)
  24:   48 8b 45 f8             mov    -0x8(%rbp),%rax
  28:   8b 10                   mov    (%rax),%edx
  2a:   48 8b 45 f0             mov    -0x10(%rbp),%rax
  2e:   8b 00                   mov    (%rax),%eax
  30:   31 c2                   xor    %eax,%edx
  32:   48 8b 45 f0             mov    -0x10(%rbp),%rax
  36:   89 10                   mov    %edx,(%rax)
  38:   48 8b 45 f0             mov    -0x10(%rbp),%rax
  3c:   8b 10                   mov    (%rax),%edx
  3e:   48 8b 45 f8             mov    -0x8(%rbp),%rax
  42:   8b 00                   mov    (%rax),%eax
  44:   31 c2                   xor    %eax,%edx
  46:   48 8b 45 f8             mov    -0x8(%rbp),%rax
  4a:   89 10                   mov    %edx,(%rax)
  4c:   90                      nop
  4d:   5d                      pop    %rbp
  4e:   c3                      ret 
```

手动链接得到二进制文件ab
```bash
$ ld -static -o ab a.o b.o -e main
```

我们来对比`a.o` `b.o`和`ab`的各个section
```bash
$ objdump -h a.o 
a.o:     file format elf64-x86-64
Sections:
Idx Name          Size      VMA               LMA               File off  Algn
  0 .text         00000035  0000000000000000  0000000000000000  00000040  2**0
                  CONTENTS, ALLOC, LOAD, RELOC, READONLY, CODE
  1 .data         00000000  0000000000000000  0000000000000000  00000075  2**0
                  CONTENTS, ALLOC, LOAD, DATA
  2 .bss          00000000  0000000000000000  0000000000000000  00000075  2**0
                  ALLOC
  3 .comment      0000002c  0000000000000000  0000000000000000  00000075  2**0
                  CONTENTS, READONLY
  4 .note.GNU-stack 00000000  0000000000000000  0000000000000000  000000a1  2**0
                  CONTENTS, READONLY
  5 .note.gnu.property 00000020  0000000000000000  0000000000000000  000000a8  2**3
                  CONTENTS, ALLOC, LOAD, READONLY, DATA
  6 .eh_frame     00000038  0000000000000000  0000000000000000  000000c8  2**3
                  CONTENTS, ALLOC, LOAD, RELOC, READONLY, DATA
```
```bash
$ objdump -h b.o
b.o:     file format elf64-x86-64
Sections:
Idx Name          Size      VMA               LMA               File off  Algn
  0 .text         0000004f  0000000000000000  0000000000000000  00000040  2**0
                  CONTENTS, ALLOC, LOAD, READONLY, CODE
  1 .data         00000004  0000000000000000  0000000000000000  00000090  2**2
                  CONTENTS, ALLOC, LOAD, DATA
  2 .bss          00000000  0000000000000000  0000000000000000  00000094  2**0
                  ALLOC
  3 .comment      0000002c  0000000000000000  0000000000000000  00000094  2**0
                  CONTENTS, READONLY
  4 .note.GNU-stack 00000000  0000000000000000  0000000000000000  000000c0  2**0
                  CONTENTS, READONLY
  5 .note.gnu.property 00000020  0000000000000000  0000000000000000  000000c0  2**3
                  CONTENTS, ALLOC, LOAD, READONLY, DATA
  6 .eh_frame     00000038  0000000000000000  0000000000000000  000000e0  2**3
                  CONTENTS, ALLOC, LOAD, RELOC, READONLY, DATA
```

```bash
$ objdump -h ab
ab:     file format elf64-x86-64
Sections:
Idx Name          Size      VMA               LMA               File off  Algn
  0 .note.gnu.property 00000020  00000000004001c8  00000000004001c8  000001c8  2**3
                  CONTENTS, ALLOC, LOAD, READONLY, DATA
  1 .text         00000084  0000000000401000  0000000000401000  00001000  2**0
                  CONTENTS, ALLOC, LOAD, READONLY, CODE
  2 .eh_frame     00000058  0000000000402000  0000000000402000  00002000  2**3
                  CONTENTS, ALLOC, LOAD, READONLY, DATA
  3 .data         00000004  0000000000404000  0000000000404000  00003000  2**2
                  CONTENTS, ALLOC, LOAD, DATA
  4 .comment      0000002b  0000000000000000  0000000000000000  00003004  2**0
                  CONTENTS, READONLY
```
发现ab是把a和b的各个section进行了整合，去掉了size为0的。

## 静态链接后，符号表的重定位情况
```bash
# a.o
Symbol table '.symtab' contains 6 entries:
   Num:    Value          Size Type    Bind   Vis      Ndx Name
     0: 0000000000000000     0 NOTYPE  LOCAL  DEFAULT  UND 
     1: 0000000000000000     0 FILE    LOCAL  DEFAULT  ABS a.c
     2: 0000000000000000     0 SECTION LOCAL  DEFAULT    1 .text
     3: 0000000000000000    53 FUNC    GLOBAL DEFAULT    1 main
     4: 0000000000000000     0 NOTYPE  GLOBAL DEFAULT  UND shared
     5: 0000000000000000     0 NOTYPE  GLOBAL DEFAULT  UND swap

# b.o
Symbol table '.symtab' contains 5 entries:
   Num:    Value          Size Type    Bind   Vis      Ndx Name
     0: 0000000000000000     0 NOTYPE  LOCAL  DEFAULT  UND 
     1: 0000000000000000     0 FILE    LOCAL  DEFAULT  ABS b.c
     2: 0000000000000000     0 SECTION LOCAL  DEFAULT    1 .text
     3: 0000000000000000     4 OBJECT  GLOBAL DEFAULT    2 shared
     4: 0000000000000000    79 FUNC    GLOBAL DEFAULT    1 swap

# ab
Symbol table '.symtab' contains 9 entries:
   Num:    Value          Size Type    Bind   Vis      Ndx Name
     0: 0000000000000000     0 NOTYPE  LOCAL  DEFAULT  UND 
     1: 0000000000000000     0 FILE    LOCAL  DEFAULT  ABS a.c
     2: 0000000000000000     0 FILE    LOCAL  DEFAULT  ABS b.c
     3: 0000000000401035    79 FUNC    GLOBAL DEFAULT    2 swap
     4: 0000000000404000     4 OBJECT  GLOBAL DEFAULT    4 shared
     5: 0000000000404004     0 NOTYPE  GLOBAL DEFAULT    4 __bss_start
     6: 0000000000401000    53 FUNC    GLOBAL DEFAULT    2 main
     7: 0000000000404004     0 NOTYPE  GLOBAL DEFAULT    4 _edata
     8: 0000000000404008     0 NOTYPE  GLOBAL DEFAULT    4 _end
```

a中的两个UND未定义的符号shared和swap在b中找到了，所以最后ab的符号表中没有UND的符号了（第0个跳过不用管）

这里额外补充知识：
- 符号的不同bind，local是当前文件能用的，global是全局的。在全局范围声明的符号（函数、变量）默认是global的例如`shared`变量和`swap`函数，而如果添加了`static`关键词修饰的就是`local`的，栈上的不是符号，所以`int a`不存在于符号表中。
- 除了a和b中的符号，ab还额外增加了__bss_start、_edata、_end这三个符号，我们暂时不用管。

## 静态链接后，汇编代码的情况
这是ab的汇编代码，我们可以对比前面列出的a.o和b.o的汇编，找下不同：
- lea 0x2fe2(%rip),%rdx # 404000 `<shared>` 这一行给rdx->rsi最终赋值的不再是0x0而是0x2fe2，后面注释表示这就是shared的符号地址。
```bash
$ objdump -d ab
ab:     file format elf64-x86-64
Disassembly of section .text:
0000000000401000 <main>:
  401000:       f3 0f 1e fa             endbr64 
  401004:       55                      push   %rbp
  401005:       48 89 e5                mov    %rsp,%rbp
  401008:       48 83 ec 10             sub    $0x10,%rsp
  40100c:       c7 45 fc 64 00 00 00    movl   $0x64,-0x4(%rbp)
  401013:       48 8d 45 fc             lea    -0x4(%rbp),%rax
  401017:       48 8d 15 e2 2f 00 00    lea    0x2fe2(%rip),%rdx        # 404000 <shared>
  40101e:       48 89 d6                mov    %rdx,%rsi
  401021:       48 89 c7                mov    %rax,%rdi
  401024:       b8 00 00 00 00          mov    $0x0,%eax
  401029:       e8 07 00 00 00          call   401035 <swap>
  40102e:       b8 00 00 00 00          mov    $0x0,%eax
  401033:       c9                      leave  
  401034:       c3                      ret    

0000000000401035 <swap>:
  401035:       f3 0f 1e fa             endbr64 
  401039:       55                      push   %rbp
  40103a:       48 89 e5                mov    %rsp,%rbp
  40103d:       48 89 7d f8             mov    %rdi,-0x8(%rbp)
  401041:       48 89 75 f0             mov    %rsi,-0x10(%rbp)
  401045:       48 8b 45 f8             mov    -0x8(%rbp),%rax
  401049:       8b 10                   mov    (%rax),%edx
  40104b:       48 8b 45 f0             mov    -0x10(%rbp),%rax
  40104f:       8b 00                   mov    (%rax),%eax
  401051:       31 c2                   xor    %eax,%edx
  401053:       48 8b 45 f8             mov    -0x8(%rbp),%rax
  401057:       89 10                   mov    %edx,(%rax)
  401059:       48 8b 45 f8             mov    -0x8(%rbp),%rax
  40105d:       8b 10                   mov    (%rax),%edx
  40105f:       48 8b 45 f0             mov    -0x10(%rbp),%rax
  401063:       8b 00                   mov    (%rax),%eax
  401065:       31 c2                   xor    %eax,%edx
  401067:       48 8b 45 f0             mov    -0x10(%rbp),%rax
  40106b:       89 10                   mov    %edx,(%rax)
  40106d:       48 8b 45 f0             mov    -0x10(%rbp),%rax
  401071:       8b 10                   mov    (%rax),%edx
  401073:       48 8b 45 f8             mov    -0x8(%rbp),%rax
  401077:       8b 00                   mov    (%rax),%eax
  401079:       31 c2                   xor    %eax,%edx
  40107b:       48 8b 45 f8             mov    -0x8(%rbp),%rax
  40107f:       89 10                   mov    %edx,(%rax)
  401081:       90                      nop
  401082:       5d                      pop    %rbp
  401083:       c3                      ret 
```
# 4 其他符号
在上面静态链接过程中我们看到了诸如`_end`这样的符号，虽然我们的目标文件中是没有这个符号定义的，但是静态链接之后就自动多出了这个符号。这是由链接器自动植入的，通常我们不需要理会他，`_end`的作用就是表示`.data`和`.bss`全局数据段的结尾地址，而`_edata`标识`.data`的结尾地址，`__bss_start`就更能从名字看出他的意思了。这三个符号我们不需要理会，对于用户来说没有特别的用途。

不过我们注意到上面进行链接的时候指定了`-e main`即入口函数为main，如果不做指定的话，入口函数是`_start`，如下，但是`_start`与`_end`不同，`_start`是个入口函数的地址，并且这个函数是由`crt`(例如glibc)提供的，如果不指定这些目标文件会获得如下报错，生成的ab文件中`_start`符号没有定义，无法正常使用。
```bash
$ ld -static -o ab a.o b.o 
ld: warning: cannot find entry symbol _start; defaulting to 0000000000401000
```
crt1.o（包含 _start）、crti.o（包含一些初始化代码）、crtn.o（包含终结代码）等，以及 libc.a 或 libc.so（C 库）,所以手动链接要包含`_start`符号是一个很长的指令串（多个crtx.o文件），所以建议直接用`gcc`指令自动链接这些`glibc`相关的目标文件。
```bash
$ gcc -statc -o ab a.o b.o
```
不过这样生成的`ab`文件符号多达上千个，因为将`libc`中各种符号都引入了，比如`brk``printf`等等还有一堆`_开头的`，对于学习静态链接过程来说没有帮助，我们就不展开说了。只需知道`_start`是程序的真正入口，该函数下会进行一系列的初始化准备工作，并最终调用`main`方法，通过`ld -e main ...`创建的二进制文件，是一种`nostd`的形式，是无法`./ab`来运行的~

感兴趣的话可以在代码中打印下这些符号的地址看看：
```c
extern _end char[];
int main() {
     printf("_end %X\n", _end);
}
```
# 5 段(Segment)与区(Section)
可能会在多个ELF场景下看到段和区的描述，他们往往很相似。我们上面介绍的都是目标文件的区section，而程序段segment和区是相似的东西，区的划分非常多，段为了更好的管理，和区不再一一映射，而是一个段会包含一个或多个区，段就是区最终映射到内存的形式。

区在elf的`section header`中通过-S查看，段则是存在`program header`通过`-l`如下，目标文件a.o b.o因为不是可执行的文件没有该部分，只有ab有，注意这里没有堆、栈这种段，这些是在程序运行时动态管理的内存。
```bash
$ readelf -l a.o
There are no program headers in this file.

$ readelf -l b.o
There are no program headers in this file.

$ readelf -l ab
Elf file type is EXEC (Executable file)
Entry point 0x401000
There are 7 program headers, starting at offset 64
Program Headers:
  Type           Offset             VirtAddr           PhysAddr
                 FileSiz            MemSiz              Flags  Align
  LOAD           0x0000000000000000 0x0000000000400000 0x0000000000400000
                 0x00000000000001e8 0x00000000000001e8  R      0x1000
  LOAD           0x0000000000001000 0x0000000000401000 0x0000000000401000
                 0x0000000000000084 0x0000000000000084  R E    0x1000
  LOAD           0x0000000000002000 0x0000000000402000 0x0000000000402000
                 0x0000000000000058 0x0000000000000058  R      0x1000
  LOAD           0x0000000000003000 0x0000000000404000 0x0000000000404000
                 0x0000000000000004 0x0000000000000004  RW     0x1000
  NOTE           0x00000000000001c8 0x00000000004001c8 0x00000000004001c8
                 0x0000000000000020 0x0000000000000020  R      0x8
  GNU_PROPERTY   0x00000000000001c8 0x00000000004001c8 0x00000000004001c8
                 0x0000000000000020 0x0000000000000020  R      0x8
  GNU_STACK      0x0000000000000000 0x0000000000000000 0x0000000000000000
                 0x0000000000000000 0x0000000000000000  RW     0x10

 Section to Segment mapping:
  Segment Sections...
   00     .note.gnu.property 
   01     .text 
   02     .eh_frame 
   03     .data 
   04     .note.gnu.property 
   05     .note.gnu.property 
   06   
```