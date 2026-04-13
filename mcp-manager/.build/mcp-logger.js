"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// 日志文件路径
const logFile = path_1.default.join(__dirname, 'mcp_traffic.log');
const logger = fs_1.default.createWriteStream(logFile, { flags: 'a' });
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
const child = (0, child_process_1.spawn)(runtime, args, {
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
