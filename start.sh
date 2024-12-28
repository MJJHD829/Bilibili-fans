#!/bin/bash
# 启动 Node.js 应用并将输出重定向到 log 文件
nohup node main.js > app.log 2>&1 &