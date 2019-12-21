# 速读ES6+[自我整理]
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

### 1.箭头函数
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
### 2.函数属性name
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

### 3.bind,call,apply 的机操 
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


### 4.递归传值实现1到100之和

```javascript
const sum = (start, end, total = 0) => {
	if (start > end) return total;
	return sum(start + 1, end, total + start);
};

console.log(sum(1, 100));


```

### 5.尾递归优化的斐波那契数列

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

### 1.常用方法 forEach,map,reduce,reduceRight,find,findIndex
> 使用reduce实现reduceRight是一个复杂的工艺，隔段时间尝试都需要时间理解，一直找不到是哪一门学科能让我了解这个更多。
此处不再赘述

### 2.好用方法
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

### 3.数组利用Set转换去除重复key

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

### 1.为对象添加默认值
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

### 2.两种属性和操作

对象具有两种属性，一种是数据属性，一种是访问器属性。

#### 3.数据属性

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

#### 4.访问器属性

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

### 5.属性遍历和读取

常规的LHS时，对象先读取本身的属性，如果不能获得，则读取原型链的值。

1. `for ...in` 不含不可枚举和Symbol，包含可枚举和继承的原型链属性
2. `Object.keys()`  不含继承，不含Symbol，仅有可枚举属性
3. `Object.getOwnPropertyNames()` 获取所有属性，仅不含Symbol
4. `Object.getOwnPropertySymbols()` 获取所有Symbol 不含其他
5. `Reflect.ownKeys()` 包含所有

!> 注意： `Object.stringify(obj)`仅对自身可枚举的属性进行序列化

在接下来的内容开始前，我不得不进行对基础的补充，否则这生涩的东西是在恶心。大多数程序员都有oop的经验，但是原型真的是个异类。

### 6.基础知识，原型补充
> 此处不该提原型，但是我还是提了，毕竟面试了无数人（我挑人只是根据你的潜力和你的真诚），套路是上层建筑无所谓，底层（大部分机械面试官问的）呢？当然也不能理解成我对基础不重视，知晓和不知是两码事，会写原型和不会写原型是两码事，会不会面试答得出并不能获得多少印象分，只不过是短中拔长罢了，总有一天我也沦落于此。


#### 1.创建对象的多个方式

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
    this.name = 'fresh bird neyio';//如果属性存在则覆盖原型链属性 //构造函数中的this，跟生成的新对象的地址是一致的，详见weakSet的时候的探索
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


### 7.继承
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

### 8.确定变量是否为数组

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


### 9.借用构造函数
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



### 10.检查key是否存在

1. `person.hasOwnProperty('name')`
2. `'name' in person`


## 15.Symbol 
> Symbol方法的参数都是字符串，如果是其他值会调用拆箱toString。
Symbol函数声生成一个唯一值，属性值不冲突，此时参数为一个描述字符串，该字符串不能作为key进行理解，如果使用`Symbol.keyFor(一个非.for函数生成的symbol对象)`，则产生的值为`undefined`。

而`Symbol.for(key)`生成的值可以被复用,参数为类似散列表中的唯一key，你可以再次使用`Symbol.for(key)`获得原值，如何再次获得该key，可以通过
`Symbol.keyFor(s)`获取。

!> 注意了，`Symbol.for()`会在全局中注册一个变量，你可以在任意位置获得它，而 `Symbol()` 不会.

```javascript
const s = Symbol('neyio');
typeof s; // "symbol";
s.toString(); // "Symbol(neyio)";
const sp = Symbol.for('neyio'); //全局的变量
console.log(s === sp)// false 注意了！
const sp2 = Symbol.for('neyio');
console.log(sp2 === sp)//true

// -----
const sk = Symbol.for('neyio');//全局的变量
console.log(Symbol.keyFor(sk));//neyio
const obj = {name:'neyio'};
const obj2 = {name:'foobar'};
const sk2 = Symbol.for(obj);
const sk3 = Symbol.for(obj2);
console.log(Symbol.keyFor(sk2),Symbol.keyFor(sk3))// [object Object] 的字符串
console.log(sk2===sk3);//true 注意，别这样用，

// ---- 注意下方的示例
const sk4 = Symbol.for(1);
const sk5 = Symbol.for('1');
console.log(sk4===sk5);//true

```

