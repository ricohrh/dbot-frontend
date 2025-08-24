#!/bin/bash

echo "🚀 开始部署测试 - 钱包管理功能更新 v3.1"
echo "=========================================="

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在 frontend 目录下运行此脚本"
    exit 1
fi

# 清理之前的构建
echo "🧹 清理之前的构建..."
rm -rf build/
rm -rf node_modules/.cache/

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败！"
    exit 1
fi

echo "✅ 构建成功！"

# 部署到 GitHub Pages
echo "🚀 部署到 GitHub Pages..."
npx gh-pages -d build

if [ $? -eq 0 ]; then
    echo "✅ 部署成功！"
    echo ""
    echo "🎉 新功能已部署："
    echo "   • 真实的钱包导入功能 (支持 Solana/EVM/Tron)"
    echo "   • 钱包删除功能"
    echo "   • 钱包详情查看"
    echo "   • 加载状态和错误提示"
    echo "   • 响应式设计优化"
    echo ""
    echo "🌐 访问地址：https://ricohrh.github.io/dbot-frontend/"
    echo "⏰ 部署时间：$(date)"
    echo "📝 版本：v3.1"
else
    echo "❌ 部署失败！"
    exit 1
fi 