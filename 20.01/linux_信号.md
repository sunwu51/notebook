# signal
通过kill -l可以查看linux下的所有信号列表，主要有64种
```shell
 1) SIGHUP	 2) SIGINT	 3) SIGQUIT	 4) SIGILL	 5) SIGTRAP
 6) SIGABRT	 7) SIGBUS	 8) SIGFPE	 9) SIGKILL	10) SIGUSR1
11) SIGSEGV	12) SIGUSR2	13) SIGPIPE	14) SIGALRM	15) SIGTERM
16) SIGSTKFLT	17) SIGCHLD	18) SIGCONT	19) SIGSTOP	20) SIGTSTP
21) SIGTTIN	22) SIGTTOU	23) SIGURG	24) SIGXCPU	25) SIGXFSZ
26) SIGVTALRM	27) SIGPROF	28) SIGWINCH	29) SIGIO	30) SIGPWR
31) SIGSYS	34) SIGRTMIN	35) SIGRTMIN+1	36) SIGRTMIN+2	37) SIGRTMIN+3
38) SIGRTMIN+4	39) SIGRTMIN+5	40) SIGRTMIN+6	41) SIGRTMIN+7	42) SIGRTMIN+8
43) SIGRTMIN+9	44) SIGRTMIN+10	45) SIGRTMIN+11	46) SIGRTMIN+12	47) SIGRTMIN+13
48) SIGRTMIN+14	49) SIGRTMIN+15	50) SIGRTMAX-14	51) SIGRTMAX-13	52) SIGRTMAX-12
53) SIGRTMAX-11	54) SIGRTMAX-10	55) SIGRTMAX-9	56) SIGRTMAX-8	57) SIGRTMAX-7
58) SIGRTMAX-6	59) SIGRTMAX-5	60) SIGRTMAX-4	61) SIGRTMAX-3	62) SIGRTMAX-2
63) SIGRTMAX-1	64) SIGRTMAX	
```
# 常见的几个信号
`Ctl+C`对应的是2号即SIGINT信号，`kill pid`对应的是15号SIGTERM信号，`kill -9 pid`对应的是9号SIGKILL信号。

INT和TERM信号都可以被程序捕捉并处理，使程序不会被杀死。例如java中可以这样捕捉
```java
    public static void main(String[] args) throws InterruptedException {
        Signal.handle(new Signal("INT"), new SignalHandler() {
            public void handle(Signal signal) {
                System.out.println(signal.toString() + " catched");
            }
        });
        Signal.handle(new Signal("TERM"), new SignalHandler() {
            public void handle(Signal signal) {
                System.out.println(signal.toString() + " catched");
            }
        });

        while(true) {
            Thread.sleep(1000L);
            System.out.println(123);
        }
    }
```