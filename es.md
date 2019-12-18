# 速读ES6+
> 本文仅对容易遗漏的知识点进行记录。

## 1.暂时性死区

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


## 2.变量提升的优先级

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

## 3.for循环中的var和let差别

```javascript
for(var i = 0;i<3;i++){
  setTimeout(()=>console.log(i));
}
//333

for(let i = 0;i<3;i++){
  setTimeout(()=>console.log(i));
}//012
```

## 4.const的作用
> const 只能保证引用地址的指针不变，而不能保证内部的值是否发生, 一般来说对象的比较是也就是地址的比较。

```javascript
const a = {};
const b = a;
b.name = 'neyio';//可以随意操作内部内容，往往同学 以为只有let能进行操作，事实上只是保证地址不变而已。
console.log(a===b); // true
```

## 5.解构的玩法

### 1.交换
```javascript
let x ='foo';
let y='bar';
([x,y] = [y,x]);//请注意这个括号，没有括号，就会报错噢
console.log(x,y);//bar foo
```


### 2.默认值

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

## 3.别名
`let {a:name} = {a:'neyio}; //name is neyio`

## 4.数组的对象方式解构

```javascript
const arr = [1,2,3]; 
const {0:first,[arr.length-1]:last} = arr;
// first is 1, last is 3
const {length} = arr;
//length is 3
```

## 5.字符串解构
> 对字符串进行数组解构，可以得到这正的字符长度，防止特殊字符占用码点，直接使用str.length可能获取的字符串长度过长
```javascript
const [...str]= "hello";
console.log(str.length);//str is  ['h','e','l','l','o'];
```

## 6.解构变量的toString 
```javascript
const {toString}= 3;
console.log(toString);//toString === Number.prototype.toString
```

## 7.循环内解构类似Map的具备Iterator结构变量
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




## 8.字符码点问题
> 一般是使用 codePointAt(pos)就行，js不能正确识别 unicode码点大于 0xFFFFF的字符，和charCodeAt()一样会以为是两个字符。
此时 `for(let i = 0;i<str.length;i++) str[i]//不能正确遍历，而 for(let i of str) i 可以 `

## 9.几个字符串函数

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

## 10.tag模板函数

```javascript
const tag = (strsArray,...values) => {

}
tag`hello world ${1} ${2}`;
//等价于
tag(['hello world ',' '],1,2);

// 用法
i18n`welcome to ${position}`;
```

## 11.正则表达式

> 字符串对象具备4个方法,`match`,`replace`,`search`,`split`可以使用正则表达式。
> TODO://此处需要找一天全部整理一次

## 12.函数

### 箭头函数
  1. 箭头函数内的this为定义时所在的对象，而不是使用时的对象。除非在箭头函数外层包裹一个函数，然后使用该函数的call｜apply|bind的方式进行修改父级作用域，this则依然保障指向被修改后的父级函数。
  2. 不能作为构造函数，不能使用new命令
  3. 不可以使用arguments，不存在的
  4. 不能使用yield 即不能成为generator函数
  5. 返回对象时不带return的情况下，表达式需要`()`包裹对象 `const a = () => ({foo:'bar'});`;
  
  ```javascript
    const obj = {
      name:'neyio',
      getName:function(){
        return ()=>{
          return this.name;
        };
      }
    }
    const obj2 = { name:'foobar' };
    obj.getName()(); //neyio;
    obj.getName().call(obj2);// neyio;
    obj.getName.call(obj2)();// foobar

  ```
### 函数属性name
  1.  `function foo(){};foo.name // foo`; 
  2. `es5`和`es6`差异
    <!-- tabs:start -->
    #### ** ES5 **
    ```javascript
      var f = function(){};
      f.name //""     
      var bar = function foo(){};
      bar.name // foo注意了！
    ```
    #### ** ES6 **
    ```javascript
      const f = function(){};
      f.name //"f"
      const bar = function foo(){};
      bar.name // foo;注意了！
    ```
    #### ** Bound **
    ```javascript
      const obj = {}
      function foo(){}
      foo.bind(obj);
      foo.name //bound foo
    ```
    <!-- tabs:end -->

