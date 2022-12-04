package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"sync"
	"time"
)

var URL string = "https://jsonplaceholder.typicode.com/comments"
var wg sync.WaitGroup  // 定义全局的结构体变量

func main() {
	start := time.Now()
	wg.Add(10000)
	for i := 0; i < 10000; i++ {
		go run()
	}
	wg.Wait()  // 阻塞父协程
	end := time.Now()
	fmt.Printf("执行时间%d\n", end.Sub(start) / 1000_000)


}

func run() {
	defer wg.Done()

	resp,_ := http.Get(URL)
	defer resp.Body.Close()

	body,_:= ioutil.ReadAll(resp.Body)

	file, _ := os.OpenFile("go.txt", os.O_CREATE|os.O_APPEND|os.O_RDWR, 0644)
	defer file.Close()

	file.Write(body)
}