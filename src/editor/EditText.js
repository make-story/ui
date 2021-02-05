/**
 * Text 에디터
 * 
 * [주의!]
 * super 키워드는 부모 constructor 호출과 부모 메소드 호출할 경우 사용
 * super 키워드는 화살표함수 활용
 */
import browser from '../browser';
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
import EditState from './EditState';

export default class EditText extends EditState {
	constructor(target=null, settings={}) {
		super();
		this.settings = {
			'key': 'editor', 
			'tooltip': true,
			'classes': {
				'link': 'editor-text-link' // a 태그에 적용될 class 속성값
			},
			'listeners': {
				'initialize': null
			}
		};
		this.elements = {
			'target': null,
			'tooltip': null,
			'command': {
				'wrap': null
			},
			'other': {
				'wrap': null
			}
		};
		this.range; // selection 된 range(범위)
		this.time = null;

		// settings
		this.setSettings(target, settings);

		// render 
		this.setRender();
	}

	setSettings(target=null, settings={}) {
		// settings
		this.settings = setSettings(this.settings, settings);

		// target
		target = (typeof target === 'string' && /^[a-z]+/i.test(target) ? `#${target}` : target);
		this.elements.target = (typeof target === 'object' && target.nodeType ? target : $(target).get(0));
	}

	setRender() {
		// element 생성
		let fragment = document.createDocumentFragment();
		let button;

		// 툴바
		this.elements.tooltip = document.createElement("div");
		this.elements.tooltip.style.cssText = 'transition: all .05s ease-out; position: absolute; color: rgb(44, 45, 46); background-color: rgba(255, 255, 255, .96); display: none;';
		this.elements.tooltip.appendChild(this.elements.command.wrap = document.createElement("div"));
		this.elements.tooltip.appendChild(this.elements.other.wrap = document.createElement("div"));
		fragment.appendChild(this.elements.tooltip);

		// 에디터 버튼
		button = document.createElement('button');
		button.style.cssText = 'padding: 0px; width: 30px; height: 30px; font-size: 14px; color: rgb(44, 45, 46); background: none; border: 0px; outline: none; cursor: pointer; -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;';
		this.elements.command.wrap.appendChild(this.elements.command.h1 = ((button) => {
			button.storage = {
				'command': 'h1'
			};
			button.onmousedown = (e) => this.setTextTooltipMousedown(e); 
			button.onmouseup = (e) => this.setTextTooltipMouseup(e);
			button.textContent = 'H1';
			return button;
		})(button.cloneNode()));
		this.elements.command.wrap.appendChild(this.elements.command.h2 = ((button) => {
			button.storage = {
				'command': 'h2'
			};
			button.onmousedown = (e) => this.setTextTooltipMousedown(e); 
			button.onmouseup = (e) => this.setTextTooltipMouseup(e);
			button.textContent = 'H2';
			return button;
		})(button.cloneNode()));
		this.elements.command.wrap.appendChild(this.elements.command.h3 = ((button) => {
			button.storage = {
				'command': 'h3'
			};
			button.onmousedown = (e) => this.setTextTooltipMousedown(e); 
			button.onmouseup = (e) => this.setTextTooltipMouseup(e);
			button.textContent = 'H3';
			return button;
		})(button.cloneNode()));
		this.elements.command.wrap.appendChild(this.elements.command.bold = ((button) => {
			button.storage = {
				'command': 'bold'
			};
			button.onmousedown = (e) => this.setTextTooltipMousedown(e); 
			button.onmouseup = (e) => this.setTextTooltipMouseup(e);
			button.textContent = 'B';
			button.style.fontWeight = 'bold';
			return button;
		})(button.cloneNode()));
		this.elements.command.wrap.appendChild(this.elements.command.italic = ((button) => {
			button.storage = {
				'command': 'italic'
			};
			button.onmousedown = (e) => this.setTextTooltipMousedown(e); 
			button.onmouseup = (e) => this.setTextTooltipMouseup(e);
			button.textContent = 'I';
			button.style.fontStyle = 'italic';
			return button;
		})(button.cloneNode()));
		this.elements.command.wrap.appendChild(this.elements.command.strikethrough = ((button) => {
			button.storage = {
				'command': 'strikethrough'
			};
			button.onmousedown = (e) => this.setTextTooltipMousedown(e); 
			button.onmouseup = (e) => this.setTextTooltipMouseup(e);
			button.textContent = 'S';
			button.style.textDecoration = 'line-through';
			return button;
		})(button.cloneNode()));
		this.elements.command.wrap.appendChild(this.elements.command.underline = ((button) => {
			button.storage = {
				'command': 'underline'
			};
			button.onmousedown = (e) => this.setTextTooltipMousedown(e);
			button.onmouseup = (e) => this.setTextTooltipMouseup(e);
			button.textContent = 'U';
			button.style.textDecoration = 'underline';
			return button;
		})(button.cloneNode()));
		this.elements.command.wrap.appendChild(this.elements.command.blockquote = ((button) => {
			button.storage = {
				'command': 'blockquote'
			};
			button.onmousedown = (e) => this.setTextTooltipMousedown(e); 
			button.onmouseup = (e) => this.setTextTooltipMouseup(e);
			button.textContent = '"';
			return button;
		})(button.cloneNode()));
		this.elements.command.wrap.appendChild(this.elements.command.createLink = ((button) => {
			button.storage = {
				'command': 'createLink'
			};
			button.onmousedown = (e) => this.setTextTooltipMousedown(e); 
			button.onmouseup = (e) => this.setTextTooltipMouseup(e);
			button.textContent = '#';
			
			// option
			this.elements.other.link = {};
			this.elements.other.link.wrap = document.createElement("div"); // link option box
			this.elements.other.link.input = document.createElement("input");
			this.elements.other.link.wrap.appendChild(this.elements.other.link.input);
			this.elements.other.wrap.appendChild(this.elements.other.link.wrap);
			// style
			this.elements.other.link.wrap.style.cssText = 'display: none;';
			this.elements.other.link.input.style.cssText = 'margin: 0; padding: 0; width: 100%;';
			// event
			this.elements.other.link.input.onblur = (e) => {
				this.setTextTooltipLinkBlur(e);
			};
			this.elements.other.link.input.onkeydown = (e) => {
				this.setTextTooltipLinkKeydown(e);
			};
			return button;
		})(button.cloneNode()));

		// body 삽입
		document.body.appendChild(fragment);
	}

