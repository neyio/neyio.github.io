# Javascript基础篇之读《你不知道的Javascript》读摘及有感
#技术文档/Javascript基础学习

!> 平时只注重于应用，而忘记了去对基础进行系统性的梳理和学习，本文在边看书边学习的情况进行探究书上的知识点，水平有限，欢迎勘误和批评，这能帮助我学到更多知识。

## 编译流程简述
> 词法化(词法分析) -> 解析/语法分析(形成元素逐级嵌套的抽象语法树AST[Abstract Syntax Tree]) -> 代码生成  

- - - -

## 变量和变量的作用域
1. LHS和RHS查询 (Left Hand Side) & (Right Hand Side) 知识点
> 左右查询一般源自是以赋值符号(=)两侧的左右区分，注意隐式赋值。  

```javascript
function foo(a){
	console.log(a);//2
}
# 问执行以下代码进行了几次查找
foo(2);
# foo方法RHS查询，赋值形参 a=2操作LHS，获取console对象RHS，console.log(a)取a值赋值形参前RHS；赋值时LHS。
```

2.  函数声明理解为LHS并不合适

```javascript
const foo = function(a){...
function foo(a){...
# 编译器可以在代码生成的同时处理声明和值的定义，代码执行时，并不会有一个线程用于将函数分配给变量赋值。因此函数声明理解为LHS并不合适。
# 但是在调用时，依然会进行一次foo的RHS查找。
```

3. 作用域嵌套
> 当需要RHS或LHS的时候，引擎从当前执行的作用域开始查找变量，如果无法找到，则向上级作用域查找，直到抵达最外层的全局作用域，如依然无法找到，查找则停止。  类似：RHS、LHS在当前楼层找目标，无法找到就上电梯去找目标，直到天台。  

![](javascript/fig1%203.png)

4. ReferenceError异常、TypeError

> ReferenceError指的变量查找失败，引用错误。   
> TypeError指的是类型错误，例如调用一个非函数的变量进行()操作，同时表示Reference查找通过。  

- - - -

## 词法作用域 
### 简述
> 定义词法阶段的作用域,如下图所示，1为全局作用域，2为foo创建的作用域，3为bar创建的作用域。  

![](javascript/fig2%203.png)

但是::无论方法在哪里被调用，无论如何调用，它的词法作用域都只由方法被声明处的位置决定。::
所有的::变量查找都只需要找一级的变量名，如foo.bar.baz，只需要找foo的变量::

### 欺骗词法（修改词法作用域）

> 不推荐使用，使用必然会使得性能下降。js引擎在编译阶段进行性能优化，有些优化依赖于根据代码的静态分析，预先确定变量的定义位置。  
1.JavaScript 中的 eval(..) 函数接收一个字符串作为参数值，并将这个字符串的内容看作是好像它已经被实际编写在程序的那个位置上。换句话说，你可以用编程的方式在你编写好的代码内部生成代码，而且你可以运行这个生成的代码，就好像它在编写时就已经在那里了一样。

```js
function foo(str, a) {
	eval( str ); // 作弊！
	console.log( a, b );
}
var b = 2;
foo( "var b = 3;", 1 ); // 输出 1 3
# 如果上述代码使用 function foo(str,a){ "use strict"; 严格模式，则 变量b 为未定义。
```

2.with语法

```js
function foo(obj) {
	with (obj) {
		a = 2;
	}
}
var o1 = {
	a: 3
};
var o2 = {
	b: 3
};
foo( o1 );
console.log( o1.a ); // 2
foo( o2 );
console.log( o2.a ); // undefined
console.log( a ); // 2 -- 哦，全局作用域被泄漏了！
```

## 方法作用域和块作用域
每个方法都有它自己的作用域“气泡”，外部不能访问到“气泡”内部的值。

### 隐藏内部实现
> 从书上看来，javascript的设计模式希望隐藏内部实现。  

```js
function a(x){
	b(x);//访问全局作用域的b
}
function b(y){...}
# 如何隐藏内部实现？
function a(x){ 
	function b(y){...}
  b(x);
}
```

