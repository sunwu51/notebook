export async function GET(request) {
    // 从请求 URL 中获取参数
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
  
    // 确保文件名存在
    if (!filename) {
      return new Response(JSON.stringify({ error: 'Filename is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  
    // 目标服务器的 URL
    const targetUrl = `https://i.imgur.com/${filename}`;

    console.log(targetUrl)
    try {
      // 转发请求到目标服务器
      const response = await fetch(targetUrl, {
        headers :{
            "user-agent": "curl/7.84.0",
            "accept": "*/*"
        },
      });
  
      // 获取目标服务器的响应
      const responseBody = await response.arrayBuffer();
  
      // 返回目标服务器的响应
      return new Response(responseBody, {
        status: response.status,
        headers: {
          // 复制目标服务器的 Content-Type 和其他相关头信息
          'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
          'Content-Length': response.headers.get('Content-Length'),
        },
      });
    } catch (error) {
      // 错误处理
      console.error('Error forwarding request:', error);
      return new Response(JSON.stringify({ error: 'Error forwarding request' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }
  