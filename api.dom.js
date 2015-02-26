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

	// jquery.support()
	
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
			if(typeof selector === 'object' && selector !== null && (selector.nodeType || selector === window)) { //DOMElement, window
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
				if(match && match[1]) { // create element
					this.element = (context || document).createElement(match[1]);
					this.length = 1;
					this[0] = this.element;
					return this;
				}else { // search element
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

				// instance 에 this 바인딩
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
			one: function(events, handlers, capture) {
				var that = this;
				// new Date().getUTCMilliseconds();
				// new Date().getTime() + Math.random();
				var key = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
				var callback = function() {
					that.off('.' + key);
					handlers.apply(this, Array.prototype.slice.call(arguments));
				};
				// on
				that.on(events + '.' + key, callback, capture);
			},
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
						element.parentNode.insertBefore(this, element);
					}
				});
				return this;
			},
			// 지정한 콘텐츠로 대체
			replaceWith: function(value) {
				// x.replaceChild(y,z); // 표준
				/*
				return this.each(function() {
					this.outerHTML = value; // outerHTML 일부 브라우저 미지원
				});
				*/
				var element = typeof element.length !== 'undefined' ? element[0] : element;
				this.each(function() {
					if(this.parentNode) {
						this.parentNode.replaceChild(element, this);
					}
				});
				return this;
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
				var prefixes = ['', '-webkit-', '-moz-', '-ms-', '-o-'],
					regexp_css3 = /^(transition|border-radius|transform|box-shadow|perspective|flex-direction)/i, // 사용자가 수동으로 -webkit- , -moz- , -o- , -ms- 입력하는 것들은 제외시킨다.
					tmp = null,
					dv = document.defaultView;

				if(typeof value === 'string') { // get

					// return this[0].style[value]; // 방법1(CSS 속성과 JS 에서의 CSS 속성형식이 다르므로 사용불가능)
					// return this[0].style.getPropertyValue(value); // 방법2(CSS 속성명을 사용하여 정상적 출력가능)
					// 방법3
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

				}else if(typeof value === 'object') { // set - 형태: {"속성명": "값", ... } 

					for(var key in value) {
						this.each(function() {
							var element = this;
							if(!element || element.nodeType === 3 || element.nodeType === 8 || !element.style ) {
								return;
							}
							if(regexp_css3.test(key)) { // CSS3
								for(var tmp in prefixes) {
									// element.style[prefixes[tmp].concat(key)] = value[key]; // 방법1
									element.style.setProperty(prefixes[tmp].concat(key), value[key]); // 방법2
								}
							}else if(key in element.style) {
								// 단위(예:px)까지 명확하게 입력해줘야 한다.
								// 방법1
								element.style[key] = value[key];
							}else if(typeof element.style.setProperty !== 'undefined') {
								// 방법2 (Internet Explorer version 9)
								element.style.setProperty(key, value[key]);	
							}
						});
					}

					return this;

				}
			},
			width: function(value) {
				if(typeof value === 'undefined') { // get
					if(this[0] == window) { // window
						// 1. WindowView properties
						// window.outerWidth; // IE9 이상가능 
						// window.innerWidth; // all browsers, except IE before
						// document.documentElement.clientWidth; // Internet Explorer before version 9

						// 2. ScreenView properties
						// availWidth; //screen.availWidth; //표준
						// availHeight; //screen.availHeight; //표준

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
						// 1. WindowView properties
						// window.outerHeight; // IE9 이상가능
						// window.innerHeight; // all browsers, except IE before 
						// document.documentElement.clientHeight; // Internet Explorer before version 9

						// 2. ScreenView properties
						// availWidth; //screen.availWidth; //표준
						// availHeight; //screen.availHeight; //표준

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
			})(),
			animate: (function() {
				//var prefixes = ['transform', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform'];
				var prefixes = {
					'transform': 'transitionend', 
					'WebkitTransform': 'webkitTransitionEnd', 
					'MozTransform': 'transitionend', 
					'OTransform': 'oTransitionEnd', 
					'msTransform': 'MSTransitionEnd'
				};
				var temp_element = document.createElement('div');
				var event_transform = "transitionend";
				var support = false;
				var key;

				// CSS3 지원여부 판단
				for(key in prefixes) {
					if(temp_element.style[key] !== undefined) {
						support = true; // CSS3 지원
						event_transform = prefixes[key];
						break;
					}
				}

				if(support === true) {
					return function(properties, options) { // CSS3 지원
						var element = this;
						var duration = options.duration || 400;
						var easing = options.easing || 'ease';
						var complete = options.complete;
						/*
						transition-property: background; // 트랜지션할 속성
						transition-duration: 0.3s; // 트랜지션 지속 시간
						transition-timing-function: ease; // 지정한 시간 동안 트랜지션 속도
						transition-delay: 0.5s; // 트랜지션할 지연
						*/
						// 기존 css3 관련 값을 변수에 저장해 두고,
						// 트랜지션이 끝나면 기존 값으로 다시 변경해야 겠다! (즉, 기존 트랜지션 설정값을 바꾸지 않도록 하자)
						element.css({
							"transition-property": Object.keys(properties).join(','),
							"transition-duration": Number(duration) / 1000 + 's',
							"transition-timing-function": "ease"
						});

						element.css(properties);

						// callback
						if(complete && typeof complete === 'function') {
							element.one(event_transform, function() {
								complete();
							});
						}
					};
				}else {
					return function(properties, options) { // CSS3 미지원
						var element = this;
						var duration = options.duration || 400;
						var easing = options.easing || 'swing';
						var complete = options.complete;

						var max = Object.keys(properties).length;
						var set = {};
						var current = 0;
						var increment = 20;

						var regexp_color = /(backgroundColor|borderBottomColor|borderLeftColor|borderRightColor|borderTopColor|color|outlineColor)/ig;
						var regexp_reg = /^rgb/i;
						var regexp_hex = /^#/i;
						var regexp_num = /[^0-9]/g; // 숫자 제외값
						var regexp_transparent = /transparent/i;
						var regexp_opacity = /opacity/i;

						var colornames = {
							aqua: '#00ffff', black: '#000000', blue: '#0000ff', fuchsia: '#ff00ff',
							gray: '#808080', green: '#008000', lime: '#00ff00', maroon: '#800000',
							navy: '#000080', olive: '#808000', purple: '#800080', red: '#ff0000',
							silver: '#c0c0c0', teal: '#008080', white: '#ffffff', yellow: '#ffff00'
						};
						
						// HEX -> RBG
						var setHexToRgb = function(hex) {
							if(regexp_reg.test(hex)) {
								return hex;
							}
							// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
							var regexp_shorthand = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
							var hex = hex.replace(regexp_shorthand, function(m, r, g, b) {
								return r + r + g + g + b + b;
							});
							var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
							return result ? 'rgb(' + parseInt(result[1], 16) + ', ' + parseInt(result[2], 16) + ', ' + parseInt(result[3], 16) + ')' : 'rgb(0, 0, 0)';
						}
						// RBG -> HEX
						var setRgbToHex = function(color) {
							if(regexp_hex.test(color)) {
								return color;
							}
							var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);
							var red = parseInt(digits[2]);
							var green = parseInt(digits[3]);
							var blue = parseInt(digits[4]);
							var rgb = blue | (green << 8) | (red << 16);
							return '#' + rgb.toString(16);
						};
						// HEX
						var getBlendHEXColors = function(c0, c1, p) {
							var f = parseInt(c0.slice(1), 16),
								t = parseInt(c1.slice(1), 16),
								R1 = f>>16,
								G1 = f>>8&0x00FF, 
								B1 = f&0x0000FF, 
								R2 = t>>16,
								G2 = t>>8&0x00FF,
								B2 = t&0x0000FF;
							return "#"+(0x1000000+(Math.round((R2-R1)*p)+R1)*0x10000+(Math.round((G2-G1)*p)+G1)*0x100+(Math.round((B2-B1)*p)+B1)).toString(16).slice(1);
						};
						var getShadeHEXColor = function(color, percent) {   
							var f = parseInt(color.slice(1), 16),
								t = percent < 0 ? 0 : 255,
								p = percent < 0 ? percent * -1 : percent,
								R = f>>16,
								G = f>>8&0x00FF,
								B = f&0x0000FF;
							return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
						};
						// RGB
						var getBlendRGBColors = function(c0, c1, p) {
							var f = c0.split(","),
								t = c1.split(","),
								R = parseInt(f[0].slice(4)),
								G = parseInt(f[1]),
								B = parseInt(f[2]);
							return "rgb("+(Math.round((parseInt(t[0].slice(4))-R)*p)+R)+","+(Math.round((parseInt(t[1])-G)*p)+G)+","+(Math.round((parseInt(t[2])-B)*p)+B)+")";
						}
						var getShadeRGBColor = function(color, percent) {
							var f = color.split(","),
								t = percent < 0 ? 0 : 255,
								p = percent < 0 ? percent * -1 : percent,
								R = parseInt(f[0].slice(4)),
								G = parseInt(f[1]),
								B = parseInt(f[2]);
							return "rgb("+(Math.round((t-R)*p)+R)+","+(Math.round((t-G)*p)+G)+","+(Math.round((t-B)*p)+B)+")";
						}
						// http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
						function setShade(color, percent) { // 투명도
							if(color.length > 7 ) {
								return shadeRGBColor(color, percent);
							}else {
								return shadeColor(color, percent);
							}
						}
						function setBlend(color1, color2, percent) { // 색혼합
							if(color1.length > 7) {
								return getBlendRGBColors(color1, color2, percent);
							}else {
								return getBlendHEXColors(color1, color2, percent);
							}
						}
						/*function setShadeBlend(p,c0,c1) {
							var n = p < 0 ? p * -1 : p,
								u = Math.round,
								w = parseInt;
							if(c0.length > 7) {
								var f = c0.split(","),
									t = (c1 ? c1 : p < 0 ? "rgb(0,0,0)" : "rgb(255,255,255)").split(","),
									R = w(f[0].slice(4)),
									G = w(f[1]),
									B = w(f[2]);
								return "rgb("+(u((w(t[0].slice(4))-R)*n)+R)+","+(u((w(t[1])-G)*n)+G)+","+(u((w(t[2])-B)*n)+B)+")";
							}else {
								var f = w(c0.slice(1), 16),
									t = w((c1 ? c1 : p < 0 ? "#000000" : "#FFFFFF").slice(1), 16),
									R1 = f>>16,
									G1 = f>>8&0x00FF,
									B1 = f&0x0000FF;
								return "#"+(0x1000000+(u(((t>>16)-R1)*n)+R1)*0x10000+(u(((t>>8&0x00FF)-G1)*n)+G1)*0x100+(u(((t&0x0000FF)-B1)*n)+B1)).toString(16).slice(1);
							}
						}*/

						// requestAnimationFrame for Smart Animating http://goo.gl/sx5sts
						var setAnimationFrame = (function(){ 
							return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) { window.setTimeout(callback, 1000 / 60); /* 60 FPS (1 / 0.06) */ };
							//return  window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) { window.setTimeout(callback, 1000 / 60); /* 60 FPS (1 / 0.06) */ };
						})();

						/*
						easing functions
						t = current time
						b = start value
						c = change in value
						d = duration
						*/
						var easing_func = {
							/*
							 * easing 계산식은 아래 저작권에 따릅니다.
							 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
							 * TERMS OF USE - jQuery Easing
							 * 
							 * Open source under the BSD License. 
							 * 
							 * Copyright © 2008 George McGinley Smith
							 * All rights reserved.
							 */
							linear: function(t, b, c, d) {
								return t;
							},
							swing: function (t, b, c, d) {
								//return 0.5 - Math.cos( t*Math.PI ) / 2;
								return this['easeOutQuad'](t, b, c, d);
							},
							easeInQuad: function (t, b, c, d) {
								return c*(t/=d)*t + b;
							},
							easeOutQuad: function (t, b, c, d) {
								return -c *(t/=d)*(t-2) + b;
							},
							easeInOutQuad: function (t, b, c, d) {
								if ((t/=d/2) < 1) return c/2*t*t + b;
								return -c/2 * ((--t)*(t-2) - 1) + b;
							},
							easeInCubic: function (t, b, c, d) {
								return c*(t/=d)*t*t + b;
							},
							easeOutCubic: function (t, b, c, d) {
								return c*((t=t/d-1)*t*t + 1) + b;
							},
							easeInOutCubic: function (t, b, c, d) {
								if ((t/=d/2) < 1) return c/2*t*t*t + b;
								return c/2*((t-=2)*t*t + 2) + b;
							},
							easeInQuart: function (t, b, c, d) {
								return c*(t/=d)*t*t*t + b;
							},
							easeOutQuart: function (t, b, c, d) {
								return -c * ((t=t/d-1)*t*t*t - 1) + b;
							},
							easeInOutQuart: function (t, b, c, d) {
								if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
								return -c/2 * ((t-=2)*t*t*t - 2) + b;
							},
							easeInQuint: function (t, b, c, d) {
								return c*(t/=d)*t*t*t*t + b;
							},
							easeOutQuint: function (t, b, c, d) {
								return c*((t=t/d-1)*t*t*t*t + 1) + b;
							},
							easeInOutQuint: function (t, b, c, d) {
								if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
								return c/2*((t-=2)*t*t*t*t + 2) + b;
							},
							easeInSine: function (t, b, c, d) {
								return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
							},
							easeOutSine: function (t, b, c, d) {
								return c * Math.sin(t/d * (Math.PI/2)) + b;
							},
							easeInOutSine: function (t, b, c, d) {
								return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
							},
							easeInExpo: function (t, b, c, d) {
								return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
							},
							easeOutExpo: function (t, b, c, d) {
								return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
							},
							easeInOutExpo: function (t, b, c, d) {
								if (t==0) return b;
								if (t==d) return b+c;
								if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
								return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
							},
							easeInCirc: function (t, b, c, d) {
								return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
							},
							easeOutCirc: function (t, b, c, d) {
								return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
							},
							easeInOutCirc: function (t, b, c, d) {
								if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
								return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
							},
							easeInElastic: function (t, b, c, d) {
								var s=1.70158;var p=0;var a=c;
								if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
								if (a < Math.abs(c)) { a=c; var s=p/4; }
								else var s = p/(2*Math.PI) * Math.asin (c/a);
								return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
							},
							easeOutElastic: function (t, b, c, d) {
								var s=1.70158;var p=0;var a=c;
								if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
								if (a < Math.abs(c)) { a=c; var s=p/4; }
								else var s = p/(2*Math.PI) * Math.asin (c/a);
								return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
							},
							easeInOutElastic: function (t, b, c, d) {
								var s=1.70158;var p=0;var a=c;
								if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
								if (a < Math.abs(c)) { a=c; var s=p/4; }
								else var s = p/(2*Math.PI) * Math.asin (c/a);
								if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
								return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
							},
							easeInBack: function (t, b, c, d, s) {
								if (s == undefined) s = 1.70158;
								return c*(t/=d)*t*((s+1)*t - s) + b;
							},
							easeOutBack: function (t, b, c, d, s) {
								if (s == undefined) s = 1.70158;
								return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
							},
							easeInOutBack: function (t, b, c, d, s) {
								if (s == undefined) s = 1.70158;
								if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
								return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
							},
							easeInBounce: function (t, b, c, d) {
								return c - this.easeOutBounce (x, d-t, 0, c, d) + b;
							},
							easeOutBounce: function (t, b, c, d) {
								if ((t/=d) < (1/2.75)) {
									return c*(7.5625*t*t) + b;
								} else if (t < (2/2.75)) {
									return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
								} else if (t < (2.5/2.75)) {
									return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
								} else {
									return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
								}
							},
							easeInOutBounce: function (t, b, c, d) {
								if (t < d/2) return this.easeInBounce (t*2, 0, c, d) * .5 + b;
								return this.easeOutBounce (t*2-d, 0, c, d) * .5 + c*.5 + b;
							}
						};


						// start, end 값 추출
						for(key in properties) {
							// 설정할 스타일 생성
							set[key] = {};
							if(regexp_color.test(key)) { // color 관련
								set[key]['start'] = element.css(key); // 기존 설정값
								set[key]['end'] = properties[key]; // 사용자 설정값
								if((regexp_hex.test(set[key]['start']) || regexp_reg.test(set[key]['start'])) && (regexp_hex.test(set[key]['end']) || regexp_reg.test(set[key]['end']))) {
									if(regexp_hex.test(set[key]['end'])) {
										// RBG -> HEX
										set[key]['start'] = setRgbToHex(set[key]['start']);
									}else if(regexp_reg.test(set[key]['end'])) {
										// HEX -> RBG
										set[key]['start'] = setHexToRgb(set[key]['start']);
									}
									continue;
								}
							}else {
								set[key]['start'] = element.css(key);
								if(set[key]['start']) {
									set[key]['start'] = Number(set[key]['start'].replace(regexp_num, '')); // px 등 단위를 분리해서 가지고 있다가, 적용을 해야 한다.
								}
								set[key]['end'] = Number(String(properties[key]).replace(regexp_num, '')) - set[key]['start']; // 변경 스타일값 - 시작 스타일값
								continue;
							}
							// 위 조건문에서 continue; 가 발생하지 않았을 경우, 해당 설정 스타일 초기화
							max -= 1;
							delete properties[key]; 
						}
						var frame_func = function() {
							// increment the time
							current += increment;

							// css
							var val;
							var css = {};
							for(key in set) {
								if(regexp_color.test(key)) { // color 관련
									val = easing_func[easing](current, 0, 100, duration);
									if(/(transparent)/ig.test(set[key]['start'])) { // 투명도 처리 (작업중)
										val = Number(val) / 100;
										css[key] = setShade(set[key]['end'], val); 
									}else {
										val = Number(val) / 100; // 0 ~ 1
										css[key] = setBlend(set[key]['start'], set[key]['end'], val);
									}
								}else {
									// easing
									val = easing_func[easing](current, set[key]['start'], set[key]['end'], duration); // easing_func[easing](current time, start value, change in value, duration)
									val = Math.round(val); // 반올림
									// css
									css[key] = val + 'px';
								}
							}
							element.css(css);

							if(current < duration) {
								// frame
								setAnimationFrame(frame_func);
							}else if(complete && typeof complete === 'function') {
								// callback
								complete();
							}
						};
						frame_func();
					};
				}
			})()
		};

		// return
		return {
			"$": $,
			// DOM Ready
			"ready": function(callback) { 
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
			},
			// Create HTML
			"html": function(parameter) {
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
			},
			// 문서내 포커스를 가지고 있거나 활성 상태인 노드
			activeElement: function() {
				return document.activeElement;
			},
			// 문서 혹은 문서 내의 특정 노드가 포커스를 가지고 있는지 판별
			hasFocus: function(element) {
				return (element || document).hasFocus();
			},
			// element를 View로 스크롤
			scrollIntoView: function(element, is) {
				return element.scrollIntoView(is || true);
			},
			// 스크롤 위치 
			scrollOffset: function() {
				var top = null, left = null;
				if(typeof(window.pageYOffset) == 'number') {
					//Netscape compliant
					top = window.pageYOffset;
					left = window.pageXOffset;
				}else if(document.body && (document.body.scrollLeft || document.body.scrollTop)) {
					//DOM compliant
					top = document.body.scrollTop;
					left = document.body.scrollLeft;
				} else if(document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
					//IE6 standards compliant mode
					top = document.documentElement.scrollTop;
					left = document.documentElement.scrollLeft;
				}

				return {"top": top, "left": left};
			},
			// 두 node 가 동일한지 판단
			isEqualNode: function(element1, element2) {
				return element1.isEqualNode(element2);
			},
			// element의 Top, Right, Bottom, Left, Width, Height 값
			elementOffset: function(element) {
				return element.getBoundingClientRect();
				//var offset = element.getBoundingClientRect();
				//return {"top":offset.top, "right":offset.right, "bottom":offset.bottom, "left":offset.left};
			},
			// 뷰포트의 즉정 지점에서 최상단 element 얻기
			elementFromPoint: function(top, left) {
				return document.elementFromPoint(top, left);
			},
			// 스크롤될 element의 크기를 얻기 (문서 전체크기를 알 수 있음)
			elementScrollSize: function(element) {
				var height = null, width = null;
				if(element) {
					height = element.scrollHeight;
					width = element.scrollWidth;
				}else {
					height = document.documentElement.scrollHeight;
					width = document.documentElement.scrollWidth;
				}
				return {"height": height, "width": width};
			},
			// top, left로 부터 스크롤된 픽셀을 가져오거나 설정하기
			elementScrollTopLeft: function(element, top, left) { //get, set 동시 작업
				if(top || left) {
					if(top) element.scrollTop = top;
					if(left) element.scrollTop = left;
				}else {
					return {"top": element.scrollTop, "left": element.scrollLeft};
				}
			}
		};
	})();

	// $ 접근: global.api.$() 또는 global.api.dom.$()
	global.api.$ = global.api.dom.$;

	// api.core 수정하지 못하도록 제어


}(window);