能够有效避免冲突,以及模块化管理

```js
# 代码未经试验
function foo(x){
	function bar(x){
  	...使用x
  }
}
```

 防止污染全局作用域，可使用函数表达式，注意区分表达式和声明，其中函数表达式可以匿名，而函数声明不可以匿名。

```js
var a =3;
(function foo(){
	var a = 2;
  console.log(2);
})();
# foo() ReferenceError foo is undifined
console.log(a);//a=3;
#其中(function xx(){}) 被称为函数表达式，祛除()，形似function xx(){}成为函数声明。
#举例：
setTimeout(function(){},3000); //代码中的function(){}为函数表达式。 函数表达式可以匿名，而函数声明不可以匿名。
```

### 立即执行函数 IIFE(Immediately Invoked Function Expression)
`(function(){})()`  或 `(function iife(){})()`

如果需要使用 window变量，可以穿入参数，如下

```js
var a = 3;
(function foo(global){
console.log(global.a);
})(window);
# 浏览器环境中可用，Node中不适用。
```

> 倒置传参，UMD（Universal Module Definition）中广泛  
```js
var a = 2;
(function IIFE(def){
    def(window)
})(function(global){
    console.log(global.a)
    return global.a;
});// 2
```

### 块作用域 （垃圾收集、内存回收区域基础见后续）
 例子1: ES语法和var区别

```js
var foo = true;
if(foo){
    var bar = 3;
} 
console.log(bar)//3 直接污染，依然是 3
# 好在有 let ,const 的ES语法规则，使得块级作用域实现。
# 若上述代码中 var bar = 3; 改为 const bar =3; 
则输出为 ReferenceError: bar is not defined
```

例子2:  罕见的块级作用域
```js
try{  }catch(e){
	//此处为块级作用域，js语法es3的约定，外部无法读取e
}
```

例子3: let的声明并不会进行::变量提升::

`{ console.log(a);const/let a = 3;} # ReferenceError ` & `{ console.log(a);var a = 3;} # undefined `

例子4:bigData的内存回收

```js
1.var bigData = {...};
function process(data){
	...
}
process(bigData);
//bigData未释放，绑定至了window
2.优化
{
 let bigData ={...};
 process(bigData);
} //执行后即垃圾回收
```

例子5: for循环中的let

`for(let i=0;i<10;i++){}; console.log(i);//ReferenceError!`  & `for(var i=0;i<10;i++){}; console.log(i);//10`

```js
 # 实际上 for中的let定义等价于
{//作用域 括号不可少
let i = 0; 
	for(j=0;j<10;j++){
		let i = j;//每次迭代的时候重新绑定了作用域
	}
}
```

- - - -

## 变量提升 -> 先有鸡还是先有蛋，答案是 先有声明，再有赋值。
> 略窥门径, 变量提升的原因在于语法编译解析机制。::编译阶段、执行阶段::  

```js
a = 2;
var a;
console.log(a);//2
# var a = 2;代码本质是两个操作 ，“定义声明” a，“赋值声明“ a=2; //此行文本已确认无误。
```

```js
console.log(a);//undefined
var a =2;
# 实际编译结果接近于 var a; console.log(a); a = 2;
```

不仅变量如此，方法声明也会导致方法本身变量提升。

```js
foo();//bar
function foo(){
 console.log('bar');
}
```

::方法变量提升，而方法表达式未被提升::

```js
foo();//TypeError!
var foo = function bar(){
  console.log('bar');
};
# 解析 foo 已经得到变量提升，foo在调用时为 undefined 则导致 TypeError; 还是符合 原有的 赋值操作在执行阶段，声明操作在编译阶段。
```

::函数优先的逻辑:: 同一值被多次函数声明，后者覆盖前者。

```
foo();//1
var foo;
function foo(){
	console.log(1);
}
foo = function(){
 console.log(2);
}
foo();//2;
# 函数优先表示，声明的时候 多种赋值，函数具有最高的优先级。
```
