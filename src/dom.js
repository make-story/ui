/**
 * DOM 제어 
 */

// 정규식
const regexp = {
	pixel_unit_list: /width$|height$|top|right|bottom|left|fontSize|letterSpacing|lineHeight|^margin*|^padding*/i, // 단위 px 해당되는 것
	time_unit_list: /.+(-duration|-delay)$/i, // seconds (s) or milliseconds (ms)
	position_list: /^(top|right|bottom|left)$/, // css 위치
	display_list: /^(display|visibility|opacity|)$/i,
	text: /^(\D+)$/i, // 텍스트
	num_unit: /^([0-9]+)(\D+)$/i, // 단위
	num: /^[+-]?\d+(\.\d+)?$/, // 숫자
	source_num: /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source, // +=, -= 숫자와 연산자 분리
	trim: /(^\s*)|(\s*$)/g // 양쪽 여백
};

// 일반적인 고유값
const getKey = () => {
	/*
	-
	랜덤, 날짜 결합
	var arr = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
	var date = new Date();
	return [arr[Math.floor(Math.random() * arr.length)], Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1), date.getFullYear(), (Number(date.getMonth()) + 1), date.getDate(), date.getHours(), date.getMinutes()].join('');
	-
	페이스북 참고
		1. 'f' + : 'f' 문자열에 뒤의 것을 더할 건데, // f
		2. Math.random() : 0~1 사이의 랜덤한 수 생성에 // 0.13190673617646098
		3. * (1 << 30) : 2의 30승을 곱하고, // 0.13190673617646098 * 1073741824 = 141633779.5
		4. .toString(16) : 16진수로 문자열로 표현한 후에, // Number(141633779.9).toString(16) = 87128f3.8
		5. .replace('.', '') : 문자열에서 닷(소수점)을 제거한다. // 'f' + 87128f38 = f87128f38
	return 'f' + (Math.random() * (1 << 30)).toString(16).replace('.', '');
	*/
	return ['dom', new Date().getTime(), (Math.random() * (1 << 30)).toString(16).replace('.', '')].join('').substr(0, 24); // MongoDB _id 24자 길이
};

// parseHTML
const getParseHTML = htmlString => {
	// IE9+
	let tmp = document.implementation.createHTMLDocument();
	tmp.body.innerHTML = htmlString;
	return tmp.body.children;
};

// type
const type = value => Object.prototype.toString.call(value).replace(/^\[object (.+)\]$/, '$1').toLowerCase();

// 숫자여부
const isNumeric = value => !isNaN(parseFloat(value)) && isFinite(value);

// 숫자 분리
const getNumber = value => isNumeric(value) ? value : String(value).replace(/[^+-\.\d]|,/g, '') || 0;

// 숫자/단위 분리 (예: 10px -> [0]=>10px, [1]=>10, [2]=>'px')
const getNumberUnit = value => {
	//const regexp_source_num = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;
	const regexp_number = new RegExp("^(" + regexp.source_num + ")(.*)$", "i");
	const matches = regexp_number.exec(value);
	return matches ? matches : [value];
};

// inner, outer 관련
const getAugmentWidthHeight = (instance/*DOM 인스턴스 값*/, property="") => {
	let value = {
		'padding': 0,
		'border': 0,
		'margin': 0
	};
	let arr = [], i, max, tmp;

	// 유효성 검사
	if(!instance || typeof property !== 'string' || !(/^(width|height)$/i.test(property))) {
		return value;
	}

	// 소문자 변환
	property = property.toLowerCase();

	// width, height 에 따라 분기 (paddingLeft, paddingRight, paddingTop, paddingBottom, ...)
	if(property === 'width') {
		arr = ["Left", "Right"];
	}else if(property === 'height') {
		arr = ["Top", "Bottom"];
	}
	for(i=0, max=arr.length; i<max; i++) {
		// padding
		tmp = getNumberUnit(instance.css('padding' + arr[i]));
		value['padding'] += (tmp && tmp[1] && isNumeric(tmp[1])) ? Number(tmp[1]) : 0;
		// border
		tmp = getNumberUnit(instance.css('border' + arr[i] + 'Width'));
		value['border'] += (tmp && tmp[1] && isNumeric(tmp[1])) ? Number(tmp[1]) : 0;
		// margin
		tmp = getNumberUnit(instance.css('margin' + arr[i]));
		value['margin'] += (tmp && tmp[1] && isNumeric(tmp[1])) ? Number(tmp[1]) : 0;
	}

	return value;
};

// width, height 등 사이즈 정보 반환 - display: none 상태에서도 가능
// property: width, height
// extra: inner(padding), outer(border) 값 포함구분
// is: margin 값 포함여부
const getElementWidthHeight = (instance/*DOM 인스턴스 값*/, property="", extra="", is=false) => {
	// 유효성 검사
	if(!instance || typeof property !== 'string' || !(/^(width|height)$/i.test(property)) || (extra && !/^(inner|outer)$/i.test(extra))) {
		return 0;
	}

	let is_border_box = (instance.css('boxSizing') === 'border-box') ? true : false; // IE와 웹킷간의 박스모델 스팩이 다르므로 구분해야 한다.
	let is_display = (instance.css('display') === 'none') ? true : false;
	let queue = {
		/*
		css property 기본값
		position: static
		visibility: visible
		display: inline | block
		*/
		'position': /^(static)$/i,
		'visibility': /^(visible)$/i,
		'display': /^(inline|block)$/i
	};
	let value = 0;
	let rect = {};
	let key, tmp;

	// 소문자 변환
	property = property.toLowerCase();

	// display가 none 경우(화면에 렌더 상태가 아님) width, height 추출에 오차가 발생한다.
	if(is_display === true) {
		// 현재 설정된 css 값 확인
		for(key in queue) {
			if(tmp = instance.css(key)) {
				if(queue[key].test(tmp)) {
					// 현재 element에 설정된 style의 값이 queue 목록에 지정된 기본값(style property default value)과 동일하거나 없으므로
					// 작업 후 해당 property 초기화(삭제)
					queue[key] = null;
				}else {
					// 현재 element에 설정된 style의 값이 queue 목록에 지정된 기본값(style property default value)이 아니므로
					// 현재 설정된 값을 저장(종료 후 현재값으로 재설정)
					queue[key] = tmp;
				}
			}
		}
		// display가 none 상태의 element 의 크기를 정확하게 추출하기 위한 임시 css 설정
		instance.css({'position': 'absolute', 'visibility': 'hidden', 'display': 'block'});
	}

	// 해당 property 값
	value = instance.get(0)['offset' + (property.substring(0, 1).toUpperCase() + property.substring(1))]; // offsetWidth, offsetHeight (border + padding + width 값, display: none 의 경우는 0 반환)
	if(typeof instance.get(0).getBoundingClientRect === 'function') { // chrome 에서는 정수가 아닌 실수단위로 정확한 값을 요구하므로 getBoundingClientRect 사용, IOS 일부에서 getBoundingClientRect 값에 대한 오류가 있다.
		rect = instance.get(0).getBoundingClientRect(); // width/height: IE9 이상 지원
		if(property in rect) {
			value = rect[property];
		}/*else if(property === 'width') {
			value = rect.right - rect.left;
		}else if(property === 'height') {
			value = rect.bottom - rect.top;
		}*/
	}

	if(value <= 0 || value === null) {
		// 방법1: css로 값을 구한다.
		tmp = getNumberUnit(instance.css(property));
		value = (tmp && tmp[1] && isNumeric(tmp[1])) ? Number(tmp[1]) : 0;
		if(extra) {
			// inner, outer 추가
			tmp = getAugmentWidthHeight(instance, property);
			value += tmp['padding'];
			if(extra === 'outer') {
				value += tmp['border'];
				if(is === true) {
					value += tmp['margin'];
				}
			}
		}
	}else {
		// 방법2: offset 값 가공 (margin, border, padding)
		tmp = getAugmentWidthHeight(instance, property);
		if(extra === 'inner') {
			value -= tmp['border'];
		}else if(extra === 'outer' && is === true) {
			value += tmp['margin'];
		}else {
			value -= tmp['border'];
			value -= tmp['padding'];
		}
	}

	// 값 반환을 위해 임시 수정했던 style 복구
	if(is_display === true) {
		// queue
		instance.css(queue);
	}

	return value;
};