### 1.Symbol基本使用须知

1. 基础使用
`for...in` 和 `object.keys()`均无法遍历,但是解构和`Object.assign`依旧能继承。使用下方描述的获取遍历中的`Object.getOwnPropertySymbols`;

```javascript
const _uid = Symbol('s');
const person = {
  [_uid]:'xxxx'
}
const person2 = {...person};
const person3 = Object.assign({},person);
for(let key in person){
  console.log(key); // 不执行
}
console.log(Object.keys(person));//[]
console.log(person,person2,person3); // {Symbol(s): "xxxx"} * 3

```


2. 获取遍历
  
```javascript
 Object.getOwnPropertySymbols();
```


### 2.常规使用

1. 隐藏属性值（`for ... in` 和 `Object.keys()` 无法遍历的特性）
2. 模块单例 //利用`Symbol.for`的全局性，依然 可以在操作过程中被修改，或者hack
  
  ```javascript 
  //module.js
  const MODULE_NAME = Symbol.for('neyio_module');
  const g = window||global;
  let module = null;
  const ModuleConstructor = function(){
    //...
  }
  if(!module){
    module = new ModuleConstructor();
  }
  g[MODULE_NAME] = module;
  export default g[MODULE_NAME];
  ```
  稍作修改  `const MODULE_NAME = Symbol.for('neyio_module')` 修改为 `const MODULE_NAME = Symbol('neyio_module')` ;外部将很难修改，除非导出 `MODUL_NAME`,再对`g[MODUL_NAME]`做修改,主要是利用了无法访问到这个属性的特性。

3. 作为过渡的变量使用，用后删除，防止覆盖，接下看一个apply的实现
  ```javascript
  Function.prototype._apply = function(obj,...args){
    obj = obj||window||global;
    const symbolFn = Symbol('fn');
    obj[symbolFn] = this;
    const ans = obj[symbolFn](...args);
    delete obj[symbolFn];
    return ans;
  }
  const obj ={name:"neyio"};
  const obj2 = {getName(suffix=''){return `${this.name}+${suffix}`;}};
  obj2.getName._apply(obj,'suffix');//neyio+suffix
  ```

4. 作为Symbol作为私有key

```javascript
const foo = Symbol('foo');
class Person{
  constructor(){
    this.name = 'neyio';
  }
  [foo](){
    return this.name;
  }
  bar(){
    return  this[foo]();
  }
}
```
   
### 3.内置的11个Symbol

只介绍一个吧`Symbol.hasInstance`
   
```javascript
class MyClass {
  [Symbol.hasInstance](foo){
    return foo instanceof Array;
  }
}
[1,2,3] instanceof MyClass

```


## 16.Set和Map

### 1.Set用法和示例
?> Set 是一种 key和value一致的数据结构，values，keys，返回结果相同entries返回一个两个相同数据的元组

#### 1.数组和Set转换 
> 不想用Set的退路，但是一定要拥抱时代变化，以及认清使用场景
```javascript
const arr =  Array.from(new Set([1,2,3]));
const set = new Set(arr);
console.log(arr);
console.log(set);//Set(3) {1, 2, 3}
const arr2 = [...set];
console.log(arr2);// [1,2,3]
```

#### 2.基本使用方法

```javascript
const set = new Set([1,2,3]);
set.add('neyio');
for(let i of set){
  console.log(i);
}// 1，2，3，neyio
for(let i in set){
  console.log(i) ；//不会执行
}

```
1. 获取长度 `[size]`
2. 增加成员`[add]`
3. 删除成员`[delete]`
4. 判断成员`[has]`
5. clear清空
   
