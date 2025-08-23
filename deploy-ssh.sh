#!/bin/bash

# DBot前端自动部署脚本（SSH版本）
# 使用方法: ./deploy-ssh.sh

echo "🚀 开始部署DBot前端到GitHub Pages..."

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 错误: 请在frontend目录下运行此脚本${NC}"
    exit 1
fi

# 设置Git配置
echo -e "${BLUE}🔧 配置Git...${NC}"
git config user.name "ricohrh"
git config user.email "ricohrh@github.com"

# 检查SSH密钥
echo -e "${BLUE}🔑 检查SSH密钥...${NC}"
if [ ! -f ~/.ssh/github_key ]; then
    echo -e "${YELLOW}⚠️  SSH密钥不存在，正在生成...${NC}"
    ssh-keygen -t ed25519 -C "ricohrh@github.com" -f ~/.ssh/github_key -N ""
    
    # 配置SSH
    mkdir -p ~/.ssh
    echo "Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/github_key
    IdentitiesOnly yes" > ~/.ssh/config
    
    chmod 600 ~/.ssh/github_key
    chmod 644 ~/.ssh/github_key.pub
    chmod 600 ~/.ssh/config
    
    echo -e "${GREEN}✅ SSH密钥已生成${NC}"
    echo -e "${BLUE}📋 请将以下公钥添加到GitHub:${NC}"
    echo -e "${YELLOW}$(cat ~/.ssh/github_key.pub)${NC}"
    echo -e "${BLUE}💡 访问: https://github.com/settings/keys${NC}"
    read -p "添加完成后按回车继续..."
fi

# 设置SSH URL
echo -e "${BLUE}🔗 设置SSH URL...${NC}"
git remote set-url origin git@github.com:ricohrh/dbot-frontend.git

# 测试SSH连接
echo -e "${BLUE}🔍 测试SSH连接...${NC}"
ssh -T git@github.com 2>&1 | grep -q "successfully authenticated" && echo -e "${GREEN}✅ SSH连接成功${NC}" || echo -e "${YELLOW}⚠️  SSH连接测试失败，但继续执行${NC}"

# 获取提交信息
COMMIT_MSG="自动更新: $(date '+%Y-%m-%d %H:%M:%S')"
echo -e "${BLUE}📝 提交信息: $COMMIT_MSG${NC}"

# 1. 检查Git状态
echo -e "${YELLOW}📋 检查Git状态...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${GREEN}✅ 发现未提交的更改${NC}"
else
    echo -e "${YELLOW}⚠️  没有发现新的更改${NC}"
    read -p "是否继续部署? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🚫 部署已取消${NC}"
        exit 0
    fi
fi

# 2. 安装依赖（如果需要）
echo -e "${YELLOW}📦 检查依赖...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 安装依赖...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 依赖安装失败${NC}"
        exit 1
    fi
fi

# 3. 构建项目
echo -e "${YELLOW}🔨 构建项目...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 构建失败${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 构建成功${NC}"

# 4. 添加所有更改到Git
echo -e "${YELLOW}📝 添加更改到Git...${NC}"
git add .
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Git添加失败${NC}"
    exit 1
fi

# 5. 提交更改
echo -e "${YELLOW}💾 提交更改...${NC}"
git commit -m "$COMMIT_MSG"
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Git提交失败${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 提交成功${NC}"

# 6. 推送到GitHub
echo -e "${YELLOW}📤 推送到GitHub...${NC}"
git push origin main
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 推送失败${NC}"
    echo -e "${YELLOW}💡 尝试强制推送...${NC}"
    git push origin main --force
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 强制推送也失败了${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✅ 推送成功${NC}"

# 7. 部署到GitHub Pages
echo -e "${YELLOW}🌐 部署到GitHub Pages...${NC}"

# 清理gh-pages缓存
echo -e "${BLUE}🧹 清理gh-pages缓存...${NC}"
rm -rf node_modules/.cache/gh-pages

# 部署到GitHub Pages
npx gh-pages -d build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ GitHub Pages部署失败${NC}"
    echo -e "${YELLOW}💡 尝试清理gh-pages分支...${NC}"
    
    # 尝试删除远程gh-pages分支
    git push origin --delete gh-pages 2>/dev/null
    git branch -D gh-pages 2>/dev/null
    
    # 重新部署
    echo -e "${BLUE}🔄 重新部署...${NC}"
    npx gh-pages -d build
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 重新部署也失败了${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ GitHub Pages部署成功${NC}"

# 8. 显示结果
echo -e "${GREEN}🎉 部署完成！${NC}"
echo -e "${BLUE}📊 部署信息:${NC}"
echo -e "   📅 时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo -e "   📝 提交: $COMMIT_MSG"
echo -e "   🌐 网站: https://ricohrh.github.io/dbot-frontend/"
echo -e "   📁 仓库: https://github.com/ricohrh/dbot-frontend"

# 9. 等待部署生效
echo -e "${YELLOW}⏳ 等待部署生效（通常需要1-2分钟）...${NC}"
echo -e "${BLUE}💡 提示: 您可以在GitHub仓库的Settings > Pages中查看部署状态${NC}"

echo -e "${GREEN}✨ 脚本执行完成！${NC}" 