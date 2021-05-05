/**
 * 레이어
 */
import browser, { windowDocumentSize, browserScroll, } from '../browser';
import $ from '../dom';
import { extend, elementPosition, } from '../util';
import ModalState, { modalState } from "./ModalState";

const isIOS = /(iphone|ipad|ipod)/i.test((window.navigator.userAgent || window.navigator.vendor || window.opera).toLowerCase());

const EVENT_CLICK_CLOSE = 'EVENT_CLICK_CLOSE';
const EVENT_MOUSEDOWN_ZINDEX = 'EVENT_MOUSEDOWN_ZINDEX';
const EVENT_RESIZE = 'EVENT_RESIZE';

export default class ModalLayer {
	constructor(target, settings={}) {
		//super();
		this.settings = {
			'key': '',
			'position': 'center',
			'mask': null, // 값이 있으면 해당 mask element 를 실행한다.
			'listeners': {
				'show': null,
				'hide': null,
				'remove': null,
				'error': null,
				'resize': null
			},
			'theme:': {}, // 테마 (스타일 변경)
			'close': '', // .class
			'esc': true // 키보드 esc 닫기실행
		};
		this.settings = extend(this.settings, settings);
		this.elements = {};
		this.before = { // 값 변경전 기존 설정값 저장
			'scrollLeft': 0,
			'scrollTop': 0
		};
		this.time = null;

		// target
		target = (typeof target === 'string' && /^[a-z]+/i.test(target) ? `#${target}` : target);
		this.elements.target = (typeof target === 'object' && target.nodeType ? target : $(target).get(0));
		this.elements.target.style.position = 'static';

		// render
		this.render();

		// 팝업내부 close 버튼 클릭시 닫기
		if(this.settings.close && (typeof this.settings.close === 'string' || typeof this.settings.close === 'object')) {
			if(typeof this.settings.close === 'string' && /^[a-z]+/i.test(this.settings.close)) {
				this.settings.close = `.${this.settings.close}`;
			}
			$(this.elements.target).find(this.settings.close).on(`${browser.event.click}.${EVENT_CLICK_CLOSE}_${this.settings.key}`, (e) => {
				let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				event.preventDefault();
				event.stopPropagation();
				this.hide();
			});
		}

		// 팝업내부 click 시 zindex 값 변경 (해당 layer 가장위에 보이도록함)
		$(target).on(`${browser.event.down}.${EVENT_MOUSEDOWN_ZINDEX}_${this.settings.key}`, () => {
			this.above();
		});
	}

	render() {
		// container
		this.elements.container = modalState.container();

		// layer
		let layer = document.querySelector(`[${modalState.attributePrefix}-layer]`);
		if(!layer) {
			layer = document.createElement('div');
			layer.setAttribute(`${modalState.attributePrefix}-layer`, 'layer');
			//layer.style.cssText = 'position: fixed; left: 0px; top: 0px;';
			this.elements.container.appendChild(layer);
		}
		this.elements.layer = layer;

		// mask
		if(this.settings.mask && typeof this.settings.mask === 'object') {
			this.elements.mask = this.settings.mask.nodeType ? this.settings.mask : $(this.settings.mask).get(0);
			this.elements.mask.display = 'none';
		}else {
			this.elements.mask = modalState.mask();
			this.elements.layer.appendChild(this.elements.mask);
		}

		// contents (target 에 margin 등이 설정되었을 경우 position: absolute; overflow: auto; 에 의해 여백이 적용되지 않는 것 방지)
		this.elements.contents = document.createElement('div');
		this.elements.contents.setAttribute(`${modalState.attributePrefix}-layer-contents`, 'contents');
		this.elements.contents.style.cssText = 'position: absolute;';
		this.elements.contents.appendChild(this.elements.target);

		// container
		this.elements.container = document.createElement('div');
		this.elements.container.setAttribute(`${modalState.attributePrefix}-layer-container`, 'container');
		this.elements.container.style.cssText = 'position: fixed; display: none; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; outline: none; -webkit-overflow-scrolling: touch; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;';
		this.elements.container.appendChild(this.elements.contents);
		this.elements.layer.appendChild(this.elements.container);
		if(this.elements.target.style.display === 'none') {
			this.elements.target.style.display = 'block';
		}
	}

	position() {
		let size, scroll;

		try {
			// IOS 의 position: fixed 버그 대응
			/*if(isIOS === true) {
				// 방법 1
				size = windowDocumentSize();
				scroll = browserScroll();
				this.elements.container.style.position = 'absolute';
				this.elements.container.style.left = scroll.left + 'px';
				this.elements.container.style.top = scroll.top + 'px';
				// 방법 2
				//this.elements.container.style.width = (Math.max(size.window.width, size.document.width) - browser.scrollbar) + 'px';
				//this.elements.container.style.height = (Math.max(size.window.height, size.document.height) - browser.scrollbar) + 'px';
				//this.elements.contents.style.left = (Number(String(this.elements.contents.style.left).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) + scroll.left) + 'px';
				//this.elements.contents.style.top = (Number(String(this.elements.contents.style.top).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) + scroll.top) + 'px';
			}*/
			elementPosition(this.elements.contents, this.settings.position);
		}catch(e) {
			if(typeof this.settings.listeners.error === 'function') {
				this.settings.listeners.error.call(this, e);
			}
		}

		return this;
	}

