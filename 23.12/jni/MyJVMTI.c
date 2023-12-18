#include <jni.h>
#include <jvmti.h> # 注意引入jvmti
#include "com_jvmti_JVMTIDemo.h"

JNIEXPORT jobjectArray JNICALL Java_com_jvmti_JVMTIDemo_getInstance
  (JNIEnv * env, jobject instance, jclass cls) {
    jvmtiEnv *jvmti;
    (*env)->GetJavaVM(env, &jvmti); // 获取Java虚拟机实例
    (*jvmti)->GetEnv(jvmti, (void **)&jvmti, JVMTI_VERSION_1_2); // 获取JVMTI环境实例


    jobjectArray instancesArray = (*env)->NewObjectArray(env, 10, cls, NULL);
    (*jvmti)->IterateOverInstancesOfClass(jvmti, cls, JVMTI_HEAP_OBJECT_EITHER, &tagInstance, null); 
    jlong tag = 1;
    jint count;
    jobject* instances;
    jvmti->GetObjectsWithTags(1, &tag, &count, &instances, NULL);
    printf("Found %d objects with tag\n", count);
    jobjectArray result = env->NewObjectArray(count, targetClazz, NULL);
    for (int i = 0; i < count; i++) {
        env->SetObjectArrayElement(result, i, instances[i]);
    }

    jvmti->Deallocate((unsigned char*)instances);
    return result;
}

static jvmtiIterationControl JNICALL tagInstance(jlong class_tag, jlong size, jlong* tag_ptr, void* user_data) {
    *tag_ptr = 1;
    return JVMTI_ITERATION_CONTINUE;
}

static jvmtiIterationControl JNICALL addInstanceToArray(jlong class_tag, jlong size, jlong* tag_ptr, void* user_data) {
    jobjectArray instancesArray = (jobjectArray)user_data;
    JNIEnv* env;
    (*jvm)->GetEnv(jvm, (void **)&env, JNI_VERSION_1_2); // 获取JNI环境实例

    jclass instanceClass = (*env)->GetObjectClass(env, instancesArray); // 获取数组元素的类
    jobject instance = (*env)->AllocObject(env, instanceClass); // 分配一个新的实例对象

    // 设置实例对象的属性等操作

    (*env)->SetObjectArrayElement(env, instancesArray, (*instancesCount)++, instance); // 将实例对象添加到数组中
    return JVMTI_ITERATION_CONTINUE;
}

