import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>();
        Scanner sc = new Scanner(System.in);
        while (true) {
            int cmd = sc.nextInt();
            switch (cmd) {
                case 1:
                    for (int i = 0; i< 10_000_000; i++) {
                        list.add("i=" + i);
                    }
                    System.out.println("add finish, current size " + list.size());
                    break;
                case 0:
                    list.clear();
                    System.out.println("clear finish");
                default:
                    break;
            }
        }
    }
}
