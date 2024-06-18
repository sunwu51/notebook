public class RustHttpServer {
    static {
        System.load("C:\\Users\\sunwu\\Desktop\\base\\gateway\\n" + //
                        "otebook\\24.06\\rust-jni\\target\\release\\rust_jni.dll");
    }

   
    public native void startServer(int port);

    public static void main(String[] args) {
        RustHttpServer server = new RustHttpServer();
        System.out.println("start http server at localhost:3030");
        server.startServer(3030);
    }
}