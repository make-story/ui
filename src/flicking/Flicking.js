/**
 * Flicking
 */
/*
-
block node
https://github.com/nhn/tui.editor/blob/master/apps/editor/src/js/utils/dom.js
/^(ADDRESS|ARTICLE|ASIDE|BLOCKQUOTE|DETAILS|DIALOG|DD|DIV|DL|DT|FIELDSET|FIGCAPTION|FIGURE|FOOTER|FORM|H[\d]|HEADER|HGROUP|HR|LI|MAIN|NAV|OL|P|PRE|SECTION|UL)$/gi.test('');
*/
import browser from '../browser';
import $ from '../dom';
import { extend, numberUnit, isNumeric, numberReturn, } from '../util';
import { requestAnimationFrame, cancelAnimationFrame, } from '../animate';

const EVENT_TRANSITION_FLICKING = 'EVENT_TRANSITION_FLICKING';
const EVENT_RESIZE_FLICKING = 'EVENT_RESIZE_FLICKING';
const EVENT_MOUSEDOWN_FLICKING = 'EVENT_MOUSEDOWN_FLICKING';
const EVENT_MOUSEMOVE_FLICKING = 'EVENT_MOUSEMOVE_FLICKING';
const EVENT_MOUSEUP_FLICKING = 'EVENT_MOUSEUP_FLICKING';
const EVENT_MOUSEWHEEL_FLICKING = 'EVENT_MOUSEWHEEL_FLICKING';

// node.children
// Overwrites native 'children' prototype.
// Adds Document & DocumentFragment support for IE9 & Safari.
// Returns array instead of HTMLCollection.
;(function(constructor) {
	if (constructor &&
		constructor.prototype &&
		constructor.prototype.children == null) {
		Object.defineProperty(constructor.prototype, 'children', {
			get: function() {
				var i = 0, node, nodes = this.childNodes, children = [];
				while (node = nodes[i++]) {
					if (node.nodeType === 1) {
						children.push(node);
					}
				}
				return children;
			}
		});
	}
})(window.Node || window.Element);

const setAnimate = (() => {
	if(browser.is.transform === true && browser.is.transition === true) {
		return ({ element, duration=0/*애니메이션 진행시간 (단위기준: 1s)*/, left=0/*translateX*/, top=0/*translateY*/, complete, }) => { // transform (GPU)
			try {
				element.style.webkitTransitionDuration = element.style.MozTransitionDuration = element.style.msTransitionDuration = element.style.OTransitionDuration = element.style.transitionDuration = `${Number(duration)}s`;
				element.style.webkitTransform = `translate(${left}px, ${top}px) translateZ(0)`; // translateZ : CSS GPU가속 사용을 위한 핵 (3d로 속여서 GPU가속 사용)
				element.style.msTransform = element.style.MozTransform = element.style.OTransform = `translate(${left}px, ${top}px)`;
				$(element).off(`${browser.event.transitionend}.${EVENT_TRANSITION_FLICKING}`).on(`${browser.event.transitionend}.${EVENT_TRANSITION_FLICKING}`, function(e) {
					let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
					let currentTarget = event.currentTarget;
					let target = event.target || event.srcElement;
					let propertyName = event.propertyName; // 트랜지션 실행된 프로퍼티명 (transform)
					
					//console.log('event', event);
					//console.log('currentTarget', currentTarget);
					//console.log('target', target);
					//console.log('propertyName', propertyName);
					if(currentTarget && target && currentTarget.isEqualNode(target)) {
						// complete 실행
						if(typeof complete === 'function') {
							complete.call(element);
						}
					}
				});
			}catch(e) {
				console.log(e);
			}
		};
	}else {
		return ({ element, duration=0/*애니메이션 진행시간 (단위기준: 1s)*/, left=0, top=0, complete, }) => { // requestAnimationFrame / cancelAnimationFrame
			// ease
			const easeOutQuad = (t, b, c, d) => {
				return -c *(t/=d)*(t-2) + b;
			};
			const easeInOutQuad = (t, b, c, d) => {
				if((t/=d/2) < 1) {
					return c/2*t*t + b;
				}else {
					return -c/2 * ((--t)*(t-2) - 1) + b;
				}
			};

			let start = 0; // 애니메이션 시작값 (기존 css등 설정값)
			let end = 0; // 애니메이션 종료값 (사용자 설정값)
			let properties = {
				'left': {},
				'top': {}
			};
			let current = 0;
			let increment = 20;
			let request = null;
			let setFrame;

			element.style.position = 'absolute';
			if(!duration) {
				element.style.left = `${left}px`;
				element.style.top = `${top}px`;
			}else {
				// duration 값 변경
				duration = Number(duration) * 1000;

				// start, end 값 추출
				start = Number(this.numberReturn(element.style.left) || 0);
				properties.left.start = start;
				properties.left.end = end = Number(left);
				properties.left.change = end - start;
				start = Number(this.numberReturn(element.style.top) || 0);
				properties.top.start = start;
				properties.top.end = end = Number(top);
				properties.top.change = end - start;
				
				// 애니메이션 프레임 함수 (반복실행)
				setFrame = function frame() {
					let key, value;

					// increment the time
					current += increment; 

					for(key in properties) {
						value = easeInOutQuad(current, properties[key].start, properties[key].change, duration); 
						element.style[key] = `${value}px`;
					}

					if(current < duration) {
						// frame
						request = requestAnimationFrame(frame);
					}else if(request) {
						cancelAnimationFrame(request);

						// complete 실행
						if(typeof complete === 'function') {
							complete.call(element);
						}
					}
				};
				if(request) {
					cancelAnimationFrame(request);
				}
				setFrame();
			}
		};
	}
})();

