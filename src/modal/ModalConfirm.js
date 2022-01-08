/**
 * confirm
 */
import browser, { windowDocumentSize, browserScroll, } from '../browser';
import $ from '../dom';
import { getKey, extend, elementPosition, } from '../util';
import ModalBase from './ModalBase';
import ModalState, { modalState } from "./ModalState";

const EVENT_CLICK_CANCEL = 'EVENT_CLICK_CANCEL';
const EVENT_CLICK_OK = 'EVENT_CLICK_OK';
const EVENT_MOUSEDOWN = 'EVENT_MOUSEDOWN';

export default class ModalConfirm extends ModalBase {
    constructor(settings) {
		super();
		this.settings = {
			'key': '',
			'position': 'topcenter',
			'mask': true, // 값이 있으면 해당 mask element 를 실행한다.
			'listeners': {
				'show': null,
				'hide': null,
				'remove': null,
				'error': null,
				'ok': () => {
					return true;
				},
				'cancel': () => {
					return false;
				}
			},
			'theme:': {}, // 테마 (스타일 변경)
			'title': 'Message',
			'message': ''
		};
		this.settings = extend(this.settings, settings);
		this.elements = {};

		// render
		this.render();

		// event
        this.event();
    }

    render() {
		let key = {
			title: getKey(),
			message: getKey(),
			cancel: getKey(),
			ok: getKey(),
		};

        // confirm
		let confirm = document.querySelector(`[${modalState.attributePrefix}-confirm]`);
		if(!confirm) {
			confirm = document.createElement('div');
			confirm.setAttribute(`${modalState.attributePrefix}-confirm`, 'confirm');
			//confirm.style.cssText = 'position: fixed; left: 0px; top: 0px;';
			modalState.container().appendChild(confirm);
		}
		this.elements.confirm = confirm;

		// mask
		if(this.settings.mask && typeof this.settings.mask === 'object') {
			this.elements.mask = this.settings.mask.nodeType ? this.settings.mask : $(this.settings.mask).get(0);
			this.elements.mask.display = 'none';
		}else {
			this.elements.mask = document.createElement('div');
			this.elements.mask.style.cssText = 'position: fixed; display: none; left: 0px; top: 0px; width: 100%; height: 100%; background: rgb(240, 241, 242) none repeat scroll 0 0; opacity: .96; -khtml-user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-touch-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;';
			this.elements.confirm.appendChild(this.elements.mask);
		}

		// contents
		this.elements.contents = document.createElement('div');
		this.elements.contents.style.cssText = 'position: fixed; margin: 5px; width: 290px; font-size: 12px; color: rgb(44, 45, 46); border: 1px solid rgb(230, 231, 232); background-color: rgba(253, 254, 255, .96); border-radius: 7px; box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, .05); outline: none;';
		this.elements.contents.innerHTML = `
			<div style="padding: 20px 20px 10px 20px; font-weight: bold; color: rgb(44, 45, 46); border-radius: 7px 7px 0 0; word-wrap: break-word; word-break: break-all;">
				<div style="margin-right: 2px; width: 7px; height: 7px; color: rgba(253, 254, 255, .96); background-color: rgba(231, 68, 78, .96); border-radius: 100%; display: inline-block;"></div>
				<div style="display: inline-block;" id="${key.title}">${this.settings.title}</div>
			</div>
			<div id="${key.message}" style="padding: 10px 20px; min-height: 45px; color: rgb(44, 45, 46); word-wrap: break-word; word-break: break-all;">${this.settings.message}</div>
			<div style="padding: 10px 20px 20px 20px; text-align: right; border-radius: 0 0 7px 7px;">
				<button id="${key.cancel}" style="margin: 0 0 0 10px; padding: 5px 10px; color: rgb(140, 141, 142); font-size: 12px; font-weight: bold; text-align: center; text-shadow: 0 1px #FFF; white-space: nowrap; vertical-align: middle; background-color: rgb(240, 241, 242); border: 0 none; border-radius: 5px; cursor: pointer; -webkit-touch-callout: none; -webkit-touch-select: none; user-select: none;">CANCEL</button>
				<button id="${key.ok}" style="margin: 0 0 0 10px; padding: 5px 10px; color: rgb(120, 121, 122); font-size: 12px; font-weight: bold; text-align: center; text-shadow: 0 1px #FFF; white-space: nowrap; vertical-align: middle; background-color: rgb(240, 241, 242); border: 0 none; border-radius: 5px; cursor: pointer; -webkit-touch-callout: none; -webkit-touch-select: none; user-select: none;">OK</button>
			</div>
		`;

		// container
		this.elements.container = document.createElement('div');
		this.elements.container.style.cssText = 'position: fixed; display: none; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; outline: none; -webkit-overflow-scrolling: touch; -khtml-user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-touch-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;';
		this.elements.container.appendChild(this.elements.contents);
		this.elements.confirm.appendChild(this.elements.container);

		// search element
		this.elements.title = this.elements.contents.querySelector(`#${key.title}`);
		this.elements.message = this.elements.contents.querySelector(`#${key.message}`);
		this.elements.cancel = this.elements.contents.querySelector(`#${key.cancel}`);
		this.elements.ok = this.elements.contents.querySelector(`#${key.ok}`);
    }

