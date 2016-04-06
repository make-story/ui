/*
Editor

@date
2015.07.07

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

@browser compatibility

*/

/*
-
Editor's Draft 10 January 2016
http://w3c.github.io/selection-api/

window.getSelection(): 현재 선택된 텍스트 범위 (선택영역, 사용자가 드래그 등으로 여러 엘리먼트에 걸쳐 선택한 텍스트를 대표한다.) - 선택된 값은 selection 객체의 toString()을 호출해서 가져올 수 있다.
window.getSelection().anchorNode: 선택된 글자의 시작노드
window.getSelection().focusNode: 현재 포커스가 위치한 끝노드

window.getSelection().getRangeAt(0): 현재 선택된 텍스트를 반환한다. (index 숫자는 드래드된 글자가 여러개의 경우 몇번째 index의 값을 반환하는지에 사용)
window.getSelection().rangeCount: 현재 선택된(드래드된) 텍스트 개수
window.getSelection().addRange('text'): 글자를 현재 선택된 node 에 삽입

window.getSelection().anchorNode.nodeValue: Text와 Comment를 제외한 대부분 노드 유형에서는 null 값을 반환한다. 이 속성의 용도는 Text와 Comment 노드에서 실제 텍스트 문자열을 추출하는데 초점을 맞추고 있다.
window.getSelection().anchorNode.nodeName
window.getSelection().anchorNode.nodeType

anchorNode.nodeValue   (DOM Level 1)
anchorNode.data   (CDATA, Node.TEXT_NODE 경우 사용)
anchorNode.textContent   (DOM Level 3, FF에서 사용)
anchorNode.innerText   (IE에서 사용)

-
참고자료
DOM 설명: http://wiki.gurubee.net/pages/viewpage.action?pageId=6259958

//
function getSelectedText() {
	var txt;
	if(window.getSelection) {
		txt = window.getSelection();
		// window.getSelection().getRangeAt(0); 
	}else if(document.getSelection) {
		txt = document.getSelection();
		// document.createRange();
	}else if(document.selection) { // IE
		txt = document.selection.createRange().text;
		// getRangeAt 미지원
	}
	return txt;
}

// 파이어 폭스의 텍스트 입력 엘리먼트이다.
function getTextFieldSelection(e) { 
	if(e.selectionStart !== undefined && e.selectionEnd !== undefined){
		var start = e.selectionStart;
		var end = e.selectionEnd;
		return e.value.substring(start, end);
	}
	return;
}

// 노드의 텍스트 가져오기
if(el.nodeType === Node.TEXT_NODE) {
	// data
}else if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1) { // firefox
	// textContent
}else {
	// innerText
}
*/

// http://story.pxd.co.kr/1021
// https://github.com/cheeaun/mooeditable/wiki/Javascript-WYSIWYG-editors