// dom, svg 컨트롤
export class DOM {
	constructor(selector, context) {
		let match1, match2, elements, i, count;

		// 검색된 element 를 담을 배열 (여러개의 element 값)
		this.elements = [];
		this.length = 0;

		// selector
		if(typeof selector === 'object') {
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
			if('elements' in selector) {
				// DOM 인스턴스 값
				return selector;
			}else if(selector.nodeType || selector === window) { 
				// DOMElement, window (querySelectorAll 반환값 nodeType 은 undefined)
				this.elements[0] = selector;
			}else if(Array.isArray(selector)) { 
				// array list - DOM 인스턴스 결과 값
				this.elements = selector;
			}else if(Object.keys(selector).length > 0) { 
				// object list - querySelectorAll 으로 리턴된 것
				count = 0;
				for(i in selector) {
					if(selector.hasOwnProperty(i) && selector[i].nodeType) {
						this.elements[count] = selector[i];
						count++;
					}
				}
			}
		}else if(typeof selector === 'string') {
			match1 = /<(\w+:\w+|\w+)[^>]*/.exec(selector); // tag 를 생성하려는 것인지 확인 정규식 ('<svg:g>' 또는 '<div>' 형태)
			//match1 = /<(\w+)[^>]*/.exec(selector); // tag 를 생성하려는 것인지 확인 정규식 - createElementNS 사용안하는 경우
			if(match1 && match1[1]) { 
				// tag 생성
				match2 = /(\w+):(\w+)/.exec(selector);
				switch(match2 && match2[1] && match2[2] && match2[1].toLowerCase()) {
					case 'xhtml':
						// new DOM('<xhtml:값>')
						this.elements[0] = document.createElementNS("http://www.w3.org/1999/xhtml", match2[2]);
						break;
					case 'math':
						// new DOM('<math:값>')
						this.elements[0] = document.createElementNS("http://www.w3.org/1998/Math/MathML", match2[2]);
						break;
					case 'svg':
						// new DOM('<svg:값>')
						this.elements[0] = document.createElementNS("http://www.w3.org/2000/svg", match2[2]);
						break;
					case 'text':
						// text node
						// new DOM('<text:텍스트값>')
						// http://www.mediaevent.de/javascript/DOM-Neue-Knoten.html
						this.elements[0] = document.createTextNode(match2[2]);
						break;
					default:
						// element node
						this.elements[0] = document.createElement(match1[1]);
						break;
				}
			}else { 
				// search element
				/*
				-
				getElementById()
				getElementsByClassName()
				getElementsByTagName()
				getElementsByTagNameNS()
				querySelector()
				querySelectorAll()

				-
				const arr = [...document.querySelectorAll('p')];
				arr.find(element => {...});  // .find() now works
				const $ = document.querySelector.bind(document);
				$('#container');
				const $$ = document.querySelectorAll.bind(document);
				$$('p');
				*/

				// document.querySelectorAll(x); // IE8의 경우 CSS 2.1 Selector (https://www.w3.org/TR/CSS2/selector.html) 제한적으로 지원
				elements = (context || document).querySelectorAll(selector); // querySelectorAll: length 있음, querySelector: length 없음
				if(elements instanceof NodeList || elements instanceof HTMLCollection) {
					this.elements = Array.from(elements);
					/*for(i=0, count=elements.length; i<count; i++) {
						this.elements[i] = elements[i];
					}*/
				}
			}
		}else {
			// 기본 document 반환
			this.elements = [ window.document ];
		}

		// 총 element 수
		this.length = this.elements.length;

		// this.elements -> this[연관배열] 형태 접근 가능하도록 만든다.
		for(i=0; i<this.length; i++) {
			this[i] = this.elements[i];
		}

		// 기본 리턴
		return this;
	}

	// document ready
	// new DOM().ready(() => { ... });
	ready = (function() {
		/*
		IE9+
		function ready(callback) {
			if(document.readyState !== 'loading') {
				callback();
			}else {
				document.addEventListener('DOMContentLoaded', callback);
			}
		}
		*/
		// readyState: IE8에서는 Only supports 'complete'
		if(document.readyState === "interactive" || document.readyState === "complete") {
			// IE8 등에서 window.setTimeout 파라미터로 바로 함수값을 넣으면 오류가 난다.
			// 그러므로 function() {} 무명함수로 해당 함수를 실행시킨다.
			return function(callback) {
				window.setTimeout(function() {
					callback();
				});
			};
		}else {
			return function(callback) {
				// IE9 이상
				document.addEventListener("DOMContentLoaded", callback, false);
			};
		}
	})()

	// activeElement
	focusElement() {
		let focused = document.activeElement;

		if(!focused || focused === document.body) {
			focused = null;
		}else if(document.querySelector) {
			focused = document.querySelector(':focus');
		}

		return focused;
	}

	// element 의 window
	static getWindow(element) {
		return element !== null && element === element.window ? element : element.nodeType === 9 ? element.defaultView || element.parentWindow : window;
	}

	// element 의 docuemnt
	static getDocument(element) {
		// document.documentElement; // <html> element // 표준
		// document.getRootNode(options); // 문맥 객체의 루트를 반환 (options 값이 {composed:false}의 경우 ShadowRoot 반환될 수 있음)
		return element && element.ownerDocument || window.document;
	}

	// DOM 인스턴스 내부 elements 수 존재여부
	static isElementLength(that) {
		return (that && Array.isArray(that.elements) && that.elements.length) ? true : false;
	}
	
	// DOM 인스턴스 리턴
	eq(index) {
		return (DOM.isElementLength(this) && typeof index === 'number' && this.elements[index]) ? new DOM(this.elements[index]) : this;
	}

	// DOM 인스턴스 내부 element 리턴
	get(index) {
		if(DOM.isElementLength(this)) {
			return (typeof index === 'number' && this.elements[index]) ? this.elements[index] : this.elements;
		}
		return false;
	}

	// child node search
	find(selector) {
		return (DOM.isElementLength(this)) ? new DOM(selector, this.elements[0] || document) : this;
	}

	// filter
	/*filter(handler) {
		// IE9+
		Array.prototype.filter.call(this.elements, handler);
	}*/

	// parent
	parent() {
		// x.parentNode;
		return this.elements[0].parentNode || this.elements[0];
	}

	// siblings
	/*siblings() {
		let that = this;
		// IE9+
		Array.prototype.filter.call(this.elements[0].parentNode.children, function(child) {
			return child !== that.elements[0];
		});
	}*/

	// 여러 element 리스트 중, index 에 해당하는 element 반환
	index(element) {
		// x.previousSibling;
		/*
		IE9+
		function index(element) {
			if(!element) return -1;
			var i = 0;
			do {
				i++;
			} while(element = element.previousElementSibling);
			return i;
		}
		*/
		const dir = (target/*element 값*/, dir="") => { // dir 값에 해당하는 element 배열에 담아서 리턴 
			let matched = [];
			let current = target[dir];
			while(current && current.nodeType !== 9) {
				if(current.nodeType === 1) {
					matched.push(current);
				}
				current = current[dir];
			}
			return matched;
		};
		const inArray = (target/*element 값*/, elements=[]) => {
			let i, max;
			if(Array.isArray(elements)) {
				for(i=0, max=elements.length; i<max; i++) {
					if(elements[i] && elements[i] === target) {
						return i;
					}
				}
			}
			return -1;
		};

		if(!DOM.isElementLength(this)) {
			return -1;
		}else if(!element) {
			return (this.elements[0] && this.elements[0].parentNode) ? dir(this.elements[0].firstChild, 'previousSibling').length : -1;
		}else if(typeof element === 'object' && !element.nodeType && element[0]) {
			return inArray(element[0], this.elements);
		}
	}

	// loop elements
	each(callback) {
		let i, max;
		/*
		IE9+
		var elements = document.querySelectorAll(selector);
		Array.prototype.forEach.call(elements, function(element, i) {

		});
		*/
		if(DOM.isElementLength(this) && typeof callback === 'function') {
			for(i=0, max=this.elements.length; i<max; i++) {
				// i:key, this.elements[i]:element
				if(callback.apply(this.elements[i], [i, this.elements[i]]) === false/*함수 실행결과값이 return false 경우 break*/) {
					break;
				}
			}
		}

		return this;
	}

	// parent node search
	// [주의!] element 를 반환하는 것이 아닌, DOM 인스턴스 내부 element 리스트롤 변경한다.
	closest(selector="", context=document.documentElement/*documentElement: <html />*/) {
		// document.querySelector(x); // IE8이상 사용가능 ('.testClass + p' selector 형태는 IE9이상 사용가능)
		// x.parentNode; // 표준
		// document.querySelector('p').closest('div'); // IE 미지원

		/*
		// IE 폴리필
		// https://developer.mozilla.org/ko/docs/Web/API/Element/closest
		if(!Element.prototype.matches) {
			Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
		}
		if(!Element.prototype.closest) {
			Element.prototype.closest = function(s) {
				let el = this;
				do {
					if(el.matches(s)) return el;
					el = el.parentElement || el.parentNode;
				}while (el !== null && el.nodeType === 1);
				return null;
			};
		}
		*/

		let i, max = (this.elements && this.elements.length) || 0;
		let element, search;
		const isEqualNode = (search/*element*/, selector="") => {
			let i, max;
			let list = search.parentNode.querySelectorAll(selector);
			for(i=0, max=list.length; i<max; i++) {
				if(search.isEqualNode(list[i])) {
					return list[i];
				}
			}
			return false;
		};

		/*
		-
		참고: 이벤트 발생 target 부터 상위 element 리스트(배열)
		event.path || (event.composedPath && event.composedPath());
		*/
		if(!max) {
			return this;
			//return false;
		}else if(typeof selector === 'string') {
			for(i=0; i<max; i++) { // this.elements[] 연관배열
				for(search = this.elements[i]; search && search !== context; search = search.parentNode) {
				//for(search = this.elements[i].parentNode; search && search !== context; search = search.parentNode) {
					// search element 하위로 찾고자 하는 node (element) 검색 
					element = search.querySelector(selector);
					if(element) {
						this.elements[0] = element;
						return this;
					}else if(search.parentNode) {
						// 현재 search 가 찾고자 하는 node 인지 확인 
						element = isEqualNode(search, selector);
						if(element) {
							this.elements[0] = element;
							return this;
						}
					}
				}
			}
		}

		return this;
	}