	event() {
		$(this.elements.cancel).on(`${browser.event.click}.${EVENT_CLICK_CANCEL}_${this.settings.key}`, (e) => {
			let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
			event.preventDefault();
			event.stopPropagation();
			this.cancel();
		});
		$(this.elements.ok).on(`${browser.event.click}.${EVENT_CLICK_OK}_${this.settings.key}`, (e) => {
			let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
			event.preventDefault();
			event.stopPropagation();
			this.ok();
		});
	}

	change(settings) {
		let key, tmp;

		try {
			for(key in settings) {
				switch(key) {
					case 'type':
					case 'key':
						break;
					case 'title':
						this.elements.title.textContent = settings[key] || 'Message';
						break;
					case 'message':
						//this.elements.message.textContent = settings[key] || '';
						this.elements.message.innerHTML = settings[key] || '';
						break;
					case 'listeners':
						for(tmp in settings[key]) {
							if(settings[key].hasOwnProperty(tmp)) {
								this.settings.listeners[tmp] = settings[key][tmp];
							}
						}
						break;
					default:
						if(key in this.settings) {
							this.settings[key] = settings[key];
						}
						break;
				}
			}
		}catch(e) {
			if(typeof this.settings.listeners.error === 'function') {
				this.settings.listeners.error.call(this, e);
			}
		}

		return this;
	}

