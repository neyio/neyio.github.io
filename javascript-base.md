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