###  bind,call,apply 的机操 
!>  注意了：本质是在对方对象上生成一个Symbol作为key，把当前的this挂载到对方对象上的Symbol上作为值，在执行完毕后，删除该key。其他都是鬼扯。

  1. bind 生成一个绑定了第一个参数作为this指向对象的方法
  2. call 直接触发绑定了第一个参数作为this指向对象的方法，其余作为该方法的参数入参
  3. apply 同call，只是参数仅有一个。



  1. 实现一个bind函数

  ```javascript
    Function.prototype._bind = function(obj) {
      var preThis = this;
      var newFunction = function() {
        return preThis.apply(obj, arguments); //注意arguments已经不被提倡使用了。
      };
      return newFunction;
    };

    const obj = {
      name: 'neyio',
      getName: function() {
        return this.name;
      }
    };
    const obj2 = { name: 'foobar' };
    console.log(obj.getName._bind(obj2)()); //foobar
  ```
  
  2. 实现一个call函数
  ```javascript
    const obj2 = { name: 'foobar' };
    Function.prototype._call = function(...args) {
      const preThis = this;
      const [ obj, ...rest ] = args;
      var newFunction = function() {
        return preThis.call(obj, ...rest); //注意arguments已经不被提倡使用了。
      };
      return newFunction();
    };

    const obj3 = {
      name: 'neyio',
      getName: function(suffix) {
        return this.name + suffix;
      }
    };
    console.log(obj3.getName._call(obj2, 'neyio'));//foobarneyio
  ```


  3. 然后你发现一个事实，我在耍无赖，你用的都是`Function`的原型方法本身，并没有进行自己手动实现啊，你实现apply和call了吗？你怎么能调用呢？
  > 我痛恨这种喊着这个方法不能用，但是你必须要实现，你要掌握这三个方法，而不能用这种其他方法的诡辩。 如果需要，也许你需要实现一台x86的系统，或者像我的法布里斯·贝拉（FabriceBellard)一样，那我默不作声。

  ```javascript
    const obj = {
      name: 'neyio',
      getName: function(suffix) {
        return this.name + suffix;
      }
    };
    Function.prototype._apply = function(obj, args) {
      obj = obj || window;
      const symbol = Symbol('function');
      obj[symbol] = this;
      const result = obj[symbol](args);
      delete obj[symbol];
      return result;
    };
    console.log(obj.getName._apply(obj2, [ 'neyio' ]));
  ```

?> 我最烦心的事情就是面试造🚀的装逼大佬，问他们这些问题我几乎不能确定他们会不会，然而他们一定还是会说我只是为了了解你的基本功，那么手写bind和call和apply好像也不难吧.
  一来是你不能篡改系统方法，二来是这个时代在进步，能不操作原型链就不操作原型链，操作带来的后果远大于一时半会儿的实现，然而在函数式编程逐渐流行的年代，为如何拆分运算和分布式运算应该是更加值得关注的事情，而不是关心this是啥，当然关心一下也略有裨益，起码你可以在面试新人的时候装逼。


### 递归传值实现1到100之和

```javascript
const sum = (start, end, total = 0) => {
	if (start > end) return total;
	return sum(start + 1, end, total + start);
};

console.log(sum(1, 100));


```

### 尾递归优化的斐波那契数列

```javascript
const fabonacci = (current, gen, a, b) => {
	if (current > gen) return a;
	return fabonacci(current + 1, gen, b, a + b);
};

// 112358 13 21;
console.log(fabonacci(1, 1000, 1, 1));

const fabonacci2 = (gen, a, b) => {
	if (gen <= 0) return a;
	return fabonacci2(gen - 1, b, a + b);
};

// 112358 13 21;
console.log(fabonacci2(1000, 1, 1));

```


## 13.数组

### 常用方法 forEach,map,reduce,reduceRight,find,findIndex
> 使用reduce实现reduceRight是一个复杂的工艺，隔段时间尝试都需要时间理解，一直找不到是哪一门学科能让我了解这个更多。
此处不再赘述

