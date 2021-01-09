package main

import (
	"context"
	"google.golang.org/grpc"
	"grpc-go/mygrpc"
	"net"
)

func main(){
	//createServer()
	createClient()
}

func createServer(){
	s,_:= net.Listen("tcp", ":9999")

	myService := mygrpc.MyService{}

	grpcServer := grpc.NewServer()

	mygrpc.RegisterAddServiceServer(grpcServer, &myService)

	_ = grpcServer.Serve(s)
}


func createClient(){
	conn,_ := grpc.Dial("127.0.0.1:9999", grpc.WithInsecure())

	c := mygrpc.NewAddServiceClient(conn)

	req := mygrpc.AddRequest{
		A: 99,
		B: 98,
	}

	reply,_ := c.Add(context.Background(), &req)

	println(reply.Res)
}