	above({ display, }={}) {
		try {
			if(this.settings.mask === true || (this.settings.mask && typeof this.settings.mask === 'object' && this.settings.mask.nodeType)) {
				this.elements.mask.style.zIndex = ++modalState.zindex;
				if(display) {
					this.elements.mask.style.display = display;
				}
			}
			this.elements.container.style.zIndex = ++modalState.zindex;
			if(display) {
				this.elements.container.style.display = display;
			}
		}catch(e) {}
	}

	show({ callback, }={}) {
		let size, scroll;

		try {
			size = windowDocumentSize();
			scroll = browserScroll();

			// 스크롤바 사이즈만큼 여백
			if(size.window.height < size.document.height) {
				$('html').css({'margin-right': browser.scrollbar + 'px', 'overflow': 'hidden'});
			}

			// IOS 의 position: fixed 버그 대응
			if(isIOS === true) {
				$('html').css({'position': 'fixed'});
				this.before.scrollLeft = scroll.left;
				this.before.scrollTop = scroll.top;
			}

			// element
			this.above({'display': 'block'});
			this.position(); // parent element 가 페인팅되어있지 않으면, child element 의 width, height 값을 구할 수 없다. (this.elements.contents 의 정확한 width, height 값을 알려면, 이를 감싸고 있는 this.elements.container 가 diplay block 상태에 있어야 한다.)
			if(browser.monitor === 'pc') {
				this.elements.contents.style.webkitTransition = this.elements.contents.style.MozTransition = this.elements.contents.style.msTransition = this.elements.contents.style.OTransition = this.elements.contents.style.transition = 'left .5s, top .5s';
			}

			// focus (웹접근성)
			modalState.active = document.activeElement;
			this.elements.container.setAttribute('tabindex', -1);
			this.elements.container.focus();

			// resize 이벤트 실행 (이벤트 키는 this.settings.key 를 활용한다.)
			$(window).on(`resize.${EVENT_RESIZE}_${this.settings.key}`, (e) => {
				window.clearTimeout(this.time);
				this.time = window.setTimeout(() => {
					this.position();
				}, 50);
			});

			// listeners
			if(typeof this.settings.listeners.show === 'function') {
				this.settings.listeners.show.call(this);
			}
			if(typeof callback === 'function') {
				callback.call(this);
			}
		}catch(e) {
			if(typeof this.settings.listeners.error === 'function') {
				this.settings.listeners.error.call(this, e);
			}
		}
	}

	hide({ callback, }={}) {
		try {
			// 스크롤바 관련 (닫을 때 document 사이즈가 변경되었을 수 있기 때문에 if(조건문) 검사를 안한다.)
			$('html').css({'margin-right': modalState.defaultStyle['margin-right'], 'overflow': modalState.defaultStyle['overflow']});

			// IOS
			if(isIOS === true) {
				$('html').css({'position': modalState.defaultStyle['position']});
				window.scrollTo(this.before.scrollLeft, this.before.scrollTop);
			}

			// element
			this.elements.container.style.display = 'none';
			if(this.settings.mask === true || (this.settings.mask && typeof this.settings.mask === 'object' && this.settings.mask.nodeType)) {
				this.elements.mask.style.display = 'none';
			}

			// focus (웹접근성)
			if(modalState.active) {
				modalState.active.focus();
			}

			// resize 이벤트 종료
			$(window).off(`resize.${EVENT_RESIZE}_${this.settings.key}`);

			// listeners
			if(typeof this.settings.listeners.hide === 'function') {
				this.settings.listeners.hide.call(this);
			}
			if(typeof callback === 'function') {
				callback.call(this);
			}
		}catch(e) {
			if(typeof this.settings.listeners.error === 'function') {
				this.settings.listeners.error.call(this, e);
			}
		}
	}

	remove({ callback, }={}) {
		try {
			// 스크롤바 관련 (닫을 때 document 사이즈가 변경되었을 수 있기 때문에 if(조건문) 검사를 안한다.)
			$('html').css({'margin-right': modalState.defaultStyle['margin-right'], 'overflow': modalState.defaultStyle['overflow']});

			// IOS
			if(isIOS === true) {
				$('html').css({'position': modalState.defaultStyle['position']});
				window.scrollTo(this.before.scrollLeft, this.before.scrollTop);
			}

			// element
			if(this.elements.mask) {
				this.elements.mask.parentNode.removeChild(this.elements.mask);
			}
			if(this.elements.container) {
				this.elements.container.parentNode.removeChild(this.elements.container);
			}
			this.elements = {};

			// resize 이벤트 종료
			$(window).off(`resize.${EVENT_RESIZE}_${this.settings.key}`);

			// listeners
			if(typeof this.settings.listeners.remove === 'function') {
				this.settings.listeners.remove.call(this);
			}
			if(typeof callback === 'function') {
				callback.call(this);
			}
		}catch(e) {
			if(typeof this.settings.listeners.error === 'function') {
				this.settings.listeners.error.call(this, e);
			}
		}
	}

	toggle() {
		try {
			if(this.elements.container.style.display === 'none') {
				this.show();
			}else {
				this.hide();
			}
		}catch(e) {
			if(typeof this.settings.listeners.error === 'function') {
				this.settings.listeners.error.call(this, e);
			}
		}
	}

	find(selector) {
		try {
			return $(this.elements.container).find(selector);
		}catch(e) {
			if(typeof this.settings.listeners.error === 'function') {
				this.settings.listeners.error.call(this, e);
			}
		}
	}
}