```javascript
const set = new Set([1,2,3]);
set.add(2);
console.log(set);// Set(3) {1, 2, 3}//保证了唯一性
set.delete(2);
console.log(set);// Set(2) {1, 3}//
set.has(2);//false
```

#### 3.遍历`keys(),value(),entries(),forEach()`前两个方法返回的都是遍历器对象，结果一致，后两个几乎一致

```javascript
//forEach第二参数用于改变this绑定
const set = new Set([1,2,3])
set.forEach((value,key)=>{
  console.log(value,key); 
});
// 1 1
// 2 2
// 3 3
const obj = {
  name:'neyio'
}
set.forEach((value,key)=>{
  console.log(this);// window,注意不要使用箭头函数，否则无法变更this绑定
},obj);

set.forEach(function(value,key){
  console.log(this);// {name: "neyio"}
},obj);
```

#### 4.例子：数组去重

```javascript
const duplicateRemoval = (arr)=>{
  return Array.from(new Set(arr));
} 
```


#### 5.例子: 实现交\并\差集

```javascript

const union = (arr1,arr2)=>{
  return Array.from(new Set([...arr1,...arr2]));
} 
union([1,2,3],[1,2,3,4]);// [1, 2, 3, 4]

const intersect = (arr1,arr2)=>{
  const set = new Set(arr2);
  return arr1.filter(i=>set.has(i));
}
intersect([1,2,3],[2]);//[2]

const difference = (arr1,arr2)=>{
  const set = new Set(arr2);
  return arr1.filter(i=>!set.has(i));
}
difference([1,2,3],[2]);//[1,3]

```


### 2.WeakSet用法和示例

!> WeakSet 的 key 只能是 object(不含null)，不能是Symbol, WeakSet没有size，没有遍历器， 其余跟set用法相似，然而最大的差别是在于他的key指向的对象内存地址一旦被回收，不管weakSet是否还存在，一样都会被强制回收 。

有且仅有三个方法 `add`,`has`,`delete`，访问 `size,forEach`均为`undifined`

##### 探究this和构造函数生成的值是否相等
```javascript
const ws = new WeakSet([]);

const Person = function(){
  ws.add(this);
  this.name  = 'neyio';//构造函数中的this，跟生成的新对象的地址是一致的
}

const a = new Person();
ws.has(a);//true //构造函数中的this，跟生成的新对象的地址是一致的
// ws.add(null);//报错
//ws.add(Symbol('neyio'));//报错

```

### 3.Map基本用法

!> Object的key只能是字符串，而实际上对象应该更倾向于hash键值对。
#### 1.初始化
```javascript
cont m = new Map();
const map = new Map([
  ['key','value'],
  [m,'Everything is ok!']
])
console.log(map);//Map(2) {"key" => "value", Map(0) => "anything is ok!"}
console.log(map.get(m));//Everything is ok!

```
#### 2. 改(set)删(delete)查(get)及size

```javascript
const map = new Map([]);
map.set('name','neyio');
map.set('age','18');
map.set('age','18');
map.size;// 2
const others  = {foo:"bar"};
map.set(others,"foobar");
const getName = function(){
 return this.name; 
}
map.set(getName,'haha');
map.get(getName);// haha
map.get(others);// foobar

map.has(others);// true

map.delete(others);//true
map.has(others);//false
map.size;// 3
map.clear();//清空hash表
```

#### 3.遍历

1. keys 获取 key 迭代器
2. values 获取 value 迭代器
3. entries 获取 [key,value] 迭代器
4. forEach 遍历方法，获取内容同上entries [key,value]
```javascript
const map = new Map([
  ['k1','v1'],
  ['k2','v2']
]);
const obj = {
  name:'neyio',
  getName:function(suffix=""){
    return `${this.name}+${suffix}`;
  }
}
map.forEach(function(value,key){
  console.log(this.getName(value),this.name,key,value);
  //不要使用箭头函数

},obj);
// neyio+v1 neyio k1 v1
// neyio+v2 neyio k2 v2
```


