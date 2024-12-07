#[macro_use]
extern crate jni;

use jni::JNIEnv;
use jni::objects::{JClass, JString};
use jni::sys::{jint, jstring};
use std::panic::{self, AssertUnwindSafe};

#[no_mangle]
pub extern "C" fn Java_Demo_divide(mut env: JNIEnv, _class: JClass, a: jint, b: jint) -> jint {
    panic::set_hook(Box::new(|_| {}));

    let res = panic::catch_unwind(|| {
        env.exception_check().unwrap();
        return a / b;
    });

    match res {
        Ok(x) => x,
        Err(_) => {
            env.throw_new("java/lang/ArithmeticException", "Divide by zero").unwrap();
            return 0;
        },
    }
}

#[no_mangle]
#[deny(unconditional_panic)]
pub extern "C" fn Java_Demo_toLowcase(mut env: JNIEnv, _class: JClass, s: JString) -> jstring {
    panic::set_hook(Box::new(|_| {}));

    let res = panic::catch_unwind(AssertUnwindSafe(|| {
        let res = env.get_string(&s).unwrap().to_str().unwrap().to_lowercase();
        let mut a = vec![1,2,3];
        a[4] = 4;
        let res = env.new_string(res).expect("Couldn't create java string");
        
        res.into_raw()
    }));
    match res {
        Ok(x) => x,
        Err(err) => {
            let mut msg = "native method error.".to_string();
            if let Some(s) = err.downcast_ref::<&str>() {
                msg.push_str(s);
            } else if let Some(s) = err.downcast_ref::<String>() {
                msg.push_str(s);
            }
            env.throw_new("java/lang/RuntimeException", msg).unwrap();
            return std::ptr::null_mut();
        },
    }
    // let res = panic::catch_unwind(|| {
    //     env.exception_check().unwrap();
    //     return a / b;
    // });

    // match res {
    //     Ok(x) => x,
    //     Err(_) => {
    //         env.throw_new("java/lang/ArithmeticException", "Divide by zero").unwrap();
    //         return 0;
    //     },
    // }
}