	// 자식요소 리스트
	children() {
		// x.hasChildNodes(); // 표준
		// x.firstChild;
		// x.lastChild;
		// x.childNodes[1]; // IE9이상 사용가능 (IE8이하 부분지원), TextNode 까지 검색
		// x.children[1]; // IE9이상 사용가능 (IE8이하 부분지원)
		// getElementsByTagName('*'); // 폴리필
		/*
		IE9+
		element.children
		*/
		if(DOM.isElementLength(this) && this.elements[0].hasChildNodes()) { // true | false
			return this.elements[0].children;
		}
	}

	// class="" 속성값 반환
	getClass() {
		// x.classList; // IE10이상 사용가능
		// x.className; // 표준
		if(DOM.isElementLength(this)) {
			// classList / className 초기화 시점분기 패턴을 사용하지 않고, if문으로 확인하는 이유는 $(selector) 리스트에 svg 등이 들어있을 가능성 때문이다.
			if('classList' in this.elements[0]) {
				return this.elements[0].classList;
			}else if('className' in this.elements[0]) {
				return this.elements[0].className.split(/\s+/);
			}
		}
	}

	// class="" 특정 속성값 존재여부 
	hasClass(name="") {
		// x.className; // 표준
		/*
		IE10+
		element.classList.contains(className);
		*/
		let regexp;

		if(DOM.isElementLength(this) && typeof name === 'string' && this.elements[0].className) {
			// 정규식을 new RegExp 로 만들때는 이스케이프문자 '\' 는 '\\' 로 해줘야 한다.
			regexp = new RegExp('(\\s|^)' + name + '(\\s|$)'); 
			return regexp.test(this.elements[0].className);
		}

		return false;
	}

	// class="" 속성에 값 추가 
	addClass(name="") {
		// x.classList; // IE10이상 사용가능
		// x.className; // 표준
		/*
		IE10+
		element.classList.add(className);
		*/
		let i, max = (this.elements && this.elements.length) || 0;
		let key;
		let arr;

		if(!max) {
			return this;
			//return false;
		}else if(typeof name === 'string') {
			arr = name.split(/\s+/); // 띄어쓰기로 구분된 여러 클래스 분리
			for(i=0; i<max; i++) {
				for(key in arr) {
					// 초기화 시점분기 패턴을 사용하지 않고, if문으로 확인하는 이유는 $(selector) 리스트에 svg 등이 들어있을 가능성 때문이다.
					if('classList' in this.elements[i]) {
						this.elements[i].classList.add(arr[key]); // add(): 한번에 하나의 클래스만 입력 가능하다. 즉, 띄어쓰기로 여러 클래스 입력 불가능
					}else if('className' in this.elements[i] && !(/*!! boolean 타입으로 변환*/!!this.elements[i].className.match(new RegExp('(\\s|^)' + arr[key] + '(\\s|$)')))) { 
						this.elements[i].className += " " + arr[key];
					}
				}
			}
		}

		return this;
	}

	// class="" 속성에서 특정 값 제거
	removeClass(name="") {
		// x.classList; // IE10이상 사용가능
		// x.className; // 표준
		/*
		IE10+
		element.classList.remove(className);
		*/
		let regexp;
		let i, max = (this.elements && this.elements.length) || 0;
		let key;
		let arr;

		if(!max) {
			return this;
			//return false;
		}else if(typeof name === 'string') {
			arr = name.split(/\s+/); // 띄어쓰기로 구분된 여러 클래스 분리
			for(i=0; i<max; i++) {
				for(key in arr) {
					// 초기화 시점분기 패턴을 사용하지 않고, if문으로 확인하는 이유는 $(selector) 리스트에 svg 등이 들어있을 가능성 때문이다.
					if('classList' in this.elements[i]) {
						this.elements[i].classList.remove(arr[key]); // remove(): 한번에 하나의 클래스만 삭제 가능하다. 즉, 띄어쓰기로 여러 클래스 삭제 불가능
					}else if('className' in this.elements[i]) {
						regexp = new RegExp('(\\s|^)' + arr[key] + '(\\s|$)'); 
						this.elements[i].className = this.elements[i].className.replace(regexp, ' ');
					}
				}
			}
		}

		return this;
	}

	// class="" 속성에서 특정 값 존재하면 제거, 없으면 추가 toggle
	toggleClass(name="") {
		// x.classList; // IE10이상 사용가능
		/*
		IE10+
		element.classList.toggle(className);
		*/
		let i, max = (this.elements && this.elements.length) || 0;
		let key;
		let arr;

		if(!max) {
			return this;
			//return false;
		}else if(typeof name === 'string') {
			arr = name.split(/\s+/); // 띄어쓰기로 구분된 여러 클래스 분리
			for(i=0; i<max; i++) {
				for(key in arr) {
					// 초기화 시점분기 패턴을 사용하지 않고, if문으로 확인하는 이유는 $(selector) 리스트에 svg 등이 들어있을 가능성 때문이다.
					if('classList' in this.elements[i]) {
						this.elements[i].classList.toggle(arr[key]);
					}else {
						this.hasClass.call(this, arr[key]) ? this.removeClass.call(this, arr[key]) : this.addClass.call(this, arr[key]);
					}
				}
			}
		}

		return this;
	}

	// html 반환 또는 주입
	html(value=undefined) {
		// x.outerHTML; // IE4 이상 사용가능, IE외 다른 브라우저 사용가능여부 체크필요
		// x.innerHTML; // 표준
		/*
		IE8+
		element.innerHTML
		*/
		/*
		// DomParser: HTML 또는 XML 소스 코드를 DOM 문서로 구문 분석하는 기능을 제공
		// parseFromString: 요소가 하나만있는 문서를 만들고 해당 요소 반환
		const createElement = domString => new DOMParser().parseFromString(domString, 'text/html').body.firstChild;
		const a = createElement('<a href="/home" class="active">Home</a>');
		*/

		let i, max = (this.elements && this.elements.length) || 0;
		let dummy;

		if(!max) {
			return this;
			//return false;
		}else if(typeof value === 'undefined') { // get - html 반환
			//return this[i].outerHTML;
			//return this[0].innerHTML;
			if('outerHTML' in this.elements[0]) {
				return this.elements[0].outerHTML;
			}else {
				// 더미(임시)로 div 만들고, 그안의 html 반환
				dummy = document.createElement("div");
				dummy.appendChild(this.elements[0].cloneNode(true));
				return dummy.innerHTML;
			}
		}else if(typeof value === 'string' || typeof value === 'number') { // set - html 주입
			for(i=0; i<max; i++) {
				this.elements[i].innerHTML = value;
			}
		}

		return this;
	}

	// text 반환 또는 주입
	text(value=undefined) {
		// x.textContent; // 표준
		// x.innerText; // IE
		/*
		IE9+
		element.textContent
		element.textContent = string;
		*/
		let i, max = (this.elements && this.elements.length) || 0;

		if(!max) {
			return this;
			//return false;
		}else if(typeof value === 'undefined') { // get
			return this.elements[0].textContent || this.elements[0].innerText;
		}else if(typeof value === 'string' || typeof value === 'number') { // set
			for(i=0; i<max; i++) {
				this.elements[i].textContent = this.elements[i].innerText = value;
			}
		}

		return this;
	}

	// value="" 값 반환 또는 주입
	val(value) {
		// x.value; // IE8이상 공식지원 (IE6, IE7 부분적 사용가능)
		let i, max = (this.elements && this.elements.length) || 0;

		if(!max) {
			return this;
			//return false;
		}else if(typeof value === 'undefined') { // get
			return this.elements[0].value;
		}else if(typeof value === 'string' || typeof value === 'number') { // set
			for(i=0; i<max; i++) {
				this.elements[i].value = value;
			}
		}

		return this;
	}