### 好用方法
```javascript

Array.from({length:30}).map((_,i)=>i);//生成0到29数组。
//等价于Array.from({length:30},(_,i)=>i);第二参数为类似map的方法
Array.from({0:'neyio',1:'18',length:2});// ['neyio','18']; 必须为key的toString能转换为数字，必须含有长度length属性
Array();// []
Array(3);//[ empty * 3]
Array(1,2,3);//[1,2,3]
Array(10).fill(10);//生成一个长度为10，值均为10 的数组。
// Array(10).fill(value,start,end) 不包括end
Array.of(1,2,3);//转换值为数组 [1,2,3] 等价于 [1,2,3];一般可以解构实现
Array.copyWithin(target,start,end = Array.length );//别看，无聊 
[1,2,3,4,5].slice(-1);// 5
[1,2,3,4,5].slice(1,-1);//2,3,4
[1,2,3,4,5].slice(1,4);//2,3,4
[1,2,3,4,5].includes(3);
[1,2,3,4,5].filter(i => i>1);
[1,2,3,4,5].some(x => x===1);
```

### 数组利用Set转换去除重复key

```javascript
let arr = [ 1, 1, 1, 2, 3 ];
//利用 set去重
const set = new Set(arr);
console.log((arr = Array.from(set))); // [1，2，3]

```

## 14.对象


我们可以把ES的对象想象成一个`散列表`，先看一个知识点丰富的示例,然后再逐步精进把，大量的OO的知识会在下方逐步讲到。

```javascript
const NAME = Symbol('name');
const obj = {
  [NAME]:'neyio',
  get name(){
    return this[NAME] + 'foobar';
  },
  set name(val){
    this[NAME] += val;
  }
}
console.log(obj.name);//neyiofoobar
obj.name = '1';
console.log(obj.name);//neyio1foobar

const obj2 = Object.assign(obj,name);
console.log(obj.name);//neyio1foobar 

const obj3 = Object.assign(obj,{name:'what?'});//先执行了set然后执行neyio1what?foobar
console.log(obj3.name);//neyio1what?foobar

const obj4 = Object.assign(obj,{[NAME]:'resetAgain'});// Symbol依然会被拷贝 等价于 obj4 = {...obj,[NAME]:'resetAgain'}; obj5 ={...obj4}；Symbol依然被解构进obj5了
console.log(obj4.name);//resetAgainfoobar

Object.is(NaN,NaN);//true  NaN===NaN false 唯一自反值
Object.is('foo','foo');//true
Object.is({},{});//false  {} === {} false
Object.is(+0,-0);//false  但是 +0===-0 true
```

### 为对象添加默认值
```javascript
const DEFUALTS = {
  LOGIN:'/login',
  REGISTER:'/register',
  //...
}
const getApiMap = (map = {})=>{
  return Object.assign({},DEFUALTS,map);
}
console.log(getApiMap({LOGIN:'/log-in'}));// {LOGIN: "/log-in", REGISTER: "/register"}

```

### 两种属性和操作

对象具有两种属性，一种是数据属性，一种是访问器属性。

#### 数据属性

4个配置项 `[ 'value', 'writable', 'enumerable', 'configurable']  `

```javascript
const obj = { name:'neyio' };
Object.getOwnPropertyDescriptor(obj,'name');
// {value: "neyio", writable: true, enumerable: true, configurable: true}
Object.defineProperty(obj,'getName',{
  enumerable:true, // 是否可枚举，能否被 类似 for...in的遍历
  value:function(){
    return this.name;
  },
  configurable:true, // 是否可以删除或者修改属性，该属性一点变为false后，便无法再次将其变为true，直接锁死，一切想改变它的操作都是无效的。
  writable:true // 是否可变更属性对应的值
})
console.log(obj.getName());//neyio
Object.freeze(obj); // 冻结所有属性，防止修改
obj.getName = function(){
  return this.name+'foobar';
} //修改无效
console.log(obj.getName());//neyio
```

#### 访问器属性

```javascript
const obj = {_name:'neyio',modified:false};
Object.defineProperty(obj,'name',{
  get:function(){
    return this._name;
  },
  set:function(val){
    if(val!==this._name){
      this._name = val;
      this.modified = true;
    }
  },
  configurable:true,//同上
  enumerable:true,//同上
});
obj.name = 'foobar';
console.log(obj.name);//foobar
console.log(obj);// { _name: "foobar", modified: true }
// Object.defineProperties 支持多个入参
Object.getOwnPropertyDescriptor(obj,'name');// {enumerable: true, configurable: true, get: ƒ, set: ƒ}
```

