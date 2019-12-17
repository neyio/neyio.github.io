# 基础变量类型及常用函数方法

## 异步控制流(其一)

> 如何手写一个自动执行的异步流?其实刚入门的时候，对Generator一无所知，相当于打开ES6的语法一脸懵逼，什么yield，什么function*很反人类，这很正常，只不过在语法层面确实有点不像C，但是学习起来并没有那么难。

```javascript
const asyncFlow = (generatorFn) => {
	const gen = generatorFn(function callback(err, ...results) {
		if (err) {
			return gen.throw(err);
		}
		console.log(results);
		gen.next(results.length > 1 ? results : results[0]);
	});
	gen.next();
};
const sum = (a, b) => a + b;
const call = (fn, ...rest) => {
	const args = rest.slice(0, -1);
	const callback =
		rest[rest.length - 1] ||
		((a) => {
			return a;
		});
  // callback(null, fn(...args)); 
  // 不使用 setTimeout该代码 存在错误 =>  gen.next(results.length > 1 ? results : results[0]);  ^TypeError: Generator is already running 此时yield的任务还未标志为完成，在callback中启动了下一次操作，故发生错误
	setTimeout(() => callback(null, fn(...args)));
};

function* test(callback) {
	const a = yield call(sum, 0, 1, callback);
	console.log(a);
	const b = yield call(sum, a, 2, callback);
	console.log(b);
	const c = yield call(sum, b, 3, callback);
	console.log(c);
	const d = yield call(sum, c, 4, callback);
	console.log(d);
	return d;
}

asyncFlow(test);
```


## 异步控制流(其二)
> 此时你觉得渐入佳境了，然而我并不希望每次generate方法都带有callback的入参，我希望能够干掉这个参数，那么在干掉之前，我们想一下怎么干掉，如果它要少一个入参，最好的办法就是对它进行一个柯里化
```javascript
const run = (generatorFn, cb) => {
	function next(err, res) {
		if (!err) {
			if (typeof res === 'object' && res.then && typeof res.then === 'function') {
				return res.then((_res) => {
					const { done, value } = genFn.next(_res);
					if (done) {
						cb(value);
					}
				});
			}
			return Promise.resolve().then(() => {
				const { done, value } = genFn.next(res);
				if (done) {
					cb(value);
				}
			});
		}
		return Promise.resolve().then(() => genFn.throw(err));
	}
	const genFn = generatorFn(next);
	genFn.next();
};

const delay100 = (...args) => {
	return new Promise((res, rej) => {
		setTimeout(() => res(args.reduce((acc, i) => acc + i), 0), 100);
	});
};

const testCase = async (...args) => {
	console.log('TCL: testCase -> args', args);
	try {
		return await delay100(...args);
	} catch (e) {
		throw e;
	}
};

const convertToThunk = (fn, ...args) => {
	return async (next) => {
		try {
			const ans = await fn(...args);
			console.log('TCL: convertToThunk -> ans', ans);
			next(null, ans);
		} catch (e) {
			next(e, null);
		}
	};
};

function* generatorExample(next) {
	const a = yield convertToThunk(testCase, 0, 1)(next);
	console.log(a);
	const b = yield convertToThunk(testCase, a, 2)(next);
	console.log(b);
	const c = yield convertToThunk(testCase, b, 3)(next);
	console.log(c);
	const d = yield convertToThunk(testCase, c, 4)(next);
	console.log(d);
	return d;
}

run(generatorExample, (res) => {
	console.log('finally', res);
});

```

## 异步控制流(其三)
> 终于走到了这一步，那么我们就可以通过在 执行函数中对它进行调整，设想一下如果next返回的是{value,done}的value属性是一个函数结构类似 (callback)=>{...}，然后我们进行对它进行调用，并使用next作为参数则能实现去掉参数。现在我能够从 （其二） 推导至下方代码，然而我依然没有能力跳过第二步进行书写第三步的代码，这显然好像有点烧脑子，我是该补充一下函数式编程的推导基础知识了。