// event passive
let passiveSupported = false;
try {
	const options = {
		get passive() {
			passiveSupported = true;
		}
	};
	window.addEventListener("test", options, options);
	window.removeEventListener("test", options, options);
}catch(error) {
	passiveSupported = false;
}

export default class Flicking {
	constructor(target=null, settings={}) {
		this.settings = {
			'key': '', // 플리킹 작동 고유키 (선택)
			'flow': 'horizontal', // 플리킹 방향 (가로:horizontal, 세로:vertical)
			'width': 'auto', // 슬라이드 width 값 설정 (auto: 슬라이드가 target 가운데 위치하도록 wrap width 값에 따라 자동설정)
			'height': 'auto', // 슬라이드 height 값 설정 (숫자, auto, min, max) - css height 값이 auto 경우 wrap height 값이 0으로 보이는 경우가 있다. 이 경우 wrap css 값 overflow: auto; 또는 :after { content: ""; display: block; clear: both; } 해결가능하다.
			'centered': '', // auto / margin / padding 
			'speed': 300, // 슬라이드 속도
			'touch': true, // 클릭 또는 터치 슬라이드 작동여부
			'auto': 0, // 자동 슬라이드 작동여부 (0 이상의 값이 입력되면 작동합니다.)
			'wheel': false, // 마우스 휠 이벤트 작동여부
			'edge': true, // 가장자리 터치(클릭)시 슬라이드 이동여부
			'listeners': { // 플리킹 작동 listeners (선택)
				'initialize': null,
				'next': null,
				'prev': null,
				'slidechange': null,
				'append': null,
				'remove': null,
				'transitionend': null
			}
		};
		this.settings = extend(this.settings, settings);
		this.elements = {};
		this.total = 0; // 총 슬라이드 수
		this.index = 1; // 현재 출력되고 있는 슬라이드 (1부터 시작)
		this.width = {}; // 플리킹 wrap width value, unit 값
		this.height = {}; // 플리킹 wrap height value, unit 값
		this.current = 0; // container 의 이동전(현재) translateX, left 또는 translateY, top 값
		this.time = {
			'auto': 0, // 자동슬라이드 time key
			'resize': 0	
		}; 
		if(this.settings.centered && (typeof this.settings.centered !== 'string' || !/margin|padding/i.test(this.settings.centered) || this.settings.centered.toLowerCase() === 'auto')) {
			this.settings.centered = 'margin';
		}

		// target
		target = (typeof target === 'string' && /^[a-z]+/i.test(target) ? `#${target}` : target);
		this.elements.target = (typeof target === 'object' && target.nodeType ? target : $(target).get(0));

		// initialize
		this.reset();
		this.wrap();
		this.view();
		this.on();
		this.auto({'mode': 'start'});
		this.wheel({'mode': 'on'});

		// resize event 
		$(window).off(`resize.${EVENT_RESIZE_FLICKING}_${this.settings.key}`);
		if((typeof this.settings.width === 'string' && /auto|min|max/ig.test(this.settings.width)) || (typeof this.settings.height === 'string' && /auto|min|max/ig.test(this.settings.height))) {
			$(window).on(`resize.${EVENT_RESIZE_FLICKING}_${this.settings.key}`, (e) => {
				console.log('[플리킹 정보] resize event');
				window.clearTimeout(this.time.resize);
				this.time.resize = window.setTimeout(() => { 
					console.log('[플리킹 정보] resize set');
					// 애니메이션 정지!
					this.wrap();
					this.view();
				}, 300);
			});
		}

		// listeners
		if(typeof this.settings.listeners.initialize === 'function') {
			this.settings.listeners.initialize.call(this, this.elements.target);
		}
	}

	reset() {
		this.start = {
			"left": 0,
			"top": 0,
			"time": 0
		};
		this.end = {
			"left": 0,
			"top": 0,
			"time": 0
		};
	}

	// 설정값 변경
	change(settings={}) {
		let key, temp;

		try {
			for(key in settings) {
				switch(key) {
					case 'listeners':
						for(temp in settings[key]) {
							if(settings[key].hasOwnProperty(temp)) {
								this.settings.listeners[temp] = settings[key][temp];
							}
						}
						break;
					case 'width':
					case 'height':
						this.settings[key] = settings[key];
						// resize event 
						window.clearTimeout(this.time.resize);
						$(window).off(`resize.${EVENT_RESIZE_FLICKING}_${this.settings.key}`);
						if(this.settings[key] === 'auto') {
							$(window).on(`resize.${EVENT_RESIZE_FLICKING}_${this.settings.key}`, (e) => {
								window.clearTimeout(this.time.resize);
								this.time.resize = window.setTimeout(() => { 
									// 애니메이션 정지!
									this.wrap();
									this.view();
								}, 300);
							});
						}
						// 
						this.wrap();
						this.view();
						break;
				}
			}
		}catch(e) {}

		return this;
	}

