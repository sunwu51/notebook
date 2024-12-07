#include <jni.h>
#include <stdio.h>
#include <setjmp.h>
#include <signal.h>
#include <pthread.h>
#include <unistd.h>

jmp_buf global_exception;
struct ErrorContext {
    int code;
    char msg[256];
};

void signal_handler(int signum) {
    longjmp(global_exception, signum);
}
JNIEXPORT jint JNICALL Java_Demo_divide
  (JNIEnv *env, jclass clz, jint a, jint b) {
    signal(SIGSEGV, signal_handler);
    struct ErrorContext ctx = {0};
    // 设置异常捕获点
    int exception = setjmp(global_exception);
    if (exception == 0) {
        int *p = NULL;
        *p = 10;
        return 1;
    } else {
        // 异常处理
        ctx.code = exception;
        snprintf(ctx.msg, sizeof(ctx.msg), 
                 "Caught signal: %d", exception);
        
        // 记录日志
        fprintf(stderr, "Error: %s\n", ctx.msg);
        return 0;
    }
}