#### 4.Set转化成Map

> 等同于数组的转化
```javascript
const set = new Set([
  ['k1','v1'],
  ['k2','v2']
])
const map = new Map(set);
console.log(map);
console.log(map.get(k1),map.get(k2));
```

#### 5.WeakMap

同weakSet的要求和使用方式

!> 对dom操作不熟悉，本代码可能存在问题
```javascript
const wm = new WeakMap([]);
const foo =  document.getElementById('foo');
const bar =  document.getElementById('bar');
wm.set(foo,'foo');
wm.set(bar,'bar');
document.removeChild(foo);
document.removeChild(bar);

```


## 17.Proxy

> 我知道这是一个好玩的东西，但是因为不求甚解，在实战项目中用的也很少，足以证明我是一个彩笔，但是今天的面试官动不动就说，你会Vue的代码把，那你实现一下MVVM（尤大笑晕在厕所），那你说下他是怎么实现的。原理你总知道把，知道，getter，setter...



### Proxy和Reflect的用法简析

> Proxy主要是用来修改某些操作的默认行为，从这个角度来讲，你可以把他理解成一个拦截器。想要访问对象，都要经过这层拦截。那么我们就可以在这层拦截上做各种操作了。比如你设置一个对象的值的时候，对对象的值进行校验等。
> 注意这一句如果一个属性不可配置（configurable）和不可写（writable），则该属性不能被代理，通过 Proxy 对象访问该属性会报错。

#### Proxy 支持的拦截操作一共 13 种：

1. `get(target, propKey, receiver)`：拦截对象属性的读取，比如`proxy.foo`和`proxy['foo']`。如果一个属性不可配置（configurable）和不可写（writable），则该属性不能被代理，通过 Proxy 对象访问该属性会报错。
2. `set(target, propKey, value, receiver)`：set方法的第四个参数receiver，总是返回this关键字所指向的那个对象，即proxy实例本身。代表拦截对象属性的设置，比如proxy.foo = v或proxy['foo'] = v，返回一个布尔值。
3. `has(target, propKey)`：拦截`propKey in proxy`的操作，返回一个布尔值。值得注意的是，has方法拦截的是`HasProperty`操作，而不是`HasOwnProperty`操作，即has方法不判断一个属性是对象自身的属性，还是继承的属性。
4. `deleteProperty(target, propKey)`：拦截`delete proxy[propKey]`的操作，返回一个布尔值。
5. `ownKeys(target)`：拦截`Object.getOwnPropertyNames(proxy)`、`Object.getOwnPropertySymbols(proxy)`、`Object.keys(proxy)`，返回一个数组。该方法返回目标对象所有自身的属性的属性名，而`Object.keys()`的返回结果仅包括目标对象自身的可遍历属性。
6. `getOwnPropertyDescriptor(target, propKey)`：拦截`Object.getOwnPropertyDescriptor(proxy, propKey)`，返回属性的描述对象。
7. `defineProperty(target, propKey, propDesc)`：拦截`Object.defineProperty(proxy, propKey, propDesc）`、`Object.defineProperties(proxy, propDescs)`，返回一个布尔值。
8. `preventExtensions(target)`：拦截`Object.preventExtensions(proxy)`，返回一个布尔值。
9. `getPrototypeOf(target)`：拦截`Object.getPrototypeOf(proxy)`，返回一个对象。
10. `isExtensible(target)`：拦截`Object.isExtensible(proxy)`，返回一个布尔值。这个方法有一个强限制，它的返回值必须与目标对象的isExtensible属性保持一致，否则就会抛出错误。
11. `setPrototypeOf(target, proto)`：拦截`Object.setPrototypeOf(proxy, proto)`，返回一个布尔值。如果目标对象是函数，那么还有两种额外操作可以拦截。
12. `apply(target, object, args)`：拦截 Proxy 实例作为函数调用的操作，比如`proxy(...args)、proxy.call(object, ...args)`、`proxy.apply(...)`。
13. `construct(target, args)`：拦截 Proxy 实例作为构造函数调用的操作，比如`new proxy(...args)`。