### 属性遍历和读取

常规的LHS时，对象先读取本身的属性，如果不能获得，则读取原型链的值。

1. `for ...in` 不含不可枚举和Symbol，包含可枚举和继承的原型链属性
2. `Object.keys()`  不含继承，不含Symbol，仅有可枚举属性
3. `Object.getOwnPropertyNames()` 获取所有属性，仅不含Symbol
4. `Object.getOwnPropertySymbols()` 获取所有Symbol 不含其他
5. `Reflect.ownKeys()` 包含所有

!> 注意： `Object.stringify(obj)`仅对自身可枚举的属性进行序列化

在接下来的内容开始前，我不得不进行对基础的补充，否则这生涩的东西是在恶心。大多数程序员都有oop的经验，但是原型真的是个异类。

### 基础知识，原型补充
> 此处不该提原型，但是我还是提了，毕竟面试了无数人（我挑人只是根据你的潜力和你的真诚），套路是上层建筑无所谓，底层（大部分机械面试官问的）呢？当然也不能理解成我对基础不重视，知晓和不知是两码事，会写原型和不会写原型是两码事，会不会面试答得出并不能获得多少印象分，只不过是短中拔长罢了，总有一天我也沦落于此。


#### 创建对象的多个方式

1. new操作符和工厂模式

下面先理解下`new`，4个流程
1. 创建一个对象，
2. 将构造函数的作用域赋值给对象
3. 执行构造函数代码
4. 返回新对象

```javascript
function createObject(name, age) {
	const o = new Object();
	o.name = name;
	o.age = age;
	return o;
}
const obj = createObject('neyio', 18);
console.log(obj); // {name:'neyio',age:18}

const Person = function(name, age) {
	this.name = name;
	this.age = age;
};
const person = Object.create(Person.prototype);
Person.call(person, 'neyio', 18);
console.log(person); // { name:'neyio', age:18 }
// 等价于
const person2 = new Person('neyio', 18);
console.log(person2); // { name:'neyio', age:18 } person3 instanceof Person true
// 等价于
const person3 = Object.create({});
Person.call(person3, 'neyio', 18);
console.log(person3); //此时只有数据，没有原型 { name:'neyio', age:18 } person3 instanceof Person false
Object.setPrototypeOf(person3, Person.prototype);
console.log(person3); // { name:'neyio', age:18 } person3 instanceof Person true

console.log(Object.getPrototypeOf(person3)===Person.prototype) //true
Object.setPrototypeOf(person3, Object.getPrototypeOf(person2));
console.log(person3); // { name:'neyio', age:18 } person3 instanceof Person true
```

2. 原型模式
  * 每一个对象（或者说函数，函数也是对象）都具备一个原型，无论是new操作符得到的还是，Object.create({})得到的。
  * 在原型上增加东西，相当于拓展所有基于该原型对象作为原型的对象。存在风险。
  * 每一个原型属性(prototype)都包含一个constructor执行构造方法。
  * 创建一个对象，相当于把构造函数的原型对象给予新的对象的原型属性，并将函数的作用域赋给新对象（相当于this指向该对象），并执行构造函数的方法，并返回该对象。

  * 原型链上请不要挂数组或者可以引用的修改值，

```javascript

  function Person(){
    this.name = 'fresh bird neyio';//如果属性存在则覆盖原型链属性
  }
  Person.prototype.name = 'neyio';
  Person.prototype._name = 'foobar';
  Person.prototype.getName = function(){
    return this.name;
  }
  const p1 = new Person();// Person {name: "fresh bird neyio"} p1._name// foobar
  delete p1.name;
  console.log(p1); // neyio
  const p2 = new Person();// Person {name: "fresh bird neyio"} p1._name// foobar

// - - - - - 

  function Boy(){
    this.name = 'shit';
  }
  // 一次性多个赋值
  Boy.prototype={
    name:'neyio',
    getName:function(){
      return this.name;
    }
  }

```
1. 寄生构造模式
> 这种方式断开了原型联系
```javascript
const Person = function(...cards){
  let _cards  =  [].concat(cards||[]);
  _cards.getNumbers = function(){
    return this;
  }
  return _cards;
}
const p1 = new Person(1,2,3);
console.log(p1.getNumbers());//[1, 2, 3, getNumbers: ƒ] 特别不好
```  

