public class Main {
    static {
        System.load("C:/Users/sunwu/Desktop/base/gateway/notebook/24.06/jni/libMyJNI.dll");
    }

    public static native void native_hello();
    public native int add(int a, int b);

    public native String hi(String name);

    public static void main(String[] args) {
        native_hello();
        System.out.println(new Main().add(1, 1));
        System.out.println(new Main().hi("frank"));
    }
}