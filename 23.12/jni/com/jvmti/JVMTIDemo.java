package com.jvmti;

import java.util.*;

public class JVMTIDemo {
    static { System.loadLibrary("MyJVMTI");}
    private native Object[] getInstance(Class cls);

    public static void main(String[] args) {
        List<A> list= new ArrayList<>(); 
        for (int i = 0; i < 10; i++) {
            A a = new A();
            System.out.println(a.hashCode());
            list.add(a);
        }

        for(Object obj : new JVMTIDemo().getInstance(A.class)) {
            System.out.println(obj.hashCode());
        }
    }
}
class A {}