	/*
	 * 인스턴스 생성시 메모리 관리를 위해 
	 * this 내부 함수로 두지 않고 스코프체이닝을 이용한 별도 함수로 
	 * 외부에 선언했음
	 */
	// 에디터 버튼 mousedown 이벤트 (에디터 기능을 선택영역에 적용)
	setTextTooltipMousedown(e) {
		let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
		let self = event && event.currentTarget; // event listener element
		let target = event && (event.target || event.srcElement); // event 가 발생한 element
		let command = target.storage.command; // 버튼의 기능 종류

		event.preventDefault(); // 현재 이벤트의 기본 동작을 중단한다.
		event.stopPropagation(); // 현재 이벤트가 상위로 전파되지 않도록 중단한다.

		if(super.getRange()) {
			//console.log('에디터 기능 적용');
			switch(command) {
				case 'bold':
					if(this.selection.anchorNode && !getParent(
						this.selection.anchorNode,
						null,
						(node) => { // condition (검사)
							return /^(h1|h2|h3)$/i.test(node.nodeName.toLowerCase()); // h1, h2, h3 태그는 진한색의 글자이므로 제외
						}, 
						(node, result) => { // callback (검사결과가 true의 경우)
							return true;
						}
					)) {
						document.execCommand('bold', false);
					}
					break;
				case 'italic':
					document.execCommand('italic', false);
					break;
				case 'strikethrough':
					document.execCommand('strikethrough', false);
					break;
				case 'underline':
					document.execCommand('underline', false);
					break;
				case "h1":
				case "h2":
				case "h3":
					if(this.selection.focusNode && !getParent(
						this.selection.focusNode,
						null,
						(node) => { // condition (검사)
							return /^(b|strong)$/i.test(node.nodeName.toLowerCase()); 
						}, 
						(node, result) => { // callback (검사결과가 true의 경우)
							return true;
						}
					)) {
						super.setFormatBlock(command);
					}
					break;
				case "blockquote": // 인용문 (들여쓰기)
					super.setFormatBlock(command);
					break;
				case 'createLink':
					// url 입력박스 보이기
					this.elements.other.link.wrap.style.display = 'block';
					setTimeout(() => {
						let url = getParent(
							this.selection.focusNode,
							null,
							(node) => {
								return typeof node.href !== 'undefined';
							},
							(node, result) => {
								return node.href;
							}
						);
						// 선택된(셀렉) 곳에 a 태그 존재 확인
						if(typeof url !== "undefined") { // 이미 a 태그 생성되어 있음
							this.elements.other.link.input.value = url;
						}else { // 신규 a 태그 생성
							this.elements.other.link.input.value = '';
							//document.execCommand("createLink", false, '#none');
						}
						// 위 a 태그의 위치를 기억한다.
						// execCommand 로 createLink 생성된 위치를 기억한다.
						this.range = this.selection.getRangeAt(0); 
						this.elements.other.link.input.focus();
					}, 100);
					break;
			}
		}
	}