	// 플리킹(target) 감싸는 element width, style 등 설정
	wrap() {
		let display; // flex 검사 
		let target = this.elements.target;
		let parent = target.parentNode; // target 상위 element
		let temp;
		let style = {
			'parent': {},
			'target': {}
		};
		let translate = {
			'element': target,
			//'duration': Number(this.settings.speed) / 1000
			'duration': 0
		};

		console.log('[플리킹 정보] parent', parent);

		// toLowerCase
		if(/^(horizontal|vertical)$/i.test(this.settings.flow) === false) {
			this.settings.flow = 'horizontal';
		}else {
			this.settings.flow = this.settings.flow.toLowerCase();
		}
		if(typeof this.settings.width === 'string') {
			this.settings.width = this.settings.width.toLowerCase();
		}
		if(typeof this.settings.height === 'string') {
			this.settings.height = this.settings.height.toLowerCase();
		}

		// slide
		this.elements.children = this.elements.target.children; // 슬라이드 elements (IE8 이하 사용 불가능)
		this.total = this.elements.children.length || 0;

		// width / height 초기값
		this.width = {
			'value': 0,
			'unit': 'px'
		};
		this.height = {
			'value': 0,
			'unit': 'px'
		};

		// 사용자가 width /  height 를 설정
		if(isNumeric(this.settings.width)) {
			this.width = {
				'value': Number(this.settings.width),
				'unit': 'px'
			};
		}else if(/^([0-9]+)(\D+)$/i.test(this.settings.width)) {
			temp = numberUnit(this.settings.width);
			this.width = {
				'value': Number(temp[1]),
				'unit': temp[2]
			};
		}
		if(isNumeric(this.settings.height)) {
			this.height = {
				'value': Number(this.settings.height),
				'unit': 'px'
			};
		}else if(/^([0-9]+)(\D+)$/i.test(this.settings.height)) {
			temp = numberUnit(this.settings.height);
			this.height = {
				'value': Number(temp[1]), 
				'unit': temp[2]
			};
		}

		// wrap 크기 정보
		// auto (parent element의 width / height 를 구함)
		if((typeof this.settings.width === 'string' && /auto|min|max/ig.test(this.settings.width)) || (typeof this.settings.height === 'string' && /auto|min|max/ig.test(this.settings.height))) {
			// display
			// flow, flow-root, table, flex, ruby, grid, list-item
			// !/flow|table|flex|ruby|grid|list/ig.test(display)
			display = $(target).css('display'); 
			//console.log('[플리킹 정보] display', display);

			// target 상위 parent element 의 정확한 값을 구하기 위해 플리킹 wrap 의 width / height 초기화
			// float해제방식: overflow: hidden; 또는 부모요소 inline-block
			//$(target).css({'width': '0px', 'height': '0px', 'overflow': 'hidden'});
			$(target).css({'display': 'none'});
			if(this.settings.width === 'auto') {
				this.width = {
					'value': Number(numberReturn($(parent).innerWidth()) || 0),
					'unit': 'px'
				};
			}
			if(this.settings.height === 'auto' && this.settings.flow === 'vertical') {
				this.height = {
					'value': Number(numberReturn($(parent).innerHeight()) || 0),
					'unit': 'px'
				};
			}
			$(target).css({'display': display || ''});
			//console.log('[플리킹 정보] wrap width', this.width);
			//console.log('[플리킹 정보] wrap height', this.height);
		}

		// style
		style.parent['position'] = 'relative';
		style.parent['overflow'] = 'hidden';
		style.target['height'] = 'auto';
		style.target['user-select'] = 'none';
		//style.target['touch-action'] = 'pan-y';
		//style.target['-webkit-user-drag'] = 'none';
		if(this.settings.flow === 'vertical') {
			style.target['width'] = `${this.width.value}px`;
		}else {
			style.target['width'] = `${(this.width.value * this.total)}px`;
		}
		$(parent).css(style.parent);
		$(target).css(style.target);

		// translate
		if(this.settings.flow === 'vertical') {
			translate.top = this.current = (this.height.value * (this.index - 1)) * -1;
		}else {
			translate.left = this.current = (this.width.value * (this.index - 1)) * -1;
		}
		setAnimate(translate); // resize 콜백 발생시 슬라이드 위치 초기화
		
		return this;
	}