### 1. get方法 
```javascript
const person = {
	name: 'neyio'
};

const proxy = new Proxy(person, {
	get: function(target, property) {
		if (property in target) {
			// 等价于 target.hasOwnproperty(property)
			return target[property];
		} else {
			throw new Error(`${property} does not exsist;`);
		}
	}
});

console.log(proxy.name); //neyio
console.log(proxy.age); //Error: age does not exsist;


```

#### 稍作修改,验证get方法可以继承


```javascript

const person = {
	name: 'neyio'
};

const proxy = new Proxy(person, {
	get: function(target, property) {
		if (property in target) {
			return target[property];
		} else {
			throw new Error(`${property} does not exsist;`);
		}
	}
});
const person2 = Object.create(proxy);
try {
	//console.log(person2);//不要进行输出，否则会报 Cannot convert a Symbol value to a string
	console.log(person2.age); //throw error 进行catch处理
	console.log(person2.name); //继续执行 输出neyio
} catch (e) {
	console.log(e.message); // age does not exsist;
}

```

#### 示例 拦截数组负数索引

```javascript
// ---- 拦截数组负数索引

const createArray = (...arr) => {
	const target = [ ...arr ];
	const handler = {
		get: function(target, property, receiver) {
			let index = Number(property);
			if (!Number.isInteger(index)) {
				throw new Error('');
			}
			if (index < 0) {
				index = target.length + index;
			}
			return Reflect.get(target, index, receiver);
		}
	};
	return new Proxy(target, handler);
};

const arrProxy = createArray(1, 2, 3);
console.log(arrProxy[1], arrProxy[-1]); //2 3
```

#### 示例 实现链式调用
```javascript
const actionsFns = {
	double: (x) => x * 2,
	plusOne: (x) => x + 1,
	minusOne: (x) => x - 1
};

const pipProxy = (actions = actionsFns) => {
	const fns = [];
	const handler = {
		get: function(target, property, receiver) {
			if (property !== 'get') {
				if (actions.hasOwnProperty(property)) {
					fns.push(actions[property]);
					return receiver;
				} else {
					throw new Error(`action function ${property} does not exsist!`);
				}
			} else {
				return (initial) =>
					fns.reduce((acc, current) => {
						return current(acc);
					}, initial);
			}
		}
	};
	return new Proxy(fns, handler);
};

const ans = pipProxy().plusOne.double.minusOne.get(1);
console.log(ans); //3
```

#### 示例 实现快速Element创建

```javascript
// ---- 生成 _DOM 树

const domCreator = () => {
	const handler = {
		get: function(target, property, receiver) {
			return (attributes = {}, ...children) => {
				const el = document.createElement(property);
				Object.entries(attributes).map(([ key, value ]) => {
					el.setAttribute(key, value);
				});
				children.map((child) => {
					el.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
				});
				return el;
			};
		}
	};
	return new Proxy({}, handler);
};
const _DOM = domCreator();
const domEl = _DOM.div(
	{ style: `background:#000;color:#fff;z-index:10001;` },
	_DOM.a({ href: 'http://neyio.cn' }, `neyio's site`),
	_DOM.ul(
		{},
		_DOM.li({}, '这是第一行'),
		_DOM.li({}, '这是第二行'),
		_DOM.li({}, '这是第三行'),
		_DOM.li({}, '这是第四行'),
		_DOM.h1({}, '标题')
	)
);
document.body.appendChild(domEl);
```


### 2. set验证数据 
```javascript
const Validator = () => {
	const handler = {
		set: function(target, key, value, receiver) {
			if (key === 'name' && value !== 'neyio') {
				throw new Error('name must be neyio');
			}
			target[key] = value;
		}
	};
	return new Proxy({}, handler);
};