	// 에디터 버튼 mouseup 이벤트
	setTextTooltipMouseup(e) {
		let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
		let self = event && event.currentTarget; // event listener element
		let target = event && (event.target || event.srcElement); // event 가 발생한 element

		event.preventDefault(); // 현재 이벤트의 기본 동작을 중단한다.
		event.stopPropagation(); // 현재 이벤트가 상위로 전파되지 않도록 중단한다.

		setTimeout(() => {
			// setSelection 함수는 isContentEditable 검수하므로 호출하지 않는다
			this.setTextTooltipMenuState();
			this.setTextTooltipMenuPostion(); // h1, h2, h3 등 적용에 따라 툴바위치가 변경되어야 할 경우가 있다.
		}, 1);
	}

	// 에디터 링크 input blur 이벤트
	setTextTooltipLinkBlur(e) {
		let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
		let url = this.elements.other.link.input.value;
		let node;

		if(url) {
			if(!url.match("^(http://|https://|chrome://|mailto:)")) {
				url = `http://${url}`;
			}
			//document.execCommand('createLink', false, url);

			// a태그 생성
			node = document.createElement('a');
			node.className = this.settings.classes.link;
			node.href = url;
			node.target = '_blank';
			node.textContent = node.innerText = this.range.toString() || url;
			node.storage = {
				'edit': 'text'
			};

			// 기억해둔 위치(range)의 값을 변경한다.
			// replace selected text
			// http://stackoverflow.com/questions/3997659/replace-selected-text-in-contenteditable-div
			this.range.deleteContents();
			this.range.insertNode(node);
			this.selection.removeAllRanges();
			this.selection.addRange(this.range);
		}else {
			this.selection.removeAllRanges();
			this.selection.addRange(this.range);
			document.execCommand('unlink', false);
			//node = document.createTextNode(this.range.toString());
		}
		
		// url 입력박스 숨기기
		this.elements.other.link.wrap.style.display = 'none';

		// 툴팁
		this.setTextTooltipMenuState();
		this.setTextTooltipMenuPostion();
	}

	// 에디터 링크 input keydown 이벤트
	setTextTooltipLinkKeydown(e) {
		let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event

		if(e.keyCode === 13) {
			e.preventDefault();
			this.elements.other.link.input.blur(); // trigger blur
		}
	}