	// 슬라이드 element width, style 등 설정
	view({ index/*해당 슬라이드 index*/, element/*해당 슬라이드 element*/, }={}) {	
		let i, max;
		const setStyle = (element) => {
			let parent; // 상위 element
			let centered = this.settings.centered;
			let width = 0, height = 0;
			let rect = {};
			let past = { // 기존 element 에 설정된 style 값
				'min-width': '',
				'max-width': '',
				'min-height': '',
				'max-height': '',
				'display': ''
			}; 
			let style = { // 슬라이드 기본 style 설정 값
				'min-width': '0', // default value 0
				'max-width': 'none', // default value none
				'min-height': '0', // default value 0
				'max-height': 'none', // default value none
				'display': 'block'
			}; 
			let temp;

			if(element) {
				parent = element.parentNode;
				element = $(element);

				// 가운데 정렬을 위한 초기화 
				if(centered) {
					temp = {};
					if(this.settings.flow === 'vertical') {
						temp[`${centered}-top`] = '0px';
						temp[`${centered}-bottom`] = '0px';
					}else {
						temp[`${centered}-left`] = '0px';
						temp[`${centered}-right`] = '0px';
					}
					element.css(temp);
				}

				// 기존 style 값 저장 
				past['min-width'] = element.css('min-width');
				past['max-width'] = element.css('max-width');
				past['min-height'] = element.css('min-height');
				past['max-height'] = element.css('max-height');
				past['display'] = element.css('display');
				console.log('[플리킹 정보] 대상 element 기존 style', past);

				// 슬라이드의 width / height 값 계산(정확한 width / height 값 반환을 위해 float: left 설정, max-width 값 초기화)
				// 플리킹을 위한 기본 style 설정
				if(parent && /flow|table|flex|ruby|grid|list/ig.test(parent.style && parent.style.display || '')) {
					element.css({'min-width': '0', 'max-width': 'none', 'min-height': '0', 'max-height': 'none', 'position': 'relative'}); 
				}else {
					element.css({'min-width': '0', 'max-width': 'none', 'min-height': '0', 'max-height': 'none', 'position': 'relative', 'float': 'left'}); 
				}

				// 슬라이드 내부 이미지의 경우 정확한 width/height 값을 구하기 어려움!
				// border 값을 포함한 width / height 값
				// 중앙정렬 조건이 padding 경우 width, height 값 확인 다시!
				width = Number(numberReturn(element.outerWidth()) || 0); 
				height = Number(numberReturn(element.outerHeight()) || 0); 
				console.log('[플리킹 정보] 슬라이드 사이즈 확인(outerWidth/outerHeight)', [width, height].join('/')); 
				if(element.get(0) && typeof element.get(0).getBoundingClientRect === 'function') { // chrome 에서는 정수가 아닌 실수단위로 정확한 값을 요구하므로 getBoundingClientRect 사용
					rect = element.get(0).getBoundingClientRect(); // width/height: IE9 이상 지원
					if('width' in rect || 'height' in rect) { 
						width = rect.width || width;
						height = rect.height || height;
						console.log('[플리킹 정보] 슬라이드 사이즈 확인(getBoundingClientRect)', [width, height].join('/')); 
					}
				}

				// style (px, em, rem 에 따른 분기 작업필요)
				/*if(centered) {
					style[`${centered}-left`] = past[`${centered}-left`] || '0px';
					style[`${centered}-right`] = past[`${centered}-right`] || '0px';
					style[`${centered}-top`] = past[`${centered}-top`] || '0px';
					style[`${centered}-bottom`] = past[`${centered}-bottom`] || '0px';
				}*/

				// width
				//console.log('[플리킹 정보] width', width); 
				if(0 < this.width.value/* && this.width.value < width*/) {
					// 슬라이드 width 크기가 플리킹 wrap width 보다 클경우 강제 width 설정
					style['max-width'] = `${this.width.value}px`;
				}
				if(centered) {
					// 양쪽 여백값 (슬라이드를 가운데 위치시키기 위함)
					style['min-width'] = `${width}px`;
					style[`${centered}-left`] = style[`${centered}-right`] = `${((this.width.value - width) / 2)}px`; 
				}else {
					// 최소 가로 크기 (슬라이드 가로 크기)
					style['min-width'] = `${this.width.value}px`;
				}

				// height 
				//console.log('[플리킹 정보] height', height);
				if(this.settings.flow === 'vertical') {
					if(0 < this.height.value/* && this.height.value < height*/) {
						// 슬라이드 height 크기가 플리킹 wrap height 보다 클경우 강제 height 설정 
						style['max-height'] = `${this.height.value}px`;
					}
					if(centered) {
						// 위아래 여백값 (슬라이드 가운데 위치시키기 위함)
						style['min-height'] = `${height}px`;
						style[`${centered}-top`] = style[`${centered}-bottom`] = `${((this.height.value - height) / 2)}px`; 	
					}else {
						// 최소 세로 크기 (슬라이드 세로 크기)
						style['min-height'] = `${this.height.value}px`;
					}
				}
				
				console.log('[플리킹 정보] style', style);
				element.css(style);
			}
		};
		
		//
		element = index && this.elements.children[index-1] ? this.elements.children[index-1] : element;
		if(element) {
			setStyle(element);
		}else {
			for(i=0, max=this.total; i<max; i++) {
				setStyle(this.elements.children[i]);
			}
		}

		return this;
	}

