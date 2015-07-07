/*
Module(util)

@version
0.1 (2015.07.07)

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.
*/

(function(api, global) {

	'use strict'; // ES5
	if(typeof global === undefined || global !== window || !global.api || 'module' in global.api) {
		return false;	
	}
	return api(global);

})(function(global) {

	'use strict'; // ES5

	var module = {
		// 상속 - 추후 Object.create() 로 변경하자!
		inherit: function(C, P) { 
			/*
			원칙적으로 재사용할 멤버는 this가 아니라 프로토타입에 추가되어야 한다.
			따라서 상속되어야 하는 모든 것들도 프로토타입 안에 존재해야 한다.
			그렇다면 부모의 프로토타입을 똑같이 자식의 프로토타입으로 지정하기만 하면 될 것이다.

			프로토타입 체인의 이점은 유지하면서, 동일한 프로토타입을 공유할 때의 문제를 해결하기 위해
			부모와 자식의 프로토타입 사이에 직접적인 링크를 끊는다.
			빈 함수 F()가 부모와 자식 사이에서 프록시(proxy) 기능을 맡는다.
			F()의 prototype 프로퍼티는 부모의 프로토타입을 가리킨다. 이 빈 함수의 인스턴스가 자식의 프로토타입이 된다.

			부모 생성자에서 this에 추가된 멤버는 상속되지 않는다. (재사용한다는 prototype 의미를 정확히 사용)
			*/
			var F = function() {};
			F.prototype = P.prototype;
			C.prototype = new F();
			/*
			부모 원본에 대한 참조를 추가할 수도 있다.
			다른 언어에서 상위 클래스에 대한 접근 경로를 가지는 것과 같은 기능으로,
			경우에 따라 매우 편리하게 쓸 수 있다.
			*/
			C.uber = P.prototype; // 상위 클래스 접근경로
			/*
			constructor 프로퍼티는 자주 사용되진 않지만 런타임 객체 판별에 유용하다.
			거의 정보성으로만 사용되는 프로퍼티이기 때문에, 원하는 생성자 함수를 가리키도록 재설정해도 기능에는
			영향을 미치지 않는다.
			*/
			C.prototype.constructor = C; // 생성자 재설정 (런타임시 객체 판별)
		},
		// deep copy
		// http://davidwalsh.name/javascript-clone
		clone: function clone(src, deep) { // src: target, deep: true|false
			if(!src && typeof src != "object") {
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
		// 반응형 계산
		sizePercent: function(t, c) {
			//공식 : target / content = result
			//예제 : 60(구하고자하는 크기) / 320(기준) = 0.1875 -> 18.75%
			//예제 : 10 / 320 = 0.03125 -> 3.125
			var target = Number(t);
			//var content = c || api.core.grid.width;
			var content = Number(c);
			var result = (target / content) * 100;

			return result; 
		},
		/*
		 * 캡쳐단계(capture phase, 기본 이벤트 중지) : 이벤트가 발생 대상까지 전달되는 단계(아래로)
		 * - 설명1 : 이벤트가 다른 이벤트로 전파되기 전에 폼 전송과 같은 이벤트를 취소 (기본 동작을 중지한다)
		 * - 설명2 : 처리를 완료하기 전에 이벤트(기본 또는 다른이벤트)를 취고하고 싶을 때
		 *
		 * 대상단계(target phase) : 이벤트가 발생 대상에 도달한 단계
		 * 
		 * 버블링단계(bubbling phase, 사용자 이벤트 중지) : 발생 대상에서 document까지 전달되는 단계(위로)
		 * - 설명1 : 내부에 다른 요소를 포함한 어떤 요소(<div><div></div></div>)가 있습니다. 두요소 모두 클릭 이벤트를 캡쳐합니다. 안쪽요소에서 발생한 클릭 이벤트가 바깥쪽 요소로 전파되는 것을 막음
		 * - 설명2 : 이벤트를 취소하고 싶지는 않지만 전파하는 것을 막을 때
		 *
		 * stopImmediatePropagation: 현재 이벤트가 상위뿐 아니라 현재 레벨에 걸린 다른 이벤트도 동작하지 않도록 중단한다.
		 *
		 * 
		 사용자가 발생한(설정한) 현재 element 이벤트의 상위 element 이벤트를 중지시키는냐, 
		 브라우저 기본 이벤트를 중지하느냐의 차이
		 	<a href="http://test.com">
		 		<div id="div">
					<img src="" id="img" />
		 		</div>
		 	</a>
		 	document.getElementById('div').onclick = function() { alert('div'); };
		 	document.getElementById('img').onclick = function() { alert('img'); };

		 	- 일반적인 이벤트(img를 클릭했을 경우): img -> div -> a 순서로 이벤트 발생
		 	- stopPropagation 사용: img 를 클릭했을 경우 div 이벤트를 막을 수 있다. 그러나 a 이벤트는 중지되지 않으며 href에 따른 페이지 이동이 발생한다.
		 	- preventDefault 사용: a 기본 이벤트인 href 의 이동을 중지 시킨다.
		 */
		stopCapture: function(event) {
			var event = event || window.event;
			if(event.preventDefault) { // 현재 이벤트의 기본 동작을 중단한다.
				event.preventDefault();
			}else {
				event.returnValue = false;
			}
		},
		stopBubbling: function(event) {
			var event = event || window.event;
			if(event.stopPropagation) { // 현재 이벤트가 상위로 전파되지 않도록 중단한다.
				event.stopPropagation();
			}else {
				event.cancelBubble = true;
			}
		},
		// 캡쳐단계, 버블링단계 동시 실행
		stopEventDelivery: function(event) { 
			this.stopCapture(event || window.event);
			this.stopBubbling(event || window.event);
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
		/*
		// type 체크
		// https://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
		type({a: 4}); //"object"
		type([1, 2, 3]); //"array"
		(function() {console.log(type(arguments))})(); //arguments
		type(new ReferenceError); //"error"
		type(new Date); //"date"
		type(/a-z/); //"regexp"
		type(Math); //"math"
		type(JSON); //"json"
		type(new Number(4)); //"number"
		type(new String("abc")); //"string"
		type(new Boolean(true)); //"boolean"
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
		keyboardCode: function(event) {
			var event = event || window.event;
			var code = event.which || event.keyCode;
			var key = '';
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

			if(key != '') {
				//기본 이벤트 중지
				if(event.preventDefault){
					event.preventDefault();
				}else {
					event.returnValue = false;
				}
				return {"code": code, "key": key};
			}else {
				return false;
			}
		},
		// 스크롤바 width 값 (각 브라우저마다 다름, DOMContentLoaded 이후 실행)
		scrollbarWidth: function() {
			var div = document.createElement("div");
			var scrollbar;
			div.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
			document.body.appendChild(div);
			scrollbar = div.offsetWidth - div.clientWidth;
			document.body.removeChild(div);

			return scrollbar;
		},
		// 대기 - 예: sleep(10000);
		sleep: function(milliSeconds) {
			var startTime = new Date().getTime(); // get the current time   
			while(new Date().getTime() < startTime + milliSeconds); // hog cpu 
		}
	};

	// api box 기능을 사용할 경우
	if(api.box && typeof api.box === 'function') {
		return api.box(module);
	}else {
		global.api.module = module;
	}
	
}, this);