	// stylesheet
	css(parameter) {
		// x.style.cssText; // 표준
		// x.currentStyle[styleProp];
		// document.defaultView.getComputedStyle(x, null).getPropertyValue(styleProp);
		/*
		IE9+
		getComputedStyle(element)[ruleName]; // $(element).css(ruleName);
		*/
		let i, max = (this.elements && this.elements.length) || 0;
		let value;
		let property, current, unit;
		let tmp1, tmp2;
		const getStyleProperty = (style=""/*자바스크립트(js) 방식 또는 스타일(css) 방식 구분*/, property) => {
			let i, max;
			let converted = '';
			if(style === 'js') {
				// HTML DOM Style Object (CSS 속성방식이 아닌 Jvascript style property 방식)
				// (예: background-color -> backgroundColor)
				for(i=0, max=property.length; i<max; ++i) {
					if(property.charAt(i) === '-' && property.charAt(i+1)) {
						converted = converted + property.charAt(++i).toUpperCase();
					}else {
						converted = converted + property.charAt(i);
					}
				}
			}else if(style === 'css') {
				// CSS 속성명으로 값을 구한다.
				// CSS style property 의 경우 대문자를 소문자로 변환하고 그 앞에 '-'를 붙인다.
				// (예: backgroundColor -> background-color, zIndex -> z-index, fontSize -> font-size)
				for(i=0, max=property.length; i<max; ++i) {
					if(property.charAt(i) === property.charAt(i).toUpperCase()) {
						converted = converted + '-' + property.charAt(i).toLowerCase();
					}else {
						converted = converted + property.charAt(i);
					}
				}
			}else {
				converted = property;
			}
			return converted;
		};

		/*
		// transition, animation 처리 방법
		element.style.webkitTransitionDuration = element.style.MozTransitionDuration = element.style.msTransitionDuration = element.style.OTransitionDuration = element.style.transitionDuration = '1s';
		element.style.webkitAnimationDelay = element.style.MozAnimationDelay = element.style.msAnimationDelay = element.style.OAnimationDelay = element.style.animationDelay = '1s';
		*/
		if(!max) {
			return this;
			//return false;
		}else if(typeof parameter === 'string' && this.elements[0].nodeType && this.elements[0].nodeType !== 3 && this.elements[0].nodeType !== 8) { // get - 값 반환
			// return this[0].style[property]; // CSS 속성과 JS 에서의 CSS 속성형식이 다르므로 사용불가능
			// return this[0].style.getPropertyValue(property); // CSS 속성명을 사용하여 정상적 출력가능
			if(this.elements[0].style[getStyleProperty('js', parameter)]) { // style로 값을 구할 수 있는 경우
				value = this.elements[0].style[getStyleProperty('js', parameter)];
			}else if(this.elements[0].currentStyle && this.elements[0].currentStyle[getStyleProperty('js', parameter)]) { // IE의 경우
				value = this.elements[0].currentStyle[getStyleProperty('js', parameter)];
			}else if(document.defaultView && document.defaultView.getComputedStyle) {
				if(document.defaultView.getComputedStyle(this.elements[0], null).getPropertyValue(getStyleProperty('css', parameter))) {
					value = document.defaultView.getComputedStyle(this.elements[0], null).getPropertyValue(getStyleProperty('css', parameter));
				}
			}

			// css 는 단위까지 명확하게 알기위한 성격이 강하므로, 단위/숫자 분리는 하지않고 값 그대로 반환
			return value;
		}else if(typeof parameter === 'object') { // set - 값 주입
			for(i=0; i<max; i++) {
				for(property in parameter) {
					// 속성, 값 검사
					if(!parameter.hasOwnProperty(property) || !this.elements[i].nodeType || this.elements[i].nodeType === 3 || this.elements[i].nodeType === 8) {
						continue;
					}

					// +=, -= 연산자 분리
					if(tmp1 = new RegExp("^([+-])=(" + regexp.source_num + ")", "i").exec(parameter[property])) {
						// tmp1[1]: 연산자
						// tmp1[2]: 값
						current = new DOM(this.elements[i]).css(property);
						unit = '';
						// 단위값 존재 확인
						if(regexp.text.test(current)) { // 기존 설정값이 단어로 되어 있는 것 (예: auto, none 등)
							unit = 0;
						}else if(tmp2 = regexp.num_unit.exec(current)) { // 단위 분리
							// tmp2[1]: 값
							// tmp2[2]: 단위 (예: px, em, %, s)
							current = tmp2[1];
							unit = tmp2[2];
						}
						parameter[property] = ((tmp1[1] + 1) * tmp1[2] + parseFloat(current)) + unit; // ( '연산자' + 1 ) * 값 + 현재css속성값
					}

					// trim
					/*if(typeof parameter[property] === 'string') {
						parameter[property].replace(regexp.trim,  '');
					}*/

					// 단위값이 없을 경우 설정
					if(regexp.num.test(parameter[property]) && !regexp.num_unit.test(parameter[property])) {
						// property default value 단위가 px 에 해당하는 것
						if(regexp.pixel_unit_list.test(property)) {
							parameter[property] = parameter[property] + 'px';
						}else if(regexp.time_unit_list.test(property)) { // animation, transition
							parameter[property] = parameter[property] + 's';
						}
					}

					// window, document
					if(this.elements[i].nodeType === 9 || this.elements[i] === window) {
						this.elements[i] = window.document.documentElement; // html
						//this.elements[i] = window.document.body;
					}

					// css 값 설정
					if(parameter[property] === '' || parameter[property] === null) { // 해당 css 프로퍼티 초기화여부 확인
						// 초기화시 css default value 를 설정해 주는 것이 가장 정확함
						if(this.elements[i].style.removeProperty) {
							this.elements[i].style.removeProperty(getStyleProperty('css', property));
						}else if(this.elements[i].style.removeAttribute) { // IE9 이상
							this.elements[i].style.removeAttribute(getStyleProperty('js', property));
						}else if(getStyleProperty('js', property) in this.elements[i].style) {
							this.elements[i].style[getStyleProperty('js', property)] = null;
						}
					}else if(getStyleProperty('js', property) in this.elements[i].style) {
						// 방법1
						// 단위(예:px)까지 명확하게 입력해줘야 한다.
						this.elements[i].style[getStyleProperty('js', property)] = parameter[property];
					}else if(typeof this.elements[i].style.setProperty !== 'undefined') {
						// 방법2 (Internet Explorer version 9)
						this.elements[i].style.setProperty(getStyleProperty('css', property), parameter[property]);
					}
				}
			}
		}

		return this;
	}

	// element 보이기
	show() {
		// x.setAttribute(y, z); // IE8이상 사용가능
		let i, max = (this.elements && this.elements.length) || 0;
		let dummy;
		let display;
		let iframe, doc;

		if(!max) {
			return this;
			//return false;
		}else {
			for(i=0; i<max; i++) {
				if(!this.elements[i].tagName || !this.elements[i].nodeType || this.elements[i].nodeType === 3 || this.elements[i].nodeType === 8) {
					continue;
				}

				// default value
				// 해당 tag 의 기본 display 속성값 (block, inline, inline-block 등)을 알야야 한다.
				dummy = document.createElement(this.elements[i].tagName);
				document.body.appendChild(dummy);
				display = new DOM(dummy).css('display');
				dummy.parentNode.removeChild(dummy);
				if(!display || display === 'none') {
					iframe = document.createElement('iframe');
					iframe.setAttribute('frameborder', 0);
					iframe.setAttribute('width', 0);
					iframe.setAttribute('height', 0);
					iframe.style.cssText = 'display:block !important';
					document.body.appendChild(iframe);

					doc = (iframe.contentWindow || iframe.contentDocument).document;
					doc.write("<!doctype html><html><body>");
					doc.close();

					dummy = doc.createElement(this.elements[i].tagName);
					doc.body.appendChild(dummy);
					display = new DOM(dummy).css('display');

					iframe.parentNode.removeChild(iframe);
				}

				// css 값 설정
				this.elements[i].style.display = display;
			}
		}

		return this;
	}

	// element 숨기기
	hide() {
		let i, max = (this.elements && this.elements.length) || 0;
		const isNodeType = element => !element.nodeType || element.nodeType === 3 || element.nodeType === 8;

		if(!max || isNodeType(this.elements[0])) {
			return this;
			//return false;
		}else {
			for(i=0; i<max; i++) {
				if(!this.elements[i].tagName || isNodeType(this.elements[i])) {
					continue;
				}

				// css 값 설정
				this.elements[i].style.display = 'none';
			}
		}

		return this;
	}

	// element 노출 여부
	isVisible() {
		// Support: Opera <= 12.12
		// Opera reports offsetWidths and offsetHeights less than zero on some elements
		if(!this.elements || !this.elements.length) {
			return false;
		}else {
			return !(this.elements[0].offsetWidth <= 0 && this.elements[0].offsetHeight <= 0 || ((this.elements[0].style && this.elements[0].style.display) || this.css("display")) === "none");
		}
	}

	// 절대좌표 (jQuery 와 다르게 값 설정은 하지 않는다.)
	offset() {
		/*
		IE8+
		var rect = element.getBoundingClientRect();
		{
			top: rect.top + document.body.scrollTop,
			left: rect.left + document.body.scrollLeft
		}
		*/
		let max = (this.elements && this.elements.length) || 0;
		let win, doc;
		let offset = {}, box = {'top': 0, 'left': 0};

		if(!max) {
			return this;
		}else {
			win = DOM.getWindow(this.elements[0]);
			doc = DOM.getDocument(this.elements[0]);

			// getBoundingClientRect
			if(typeof this.elements[0].getBoundingClientRect === 'function') {
				box = this.elements[0].getBoundingClientRect();
			}

			// scroll 값 포함
			offset.top = box.top + (win.pageYOffset || doc.documentElement.scrollTop) - (doc.documentElement.clientTop || 0);
			offset.left = box.left + (win.pageXOffset || doc.documentElement.scrollLeft) - (doc.documentElement.clientLeft || 0);

			return offset;
		}
	}

