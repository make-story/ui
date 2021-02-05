/**
 * 에디터, 커서 등 상태
 */
import $ from '../dom';
import {
	setSettings,
	getDisplay,
	getParent,
	getNodeInfo,
	isNodeCheck,
} from './util';
import {
	getKey,
} from '../util';

// 싱글톤 패턴
export default class EditState {
	constructor() {
		const EVENT_COMPOSITIONSTART_TEXTEDIT = 'EVENT_COMPOSITIONSTART_TEXTEDIT';
		const EVENT_COMPOSITIONEND_TEXTEDIT = 'EVENT_COMPOSITIONEND_TEXTEDIT';

		// 선택된 텍스트 (window.getSelection())
		this.selection; 

		// 한글입력관련
		this.composition = false;
		$(document).off(`.${EVENT_COMPOSITIONSTART_TEXTEDIT}`).on(`compositionstart.${EVENT_COMPOSITIONSTART_TEXTEDIT}`, () => {
			this.composition = true;
		});
		$(document).off(`.${EVENT_COMPOSITIONEND_TEXTEDIT}`).on(`compositionend.${EVENT_COMPOSITIONEND_TEXTEDIT}`, () => {
			this.composition = false;
		});
	}

	// selection
	// 크로스 브라우저 대응 필요
	setSelection() {
		this.selection = window.getSelection();
	}

	// anchorNode(선택된 글자의 시작노드), focusNode(현재 포커스가 위치한 끝노드) 선택여부
	isSelection() {
		let is = false;
		if(typeof this.selection === 'object' && this.selection !== null && this.selection.anchorNode && this.selection.focusNode) {
			is = true;
		}
		return is;
	}

	// 셀렉션의 시작지점과 끝지점이 동일한지의 여부 (드래그로 선택된 것이 없을 경우 false 반환)
	isCollapsed() {
		let is = false;
		if(typeof this.selection === 'object' && this.selection !== null) {
			is = this.selection.isCollapsed;
		}
		return is;
	}

	// 선택된 range 영역 
	// 크로스 브라우저 대응 필요
	/*
	드래그로 선택된 영역 조각
	Range 인터페이스는 노드와 텍스트 노드를 포함한 문서의 일부(fragment)이다.
	'문서의 특정 부분’을 정의하는 것이라 생각하면 쉽다.
	*/
	getRange(index) {
		let range;
		if(typeof this.selection === 'object' && this.selection !== null && this.selection.rangeCount > 0) { // rangeCount 는 커서 자체도 하나의 range 로 본다.
			// this.selection.rangeCount
			range = this.selection.getRangeAt(index || 0);
		}
		return range;
	}

	// 커서
	setCusor(node) {
		let range, position;

		if(node && typeof node === 'object' && node.nodeType) {
			//console.log('커서');
			//console.log(node);

			//position = this.selection.getRangeAt(0).focusOffset;
			range = document.createRange(); // 크로스 브라우저 대응 작업해야 한다.
			range.setStart(node, 0);
			range.setEnd(node, 0);
			range.collapse(true);
			this.selection.removeAllRanges();
			this.selection.addRange(range);
		}
	}

	// 현재 선택된 글자에 블록태그(파라미터의 tag)를 설정한다.
	setFormatBlock(tag) {
		if(typeof tag === 'string') {
			if(this.isSelection() && this.getRange() && getParent( // 추가하려는 tag가 현재 포커스노드 부모(상위)에 존재하는지 확인
				this.selection.focusNode,
				null,
				(node) => {
					return node.nodeName.toLowerCase() === tag.toLowerCase();
				},
				(node, result) => {
					return node;
				}
			)) {
				document.execCommand("formatBlock", false, "p");
				document.execCommand("outdent"); // 문자 선택(text selection)의 현위치에서 들어쓰기 한 증가분 만큼 왼쪽으로 내어쓰기 한다.
			}else {
				document.execCommand("formatBlock", false, tag);
			}
		}
	}
}