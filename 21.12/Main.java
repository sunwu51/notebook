package com.example.demo;


import java.util.*;

public class Main {

    /**
     * 如何用可读的字符串来表示字节流 byte[]
     * Base64
     * @param args
     * @throws Exception
     */

    public static void main(String[] args) throws Exception{
        byte[] b1 = base64Decode("Nw==");
        byte[] b2 = base64Decode("N0==");

//        byte[] bytes = new byte[]{55}; //
//        String str = base64Encode(bytes);
//        System.out.println(str);
//        byte[] bytes2 = base64Decode(str);
        System.out.println(Arrays.equals(b1, b2));
    }
    // 8bit 6bit + 6bit 多了4bit ==
    // 16bit 12bit + 6bit 多了2bit =
    // 多1bit? 6xn - 8xm = 2/4

    static char[] chars = new char[64];
    static
    {
        for(int i=0;i<26;i++) chars[i] = (char) ('A' + i);
        for(int i=0;i<26;i++) chars[26+i] = (char) ('a' + i);
        for(int i=0;i<10;i++) chars[26+26+i] = (char) ('0' + i);
        chars[62] = '+';
        chars[63] = '/';
    }
    static String base64Encode(byte[] bytes){
        if(bytes == null || bytes.length == 0){
            return null;
        }
        StringBuilder sb = new StringBuilder();
        // ... 10101010 10110011 ...
        // 111 7
        byte pre = 0;
        int preLeft = 0;
        for(int i=0; i<bytes.length; i++){
            byte cur = bytes[i];
            int b = (cur>>(8-6+preLeft))  +  ( (pre & ((1<<preLeft)-1)) << (6-preLeft) );
            sb.append(chars[b]);

            pre = cur;
            preLeft = 8-6+preLeft;

            if(preLeft == 6){
                sb.append(chars[cur & ((1<<6)-1)]);
                pre = 0;
                preLeft = 0;
            }
        }
        if(preLeft != 0){
            int b = ((pre &  ((1<<preLeft)-1)) << (6-preLeft));
            sb.append(chars[b]).append("=");
            if(preLeft == 2){
                sb.append("=");
            }
        }
        return sb.toString();
    }

    static byte[] base64Decode(String str){
        if(str == null || str.length() ==0){
            return null;
        }
        int len = str.length();
        if(len*6%8 != 0){
            throw new RuntimeException("illegal base64 string");
        }

        int paddingCount = 0;
        if(str.charAt(len-1) == '='){
            paddingCount++;
            if(str.charAt(len-2) == '='){
                paddingCount++;
            }
        }

        byte[] res = new byte[ (len-paddingCount)*6/8 ];

        int j = res.length -1;
        int jBitCount = 0;
        for(int i=len-paddingCount-1; i>=0; i--){
            char c = str.charAt(i);
            int indexc = -1;
            if(c>='A' && c<='Z') indexc = c-'A';
            else if(c>='a' && c<='z') indexc = c-'a' + 26;
            else if(c>='0' && c<='9') indexc = c-'0' + 52;
            else if(c == '+') indexc=62;
            else if(c == '/') indexc=63;
            else throw new RuntimeException("illegal base64 string");

            if(i == len-paddingCount-1){
                res[j] += (byte)(indexc>> (paddingCount*2));
                jBitCount = 6 - paddingCount*2;
                continue;
            }

            res[j] += (indexc<<jBitCount) & 0xff;

            if(jBitCount>=2){
                if(--j<0)break;
                res[j] += indexc>>(8-jBitCount);
            }

            jBitCount = (jBitCount+6) % 8;

        }
        return res;
    }
}