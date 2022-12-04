package com.example.iotest.demo;

import java.io.BufferedWriter;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;

@SpringBootApplication
public class DemoApplication implements CommandLineRunner {

	String url = "https://jsonplaceholder.typicode.com/comments";
	int size = 10000;

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		// TODO Auto-generated method stub

		// v1();
		v2();
		// v3();
		System.exit(0);
	}


	// v1版：单线程阻塞io，最慢的方式来观察执行时间的基准值。500s+
	private void v1() throws Exception {
		RestTemplate restTemplate = new RestTemplate();
		BufferedWriter bw = new BufferedWriter(new FileWriter("java_v1.txt"));
		
		System.out.println("v1开始---");
		long start =System.currentTimeMillis();
		for (int i = 0; i < size; i++) {
			String res = restTemplate.getForObject(url, String.class);
			bw.append(res);
		}
        bw.close();
		long end = System.currentTimeMillis();
		System.out.println("串行执行时间：" + (end - start));// 串行执行时间：515747
	}


	// v2版：线程池执行，需要自己通过计数器来判断是不是都执行完成了。 执行50s+
	private void v2() throws Exception {
		ExecutorService pool = Executors.newFixedThreadPool(300);
		RestTemplate restTemplate = new RestTemplate();
		BufferedWriter bw = new BufferedWriter(new FileWriter("java_v2.txt"));
		System.out.println("v2开始---");
		long start =System.currentTimeMillis();

		CountDownLatch count = new CountDownLatch(size);
		for (int i = 0; i < size; i++) {
            pool.execute(()->{
				try {
					String res = restTemplate.getForObject(url, String.class);
					bw.append(res);
				} catch (Exception e) {
					e.printStackTrace();
				} finally {
					count.countDown();
				}
			});
		}
		count.await();
		bw.close();
		long end = System.currentTimeMillis();
		System.out.println("多线程池执行时间：" + (end - start));//多线程池执行时间：54208
	}


	// v3版本使用WebClient，多路io复用的进行网络请求。但是java的文件io只能是同步的
	private void v3() throws Exception {
		WebClient webClient = WebClient.create(url);

		CountDownLatch count = new CountDownLatch(size);
		System.out.println("v3开始---");
		long start = System.currentTimeMillis();

		for (int i = 0; i < size; i++) {
			Mono<String> monoRes = webClient.get().retrieve().bodyToMono(String.class);
			monoRes.subscribe(str -> {
				try {
					// Files.writeString(Paths.get("java_v3.txt"), str, StandardOpenOption.APPEND);
				} catch (Exception e) {
					e.printStackTrace();
				} finally {
					count.countDown();
				}
			});
		}
		count.await();
		long end = System.currentTimeMillis();
		System.out.println("mono执行时间：" + (end - start));//mono执行时间：54208
	}

}