```javascript
const run = (generatorFn, cb) => {
	function next(err, res) {
		if (!err) {
			if (typeof res === 'object' && res.then && typeof res.then === 'function') {
				return res.then((_res) => {
					const { done, value } = genFn.next(_res);
					value && typeof value === 'function' && value(next);
					if (done) {
						return cb(value);
					}
				});
			}
			return Promise.resolve().then(() => {
				const { done, value } = genFn.next(res);
				console.log('TCL: next -> value', value);
				value && typeof value === 'function' && value(next);
				if (done) {
					return cb(value);
				}
			});
		}
		return Promise.resolve().then(() => genFn.throw(err));
	}
	const genFn = generatorFn(next);
	const thunk = genFn.next().value;
	thunk && typeof thunk === 'function' && thunk(next);
};

const delay100 = (...args) => {
	return new Promise((res, rej) => {
		setTimeout(() => res(args.reduce((acc, i) => acc + i), 0), 100);
	});
};

const testCase = async (...args) => {
	console.log('TCL: testCase -> args', args);
	try {
		return await delay100(...args);
	} catch (e) {
		throw e;
	}
};

const call = (fn, ...args) => {
	return async (next) => {
		try {
			const ans = await fn(...args);
			console.log('TCL: call -> ans', ans);
			next(null, ans);
		} catch (e) {
			next(e, null);
		}
	};
};

function* generatorExample() {
	const a = yield call(testCase, 0, 1);
	console.log(a);
	const b = yield call(testCase, a, 2);
	console.log(b);
	const c = yield call(testCase, b, 3);
	console.log(c);
	const d = yield call(testCase, c, 4);
	console.log(d);
	return d;
}

run(generatorExample, (res) => {
	console.log('finally', res);
});

```


## 异步控制流(其四)
> AM 说: 可以手写 `async` `await`的词法去达到相似目的，下方代码可以手写一个babel的插件实现类似 `async` ,`await`
```javascript
new Promise((res,rej)=>{
    try{
      const gen =  asyncGen(...args,next);
      gen.next();
      function next(result){
        if((typeof result === 'object' || typeof result === 'function') && (!!result.then && typeof result.then === 'function')){
          //thenable 
          result.then(value=>{
            try{
              const {done,value:newValue} = gen.next(value);
              if(done) res(Promise.resolve(newValue));
            }catch(e){//捕获gen内部同步方法产生的异常throwError
              rej(e)
            }
          },error=>{
            console.log('b');
            try{
              gen.throw(error)
            }catch(e){//捕获gen内部产生的异常throwError（gen内部没有处理error）
              rej(e);
            }
          });
        }else{
          Promise.resolve().then(()=>{
            try{
              const {done,value:newValue} = gen.next(result);
              if(done) res(Promise.resolve(newValue));
            }catch(e){//捕获gen内部产生的异常throwError
              rej(e)
            }
          });
        }
      }
    }catch(e){//捕获gen内部产生的异常throwError（第一次调用）
      console.log('a');
      rej(e);
    }
  })

const throwError = ()=>{
  throw new Error('hhhh')
};
const promiseError =()=> new Promise((res,rej)=>{
  rej('h');
})
try{
  run(function*(next){
    try{
      const c = yield next('c');
      // const b = yield next(throwError());
      const b = yield next(promiseError());
      // throw new Error('hhhh');
    }catch(error){
      console.log('e');
      throw error;
    }
    const a = yield next(1);
    return 'hello wold';
  }).then(ans=>console.log(ans),e=>{
    console.log('c');
  }) 
}catch(e){
  console.log('d');
  console.log(e);
}
```

## 控制同时执行的并发任务数 

```javascript
const tasks = Array.from({ length: 30 }).map((_, i) => {
	return (callback) => {
		setTimeout(() => {
			console.log(i);
			callback(i);
		}, 1000);
	};
});
let currentRunIndex = 0;
let finished = 0;
let concurrency = 0;
let concurrencyLimit = 2;
const finish = () => {
	console.log('finished');
};
const next = () => {
	while (concurrency <= concurrencyLimit && currentRunIndex < tasks.length) {
		const task = tasks[currentRunIndex++];
		concurrency++;
		console.log(`run at ${currentRunIndex} concurrency is ${concurrency},finished is ${finished}`);
		task(() => {
			if (finished === tasks.length) {
				return finish();
			}
			finished++;
			concurrency--;
			next();
		});
	}
};

next();

#pipeAsyncFunctions，函数式编程的reduce一向是比较难以理解的，如果你是个新人同学，你可以大致了解，但是未必一定要能够自己手动实现，当然如果能手动实现则更好，毕竟有那么多库你可以使用
const pipeAsyncFunctions = (...fns) => arg => fns.reduce((p, f) => p.then(f), Promise.resolve(arg));

const sum = pipeAsyncFunctions(
  x => x + 1,
  x => new Promise(resolve => setTimeout(() => resolve(x + 2), 1000)),
  x => x + 3,
  async x => (await x) + 4
);
(async () => {
  console.log(await sum(5)); // 15 
})();

```


## 函数式编程相关
### 通过reduce手写pipline

```javascript
const pipline = (...fns) => (initial) => {
	return fns.reduce((acc, current) => {
		return current(acc);
	}, initial);
};

const fns = [ (x) => x + 1, (x) => x * 2, (x) => x + 10 ];
const ans = pipline(...fns)(2);
console.log(ans);

```

