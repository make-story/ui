/**
 * 모달들의 zindex 등 관리
 */
import browser from '../browser';
import $ from '../dom';

export default class ModalState {
	constructor() {
		// 팝업 z-index 관리
		this.zindex = 0;

		// 현재 포커스 위치
		this.active;

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
	}
}