# 安装指南

## 系统要求

- Node.js 16+ 或更高版本
- npm 8+ 或 yarn 1.22+
- 现代浏览器（Chrome, Firefox, Edge等）

## 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/your-repo/wiki.git
```

2. 安装依赖
```bash
cd wiki
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

## 配置选项

编辑`sidebar.json`文件可自定义导航菜单:
```json
[
  {"title": "首页", "link": "home.md"}
]
```

## 常见问题

Q: 如何添加新文档？
A: 只需在项目根目录创建新的.md文件，并在sidebar.json中添加对应链接即可。