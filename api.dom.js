/*
DOM

The MIT License (MIT)
Copyright (c) Sung-min Yu
*/

;void function(global) {
	'use strict'; // ES5
	if(typeof global === 'undefined' || typeof global.api === 'undefined' || typeof global.api.dom !== 'undefined' || typeof document.querySelectorAll === 'undefined') return false;

	// jQuery
	//if(!document.querySelectorAll && !window.jQuery) document.write('<script src="//code.jquery.com/jquery-1.11.0.min.js"><\/script>');
	
	global.api.dom = (function() {
		//cache
		var cache = {
			'event': {}
		};
		//dom
		var $ = function() {
			var arr = Array.prototype.slice.call(arguments),
				selector,
				context;

			// selector, context 설정
			switch(arr.length) {
				case 2:
					context = arr.pop();
				case 1:
					selector = arr.pop();
					break;
			}

			return new Dom(selector, context);
		};
		function Dom(selector, context) {
			if(typeof selector === 'object' && (selector.nodeType || selector === window)) { //DOMElement, window
				/*
				nodeType
				1 : Element 노드를 의미
				2 : Attribute 노드를 의미
				3 : Text 노드를 의미
				4 : CDATASection 노드를 의미
				5 : EntityReference 노드를 의미
				6 : Entity 노드를 의미
				7 : ProcessingInstruction 노드를 의미
				8 : Comment 노드를 의미
				9 : Document 노드를 의미
				10 : DocumentType 노드를 의미
				11 : DocumentFragment 노드를 의미
				12 : Notation 노드를 의미
				*/
				this.element = selector;
				this.length = 1;
				this[0] = this.element;
				return this;
			}else if(typeof selector === 'string') {
				// create element 여부확인
				// /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/.test(selector)
				// /^<(\w+)\s*\/?>(?:<\/\1>|)$/.test(selector)
				// /^<([a-z]+)([^<]+)*(?:>(.*)<\/\1>|\s*\/>)$/.test(selector)
				var match = /<(\w+)[^>]*>/.exec(selector);
				if(match && match[1]) {
					this.element = (context || document).createElement(match[1]);
					this.length = 1;
					this[0] = this.element;
					return this;
				}else {
					this.query(selector, context);
				}
			}else {
				return selector;
			}
		};
		Dom.prototype = {
			// Element 를 Array 로 변환하여 반환한다.
			// Array 기본 메소드 사용이 가능해진다.
			elementsToArray: function(elements) {
				var arr = [];
				if(elements instanceof NodeList) {
					arr = Array.prototype.slice.call(elements);
				}else if(elements instanceof HTMLCollection) {
					for(var i = 0, max = elements.length; i < max; i++) {
						arr[i] = elements[i];
					}
				}
				return arr;
			},
			// dom 검색
			query: function(selector, context) {
				var context = context || document,
					element = context.querySelectorAll(selector), // querySelectorAll: length 있음, querySelector: length 없음
					arr = this.elementsToArray(element);

				this.element = element;
				this.length = arr.length;
				for(var key in arr) {
					this[key] = arr[key];
				}

				return this;
			},
			/*
			query: function(name, context) {
				var context = context || document,
					element, arr;

				if(document.querySelectorAll) { // IE7 이하 사용 불가능
					element = context.querySelectorAll(name),
					arr = this.elementsToArray(element);

					this.element = element;
					this.length = arr.length;
					for(var key in arr) {
						this[key] = arr[key];
					}
				}else {
					// jQuery 호출
					element = jQuery(name, context);
					this.element = element[0];
					this[0] = element[0];
					this.length = 1;
				}

				return this;
			},
			*/
			/*
			// getElementById
			getElementById: function(name, context) {
				var context = context || document;

				this.element = context.getElementById(name);
				this.length = 1;
				this[0] = this.element;
				return this;
			},
			// getElementsByClassName
			getElementsByClassName: function(name, context) {
				var context = context || document,
					element = context.getElementsByClassName(name),
					arr = this.elementsToArray(element);

				this.element = element;
				this.length = arr.length;
				for(var key in arr) {
					this[key] = arr[key];
				}
				return this;
			},
			// getElementsByTagName
			getElementsByTagName: function(name, context) {
				var context = context || document,
					element = context.getElementsByTagName(name), // type : HTMLCollection
					arr = this.elementsToArray(element);

				this.element = element;
				this.length = arr.length;
				for(var key in arr) {
					this[key] = arr[key];
				}
				return this;
			},
			// getElementsByName
			getElementsByName: function(name, context) { 
				var context = context || document,
					element,
					arr = [];

				if(document.getElementsByName) { // IE9 이하에서 사용이 다름
					element = context.getElementsByName(name);
					arr = this.elementsToArray(element);
					this.element = element;
					this.length = arr.length;
					for(var key in arr) {
						this[key] = arr[key];
					}
				}else {
					var i = 0,
						tag = document.getElementsByTagName('*'),
						max = tag.length;
					for( ; i<max; i++) {
						if(tag[i].name === name || tag[i].getAttribute('name') === name) {
							arr[arr.length] = tag[i];
						}
					}
					this.length = arr.length;
					for(var key in arr) {
						this[key] = arr[key];
					}
				}
				return this;
			},
			*/
			find: function(selector) {
				return $(selector, this[0] || document);
			},
			closest: function(name, context) { 
				var context = context || document.documentElement, // documentElement: <html />
					i = 0,
					length = this.length,
					element, search;

				for ( ; i<length; i++) { // this[] 연관배열
					for (search = this[i].parentNode; search && search !== context; search = search.parentNode) { 
						// 현재 element 부터 검사하기 위해 
						// 현재 노드의 parentNode 를 search 초기값으로 바인딩하고
						// search.querySelector() 로 확인 한다.
						element = search.querySelector(name);
						if(element) {
							this[0] = element;
							this.length = 1;
							return this;
						}
					}
				}
			},
			// 자식요소 리스트
			children: function() {
				// x.hasChildNodes(); // 표준 - 노드에 자식 노드가 있는지 여부 
				// x.childNodes[1]; // IE8 이하 사용 불가능 - 자식노드 리스트
				// x.children[1]; // IE8 이하 사용 불가능 - 자식요소 리스트
				if(this[0].hasChildNodes()) { // true | false
					return this[0].children;
				}
			},
			// 자식요소의 수
			childElementCount: function() { 
				// x.childElementCount; // IE8 이하 사용 불가능
				return this[0].childElementCount;
			},
			// event
			live: function(selector, events, handlers, capture) {
				// 매번 dom을 탐색하여, 해당 element를 발견하면,
				// 콜백을 실행하는 방식이다. (비효율)
				this.each(function() {
					var callback = function(e) {
						var event = e || window.event;
						var type = event.type;
						var target = event.target;
						$(this).find(selector).each(function() {
							if(target.isEqualNode(this)) {
								handlers.call(this);
							}
						});
					};
					//this.addEventListener(events, callback);
					if(typeof window.addEventListener === 'function') {
						this.addEventListener(events, callback);
					}else if(typeof document.attachEvent === 'function') { // IE
						this.attachEvent('on' + events, callback);
					}
				});
			},
			on: (function() {
				// 초기화
				var addEvent;
				if(typeof window.addEventListener === 'function') {
					addEvent = function(events, handlers, capture) {
						this.addEventListener(events, handlers, capture);
					}
				}else if(typeof document.attachEvent === 'function') { // IE
					addEvent = function(events, handlers) {
						this.attachEvent('on' + events, handlers);
					}
				}

				// 리턴함수
				var func = function(events, handlers, capture) {
					var events = events || undefined;
					var handlers = handlers || undefined;
					var capture = (typeof capture === undefined) ? false : capture;
					var callback, arr = [], key;

					// 이벤트 정보
					arr = events.split('.');
					if(arr.length > 1) {
						events = arr.shift();
					}
					key = arr.join('');
					
					// cache
					cache.event[key] = [];

					// 이벤트 설정
					this.each(function() {
						callback = function() {
							handlers.apply(this, Array.prototype.slice.call(arguments));
						};
						addEvent.call(this, events, callback, capture);
						cache.event[key].push({
							"element": this,
							"events": events,
							"handlers": callback,
							"capture": capture
						});
					});	
				};

				return func;
			})(),
			off: (function() {
				// 초기화
				var removeEvent;
				if(typeof window.removeEventListener === 'function') {
					removeEvent = function(events, handlers, capture) {
						this.removeEventListener(events, handlers, capture);
					}
				}else if(typeof document.detachEvent === 'function') { // IE
					removeEvent = function(events, handlers) {
						this.detachEvent('on' + events, handlers);
					}
				}

				// 리턴함수
				var func = function(events) {
					var events = events || undefined;
					var tmp, arr = [], key;

					// 이벤트 정보
					arr = events.split('.');
					if(arr.length > 1) {
						events = arr.shift();
					}
					key = arr.join('');

					// 이벤트 해제
					if(cache.event[key]) {
						tmp = cache.event[key];
						for(var index in tmp) {
							removeEvent.call(tmp[index].element, tmp[index].events, tmp[index].handlers, tmp[index].capture);
						}
					}
				};

				return func;
			})(),
			trigger: (function() {
				if(document.createEvent) {
					return function(events) {
						var event_obj = document.createEvent('MouseEvents');
						event_obj.initEvent(events, true, false);
						this.each(function() {
							this.dispatchEvent(event_obj);
						});
					}
				}else if(document.createEventObject) { // IE
					return function(events) {
						var event_obj = document.createEventObject();
						this.each(function() {
							this.fireEvent('on' + events, event_obj);
						});
					}
				}
			})(),
			// 
			each: function(callback) { 
				var i = 0,
					length = this.length;

				for( ; i < length; i++) {
					callback.apply(this[i], [i, this[i]]); // i:key, this[i]:element
				}
			},
			// attribute
			attr: function(name, value) { 
				if(typeof name === 'string' && typeof value === 'undefined') { // get
					return this[0].getAttribute(name);
				}else { // set
					if(typeof name === 'object') {
						this.each(function() {
							for(var key in name) {

								this.setAttribute(key, name[key]);
							}
						});
					}else if(typeof value !== 'undefined') {
						this.each(function() {
							this.setAttribute(name, value);
						});
					}
					return this;
				}
			},
			removeAttr: function(name) {
				this.each(function() {
					this.removeAttribute(name);
				});
				return this;
			},
			hasAttr: function(name) {
				// x.hasAttribute('href');
				return this[0].hasAttribute(name);
			},
			// property
			prop: function(name, value) { 
				if(typeof value === 'undefined') { //get
					return this[0][name];
				}else { //set
					this.each(function() {
						this[name] = value;
					});
					return this;
				}
			},
			removeProp: function(name) {
				this.each(function() {
					try {
						this[name] = undefined;
						delete this[name];
					} catch( e ) {}
				});
				return this;	
			},
			// 
			html: function(value) {
				var i = 0,
					length = this.length;
				if(typeof value === 'undefined') { // get
					// return this[i].outerHTML; // IE만 지원
					return this[0].innerHTML;
				}else { // set
					for( ; i < length; i++) {
						this[i].innerHTML = value;
					}
					return this;
				}
			},
			text: function(value) {
				var i = 0,
					length = this.length;
				if(typeof value === 'undefined') { // get
					return this[0].textContent;
				}else { // set
					for( ; i < length; i++) {
						this[i].textContent = value;
					}
					return this;
				}
			},
			val: function(value) { 
				return this.each(function() {
					this.value = value;
				});
			},
			//
			prepend: function(element) {
				var element = typeof element.length !== 'undefined' ? element[0] : element;
				this.each(function() {
					if(this.nodeType === 1 || this.nodeType === 9 || this.nodeType === 11) {
						this.insertBefore(element, this.firstChild);
					}
				});
				return this;
			},
			// 최후의 자식 요소로 추가
			append: function(element) {
				// x.appendChild(y); // 표준
				var element = typeof element.length !== 'undefined' ? element[0] : element;
				this.each(function() {
					if(this.nodeType === 1 || this.nodeType === 9 || this.nodeType === 11) {
						this.appendChild(element);
					}
				});
				return this;
			},
			// 시작 태그의 앞, 시작 태그의 뒤, 종료 태그 앞, 종료 태그 뒤
			appendHtml: function(value, position) {
				// insertAdjacentHTML('위치', '값'); // 위치: beforebegin, afterbegin, beforeend, afterend
				/*
				// position 위치값
				<!-- beforebegin -->
				<p>
					<!-- afterbegin -->
					foo
					<!-- beforeend -->
				</p>
				<!-- afterend -->
				*/
				var position = (position === 'beforebegin' || position === 'afterbegin' || position === 'beforeend' || position === 'afterend') ? position : 'beforeend'; // beforebegin | afterbegin | beforeend | afterend
				this[0].insertAdjacentHTML(position, value);
				return this;
			},
			// 어떤 요소의 위치에 노드를 삽입
			after: function(element) {
				var element = typeof element.length !== 'undefined' ? element[0] : element;
				this.each(function() {
					if(this.parentNode) {
						this.parentNode.insertBefore(element, this.nextSibling);
					}
				});
			},
			before: function(element) {
				// api.$(기준이 되는 대상).before(이동할 대상);
				// 기준이 되는 element 바로 전으로 이동할 element가 이동(또는 삽입)한다.
				// querySelectorAll 또는 api.$() length 가 있으나, querySelector 는 length 가 없다.
				var element = typeof element.length !== 'undefined' ? element[0] : element;
				this.each(function() {
					if(this.parentNode) {
						this.parentNode.insertBefore(element, this); 
					}
				});
				return this;
			},
			insertBefore: function(element) {
				// api.$(이동할 대상).insertBefore(기준이 되는 대상);
				// 이동할 element가, 기준이 되는 element 바로 전으로 이동(또는 삽입)한다.
				// querySelectorAll 또는 api.$() length 가 있으나, querySelector 는 length 가 없다.
				var element = typeof element.length !== 'undefined' ? element[0] : element;
				this.each(function() {
					if(this.parentNode) {
						element.parentNode.insertBefore(this, element); // parentNode 는 document 의 경우 어떻게 처리?
					}
				});
				return this;
			},
			// 지정한 콘텐츠로 대체
			replaceWith: function(value) {
				// x.replaceChild(y,z); // 표준
				return this.each(function() {
					this.outerHTML = value;
				});
			},
			// 
			remove: function() {
				// x.removeChild(y); // 표준
				this.each(function() {
					if(this.parentNode) {
						this.parentNode.removeChild(this);
					}
				});
			},
			clone: function(is) {
				// x = y.cloneNode(true | false); //표준
				// is : 자식 노드들도 모두 복제할지 여부(true:복사, false:해당없음)
				if(this[0].nodeType) {
					// id를 가진 node를 복사할 때 주의하자(페이지내 중복 id를 가진 노드가 만들어 지는 가능성이 있다)
					return this[0].cloneNode(is || true);
				}
			},
			//
			css: function(value) {
				var type = typeof value,
					CSS3Browsers = ['', '-webkit-', '-moz-', '-ms-', '-o-'],
					CSS3RegExp = /^(transition|border-radius|transform|box-shadow|perspective|flex-direction)/i; // 사용자가 수동으로 -webkit- , -moz- , -o- , -ms- 입력하는 것들은 제외시킨다.

				if(type === 'string') { // get

					// return this[0].style[value]; // 방법1(CSS 속성과 JS 에서의 CSS 속성형식이 다르므로 사용불가능)
					// return this[0].style.getPropertyValue(value); // 방법2(CSS 속성명을 사용하여 정상적 출력가능)
					// 방법3
					var tmp = null;
					var dv = document.defaultView;
					if(value == 'opacity' && this[0].filters) { // IE opacity
						tmp = 1;
						try {
							tmp = this[0].filters.item('alpha').opacity / 100;		
						}catch(e) {
							console.log(e);
						}
					}else if(this[0].style[value]) { // style로 값을 구할 수 있는 경우
						tmp = this[0].style[value];
					}else if(this[0].currentStyle && this[0].currentStyle[value]) { // IE의 경우
						tmp = this[0].currentStyle[value];
					}else if(dv && dv.getComputedStyle) {
						// 대문자를 소문자로 변환하고 그 앞에 '-'를 붙인다.
						var converted = '';
						for(var i = 0, len = value.length; i < len; ++i) {
							if(value.charAt(i) == value.charAt(i).toUpperCase()) {
								converted = converted + '-' + value.charAt(i).toLowerCase();
							}else {
								converted = converted + value.charAt(i);
							}
						}
						if(dv.getComputedStyle(this[0], '').getPropertyValue(converted)) {
							tmp = dv.getComputedStyle(this[0], '').getPropertyValue(converted);
						}
					}

					return tmp;

				}else if(type === 'object'){ // set - 형태: {"속성명": "값", ... } 

					for(var key in value) {
						this.each(function() {
							var element = this;
							if(CSS3RegExp.test(key)) { // CSS3
								for(var tmp in CSS3Browsers) {
									// element.style[CSS3Browsers[tmp].concat(key)] = value[key]; // 방법1
									element.style.setProperty(CSS3Browsers[tmp].concat(key), value[key]); // 방법2
								}
							}else {
								// 단위(예:px)까지 명확하게 입력해줘야 한다.	
								// this.style[key] = value[key]; // 방법1
								element.style.setProperty(key, value[key]); // 방법2
							}
						});
					}
					return this;

				}
			},
			width: function(value) {
				if(typeof value === 'undefined') { // get
					if(this[0] == window) { // window
						// window.outerWidth; // IE9 이상가능
						// window.innerWidth; // all browsers, except IE before
						// document.documentElement.clientWidth; // Internet Explorer before version 9
						return window.innerWidth || document.documentElement.clientWidth;
					}else if(this[0].nodeType == 9) { // document
						return Math.max(
							document.body.scrollWidth, document.documentElement.scrollWidth,
							document.body.offsetWidth, document.documentElement.offsetWidth,
							document.documentElement.clientWidth
						);
					}else {
						return this[0].clientWidth;
					}
				}else { // set
					this.css.call(this, {'width': value});
					return this;
				}
			},
			height: function(value) {
				if(typeof value === 'undefined') { // get
					if(this[0] == window) {
						// window.outerHeight; // IE9 이상가능
						// window.innerHeight; // all browsers, except IE before 
						// document.documentElement.clientHeight; // Internet Explorer before version 9
						return window.innerHeight || document.documentElement.clientHeight;
					}else if(this[0].nodeType == 9) { // document
						return Math.max(
							document.body.scrollHeight, document.documentElement.scrollHeight,
							document.body.offsetHeight, document.documentElement.offsetHeight,
							document.documentElement.clientHeight
						);
					}else {
						return this[0].clientHeight;
					}
				}else { // set
					this.css.call(this, {"height": value});
					return this;
				}
			},
			//
			getClass: function() {
				return this[0].classList;
			},
			hasClass: function(name) { 
				// element.classList; // 클래스 리스트 출력
				var regex = new RegExp('(?:\\s|^)' + name + '(?:\\s|$)');
				return !!this[0].className.match(regex); // !! 느낌표가 2개 이유는 type 를 boolean 으로 만들기 위함
			},
			addClass: function(name) {
				// element.classList.add('');
				var arr = name.split(' '),
					element;
				this.each(function() {
					// this.className += ' ' + name; // 방법1
					// this.classList.add(name); // 방법2 (한번에 하나의 클래스만 입력 가능하다. 죽, 띄어쓰기로 여러 클래스 입력 불가능)
					element = this;
					for(var key in arr) {
						element.classList.add(arr[key]);
					}
				});
				return this;
			},
			removeClass: function(name) { 
				// element.classList.remove('');
				var // regex = new RegExp('(?:\\s|^)' + name + '(?:\\s|$)'),
					arr = name.split(' '),
					element;
				this.each(function() {
					// this.className = this.className.replace(regex, ' '); // 방법1
					// this.classList.remove(name); // 방법2 (한번에 하나의 클래스만 삭제 가능하다. 죽, 띄어쓰기로 여러 클래스 삭제 불가능)
					element = this;
					for(var key in arr) {
						element.classList.remove(arr[key]);
					}
				});
				return this;
			},
			toggleClass: function(name) {
				// element.classList.toggle('');
				var arr = name.split(' '),
					element;
				// this.hasClass.apply(this, arguments) ? this.removeClass.apply(this, arguments) : this.addClass.apply(this, arguments); // 방법1
				this.each(function() { // 방법2
					element = this;
					for(var key in arr) {
						element.classList.toggle(arr[key]);
					}
				});
				return this;
			},
			//
			data: (function() {
				/*
				! 주의
				data-* 속성값에서 -(hyphen) 다음의 첫글자는 무조건 대문자로 들어가야 한다.
				http://www.sitepoint.com/managing-custom-data-html5-dataset-api/
				*/
				var element = document.createElement('div');
				var html5 = (element.dataset ? true : false);
				if(html5) { // html5 지원
					return function(name, value) {
						name = name.replace(/-([a-z])/g, function(name) {
							return name[1].toUpperCase(); // -(하이픈) 다음 첫글자 대문자로 변환
						});
						if(typeof value === 'undefined') {
							return this[0].dataset[name];
						}else {
							// 해당문자가 있을 경우 대문자 변환
							//name.replace(/-([a-z])/g)
							this[0].dataset[name] = value;
						}
						return this;
					};
				}else { // attr
					return function(name, value) {
						if(typeof value === 'undefined') {
							return this.attr.call(this, 'data-' + name);
						}else {
							this.attr.call(this, 'data-' + name, value);
						}
						return this;
					};
				}
			})()
		};

		// DOM Ready
		var ready = function(callback) {
			if(document.addEventListener) { // Mozilla, Opera, Webkit 
				document.addEventListener("DOMContentLoaded", function() {
					callback();
				}, false);
			}else if(document.attachEvent) { // IE
				document.attachEvent("onreadystatechange", function() {
					if(document.readyState === "complete") {
						callback();
					}
				});
			}
			/*
			if(document.addEventListener) {
				//DOMContentLoaded : HTML(DOM) 해석이 끝난 직후에 발생하는 이벤트
				document.addEventListener('DOMContentLoaded', function() {
					//alert(document.getElementById('test').innerHTML);
					callback();
				});
			}else {
				(function recursive() {
					try {
						document.documentElement.doScroll('left');
					} catch(error) {
						setTimeout(recursive, 0);
						return;
						callback();
					}
				}());
			}
			*/
		};

		// Create HTML
		var html = function(parameter) {
			/*
			// 기본구조
			api.dom.html({
				"parent": "#ysm", // 작업영역
				"child": [
					{
						"tag": "div", // Tag 명
						"attr": {"id": "a", "class": "a"}, // 속성
						"css": {"width": "100px", "height": "100px"}, // style
						"data": {"type": "folder", "instance": "a"}, // data-* (html5 표준)
						"html": "<p>a</p>", // html
						"callback": function(element) { // element 만든 후 작업
							//api.module.Slide.call({'instance': this.data.instance}, {'element': element});
						},
						"child": [ // 내부 자식 element 리스트
							... 
						]
					}
				]
			});
			// 사용예
			api.dom.html({
				"parent": "#ysm",
				"child": [
					{
						"tag": "div",
						"attr": {"id": "a", "class": "a"},
						"css": {"width": "100px", "height": "100px"}, 
						"data": {"type": "folder", "instance": "a"}, 
						"html": "<p>a</p>",
						"callback": function(element) {
							//api.module.Slide.call({'instance': this.data.instance}, {'element': element});
						},
						"child": [
							{
								"tag": "div",
								"attr": {"id": "a1", "class": "a1"},
								"css": {"width": "", "height": ""},
								"data": {"type": "slide", "instance": "a1"}
							},
							{
								"tag": "div",
								"attr": {"id": "a2", "class": "a2"},
								"css": {"width": "", "height": ""}, 
								"data": {"type": "slide", "instance": "a2"}
							}
						]
					},
					{
						"tag": "div",
						"attr": {"id": "b", "class": "b"},
						"css": {"width": "", "height": ""}, 
						"data": {"type": "b", "instance": "b"}, 
						"child": [
							{
								"tag": "div",
								"attr": {"id": "b1", "class": "b1"},
								"css": {"width": "", "height": ""}, 
								"data": {"type": "b1", "instance": "b1"},
								"child": [
									{
										"tag": "div",
										"attr": {"id": "b11", "class": "b11"},
										"css": {"width": "", "height": ""}, 
										"data": {"type": "", "instance": ""}
									}
								]
							}
						]
					}
				]
			});
			*/

			// html
			var callback_arr = []; // element 가 렌더링 된 후 콜백을 실행
			var func = { // element에 필요한 각 기능별 함수
				"attr": function(element, obj) {
					var attr = obj.attr;
					var key;
					for(key in attr) {
						element.attr(key, attr[key]);
					}
					return element;
				},
				"css": function(element, obj) {
					element.css(obj.css);
					return element;
				},
				"data": function(element, obj) {
					var data = obj.data;
					var key;
					for(key in data) {
						element.data(key, data[key]);
					}
					return element;
				},
				"html": function(element, obj) {
					element.html(obj.html);
					return element;
				},
				"callback": function(element, obj) {
					if(obj.callback && typeof obj.callback === 'function') {
						// 속도개선: callback_arr[callback_arr.length++] = '값';
						callback_arr.push(
							function() {
								// this 는 현재 tag의 정보(tag, attr, css, data 등)
								return obj.callback.call(obj, element[0]); // element[0]: 옵션에 따라 생성된 해당 element 값
							}
						);
						/*
						var call = function() {
							// this 는 현재 tag의 정보(tag, attr, css, data 등)
							return child[index1].callback.call(child[index1], element[0]); // element[0]: 옵션에 따라 생성된 해당 element 값
						};
						*/
						/*
						// this 는 현재 tag의 정보(tag, attr, css, data 등)
						child[index1].callback.call(child[index1], element[0]); // element[0]: 옵션에 따라 생성된 해당 element 값
						*/
					}
					return element;
				}
			};
			function setCreate(child, parent) {
				var fragment = parent || document.createDocumentFragment();
				var index1, index2, element;
				
				// child [] 반복문
				for(index1 in child) { 
					// tag
					element = $(document.createElement(child[index1].tag));
					// child {} 반복문 
					for(index2 in child[index1]) { 
						if(func[index2]) {
							element = func[index2](element, child[index1]);
						}
					}
					// child 가 있으면 break(코드 순차 실행에 따른 개념) 하고, child 생성
					if(child[index1].child) { 
						setCreate(child[index1].child, element[0]);
					}
					$(fragment).append(element[0]);
				}
				return fragment;
			}

			// 생성
			if(parameter.child) {
				if(parameter.parent) { // 부모 element 에 삽입할 경우
					$(parameter.parent).append(setCreate(parameter.child));	
				}else {
					return setCreate(parameter.child);
				}
				//$(parameter.parent || 'body').append(setCreate(parameter.child));
			}

			// 콜백실행
			for(var index in callback_arr) {
				callback_arr[index]();
			}
		};

		return {
			"$": $,
			"ready": ready,
			"html": html
		};
	})();

	// $ 접근: global.api.$() 또는 global.api.dom.$()
	global.api.$ = global.api.dom.$;

	// api.core 수정하지 못하도록 제어


}(window);