4. 稳妥构造模式
> 这种方式断开了原型联系
```javascript
const Person = function(name,age){
  const obj = {name,age};
  obj.getName = function(){
    return this.name;
  }
  return obj;
}
const p1 = new Person('neyio',18);
console.log(p1.getName(),p1);// neyio , {name: "neyio", age: 18, getName: ƒ}
```  


### 继承
Javascript的继承实际上可以理解为原型链的继承。

```javascript
const Super = function(){
  this.name = 'neyiobaba';
}
Super.prototype.getName = function(){
  return this.name;
}

const Sub = function(){
  this.age = 18;
}
Sub.prototype = new Super();//此处创建了一个新的对象，并将 name,getName属性全部也赋值给了Sub.prototype

Sub.prototype.getAge = function(){
  return this.age;
}
Sub.prototype.getParentName =  function(){
  return this.getName();
}
const child = new Sub();
console.log(child.getAge());//18
console.log(child.getParentName());//neyiobaba
console.log(child.getName());//neyiobaba
child.name = 'neyio';
console.log(child.getParentName());//neyio
console.log(child.getName());//neyio
console.log(child instanceof Super)//true
console.log(child instanceof Sub)//true
```

### 确定变量是否为数组

```javascript
Array.prototype.isPrototypeOf([]);//true
Array.prototype.isPrototypeOf({});//false
Array.isArray([]);//true
```

#### 稍作修改，注意两者区别，应该是原型链比

```javascript
const Super = function(){
  this.name = 'neyiobaba';
}
Super.prototype.getName = function(){
  return this.name;
}

const Sub = function(){
  this.age = 18;
}
Sub.prototype = Super.prototype;// 此时丢失了name属性,而且会使得父亲一旦发生，儿子同时也会发生变化

Sub.prototype.getAge = function(){
  return this.age;
}
Sub.prototype.getParentName =  function(){
  return this.getName();
}
const child = new Sub();
console.log(child.getAge());//18
console.log(child.getParentName());//undefined
console.log(child.getName());//undefined
child.name = 'neyio';
console.log(child.getParentName());//neyio
console.log(child.getName());//neyio
Super.prototype.getName = function(){
  return this.name+' after modified';
}
console.log(child.getParentName());//neyio after modified
console.log(child.getName());//neyio after modified
```


### 借用构造函数
用来解决上述原型链上的引用影响,缺点就是 instanceof 无法 探测父类的实例
```javascript
const Super = function(name){
  this.cards = [ 1, 2, 3, 4 ];
  this.name = name; 
}
const p1 =  new Super('foobar');
const Sub = function(name){
  Super.call(this,name);// 原因就是使得 this被 Super执行，this上挂上cards的值
}
const p2 = new Sub('neyio');
p2.cards.push(5);
console.log(p1.cards);//[ 1, 2, 3, 4 ]
console.log(p2.cards);//[ 1, 2, 3, 4 , 5 ]
console.log(p1.name);//foobar
console.log(p2.name);//neyio
console.log(p2 instanceof Sub);//true
console.log(p2 instanceof Super);//false
```

稍作修改

```javascript
const Super = function(name){
  this.cards = [ 1, 2, 3, 4 ];
  this.name = name; 
}
const p1 =  new Super('foobar');
const Sub = function(name){
  Super.call(this,name);// 原因就是使得 this被 Super执行，this上挂上cards的值
}
Sub.prototype = new Super();
Sub.prototype.constructor = Sub;
const p2 = new Sub('neyio');
p2.cards.push(5);
console.log(p1.cards);//[ 1, 2, 3, 4 ]
console.log(p2.cards);//[ 1, 2, 3, 4 , 5 ]
console.log(p1.name);//foobar
console.log(p2.name);//neyio
console.log(p2 instanceof Sub);//true
console.log(p2 instanceof Super);//true
```



### 检查key是否存在

1. `person.hasOwnProperty('name')`
2. `'name' in person`


