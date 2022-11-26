package main

import "fmt"
import "os/user"

func main() {
	u, _ := user.Current()
	fmt.Println(u.Username)
}