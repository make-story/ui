/**
 * 모달들의 zindex 등 공통 상태 관리
 */
import browser from '../browser';
import $ from '../dom';

export default class ModalState {
	constructor() {
		// 팝업 z-index 관리
		this.zindex = 10;

		// 현재 포커스 위치
		this.active = document.activeElement;

		// attribute
		this.attributePrefix = 'data-modal';

		// 현재 설정된 기본 Style
		this.defaultStyle = (function() {
			const html = document.querySelector('html') || document.documentElement;
			const style = window.getComputedStyle(html);
			return {
				'margin-right': style.marginRight || 0, // document.documentElement.style.marginRight
				'overflow': style.overflow || 'visible', // document.documentElement.style.overflow
				'position': style.position || 'static' // document.documentElement.style.position
			};
		})();

		// 실행 큐
		this.queue = {
			// 현재 show 되어있는 모달 순서
			'order': [],
			// 순차적으로 실행 (confirm, alert)
			'wait': [],
		};

		// 실행중인 인스턴스
		this.instance = {};
	}

	container() {
		// container
		let container = document.querySelector(`[${this.attributePrefix}-container]`);
		if(!container) {
			container = document.createElement('div');
			container.setAttribute(`${this.attributePrefix}-container`, 'container');
			container.style.cssText = 'z-index: 2147483647;'; // z-index 최대값: 2147483647
			document.body.appendChild(container);
		}
		return container;
	}

	mask() {
		// mask
		let mask = document.createElement('div');
		mask.style.cssText = 'position: fixed; display: none; left: 0px; top: 0px; width: 100%; height: 100%; background: rgb(250, 251, 252) none repeat scroll 0 0; opacity: .96; -khtml-user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-touch-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;';
		return mask;
	}

	removeQueue(key) {
		if(!key) {
			return false;
		}
		if(this.queue.order.indexOf(key) !== -1) { // 기존값 제거
			this.queue.order.splice(this.queue.order.indexOf(key), 1);
		}
		if(this.queue.wait.indexOf(key) !== -1) {
			this.queue.wait.splice(this.queue.wait.indexOf(key), 1);
		}
	}

	removeInstance(key) {
		if(key && this.instance[key]) {
			delete this.instance[key];
		}
	}
}

const modalState = new ModalState();
export { modalState }