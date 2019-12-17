const compose = (...fns) => {
	return fns.reduce((acc, current) => {
		return (cb) => {
			return acc(current(cb));
		};
	}, (a) => a);
};

const funcs = [ (x) => x + 1, (x) => x * 3, (x) => x - 1 ]; //应该等于 13
const output = compose(...funcs);
console.log(output(5)); //输出 13，代码测试成功