;(function(factory, global) {

	'use strict'; // ES5
	if(typeof global === 'undefined' || global !== window || ((!global.api || !global.api.dom) && !global.jQuery)) {
		return false;
	}
	global.api.editor = factory(global, global.jQuery || global.api.dom);

})(function(global, $, undefined) {

	'use strict'; // ES5

	/*
	모바일등에서는 복사하기등의 툴팁이 나오기 때문에 중복될수 있다.
	모바일의 경우 툴바의 위치를 상단 오른쪽에 출력되도록 하는것은 어떨까?
	*/

	var EDGE = -200;

	//
	var env = {};
	if(global.api && global.api.env) {
		env = global.api.env;
	}else {
		env = {
			'check': {
				'touch': ('ontouchstart' in window || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0)
			},
			'event': {
				"down": "mousedown",
				"move": "mousemove",
				"up": "mouseup",
				"click": 'click'
			}
		};
		if(env['check']['touch'] === true) {
			env['event']['down'] = 'touchstart';
			env['event']['move'] = 'touchmove';
			env['event']['up'] = 'touchend';
			env['event']['click'] = (window.DocumentTouch && document instanceof DocumentTouch) ? 'tap' : 'click';
		}
	}

	// elements
	var elements = {
		'text': {
			'tooltip': undefined,
			'buttons': {
				'element': undefined // button element 들을 감싸고 있는 element
			},
			'options': {
				'element': undefined, // option element 들을 감싸고 있는 element
				'link': {} // url 입력창
			}
		},
		'image': {
			'tooltip': undefined,
			'buttons': undefined,
			'options': undefined
		}
	};

	// style
	var ui = {
		'button': {
			'on': '',
			'off': ''
		}
	};

	//
	var selection;
	var range;
	var composition = false;

	// node 상위(parentNode) 검색
	var getParent = function(node, condition, callback) {
		var result;
		if(!node) {
			return;
		}
		while(node.parentNode) {
			// condition 함수를 실행하여 리턴값이 true 의 경우, callback 함수 실행
			// 1. condition 실행
			// 2. callback 실행
			if(condition(node)) {
				result = callback(node);
				if(typeof result !== 'undefined') {
					return result; // break
				}
			}
			node = node.parentNode;
		}
	};

	// 현재 선택된 글자에 블록태그(파라미터의 tag)를 설정한다.
	var setFormatBlock = function(tag) {
		if(typeof selection === 'object' && 'rangeCount' in selection && selection.rangeCount > 0) {
			if(getParent( // 추가하려는 tag 상위 존재여부 확인
				selection.focusNode,
				function(node) {
					return node.nodeName.toLowerCase() === tag;
				},
				function(node) {
					return node;
				}
			)) {
				document.execCommand("formatBlock", false, "p");
				document.execCommand("outdent"); // 문자 선택(text selection)의 현위치에서 들어쓰기 한 증가분 만큼 왼쪽으로 내어쓰기 한다.
			}else {
				document.execCommand("formatBlock", false, tag);
			}
		}
	};

	// ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- 

	// 이미지 관련
	var getHorizontalBounds = function(nodes, target, event) {
		
	};

	// ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- 

	// 텍스트 에디터 툴바 메뉴(각 기능) 현재 selection 에 따라 최신화
	var setTooltipMenuState = function(parameter) {
		//console.log('setTooltipMenuState');
		/*
		현재 포커스 위치의 element 에서 부모(parentNode)노드를 검색하면서,
		텍스트 에디터메뉴에 해당하는 태그가 있는지 여부에 따라
		해당 버튼에 on/off 효과를 준다.
		*/
		var key;
		if(typeof selection === 'object' && 'rangeCount' in selection && selection.rangeCount > 0) {
			for(key in elements['text']['buttons']) { // 버튼 선택 효과 초기화
				if(key === 'element') {
					continue;
				}
				//elements['text']['buttons'][key].classList.remove('active');
				elements['text']['buttons'][key].style.color = 'rgb(20, 29, 37)';
				elements['text']['buttons'][key].style.background = 'none';
			}
			getParent(
				selection.focusNode,
				function(node) {
					return typeof node.nodeName !== 'undefined' && typeof node.style !== 'undefined';
				},
				function(node) {
					console.log(node.nodeName.toLowerCase());
					// style 확인
					/*
					var key;
					for(key in node.style) {
						console.log('node style: ' + key);
						switch(node.style) {

						}	
					}
					*/
					if(node.style.color === '') {

					}
					
					// tag 확인
					switch(node.nodeName.toLowerCase()) {
						case 'b':
						case 'strong': // IE
							//elements['text']['buttons']['bold'].classList.add('active');
							elements['text']['buttons']['bold'].style.color = 'rgb(255, 255, 255)';
							elements['text']['buttons']['bold'].style.backgroundColor = 'rgb(226, 69, 69)';
							break;
						case 'i':
						case 'em': // IE
							elements['text']['buttons']['italic'].style.color = 'rgb(255, 255, 255)';
							elements['text']['buttons']['italic'].style.backgroundColor = 'rgb(226, 69, 69)';
							break;
						case 'strike':
							elements['text']['buttons']['strikethrough'].style.color = 'rgb(255, 255, 255)';
							elements['text']['buttons']['strikethrough'].style.backgroundColor = 'rgb(226, 69, 69)';
							break;
						case 'u':
							elements['text']['buttons']['underline'].style.color = 'rgb(255, 255, 255)';
							elements['text']['buttons']['underline'].style.backgroundColor = 'rgb(226, 69, 69)';
							break;
						case "h1":
							elements['text']['buttons']['h1'].style.color = 'rgb(255, 255, 255)';
							elements['text']['buttons']['h1'].style.backgroundColor = 'rgb(226, 69, 69)';
							break;
						case "h2":
							elements['text']['buttons']['h2'].style.color = 'rgb(255, 255, 255)';
							elements['text']['buttons']['h2'].style.backgroundColor = 'rgb(226, 69, 69)';
							break;
						case "h3":
							elements['text']['buttons']['h3'].style.color = 'rgb(255, 255, 255)';
							elements['text']['buttons']['h3'].style.backgroundColor = 'rgb(226, 69, 69)';
							break;
						case "blockquote":
							elements['text']['buttons']['blockquote'].style.color = 'rgb(255, 255, 255)';
							elements['text']['buttons']['blockquote'].style.backgroundColor = 'rgb(226, 69, 69)';
							break;
						case 'a':
							elements['text']['buttons']['createLink'].style.color = 'rgb(255, 255, 255)';
							elements['text']['buttons']['createLink'].style.backgroundColor = 'rgb(226, 69, 69)';
							break;
					}
				}
			);
		}
	};

	// 텍스트 에디터 툴바 위치 설정
	var setTooltipMenuPostion = function(parameter) {
		//console.log('setTooltipMenuPostion');
		var parameter = parameter || {};

		var clientRectBounds;
		var tooltip_width, tooltip_height;
		var top, left;

		if(typeof selection !== 'object' || selection.isCollapsed) { // isCollapsed: 셀렉션의 시작지점과 끝지점이 동일한지의 여부
			// 텍스트에디터 툴바숨기기
			elements['text']['tooltip'].style.top = EDGE + "px";
			elements['text']['tooltip'].style.left = EDGE + "px";
		}else if(selection.rangeCount > 0) { // rangeCount: 선택된 글자가 존재 (드래그된 영역이 존재)
			// 툴팁 크기
			tooltip_width = elements['text']['tooltip'].offsetWidth;
			tooltip_height = elements['text']['tooltip'].offsetHeight;
			// 툴팁 위치
			clientRectBounds = selection.getRangeAt(0).getBoundingClientRect(); // left, top, right, bottom
			top = (clientRectBounds.top - tooltip_height) - 5;
			if(top < 0) {
				top = clientRectBounds.bottom + 5; // 툴팁 하단에 출력하도록 변경

				elements['text']['tooltip'].style.borderTop = '1px solid rgb(226, 69, 69)';
				elements['text']['tooltip'].style.borderBottom = 'none';
			}else {
				elements['text']['tooltip'].style.borderBottom = '1px solid rgb(226, 69, 69)';
				elements['text']['tooltip'].style.borderTop = 'none';
			}
			top += window.pageYOffset;
			left = Math.round((clientRectBounds.left + clientRectBounds.right) / 2);
			left -= Math.floor(tooltip_width / 2);
			if(left < 0) {
				left = 0;
			}else if((left + tooltip_width) > Math.max(document.body.scrollWidth, document.documentElement.scrollWidth, document.body.offsetWidth, document.documentElement.offsetWidth, document.documentElement.clientWidth)) {
				left = left - ((left + tooltip_width) - Math.max(document.body.scrollWidth, document.documentElement.scrollWidth, document.body.offsetWidth, document.documentElement.offsetWidth, document.documentElement.clientWidth));
			}
			elements['text']['tooltip'].style.top = top + "px";
			elements['text']['tooltip'].style.left = left + "px";
		}
	};

	// ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- 

	/*
	-
	아래는 텍스트 에디터의 동작 순서
	1. setTextSelection 선택된 텍스트
	2. setTooltipMousedown 툴바 기능 적용
	3. setTooltipMouseup 적용된 기능에 대해 툴바 상태 최신화
	*/

	// 텍스트 선택(selection)
	var setTextSelection = function(event) {
		console.log('setTextSelection');
		var event = event || window.event;
		var target = event && (event.target || event.srcElement);

		event.stopPropagation(); // 현재 이벤트가 상위로 전파되지 않도록 중단한다.

		//console.log(target.isContentEditable);
		//console.log(document.activeElement.isContentEditable);
		/*
		selection = window.getSelection();
		setTooltipMenuState();
		setTooltipMenuPostion();
		*/
		
		selection = undefined;
		if(typeof target === 'object' && 'isContentEditable' in target && target.isContentEditable && composition === false) {
			selection = window.getSelection();
			setTooltipMenuState();
		}
		setTooltipMenuPostion();
	};

	// 에디터 버튼 mousedown 이벤트 (에디터 기능 적용)
	var setTooltipMousedown = function(event) {
		//console.log('setTooltipMousedown');
		// down 했을 때 해당 버튼의 기능 적용
		var event = event || window.event;
		var target = event && (event.target || event.srcElement);
		var editor = target['storage']['editor']; // 버튼의 기능 종류

		event.preventDefault(); // 현재 이벤트의 기본 동작을 중단한다.
		event.stopPropagation(); // 현재 이벤트가 상위로 전파되지 않도록 중단한다.

		if(typeof selection === 'object' && 'rangeCount' in selection && selection.rangeCount > 0) {
			console.log('에디터 기능 적용');
			switch(editor) {
				case 'bold':
					if(selection.anchorNode && !getParent(
						selection.anchorNode,
						function(node) { // condition (검사)
							return /^(h1|h2|h3)$/i.test(node.nodeName.toLowerCase()); // h1, h2, h3 태그는 진한색의 글자이므로 제외
						}, 
						function(node) { // callback (검사결과가 true의 경우)
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
					if(selection.focusNode && !getParent(
						selection.focusNode,
						function(node) { // condition (검사)
							return /^(b|strong)$/i.test(node.nodeName.toLowerCase()); 
						}, 
						function(node) { // callback (검사결과가 true의 경우)
							return true;
						}
					)) {
						setFormatBlock(editor);
					}
					break;
				case "blockquote": // 인용문 (들여쓰기)
					setFormatBlock(editor);
					break;
				case 'createLink':
					// url 입력박스 보이기
					//elements['text']['buttons']['element'].style.display = 'none';
					elements['text']['options']['link']['element'].style.display = 'block';

					// 
					setTimeout(function() {
						//
						var url = getParent(
							selection.focusNode,
							function(node) {
								return typeof node.href !== 'undefined';
							},
							function(node) {
								return node.href;
							}
						);
						// 선택된(셀렉) 곳에 a 태그 존재 확인
						if(typeof url !== "undefined") { // 이미 a 태그 생성되어 있음
							elements['text']['options']['link']['link-input'].value = url;
						}else { // 신규 a 태그 생성
							document.execCommand("createLink", false, "#none");
						}
						// 위 a 태그의 위치를 기억한다.
						range = selection.getRangeAt(0); // range는 이 위치에서 저장되어야 정상 작동한다!
						//
						elements['text']['options']['link']['link-input'].focus();
					}, 100);
					break;
			}
		}
	};

	// 에디터 버튼 mouseup 이벤트
	var setTooltipMouseup = function(event) {
		var event = event || window.event;
		var target = event && (event.target || event.srcElement);
		event.preventDefault(); // 현재 이벤트의 기본 동작을 중단한다.
		event.stopPropagation(); // 현재 이벤트가 상위로 전파되지 않도록 중단한다.
		setTimeout(function() {
			// setTextSelection 함수는 isContentEditable 검수하므로 호출하지 않는다
			setTooltipMenuState();
			setTooltipMenuPostion(); // h1, h2, h3 등 적용에 따라 툴바위치가 변경되어야 할 경우가 있다.
		}, 1);
	};

	// 에디터 링크 input blur 이벤트
	var setTooltipLinkBlur = function(event) {
		var url = elements['text']['options']['link']['link-input'].value;
		// 기억해둔 a 태그의 위치를 기능적용 위치로 설정한다.
		window.getSelection().addRange(range);
		// a 태그 초기화(삭제)
		document.execCommand('unlink', false);
		if(url !== "") {
			if(!url.match("^(http|https)://")) {
				url = "http://" + url;
			}
			// 사용자가 입력한 url이 있을 경우 a 태그의 href 최신화 (a 태그 재생성)
			document.execCommand('createLink', false, url);
		}
		elements['text']['options']['link']['link-input'].value = '';

		// url 입력박스 숨기기
		elements['text']['options']['link']['element'].style.display = 'none';

		//
		setTooltipMenuState();
	};

	// 에디터 링크 input keydown 이벤트
	var setTooltipLinkKeydown = function(event) {
		if(event.keyCode === 13) {
			event.preventDefault();
			elements['text']['options']['link']['link-input'].blur(); // trigger blur
		}
	};

	// ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- 

	// 에디터가 작동할 영역의 이벤트
	var setContenteditableKeydown = function(event) { // 에디터가 실행될 영역 이벤트
		//console.log('setContenteditableKeydown');
		var selection = window.getSelection();
		var parentParagraph;
		var prevSibling;

		// p 태그안에 위치하면서 상단 tag 가 hr 인 경우, 엔터키가 작동하지 않도록 한다.
		if(typeof selection === 'object' && selection.anchorNode) {
			parentParagraph = getParent( // 현재노드 상위로 존재하는 p 태그 반환
				selection.anchorNode,
				function(node) {
					return node.nodeName.toLowerCase() === 'p';
				},
				function(node) {
					return node;
				}
			);

			// 현재 p태그 내부에 커서가 있으며
			// p태그 내부 텍스트가 입력되지 않은 빈상태이며
			// p태그 바로전 태그가 hr 태그의 경우
			// 사용자가 엔터키를 눌렀을 경우 작동하지 않도록 한다.
			if(event.keyCode === 13 && parentParagraph) { // keyCode 13: enter
				prevSibling = parentParagraph.previousSibling; // 하나 전의 노드
				if(prevSibling && prevSibling.nodeName === "HR" && !prevSibling.textContent.length/*!parentParagraph.nodeValue.length*/) {
					// enter 기본 이벤트 중지
					event.preventDefault();
				}
			}
		}
	};
	var setContenteditableKeyup = function(event) { // 에디터가 실행될 영역 이벤트
		//console.log('setContenteditableKeyup');
		var parentParagraph, prevSibling, prevPrevSibling, hr;
		var insertedNode, unwrap, node, parent, range;

		// 방향키, 엔터키 등 키보드를 눌렀다 때었을 때
		setTextSelection(event);

		// getSelection 선택된 node
		if(typeof selection === 'object' && selection.anchorNode) {
			// 엔터키를 눌렀을 때 p 태그 또는 hr 태그 삽입
			if(event.keyCode === 13) { // keyCode 13: enter
				// DIV 내부에서 엔터를 눌렀을 경우 div 내부에서 br로 처리되므로 p 태그로 변경되도록 처리한다.
				if(selection.anchorNode.nodeName === "DIV") {
					setFormatBlock("p");
				}

				// 현재 포커스가 비어있는 p태그 내부에서 엔터를 눌렀을 경우 hr 태그로 변경되도록 처리한다.
				parentParagraph = getParent( // 현재노드 상위로 존재하는 p 태그 반환
					selection.anchorNode,
					function(node) {
						return node.nodeName.toLowerCase() === 'p';
					},
					function(node) {
						return node;
					}
				);
				if(parentParagraph) { 
					prevSibling = parentParagraph.previousSibling; // 하나 전의 노드
					prevPrevSibling = prevSibling;
					while(prevPrevSibling) {
						if(prevPrevSibling.nodeType !== Node.TEXT_NODE) { // Node는 전역변수 window.Node (TEXT_NODE: 3)
							break;
						}
						prevPrevSibling = prevPrevSibling.previousSibling; // 하나 전의 노드
					}
					// hr 태그 삽입
					if(prevSibling.nodeName === "P" && prevPrevSibling.nodeName !== "HR" && !prevSibling.textContent.length/*!prevSibling.nodeValue.length*/) {
						hr = document.createElement("hr");
						hr.contentEditable = false;
						parentParagraph.parentNode.replaceChild(hr, prevSibling);
					}
				}
			}

			// -, *, 1. 입력에 따른 목록태그 변환
			// isCollapsed: 셀렉션의 시작지점과 끝지점이 동일한지의 여부
			// nodeValue: Text와 Comment 노드에서 실제 텍스트 문자열 추출
			if(selection.isCollapsed && selection.anchorNode.nodeValue && selection.anchorNode.parentNode.nodeName !== "LI") { 
				//console.log('selection.isCollapsed: ' + selection.isCollapsed);
				
				if(selection.anchorNode.nodeValue.match(/^[-*]\s/)) { 
					// "- 텍스트작성" 또는 "* 텍스트작성" 행태로 글을 작성했을 경우 목록태그로 변경
					document.execCommand('insertUnorderedList'); // ul 태그 생성
					selection.anchorNode.nodeValue = selection.anchorNode.nodeValue.substring(2);
					insertedNode = getParent( // 현재노드 상위로 존재하는 ul 태그 반환
						selection.anchorNode,
						function(node) {
							return node.nodeName.toLowerCase() === 'ul';
						},
						function(node) {
							return node;
						}
					);
				}else if(selection.anchorNode.nodeValue.match(/^1\.\s/)) { 
					// "1. 텍스트작성" 형태로 글을 작성했을 경우 목록태그로 변경
					document.execCommand('insertOrderedList'); // ol 태그 생성
					selection.anchorNode.nodeValue = selection.anchorNode.nodeValue.substring(3);
					insertedNode = getParent( // 현재노드 상위로 존재하는 ol 태그 반환
						selection.anchorNode,
						function(node) {
							return node.nodeName.toLowerCase() === 'ol';
						},
						function(node) {
							return node;
						}
					);
				}

				// ul 또는 ol 로 변경되었고, 현재 부모 태그가 p 또는 div 의 경우
				// p 또는 div 내부에 목록태그가 존재하지 않도록, 해당위치를 목록태그로 대체한다.
				unwrap = insertedNode && ["ul", "ol"].indexOf(insertedNode.nodeName.toLocaleLowerCase()) >= 0 && ["p", "div"].indexOf(insertedNode.parentNode.nodeName.toLocaleLowerCase()) >= 0;
				if(unwrap) {
					node = selection.anchorNode;
					parent = insertedNode.parentNode;
					parent.parentNode.insertBefore(insertedNode, parent);
					parent.parentNode.removeChild(parent);

					range = document.createRange();
					range.setStart(node, 0);
					range.setEnd(node, 0);
					selection.removeAllRanges();
					selection.addRange(range);
				}
			}
		}
	};
	var setContenteditableOn = function(nodes) {
		//var parameter = parameter || {};
		//var nodes = parameter['nodes']; // 에디터가 작동하게 될 대상 element 리스트

		// 에디터가 사용될 대상이 되는곳에 이벤트 설정
		var i, max;
		var setEvent = function(node) {
			// storage
			if(typeof node.storage !== 'object') {
				node.storage = {};
			}else if(node.storage['EVENT_MOUSEUP_editor'] || node.storage['EVENT_KEYDOWN_editor'] || node.storage['EVENT_KEYUP_editor']) {
				// 이벤트가 중복되지 않도록 이미 적용되어 있는지 확인한다.				
				return true;
			}

			// contentEditable
			//console.log(node);
			//console.log(node.contentEditable);
			//console.log(node.isContentEditable);
			if(!node.isContentEditable) {
				//continue;
				node.contentEditable = true; // 해당 element 내부 수정가능하도록 설정
			}

			// 마우스 이벤트
			$(node).on(env.event.up + '.EVENT_MOUSEUP_editor', setTextSelection);
			/*node.addEventListener('mouseup', setTextSelection, false);
			node.storage['EVENT_MOUSEUP_editor'] = {
				"events": 'mouseup',
				"handlers": setTextSelection,
				"capture": false
			};*/
			
			// 키보드 이벤트
			$(node).on('keydown.EVENT_KEYDOWN_editor', setContenteditableKeydown);
			/*node.addEventListener('keydown', setContenteditableKeydown, false);
			node.storage['EVENT_KEYDOWN_editor'] = {
				"events": 'keydown',
				"handlers": setContenteditableKeydown,
				"capture": false
			};*/
			$(node).on('keyup.EVENT_KEYUP_editor', setContenteditableKeyup);
			/*node.addEventListener('keyup', setContenteditableKeyup, false);
			node.storage['EVENT_KEYUP_editor'] = {
				"events": 'keyup',
				"handlers": setContenteditableKeyup,
				"capture": false
			};*/
		};

		if(!nodes) {
			nodes = document.querySelectorAll('[contenteditable="true"]');
			if(!nodes.length) {
				return false;
			}
		}
		if(nodes.nodeType) {
			setEvent(nodes);
		}else {
			for(i=0, max=nodes.length; i<max; i++) {
				setEvent(nodes[i]);
			}
		}
		
		// document event
		/*$(document).on(env.event.up + '.EVENT_MOUSEUP_editor_document', function(event) {
			var event = event || window.event;
			//var target = event && (event.target || event.srcElement);
			// 툴팁내부 클릭된 것인지 확인
			if(!elements['text']['tooltip'].contains(event.target)) {
				console.log('document mouseup');
				setTimeout(function() {
					setTextSelection(event);
				}, 1);
			}
		});*/
		
		// 한글입력관련
		$(document).on('compositionstart.EVENT_COMPOSITIONSTART_editor', function() {
			composition = true;
		});
		//document.addEventListener('compositionstart', onCompositionStart);
		$(document).on('compositionend.EVENT_COMPOSITIONEND_editor', function() {
			composition = false;
		});
		//document.addEventListener('compositionend', onCompositionEnd);

	};
	var setContenteditableOff = function(nodes) {
		//var parameter = parameter || {};
		//var nodes = parameter['nodes']; // 에디터 작동을 중지시킬 대상 element 리스트
		if(!nodes || !nodes.length) {
			nodes = document.querySelectorAll('[contenteditable="true"]');
		}

		// 에디터가 사용된 대상의 이벤트 해제
		var i, max;
		var node;
		for(i=0, max=nodes.length; i<max; i++) {
			node = nodes[i];
			if(typeof node.storage !== 'object') {
				continue;
			}

			// 마우스 이벤트
			$(node).off('.EVENT_MOUSEUP_editor');
			/*node.removeEventListener(node['storage']['EVENT_MOUSEUP_editor']['events'], node['storage']['EVENT_MOUSEUP_editor']['handlers'], node['storage']['EVENT_MOUSEUP_editor']['capture']);
			delete node['storage']['EVENT_MOUSEUP_editor'];*/

			// 키보드 이벤트
			$(node).off('.EVENT_KEYDOWN_editor');
			/*node.removeEventListener(node['storage']['EVENT_KEYDOWN_editor']['events'], node['storage']['EVENT_KEYDOWN_editor']['handlers'], node['storage']['EVENT_KEYDOWN_editor']['capture']);
			delete node['storage']['EVENT_KEYDOWN_editor'];*/
			$(node).off('.EVENT_KEYUP_editor');
			/*node.removeEventListener(node['storage']['EVENT_KEYUP_editor']['events'], node['storage']['EVENT_KEYUP_editor']['handlers'], node['storage']['EVENT_KEYUP_editor']['capture']);
			delete node['storage']['EVENT_KEYUP_editor'];*/
		}

		// document event
		$(document).off('.EVENT_MOUSEUP_editor_document');

		// 한글입력관련
		$(document).off('.EVENT_COMPOSITIONSTART_editor');
		$(document).off('.EVENT_COMPOSITIONEND_editor');
	};

	// 에디터 button, input 등 생성 및 이벤트 설정
	var setCreateTooltipElement = function(parameter) {
		var parameter = parameter || {};
		var tag = parameter['tag']; // 생성할 tag name
		var editor = parameter['editor']; // 툴팁종류

		// element
		var element = document.createElement(tag);
		element['storage'] = {
			'editor': editor
		};

		// 중복생성여부 확인
		if(elements['text']['buttons'][editor]) {
			return element;
		}

		/*
		textContent 로 설정될 부분을 상단에 객체로 두는것은 어떨까?
		var button = {
			'bold': 'B',
			'italic': 'i',
			...
		};
		*/

		if(tag === 'button') {
			// element 
			elements['text']['buttons'][editor] = element;
			// style
			element.style.cssText = 'padding: 0px; width: 30px; height: 30px; font-size: 14px; color: rgb(20, 29, 37); background: none; border: 0px; outline: none; cursor: pointer; -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;';
			// event
			element.onmousedown = setTooltipMousedown; 
			element.onmouseup = setTooltipMouseup;
		}

		switch(editor) {
			case 'bold':
				element.textContent = 'B';
				element.style.fontWeight = 'bold';
				break;
			case 'italic':
				element.textContent = 'I';
				element.style.fontStyle = 'italic';
				break;
			case 'strikethrough':
				element.textContent = 'S';
				element.style.textDecoration = 'line-through';
				break;
			case 'underline':
				element.textContent = 'U';
				element.style.textDecoration = 'underline';
				break;
			case "h1":
				element.textContent = 'H1';
				break;
			case "h2":
				element.textContent = 'H2';
				break;
			case "h3":
				element.textContent = 'H3';
				break;
			case "blockquote":
				element.textContent = '"';
				break;
			case 'createLink': // link
				element.textContent = '#';

				// option
				elements['text']['options']['link']['element'] = document.createElement("div"); // link option box
				elements['text']['options']['link']['link-input'] = document.createElement("input");
				elements['text']['options']['link']['element'].appendChild(elements['text']['options']['link']['link-input']);
				elements['text']['options']['element'].appendChild(elements['text']['options']['link']['element']);
				// style
				elements['text']['options']['link']['element'].style.cssText = 'display: none;';
				// event
				elements['text']['options']['link']['link-input'].onblur = setTooltipLinkBlur;
				elements['text']['options']['link']['link-input'].onkeydown = setTooltipLinkKeydown;
				break;
			case 'InsertImage':

				break;
		}

		return element;
	};

	// init
	(function init() {
		var fragment = document.createDocumentFragment();

		// document 에 에디터 툴바존재여부 확인 후 생성


		// 텍스트 툴바
		elements['text']['tooltip'] = document.createElement("div");
		elements['text']['tooltip'].style.cssText = 'transition: all .3s ease; position: absolute; top: ' + EDGE + 'px; left: ' + EDGE + 'px; color: rgb(20, 29, 37); background-color: rgba(255, 255, 255, 0.87);';
		elements['text']['buttons']['element'] = document.createElement("div");
		elements['text']['options']['element'] = document.createElement("div");
		elements['text']['tooltip'].appendChild(elements['text']['buttons']['element']);
		elements['text']['tooltip'].appendChild(elements['text']['options']['element']);
		fragment.appendChild(elements['text']['tooltip']);

		// 텍스트 에디터 버튼
		elements['text']['buttons']['element'].appendChild(setCreateTooltipElement({'tag': 'button', 'editor': 'h1'}));
		elements['text']['buttons']['element'].appendChild(setCreateTooltipElement({'tag': 'button', 'editor': 'h2'}));
		elements['text']['buttons']['element'].appendChild(setCreateTooltipElement({'tag': 'button', 'editor': 'h3'}));
		elements['text']['buttons']['element'].appendChild(setCreateTooltipElement({'tag': 'button', 'editor': 'bold'}));
		elements['text']['buttons']['element'].appendChild(setCreateTooltipElement({'tag': 'button', 'editor': 'italic'}));
		elements['text']['buttons']['element'].appendChild(setCreateTooltipElement({'tag': 'button', 'editor': 'strikethrough'}));
		elements['text']['buttons']['element'].appendChild(setCreateTooltipElement({'tag': 'button', 'editor': 'underline'}));
		elements['text']['buttons']['element'].appendChild(setCreateTooltipElement({'tag': 'button', 'editor': 'blockquote'}));
		elements['text']['buttons']['element'].appendChild(setCreateTooltipElement({'tag': 'button', 'editor': 'createLink'}));

		/*
		// 이미지 툴바
		elements['image']['tooltip'] = document.createElement("div");
		elements['image']['buttons'] = document.createElement("div");
		elements['image']['options'] = document.createElement("div");
		elements['image']['tooltip'].appendChild(elements['image']['buttons']);
		elements['image']['tooltip'].appendChild(elements['image']['options']);
		fragment.appendChild(elements['image']['tooltip']);

		// 이미지 에디터 버튼
		*/

		/*
		// Set cursor position
		var range = document.createRange();
		var selection = window.getSelection();
		range.setStart(headerField, 1);
		selection.removeAllRanges();
		selection.addRange(range);
		*/

		// body 삽입
		document.body.appendChild(fragment);
	})();

	// public return
	return {
		on: setContenteditableOn,
		off: setContenteditableOff
	};

}, this);
