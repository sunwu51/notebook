package com.company;

import java.io.FileInputStream;
import java.io.IOException;

public class Main {

    public static void main(String[] args) throws Exception {

    }
    static void test1() throws Exception {
        String c = "啊";

        System.out.println(byteToHex(c.getBytes("utf-8")));
        System.out.println(byteToHex(c.getBytes("gb2312")));
        System.out.println(byteToHex(c.getBytes("gbk")));
        System.out.println(byteToHex(c.getBytes("gb18030")));
    }
    static void test2() throws IOException {
        FileInputStream fs = new FileInputStream("1.txt");
        byte[] buff = new byte[29];
        int l =0;
        while ( (l =fs.read(buff)) > 0){
            System.out.println(new String(buff,0,l));
        }
    }

    static String byteToHex(byte[] bytes){
        String strHex = "";
        StringBuilder sb = new StringBuilder("");
        for (int n = 0; n < bytes.length; n++) {
            strHex = Integer.toHexString(bytes[n] & 0xFF).toUpperCase();
            sb.append("0x");
            sb.append((strHex.length() == 1) ? "0" + strHex : strHex);
            sb.append(" ");
        }
        return sb.toString().trim();
    }
}
