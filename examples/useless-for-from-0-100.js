const sum = (start, end, total = 0) => {
	if (start > end) return total;
	return sum(start + 1, end, total + start);
};

console.log(sum(1, 100));
