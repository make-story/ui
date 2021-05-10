/**
 * url 
 * 
 */


/*
const queryString = window.location.search;
console.log(queryString);
// ?product=shirt&color=blue&newuser&size=m

const urlParams = new URLSearchParams(queryString);
const product = urlParams.get('product')
console.log(product); // shirt

const color = urlParams.get('color')
console.log(color); // blue
const newUser = urlParams.get('newuser')
console.log(newUser);// empt

console.log(urlParams.has('product')); // true
console.log(urlParams.has('paymentmethod')); // false

console.log(urlParams.getAll('size')); // [ 'm' ]

urlParams.append('size', 'xl');
console.log(urlParams.getAll('size')); // [ 'm', 'xl' ]
*/


// javascript url to object
// https://stackoverflow.com/questions/8648892/how-to-convert-url-parameters-to-a-javascript-object 


/*
var url_string = "http://www.example.com/t.html?a=1&b=3&c=m2-m3-m4-m5"; //window.location.href
var url = new URL(url_string);
var c = url.searchParams.get("c");
console.log(c);
*/

// 2021 ES6/7/8
// https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
// new URLSearchParams(location.search)

/*
var url = new URL("http://foo.bar/?x=1&y=2");
// If your expected result is "http://foo.bar/?x=1&y=2&x=42"
url.searchParams.append('x', 42);
// If your expected result is "http://foo.bar/?x=42&y=2"
url.searchParams.set('x', 42);
*/
