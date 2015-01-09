/**
 * dom
 * UI element 부분 제어
 */

void function(global) {
	'use strict'; // ES5
	if(typeof global === 'undefined' || typeof global.api === 'undefined' || typeof global.api.dom !== 'undefined') return false;

	// jQuery
	//if(!document.querySelectorAll && !window.jQuery) document.write('<script src="//code.jquery.com/jquery-1.11.0.min.js"><\/script>');

	global.api.dom = (function() {

		//dom
		var Dom = function(arr) {
			if(typeof arr[0] === 'object' && (arr[0].nodeType || arr[0] === window)) { //DOMElement, window
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
				this.element = arr[0];
				this.length = 1;
				this[0] = this.element;
				return this;
			}else if(typeof arr[0] === 'string'){
				this.getSelector(arr[0]);
			}else {
				return arr[0];
			}
		};
		Dom.prototype = {
			// Element 를 Array 로 변환하여 반환한다.
			// Array 기본 메소드 사용이 가능해진다.
			getElementsToArray: function(elements) {
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
			getSelector: (function() {
				if(document.querySelectorAll) {
					return function(name, context) {
						var context = context || document,
							element = context.querySelectorAll(name),
							arr = this.getElementsToArray(element);

						this.element = element;
						this.length = arr.length;
						for(var key in arr) {
							this[key] = arr[key];
						}

						return this;
					};
				}else if(window.jQuery) {
					return function(name, context) {
						var context = context || document;

						// jQuery 호출
						element = jQuery(name, context);
						this.element = element[0];
						this[0] = element[0];
						this.length = 1;

						return this;
					};
				}else {
					return false;
				}
			})(),
			/*
			getSelector: function(name, context) {
				var context = context || document,
					element, arr;

				if(document.querySelectorAll) { // IE7 이하 사용 불가능
					element = context.querySelectorAll(name),
					arr = this.getElementsToArray(element);

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
			find: function() {
				var arr = Array.prototype.slice.call(arguments),
					context = this[0] || document;
				return this.getSelector(arr, context);
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
			children: function() {
				//hasChildNodes; // 노드에 자식 노드가 있는지 여부
				//childNodes[]; // 자식노드 리스트
				//children[]; // 자식요소 리스트
				if(this[0].hasChildNodes()) {
					return this[0].children;
				}
			},
			childElementCount: function() { // 자식요소의 수
				return this[0].childElementCount;
			},
			// event
			live: function(selector, events, handlers, capture) {
				this.each(function() {
					var callback = function(e) {
						var event = e || window.event;
						var type = event.type;
						var target = event.target;
						api.$(this).find(selector).each(function() {
							if(target.isEqualNode(this)) {
								handlers.call(this);
							}
						});
					};
					this.addEventListener(events, callback);
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
					api.cache.event[key] = [];

					// 이벤트 설정
					this.each(function() {
						callback = function() {
							handlers.apply(this, Array.prototype.slice.call(arguments));
						};
						addEvent.call(this, events, callback, capture);
						api.cache.event[key].push({
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
					var cache, arr = [], key;

					// 이벤트 정보
					arr = events.split('.');
					if(arr.length > 1) {
						events = arr.shift();
					}
					key = arr.join('');

					// 이벤트 해제
					if(api.cache.event[key]) {
						cache = api.cache.event[key];
						for(var index in cache) {
							removeEvent.call(cache[index].element, cache[index].events, cache[index].handlers, cache[index].capture);
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
			// 
			attr: function(name, value) { // attribute
				if(typeof value === 'undefined') { // get
					return this[0].getAttribute(name);
				}else { // set
					this.each(function() {
						this.setAttribute(name, value);
					});
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
				// emement.hasAttribute('href');
				return this[0].hasAttribute(name);
			},
			// 
			prop: function(name, value) { // property
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
					// return this[i].outerHTML;
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
			append: function(emement) {
				// emement.appendChild();
				this[0].appendChild(emement);
				return this;
			},
			appendHtml: function(value, position) {
				/*
				var html = this.html.call(this);
				html += value;
				this.html.call(this, html);
				*/
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
				var position = position || 'beforeend';
				this[0].insertAdjacentHTML(position, value);
				return this;
			},
			before: function(emement) {
				// emement.insertBefore('대상', '어디');
				// 자식 노드 목록 끝에 노드를 추가하는 것 외에 삽입 위치를 조정
				// insertBefore() 메서드의 두번째 매개변수를 전달하지 않으면,
				// 이 메서드는 appendChild() 처럼 동작한다.
				this.each(function() {
					this.insertBefore(emement, this);
				});
				return this;
			},
			replaceWith: function(value) {
				return this.each(function() {
					this.outerHTML = value;
				});
			},
			// 
			remove: function() {
				// emement.removeChild();
				this.each(function() {
					this.parentNode.removeChild(this);
				});
			},
			clone: function(is) {
				// emement.cloneNode();
				// is : 자식 노드들도 모두 복제할지 여부(true:복사, false:해당없음)
				return this[0].cloneNode(is || true); // id를 가진 node를 복사할 때 주의하자(페이지내 중복 id를 가진 노드가 만들어 지는 가능성이 있다)
			},
			//
			css: function(value) {
				var type = typeof value,
					CSS3Browsers = ['', '-moz-', '-webkit-', '-o-', '-ms-'],
					CSS3RegExp = /^(transition|border-radius|transform|box-shadow|perspective|flex-direction)/i; // 사용자가 수동으로 -webkit- , -moz- , -o- , -ms- 입력하는 것들은 제외시킨다.

				if(type === 'string') { // get

					// return getStyle(this[0], value); // 방법1
					// return this[0].style[value]; // 방법2(CSS 속성과 JS 에서의 CSS 속성형식이 다르므로 사용불가능)
					return this[0].style.getPropertyValue(value); // 방법3(CSS 속성명을 사용하여 정상적 출력가능)

				}else if(type === 'object'){ // set

					for(var key in value) {
						this.each(function() {
							var emement = this;
							if(CSS3RegExp.test(key)) { // CSS3
								for(var tmp in CSS3Browsers) {
									// emement.style[CSS3Browsers[tmp].concat(key)] = value[key]; // 방법1
									emement.style.setProperty(CSS3Browsers[tmp].concat(key), value[key]); // 방법2
								}
							}else {
								// 단위(예:px)까지 명확하게 입력해줘야 한다.	
								// this.style[key] = value[key]; // 방법1
								emement.style.setProperty(key, value[key]); // 방법2
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
				// emement.classList; // 클래스 리스트 출력
				var regex = new RegExp('(?:\\s|^)' + name + '(?:\\s|$)');
				return !!this[0].className.match(regex); // !! 느낌표가 2개 이유는 type 를 boolean 으로 만들기 위함
			},
			addClass: function(name) {
				// emement.classList.add('');
				var arr = name.split(' '),
					emement;
				this.each(function() {
					// this.className += ' ' + name; // 방법1
					// this.classList.add(name); // 방법2 (한번에 하나의 클래스만 입력 가능하다. 죽, 띄어쓰기로 여러 클래스 입력 불가능)
					emement = this;
					for(var key in arr) {
						emement.classList.add(arr[key]);
					}
				});
				return this;
			},
			removeClass: function(name) { 
				// emement.classList.remove('');
				var // regex = new RegExp('(?:\\s|^)' + name + '(?:\\s|$)'),
					arr = name.split(' '),
					emement;
				this.each(function() {
					// this.className = this.className.replace(regex, ' '); // 방법1
					// this.classList.remove(name); // 방법2 (한번에 하나의 클래스만 삭제 가능하다. 죽, 띄어쓰기로 여러 클래스 삭제 불가능)
					emement = this;
					for(var key in arr) {
						emement.classList.remove(arr[key]);
					}
				});
				return this;
			},
			toggleClass: function(name) {
				// emement.classList.toggle('');
				var arr = name.split(' '),
					emement;
				// this.hasClass.apply(this, arguments) ? this.removeClass.apply(this, arguments) : this.addClass.apply(this, arguments); // 방법1
				this.each(function() { // 방법2
					emement = this;
					for(var key in arr) {
						emement.classList.toggle(arr[key]);
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
		};

		// Create HTML
		var html = function(parameter) {
			/*
			// 기본구조
			api.dom.html({
				"area": "#doh", // 작업영역
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
				// id와 instance는 동일한 이름으로 한다.
				"area": "#doh",
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
			function html(child, parent) {
				var fragment = parent || document.createDocumentFragment();
				var index, element, key, attr, data;
				for(index in child) {
					element = api.$(document.createElement(child[index].tag));
					// attr
					if(child[index].attr) {
						attr = child[index].attr;
						for(key in attr) {
							element.attr(key, attr[key]);
						}
					}
					// css
					if(child[index].css) {
						element.css(child[index].css);
					}
					// data
					if(child[index].data) {
						data = child[index].data;
						for(key in data) {
							element.data(key, data[key]);
						}
					}
					// html
					if(child[index].html) {
						element.html(child[index].html);
					}
					// callback
					if(child[index].callback && typeof child[index].callback === 'function') {
						// 속도개선: callback_arr[callback_arr.length++] = '값';
						callback_arr.push(
							function() {
								// this 는 현재 tag의 정보(tag, attr, css, data 등)
								return child[index].callback.call(child[index], element[0]); // element[0]: 옵션에 따라 생성된 해당 element 값
							}
						);
						/*
						var call = function() {
							// this 는 현재 tag의 정보(tag, attr, css, data 등)
							return child[index].callback.call(child[index], element[0]); // element[0]: 옵션에 따라 생성된 해당 element 값
						};
						*/
						/*
						// this 는 현재 tag의 정보(tag, attr, css, data 등)
						child[index].callback.call(child[index], element[0]); // element[0]: 옵션에 따라 생성된 해당 element 값
						*/
					}
					// child 가 있으면 break 하고, child 생성
					if(child[index].child) { 
						html(child[index].child, element[0]);
					}
					api.$(fragment).append(element[0]);
				}
				return fragment;
			}

			// 생성
			if(parameter.child) {
				api.$(parameter.area || 'body').append(html(parameter.child));
			}

			// 콜백실행
			for(var index in callback_arr) {
				callback_arr[index]();
			}
		};

		// $
		var $ = function() {
			return new Dom(Array.prototype.slice.call(arguments));
		};

		return {
			"$": $,
			"Dom": Dom,
			"ready": ready,
			"html": html
		};
	})();

	// api.core 수정하지 못하도록 제어


}(window);