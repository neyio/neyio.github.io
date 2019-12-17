# 速读ES6+
> 本文仅对容易遗漏的知识点进行记录。

### 1.暂时性死区

查看以下代码
```javascript
// 片段1
var b =3;
function demo(){
  b = 5; // ReferenceError  ,即便 外部存在b
  let b = 'hello';
}
demo();
//片段2
var b =3;
function demo2(){
  b = 5; //没有报错
  console.log(b);// 5
  var b = 'hello';
  console.log(b);// hello
}
demo2(); // 此时变量提升 ,依然不会修改全局中的b ， window.b ===3；

/// 片段3
function demo3(){
  a = 'hi';
  console.log(a); // undefined;
  var a = 9;
}

demo3();
```


### 2.变量提升的优先级

可以理解为function的声明会被题升到AST的顶部，然后再执行其他定义

```javascript
function demo(){
  var b = ()=>{ return 1;}
  function b(){ 
    return 2;
  }
  return b();
}
demo();// 1
```

### 3.for循环中的var和let差别

```javascript
for(var i = 0;i<3;i++){
  setTimeout(()=>console.log(i));
}
//333

for(let i = 0;i<3;i++){
  setTimeout(()=>console.log(i));
}//012
```

### 4.const的作用
> const 只能保证引用地址的指针不变，而不能保证内部的值是否发生, 一般来说对象的比较是也就是地址的比较。

```javascript
const a = {};
const b = a;
b.name = 'neyio';//可以随意操作内部内容，往往同学 以为只有let能进行操作，事实上只是保证地址不变而已。
console.log(a===b); // true
```

### 5.解构的玩法

#### 1.交换
```javascript
let x ='foo';
let y='bar';
([x,y] = [y,x]);//请注意这个括号，没有括号，就会报错噢
console.log(x,y);//bar foo
```


#### 2.默认值

> 解构给予默认值在 写函数的时候十分常见，请注意第三个`fn`的输出，了解解构的玩法 同时注意  深层解构会自动放弃路径前缀 
```javascript
let [x = 3] = [];
console.log(x);//3;
//-----
let {name = 'neyio' }={ age:18 };
console.log(name);//neyio
//----- 
const fn = ({name='neyio'}={name:'foo'})=>{
  return name;
}
fn({age:18}); // neyio
fn();// foo;
// ---
const {a:{b:{c} }} = {a:{b:{c:"hello"},d:"world"}};
console.log(a)//ReferenceError  深层解构会自动放弃路径前缀

//---

let [a,b=a,c=b] = ['foo','bar'];
console.log(a,b,c); // foo bar bar
```

### 3.别名
`let {a:name} = {a:'neyio}; //name is neyio`

### 4.数组的对象方式解构

```javascript
const arr = [1,2,3]; 
const {0:first,[arr.length-1]:last} = arr;
// first is 1, last is 3
const {length} = arr;
//length is 3
```

### 5.字符串解构
> 对字符串进行数组解构，可以得到这正的字符长度，防止特殊字符占用码点，直接使用str.length可能获取的字符串长度过长
```javascript
const [...str]= "hello";
console.log(str.length);//str is  ['h','e','l','l','o'];
```

### 6.解构变量的toString 
```javascript
const {toString}= 3;
console.log(toString);//toString === Number.prototype.toString
```

### 7.循环内解构类似Map的具备Iterator结构变量
> 注意：遍历map能保证map的key设置的顺序
```javascript
const map = new Map();
map.set('foo',1);
map.set('bar',2);
for(let [key,value] of map){
  console.log(key,value);
}
//foo 1
//bar 2
```




### 8.字符码点问题
> 一般是使用 codePointAt(pos)就行，js不能正确识别 unicode码点大于 0xFFFFF的字符，和charCodeAt()一样会以为是两个字符。
此时 `for(let i = 0;i<str.length;i++) str[i]//不能正确遍历，而 for(let i of str) i 可以 `

### 9.几个字符串函数

`includes,startsWith,endsWith,repeat,padStart,padEnd` 以及 字符串模板

```javascript
//repeat
'hello'.repeat(2) // hellohello;`
//padStart
'name'.padStart(8,'aba');// abaaname
'name'.padEnd(8,'aba');// nameabaa
//使用方式
'2020'.padEnd(10,'-MM-DD')// 2020-MM-DD

const a = 'hello';
const b = `${p} world` // hello world;
const c = `支持换行
换行；
`;

```

### 10.tag模板函数

```javascript
const tag = (strsArray,...values) => {

}
tag`hello world ${1} ${2}`;
//等价于
tag(['hello world ',' '],1,2);

// 用法
i18n`welcome to ${position}`;
```

### 11.正则表达式

> 字符串对象具备4个方法,`match`,`replace`,`search`,`split`可以使用正则表达式。
> TODO://此处需要找一天全部整理一次

### 12.箭头函数
1. 箭头函数内的this为定义时所在的对象，而不是使用时的对象。除非在箭头函数外层包裹一个函数，然后使用该函数的call｜apply|bind的方式进行修改父级作用域，this则依然保障指向被修改后的父级函数。
2. 不能作为构造函数，不能使用new命令
3. 不可以使用arguments，不存在的
4. 不能使用yield 即不能成为generator函数
```javascript

```