	// 절대좌표 - parent element
	offsetParent() {
		// x.offsetParent; // IE8이상 사용가능
		if(DOM.isElementLength(this) && this.elements[0].nodeType) {
			// https://developer.mozilla.org/ko/docs/Web/API/HTMLElement/offsetParent
			// 엘리먼트의 style.display가 "none"으로 설정되면 null 을 반환
			// 엘리먼트의 위치가 정해지지 않으면, 가장 가까운 테이블 또는 테이블 셀, 루트 엘리먼트를 반환
			return this.elements[0].offsetParent;
		}
	}

	// 상대좌표 (부모 element 기준)
	position() {
		/*
		IE8+
		{
			left: element.offsetLeft, 
			top: element.offsetTop
		}
		*/
		let position, offset;
		let offsetParent, parentOffset = {'top': 0, 'left': 0};
		const getOffsetParent = element => {
			// document.documentElement; //<html> element //표준
			let offsetParent = element.offsetParent || document.documentElement;
			while(offsetParent && (!(offsetParent.nodeName && offsetParent.nodeName.toLowerCase() === 'html') && new DOM(offsetParent).css('position') === "static")) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent || document.documentElement;
		};

		if(!this.elements || !this.elements.length) {
			return this;
			//return false;
		}else { // get
			position = this.css.call(this, 'position');
			if(position === 'fixed') {
				offset = this.elements[0].getBoundingClientRect();
			}else {
				offsetParent = new DOM(getOffsetParent(this.elements[0]));
				offset = this.offset();
				if(!(offsetParent[0].nodeName && offsetParent[0].nodeName.toLowerCase() === 'html')) {
					parentOffset = offsetParent.offset();
				}
				parentOffset.top += getNumber(offsetParent.css('borderTopWidth'));
				parentOffset.left += getNumber(offsetParent.css('borderLeftWidth'));
			}

			return {
				'top': offset.top - parentOffset.top - getNumber(this.css('marginTop')),
				'left': offset.left - parentOffset.left - getNumber(this.css('marginLeft'))
			};
		}
	}

	// 너비
	width(value) {
		/*
		IE9+
		parseFloat(getComputedStyle(element, null).width.replace("px", ""))
		*/
		let i, max = (this.elements && this.elements.length) || 0;

		// 숫자만 있을 경우, 기본 단위 조립 
		if(typeof value === 'number') {
			value = `${value}px`;
		}

		if(!max) {
			return this;
			//return false;
		}else if(typeof value === 'undefined') { // get
			if(this.elements[0] === window) { 
				// window (브라우저)
				return window.innerWidth || document.documentElement.clientWidth;
			}else if(this.elements[0].nodeType === 9) { 
				// document
				return Math.max(
					document.body.scrollWidth, document.documentElement.scrollWidth,
					document.body.offsetWidth, document.documentElement.offsetWidth,
					document.documentElement.clientWidth
				);
			}else {
				return getElementWidthHeight(this, 'width');
			}
		}else if(typeof value === 'string') { // set
			for(i=0; i<max; i++) {
				if(!this.elements[i].nodeType || !this.elements[i].style) {
					continue;
				}

				// 단위(예:px)까지 명확하게 입력해줘야 한다.
				this.elements[i].style.width = value;
			}
		}

		return this;
	}

	// border 안쪽 크기 (padding 포함)
	innerWidth() { 
		if(!this.elements || !this.elements.length) {
			return this;
			//return false;
		}else if(this.elements[0] === window || this.elements[0].nodeType === 9) { 
			// window, document
			return this.width();
		}else {
			return getElementWidthHeight(this, 'width', 'inner');
		}
	}

	// border 포함 크기 (padding + border 포함, 파라미터가 true 경우 margin 값까지 포함)
	outerWidth(is) { 
		/*
		IE8+
		element.offsetWidth // $(element).outerWidth();

		IE9+
		function outerWidth(element) { // $(element).outerWidth(true);
			var width = element.offsetWidth;
			var style = getComputedStyle(element);
			width += parseInt(style.marginLeft) + parseInt(style.marginRight);
			return width;
		}
		*/
		if(!this.elements || !this.elements.length) {
			return this;
			//return false;
		}else if(this.elements[0] === window || this.elements[0].nodeType === 9) { 
			// window, document
			return this.width();
		}else {
			return getElementWidthHeight(this, 'width', 'outer', is);
		}
	}

	// scroll width
	scrollWidth() {
		// element overflow auto/scroll 값에서 보이지 않는 부분까지 포함한 값 
		// https://developer.mozilla.org/ko/docs/Web/API/Element/scrollWidth
		if(DOM.isElementLength(this) && this.elements[0].nodeType) {
			return this.elements[0].scrollWidth;
		}
	}

	// 높이
	height(value) {
		/*
		IE9+
		parseFloat(getComputedStyle(element, null).height.replace("px", ""))
		*/
		let i, max = (this.elements && this.elements.length) || 0;

		// 숫자만 있을 경우, 기본 단위 조립 
		if(typeof value === 'number') {
			value = `${value}px`;
		}

		if(!max) {
			return this;
			//return false;
		}else if(typeof value === 'undefined') { // get
			if(this.elements[0] === window) { 
				// window (브라우저)
				return window.innerHeight || document.documentElement.clientHeight;
			}else if(this.elements[0].nodeType === 9) { 
				// document
				return Math.max(
					document.body.scrollHeight, document.documentElement.scrollHeight,
					document.body.offsetHeight, document.documentElement.offsetHeight,
					document.documentElement.clientHeight
				);
			}else {
				return getElementWidthHeight(this, 'height');
			}
		}else if(typeof value === 'string') { // set
			for(i=0; i<max; i++) {
				if(!this.elements[i].nodeType || !this.elements[i].style) {
					continue;
				}

				// 단위(예:px)까지 명확하게 입력해줘야 한다.
				this.elements[i].style.height = value;
			}
		}

		return this;
	}

	// border 안쪽 크기 (padding 포함)
	innerHeight() { 
		if(!this.elements || !this.elements.length) {
			return this;
			//return false;
		}else if(this.elements[0] === window || this.elements[0].nodeType === 9) { 
			// window, document
			return this.height();
		}else {
			return getElementWidthHeight(this, 'height', 'inner');
		}
	}

	// border 포함 크기 (padding + border 포함, 파라미터가 true 경우 margin 값까지 포함)
	outerHeight(is) { 
		/*
		IE8+
		element.offsetHeight // $(element).outerHeight();

		IE9+
		function outerHeight(element) { // $(element).outerHeight(true);
			var height = element.offsetHeight;
			var style = getComputedStyle(element);
			height += parseInt(style.marginTop) + parseInt(style.marginBottom);
			return height;
		}
		*/
		if(!this.elements || !this.elements.length) {
			return this;
			//return false;
		}else if(this.elements[0] === window || this.elements[0].nodeType === 9) { 
			// window, document
			return this.height();
		}else {
			return getElementWidthHeight(this, 'height', 'outer', is);
		}
	}

	// scroll height
	scrollHeight() {
		// element overflow auto/scroll 값에서 보이지 않는 부분까지 포함한 값 
		// https://developer.mozilla.org/ko/docs/Web/API/Element/scrollHeight
		if(DOM.isElementLength(this) && this.elements[0].nodeType) {
			return this.elements[0].scrollHeight;
		}
	}

	// 속성 반환 또는 주입
	attr(parameter) {
		// x.attributes[y]; //
		// x.getAttribute(y); // IE8이상 사용가능
		// x.setAttribute(y, z); // IE8이상 사용가능
		/*
		IE8+
		element.getAttribute('tabindex');
		*/
		let i, max = (this.elements && this.elements.length) || 0;
		let key;

		if(!max) {
			return this;
			//return false;
		}else if(typeof parameter === 'string') { // get
			return this.elements[0].getAttribute(parameter);
		}else if(typeof parameter === 'object') { // set
			for(i=0; i<max; i++) {
				for(key in parameter) {
					this.elements[i].setAttribute(key, parameter[key]);
				}
			}
		}

		return this;
	}

	// 속성 제거 
	removeAttr(name) {
		// x.removeAttribute(y); // 표준
		let i, max = (this.elements && this.elements.length) || 0;

		if(!max) {
			return this;
			//return false;
		}else if(typeof name === 'string') {
			for(i=0; i<max; i++) {
				this.elements[i].removeAttribute(name);
			}
		}

		return this;
	}

	// 특정 속성값 반환
	hasAttr(name) {
		// x.hasAttribute(y); // IE8이상 사용가능
		if(DOM.isElementLength(this) && typeof name === 'string') {
			return this.elements[0].hasAttribute(name);
		}
	}

	// property
	prop(parameter) {
		let i, max = (this.elements && this.elements.length) || 0;
		let key;

		if(!max) {
			return this;
			//return false;
		}else if(typeof parameter === 'string') { // get
			return this.elements[0][parameter];
		}else if(typeof parameter === 'object') { // set
			for(i=0; i<max; i++) {
				for(key in parameter) {
					this.elements[i][key] = parameter[key];
				}
			}
		}

		return this;
	}

