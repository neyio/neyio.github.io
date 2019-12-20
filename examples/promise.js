// Promise
// 三种状态 `pending`, `fulfilled`, `rejected`
// 状态由pending改变后不改变状态

// !>特性，如果状态发生了改变后，再次添加callback函数，也会理解得到结果。

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
})
	.then(() => {
		console.log(4);
	})
	.then(() => {
		console.log('additional1');
	});

Promise.resolve(true)
	.then((res) => {
		console.log(5); //微观队列[1] 时序4
	})
	.then(() => {
		console.log('additional2');
	});
setTimeout(() => {
	console.log('6'); // 宏观队列[1]
});
setTimeout(() => {
	console.log('7'); // 宏观队列[2]
});
console.log('end'); // 同步方法

//start 2 3 end 4 5 additional1 additional2 1 6 7

const p1 = new Promise(function(resolve) {1
	throw new Error('p1 error');
});
p1
	.then(() => {
		console.log('p1 resolved');
	})
	.catch(() => {
		console.log('p1 rejected');
	});
//p1 rejected
const p2 = new Promise(function() {
	throw new Error('p2 error');
});
p2
	.then(() => {
		console.log('p2 resolved');
	})
	.catch(() => {
		console.log('p2 rejected');
	});

Promise.all([ p1, p2 ])
	.then((res) => {
		console.log(res);
	})
	.catch((e) => {
		console.log('all', e); // catch第一个报错的代码
	});
// all Error: p2 error
