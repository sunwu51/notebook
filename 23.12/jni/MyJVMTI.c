#include <jni.h>
#include <jvmti.h>
#include <string.h>
#include "com_jvmti_JVMTIDemo.h"

static jvmtiIterationControl JNICALL tagInstance(jlong class_tag, jlong size, jlong* tag_ptr, void* user_data) {
    int* totalCount = (int*)user_data;
    if (*totalCount > 100) {
        return JVMTI_ITERATION_ABORT;
    }
    (*totalCount)++;
    *tag_ptr = 1;
    return JVMTI_ITERATION_CONTINUE;
}

JNIEXPORT jobjectArray JNICALL Java_com_jvmti_JVMTIDemo_getInstance
(JNIEnv* env, jobject instance, jclass cls) {
    jvmtiEnv* jvmti;
    JavaVM* vm;
    (*env)->GetJavaVM(env, &vm);

    (*vm)->GetEnv(vm, (void**)&jvmti, JVMTI_VERSION_1_0);

    jvmtiCapabilities capabilities;
    memset(&capabilities, 0, sizeof(jvmtiCapabilities));
    capabilities.can_tag_objects = 1;
    (*jvmti)->AddCapabilities(jvmti, &capabilities);

    int totalCount = 0;
    jlong tag = 1;
    jint count;
    jobject* instances;
    // 遍历所有class类的instance，最多遍历十个对象
    (*jvmti)->IterateOverInstancesOfClass(jvmti, cls, JVMTI_HEAP_OBJECT_EITHER, &tagInstance, &totalCount);
    (*jvmti)->GetObjectsWithTags(jvmti, 1, &tag, &count, &instances, NULL);
    // count 应该等于 totalCount
    jobjectArray result = (*env)->NewObjectArray(env, totalCount, cls, NULL);
    for (int i = 0; i < count; i++) {
        (*env)->SetObjectArrayElement(env, result, i, instances[i]);
        (*jvmti)->SetTag(jvmti, instances[i], 0);
    }
    (*jvmti)->Deallocate(jvmti, (unsigned char*)instances);
    return result;
}


// #include <jni.h>
// #include <jvmti.h>
// #include "com_jvmti_JVMTIDemo.h"

// static jvmtiIterationControl JNICALL tagInstance(jlong class_tag, jlong size, jlong* tag_ptr, void* user_data) {
//     int* totalCount = (int *)user_data;
//     if (*totalCount > 100) {
//         return JVMTI_ITERATION_ABORT;
//     }
//     (*totalCount) ++;
//     *tag_ptr = 1;
//     return JVMTI_ITERATION_CONTINUE;
// }

// JNIEXPORT jobjectArray JNICALL Java_com_jvmti_JVMTIDemo_getInstance
//   (JNIEnv* env, jobject instance, jclass cls) {
//     jvmtiEnv *jvmti;
//     JavaVM* vm;
//     env->GetJavaVM(&vm);

//     vm->GetEnv((void**)&jvmti, JVMTI_VERSION_1_0);

//     jvmtiCapabilities capabilities = {0};
//     capabilities.can_tag_objects = 1;
//     jvmti->AddCapabilities(&capabilities);

//     int totalCount = 0;
//     jlong tag = 1;
//     jint count;
//     jobject* instances;
//     // 遍历所有class类的instance，最多遍历十个对象
//     jvmti->IterateOverInstancesOfClass(cls, JVMTI_HEAP_OBJECT_EITHER, &tagInstance, &totalCount); 
//     jvmti->GetObjectsWithTags(1, &tag, &count, &instances, NULL);
//     // count 应该等于 totalCount
//     jobjectArray result = env->NewObjectArray(totalCount, cls, NULL);
//     for (int i = 0; i < count; i++) {
//         env->SetObjectArrayElement(result, i, instances[i]);
//         jvmti->SetTag(&instance[i], 0);
//     }
//     jvmti->Deallocate((unsigned char*)instances);
//     return result;
// }


