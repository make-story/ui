/*
Utility

@date (버전관리)
2015.07.07

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

@browser compatibility

*/

;(function(global) {

	'use strict'; // ES5
	if(typeof global === 'undefined' || global !== window) {
		return false;
	}else if(!global.api) {
		global.api = {};
	}

	global.api.util = {
		// 상속 - Object.create() 효과
		inherit: function(Child, Parent) {
			/*
			원칙적으로 재사용할 멤버는 this가 아니라 prototype(프로토타입)에 추가되어야 한다.
			따라서 상속되어야 하는 모든 것들도 프로토타입 안에 존재해야 한다.
			그렇다면 부모의 프로토타입을 똑같이 자식의 프로토타입으로 지정하기만 하면 될 것이다.

			프로토타입 체인의 이점은 유지하면서, 동일한 프로토타입을 공유할 때의 문제를 해결하기 위해
			부모와 자식의 프로토타입 사이에 직접적인 링크를 끊는다.
			빈 함수 F()가 부모와 자식 사이에서 프록시(proxy) 기능을 맡는다.
			F()의 prototype 프로퍼티는 부모의 프로토타입을 가리킨다. 이 빈 함수의 인스턴스가 자식의 프로토타입이 된다.

			자식 프로토타입이 수정되더라도 부모의 프로토타입에 영향을 주지 않는다.
			부모 생성자에서 this에 추가된 멤버는 상속되지 않는다. (재사용한다는 prototype 의미를 정확히 사용)
			*/
			var F = function() {};
			F.prototype = Parent.prototype;
			Child.prototype = new F();
			/*
			부모 원본에 대한 참조를 추가할 수도 있다.
			다른 언어에서 상위 클래스에 대한 접근 경로를 가지는 것과 같은 기능으로,
			경우에 따라 매우 편리하게 쓸 수 있다.
			*/
			Child.uber = Parent.prototype; // 상위 클래스 접근경로
			/*
			constructor 프로퍼티는 자주 사용되진 않지만 런타임 객체 판별에 유용하다.
			거의 정보성으로만 사용되는 프로퍼티이기 때문에, 원하는 생성자 함수를 가리키도록 재설정해도 기능에는
			영향을 미치지 않는다.
			*/
			Child.prototype.constructor = Child; // 생성자 재설정 (런타임시 객체 판별)
		},
		// deep copy
		// http://davidwalsh.name/javascript-clone
		clone: function clone(src, deep) { // src: target, deep: true|false
			if(!src && typeof src !== "object") {
				// any non-object ( Boolean, String, Number ), null, undefined, NaN
				return src;
			}

			var toString = Object.prototype.toString;

			// Honor native/custom clone methods
			if(src.clone && toString.call(src.clone) == "[object Function]") {
				return src.clone(deep);
			}

			// DOM Elements
			if(src.nodeType && toString.call(src.cloneNode) == "[object Function]") {
				return src.cloneNode(deep);
			}

			// Date
			if(toString.call(src) == "[object Date]") {
				return new Date(src.getTime());
			}

			// RegExp
			if(toString.call(src) == "[object RegExp]") {
				return new RegExp(src);
			}

			// Function
			if(toString.call(src) == "[object Function]") {
				return (function() {
					src.apply(this, arguments);
				});
			}

			var ret = null;
			var index = 0;
			if(toString.call(src) == "[object Array]") { // Array
				// [].slice(0) would soft clone
				ret = src.slice();
				if(deep) {
					index = ret.length;
					while(index--) {
						ret[index] = clone(ret[index], true);
					}
				}
			}else { // Object
				ret = src.constructor ? new src.constructor() : {};
				for(var prop in src) {
					ret[prop] = deep ? clone(src[prop], true) : src[prop];
				}
			}

			return ret;
		},
		// json deep copy
		jsonDeepCopy: function(original, copy) {
			// json object 를 string 으로 바꾸고, string 을 다시 object로 변경하는 방법을 사용한다.
			if(typeof original === 'object' && typeof copy === 'object') {
				return original = JSON.parse(JSON.stringify(copy));
			}else {
				return original;
			}
		},
		// deep Extend
		// deepExtend({}, objA, objB);
		/*deepExtend: function(out) {
			var i, key;
			var obj;

			out = out || {};

			for(i=1; i<arguments.length; i++) {
				obj = arguments[i];

				if(!obj) {
					continue;
				}

				for(key in obj) {
					if(obj.hasOwnProperty(key)) {
						if(typeof obj[key] === 'object') {
							out[key] = this.deepExtend(out[key], obj[key]);
						}else {
							out[key] = obj[key];
						}
					}
				}
			}

			return out;
		},*/
		// extend (deep copy)
		// extend({}, objA, objB);
		extend: function(out) {
			var i, key;

			out = out || {};

			for(i=1; i<arguments.length; i++) {
				if(!arguments[i]) {
					continue;
				}
				for(key in arguments[i]) {
					if(arguments[i].hasOwnProperty(key)) {
						out[key] = arguments[i][key];
					}
				}
			}

			return out;
		},
		// Deep extend/merge destination object with N more objects
		// http://andrewdupont.net/2009/08/28/deep-extending-objects-in-javascript/
		// Removed call to arguments.callee (used explicit function name instead)
		// extend({}, properties, {plyr: api})
		/*extend: function() {
			// Get arguments
			var objects = arguments;
			var destination, length;
			var i;
			var source, property;

			// Bail if nothing to merge
			if(!objects.length) {
				return;
			}
	
			// Return first if specified but nothing to merge
			if(objects.length === 1) {
				return objects[0];
			}
	
			// First object is the destination
			destination = Array.prototype.shift.call(objects);
			length = objects.length;
	
			// Loop through all objects to merge
			for(i=0; i<length; i++) {
				source = objects[i];
				for(property in source) {
					if(source[property] && source[property].constructor && source[property].constructor === Object) {
						destination[property] = destination[property] || {};
						this.extend(destination[property], source[property]);
					}else {
						destination[property] = source[property];
					}
				}
			}
	
			return destination;
		},*/
		// Element exists in an array
		// inArray(['a', 'b'], 'a')
		inArray: function(haystack, needle) {
			return Array.prototype.indexOf && (haystack.indexOf(needle) !== -1);
		},
		// Replace all
		// replaceAll(html, '{seektime}', config.seekTime);
		replaceAll: function(string, find, replace) {
			return string.replace(new RegExp(find.replace(/([.*+?\^=!:${}()|\[\]\/\\])/g, '\\$1'), 'g'), replace);
		},
		// 반응형 계산
		sizePercent: function(t, c) {
			//공식 : target / content = result
			//예제 : 60(구하고자하는 크기) / 320(기준) = 0.1875 -> 18.75%
			//예제 : 10 / 320 = 0.03125 -> 3.125
			var target = Number(t);
			//var content = c || api.env.grid.width;
			var content = Number(c);
			var result = (target / content) * 100;

			return result;
		},
		/*
		-
		IE는 캡쳐를 지원하지 않기 때문에 addEventListener 는 버블링으로 설정하여 사용하는 것이 좋음

		-
		캡쳐 : 이벤트가 발생 대상까지 전달되는 단계(아래로)
		버블링 : 발생 대상에서 document, window 까지 전달되는 단계(위로)

		-
		stopImmediatePropagation: 현재 이벤트가 상위뿐 아니라 현재 레벨에 걸린 다른 이벤트도 동작하지 않도록 중단한다.

		-
		stopPropagation: element 이벤트의 버블링(상위) 또는 캡쳐링(하위) 전파를 중지시킨다. addEventListener 의 세번째 파라미터 버블(false, IE기본값), 캡쳐(true)에 따라 작동
		preventDefault: 브라우저 기본 이벤트를 중지

		<a href="http://test.com">
			<div id="div">
				<img src="" id="img" />
			</div>
		</a>
		document.getElementById('div').onclick = function() { alert('div'); };
		document.getElementById('img').onclick = function() { alert('img'); };

		> 일반적인 이벤트(img를 클릭했을 경우): img -> div -> a 순서로 이벤트 발생
		> stopPropagation 사용: img 를 클릭했을 경우 div 이벤트를 막을 수 있다. 그러나 a 이벤트는 중지되지 않으며 href에 따른 페이지 이동이 발생한다.
		> preventDefault 사용: a 기본 이벤트인 href 의 이동을 중지 시킨다.
		*/
		// 현재 이벤트의 기본 동작을 중단한다.
		preventDefault: function(e) { // stopDefault
			// event.isDefaultPrevented() : event.preventDefault() 상태인지 체크 true / false
			var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event (IE8 이하: window.event)
			if(event.preventDefault) {
				event.preventDefault();
			}else {
				event.returnValue = false;
			}
		},
		// 현재 이벤트가 상위로 전파되지 않도록 중단한다.
		stopPropagation: function(e) { // stopBubbling
			// event.isPropagationStopped() : event.stopPropagation()이 호출 됐는지 여부 리턴 true / false
			var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event (IE8 이하: window.event)
			if(event.stopPropagation) {
				event.stopPropagation();
			}else {
				event.cancelBubble = true;
			}
		},
		// 기본이벤트, 캡쳐링, 버블링 동시 실행
		stopEventAction: function(e) { // stopEventDelivery
			this.preventDefault(e);
			this.stopPropagation(e);
		},
		// setTimeout (한번 실행)
		startCall: function(callback, seconds) {
			if(typeof callback !== 'function') return false;
			var seconds = seconds || 3000; //1000 -> 1초
			// 시간 작동
			var time = window.setTimeout(callback, seconds);
			return time;
		},
		// clearTimeout
		closeCall: function(time) {
			if(!time || time == null) return false;
			// 시간 중지
			window.clearTimeout(time);
		},
		// setInterval (반복 실행)
		startTime: function(callback, seconds) {
			if(typeof callback !== 'function') return false;
			var seconds = seconds || 3000; //1000 -> 1초
			// 시간 작동
			var time = window.setInterval(callback, seconds);
			return time;
		},
		// clearInterval
		closeTime: function(time) {
			if(!time || time == null) return false;
			// 시간 중지
			window.clearInterval(time);
		},
		// 대기 - 예: sleep(10000);
		sleep: function(milliSeconds) {
			var startTime = new Date().getTime(); // get the current time
			while(new Date().getTime() < startTime + milliSeconds); // hog cpu
		},
		/*
		// type 체크
		// https://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
		type({a: 4}); // "object"
		type([1, 2, 3]); // "array"
		(function() {console.log(type(arguments))})(); // arguments
		type(new ReferenceError); // "error"
		type(new Date); // "date"
		type(/a-z/); // "regexp"
		type(Math); // "math"
		type(JSON); // "json"
		type(new Number(4)); // "number"
		type(new String("abc")); // "string"
		type(new Boolean(true)); // "boolean"
		*/
		type: function(value) {
			return ({}).toString.call(value).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
		},
		// 좌우 공백 제거
		trim: function(text) {
			if(!text) {
				return text;
			}else {
				return String(text).replace(/(^\s*)|(\s*$)/g, "");
			}
		},
		// 키보드 이벤트 정보
		keyboardCode: function(e) {
			var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
			var code = event.which || event.keyCode;
			var key;
			switch(code) {
				//0
				case 48:
				case 96:
					key = '0';
					break;
				//1
				case 49:
				case 97:
					key = '1';
					break;
				//2
				case 50:
				case 98:
					key = '2';
					break;
				//3
				case 51:
				case 99:
					key = '3';
					break;
				//4
				case 52:
				case 100:
					key = '4';
					break;
				//5
				case 53:
				case 101:
					key = '5';
					break;
				//6
				case 54:
				case 102:
					key = '6';
					break;
				//7
				case 55:
				case 103:
					key = '7';
					break;
				//8
				case 56:
				case 104:
					key = '8';
					break;
				//9
				case 57:
				case 105:
					key = '9';
					break;
				//backspace
				case 8:
					key = 'backspace';
					break;
				//+
				case 107:
					key = '+';
					break;
				//-
				case 109:
					key = '-';
					break;
				//*
				case 106:
					key = '*';
					break;
				// /
				case 111:
				case 191:
					key = '/';
					break;
				//.
				case 110:
				case 190:
					key = '.';
					break;
				//tab
				case 9:
					key = 'tab';
					break;
				//end
				case 35:
					key = 'end';
					break;
				//end
				case 36:
					key = 'home';
					break;
				//esc
				case 27:
					key = 'esc';
					break;
				//delete
				case 46:
					key = 'delete';
					break;
				//enter
				case 13:
					key = 'enter';
					break;
				//left
				case 37:
					key = 'left';
					break;
				//up
				case 38:
					key = 'up';
					break;
				//right
				case 39:
					key = 'right';
					break;
				//down
				case 40:
					key = 'down';
					break;
			}

			if(key) {
				return {"code": code, "key": key};
			}else {
				return false;
			}
		},
		// window popup
		windowPopup: function(url, name, width, height, features) {
			/*
			//features
			- menubar : 메뉴바를 보여주거나 숨긴다. (옵션 : yes/no, 1/0)
			- toolbar : 도구막대를 보여주거나 숨긴다. (옵션 : yes/no, 1/0)
			- directories : 디렉토리바를 보여주거나 숨긴다. (옵션 : yes/no, 1/0)
			- scrollbars : 스크롤바를 보여주거나 숨긴다. (옵션 : yes/no, 1/0)
			- status : 상태표시줄을 보여주거나 숨긴다. (옵션 : yes/no, 1/0)
			- location : 주소표시줄을 보여주거나 숨긴다. (옵션 : yes/no, 1/0)
			- width : 팝업 윈도우의 가로크기를 지정한다. (옵션 : 픽셀)
			- height : 팝업 윈도우의 높이를 지정한다. (옵션 : 픽셀)
			- left : 팝업 윈도우의 x축 위치를 지정한다. (옵션 : 픽셀)
			- top : 팝업 윈도우의 y축 위치를 지정한다. (옵션 : 픽셀)
			- resizable : 팝업윈도우의 크기를 사용자가 임의로 수정할 수 있는지 여부를 지정한다. (옵션 : yes/no, 1/0)
			- fullscreen : 전체화면 모드로 열어준다.
			- channelmode : 채널모드 창으로 열어준다.
			 */
			var popup;
			var name = name || 'popup';
			var width = width || 400;
			var height = height || 600;
			//var features = features || '';
			if(typeof features === 'undefined') {
				popup = window.open(url, name, 'width=' + width + ', height=' + height + ', menubar=no, status=no, location=no');
			}else {
				popup = window.open(url, name, 'width=' + width + ', height=' + height + ', ' + features);
			}
			if(popup !== null) {
				popup.focus();
			}
		},
		// 스크롤 위치
		scrollPosition: function(scroll) {
			// scroll.x / scroll.y
			if(typeof scroll === 'object' && scroll !== null) {
				window.scrollTo(scroll.x || 0, scroll.y || 0);
			}else {
				return {
					x: window.pageXOffset || 0,
					y: window.pageYOffset || 0
				};
			}
		},
		// 페이징 계산 
		pager: function(total_count, current_page, list_size, page_size) {
			/*
			total_count : 데이터 전체개수(select count(*) from 테이블)
			current_page : 현재페이지(no값)
			list_size : 한페이지에 보여질 게시물의 수
			page_size : 페이지 나누기에 표시될 페이지의 수

			// 페이지번호 리스트 출력
			for(i=start_page; i<=end_page && i<=total_page; i++) {
				if(page == i) {
					number = '<strong>' + i + '</strong>';
				}else {
					number = i;
				}
				'<a href="?page=' + i + '">' + number + '</a>';
			}
			*/
			if(!total_count || total_count <= 0) {
				total_count = 0;
			}
			if(!current_page || current_page <= 0) {
				current_page = 1;
			}
			if(!list_size || list_size <= 0) {
				list_size = 20;
			}
			if(!page_size || page_size <= 0) {
				page_size = 10;
			}

			var result = {};
			var total_page = Math.ceil(total_count / list_size) ; // 총페이지수(Total Page)
			var current_block = Math.ceil(current_page / page_size); // 현재블록(Current Block)
			var total_block = Math.ceil(total_page / page_size); // 총블록수(Total Block)
			var start_page = (current_block - 1) * page_size + 1; // 블록의 처음 페이지(Start Page)
			var end_page = (current_block * page_size); // 블록의 마지막 페이지(End Page)
			
			result['total_count'] = total_count;
			result['current_page'] = current_page;
			result['list_size'] = list_size;
			result['page_size'] = page_size;

			result['total_page'] = total_page;
			result['current_block'] = current_block;
			result['total_block'] = total_block;
			result['start_page'] = start_page;
			result['end_page'] = end_page;

			if(result['total_page'] < result['end_page']) {
				result['end_page'] = result['total_page'];
			}
			if(result['current_block'] > 1) {
				result['prev_page'] = start_page - 1; // 이전 블록
			}
			if(result['current_block'] < result['total_block']) {
				result['next_page'] = end_page + 1; // 다음 블록
			}

			return result;
		},
		// URL/Hash key:value 형태로 반환
		urlParameters: function() {
			var pageParamString = unescape(window.location.search.substring(1));
			var paramsArray = pageParamString.split('&');
			var paramsHash = {};
			var i;
			var singleParam;

			for(i = 0; i < paramsArray.length; i++) {
				singleParam = paramsArray[i].split('=');
				paramsHash[singleParam[0]] = singleParam[1];
			}

			return paramsHash;
		},
		
		// ---------- ---------- ---------- ---------- ---------- ----------
		// string 

		// value 앞에 count 수만큼 add를 채운다
		// 사용예: ('0', '3', 2) => '03'
		stringLeftFormat: function(add, value, count) {
			var value = String(value);
			var result = '';
			var i;
			for(i=value.length; i<count; i++){
				result = result + add;
			}
			return result + value;
		},
		// 글자 Byte 수 출력
		stringByteLength: function(value) {
			var bytes = 0;
			if(typeof value === 'string') {
				bytes = value.replace(/[\0-\x7f]|([0-\u07ff]|(.))/g,"$&$1$2").length;
			}
			return bytes;
		},
		// length 만큼 문자열 분리 배열 반환 
		stringSplitLength: function(str, length) {
			if(typeof str !== 'string') {
				return str;
			}else if(!length) {
				length = 5;
			}
			return str.match(new RegExp('.{1,' + length + '}', 'g'));
		},
		// 말줄임
		// CSS : 
		/*
		// 한 줄 자르기 
		display: inline-block; 
		width: 200px; 
		white-space: 
		nowrap; overflow: hidden; 
		text-overflow: ellipsis; 
		
		// 여러 줄 자르기 추가 스타일 
		white-space: normal; 
		line-height: 1.2; 
		height: 3.6em; 
		text-align: left; 
		word-wrap: break-word; 
		display: -webkit-box; 
		-webkit-line-clamp: 3; 
		-webkit-box-orient: vertical;
		*/
		// jQuery : https://github.com/jjenzz/jquery.ellipsis/blob/master/jquery.ellipsis.js
		stringEllipsis: function(value, length, options) {
			if(typeof value === 'string' && !isNaN(parseFloat(length)) && isFinite(length) && length < value.length) {
				return value.substr(0, length-2) + (typeof options === 'string' ? options : '..');
			}else {
				return value;
			}
		},

		// ---------- ---------- ---------- ---------- ---------- ----------
		// element/html

		// html 제거
		stripTags: function(html) {
			/*
			// HTML 태그 제거 (사용법은 php 의 strip_tags 와 동일)
			var strip_tags = function(input, allowed) {
				allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
				var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
				return input.replace(tags, function ($0, $1) {
					return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
				});
			};
			// 사용예: i 와 b 태그만 허용하고 그 외의 태그는 모두 제거
			strip_tags('<p>Aaa</p> <b>Bbb</b> <i>Ccc</i>', '<i><b>');
			*/
			if(html && typeof html === 'string') {
				return html.replace(/(<([^>]+)>)/ig,"");
			}else {
				return html;
			}
		},
		// fragment 에 html 삽입 후 반환
		fragmentHtml: function(html) {
			// Source: https://github.com/Alhadis/Snippets/blob/master/js/polyfills/IE8-child-elements.js
			/*if(!("firstElementChild" in document.documentElement)) {
				Object.defineProperty(Element.prototype, "firstElementChild", {
					get: function() {
						for(var nodes = this.children, n, i = 0, l = nodes.length; i < l; ++i) {
							if(n = nodes[i], 1 === n.nodeType) {
								return n;
							}
						}
						return null;
					}
				});
			}*/

			var fragment = document.createDocumentFragment(); // fragment 가 document에 렌더링(삽입)되기 전에, 셀렉터로 fragment 내부 element 검색이 가능하다.
			/*
			var temp = document.createElement('template'); // IE 미지원
			temp.innerHTML = html;
			fragment.appendChild(temp.content);
			*/
			var temp = document.createElement('div');
			var child;
			temp.innerHTML = html;
			while(child = temp.firstChild) { // temp.firstElementChild (textnode 제외)
				fragment.appendChild(child);
			}

			return fragment;
		},
		// parseHTML
		// IE9이상 사용가능
		// parseHTML(htmlString);
		parseHTML: function(html) {
			/*
			var tmp = document.createElement('div');
			var childNodes = [];
			tmp.innerHtml = html;
			childNodes = tmp.childNodes;
			*/
			var tmp = document.implementation.createHTMLDocument();
			tmp.body.innerHTML = html;
			return tmp.body.children;
		},
		// empty
		empty: function(element) {
			while(element.hasChildNodes()) { // TextNode 포함
				element.removeChild(element.lastChild);
			}
		},

		// ---------- ---------- ---------- ---------- ---------- ----------
		// 유효성 
		// true/false 

		isObject: function(value) {
			return value !== null && typeof value === 'object';
		},
		isArray: (function() {
			if(Array.isArray) {
				return function(value) {
					return Array.isArray(value);
				};
			}else {
				return function(value) {
					return value !== null && (typeof value === 'object' && value.constructor === Array);
				};
			}
		})(),
		isNumber: function(value) {
			return value !== null && (typeof value === 'number' && !isNaN(value - 0) || (typeof value === 'object' && value.constructor === Number));
		},
		isString: function(value) {
			return value !== null && (typeof value === 'string' || (typeof value === 'object' && value.constructor === String));
		},
		isBoolean: function(value) {
			return value !== null && typeof value === 'boolean';
		},
		isNodeList: function(value) {
			return value !== null && value instanceof NodeList;
		},
		isHtmlElement: function(value) {
			return value !== null && value instanceof HTMLElement;
		},
		isFunction: function(value) {
			return value !== null && typeof value === 'function';
		},
		isUndefined: function(value) {
			return value !== null && typeof value === 'undefined';
		},
		// 숫자여부 확인
		isNumeric: function(value) {
			// /^[+-]?([\d]+)?[\.]?([\d]+)?$/.test(value); // 음수, 양수, 소수점 가능 (keyup 이벤트로 체크가능)
			return !isNaN(parseFloat(value)) && isFinite(value);
		},
		// json 데이터 여부
		isJSON: function(value) {
			/*try {
				JSON.parse(str);
				return true;
			} catch (e) {
				return false;
			}*/
			//const jsonStringRegex = /^\s*{\s*".+":.+}\s*$/;
  			//return jsonStringRegex.test(str);
			return value && typeof value === 'object' && value !== null && (/*Array.isArray(value)*/Object.prototype.toString.call(value) === "[object Array]" || /^{.*}$|^\[.*\]$/.test(JSON.stringify(value)));
		},
		// 온라인 / 오프라인 여부
		isOnline: function() {
			// https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine
			if(window.navigator && 'onLine' in window.navigator) {
				if(window.navigator.onLine === true) {
					// online
					return true;
				}else {
					// offline
					return false;
				}
			}else {
				// online / offline 미지원
				return;
			}
		},
		//팝업차단확인
		isWindowPopup: function() {
			var win = window.open('', 'isWindowPopup', 'width=1, height=1, left=-10, top=-10, scrollbars=yes, resizable=yes');
			var is = true;
			if(win == null || typeof win === "undefined" || (!win && win.outerWidth === 0) || (win && win.outerHeight === 0) || (win && win.innerWidth === 0))  {
				alert("팝업 차단 기능이 설정되어있습니다\n차단 기능을 해제(팝업허용)한 후 이용해 주세요.");
				is = false;
			}
			if(win) {
				win.close();
			}
			return is;
		},
		// Determine if we're in an iframe
		isInFrame: function() {
			try {
				return window.self !== window.top;
			}catch (e) {
				return true;
			}
		},
		// element 노출 여부 
		isVisible: function(element) {
			// Support: Opera <= 12.12
			// Opera reports offsetWidths and offsetHeights less than zero on some elements
			// 검사하려는 element 하위 element 가 position: fixed; 되어있을 경우, 숨겨진 것으로 처리되니 주의해야 한다.
			var is = true;
			if(element.offsetWidth <= 0 && element.offsetHeight <= 0) {
				is = false;
			}else if(element.style && element.style.display === 'none') {
				is = false;
			}
			return is;
		},

		// ---------- ---------- ---------- ---------- ---------- ----------
		// 숫자

		// 단위 분리
		numberUnit: function(value) {
			// [1]: 숫자값
			// [2]: 단위
			return /^([0-9]+)(\D+)$/i.exec(value);
		},
		// 숫자만 추출
		numberReturn: function(value) {
			//return Number(String(value).replace(/,/g, '').replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')); // 음의 실수 포함
			return String(value).replace(/[^+-\.\d]|,/g, '');
		},
		// 금액
		numberFormat: function(value) {
			var value = String(value);
			var reg = /(^[+-]?\d+)(\d{3})/;
			while(reg.test(value)) {
				value = value.replace(reg, '$1' + ',' + '$2');
			}
			/*
			var parts = value.toString().split(".");
			parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			return parts.join(".");
			*/
			return value;
		},
		// 금액 4단위 한글변환
		numberMoney: function(money) {
			var won  = (money + "").replace(/,/g, ""); // 콤마제거 
			var unit  = [/*"원",*/"", "만", "억", "조", "경", "해", "자", "양", "구", "간", "정"]; // 금액단위 (4단위)
			var change = ""; // 변환금액 
			var pattern = /(-?[0-9]+)([0-9]{4})/;
			var arr = []; // 4단위 분리 값 
			var count = 0;
			var index = 0;
			var j, i;
			var tmp1, tmp2;

			while(pattern.test(won)) {
				won = won.replace(pattern, "$1,$2"); // 4단위 분리 ,(콤마) 넣음
			}
			arr = won.split(",");
			count = arr.length; // ,(콤마) 기준 분리 배열크기 
			index = count - 1; 

			// 단위 앞부분부터 확인 반복문 
			for(j=0; j<count; j++) {
				if(unit[index] === undefined) {
					break;
				}
				tmp1 = 0;
				for(i=0; i<arr[j].length; i++) {
					tmp2 = arr[j].substring(i, i+1);
					tmp1 = tmp1 + Number(tmp2);
				}
				if(tmp1 > 0) {
					change += arr[j] + unit[index];
					if(0 < index) { // 원단위 이상의 경우 break
						break;
					}
				}
				index--;
			}

			return change;
		},
		// 소수점 단위 금액
		floatFormat: function(value) {
			var value = String(value);
			var orgnum = value;
			var arrayOfStrings = [];

			if(value.length > 3) {
				value = value + ".";
			}
			arrayOfStrings = value.split('.');
			value = '' + arrayOfStrings[0];

			if(value.length > 3) {
				var mod = value.length % 3;
				var output = (mod > 0 ? (value.substring(0, mod)) : '');
				for(var i=0; i<Math.floor(value.length / 3); i++) {
					if((mod == 0) && (i == 0)) {
						output += value.substring(mod + 3 * i, mod + 3 * i + 3);
					}else{
						output += ',' + value.substring(mod + 3 * i, mod + 3 * i + 3);
					}
				}

				if(orgnum.indexOf(".") > -1) {
					output += '.' + arrayOfStrings[1];
				}
				return (output);
			}else{
				return orgnum;
			}
		},
		// 콤마 제거
		removeComma: function(value) {
			var value = String(value);
			var result = '';
			var substr = '';
			var i, max;
			for(i=0, max=value.length; i<max; i++) {
				substr = value.substring(i, i+1);
				if(substr !== ',') {
					result += substr;
				}
			}
			return result;
		},
		// 지정자리 반올림 (값, 자릿수)
		round: function(n, pos) {
			var digits = Math.pow(10, pos);
			var sign = 1;
			if(n < 0) {
				sign = -1;
			}
			// 음수이면 양수처리후 반올림 한 후 다시 음수처리
			n = n * sign;
			var num = Math.round(n * digits) / digits;
			num = num * sign;
			return num.toFixed(pos); // toFixed: string 타입 반환
		},
		// 지정자리 버림 (값, 자릿수) - 양수만 가능
		floor: function(n, pos) {
			var digits = Math.pow(10, pos);
			var num = Math.floor(n * digits) / digits;
			return num.toFixed(pos); // toFixed: string 타입 반환
		},
		// 지정자리 올림 (값, 자릿수)
		ceiling: function(n, pos) {
			var digits = Math.pow(10, pos);
			var num = Math.ceil(n * digits) / digits;
			return num.toFixed(pos); // toFixed: string 타입 반환
		},

		// ---------- ---------- ---------- ---------- ---------- ----------
		// 날짜

		// date format
		date: function(date) {
			var setNumberFormat = function(value) {
				if(Number(value) < 10) {
					value = '0' + value;
				}
				return value;
			}
			var result = {
				'date': new Date(),
				'year': '',
				'month': '',
				'day': '',
				'hour': '',
				'minute': '',
				'second': '',
				'time': ''
			};

			if(date && date instanceof Date) {
				result.date = date;
			}
			result.year = result.date.getFullYear();
			result.month = setNumberFormat(result.date.getMonth() + 1);
			result.day = setNumberFormat(result.date.getDate());
			result.hour = setNumberFormat(result.date.getHours());
			result.minute = setNumberFormat(result.date.getMinutes());
			result.second = setNumberFormat(result.date.getSeconds());
			result.time = result.date.getTime();
			
			return result;
		},
		// 몇일째 되는날
		/*
		사용예: (year, month, day 분리 입력 또는 new Date 인스턴스값 입력)
		getDateSpecificInterval({'year': year, 'month': month, 'day': day}, 10); // +10일
		getDateSpecificInterval({'instance': tmp}, -19); // -19일
		*/
		dateSpecificInterval: function(date, interval) {
			var instance;
			if(date.instance) { //{'instance': 값}
				instance = date.instance;
			}else if(date.year && date.month && date.day) { //{'year': 값, 'month': 값, 'day': 값}
				instance = new Date(parseInt(date.year), parseInt(date.month) - 1, parseInt(date.day));
			}else {
				return false;
			}
			interval = Number(interval);
			return new Date(Date.parse(instance) + interval * 1000 * 60 * 60 * 24);
		},
		// 날짜차이
		dateBetween: function(start, end) { // start: 2015-10-27, end: 2015-12-27
			if(!start || !end || start.indexOf('-') <= 0 || end.indexOf('-') <= 0) {
				return false;
			}
			var start_arr = start.split("-");
			var end_arr = end.split("-");
			var start_obj = new Date(start_arr[0], Number(start_arr[1])-1, start_arr[2]);
			var end_obj = new Date(end_arr[0], Number(end_arr[1])-1, end_arr[2]);

			var years = end_obj.getFullYear() - start_obj.getFullYear();
			var months = end_obj.getMonth() - start_obj.getMonth();
			var days = end_obj.getDate() - start_obj.getDate();

			var result = {};
			result['day'] = (end_obj.getTime()-start_obj.getTime())/(1000*60*60*24);
			result['month'] = (years * 12 + months + (days >= 0 ? 0 : -1)),
			result['year'] = Math.floor(result['month'] / 12);

			return result;
		},
		// 해당 년월의 마지막 날짜
		lastday: function(year, month) {
			var arr = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
			if((year %4 == 0 && year % 100 !== 0) || year % 400 == 0) {
				arr[1] = 29;
			}
			return arr[month-1];
		}
	};

})(this);
