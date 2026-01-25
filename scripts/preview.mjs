#!/usr/bin/env node
/**
 * 本地静态服务，用于预览 dist 打包产物
 * 使用 Node 内置模块，无需额外依赖
 */
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, extname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(join(__dirname, '..', 'dist'));
const DEFAULT_PORT = 4173;
const MAX_PORT_ATTEMPTS = 10; // 最多尝试 10 个端口

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

/**
 * 请求处理函数
 */
async function handleRequest(req, res) {
  let pathname = req.url?.split('?')[0] || '/';
  console.log(`  ${req.method} ${pathname}`);
  // 访问 /index.html 时重定向到 /
  if (pathname === '/index.html') {
    res.statusCode = 302;
    res.setHeader('Location', '/');
    return res.end();
  }
  if (pathname === '/') pathname = '/index.html';
  const file = resolve(join(ROOT, pathname));
  if (!file.startsWith(ROOT)) {
    res.statusCode = 403;
    return res.end('Forbidden');
  }

  try {
    const data = await readFile(file);
    const ext = extname(pathname);
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    res.end(data);
  } catch (e) {
    if (e.code === 'ENOENT') {
      // SPA fallback：非文件请求（如 /home）返回 index.html
      if (!extname(pathname) && pathname !== '/') {
        try {
          const html = await readFile(join(ROOT, 'index.html'), 'utf-8');
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.end(html);
        } catch {}
      }
      res.statusCode = 404;
      res.end('Not Found');
    } else {
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }
}

/**
 * 尝试启动服务器，如果端口被占用则尝试下一个端口
 */
function startServer(port, attempt = 0) {
  const server = createServer(handleRequest);

  server.listen(port, () => {
    console.log(`\n  Preview: http://localhost:${port}\n`);
    if (port !== DEFAULT_PORT) {
      console.log(`  (端口 ${DEFAULT_PORT} 被占用，已使用端口 ${port})\n`);
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      if (attempt < MAX_PORT_ATTEMPTS) {
        const nextPort = DEFAULT_PORT + attempt + 1;
        console.log(`端口 ${port} 被占用，尝试端口 ${nextPort}...`);
        startServer(nextPort, attempt + 1);
      } else {
        console.error(`\n错误: 无法找到可用端口（已尝试 ${MAX_PORT_ATTEMPTS} 个端口）\n`);
        console.error('请关闭占用端口的进程或手动指定端口\n');
        process.exit(1);
      }
    } else {
      console.error('服务器启动失败:', err.message);
      process.exit(1);
    }
  });
}

startServer(DEFAULT_PORT);
