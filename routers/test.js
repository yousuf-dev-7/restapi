const v8 = require('v8');
let data =   {hello: "mohamed", age : "25"};
let jsondata = JSON.stringify(data);
console.log(jsondata)
// Calling v8.serialize() 
const stream = v8.serialize(jsondata);
console.log(stream)
console.log(v8.deserialize(stream))

let today = new Date().toLocaleDateString("bn-IN");
console.log(today)

var dNow = new Date();
var s =   dNow.getDate() + '/' + ( dNow.getMonth() + 1 ) + '/' + dNow.getFullYear();

console.log(s)