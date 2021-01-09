package a.b.c;

import io.grpc.ServerBuilder;
import io.grpc.stub.StreamObserver;

import java.io.IOException;

import static io.grpc.stub.ServerCalls.asyncUnimplementedUnaryCall;

/**
 * @author Frank
 * @date 2021/1/9 16:24
 */
public class AddServer extends AddServiceGrpc.AddServiceImplBase {
    public static void main(String[] args) throws IOException {
        ServerBuilder.forPort(9999)
                .addService(new AddServer())
                .build()
                .start();
        System.out.println("server start at 9999");
        while (true){

        }
    }

    public void add(AddRequest request, StreamObserver<AddReply> responseObserver) {
        int res = myAdd(request.getA(),request.getB());
        responseObserver.onNext(AddReply.newBuilder().setRes(res).build());
        responseObserver.onCompleted();
    }

    private int myAdd(int a, int b){
        return a + b;
    }
}
