const reduceRight = (arr, fn, initial) => {
	return arr.reduce((acc, current) => {
		return (nextAccelerateValue) => acc(fn(nextAccelerateValue, current));
	}, (a) => a)(initial);
};

// f(f(acc)(n))(n - 2);

const p = reduceRight(
	[ 1, 2, 3, 4, 5 ],
	(acc, current) => {
		console.log('TCL: acc, current', acc, current);
		return `${acc}.${current}`;
	},
	6
);

console.log(p);
