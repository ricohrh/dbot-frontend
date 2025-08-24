# MemeCoin 管理系统前端

## 项目结构

```
frontend/src/
├── components/                 # 组件目录
│   ├── WalletManager/         # 钱包管理模块
│   │   ├── WalletManager.js   # 钱包管理主组件
│   │   ├── WalletCard.js      # 钱包卡片组件
│   │   ├── WalletModal.js     # 钱包模态框组件
│   │   └── WalletManager.css  # 钱包管理样式
│   ├── StrategyManager/       # 策略管理模块
│   │   ├── StrategyManager.js # 策略管理主组件
│   │   ├── StrategyCard.js    # 策略卡片组件
│   │   └── StrategyManager.css # 策略管理样式
│   ├── PositionOverview/      # 持仓总览模块 (待开发)
│   └── TradeOverview/         # 交易总览模块 (待开发)
├── services/                  # API服务层
│   ├── api.js                # API配置和通用请求函数
│   ├── walletService.js      # 钱包相关API服务
│   ├── strategyService.js    # 策略相关API服务 (待开发)
│   └── tradeService.js       # 交易相关API服务 (待开发)
├── utils/                     # 工具函数
│   └── constants.js          # 常量定义
├── App.js                    # 主应用组件
├── App.css                   # 全局样式
└── index.js                  # 应用入口
```

## 模块化设计说明

### 1. 组件模块化
每个功能模块都有独立的目录，包含：
- 主组件文件
- 子组件文件
- 样式文件

### 2. 服务层模块化
API调用按功能分类：
- `walletService.js`: 钱包相关API
- `strategyService.js`: 策略相关API
- `tradeService.js`: 交易相关API

### 3. 当前已实现功能

#### 钱包管理模块
- ✅ 获取钱包列表
- ✅ 导入钱包
- ✅ 编辑钱包
- ✅ 删除钱包
- ✅ 查看钱包详情

#### 策略管理模块
- ✅ 策略列表展示
- ✅ 策略状态管理
- ✅ 策略操作按钮

### 4. 待开发功能

#### 持仓总览模块
- 持仓列表展示
- 持仓统计信息
- 持仓操作功能

#### 交易总览模块
- 交易历史记录
- 交易统计信息
- 交易分析功能

## API接口说明

### 钱包管理API
```javascript
// 获取钱包列表
GET /account/wallets

// 导入钱包
POST /account/wallet
{
  "type": "solana",
  "name": "wallet_name",
  "privateKey": "private_key"
}

// 编辑钱包
PATCH /account/wallet
{
  "_id": "wallet_id",
  "name": "new_wallet_name"
}

// 删除钱包
DELETE /account/wallet/{id}
```

## 开发指南

### 添加新功能模块
1. 在 `components/` 下创建新模块目录
2. 创建主组件和子组件
3. 在 `services/` 下创建对应的API服务
4. 在 `App.js` 中集成新模块

### 样式规范
- 每个模块使用独立的CSS文件
- 使用BEM命名规范
- 响应式设计支持移动端

### 状态管理
- 使用React Hooks管理组件状态
- 复杂状态可考虑使用Context API
- 避免过度使用全局状态

## 部署说明

### GitHub Pages部署
```bash
# 构建项目
npm run build

# 部署到GitHub Pages
npm run deploy
```

### 环境配置
- 生产环境API地址: `https://api-bot-v1.dbotx.com`
- API密钥通过环境变量配置

## 版本历史

- v4.3: 完成钱包管理模块化重构
- v4.2: 添加编辑钱包功能
- v4.1: 完善钱包管理功能
- v4.0: 重构为模块化架构
- v3.x: 基础功能开发
