const fabonacci = (current, gen, a, b) => {
	if (current > gen) return a;
	return fabonacci(current + 1, gen, b, a + b);
};

// 112358 13 21;
console.log(fabonacci(1, 1000, 1, 1));

const fabonacci2 = (gen, a, b) => {
	if (gen <= 0) return a;
	return fabonacci2(gen - 1, b, a + b);
};

// 112358 13 21;
console.log(fabonacci2(1000, 1, 1));
