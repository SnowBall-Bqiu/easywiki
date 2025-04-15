/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html", // 扫描项目根目录下的 index.html 文件
    "./js/**/*.js",  // 扫描 js 目录及其子目录下的所有 .js 文件
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
