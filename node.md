# Node 相关的知识点

## 关于 Node(待完善)

## 命令行升级「 MAC 升级 Node 和 NPM 到最新版 」

1. 先查看本机 node.js 版本：

```bash
    node -v
```

2.清除 node.js 的 cache：

```bash
    sudo npm cache clean -f
```

3.安装 n 工具，这个工具是专门用来管理 node.js 版本的，别怀疑这个工具的名字，是他是他就是他，他的名字就是 "n"

```bash
    sudo npm install -g n
```

4.安装最新版本的 node.js

```bash
    sudo n stable
```

5.再次查看本机的 node.js 版本：

```
    node -v
```

6.更新 npm 到最新版：

```bash
    sudo npm install npm@latest -g
```

验证:

```bash
    node -v
    npm -v
```