	removeProp(name) {
		let i, max = (this.elements && this.elements.length) || 0;

		if(!max) {
			return this;
			//return false;
		}else if(typeof name === 'string') {
			for(i=0; i<max; i++) {
				this.elements[i][name] = undefined;
				delete this.elements[i][name];
			}
		}

		return this;
	}

	// 내부 제거
	empty() {
		// x.hasChildNodes(); // 표준
		// x.removeChild(y); // 표준
		// x.parentNode; //표준
		// x.childNodes[1]; // IE9이상 사용가능 (IE8이하 부분지원), TextNode 까지 검색
		// x.children[1]; // IE9이상 사용가능 (IE8이하 부분지원)
		// x.lastChild; // IE9이상 사용가능
		/*
		IE8+
		while(element.firstChild) element.removeChild(element.firstChild);
		*/
		let i, max = (this.elements && this.elements.length) || 0;

		if(!max) {
			return this;
			//return false;
		}else {
			for(i=0; i<max; i++) {
				// element
				while(this.elements[i].hasChildNodes()) { // TextNode 포함 내부 element 전체 제거
					this.elements[i].removeChild(this.elements[i].lastChild);
				}

				// select box
				if(this.elements[i].options && this.elements[i].nodeName.toLowerCase() === 'select') {
					this.elements[i].options.length = 0;
				}
			}
		}

		return this;
	}

	// 대상 제거
	remove() {
		// x.removeChild(y); // 표준
		// x.parentNode; // 표준
		// x.remove(); // IE 미지원 
		/*
		IE8+
		element.parentNode.removeChild(element);
		*/
		let i, max = (this.elements && this.elements.length) || 0;

		if(!max) {
			return this;
			//return false;
		}else {
			// 이벤트 제거
			// (element에 이벤트가 설정되었을 경우 이벤트 리스너도 같이 삭제해야 이벤트 메모리 누적 방지)
			//this.off();

			// element remove
			for(i=0; i<max; i++) {
				if(this.elements[i].parentNode) {
					this.elements[i].parentNode.removeChild(this.elements[i]);
				}
			}
		}
	}

	// 대상 제거 - 제거 element 반환 (재사용 가능하도록 한다.)
	detach() {
		// remove() 와 다른점은 제거한 element를 반환하므로, 재사용이 가능하도록 만든다.

	}

	// 복제 
	// jQuery 처럼 이벤트 복사는 new DOM 을 통해 설정된 이벤트 리스트(storage)에 한해 설계가능하다.
	clone(is) { 
		// x = y.cloneNode(true | false); // 표준
		// is : 자식 노드들도 모두 복제할지 여부(true:복사, false:해당없음)
		/*
		IE8+
		element.cloneNode(true);
		*/
		if(DOM.isElementLength(this) && this.elements[0].nodeType) {
			// id를 가진 node를 복사할 때 주의하자(페이지내 중복 id를 가진 노드가 만들어 지는 가능성이 있다)
			return new DOM(this.elements[0].cloneNode(is || true));
		}

		return this;
	}

	// 삽입 - 대상 앞
	prepend(parameter) {
		// x.insertBefore(y,z); // 표준
		// x.firstChild; // IE9이상 사용가능 (TextNode 포함)
		// x.lastChild;
		// x.firstElementChild // TextNode 제외
		/*
		IE8+
		parent.insertBefore(element, parent.firstChild);
		*/
		/*
		// x.insertAdjacentHTML('위치', '값'); 
		// 위치: 'beforebegin' (요소 앞에), 'afterbegin' (요소 내부 첫 번째 자식 앞에), 'beforeend' (요소 내부 마지막 자식 이후), 'afterend' (요소 뒤)
		<!-- beforebegin -->
		<p>
			<!-- afterbegin -->
			foo
			<!-- beforeend -->
		</p>
		<!-- afterend -->
		*/
		let i, max = (this.elements && this.elements.length) || 0;
		let element;

		// parameter 검사
		if(!max || !parameter) {
			return this;
			//return false;
		}else if(typeof parameter === 'object') {
			if(parameter.elements) {
				element = parameter.elements[0];
			}else if(parameter.nodeType) {
				element = parameter;
			}
		}

		if(element) {
			for(i=0; i<max; i++) {
				if(this.elements[i].nodeType === 1 || this.elements[i].nodeType === 9 || this.elements[i].nodeType === 11) {
					if(element.nodeType === 11) { 
						// FRAGMENT NODE
						this.elements[i].insertBefore(element.cloneNode(true), this.elements[i].firstChild);
					}else {
						this.elements[i].insertBefore(element, this.elements[i].firstChild);
					}
				}
			}
		}

		return this;
	}

	// 삽입 - 대상 뒤
	append(parameter) {
		// x.appendChild(y); // 표준
		/*
		IE8+
		parent.appendChild(element);
		*/
		/*
		// x.insertAdjacentHTML('위치', '값'); 
		// 위치: 'beforebegin' (요소 앞에), 'afterbegin' (요소 내부 첫 번째 자식 앞에), 'beforeend' (요소 내부 마지막 자식 이후), 'afterend' (요소 뒤)
		<!-- beforebegin -->
		<p>
			<!-- afterbegin -->
			foo
			<!-- beforeend -->
		</p>
		<!-- afterend -->
		*/
		let i, max = (this.elements && this.elements.length) || 0;
		let element;

		// parameter 검사
		if(!max || !parameter) {
			return this;
			//return false;
		}else if(typeof parameter === 'object') {
			if(parameter.elements) {
				element = parameter.elements[0];
			}else if(parameter.nodeType) {
				element = parameter;
			}
		}

		if(element) {
			for(i=0; i<max; i++) {
				if(this.elements[i].nodeType === 1 || this.elements[i].nodeType === 9 || this.elements[i].nodeType === 11) {
					if(element.nodeType === 11) { 
						// FRAGMENT NODE
						this.elements[i].appendChild(element.cloneNode(true));
					}else {
						this.elements[i].appendChild(element);
					}
				}
			}
		}

		return this;
	}

	// 특정 요소의 위치에 노드를 삽입
	after(parameter) {
		// x.insertBefore(y,z); // 표준
		// x.parentNode; // 표준
		// x.nextSibling; // IE9이상 사용가능
		/*
		IE8+
		target.insertAdjacentElement('afterend', element);
		*/
		/*
		// x.insertAdjacentHTML('위치', '값'); 
		// 위치: 'beforebegin' (요소 앞에), 'afterbegin' (요소 내부 첫 번째 자식 앞에), 'beforeend' (요소 내부 마지막 자식 이후), 'afterend' (요소 뒤)
		<!-- beforebegin -->
		<p>
			<!-- afterbegin -->
			foo
			<!-- beforeend -->
		</p>
		<!-- afterend -->
		*/

		// new DOM(기준 요소).before(이동할 요소);
		// 이동(또는 삽입)시킬 element 가 기준 element 바로 뒤로 이동(또는 삽입)한다.
		let i, max = (this.elements && this.elements.length) || 0;
		let element;

		// parameter 검사
		if(!max || !parameter) {
			return this;
			//return false;
		}else if(typeof parameter === 'object') {
			if(parameter.elements) {
				element = parameter.elements[0];
			}else if(parameter.nodeType) {
				element = parameter;
			}
		}

		if(element) {
			for(i=0; i<max; i++) {
				if(this.elements[i].parentNode) {
					this.elements[i].parentNode.insertBefore(element, this.elements[i].nextSibling);
				}
			}
		}

		return this;
	}

	// 특정 요소의 위치에 노드를 삽입
	before(parameter) {
		// x.insertBefore(y,z); // 표준
		// x.parentNode; // 표준
		/*
		IE8+
		target.insertAdjacentElement('beforebegin', element);
		*/
		/*
		// x.insertAdjacentHTML('위치', '값'); 
		// 위치: 'beforebegin' (요소 앞에), 'afterbegin' (요소 내부 첫 번째 자식 앞에), 'beforeend' (요소 내부 마지막 자식 이후), 'afterend' (요소 뒤)
		<!-- beforebegin -->
		<p>
			<!-- afterbegin -->
			foo
			<!-- beforeend -->
		</p>
		<!-- afterend -->
		*/

		// new DOM(기준 요소).before(이동할 요소);
		// 이동(또는 삽입)시킬 element 가 기준 element 바로 전으로 이동(또는 삽입)한다.
		// querySelectorAll 또는 new DOM() length 가 있으나, querySelector 는 length 가 없다.
		let i, max = (this.elements && this.elements.length) || 0;
		let element;

		// parameter 검사
		if(!max || !parameter) {
			return this;
			//return false;
		}else if(typeof parameter === 'object') {
			if(parameter.elements) {
				element = parameter.elements[0];
			}else if(parameter.nodeType) {
				element = parameter;
			}
		}

		if(element) {
			for(i=0; i<max; i++) {
				if(this.elements[i].parentNode) {
					this.elements[i].parentNode.insertBefore(element, this.elements[i]);
				}
			}
		}

		return this;
	}

