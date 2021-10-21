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


// hash 제어
export const urlHash = {
	// { abc: 'foo', def: '[asf]', xyz: '5', foo: 'b=ar' }
	// abc=foo&def=%5Basf%5D&xyz=5&foo=b%3Dar
	convertJsonToQueryString(json = {}) {
		/*
		// URLSearchParams 활용
		return new URLSearchParams(json).toString();
		*/
		return Object.keys(json).map(function (key) {
			if (json[key]) {
				return encodeURIComponent(key) + '=' + encodeURIComponent(json[key]);
			} else {
				return encodeURIComponent(key);
			}
		}).join('&');
	},
  
	// abc=foo&def=%5Basf%5D&xyz=5&foo=b%3Dar
	// {abc: 'foo', def: '[asf]', xyz: '5', foo: 'b=ar'}
	convertQueryStringToJson(query = '') {
		/*
		// URLSearchParams 활용
		const params = new URLSearchParams(query); 
		return Object.fromEntries(params);
		*/
		//return JSON.parse('{"' + decodeURI(query).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
		return query.split('&').reduce((accumulator, item, index, list) => {
			const split = item.split('=');
			const key = split.shift();
			const value = split.shift() || '';
			if (key) {
				accumulator[key] = decodeURIComponent(value);
			}
			return accumulator;
		}, {});
	},
  
	// 해쉬값 불러오기
	get(key = '', { hash = window.location.hash } = {}) {
		let criteria = {};
		let result;
  
		// hash
		if (!hash) {
			hash = window.location.href.replace(/^[^#]*#?(.*)$/, '$1');
		}
  
		// '#' 제거
		/*if (hash.indexOf('#') === 0) {
			hash = hash.substring(1);
		}*/
		hash = hash.replace('#', '');
  
		try {
			criteria = this.convertQueryStringToJson(hash);
		} catch (error) {
			console.log(error);
		}
  
		if (criteria && typeof criteria === 'object') {
			if (!key) {
				result = criteria;
			} else if (key in criteria) {
				result = criteria[key];
			}
		}
  
		return result;
	},
  
	// 해쉬값 추가
	// 웹킷엔진은 location.hash -> location.href 값
	set(key = '', value = '') {
		const criteria = this.get() || {};
		let query;
  
		// 유효성 검사
		if (!key) {
			return;
		}
  
		// set
		try {
			criteria[key] = value;
			query = this.convertJsonToQueryString(criteria);
		} catch (error) {
			console.log(error);
		}
  
		if (query) {
			window.location.hash = '#' + query;
			//window.location.href = '#' + query;
		}
  
		return query;
	},
  
	// 해쉬 제거
	del(key = '') {
		const criteria = this.get() || {};
		let query;
  
		// 유효성 검사
		if (!key || !criteria || typeof criteria !== 'object') {
			return;
		}
  
		// delete
		try {
			if (key in criteria) {
				delete criteria[key]; // key 에 따른 데이터 제거
			}
			query = this.convertJsonToQueryString(criteria);
		} catch (error) {
			console.log(error);
		}
		window.location.hash = '#' + query;
		//window.location.href = '#' + query;
  
		return query;
	},
  
	// 해쉬값 존재여부
	has(key = '') {
		const criteria = this.get() || {};
		let is = false;
  
		// is
		if (key && criteria && typeof criteria === 'object' && key in criteria) {
			is = true;
		}
  
		return is;
	},
};
