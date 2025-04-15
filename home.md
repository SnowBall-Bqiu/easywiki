# 欢迎来到简单WIKI

这是一个简洁现代的Wiki界面，用于展示技术文档和知识库内容。

## 功能特点

- 支持Markdown格式渲染
- 响应式设计，适配不同设备
- 动态加载导航菜单
- 安全的内容渲染

## 快速开始

1. 点击左侧导航菜单浏览不同文档
2. 内容区将显示渲染后的Markdown内容

```javascript
// 示例代码
function helloWorld() {
  console.log('Hello, Wiki!');
}
```

[查看安装指南](/installation.md)

## 使用教程

### 1. 浏览文档
- 左侧导航栏显示所有文档的目录，点击导航项即可加载对应的文档内容到中间区域。
- 右侧目录会根据当前文档的标题自动生成，点击目录项可快速跳转到对应的内容。

### 2. 编辑导航栏
- 导航栏的内容由 `sidebar.json` 文件定义，位于项目根目录。
- 示例 `sidebar.json` 文件内容：
  ```json
  [
      {
          "title": "首页",
          "link": "home.md"
      },
      {
          "title": "安装指南",
          "link": "installation.md"
      },
      {
          "title": "高级主题",
          "children": [
              {
                  "title": "主题1",
                  "link": "topic1.md"
              },
              {
                  "title": "主题2",
                  "link": "topic2.md"
              }
          ]
      }
  ]
  ```
- 修改 `sidebar.json` 后，刷新页面即可看到更新的导航栏。

### 3. 编辑文档内容
- 所有文档内容存储为 `.md` 文件，位于项目根目录或子目录中。
- 使用 Markdown 语法编辑文档，例如：
  ```markdown
  # 标题
  - 列表项
  [链接文本](链接地址)
  ```
- 保存修改后，刷新页面即可加载更新的内容。

### 4. 自定义样式
- 样式文件位于 `css` 文件夹中，主要是 `app.css` 文件。
- 使用 Tailwind CSS 或自定义 CSS 修改样式。
- 示例：修改导航栏背景颜色：
  ```css
  #sidebar {
      background-color: #f3f4f6; /* 修改为浅灰色 */
  }
  ```

### 5. 部署
- 将项目文件上传到服务器或静态托管服务（如 GitHub Pages）。
- 确保 `sidebar.json` 和 `.md` 文件路径正确。
- 如果使用本地构建的 Tailwind CSS，请确保 `css/tailwind.css` 文件已生成并包含在项目中。

### 6. 手机端操作
- 点击左上角的汉堡包按钮可展开左侧导航栏。
- 点击右上角的箭头按钮可展开右侧目录。
- 点击内容区域可关闭导航栏和目录。
