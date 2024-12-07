public class Demo {
    public static native int divide(int a, int b);
    public static native String toLowcase(String str);
    static {
        System.load("C:\\Users\\sunwu\\Desktop\\base\\gateway\\notebook\\24.12\\demo\\target\\release\\demo.dll");

        // System.load("C:\\Users\\sunwu\\Desktop\\base\\gateway\\notebook\\24.12\\libDemo.dll");
    }
    public static void main(String[] args) throws Exception{
        System.out.println(toLowcase("ABC"));
        // try {
        //     Thread thread = new Thread(()-> {
        //         System.out.println(divide(10, 2));
        //         System.out.println(divide(10, 0));
        //     });
        //     thread.start();
        // } catch (Throwable t) {
        //     System.out.println("Error " + t);
        // }
        // Thread.sleep(10000L);
        // System.out.println("finish main");
    }    
}