	// 슬라이드 추가
	append({ index='last'/*지정된 위치에 삽입 (last, first, 숫자)*/, html, element, }={}) {
		if(typeof html === 'string' && html.length > 0) {
			element = ((html) => {
				// getBoundingClientRect 사용을 위해 fragment 를 활용하지 않는다.
				// getBoundingClientRect 는 크롬에서의 소수점 단위의 정확한 width / height 값을 알기 위해 사용한다.
				let div = document.createElement('div');
				div.innerHTML = html;
				return div.firstChild; // IE8 이하 사용 불가능
			})(html);
		}else {
			element = $(element).get(0);
		}

		if(typeof element === 'object' && element.nodeType) {
			// index 값에 따라 해당 위치에 삽입
			if(isNumeric(index)) { // 숫자
				if(!this.elements.target.insertBefore(element, this.elements.children[index-1])) {
					return false;
				}
			}else if(typeof index === 'string') { // 문자
				switch(index.toLowerCase()) {
					case 'first':
						if(!this.elements.target.insertBefore(element, this.elements.target.firstChild)) {
							return false;
						}
						break;
					case 'last':
						if(!this.elements.target.appendChild(element)) {
							return false;
						}
						break;
				}
			}

			// 정보 업데이트
			this.elements.children = this.elements.target.children; // 슬라이드 elements (IE8 이하 사용 불가능)
			this.total = this.elements.children.length || 0; 
			$(this.elements.target).css({'width': `${(this.settings.flow === 'vertical' ? this.width.value : (this.width.value * this.total))}px`}); // wrap width 수정
			this.view({'index': this.total});
			console.log('[플리킹 정보] append total', this.total);

			// listeners
			if(typeof this.settings.listeners.append === 'function') {
				this.settings.listeners.append.call(this, element);
			}
		}

		return this;
	}

	// 슬라이드 삭제
	remove({ index='last'/*current, last, 숫자*/, }={}) {	
		let element;
		let is = false; // 삭제 후 술라이드 이동 여부 (현재 슬라이드 삭제 등의 경우)
		const setDelete = (element) => {
			$(element).off();
			if(typeof element === 'object' && element.nodeType && element.parentNode.removeChild(element)) {
				return true;
			}else {
				return false;
			}
		};

		if(index) {
			if(isNumeric(index)) { // 숫자
				if(index == this.index) {
					is = true;
				}
				element = this.elements.children[index-1];
			}else if(typeof index === 'string') { // 문자
				switch(index.toLowerCase()) {
					case 'current':
						is = true;
						element = this.index && this.elements.children[this.index-1];
						break;
					case 'last':
						is = false;
						element = this.total && this.elements.children[this.total-1];
						break;
				}
			}
			setDelete(element);
		}else { // 전체제거
			for(index in this.elements.children) {
				setDelete(this.elements.children[index]);
			}
		}

		// 정보 업데이트
		this.elements.children = this.elements.target.children; // 슬라이드 elements (IE8 이하 사용 불가능)
		this.total = this.elements.children.length || 0; 
		$(this.elements.target).css({'width': `${(this.settings.flow === 'vertical' ? this.width.value : (this.width.value * this.total))}px`}); 
		if(is) {
			this.slide({'index': 'prev'});
		}

		// listeners
		if(typeof this.settings.listeners.remove === 'function') {
			this.settings.listeners.remove.call(this, this.elements.target);
		}

		return this;
	}

	// 슬라이드 위치 설정
	slide({ index, duration, }={}) {
		index = index && typeof index === 'string' && String(index).toLowerCase() || index; // index 숫자이면 해당 index로 이동, next || prev 이면 해당 모드에 따라 이동
		duration = isNumeric(duration) ? duration : Number(this.settings.speed) / 1000;

		let is = false; // 이동이 발생했는지 여부
		let before = this.index; // 현재 슬라이드 index
		let after = this.index; // 이동할 슬라이드 index
		let translate = {
			'element': this.elements.target,
			'duration': duration
		};

		// 해당 index 로 이동
		switch(index) {
			case 'next':
				// 다음 슬라이드 이동
				if(after < this.total) {
					after += 1;
				}/*else { // 처음으로 이동
					after = 1;
				}*/
				break;
			case 'prev':
				// 이전 슬라이드 이동
				if(1 < after) {
					after -= 1;
				}/*else { // 마지막으로 이동
					after = this.total;
				}*/
				break;
			default:
				// index 값에 해당하는 index 로 이동
				if(isNumeric(index)) {
					after = index;
				}
		}

		// 다음 또는 이전 이동이 발생했는지 확인
		if(isNumeric(after) && 1 <= after && (before < after || before > after) && after <= this.total) {
			is = true;
		}

		// slide 이동
		if(this.settings.flow === 'horizontal') {
			translate.left = this.current = (this.width.value * ((is ? after : before) - 1)) * -1;
		}else if(this.settings.flow === 'vertical') {
			translate.top = this.current = (this.height.value * ((is ? after : before) - 1)) * -1;
		}
		setAnimate(translate/*, complete*/);

		if(is) {
			// 값 변경
			this.index = after;
			// listeners
			if(before < after && typeof this.settings.listeners.next === 'function') { // next
				this.settings.listeners.next.call(this, this.elements.target);
			}else if(before > after && typeof this.settings.listeners.prev === 'function') { // prev
				this.settings.listeners.prev.call(this, this.elements.target);
			}
			if(typeof this.settings.listeners.slidechange === 'function') { // slidechange
				this.settings.listeners.slidechange.call(this, this.elements.target);
			}
		}

		// auto
		this.auto({'mode': 'start'});

		return true;
	}

