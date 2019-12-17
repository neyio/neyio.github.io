const pipline = (...fns) => (initial) => {
	return fns.reduce((acc, current) => {
		return current(acc);
	}, initial);
};

const fns = [ (x) => x + 1, (x) => x * 2, (x) => x + 10 ];
const ans = pipline(...fns)(2);
console.log(ans);
