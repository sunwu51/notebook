#include <jni.h>
#include "com_jni_JNIDemo.h"

// JNIEXPORT是一个宏定义用来输入JNI格式， jint是返回值类型，是java中的int
// JNICALL：也是一个宏定义，用于指定函数调用约定，函数名Java_<全限定类名>_<方法名>
// 参数前2个分别是jni的环境，java中this对象和两个入参jint类型的a，b
JNIEXPORT jint JNICALL Java_com_jni_JNIDemo_add
  (JNIEnv * env, jobject instance, jint a, jint b) {
    return a + b;
}