	// 마우스, 터치 이벤트 설정
	on() {	
		const that = this;
		let rect = {}; 

		/**
		 * up
		 */
		const setUp = (event) => {
			//console.log('[플리킹 정보] MOUSEUP');
			let self = event.currentTarget; // event listener element (event 실행 element)
			let target = event && event.target; // event 가 발생한 element
			//let touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
			let touch = event.changedTouches; // touchend
			let time;
			let left, top;
			let index, duration;
			let standard = { // 기준값 (이동)
				'time': 100, 
				'move': 30, // 최소/최대 이동범위
				'size': 6 // 화면 분할 기준
			};
			let is = false;
			const isChildren = (element) => {
				let i, max;
				for(i=0, max=this.total; i<max; i++) {
					if(this.elements.children[i].isEqualNode(element)) {
						return true;
					}
				}
				return false;
			};

			// event.currentTarget; // event listener element (event 실행 element)
			// event.target; // event 가 발생한 element

			// 현재 이벤트의 기본 동작을 중단한다. (터치 디바이스에서 기본 이벤트를 중단시키면 슬라이드 내부 a 태그등이 작동을 안한다. 모바일에서는 user-select: none; CSS로 해결한다.)
			//event.preventDefault();

			// 정지값
			if(touch) {
				this.end.left = touch[0].clientX;
				this.end.top = touch[0].clientY;
			}else {
				this.end.left = event.clientX;
				this.end.top = event.clientY;
			}
			this.end.time = new Date().getTime();

			time = Number(this.end.time) - Number(this.start.time);
			left = this.end.left - this.start.left;
			top = this.end.top - this.start.top;
			index = this.index;
			duration = Number(this.settings.speed) / 1000; /* 300 / 1000 */

			// 이동 가능한지 검사
			if(this.settings.flow === 'horizontal' && ((Math.abs(left) > Math.abs(top)/*좌우 이동값이 더 큰 경우*/ && (time <= standard.time && standard.move <= Math.abs(left)/*마우스를 빠르게 이동한 경우*/)) || (this.width.value / standard.size) < Math.abs(left)/*슬라이드 크기 기준 어느정도 이동이 발생했을 때*/)) {
				if(index < this.total && left < 0) { // 다음
					index++;
				}else if(1 < index && left > 0) { // 이전
					index--;
				}
				// 슬라이드 속도
				duration = (time > 1000 || 6000 < time) ? duration : (time+100) / 1000;
			}else if(this.settings.flow === 'vertical' && ((Math.abs(top) > Math.abs(left)/*상하 이동값이 더 큰 경우*/ && (time <= standard.time && standard.move <= Math.abs(top)/*마우스를 빠르게 이동한 경우*/)) || (this.height.value / standard.size) < Math.abs(top)/*슬라이드 크기 기준 어느정도 이동이 발생했을 때*/)) {
				if(index < this.total && top < 0) { // 다음
					index++;
				}else if(1 < index && top > 0) { // 이전
					index--;
				}
				// 슬라이드 속도
				duration = (time > 1000 || 6000 < time) ? duration : (time+100) / 1000;
			}else if(typeof rect === 'object' && this.settings.edge === true && Math.abs(left) < standard.move && Math.abs(top) < standard.move && (this.elements.target.isEqualNode(target)/*슬라이드 영역*/ || (this.elements.target.contains(target)/*바로하위자식*/ && isChildren(target)))) {
				// 슬라이드 좌/우 또는 상/하 끝부분을 클릭(터치) 했을 경우
				console.log('[플리킹 정보] 슬라이드 좌/우 또는 상/하 끝부분');
				console.log('current slide', this.elements.children[this.index-1]);
				console.log('rect', rect);
				console.log('start', this.start);
				console.log('end', this.end);
				//console.log(rect.left <= this.end.left);
				//console.log(this.end.left <= rect.left+standard.move);
				//console.log(rect.right-standard.move <= this.end.left);
				//console.log(this.end.left <= rect.right);
				if(this.settings.flow === 'horizontal') {
					if(rect.left <= this.end.left && this.end.left <= rect.left+standard.move) { // 좌측기준
						index--;
					}else if(rect.right-standard.move <= this.end.left && this.end.left <= rect.right) { // 우측기준
						index++;
					}
				}else if(this.settings.flow === 'vertical') {
					if(rect.top <= this.end.top && this.end.top <= rect.top+standard.move) { // 상단기준 
						index--;
					}else if(rect.bottom-standard.move <= this.end.top && this.end.top <= rect.bottom) { // 하단기준 
						index++;
					}
				}
			}
			//console.log('slide element', this.elements.target);
			//console.log('target', target);

			/*
			// 로그
			console.log('[플리킹 정보] 실행정보');
			console.log(`index: ${this.index}`);
			console.log(`index: ${index}`);
			console.log(`duration: ${duration}`);
			console.dir(this.start);
			console.dir(this.end);
			*/

			// 슬라이드 이동이 예상되는 경우 기본 이벤트 정지(클릭 등 정지)
			if(index <= this.total && (this.index < index || index > this.index)) {
				event.preventDefault();
				is = true;
			}

			// 슬라이드 이동 (transitionend 이벤트 발생됨)
			this.slide({'index': index, 'duration': duration});

			// ---------- ---------- ---------- ---------- ---------- ----------

			// 이벤트 정지
			$(window).off(`.${EVENT_MOUSEMOVE_FLICKING}_${this.settings.key}`);
			$(window).off(`.${EVENT_MOUSEUP_FLICKING}_${this.settings.key}`);

			// auto
			this.auto({'mode': 'start'});

			// initialize
			this.reset();

			return is;
		};

		/**
		 * move
		 */
		const setMove = (event) => {
			//console.log('[플리킹 정보] MOUSEMOVE');
			let self = event.currentTarget; // event listener element (event 실행 element)
			let target = event && event.target; // event 가 발생한 element
			//let touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
			let touch = event.touches || event.changedTouches;
			let left, top;
			let is = true;
			let translate = {
				'element': this.elements.target,
				'duration': 0
			};

			// event.currentTarget; // event listener element (event 실행 element)
			// event.target; // event 가 발생한 element
			// event.currentTarget.contains(event.target); // 특정 노드가 다른 노드 내에 포함되었는지 여부

			// 마우스 element target 이 플리킹 내부 element 가 아니면 중지시킨다. 
			//console.log('contains', this.elements.target.contains(target));
			if(this.elements.target.contains(target) === false) {
				console.log('contains', target);
				setUp(event);
				/*this.slide({'index': this.index});

				// 이벤트 정지
				$(window).off(`.${EVENT_MOUSEMOVE_FLICKING}_${this.settings.key}`);
				$(window).off(`.${EVENT_MOUSEUP_FLICKING}_${this.settings.key}`);

				// auto
				this.auto({'mode': 'start'});

				// initialize
				this.reset();*/
				return false;
			}

			// 현재 이벤트의 기본 동작을 중단한다.
			if(this.settings.flow === 'vertical') {
				event.preventDefault();
			}

			// 이동값
			if(touch) {
				left = touch[0].clientX;
				top = touch[0].clientY;
			}else {
				left = event.clientX;
				top = event.clientY;
			}

			// 로그
			/*console.log("left: " + left);
			console.log("this.start.left: " + this.start.left);
			console.log("top: " + top);
			console.log("this.start.top: " + this.start.top);
			console.log(Math.abs(left - this.start.left));
			console.log(Math.abs(top - this.start.top));*/

			// 슬라이드 영역 외 element 검사
			/*if(!this.elements.target.contains(event.target)) {
				this.slide({'index': this.index, 'duration': Number(this.settings.speed) / 1000});
				return false;
			}*/

			// 사용자 터치가 브라우저 스크롤인지 슬라이드 이동 목적인지 확인하여 실행(안정화)
			if(this.settings.flow === 'horizontal' && Math.abs(left - this.start.left) > Math.abs(top - this.start.top)) {
				translate.left = (left - this.start.left) + this.current;
			}else if(this.settings.flow === 'vertical' && Math.abs(top - this.start.top) > Math.abs(left - this.start.left)) {
				translate.top = (top - this.start.top) + this.current;
			}else {
				is = false;
			}
			if(is) {
				// 현재 이벤트의 기본 동작을 중단한다. (슬라이드가 작동중일 때 모바일의 기본이벤트인 스크롤 작동을 중단시킨다.)
				event.preventDefault();
				// slide 이동
				setAnimate(translate);
			}

			return is;
		};

		/**
		 * down
		 */
		const setDown = (event) => {
			//console.log('[플리킹 정보] MOUSEDOWN');
			let self = event.currentTarget; // event listener element (event 실행 element)
			let target = event && event.target; // event 가 발생한 element
			//let touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
			let touch = event.touches; // touchstart

			// 위치 / 크기 
			if(self.parentNode) {
				rect = self.parentNode.getBoundingClientRect();
			}
			console.log('[플리킹 정보] element 값', self);
			console.log('[플리킹 정보] offset 값', `left(${self.offsetLeft}), top(${self.offsetTop}), width(${self.offsetWidth}), height(${self.offsetHeight})`);
			console.log('[플리킹 정보] client 값', `left(${self.clientLeft}), top(${self.clientTop}), width(${self.clientWidth}), height(${self.clientHeight})`);

			// 버블링(stopPropagation) 중지시키면, 상위 이벤트(예: document 에 적용된 이벤트)이 작동을 안한다.
			// 현재 이벤트의 기본 동작을 중단한다. (터치 디바이스에서 기본 이벤트를 중단시키면 스크롤이 작동을 안한다. 모바일에서는 user-select: none; CSS로 해결한다.)
			if(!browser.is.touch && /[^input|select|textarea|button]/i.test(target.tagName)) {
				// PC에서는 마우스 이벤트 정확도(기능 정상작동)를 올리기 위해 정지
				event.preventDefault();
			}
			
			// 멀티터치 방지
			if(touch && touch.length && 1 < touch.length) {
				return;
			}

			// ---------- ---------- ---------- ---------- ---------- ----------

			// 이벤트 정지
			$(window).off(`.${EVENT_MOUSEMOVE_FLICKING}_${this.settings.key}`);
			$(window).off(`.${EVENT_MOUSEUP_FLICKING}_${this.settings.key}`);

			// auto
			this.auto({'mode': 'stop'});
			
			// initialize
			this.reset();

			// ---------- ---------- ---------- ---------- ---------- ----------
			
			// 시작값
			if(touch) {
				this.start.left = touch[0].clientX;
				this.start.top = touch[0].clientY;
			}else {
				this.start.left = event.clientX;
				this.start.top = event.clientY;
			}
			this.start.time = new Date().getTime();
		};
		
		// 이벤트 초기화
		this.off(); 
		
		if(this.settings.touch === true) {
			// down 이벤트
			$(this.elements.target).on(`${browser.event.down}.${EVENT_MOUSEDOWN_FLICKING}_${this.settings.key}`, function(e) {
				setDown((typeof e === 'object' && e.originalEvent || e) || window.event); // originalEvent: jQuery Event

				// move 이벤트
				$(window).on(`${browser.event.move}.${EVENT_MOUSEMOVE_FLICKING}_${that.settings.key}`, function(e) {
					setMove((typeof e === 'object' && e.originalEvent || e) || window.event); // originalEvent: jQuery Event
				});
				
				// up 이벤트
				$(window).on(`${browser.event.up}.${EVENT_MOUSEUP_FLICKING}_${that.settings.key}`, function(e) {
					setUp((typeof e === 'object' && e.originalEvent || e) || window.event); // originalEvent: jQuery Event
				});
			});

			// 트랜지션 (하위 자식 노드의 transition 전파에 따라 실행될 수 있다. 자식의 transition 전파를 막으려면 해당 자식 이벤트에 stopPropagation 실행)
			// 또는 addEventListener 를 사용하여, event.target 를 검사하여, 해당되는 element의 경우에만 콜백을 실행해야 한다.
			// transition 값이 여러개의 경우 각각의 프로퍼티별로 콜백이 실행된다. (left/top 두개 트랜지션이 설정되었을 경우, left/top 각각 콜백이 두번 실행된다.)
			if(typeof this.settings.listeners.transitionend === 'function') {
				$(this.elements.target).off(`${browser.event.transitionend}.${EVENT_TRANSITION_FLICKING}_${this.settings.key}`).on(`${browser.event.transitionend}.${EVENT_TRANSITION_FLICKING}_${this.settings.key}`, function(e) {
					let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
					let currentTarget = event.currentTarget; // event listener element
					let target =  event.target || event.srcElement; // event 가 발생한 element
					let propertyName = event.propertyName; // 트랜지션 실행된 프로퍼티명 - horizontal/vertical 설정 값에 따라 left/top 둘 중 하나의 값

					/*console.log(event);
					console.log(currentTarget);
					console.log(target);*/
					if(currentTarget.isEqualNode(target)) {
						that.settings.listeners.transitionend.call(this, that.elements.target);
					}
				});
			}
		}

		return this;
	}