const user = Validator();
try {
	user.name = 'neyio';
	console.log(user.name);
	user.name = 'laoqian';
} catch (e) {
	console.log(e.message); //Error: name must be neyio
}
```
### 3.apply包裹函数
// 如果 target 是一个函数，调用 proxy包裹的target会被 handler的apply捕获
// ctx是apply对象和call入参的第一参数，如果直接调用方法ctx为undefined

```javascript
const fnApply = (fn) => {
	const handler = {
		apply: function(target, ctx, args) {
			console.log(ctx && ctx.name); //此处的ctx是apply对象和call触发的，如果直接调用方法ctx为undefined
			return target(...args);
		}
	};
	return new Proxy(fn, handler);
};

const wrappedFn = fnApply((a, b) => {
	return a + b;
});

console.log(wrappedFn(1, 2)); // 3;

const fnPerson = {
	name: 'neyio'
};

const fnAns = wrappedFn.call(fnPerson, 1, 2);
console.log('TCL: fnAns', fnAns);


```
### 4.has(target,property)

>  判断key是否存在 
> 
```javascript
//...
const handler ={
  has:function(target,key){
    return key in target;
  }
}
//...

```

### 5.construct拦截目标对象

```javascript
let _proxyConstructAddress = null;

const constructProxy = new Proxy(function() {}, {
	construct: function(target, args, newTarget) {
		_proxyConstructAddress = newTarget; //等同于  constructProxy
		target = { ...args };
		target.name = 'neyio';
		return target;
	}
});
const _constructProxyDemo = new constructProxy(1, 2);
console.log(_constructProxyDemo); //{ '0': 1, '1': 2, name: 'neyio' }
console.log(_proxyConstructAddress === constructProxy); // 代理后的构造器的地址 true
```

### 6.可取消的实例 revocable

```javascript
// revocable

