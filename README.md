# qBittorrent 迅雷客户端 屏蔽

受项目 uTorrent 自动屏蔽迅雷脚本 https://github.com/ShenHongFei/utorrent-block-xunlei 启发

原理类似，为qBittorrent 设计 

## 其他可选项目

 - qBittorrent-Enhanced-Edition: https://github.com/c0re100/qBittorrent-Enhanced-Edition

qBittorrent-Enhanced-Edition 编译打包时，已经集成屏蔽迅雷的列表

## 使用本项目的优势
 - 可以配合任意版本qBittorrent（只要支持webUI即可）或者官方最新版本，或者其他魔改版

## 如何使用

### 先设置统一环境

进入qBittorrent设置界面，选择打开web ui，输入用户名和密码，保证使用的安全，注意端口号和目录下的`config.json`保持一致
![屏幕截图 2022-01-02 232042.jpg](https://s2.loli.net/2022/01/02/c3unyd5hL1zl7wt.jpg)

编辑`config.json`，保证端口号，ip，用户名和密码一致
![屏幕截图 2022-01-02 232121.jpg](https://s2.loli.net/2022/01/02/iyMglBNzKjIkPRA.jpg)

`127.0.0.1` 如果不了解，请勿修改 
### 方法一

有node环境直接调用即可
```
// 安装依赖
npm install
// or 
yarn

node main.js
```

### 方法二

直接下载release包(包含runtime，包体积较大)

双击，windows下，执行`run.cmd`，弹出小窗即成功