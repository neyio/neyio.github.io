# Hello,World! Neyio's Docment.

> Try one more time with patient.

## 拓展语法


### 强调

```
!> 一段重要的内容，可以和其他 **Markdown** 语法混用。
```

### 普通提示
普通的提示信息，比如写 TODO 或者参考内容等。

```
?> _TODO_ 完善示例
```

?> _TODO_ 完善示例

### 忽略编译链接

```
[link](/demo/) 增加 [link](/demo/ ':ignore')

```

### Github 任务列表

```
- [ ] foo
- bar
- [x] baz
- [] bam <~ not working
  - [ ] bim
  - [ ] lim
```

- [ ] foo
- bar
- [x] baz
- [] bam <~ not working
  - [ ] bim
  - [ ] lim


!> 一段重要的内容，可以和其他 **Markdown** 语法混用。

### 图片缩放

```
![logo](https://docsify.js.org/_media/icon.svg ':size=50x100')
![logo](https://docsify.js.org/_media/icon.svg ':size=100')
```

![logo](https://docsify.js.org/_media/icon.svg ':size=50x100')
![logo](https://docsify.js.org/_media/icon.svg ':size=100')


### 设置标题的id属性

```
### 你好，世界！ :id=hello-world
```

### 你好，世界! :id=hello-world


> 和部署所有静态网站一样，只需将服务器的访问根目录设定为 index.html 文件。

例如 nginx 的配置

```
server {
  listen 80;
  server_name  your.domain.com;

  location / {
    alias /path/to/dir/of/docs;
    index index.html;
  }
}
```