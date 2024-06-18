use warp::Filter;
use std::net::SocketAddr;
use tokio::runtime::Runtime;

// 引入生成的绑定文件
include!("bindings.rs");


#[no_mangle]
pub extern "C" fn Java_RustHttpServer_startServer(env: JNIEnv, _class: jclass, port: jint) {
    let runtime = Runtime::new().unwrap();

    runtime.block_on(async move {
        let hello = warp::path::end()
            .map(|| "Hello, World!");

        let addr = SocketAddr::from(([127, 0, 0, 1], port as u16));
        warp::serve(hello)
            .run(addr)
            .await;
    });
}