	// 텍스트 에디터 툴바 메뉴(각 기능) 현재 selection 에 따라 최신화
	setTextTooltipMenuState() {
		//console.log('setTextTooltipMenuState');
		/*
		현재 포커스 위치의 element 에서 부모(parentNode)노드를 검색하면서,
		텍스트 에디터메뉴에 해당하는 태그가 있는지 여부에 따라
		해당 버튼에 on/off 효과를 준다.
		*/
		let key;
		if(super.isSelection() && super.getRange()) {
			for(key in this.elements.command) { // 버튼 선택 효과 초기화
				if(key === 'wrap') {
					continue;
				}
				//this.elements.command[key].classList.remove('active');
				this.elements.command[key].style.color = 'rgb(44, 45, 46)';
				this.elements.command[key].style.background = 'none';
			}
			// 현재노드 상위 검색
			getParent(
				this.selection.focusNode,
				null,
				(node) => {
					return typeof node.nodeName !== 'undefined' && typeof node.style !== 'undefined';
				},
				(node, result) => {
					//console.log(node.nodeName.toLowerCase());
					// style 확인
					/*
					let key;
					for(key in node.style) {
						console.log('node style: ' + key);
						switch(node.style) {

						}	
					}
					*/
					
					// tag 확인
					switch(node.nodeName.toLowerCase()) {
						case 'b':
						case 'strong': // IE
							this.elements.command.bold.style.color = 'rgb(255, 255, 255)';
							this.elements.command.bold.style.backgroundColor = 'rgb(226, 69, 69)';
							break;
						case 'i':
						case 'em': // IE
							this.elements.command.italic.style.color = 'rgb(255, 255, 255)';
							this.elements.command.italic.style.backgroundColor = 'rgb(226, 69, 69)';
							break;
						case 'strike':
							this.elements.command.strikethrough.style.color = 'rgb(255, 255, 255)';
							this.elements.command.strikethrough.style.backgroundColor = 'rgb(226, 69, 69)';
							break;
						case 'u':
							this.elements.command.underline.style.color = 'rgb(255, 255, 255)';
							this.elements.command.underline.style.backgroundColor = 'rgb(226, 69, 69)';
							break;
						case "h1":
							this.elements.command.h1.style.color = 'rgb(255, 255, 255)';
							this.elements.command.h1.style.backgroundColor = 'rgb(226, 69, 69)';
							break;
						case "h2":
							this.elements.command.h2.style.color = 'rgb(255, 255, 255)';
							this.elements.command.h2.style.backgroundColor = 'rgb(226, 69, 69)';
							break;
						case "h3":
							this.elements.command.h3.style.color = 'rgb(255, 255, 255)';
							this.elements.command.h3.style.backgroundColor = 'rgb(226, 69, 69)';
							break;
						case "blockquote":
							this.elements.command.blockquote.style.color = 'rgb(255, 255, 255)';
							this.elements.command.blockquote.style.backgroundColor = 'rgb(226, 69, 69)';
							break;
						case 'a':
							this.elements.command.createLink.style.color = 'rgb(255, 255, 255)';
							this.elements.command.createLink.style.backgroundColor = 'rgb(226, 69, 69)';
							break;
					}
				}
			);
		}
	}

	// 텍스트 에디터 툴바 위치 설정 (보이기/숨기기)
	setTextTooltipMenuPostion({ toggle, }={}) {
		//console.log('setTextTooltipMenuPostion');
		let rect;
		let tooltip = {
			'width': 0,
			'height': 0
		};
		let top = 0, left = 0;

		if(super.isCollapsed() || typeof this.selection !== 'object' || toggle === 'hide') {
			// 툴바숨기기
			this.elements.tooltip.style.display = "none";
		}else if(super.getRange()) {
			this.elements.tooltip.style.display = "block"; // 렌더링 상태에서 offsetWidth, offsetHeight 측정
			// 툴팁 크기
			tooltip.width = this.elements.tooltip.offsetWidth;
			tooltip.height = this.elements.tooltip.offsetHeight;
			// top / left
			rect = this.selection.getRangeAt(0).getBoundingClientRect();
			top = (rect.top - tooltip.height) - 5;
			if(top < 0) {
				top = rect.bottom + 5; // 툴팁 하단에 출력되도록 변경
				this.elements.tooltip.style.borderTop = '1px solid rgba(231, 68, 78, .86)';
				this.elements.tooltip.style.borderBottom = 'none';
			}else {
				this.elements.tooltip.style.borderBottom = '1px solid rgba(231, 68, 78, .86)';
				this.elements.tooltip.style.borderTop = 'none';
			}
			top += window.pageYOffset; // scroll
			left = Math.round((rect.left + rect.right) / 2);
			left -= Math.floor(tooltip.width / 2);
			if(left < 0) {
				left = 0;
			}else if((left + tooltip.width) > Math.max(document.body.scrollWidth, document.documentElement.scrollWidth, document.body.offsetWidth, document.documentElement.offsetWidth, document.documentElement.clientWidth)) {
				left = left - ((left + tooltip.width) - Math.max(document.body.scrollWidth, document.documentElement.scrollWidth, document.body.offsetWidth, document.documentElement.offsetWidth, document.documentElement.clientWidth));
			}
			left += window.pageXOffset; // scroll
			//
			this.elements.tooltip.style.top = `${top}px`;
			this.elements.tooltip.style.left = `${left}px`;
		}
	}

