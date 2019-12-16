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
