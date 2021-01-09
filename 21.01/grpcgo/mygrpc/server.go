package mygrpc

import "context"

type MyService struct {
}

func (s *MyService) Add(ctx context.Context, req *AddRequest) (*AddReply, error){
	res := myAdd(req.A, req.B)
	return &AddReply{Res:res}, nil
}

func myAdd(a int32, b int32) int32{
	return a+b
}