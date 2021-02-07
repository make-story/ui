/**
 * 메시지 알림
 */
import browser, { windowDocumentSize, browserScroll, } from '../browser';
import $ from '../dom';
import { getKey, extend, elementPosition, elementOverlap, } from '../util';
import ModalState from "./ModalState";

const EVENT_CLICK_CLOSE = 'EVENT_CLICK_CLOSE';

export default class ModalMessage extends ModalState {
	constructor(settings={}) {
		super();
		this.settings = {
			'key': '',
			'position': 'topright',
			'mask': null, // 값이 있으면 해당 mask element 를 실행한다.
			'listeners': {
				'show': null,
				'hide': null,
				'remove': null,
				'error': null
			},
			'theme:': {}, // 테마 (스타일 변경)
			'title': 'Message',
			'message': '',
			'time': 0, // 0 보다 큰 값은 자동닫기 설정
		};
		this.settings = extend(this.settings, settings);
		this.elements = {};
		this.time = null;

		// render
		this.render();

		// event
		$(this.elements.close).on(`${browser.event.click}.${EVENT_CLICK_CLOSE}_${this.settings.key}`, (e) => {
			let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
			event.preventDefault();
			event.stopPropagation();
			//this.hide();
			this.remove();
		});
	}

	render() {
		// key
		const key = {
			title: getKey(),
			message: getKey(),
			close: getKey(),
		};

		// container
		this.elements.container = super.container();

		// message
		let message = document.querySelector(`[${this.attributePrefix}-message]`);
		if(!message) {
			message = document.createElement('div');
			message.setAttribute(`${this.attributePrefix}-message`, 'message');
			//message.style.cssText = 'position: fixed; left: 0px; top: 0px;';
			this.elements.container.appendChild(message);
		}
		this.elements.message = message;

		// mask
		if(this.settings.mask && typeof this.settings.mask === 'object') {
			this.elements.mask = this.settings.mask.nodeType ? this.settings.mask : $(this.settings.mask).get(0);
			this.elements.mask.display = 'none';
		}else {
			this.elements.mask = super.mask();
			this.elements.message.appendChild(this.elements.mask);
		}

		// contents
		this.elements.contents = document.createElement('div');
		this.elements.contents.setAttribute(`${this.attributePrefix}-message-contents`, 'contents');
		this.elements.contents.style.cssText = 'position: fixed; display: none; margin: 5px; width: 290px; font-size: 12px; color: rgb(44, 45, 46); border: 1px solid rgb(230, 231, 232); background-color: rgba(253, 254, 255, .96); border-radius: 7px; box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, .05); outline: none; -khtml-user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-touch-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;';
		this.elements.contents.innerHTML = `
			<div style="padding: 15px 15px 5px 15px; font-weight: bold; color: rgb(44, 45, 46); border-radius: 7px 7px 0 0; word-wrap: break-word; word-break: break-all;">
				<div style="margin-right: 2px; width: 7px; height: 7px; color: rgba(253, 254, 255, .96); background-color: rgba(231, 68, 78, .96); border-radius: 100%; display: inline-block;"></div>
				<div style="display: inline-block;" id="${key.title}">${this.settings.title}</div>
			</div>
			<div id="${key.message}" style="padding: 5px 15px 15px 15px; color: rgb(44, 45, 46); border-radius: 7px; word-wrap: break-word; word-break: break-all;">${this.settings.message}</div>
			<div style="position: absolute; top: 10px; right: 15px;">
				<button id="${key.close}" style="margin: 0; padding: 0; color: rgb(120, 121, 122); font-size: 12px; font-weight: bold; text-align: center; text-shadow: 0 1px #FFF; white-space: nowrap; vertical-align: middle; background-color: transparent; border: 0 none; cursor: pointer; -webkit-touch-callout: none; -webkit-touch-select: none; user-select: none;">CLOSE</button>
			</div>
		`;
		this.elements.message.appendChild(this.elements.contents);

		// search element
		this.elements.title = this.elements.contents.querySelector(`#${key.title}`);
		this.elements.message = this.elements.contents.querySelector(`#${key.message}`);
		this.elements.close = this.elements.contents.querySelector(`#${key.close}`);
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
				this.elements.mask.style.zIndex = ++this.zindex;
				if(display) {
					this.elements.mask.style.display = display;
				}
			}
			this.elements.contents.style.zIndex = ++this.zindex;
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

			// 서로 겹치지 않도록 제어
			elementOverlap(this.elements.contents, Array.from(document.querySelectorAll(`[${this.attributePrefix}-message-contents]`)).reverse(), this.settings.position, { isBrowserOverflow: false, });

			// auto hide
			global.clearTimeout(this.time);
			if(typeof this.settings.time === 'number' && this.settings.time > 0) {
				this.time = global.setTimeout(() => {
					this.hide();
				}, this.settings.time);
			}

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

			// listeners
			if(typeof this.settings.listeners.remove === 'function') {
				this.settings.listeners.remove.call(this);
			}
			if(typeof callback === 'function') {
				callback.call(this);
			}

			// desctructor 소멸자 실행해야함..
			delete this;
		}catch(e) {
			if(typeof this.settings.listeners.error === 'function') {
				this.settings.listeners.error.call(this, e);
			}
		}
	}
}