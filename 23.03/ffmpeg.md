# ffmpeg
# 1 介绍视频格式与编码
视频格式，例如我们常见的`mp4`,`mkv`,`mov`,`flv`,`avi`,`wmv`等等，他们其实都是容器，这个容器里面包裹了`视频流`,`音频流`,`字幕`,`其他流`等内容，当然不一定所有的部分都有数据，例如可能没有字幕。

多条：对于同一种流，也可能有多条，例如某些电影文件就有多条音频流，中文和英文的音轨，也可能有多个语言的字幕。

编码：对于每一种流，他们本质上都是文件的字节码，所以需要有一种规定好的编码方式，事先声明在特定的位置，这样播放器才能用专门的解码器播放。常见的视频编码例如`h264`,`h265(又叫hevc)`,`vp9`等等，常见的音频编码例如`aac`,`mp3`等等，常见的字幕有`SRT`,`ASS`等。

容器中各部分的编码不是随意搭配的，一种容器一般支持不止一种编码方式，但是也不是任意编码都能支持的，有如下搭配。

![image](https://i.imgur.com/IEY9hfR.png)

# 2 使用ffmpeg转码
ffmpeg的安装非常简单，官网即可下载二进制文件。

ffmpeg最常见的功能就是用来转码，他可以修改容器格式，也可以修改某一个流的编码方式。

例如最常见的指令如下，将mkv文件转mp4
```bash
$ ffmpeg -i in.mkv out.mp4
```
如果想查看当前文件的信息，例如用了什么编码，分辨率等，则去掉out.mp4即可
```bash
$ ffmpeg -i in.mkv
```
例如下面输出显示`片头.mov`文件有两个stream分别是一个视频流1080P60FPS，码率是301kb，编码是264编码；还有一个音频流是48k采样率，127kb码率，aac编码的。

![image](https://i.imgur.com/3HYHmR0.png)

例如pr软件不支持mkv格式的素材，可以用该指令转换。但该指令会将视频流和音频流都重新编码一遍，如果是电影的话，编码时间可能要很久。

## 2.1 指定编码方式-c
比如mkv文件的视频流可能本来就是`H264`编码的，因为`mp4`容器也支持该编码，所以不需要对视频流重新编码的，此时可以指定更详细的对音视频流的编码参数。
```bash
# -c:v指定视频流编码器 copy是指不重新编码直接copy源视频流
$ ffmpeg -i in.mkv -c:v copy out.mp4
```
如果不指定编码的情况下，会用mp4这种容器的默认音视频编码器进行编码。

当然如果有指定编码的要求的话，也可以在指定，下面就是视频用264，音频用mp3，最终拼成mp4容器。
```bash
$ ffmpeg -i in.mkv -c:v libx264 -c:a libmp3lame out.mp4
```
这里的`libx264`和`libmp3lame`怎么来的呢，可以通过`ffmpeg -codecs`来查看当前机器支持的编解码器，可能会非常多可以筛选一下。例如想知道能nv显卡加速的编码有哪些，可以过滤`nvenc`来查看。
```bash
$ ffmpeg -codecs|findstr nvenc

DEV.L. av1                  Alliance for Open Media AV1 (decoders: libdav1d libaom-av1 av1 av1_cuvid av1_qsv ) (encoders: libaom-av1 librav1e libsvtav1 av1_nvenc av1_qsv av1_amf )

 DEV.LS h264                 H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10 (decoders: h264 h264_qsv h264_cuvid ) (encoders: libx264 libx264rgb h264_amf h264_mf h264_nvenc h264_qsv )

 DEV.L. hevc                 H.265 / HEVC (High Efficiency Video Coding) (decoders: hevc hevc_qsv hevc_cuvid ) (encoders: libx265 hevc_amf hevc_mf hevc_nvenc hevc_qsv )
```
我们发现264和265都可以用nv显卡加速(当然你得是有nv显卡的机器才能显示上面，否则是没有)，上面的后面括号中展示了编码器和解码器的名字，我们之前就是用的`libx264`编码器，这里我们将之前的指令改为nv显卡的编码
```bash
$ ffmpeg -i in.mkv -c:v h264_nvenc -c:a libmp3lame out.mp4
```
我的显卡因为比较老在使用`hevc_nvenc`时报错`B frames as references are not supported`，需要关闭B frame:
```bash
$ ffmpeg -i in.mkv -c:v hevc_nvenc -c:a libmp3lame  -b_ref_mode 0 out.mp4
```
例如我们将之前展示的`片头.mov`按照h265+mp3转码后输出如下，可以看到视频流和音频流编码都发生了对应的改变，而对应的实际转换耗时，可以通过最后一行`speed=7.21x`换算，因为`time=00:00:23`即23s，转换速度是7.21倍播放速度，所以转换时间 = 23/7.21 = 3s 左右。

![image](https://i.imgur.com/LMW5tz8.png)

## 2.2 多音轨/字幕操作
很多电影有多个音轨或者字幕。例如这里有一个`mkv`文件，含有2个音轨，都是ac3。

![image](https://i.imgur.com/YbkCZnF.png)

我们将mkv转mp4，其中视频流部分我们直接copy(节省时间)，音频的编码很快不用copy。
```bash
$ ffmpeg -i in.mkv -c:v copy out.mp4
```
从log中我们发现，只有`stream0:0`和`stream0:1`被转换了，这俩是原来的视频和其中一个音频流。`stream0:1`是指输入文件的第0个文件中的第1个流，因为我们input就只有一个文件，所以第一位一直是0。

![image](https://i.imgur.com/6oKRGWh.png)

即，默认情况下，视频的转换会只转换一个视频流和一个音频流，如果有多个音频流的话，只会转换第一个，同时默认情况下，字幕流不会被转换。

这是本来有字幕的视频

![image](https://i.imgur.com/TOOdbGV.png)

转换完，没有了字幕

![image](https://i.imgur.com/xWhSgWN.png)

如何保留多个音轨、字幕，一般可以使用map参数，`-map 0:v`是指第0个input文件的视频流转到output，`-map 0:a:0`就是第0个文件的第0个音频流搞过来，这样就把俩音轨都搞过来了。
```bash
$ ffmpeg -i input.mkv -map 0:v -map 0:a:0 -map 0:a:1 -c:v copy -c:a copy output.mp4
```
![image](https://i.imgur.com/LFSjQPB.png)

更具体的我们还可以分别对每个音轨指定编码和比特率
```bash
$ ffmpeg -i input.mkv \
-map 0:v -c:v copy \
-map 0:a:0 -c:a:0 libmp3lame \
-map 0:a:1 -c:a:1 libvorbis -b:a:1 128k  \
-map 0:s:0 -c:s:0 srt \
output.mp4
```
当然我们需要注意，新的容器得能支持对应的格式和功能，尤其是字幕功能，很多容器的支持是比较有限的，如果从mkv这种很强的字幕支持度，到比较弱的格式需要有些调整。
# 3 分辨率 比特率 帧率调整
`-s`参数直接指定目标输出的分辨率，`-r`则是帧率，`-b`是比特率，在上面已经见过了，需要分别对音视频指定。
```bash
$ ffmpeg -i input.mp4 -s 720x480 -r 30 -b:v 2M -b:a 128k output.mp4
```
`-s`的分辨率是等比扩缩，如何要截断的话，则需要用filter这个在后面介绍。
```bash
# scale指定宽高，还有原点位置，ow oh是输出文件的宽高，iw ih则是输入文件宽高。
$ ffmpeg -i input.mp4 -filter:v "scale=800:600:x=ow/2:y=0" output.mp4
```
# 4 提取音频
直接指定输出的文件格式就可以提取音频。
```bash
$ ffmpeg -i in.mkv out.mp3
```
# 5 视频截取与拼接
截取，-ss指定截取开始的时间，-t指定持续时长。
```bash
$ ffmpeg -i input.mp4 -ss 00:00:20 -t 00:00:05 -c copy output.mp4
```

对于多个视频拼接，则需要先准备一个`input.txt`
```
file 'input1.mp4'
file 'input2.mp4'
```
然后指定该文件为输入，`-f`指定concat按顺序拼接，需要注意的是，要拼接的视频文件的编码器和格式必须相同，否则拼接可能会失败，所以拼接还是比较麻烦的。
```bash
$ ffmpeg -f concat -i input.txt -c copy output.mp4
```
# 6 filter
filter我并不会常用，所以这里只贴一个简单的介绍，遇到需求的时候再问chatGPT。
![image](https://i.imgur.com/9QLaks5.png)
# 7 ffmpeg的输入
-i可以接本地视频文件，txt格式的视频列表，还能接直播流
```bash
$ ffmpeg -i rtmp://example.com/live/stream -c copy output.mp4
```

还可以录制屏幕
```bash
$ ffmpeg -f gdigrab -framerate 30 -i desktop -f dshow -i audio="麦克风 (Realtek High Definition Audio)" -c:v libx264 -preset ultrafast -c:a aac -b:a 128k output.mp4

```
`gdigrab`是用于在windows上获取屏幕图像的设备，`dshow`则是展示设备,`-i audio=xxx`可以指定录音设备，同时录制音频。 `-i desktop`就是整个桌面，也可以替换为某一个windows下的窗口`-i title=WindowName`，`-preset ultrafas`是以性能优先的预设。

这里没有录制电脑自己的声音，如果还要录制电脑声音，则还得把电脑声音虚拟成一个设备，需要下载一个虚拟器，一般obs都自带了，所以如果有真正复杂的录制屏幕需求，请直接用图形化工具obs，他底层也是ffmpeg。