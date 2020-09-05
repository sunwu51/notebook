package com.xxx.ddd;

import java.io.*;
import java.nio.ByteBuffer;
import java.nio.channels.Channel;
import java.nio.file.Files;

/**
 * @author Frank
 * @date 2020/9/5 17:08
 */
public class IoTest1 {
    public static void main(String[] args) throws IOException {
        File file = new File("pom.xml");
        FileReader fr = new FileReader(file);
        BufferedReader br = new BufferedReader(fr);
        String a;
        while((a = br.readLine())!=null){
            System.out.println(a);
        }
    }
}
