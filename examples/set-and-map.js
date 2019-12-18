let arr = [ 1, 1, 1, 2, 3 ];
//利用 set去重
const set = new Set(arr);
console.log((arr = Array.from(set))); // [1，2，3]