	// 툴팁 보이기
	setTooltipToggle({ node, nodeInfo, }={}) {
		// 텍스트 / 멀티미디어 툴팁 중 하나만 보여야 한다.
		super.setSelection();
		if(!node || typeof node !== 'object' || !node.nodeType) {
			if(nodeInfo && typeof nodeInfo === 'object' && nodeInfo.node) {
				node = nodeInfo.node;
			}else {
				//node = this.selection.anchorNode; // 선택된 글자의 시작노드
				node = this.selection.focusNode; // 현재 포커스가 위치한 끝노드
			}
		}
		if(node && (!nodeInfo || typeof nodeInfo !== 'object')) {
			nodeInfo = getNodeInfo(node);
		}
		if(this.settings.tooltip === true) {
			if(super.isSelection() && (!this.elements.target.contains(node) || /figure|img/.test(nodeInfo.name))) {
				console.log('node', node);
				console.log('nodeInfo', nodeInfo);

				/*console.log('----------');
				console.dir(this.selection);
				// 시작노드
				console.log('anchorNode.nodeName: ' + this.selection.anchorNode.nodeName);
				console.log('anchorNode.nodeValue: ' + this.selection.anchorNode.nodeValue);
				console.log('anchorNode.nodeType: ' + this.selection.anchorNode.nodeType);
				// 끝노드
				console.log('focusNode.nodeName: ' + this.selection.focusNode.nodeName);
				console.log('focusNode.nodeValue: ' + this.selection.focusNode.nodeValue);
				console.log('focusNode.nodeType: ' + this.selection.focusNode.nodeType);*/
				
				this.setTextTooltipMenuPostion({'toggle': 'hide'});
			}else {
				this.setTextTooltipMenuPostion();
			}
			this.setTextTooltipMenuState();
		}else {
			this.setTextTooltipMenuPostion({'toggle': 'hide'});
		}
	}

