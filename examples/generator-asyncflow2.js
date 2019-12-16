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
