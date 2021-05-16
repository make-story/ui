/**
 * Rect (기준점 위치에 출력)
 */
import browser, { windowDocumentSize, browserScroll, } from '@src/browser';
import $ from '@src/dom';
import { getKey, extend, elementPosition, } from '@src/util';
import ModalBase from '@src/modal/ModalBase';
import ModalState, { modalState } from "@src/modal/ModalState";

const EVENT_CLICK_CLOSE = 'EVENT_CLICK_CLOSE';
const EVENT_RESIZE = 'EVENT_RESIZE';

// auto
// topleft, topcenter, topright
// bottomleft, bottomcenter, bottomright
// lefttop, leftmiddle, leftbottom
// righttop, rightmiddle, rightbottom
export default class ModalRect extends ModalBase {
	constructor(settings={}) {
		super();
		this.settings = {
			'key': '',
			'position': 'bottomcenter', // auto: 자동으로 최적화된 영역에 출력한다.
			'mask': null, // 값이 있으면 해당 mask element 를 실행한다.
			'listeners': {
				'show': null,
				'hide': null,
				'remove': null,
				'error': null
			},
			'theme:': {}, // 테마 (스타일 변경)
			'target': '', // #id 또는 element (출력레이어 타겟)
			'close': '', // .class
			'rect': '', // #id 또는 element (위치기준 타켓)
			'out': true, // 화면(viewport) 영역 안에 표시되도록 자동 위치조절
			'fixed': false, // 화면 고정 여부
			'esc': true // 키보드 esc 닫기실행
		};
		this.settings = extend(this.settings, settings);
		this.elements = {};
		this.time = null;

		// target
		let target = (typeof this.settings.target === 'string' && /^[a-z]+/i.test(this.settings.target) ? `#${this.settings.target}` : this.settings.target);
		this.elements.target = (typeof target === 'object' && target.nodeType ? target : $(target).get(0));
		this.elements.target.style.position = 'static';

		// rect (target 의 출력위치 기준점이 될 element)
        let rect = (typeof this.settings.rect === 'string' && /^[a-z]+/i.test(this.settings.rect) ? `#${this.settings.rect}` : this.settings.rect);
        this.elements.rect = (typeof rect === 'object' && rect.nodeType ? rect : $(rect).get(0));
		
		// render
		this.render();

		// event
		this.event();
	}

	render() {
		// mask
		if(this.settings.mask && typeof this.settings.mask === 'object') {
			this.elements.mask = this.settings.mask.nodeType ? this.settings.mask : $(this.settings.mask).get(0);
			this.elements.mask.display = 'none';
		}else {
			this.elements.mask = modalState.mask();
			document.body.appendChild(this.elements.mask);
		}

		// contents
		this.elements.contents = document.createElement('div');
		this.elements.contents.setAttribute(`${modalState.attributePrefix}-rect-contents`, 'contents');
		this.elements.contents.style.cssText = (this.settings.fixed === true ? 'position: fixed;' : 'position: absolute;') + ' display: none; left: 0; top: 0; outline: none; transition: left 0s, top 0s, right 0s, bottom 0s; -webkit-overflow-scrolling: touch; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;';
		this.elements.contents.appendChild(this.elements.target);
		document.body.appendChild(this.elements.contents);
		if(this.elements.target.style.display === 'none') {
			this.elements.target.style.display = 'block';
		}
	}

	event() {
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
	}

	position() {
		try {
			elementPositionStandard(this.elements.contents, this.elements.rect, this.settings.position, { isFixed: this.settings.fixed, });
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
			this.elements.contents.style.zIndex = ++modalState.zindex;
			if(display) {
				this.elements.contents.style.display = display;
			}
		}catch(e) {}
	}

	show({ callback, }={}) {
		try {
			// element
			this.above({'display': 'block'});
			this.position();

			// focus (웹접근성)
			modalState.active = document.activeElement;
			this.elements.contents.setAttribute('tabindex', -1);
			this.elements.contents.focus();

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
			// element
			this.elements.contents.style.display = 'none';
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
			// element
			if(this.elements.mask) {
				this.elements.mask.parentNode.removeChild(this.elements.mask);
			}
			if(this.elements.contents) {
				this.elements.contents.parentNode.removeChild(this.elements.contents);
			}
			this.elements = {};

			// instance
			modalState.removeInstance(this.settings.key);

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
			if(this.elements.contents.style.display === 'none') {
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
}