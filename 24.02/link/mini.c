// 裸机程序示例，使用 _start 作为程序入口
// 注意：这是在 Linux x86_64 架构下的示例
// 编译命令: gcc -nostdlib -nostartfiles -o mini mini.c

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