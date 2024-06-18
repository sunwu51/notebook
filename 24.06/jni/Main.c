#include <jni.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include "Main.h"

JNIEXPORT void JNICALL Java_Main_native_1hello
  (JNIEnv * env, jclass cls) {
    printf("Hello JNI!\n");
}

JNIEXPORT jint JNICALL Java_Main_add
    (JNIEnv * env, jobject instance, jint a, jint b) {
    return a + b;
}

JNIEXPORT jstring JNICALL Java_Main_hi
  (JNIEnv * env, jobject instance, jstring javaString) {
    char* hello = "Hello,";
    const char* name = (*env)->GetStringUTFChars(env, javaString, 0);
    size_t len = strlen(hello) + strlen(name) + 1;
    char* result = (char*)malloc(len);
    strcpy(result, hello);
    strcat(result, name);
    (*env)->ReleaseStringUTFChars(env, javaString, name);
    return (*env)->NewStringUTF(env, result);
}
