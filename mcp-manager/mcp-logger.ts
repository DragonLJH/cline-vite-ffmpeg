import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

// 日志文件路径
const logFile = path.join(__dirname, 'mcp_traffic.log');
const logger = fs.createWriteStream(logFile, { flags: 'a' });

/**
 * 格式化日志输出
 */
function log(direction, data) {
    const timestamp = new Date().toISOString();
    const message = data.toString().trim();
    if (message) {
        logger.write(`[${timestamp}] [${direction}]\n${message}\n${'-'.repeat(40)}\n`);
    }
}

// 获取要启动的 MCP Server 命令（从命令行参数获取）
// 例如: node mcp-logger.js npx -y @modelcontextprotocol/server-everything
const [runtime, ...args] = process.argv.slice(2);

if (!runtime) {
    console.error('错误: 请提供要运行的 MCP Server 命令');
    process.exit(1);
}

// 启动子进程
const child = spawn(runtime, args, {
    shell: true,
    stdio: ['pipe', 'pipe', 'inherit'] // 保持 stderr 直接输出到终端，方便看错
});

// 1. 监听 Client -> Server (Input)
process.stdin.on('data', (data) => {
    log('CLIENT -> SERVER', data);
    child.stdin.write(data);
});

// 2. 监听 Server -> Client (Output)
child.stdout.on('data', (data) => {
    log('SERVER -> CLIENT', data);
    process.stdout.write(data);
});

// 处理退出
child.on('exit', (code) => {
    logger.write(`\n[PROCESS EXITED WITH CODE ${code}]\n`);
    process.exit(code);
});