	on() {
		// reset
		this.off();

		// contentEditable
		//console.log(this.elements.target);
		//console.log(this.elements.target.contentEditable);
		//console.log(this.elements.target.isContentEditable);
		if(!this.elements.target.isContentEditable) {
			this.elements.target.contentEditable = true; // 해당 element 내부 수정가능하도록 설정
		}

		// 마우스 이벤트
		$(document).on(`${browser.event.down}.EVENT_MOUSEDOWN_TEXTEDIT`, (e) => {
			let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
			let self = event && event.currentTarget; // event listener element
			let target = event && (event.target || event.srcElement); // event 가 발생한 element

			super.setSelection();
			this.setTooltipToggle();
		});
		$(document).on(`${browser.event.up}.EVENT_MOUSEUP_TEXTEDIT`, (e) => {
			let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
			let self = event && event.currentTarget; // event listener element
			let target = event && (event.target || event.srcElement); // event 가 발생한 element

			super.setSelection();
			this.setTooltipToggle();
		});
		
		// 키보드 이벤트
		$(this.elements.target).on('keydown.EVENT_KEYDOWN_TEXTEDIT', (e) => {
			//console.log('setContenteditableKeydown');
			let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event

			//console.log('keydown');
			super.setSelection();

			// getSelection 선택된 node
			if(super.isSelection()) {
				/*if(event.keyCode === 13) { // keyCode 13: enter
					// 현재노드 상위 검색
					getParent( 
						this.selection.anchorNode,
						this.elements.target,
						(node) => {
							switch(node.nodeName.toLowerCase()) {
								case 'p':

									break;
								default:
									return this.elements.target.isEqualNode(node);
									break;
							}
						},
						(node, result) => {
							return node;
						}
					);
				}*/
			}
		});
		$(this.elements.target).on('keyup.EVENT_KEYUP_TEXTEDIT', (e) => {
			//console.log('setContenteditableKeyup');
			let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
			let insertedNode, unwrap, node, parent;

			//console.log('keyup');
			super.setSelection();

			// getSelection 선택된 node
			if(super.isSelection()) {
				if(event.keyCode === 13) { // keyCode 13: enter
					if(this.selection.anchorNode && this.elements.target.isEqualNode(this.selection.anchorNode)) {
						// editor
						super.setFormatBlock("p");
					}else if(this.selection.anchorNode.nodeType !== 1 || this.selection.anchorNode.nodeName.toLowerCase() !== 'p' || !(/block|inline-block/i.test(getDisplay(this.selection.anchorNode)))) {
						// DIV 내부에서 엔터를 눌렀을 경우 div 내부에서 br로 처리되므로 p 태그로 변경되도록 처리한다.
						// 현재노드 상위 검색
						if(getParent( 
							this.selection.anchorNode,
							this.elements.target,
							(node) => {
								if(/code|pre/.test(node.nodeName.toLowerCase())) {
									return true;
								}
							},
							(node, result) => {
								return result;
							}
						) !== true) {
							super.setFormatBlock("p");
						}
					}
				}

				// -, *, 1. 입력에 따른 목록태그 변환
				// isCollapsed: 셀렉션의 시작지점과 끝지점이 동일한지의 여부
				// nodeValue: Text와 Comment 노드에서 실제 텍스트 문자열 추출
				/*if(this.selection.isCollapsed && this.selection.anchorNode.nodeValue && this.selection.anchorNode.parentNode.nodeName !== "LI") { 
					//console.log('this.selection.isCollapsed: ' + this.selection.isCollapsed);
					
					if(this.selection.anchorNode.nodeValue.match(/^[-*]\s/)) { 
						// "- 텍스트작성" 또는 "* 텍스트작성" 행태로 글을 작성했을 경우 목록태그로 변경
						document.execCommand('insertUnorderedList'); // ul 태그 생성
						this.selection.anchorNode.nodeValue = this.selection.anchorNode.nodeValue.substring(2);
						insertedNode = getParent( // 현재노드 상위로 존재하는 ul 태그 반환
							this.selection.anchorNode,
							null,
							(node) => {
								return node.nodeName.toLowerCase() === 'ul';
							},
							(node, result) => {
								return node;
							}
						);
					}else if(this.selection.anchorNode.nodeValue.match(/^1\.\s/)) { 
						// "1. 텍스트작성" 형태로 글을 작성했을 경우 목록태그로 변경
						document.execCommand('insertOrderedList'); // ol 태그 생성
						this.selection.anchorNode.nodeValue = this.selection.anchorNode.nodeValue.substring(3);
						insertedNode = getParent( // 현재노드 상위로 존재하는 ol 태그 반환
							this.selection.anchorNode,
							null,
							(node) => {
								return node.nodeName.toLowerCase() === 'ol';
							},
							(node, result) => {
								return node;
							}
						);
					}

					// ul 또는 ol 로 변경되었고, 현재 부모 태그가 p 또는 div 의 경우
					// p 또는 div 내부에 목록태그가 존재하지 않도록, 해당위치를 목록태그로 대체한다.
					unwrap = insertedNode && ["ul", "ol"].indexOf(insertedNode.nodeName.toLocaleLowerCase()) >= 0 && ["p", "div"].indexOf(insertedNode.parentNode.nodeName.toLocaleLowerCase()) >= 0;
					if(unwrap) {
						node = this.selection.anchorNode;
						parent = insertedNode.parentNode;
						parent.parentNode.insertBefore(insertedNode, parent);
						parent.parentNode.removeChild(parent);
						// 포커스(커서) 이동
						super.setCusor(node);
					}
				}*/

				this.setTooltipToggle();
			}
		});

		// 커서 (focus)
		$(this.elements.target).on('blur.EVENT_BLUR_TEXTEDIT', (e) => {
			this.setTooltipToggle();
		});

		// contenteditable paste text only
		// http://stackoverflow.com/questions/12027137/javascript-trick-for-paste-as-plain-text-in-execcommand
		$(this.elements.target).on('paste.EVENT_PASTE_TEXTEDIT', (e) => {
			let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
			let text = '';

			// 기본 이벤트 중지
			event.preventDefault();
			if(event.clipboardData) {
				text = event.clipboardData.getData('text/plain');
			}else if(window.clipboardData) {
				text = window.clipboardData.getData('Text');
			}
			
			// 현재노드 상위 검색
			if(getParent( 
				this.selection.anchorNode,
				this.elements.target,
				(node) => {
					if(/code|pre/.test(node.nodeName.toLowerCase())) {
						return true;
					}
				},
				(node, result) => {
					return result;
				}
			) === true) {
				// code, pre 는 별도의 로직으로 넣는다.
				// execCommand 사용하면 각 라인마다 p태그가 들어간다.
				(() => {
					let fragment, line;
					let range;

					fragment = document.createDocumentFragment();
					fragment.appendChild(document.createTextNode(text));
					//line = document.createTextNode('\n');
					line = document.createTextNode(' '); // \u00a0
					fragment.appendChild(line);

					range = this.selection.getRangeAt(0);
					range.deleteContents();
					range.insertNode(fragment);

					range = document.createRange(); // 크로스 브라우저 대응 작업해야 한다.
					range.setStartAfter(line);
					range.collapse(true);

					this.selection.removeAllRanges();
					this.selection.addRange(range);
				})();
			}else if(document.queryCommandSupported('insertText')) {
				document.execCommand('insertText', false, text);
			}else {
				document.execCommand('paste', false, text);
			}
		});

		// document event
		$(document).on('resize.EVENT_RESIZE_TEXTEDIT_DOCUMENT', (e) => {
			this.setTooltipToggle();
		});
		/*$(document).on(`${browser.event.up}.EVENT_MOUSEUP_TEXTEDIT_DOCUMENT`, (e) => {
			let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
			let self = event && event.currentTarget; // event listener element
			let target = event && (event.target || event.srcElement); // event 가 발생한 element

			// 툴팁내부 클릭된 것인지 확인
			if(!this.elements.tooltip.contains(event.target)) {
				console.log('document mouseup');
				setTimeout(() => {
					super.setSelection();
					this.setTooltipToggle();
				}, 1);
			}
		});*/
	}

	off() {
		// tooltip
		this.setTextTooltipMenuPostion({'toggle': 'hide'});

		// 마우스 이벤트
		$(document).off('.EVENT_MOUSEDOWN_TEXTEDIT')
		$(document).off('.EVENT_MOUSEUP_TEXTEDIT');

		// 키보드 이벤트
		$(this.elements.target).off('.EVENT_KEYDOWN_TEXTEDIT');
		$(this.elements.target).off('.EVENT_KEYUP_TEXTEDIT');
		$(this.elements.target).off('.EVENT_BLUR_TEXTEDIT');
		$(this.elements.target).off('.EVENT_PASTE_TEXTEDIT');

		// document event
		$(document).off('.EVENT_RESIZE_TEXTEDIT_DOCUMENT');
		//$(document).off('.EVENT_MOUSEUP_TEXTEDIT_DOCUMENT');
	};
}