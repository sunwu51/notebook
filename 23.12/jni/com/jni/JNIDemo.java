package com.jni;

public class JNIDemo {

    private native int add(int a, int b);

    static {
        System.loadLibrary("MyJNI");
    }

    public static void main(String[] args) {
        int s = new JNIDemo().add(1, 1);
        System.out.println(s);
    }
}