let target = {
	foo: 'bar'
};
let handler = {
	get: function() {
		return 'neyio';
	}
};
let { proxy: proxyRevocable, revoke } = Proxy.revocable(target, handler);
console.log('TCL: proxy.foo before', proxyRevocable.foo); //TCL: proxy.foo before neyio
revoke();
try {
	console.log('TCL: proxy.foo end', proxyRevocable.foo); // Error:revoked. 结束代理后，拒绝访问目标对象
} catch (e) {
	console.log(e.message); // Cannot perform 'get' on a proxy that has been revoked
```

#### 7.其他用法

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/construct

`defineProperty`,`deleteProperty`,`defineProperty`,`getOwnPropertyDescriptor`,`getPrototypeOf`,`isExtensible`,`ownKeys`,`preventExtensions`,`setPrototypeOf`

!> 注意this指向


## 18.Reflect

自行查阅 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect


## 19.Promise 


> Promise的三种 状态  分别为 pending,fulfilled,rejected； Promise.all 和 Promise.race  前者所有resolve则resolve，后者第一个到达即resolve  Promise.resolve 生成Promise并触发resolve状态改变fulfilled，Promise.reject用于触发一个rejected状态转变

```javascript

const pm = new Promise(function(resolve, reject) {
	setTimeout(() => {
		resolve({ name: 'neyio' });
	}, 3000);
});
pm.then((res) => {
	console.log(res); // { name: 'neyio' } 第一次等3s
});
pm.then((res) => {
	console.log(res); // { name: 'neyio' } 第二次微观队列直接操作
});

const setTimeoutWrapper = (fn, timeout, ...args) => {
	return new Promise((resolve, reject) => {
		setTimeout((...args) => resolve(fn(...args)), timeout, ...args);
	});
};

const sum = (a, b) => a + b;
setTimeoutWrapper(sum, 1000, 1, 2).then((res) => {
	console.log(res); // 1秒后执行
});

// Promise 的 微观队列和宏观队列

console.log('start'); // 同步方法  时序1

setTimeout(() => {
	console.log(1); // 宏观队列[0]  时序2
});

new Promise(function(resolve) {
	console.log(2); // 同步方法 2
	resolve(); // 微观队列[0]  时序3
	console.log(3); //同步方法 4
}).then(() => {
	console.log(4);
});

Promise.resolve(true).then((res) => {
	console.log(5); //微观队列[1] 时序4
});

setTimeout(() => {
	console.log('6'); // 宏观队列[1]
});
setTimeout(() => {
	console.log('7'); // 宏观队列[2]
});
console.log('end'); // 同步方法

//start 2 3 end 4 5 1 6 7

```


### 20. Iterator

> 遍历器，把它想象成一个generator对象。要适用于被·for ... of 循环调用
```javascript
function makeIterator(arr){
  let index = 0;
  return {
    next:function(){
      return index< arr.length? {
        value:arr[index++],done:false
      }:{
        value:undefined,
        done:true
      }
    }
  }
}
const it = makeIterator([1,2,3]);
it.next().value;//1
it.next().value;//2
it.next().value;//3

```


### Object默认Iterator接口

```javascript
const obj = {
  [Symbol.iterator]:function(){
    return {
      next:function(){
        return {
          value:1,
          done:true
        }
      }
    }
  }
}


```

### Array [Symbol.iterator]

```javascript
let arr = ['a','b','c'];
let it = arr[Symbol.iterator]();
it.next().value;// a
it.next().value;// b
it.next().value;// c
```


## 20.Generator 见 提升部分详解

## 21.Class
> 本文只介绍static 和super

```javascript

class Square extends Polygon {
	constructor(length) {
		// 在这里, 它调用了父类的构造函数, 并将 lengths 提供给 Polygon 的"width"和"height"
		super(length, length);
		// 注意: 在派生类中, 必须先调用 super() 才能使用 "this"。
		// 忽略这个，将会导致一个引用错误。
		this.name = 'Square';
	}
	get area() {
		return this.height * this.width;
	}
	set area(value) {
		// 注意：不可使用 this.area = value
		// 否则会导致循环call setter方法导致爆栈
		this._area = value;
	}
}

// ----

class Polygon {
	constructor() {
		this.name = 'Polygon';
	}
}

class Square extends Polygon {
	constructor() {
		super();
	}
}

class Rectangle {}

Object.setPrototypeOf(Square.prototype, Rectangle.prototype); //这里，Square类的原型被改变，但是在正在创建一个新的正方形实例时，仍然调用前一个基类Polygon的构造函数。

console.log(Object.getPrototypeOf(Square.prototype) === Polygon.prototype); //false
console.log(Object.getPrototypeOf(Square.prototype) === Rectangle.prototype); //true

let newInstance = new Square();
console.log(newInstance.name); //Polygon

// 静态方法

class Tripple {
	static tripple(n = 1) {
		return n * 3;
	}
}

class BiggerTripple extends Tripple {
	static tripple(n) {
		return super.tripple(n) * super.tripple(n);
	}
}

console.log(Tripple.tripple()); // 3
console.log(Tripple.tripple(6)); // 18

let tp = new Tripple();

console.log(BiggerTripple.tripple(3)); // 81（不会受父类实例化的影响）
console.log(tp.tripple()); // 'tp.tripple 不是一个函数'.

```

## 22.Module

> import 只能在模块顶层使用
### 1.常规使用
```javascript
import { A ,B ,C} from 'module.js';
export const A ;
export { A };
export { A as APro };
export default any[ function , var, object ... ];

import _,{ A , B ,C } from 'module.js';
export { A , B} from 'module.js';

export * from 'module.js';
export * as moduleB from 'module.js';

```

### 2.import方法

ES希望模块和模块组织结构尽可能是静态化，所以希望通过远端加载CDN地址的行为是不可取的，但是你可以在webpack中external某个模块，例如vue.js,然后再在index.html引入CDN，来优化性能。

```javascript
import('module.js').then(module=>{
  ...
})
//可以直接远端引入
import {A} from 'https://xxx.js' //未考证

```


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