### 通过reduce手写一个compose

> 需求是：给定多个参数（每个参数均为箭头函数，且入参有且仅有一个，通过数组的reduce方法生产一个能够compose的函数）。

即 `function compose(...functions){ ... }` => 逆向执行functions

此处最大的疑问其实是如何做到这样的反向执行，或者说反向执行最大的难点，摸不清的地方在哪里。
我自己的思考是从最后一个被执行的箭头函数开始反向推理，如果我要做到这样的结果必须满足一个条件，也就是形成一个`f1(...fn-2(fn-1 (fn(param))))`这样的调用结构，我们截取最后"两次"调用，会发现 acc (也就是previousValue，后续文章中我都会称其为累计值，命名为acc) 是一个可以执行的函数（**变更reduce函数的关键就在于如何组织acc**），`fn`位置的acc应当为 `(参数) => acc(fn(参数)))`,由此推断出下方片段
```javascript 
function compose(...functions){
  return functions.reduce((acc,current)=>{
    // return (参数)=> acc( fn(参数) ) 此处结构 为推导的结构。
  },(...)=>{...});
}
```
那么实际上我们仔细去推敲 `fn` ，发现 `fn`即为当前的function(即reduce第一个参数的函数中的参数current) ，那就直接变换为`(param)=> acc(current(param) ) `
```javascript
function compose(...functions){
  return functions.reduce((acc,current)=>{
    return (param)=> acc(current(param) );
  },(...)=>{...});
}
```
此处剩余最大的问题是`f1`的acc是什么（也就是初始迭代函数是什么）, 答案是 `(a) => (a)`,原样返回，此处不作解释，自己再体会一下。
```javascript
function compose(...fns){
  return fns.reduce((acc,current)=>{
    return (callback)=> acc(current(callback) ); //此处我习惯把 param 改为 callback，也就是 nextFunction的 返回值
  },(a)=>a);
}
const funcs = [ (x) => x + 1, (x) => x * 3, (x) => x - 1 ]; // 当x=5时，结果应该等于 13
const output = compose(...funcs);
console.log(output(5));// 13
```


### 如何使用reduce写一个reduceRight函数

> 此时我们会设想如果我要reduceRight，如何操作，一种方式是通过compose执行同一个方法实现，另外一种是重新写一个

如果你不是一直以函数式编程编写的代码的coder，这段代码可能是很难以一时半会儿让你能够理解的。不要感觉灰心丧气，因为我每隔一段时间都很难快速推演出这个方法，难以理解的地方主要有三个
1. (a)=>a 的初值。
2. 究竟reduce过程函数返回值  `(acc) => preFnAcceleraterValue(fn(acc, current));  `在传递什么，是值还是方法，此处的`acc` 和 `preAcceleraterFn`的差别，备注：此处`preAcceleraterFn`是生成函数，`acc`是确切的值。
3. 记住一点， 要形成逆序执行的最基本点 就是 `preAcceleraterFn` 要比 当前的运算后进行，反之就是说，当前的 `fn` 的运算结构要先于 `preAcceleraterFn`。

```javascript
const reduceRight = (arr, fn, initial) => {
	return arr.reduce((preAcceleraterFn, current) => {
		return (acc) => preAcceleraterFn(fn(acc, current)); 
	}, (a) => a)(initial);
};



const p = reduceRight(
	[ 1, 2, 3, 4, 5 ],
	(acc, current) => {
		console.log('TCL: acc, current', acc, current);
		return `${acc}.${current}`;
	},
	6
);

console.log(p);

```




## ES6的特性试炼


### 通过Proxy写一个Immer

> TODO： 为了探究和了解部分原理，揣摩一波，才又本章节，当然关键还是因为 `redux`的`reducer`模版函数略显复杂，如果我们在对同一个结构进行拷贝创建新的对象时，只修改了部分`kv`，但是我们需要深层次结构的进行简化`redux`的`reducer`返回进行调整.详见 https://github.com/immerjs/immer 不敢献丑，简单的揭示Proxy的使用和实现。
```javascript
 const getKey = (...args)=> Reflect.get(...args);
 const proxyImmer = (obj)=> new Proxy(
	  	obj,
		{
			get(...args) {
				if (!getKey(...args)) {
					if (Reflect.set(target, key, proxyImmer({}), receiver)) {
						return getKey(...args);
					} else {
						throw new Error('set key to object failed');
					}
				}
				return value;
			},
			set(target, key, value, receiver) {
				return Reflect.set(target, key, proxyImmer(value), receiver);
			}
    }
  //...
  const produce = (obj, fn) => {
    return diff(obj,fn(proxyImmer(obj)));
  };
```