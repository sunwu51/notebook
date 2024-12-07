#include <jni.h>
#include <stdexcept>
extern "C" JNIEXPORT jint JNICALL Java_Demo_divide
  (JNIEnv *env, jclass clz, jint a, jint b) {
    try {
        return a /b;
    } catch (const std::runtime_error &e) {
        env->ThrowNew(env->FindClass("java/lang/ArithmeticException"), e.what());
        return 0;
    }
}