	off() {
		$(window).off(`.${EVENT_MOUSEMOVE_FLICKING}_${this.settings.key}`);
		$(window).off(`.${EVENT_MOUSEUP_FLICKING}_${this.settings.key}`);
		$(this.elements.target).off(`.${EVENT_MOUSEDOWN_FLICKING}_${this.settings.key}`);
		$(this.elements.target).off(`.${EVENT_TRANSITION_FLICKING}_${this.settings.key}`);
		return this;
	}

	// 슬라이드 자동 플리킹 설정
	auto({ mode, }={}) {
		mode = /^(start|stop)$/i.test(mode) && mode.toLowerCase() || 'stop';

		window.clearTimeout(this.time.auto);
		if(mode === 'start' && this.settings.auto > 0) {
			this.time.auto = window.setTimeout(() => {
				if(this.index < this.total) {
					this.slide({'index': 'next'});
				}else {
					this.slide({'index': 1});
				}					
			}, this.settings.auto);
		}

		return this;
	}

	// 마우스 휠
	wheel({ mode, }={}) {
		const that = this;

		mode = /^(on|off)$/i.test(mode) && mode.toLowerCase() || 'off';

		$(this.elements.target).off(`.${EVENT_MOUSEWHEEL_FLICKING}_${this.settings.key}`);
		if(mode === 'on' && this.settings.wheel === true) {
			$(this.elements.target).on(`${browser.event.wheel}.${EVENT_MOUSEWHEEL_FLICKING}_${this.settings.key}`, function(e) {
				let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				let scroll;

				// 현재 이벤트의 기본 동작을 중단한다.
				event.preventDefault();

				//
				if(event.wheelDelta) {
					scroll = event.wheelDelta / 3600; // Chrome / Safari
				}else if(event.detail) {
					scroll = event.detail / -90; // Mozilla
				}else {
					return false;
				}

				//
				scroll = 1 + scroll; // Zoom factor: 0.9 / 1.1
				if(scroll > 1) { // prev
					that.slide({'index': 'prev'});
				}else if(scroll < 1) { // next
					that.slide({'index': 'next'});
				}else {
					return false;
				}
			});
		}
	}
}