	position() {
		try {
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

		// 실행되고 있는 최우선 modal 확인
		if(modalState.queue['wait'].length > 0 && modalState.queue['wait'][0] !== this.settings.key /* 순차 실행의 첫번째 요소 여부 */) {
			modalState.queue['wait'].push(this.settings.key);
			return;
		}

		try {
			size = windowDocumentSize();
			scroll = browserScroll();

			// 스크롤바 사이즈만큼 여백
			if(size.window.height < size.document.height) {
				$('html').css({'margin-right': `${browser.scrollbar}px`, 'overflow': 'hidden'});
			}

			// element
			this.above({'display': 'block'});
			this.position();

			// focus (웹접근성)
			modalState.active = document.activeElement;
			this.elements.container.setAttribute('tabindex', -1);
			this.elements.container.focus();

			// queue
			if(modalState.queue['order'].indexOf(this.settings.key) !== -1) { // 기존값 제거
				modalState.queue['order'].splice(modalState.queue['order'].indexOf(this.settings.key), 1);
			}
			modalState.queue['order'].push(this.settings.key);
			if(modalState.queue['wait'].indexOf(this.settings.key) === -1) {
				modalState.queue['wait'].push(this.settings.key);
			}

			// mousedown (사용자 터치영역 감시, modal 영역을 제외한 다른 영역 터치 이벤트 불가능)
			$(this.elements.container).on(`${browser.event.down}.${EVENT_MOUSEDOWN}_${this.settings.key}`, (e) => {
				let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				//if(event.target && (this.elements.container.isEqualNode(event.target) || !this.elements.contents.contains(event.target)) {
				if(event.target && !this.elements.contents.contains(event.target)) {
					event.preventDefault(); // 기본이벤트 정지
					event.stopPropagation(); // 상위 전파 방지
					event.stopImmediatePropagation(); // 상위 전파 + 같은 레벨 이벤트 전파 방지 (하나의 element에 여러개의 이벤트)
					return false; // jQuery stop
				}
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

			// element
			this.elements.container.style.display = 'none';
			if(this.settings.mask === true || (this.settings.mask && typeof this.settings.mask === 'object' && this.settings.mask.nodeType)) {
				this.elements.mask.style.display = 'none';
			}

			// focus (웹접근성)
			if(modalState.active) {
				modalState.active.focus();
			}

			// queue
			modalState.removeQueue(this.settings.key); // 기존값 제거

			// mousedown
			$(this.elements.container).off(`${browser.event.down}.${EVENT_MOUSEDOWN}_${this.settings.key}`);

			// listeners
			if(typeof this.settings.listeners.hide === 'function') {
				return this.settings.listeners.hide.call(this);
			}
			if(typeof callback === 'function') {
				callback.call(this);
			}
		}catch(e) {
			if(typeof this.settings.listeners.error === 'function') {
				this.settings.listeners.error.call(this, e);
			}
		}

		// 다음 실행할 최우선 modal 확인
		(function loop() {
			if(modalState.queue['wait'].length > 0) {
				if(!modalState.instance[modalState.queue['wait'][0]]) {
					// wait 에는 존재하나 instance 에는 존재하지 않는 것
					modalState.queue['wait'].shift();
					loop(); // 재귀
				}else if(typeof modalState.instance[modalState.queue['wait'][0]].show === 'function') {
					modalState.instance[modalState.queue['wait'][0]].show();
				}
			}
		})();
	}

	remove({ callback, }={}) {
		try {
			// 스크롤바 관련 (닫을 때 document 사이즈가 변경되었을 수 있기 때문에 if(조건문) 검사를 안한다.)
			$('html').css({'margin-right': modalState.defaultStyle['margin-right'], 'overflow': modalState.defaultStyle['overflow']});

			// element
			if(this.elements.mask) {
				this.elements.mask.parentNode.removeChild(this.elements.mask);
			}
			if(this.elements.container) {
				this.elements.container.parentNode.removeChild(this.elements.container);
			}
			this.elements = {};

			// queue
			modalState.removeQueue(this.settings.key); // 기존값 제거

			// instance
			modalState.removeInstance(this.settings.key);

			// mousedown
			$(this.elements.container).off(`${browser.event.down}.${EVENT_MOUSEDOWN}_${this.settings.key}`);

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

		// 다음 실행할 최우선 modal 확인
		(function loop() {
			if(modalState.queue['wait'].length > 0) {
				if(!modalState.instance[modalState.queue['wait'][0]]) {
					// wait 에는 존재하나 instance 에는 존재하지 않는 것
					modalState.queue['wait'].shift();
					loop(); // 재귀
				}else if(typeof modalState.instance[modalState.queue['wait'][0]].show === 'function') {
					modalState.instance[modalState.queue['wait'][0]].show();
				}
			}
		})();
	}

	cancel() {
		this.hide();
		// listeners
		if(typeof this.settings.listeners.cancel === 'function') {
			return this.settings.listeners.cancel.call(this);
		}
	}

	ok() {
		this.hide();
		// listeners
		if(typeof this.settings.listeners.ok === 'function') {
			return this.settings.listeners.ok.call(this);
		}
	}
}