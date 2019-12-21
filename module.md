### 3.加载规则

```html
<script type="module" scr="module.js"></script>
等同于 
<script type="module" scr="module.js" defer></script>
```

> 如果增加 async 标签，则当加载完成后，会阻塞渲染再立即执行脚本，然后再继续渲染。

```html
<script type="module" src="module.js" defer async></script>
```

ES 模块支持内嵌

```html
<script type="module">
import moduleA from 'module.js';
...
</script>
```


### 4.ES模块导出的为值的引用
> CommonJS导出的是值的复制

#### 可以在此基础上构建单例

```javascript
let a = null;

export default function(){
  if(!a){
    a = 'module inited';
    return a;
  }
  return a;
};
```