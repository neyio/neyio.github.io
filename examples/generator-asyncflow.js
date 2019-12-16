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
	// callback(null, fn(...args)); 不使用 setTimeout该代码 存在错误 =>  gen.next(results.length > 1 ? results : results[0]);  ^TypeError: Generator is already running 此时yield的任务还未标志为完成，在callback中启动了下一次操作，故发生错误
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