	// 특정 요소의 위치에 노드를 삽입
	insertBefore(parameter) {
		// x.insertBefore(y,z); // 표준
		// x.parentNode; // 표준

		/*
		// x.insertAdjacentHTML('위치', '값'); 
		// 위치: 'beforebegin' (요소 앞에), 'afterbegin' (요소 내부 첫 번째 자식 앞에), 'beforeend' (요소 내부 마지막 자식 이후), 'afterend' (요소 뒤)
		<!-- beforebegin -->
		<p>
			<!-- afterbegin -->
			foo
			<!-- beforeend -->
		</p>
		<!-- afterend -->
		*/

		// new DOM(이동할 요소).insertBefore(기준 요소);
		// 이동(또는 삽입)시킬 element 가 기준 element 바로 전으로 이동(또는 삽입)한다.
		// querySelectorAll 또는 new DOM() length 가 있으나, querySelector 는 length 가 없다.
		let i, max = (this.elements && this.elements.length) || 0;
		let element;

		// parameter 검사
		if(!max || !parameter) {
			return this;
			//return false;
		}else if(typeof parameter === 'object') {
			if(parameter.elements) {
				element = parameter.elements[0];
			}else if(parameter.nodeType) {
				element = parameter;
			}
		}

		if(element) {
			for(i=0; i<max; i++) {
				if(element.parentNode) {
					element.parentNode.insertBefore(this.elements[i], element);
				}
			}
		}

		return this;
	}

	// 지정한 콘텐츠로 대체
	replaceWith(parameter) {
		// x.replaceChild(y,z); // 표준
		// x.parentNode; // 표준
		// x.replaceWith(y); // IE 미지원 
		/*
		IE8+
		element.outerHTML = string;
		*/
		let i, max = (this.elements && this.elements.length) || 0;
		let element;

		// parameter 검사
		if(!max || !parameter) {
			return this;
			//return false;
		}else if(typeof parameter === 'object') {
			if(parameter.elements) {
				element = parameter.elements[0];
			}else if(parameter.nodeType) {
				element = parameter;
			}
		}

		if(element) {
			for(i=0; i<max; i++) {
				if(this.elements[i].parentNode) {
					this.elements[i].parentNode.replaceChild(element, this.elements[i]);
				}
			}
		}

		return this;
	}

	// next element
	next() {
		// x.nextElementSibling; // IE9이상 사용가능

		if(DOM.isElementLength(this) && this.elements[0].nodeType) {
			return this.elements[0].nextElementSibling;
		}
	}

	// prev element
	prev() {
		// x.previousElementSibling; // IE9이상 사용가능
		
		if(DOM.isElementLength(this) && this.elements[0].nodeType) {
			return this.elements[0].previousElementSibling;
		}
	}

	// event on
	// .on('click.EVENT_CLICK_TEST mousedown.EVENT_MOUSEDOWN_TEST');
	// .on('click.EVENT_CLICK_TEST');
	// .on('click');
	/*
	element.onclick 형태와 같은 이벤트는 IE9이상 사용가능
	https://developer.mozilla.org/ko/docs/Web/API/GlobalEventHandlers
	*/
	on(events=''/*띄어쓰기 기준 여러개의 이벤트를 설정할 수 있다.*/ , handler=function() {}, capture) {
		/*
		IE8+
		document.addEventListener(eventName, function(e) { // $(document).on(eventName, elementSelector, handler);
			// loop parent nodes from the target to the delegation node
			for (var target = e.target; target && target != this; target = target.parentNode) {
				if (target.matches(elementSelector)) {
					handler.call(target, e);
					break;
				}
			}
		}, false);
		*/
		let list = events.split(/\s+/);

		/*
		-
		capture (또는 options)
		IE의 경우 캡쳐 미지원 (기본값: false 버블링으로 함)
		Chrome 에서는 기본이벤트 방지를 위해 {passive: false} 값 등이 올 수 있다.
		target.addEventListener(type, listener, { capture: true, once: true, passive: true });
		*/
		capture = typeof capture !== 'boolean' && typeof capture !== 'object' ? false : capture;

		this.each(function(index, element) {
			let arr = [];
			let type, key;
			let i, max;
			let callback;
			let result = {};

			// element object 에 사용자 프로퍼티(storage)를 만들고, 거기에 이벤트 정보를 저장한다.
			if(typeof element.storage !== 'object') {
				element.storage = {};
			}
			if(typeof element.storage.events !== 'object') {
				element.storage.events = {};
			}

			for(i=0, max=list.length; i<max; i++) {
				// 이벤트 type.key 분리
				arr = list[i].split('.');
				type = arr.shift();
				if(0 < arr.length) {
					// key 존재함
					key = arr.join('');
				}

				if(type) {
					// 이벤트 바인딩
					if(typeof element.addEventListener === 'function') {
						callback = handler.bind(element);
						// IE9이상 사용가능
						element.addEventListener(type, callback, capture); 
					}else if(element.attachEvent) { 
						// IE (typeof 검사시 IE8에서는 function 이 아닌 object 반환)
						callback = function(e) { 
							//handler(e, element);
							handler.call(element, e);
						};
						/*
						// 참고: 아래 같이 선언했을 경우 IE에서 스택풀 발생
						handler = function(e) { // IE this 바인딩 문제
							handler(e, element);
						};
						*/
						element.attachEvent('on' + type, callback);
					}

					// 이벤트 정보 저장
					result = {
						"key": key, // 사용자가 지정한 이벤트키
						"event": type,
						"handler": callback,
						"capture": capture
					};

					// event array (이벤트 종류별로 저장)
					if(typeof element.storage.events[type] !== 'object') {
						element.storage.events[type] = [];
					}
					element.storage.events[type].push(result);
					
					// event key (이벤트 key/type 별로 저장)
					if(key) {
						if(typeof element.storage[key] !== 'object') {
							element.storage[key] = {};
						}
						element.storage[key][type] = result;
					}
				}
			}
		});

		return this;
	}

	// event off
	// .off('click.EVENT_CLICK_TEST mousedown.EVENT_MOUSEDOWN_TEST');
	// .off('click.EVENT_CLICK_TEST');
	// .off('click');
	// .off('.EVENT_CLICK_TEST');
	// .off();
	off(events=''/*띄어쓰기 기준 여러개의 이벤트를 해제할 수 있다.*/) {
		/*
		IE9+
		element.removeEventListener(eventName, eventHandler); // $(element).off(eventName, eventHandler);
		*/
		let that = this;
		let list = events.split(/\s+/);
		let i, max;
		const setListener = function(element, event="", handler, capture) { // 이벤트 해제
			if(typeof element.removeEventListener === 'function') {
				element.removeEventListener(event, handler, capture);
			}else if(element.detachEvent) { // IE
				element.detachEvent('on' + event, handler);
			}
		};

		for(i=0, max=list.length; i<max; i++) {
			(function(factor) {
				let arr = [];
				let type, key;
				let setRemove = function() {};

				// 이벤트 type.key 분리
				arr = factor.split('.');
				if(1 < arr.length) {
					// key 존재함
					type = arr.shift();
					key = arr.join('');
				}else {
					type = arr.shift();
				}

				if(key) {
					// key 기반 이벤트 해제
					if(type) {
						// type.key 해제
						setRemove = function(element) {
							let result = {};

							if(element.storage[key]) {
								result = element.storage[key][type];
								if(result) {
									setListener(element, result.event, result.handler, result.capture);
								}
								delete element.storage[key][type];
							}
						};
					}else {
						// .key 해당 전체 해제
						setRemove = function(element) {
							let event;
							let result = {};

							if(element.storage[key]) {
								for(event in element.storage[key]) {
									if(element.storage[key].hasOwnProperty(event)) {
										result = element.storage[key][event];
										if(result) {
											setListener(element, result.event, result.handler, result.capture);
										}
										delete element.storage[key][event];
									}
								}
								delete element.storage[key];
							}
						};
					}
				}else if(type) {
					// type 해당 전체 해제
					setRemove = function(element) {
						let result = {};

						if(element.storage.events[type]) {
							while(element.storage.events[type].length) {
								result = element.storage.events[type].shift();
								if(result) {
									setListener(element, result.event, result.handler, result.capture);
									if(result.key && element.storage.events[result.key]) {
										delete element.storage.events[result.key][type];
									}
								}
							}
							delete element.storage.events[type];
						}
					};
				}else {
					// 전체 해제
					setRemove = function(element) {
						let event;
						let result = {};

						for(event in element.storage.events) {
							while(element.storage.events[event].length) {
								result = element.storage.events[event].shift();
								if(result) {
									setListener(element, result.event, result.handler, result.capture);
									if(result.key && element.storage.events[result.key]) {
										delete element.storage.events[result.key][event];
									}
								}
							}
							delete element.storage.events[event];
						}
					};
				}

				that.each(function(i, element) {
					if(typeof element.storage === 'object') {
						setRemove(element);
					}
				});
			})(list[i]);
		}

		return this;
	}

	// event one
	// addEventListener 함수의 세번째 파라미터에 'one' 설정으로 사용가능하다.
	/*one(events, handler, capture) {
		let that = this;
		let key = getKey();
		let callback = function() {
			// off
			that.off('.' + key);
			// handler
			handler.apply(this, Array.prototype.slice.call(arguments));
		};
		// on
		that.on(events + '.' + key, callback, capture);

		return this;
	}*/

