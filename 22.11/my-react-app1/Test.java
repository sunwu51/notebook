import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

public class Test {

  public static void main(String[] args) {
    DateTimeFormatter out = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:00:00X");
    DateTimeFormatter in = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    LocalDateTime time = LocalDateTime.parse("2022-11-11 11:22:11", in);
    ZonedDateTime ztime = time.atZone(ZoneId.of("UTC"));

    System.out.println(time);

    System.out.println(ztime.format(out));
  }

}

{"StreamConfig":{},"State":{"Running":false,"Paused":false,"Restarting":false,"OOMKilled":false,"RemovalInProgress":false,"Dead":false,"Pid":0,"ExitCode":0,"Error":"","StartedAt":"2022-11-15T15:07:05.446144287Z","FinishedAt":"2022-11-15T15:23:22.488193096Z","Health":null},"ID":"18d7d449558445c62ca80e43f3e7cb0322274f00c1c163a964c21444a0e2bcb3","Created":"2022-11-15T14:02:58.593916384Z","Managed":false,"Path":"/usr/bin/entrypoint.sh","Args":["--bind-addr","0.0.0.0:443",".","--cert","/licence/code-server.crt","--cert-key","/licence/code-server.key"],"Config":{"Hostname":"18d7d4495584","Domainname":"","User":"root","AttachStdin":false,"AttachStdout":true,"AttachStderr":true,"ExposedPorts":{"443/tcp":{},"8080/tcp":{}},"Tty":false,"OpenStdin":false,"StdinOnce":false,"Env":["PASSWORD=123456","PATH=/root/.sdkman/candidates/java/current/bin:/root/.nvm/versions/node/v14.19.1/bin/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin","LANG=en_US.UTF-8","ENTRYPOINTD=/entrypoint.d","USER=coder","NODE_VERSION=14.19.1","NVM_DIR=/root/.nvm","SDKMAN_DIR=/root/.sdkman","JAVA_HOME=/root/.sdkman/candidates/java/current"],"Cmd":null,"Image":"sunwu51/code-server","Volumes":null,"WorkingDir":"/home/coder","Entrypoint":["/usr/bin/entrypoint.sh","--bind-addr","0.0.0.0:443",".","--cert","/licence/code-server.crt","--cert-key","/licence/code-server.key"],"OnBuild":null,"Labels":{}},"Image":"sha256:a649199539ba9fc90a377e1e050e362c06e71f3da63a80ba521485042cbccfd7","NetworkSettings":{"Bridge":"","SandboxID":"d6adc5e7019509f8a11f29ead27f6ff930c2dc5d5821cbab78045c836a535a64","HairpinMode":false,"LinkLocalIPv6Address":"","LinkLocalIPv6PrefixLen":0,"Networks":{"bridge":{"IPAMConfig":null,"Links":null,"Aliases":null,"NetworkID":"ac4452716e4219e0d42168929aae7a33dde5bb1db8ec723f0bcb30675e5ef1cb","EndpointID":"","Gateway":"","IPAddress":"","IPPrefixLen":0,"IPv6Gateway":"","GlobalIPv6Address":"","GlobalIPv6PrefixLen":0,"MacAddress":"","DriverOpts":null,"IPAMOperational":false}},"Service":null,"Ports":null,"SandboxKey":"/var/run/docker/netns/d6adc5e70195","SecondaryIPAddresses":null,"SecondaryIPv6Addresses":null,"IsAnonymousEndpoint":true,"HasSwarmEndpoint":false},"LogPath":"/var/lib/docker/containers/18d7d449558445c62ca80e43f3e7cb0322274f00c1c163a964c21444a0e2bcb3/18d7d449558445c62ca80e43f3e7cb0322274f00c1c163a964c21444a0e2bcb3-json.log","Name":"/dreamy_mirzakhani","Driver":"overlay2","OS":"linux","MountLabel":"","ProcessLabel":"","RestartCount":0,"HasBeenStartedBefore":true,"HasBeenManuallyStopped":true,"MountPoints":{},"SecretReferences":null,"ConfigReferences":null,"AppArmorProfile":"docker-default","HostnamePath":"/var/lib/docker/containers/18d7d449558445c62ca80e43f3e7cb0322274f00c1c163a964c21444a0e2bcb3/hostname","HostsPath":"/var/lib/docker/containers/18d7d449558445c62ca80e43f3e7cb0322274f00c1c163a964c21444a0e2bcb3/hosts","ShmPath":"","ResolvConfPath":"/var/lib/docker/containers/18d7d449558445c62ca80e43f3e7cb0322274f00c1c163a964c21444a0e2bcb3/resolv.conf","SeccompProfile":"","NoNewPrivileges":false,"LocalLogCacheMeta":{"HaveNotifyEnabled":false}}