	// event trigger
	trigger = (function() {
		/*
		Trigger Custom
		IE9+
		var event;
		if(window.CustomEvent && typeof window.CustomEvent === 'function') {
			event = new CustomEvent('my-event', {detail: {some: 'data'}});
		}else {
			event = document.createEvent('CustomEvent');
			event.initCustomEvent('my-event', true, true, {some: 'data'});
		}
		element.dispatchEvent(event); // $(element).trigger('my-event', {some: 'data'});

		Trigger Native
		IE9+
		// For a full list of event types: https://developer.mozilla.org/en-US/docs/Web/API/document.createEvent
		var event = document.createEvent('HTMLEvents');
		event.initEvent('change', true, false);
		element.dispatchEvent(event); // $(element).trigger('change');
		*/
		if(document.createEvent) {
			return function(events) {
				let obj = document.createEvent('MouseEvents');
				obj.initEvent(events, true, false);
				this.each(function() {
					this.dispatchEvent(obj);
				});
			};
		}else if(document.createEventObject) { 
			// IE
			return function(events) {
				let obj = document.createEventObject();
				this.each(function() {
					this.fireEvent('on' + events, obj);
				});
			};
		}
	})()

	// data 
	data = (function() {
		// x.dataset; // IE11이상 사용가능
		// IE 10 이하를 지원하기 위해서는 getAttribute()를 통해 데이터 속성을 접근 (JS 데이터 저장소에 저장하는 것과 비교해서 데이터 속성 읽기의 성능은 저조, https://jsperf.com/data-dataset)

		/*
		! 주의
		data-* 속성값에서 두번째 -(hyphen) 다음의 첫글자는 무조건 대문자로 들어가야 한다.
		https://developer.mozilla.org/ko/docs/Learn/HTML/Howto/%EB%8D%B0%EC%9D%B4%ED%84%B0_%EC%86%8D%EC%84%B1_%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0
		
		[data-index-number="12314"] 속성을 JavaScript 에서 접근할 경우 element.dataset.indexNumber; // "12314"
		[data-columns="3"] -> element.dataset.columns // "3"
		[data-parent="cars"] -> element.dataset.parent // "cars"
		*/
		const setTheFirstLetter = function(value) {
			if(typeof value === 'string') {
				return value.replace(/-([a-z])/g, function(value) {
					return value[1].toUpperCase();
				});
			}
		};
		
		// svg 대응
		return function(parameter) {
			// x.setAttribute(y, z); // IE8이상 사용가능
			let key;
			let i, max = (this.elements && this.elements.length) || 0;

			if(!max) {
				return this;
				//return false;
			}else if(typeof parameter === 'string') { // get
				if('dataset' in this.elements[0]) {
					return this.elements[0].dataset[setTheFirstLetter(parameter)];
				}else {
					return this.attr('data-' + parameter);
				}
			}else if(typeof parameter === 'object') { // set
				for(i=0; i<max; i++) {
					for(key in parameter) {
						// 초기화 시점분기 패턴을 사용하지 않고, if문으로 확인하는 이유는 $(selector) 리스트에 svg 등이 들어있을 가능성 때문이다.
						if('dataset' in this.elements[i]) {
							this.elements[i].dataset[setTheFirstLetter(key)] = parameter[key];
						}else if('setAttribute' in this.elements[i]) {
							this.elements[i].setAttribute('data-' + key, parameter[key]);
						}
					}
				}
			}

			return this;
		};
	})()

	// scroll 정보 / 설정
	scroll(parameter={}) {
		let i, max = (this.elements && this.elements.length) || 0;
		let key, property;
		let scroll;
		const getBrowserScroll = function() {
			if('scrollX' in window && 'scrollY' in window) { 
				return {'left': window.scrollX, 'top': window.scrollY};
			}else if('pageXOffset' in window && 'pageYOffset' in window) { 
				return {'left': window.pageXOffset, 'top': window.pageYOffset};
			}else if(document.body && ('scrollLeft' in document.body && 'scrollTop' in document.body)) {
				return {'left': document.body.scrollLeft, 'top': document.body.scrollTop};
			}else if(document.documentElement && ('scrollLeft' in document.documentElement && 'scrollTop' in document.documentElement)) {
				return {'left': document.documentElement.scrollLeft, 'top': document.documentElement.scrollTop};
			}else {
				return {'left': 0, 'top': 0};
			}
		};

		if(max) {
			if(this.elements[0] === window || this.elements[0].nodeType === 9) {
				// window, document
				scroll = getBrowserScroll();
				if('left' in parameter || 'top' in parameter) {
					window.scrollTo((typeof parameter.left !== 'undefined' ? parameter.left : (scroll.left || 0)), (typeof parameter.top !== 'undefined' ? parameter.top : (scroll.top || 0)));
				}else {
					return {'left': scroll.left, 'top': scroll.top};
				}
			}else {
				// element
				if('left' in parameter || 'top' in parameter) {
					for(i=0; i<max; i++) {
						for(key in parameter) {
							property = 'scroll' + key.substring(0, 1).toUpperCase() + key.substring(1, key.length).toLowerCase(); // 첫글자 대문자
							if(property in this.elements[i]) {
								this.elements[i][property] = parameter[key];
							}
						}
					}
				}else {
					return {'left': this.elements[0].scrollLeft, 'top': this.elements[0].scrollTop};
				}
			}
		}
	}

	// 엘리먼트가 화면 상에 보일 수 있도록 화면을 스크롤
	scrollIntoView(is) {
		// x.scrollIntoView(alignWithTop); // alignWithTop: true 일 경우 엘리먼트가 스크롤 영역의 상단에 위치하도록 스크롤 됩니다. 만약  false 인 경우 스크롤 영역의 하단에 위치
		
		if(typeof is !== 'boolean') {
			is = true;
		}
		if(DOM.isElementLength(this) && this.elements[0].nodeType) {
			this.elements[0].scrollIntoView(is);
		}
	}

	// 엘리먼트가 소속된 스크롤되는 부모 엘리먼트
	scrollParent(includeHidden) {
		/* 
		// 스크롤 막대가 존재하는지 여부로 찾기
		function getScrollParent(node) {
			if(node == null) {
				return null;
			}
			if(node.scrollHeight > node.clientHeight) {
				return node;
			}else {
				return getScrollParent(node.parentNode);
			}
		}
		*/
		let style = getComputedStyle(this.elements[0]); // https://developer.mozilla.org/ko/docs/Web/API/Window/getComputedStyle
		let excludeStaticParent = style.position === "absolute";
		let overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/;

		if(style.position === "fixed") return document.body;
		for(let parent = this.elements[0]; (parent = parent.parentElement); ) {
			style = getComputedStyle(parent);
			if(excludeStaticParent && style.position === "static") {
				continue;
			}
			if(overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) return parent;
		}

		return document.body;
	}

	// 특정 노드가 다른 노드 내에 포함되었는지 여부
	// 사용예: new DOM('#test').contains(event.target)
	contains(parameter) {
		// x.contains(y); // 표준
		// x.compareDocumentPosition(y); // IE9이상 사용가능
		/*
		IE8+
		element !== child && element.contains(child);
		*/
		let i, max = (this.elements && this.elements.length) || 0;
		let element;

		// parameter 검사
		if(!max || !parameter) {
			return is;
		}else if(typeof parameter === 'object') {
			if(parameter.elements) {
				element = parameter.elements[0];
			}else if(parameter.nodeType) {
				element = parameter;
			}
		}

		if(element) {
			for(i=0; i<max; i++) {
				// this.elements[i] 내부에 element 가 포함되어 있는지 확인
				if(this.elements[i] && this.elements[i].contains(element)) {
					return true;
				}
			}
		}

		return false;
	}

	// 조건 반환
	// new DOM(element).is('.my-class');
	is(selector) {
		// x.matches() // IE9이상 사용가능
		/*
		var matches = function(element, selector) {
			return (element.matches || element.matchesSelector || element.msMatchesSelector || element.mozMatchesSelector || element.webkitMatchesSelector || element.oMatchesSelector).call(element, selector);
		};
		*/
		/*
		// https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
		<p class="foo">Hello world</p>
		const p = document.querySelector('p');
		p.matches('p');     // true
		p.matches('.foo');  // true
		p.matches('.bar');  // false, does not have class "bar"
		*/
		let matches;

		if(DOM.isElementLength(this) && this.elements[0].nodeType) {
			matches = this.elements[0].matches || this.elements[0].matchesSelector || this.elements[0].msMatchesSelector || this.elements[0].mozMatchesSelector || this.elements[0].webkitMatchesSelector || this.elements[0].oMatchesSelector;
		}
		if(matches) {
			return matches.call(this.elements[0], selector);
		}

		return this;
	}

	// 동일한 element 여부 
	isEqualNode(target) {
		// target: selector 값 또는 element 값 
		if(DOM.isElementLength(this) && this.elements[0].nodeType && target) {
			if(typeof target === 'string' || (typeof target === 'object' && target.nodeType)) {
				target = new DOM(target);
			}
			if(target.length) {
				return this.elements[0].isEqualNode(target[0]);
			}
		}
	}
}

const $ = (selector, context) => new DOM(selector, context);
//module.exports = $;
export default $;