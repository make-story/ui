/*
Editor (HTML5)

@date (버전관리)
2016.03

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

@browser compatibility
IE9 이상
Function.prototype.bind(): IE9 이상
FileReader: IE10 이상

-
사용예

*/

;(function(factory, global) {

	'use strict'; // ES5
	if(typeof global === 'undefined' || global !== window || ((!global.api || !global.api.dom) && !global.jQuery) || (!global.getSelection && !global.document.selection)) {
		return false;	
	}else if(!global.api) {
		global.api = {};
	}
	global.api.editor = factory(global, global.jQuery || global.api.dom);

})(function(global, $, undefined) {

	'use strict'; // ES5

	// ajax
	if(!global.jQuery && global.api && global.api.xhr) {
		$.ajax = global.api.xhr;
	}

	// 정규식
	var regexp = {
		url: /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
	};

	// 환경정보
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
				"click": "click"
			}
		};
		if(env['check']['touch'] === true) {
			env['event']['down'] = 'touchstart';
			env['event']['move'] = 'touchmove';
			env['event']['up'] = 'touchend';
			if(/(iphone|ipad|ipod)/i.test((navigator.userAgent || navigator.vendor || window.opera || ''))) {
				env['event']['click'] = 'touchend';
			}
		}
	}

	// 모듈 (private)
	var module = (function() {
		function EditModule() {
			var that = this;

			// key가 있는 인스턴스
			that.instance = {};

			// 선택된 텍스트 (window.getSelection())
			that.selection; 

			// element
			that.elements = {};

			// 한글입력관련
			that.composition = false;
			$(document).off('.EVENT_COMPOSITIONSTART_TEXTEDIT').on('compositionstart.EVENT_COMPOSITIONSTART_TEXTEDIT', function() {
				that.composition = true;
			});
			$(document).off('.EVENT_COMPOSITIONEND_TEXTEDIT').on('compositionend.EVENT_COMPOSITIONEND_TEXTEDIT', function() {
				that.composition = false;
			});
		}
		EditModule.prototype = {
			init: function() {
				var fragment;

				if(document.body) {
					// fragment
					fragment = document.createDocumentFragment();

					// container
					if(!this.elements.container || typeof this.elements.container !== 'object' || !this.elements.container.nodeType) {
						this.elements.container = document.createElement('div');
						fragment.appendChild(this.elements.container);
					}

					// text
					if(!this.elements.text || typeof this.elements.text !== 'object' || !this.elements.text.nodeType) {
						this.elements.text = document.createElement('div');
						fragment.appendChild(this.elements.text);
					}

					// multi
					if(!this.elements.multi || typeof this.elements.multi !== 'object' || !this.elements.multi.nodeType) {
						this.elements.multi = document.createElement('div');
						fragment.appendChild(this.elements.multi);
					}

					try {
						//document.body.insertBefore(fragment, document.body.firstChild);
						document.body.appendChild(fragment);
					}catch(e) {}
				}
			},
			setSettings: function(settings, options) {
				var key;
				for(key in options) {
					if(!options.hasOwnProperty(key)) {
						continue;
					}else if(options[key] && options[key].constructor === Object && !options[key].nodeType) {
						settings[key] = settings[key] || {};
						settings[key] = this.setSettings(settings[key], options[key]);
					}else {
						settings[key] = options[key];
					}
				}
				return settings;
			},
			// key (일반적인 고유값)
			getKey: (function(){
				if(global.api && global.api.key) {
					return global.api.key;
				}else {
					return function() {
						return ['api', new Date().getTime(), (Math.random() * (1 << 30)).toString(16).replace('.', '')].join('').substr(0, 24);
					};
				}
			})(),
			// selection
			// 크로스 브라우저 대응 필요
			setSelection: function() {
				this.selection = window.getSelection();
			},
			// anchorNode, focusNode 선택여부
			isSelection: function() {
				var is = false;
				if(typeof this.selection === 'object' && this.selection !== null && this.selection.anchorNode && this.selection.focusNode) {
					is = true;
				}
				return is;
			},
			// 셀렉션의 시작지점과 끝지점이 동일한지의 여부 (드래그로 선택된 것이 없을 경우 false 반환)
			isCollapsed: function() {
				var is = false;
				if(typeof this.selection === 'object' && this.selection !== null) {
					is = this.selection.isCollapsed;
				}
				return is;
			},
			// 선택된 range 영역 
			// 크로스 브라우저 대응 필요
			/*
			드래그로 선택된 영역 조각
			Range 인터페이스는 노드와 텍스트 노드를 포함한 문서의 일부(fragment)이다.
			'문서의 특정 부분’을 정의하는 것이라 생각하면 쉽다.
			*/
			getRange: function(index) {
				var range;
				if(typeof this.selection === 'object' && this.selection !== null && this.selection.rangeCount > 0) { // rangeCount 는 커서 자체도 하나의 range 로 본다.
					// this.selection.rangeCount
					range = this.selection.getRangeAt(index || 0);
				}
				return range;
			},
			// 현재 node 상위(parentNode)를 검색하며, condition 결과에 따른 callback 실행
			// 상위노드 탐색을 실행을 얼마나 줄이느냐가 관건
			getParent: function(current, last, condition, callback) {
				var result;
				if(typeof current !== 'object' || current === null || !current.nodeType) {
					return;
				}
				if(typeof last !== 'object' || (last !== null && !last.nodeType)) {
					last = null;
				}
				while(current.parentNode) {
					// 1. condition 실행
					// 리턴값이 true 의 경우, callback 함수 실행
					result = condition(current); 
					if(result) {
						// 2. callback 실행 (return 값이 있을 경우 반환)
						result = callback(current, result);
						if(typeof result !== 'undefined') {
							// callback 리턴값이 있을 경우 break
							return result;
						}
					}
					// 검색 제한
					if(last && (!last.contains(current) || last.isEqualNode(current))) {
						return;
					}
					// 상위 node
					current = current.parentNode;
				}
			},
			isNodeCheck: function(node, check) { 
				var is = false;

				if(typeof node === 'object' && node !== null && node.nodeType) {
					switch(check) {
						case 'url':
							if(node.nodeType === 3 && node.parentNode.nodeName.toLowerCase() !== 'a' && node.nodeValue && regexp.url.test(node.nodeValue)) { // nodeType 3: textnode
								is = true;
							}
							break;
						case 'opengraph':
							if((typeof node.storage === 'object' && node.storage.type === 'opengraph') || (node.nodeType === 3 && typeof node.parentNode.storage === 'object' && node.parentNode.storage.type === 'opengraph')) { // nodeType 3: textnode
								is = true;	
							}
							break;
					}
				}

				return is;
			},
			// 커서
			setCusor: function(node) {
				var that = this;
				var range, position;

				if(typeof node === 'object' && node !== null && node.nodeType) {
					//console.log('커서');
					//console.log(node);

					//position = that.selection.getRangeAt(0).focusOffset;
					range = document.createRange(); // 크로스 브라우저 대응 작업해야 한다.
					range.setStart(node, 0);
					range.setEnd(node, 0);
					range.collapse(true);
					that.selection.removeAllRanges();
					that.selection.addRange(range);
				}
			},
			// 현재 선택된 글자에 블록태그(파라미터의 tag)를 설정한다.
			setFormatBlock: function(tag) {
				var that = this;
				if(typeof tag === 'string') {
					if(that.isSelection() && that.getRange() && that.getParent( // 추가하려는 tag가 상위에 존재하는지 확인
						that.selection.focusNode,
						null,
						function(node) {
							return node.nodeName.toLowerCase() === tag.toLowerCase();
						},
						function(node, result) {
							return node;
						}
					)) {
						document.execCommand("formatBlock", false, "p");
						document.execCommand("outdent"); // 문자 선택(text selection)의 현위치에서 들어쓰기 한 증가분 만큼 왼쪽으로 내어쓰기 한다.
					}else {
						document.execCommand("formatBlock", false, tag);
					}
				}
			},
			// css display
			getDisplay: function(element) {
				var display = '';
				if(typeof element === 'object' && element !== null && element.nodeType) {
					if(element.style.display) { // style로 값을 구할 수 있는 경우
						display = element.style.display;
					}else if(element.currentStyle && element.currentStyle.display) { // IE의 경우
						display = element.currentStyle.display;
					}else if(document.defaultView && document.defaultView.getComputedStyle) {
						if(document.defaultView.getComputedStyle(element, null).getPropertyValue) {
							display = document.defaultView.getComputedStyle(element, null).getPropertyValue('display');
						}
					}
				}
				return display;
			},
			// 현재 이벤트의 기본 동작을 중단한다.
			preventDefault: function(e) {
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				if(event.preventDefault) { 
					event.preventDefault();
				}else {
					event.returnValue = false;
				}
			},
			// 현재 이벤트가 상위로 전파되지 않도록 중단한다.
			stopPropagation: function(e) {
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				if(event.stopPropagation) { 
					event.stopPropagation();
				}else {
					event.cancelBubble = true;
				}
			},
			// 단위 분리
			numberUnit: function(value) { 
				// [1]: 숫자값
				// [2]: 단위
				return /^([0-9]+)(\D+)$/i.exec(value);
			},
			// 숫자여부 확인
			isNumeric: function(value) {
				return !isNaN(parseFloat(value)) && isFinite(value);
			},
			// 숫자만 추출
			numberReturn: function(value) { 
				return String(value).replace(/[^+-\.\d]|,/g, '');
			}
		};
		return new EditModule();
	})();

	// 텍스트 에디터
	var EditText = (function() {
		/*
		 * 인스턴스 생성시 메모리 관리를 위해 
		 * this 내부 함수로 두지 않고 스코프체이닝을 이용한 별도 함수로 
		 * 외부에 선언했음
		 */
		// 에디터 버튼 mousedown 이벤트 (에디터 기능을 선택영역에 적용)
		var setTextTooltipMousedown = function(e) {
			var that = this;
			var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
			var self = event && event.currentTarget; // event listener element
			var target = event && (event.target || event.srcElement); // event 가 발생한 element
			var command = target['storage']['command']; // 버튼의 기능 종류

			event.preventDefault(); // 현재 이벤트의 기본 동작을 중단한다.
			event.stopPropagation(); // 현재 이벤트가 상위로 전파되지 않도록 중단한다.

			if(module.getRange()) {
				//console.log('에디터 기능 적용');
				switch(command) {
					case 'bold':
						if(module.selection.anchorNode && !module.getParent(
							module.selection.anchorNode,
							null,
							function(node) { // condition (검사)
								return /^(h1|h2|h3)$/i.test(node.nodeName.toLowerCase()); // h1, h2, h3 태그는 진한색의 글자이므로 제외
							}, 
							function(node, result) { // callback (검사결과가 true의 경우)
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
						if(module.selection.focusNode && !module.getParent(
							module.selection.focusNode,
							null,
							function(node) { // condition (검사)
								return /^(b|strong)$/i.test(node.nodeName.toLowerCase()); 
							}, 
							function(node, result) { // callback (검사결과가 true의 경우)
								return true;
							}
						)) {
							module.setFormatBlock(command);
						}
						break;
					case "blockquote": // 인용문 (들여쓰기)
						module.setFormatBlock(command);
						break;
					case 'createLink':
						// url 입력박스 보이기
						that.elements.other.link.wrap.style.display = 'block';
						setTimeout(function() {
							var url = module.getParent(
								module.selection.focusNode,
								null,
								function(node) {
									return typeof node.href !== 'undefined';
								},
								function(node, result) {
									return node.href;
								}
							);
							// 선택된(셀렉) 곳에 a 태그 존재 확인
							if(typeof url !== "undefined") { // 이미 a 태그 생성되어 있음
								that.elements.other.link.input.value = url;
							}else { // 신규 a 태그 생성
								//document.execCommand("createLink", false, '#none');
							}
							// 위 a 태그의 위치를 기억한다.
							// execCommand 로 createLink 생성된 위치를 기억한다.
							that.range = module.selection.getRangeAt(0); 
							that.elements.other.link.input.focus();
						}, 100);
						break;
				}
			}
		};

		// 에디터 버튼 mouseup 이벤트
		var setTextTooltipMouseup = function(e) {
			var that = this;
			var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
			var self = event && event.currentTarget; // event listener element
			var target = event && (event.target || event.srcElement); // event 가 발생한 element

			event.preventDefault(); // 현재 이벤트의 기본 동작을 중단한다.
			event.stopPropagation(); // 현재 이벤트가 상위로 전파되지 않도록 중단한다.

			setTimeout(function() {
				// setSelection 함수는 isContentEditable 검수하므로 호출하지 않는다
				that.setTextTooltipMenuState();
				that.setTextTooltipMenuPostion(); // h1, h2, h3 등 적용에 따라 툴바위치가 변경되어야 할 경우가 있다.
			}, 1);
		};

		// 에디터 링크 input blur 이벤트
		var setTextTooltipLinkBlur = function(e) {
			var that = this;
			var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
			var url = that.elements.other.link.input.value;
			var node;

			if(url) {
				if(!url.match("^(http://|https://|mailto:)")) {
					url = "http://" + url;
				}
				//document.execCommand('createLink', false, url);

				// a태그 생성
				node = document.createElement('a');
				node.className = that.settings.classes.link;
				node.href = url;
				node.target = '_blank';
				node.textContent = node.innerText = that.range.toString() || url;
				node.storage = {
					'type': 'text'
				};

				// 기억해둔 위치(range)의 값을 변경한다.
				// replace selected text
				// http://stackoverflow.com/questions/3997659/replace-selected-text-in-contenteditable-div
				that.range.deleteContents();
				that.range.insertNode(node);
				module.selection.removeAllRanges();
				module.selection.addRange(that.range);
			}else {
				module.selection.removeAllRanges();
				module.selection.addRange(that.range);
				document.execCommand('unlink', false);
				//node = document.createTextNode(that.range.toString());
			}
			
			// url 입력박스 숨기기
			that.elements.other.link.wrap.style.display = 'none';

			// 툴팁
			that.setTextTooltipMenuState();
			that.setTextTooltipMenuPostion();
		};

		// 에디터 링크 input keydown 이벤트
		var setTextTooltipLinkKeydown = function(e) {
			var that = this;
			var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event

			if(e.keyCode === 13) {
				e.preventDefault();
				that.elements.other.link.input.blur(); // trigger blur
			}
		};

		// public
		var EditText = function(settings) {
			var that = this;
			that.settings = {
				'key': 'editor', 
				'target': null,
				'tooltip': true,
				'classes': {
					'link': 'editor-text-link' // a 태그에 적용될 class 속성값
				},
				'callback': {
					'init': null
				}
			};
			that.elements = {
				'target': null,
				'tooltip': null,
				'command': {
					'wrap': null
				},
				'other': {
					'wrap': null
				}
			};
			that.range; // selection 된 range(범위)
			that.time = null;

			// settings
			that.change(settings);

			// init 
			(function() {
				// element 생성
				var fragment = document.createDocumentFragment();
				var button;

				// 툴바
				that.elements.tooltip = document.createElement("div");
				that.elements.tooltip.style.cssText = 'transition: all .05s ease-out; position: absolute; color: rgb(44, 45, 46); background-color: rgba(255, 255, 255, .96); display: none;';
				that.elements.tooltip.appendChild(that.elements.command.wrap = document.createElement("div"));
				that.elements.tooltip.appendChild(that.elements.other.wrap = document.createElement("div"));
				fragment.appendChild(that.elements.tooltip);

				// 에디터 버튼
				button = document.createElement('button');
				button.style.cssText = 'padding: 0px; width: 30px; height: 30px; font-size: 14px; color: rgb(44, 45, 46); background: none; border: 0px; outline: none; cursor: pointer; -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;';
				that.elements.command.wrap.appendChild(that.elements.command.h1 = (function(button) {
					button['storage'] = {
						'command': 'h1'
					};
					button.onmousedown = setTextTooltipMousedown.bind(that); 
					button.onmouseup = setTextTooltipMouseup.bind(that);
					button.textContent = 'H1';
					return button;
				})(button.cloneNode()));
				that.elements.command.wrap.appendChild(that.elements.command.h2 = (function(button) {
					button['storage'] = {
						'command': 'h2'
					};
					button.onmousedown = setTextTooltipMousedown.bind(that); 
					button.onmouseup = setTextTooltipMouseup.bind(that);
					button.textContent = 'H2';
					return button;
				})(button.cloneNode()));
				that.elements.command.wrap.appendChild(that.elements.command.h3 = (function(button) {
					button['storage'] = {
						'command': 'h3'
					};
					button.onmousedown = setTextTooltipMousedown.bind(that); 
					button.onmouseup = setTextTooltipMouseup.bind(that);
					button.textContent = 'H3';
					return button;
				})(button.cloneNode()));
				that.elements.command.wrap.appendChild(that.elements.command.bold = (function(button) {
					button['storage'] = {
						'command': 'bold'
					};
					button.onmousedown = setTextTooltipMousedown.bind(that); 
					button.onmouseup = setTextTooltipMouseup.bind(that);
					button.textContent = 'B';
					button.style.fontWeight = 'bold';
					return button;
				})(button.cloneNode()));
				that.elements.command.wrap.appendChild(that.elements.command.italic = (function(button) {
					button['storage'] = {
						'command': 'italic'
					};
					button.onmousedown = setTextTooltipMousedown.bind(that); 
					button.onmouseup = setTextTooltipMouseup.bind(that);
					button.textContent = 'I';
					button.style.fontStyle = 'italic';
					return button;
				})(button.cloneNode()));
				that.elements.command.wrap.appendChild(that.elements.command.strikethrough = (function(button) {
					button['storage'] = {
						'command': 'strikethrough'
					};
					button.onmousedown = setTextTooltipMousedown.bind(that); 
					button.onmouseup = setTextTooltipMouseup.bind(that);
					button.textContent = 'S';
					button.style.textDecoration = 'line-through';
					return button;
				})(button.cloneNode()));
				that.elements.command.wrap.appendChild(that.elements.command.underline = (function(button) {
					button['storage'] = {
						'command': 'underline'
					};
					button.onmousedown = setTextTooltipMousedown.bind(that);
					button.onmouseup = setTextTooltipMouseup.bind(that);
					button.textContent = 'U';
					button.style.textDecoration = 'underline';
					return button;
				})(button.cloneNode()));
				that.elements.command.wrap.appendChild(that.elements.command.blockquote = (function(button) {
					button['storage'] = {
						'command': 'blockquote'
					};
					button.onmousedown = setTextTooltipMousedown.bind(that); 
					button.onmouseup = setTextTooltipMouseup.bind(that);
					button.textContent = '"';
					return button;
				})(button.cloneNode()));
				that.elements.command.wrap.appendChild(that.elements.command.createLink = (function(button) {
					button['storage'] = {
						'command': 'createLink'
					};
					button.onmousedown = setTextTooltipMousedown.bind(that); 
					button.onmouseup = setTextTooltipMouseup.bind(that);
					button.textContent = '#';
					
					// option
					that.elements.other.link = {};
					that.elements.other.link.wrap = document.createElement("div"); // link option box
					that.elements.other.link.input = document.createElement("input");
					that.elements.other.link.wrap.appendChild(that.elements.other.link.input);
					that.elements.other.wrap.appendChild(that.elements.other.link.wrap);
					// style
					that.elements.other.link.wrap.style.cssText = 'display: none;';
					// event
					that.elements.other.link.input.onblur = setTextTooltipLinkBlur.bind(that);
					that.elements.other.link.input.onkeydown = setTextTooltipLinkKeydown.bind(that);
					return button;
				})(button.cloneNode()));

				// body 삽입
				document.body.appendChild(fragment);
			})();
		};
		EditText.prototype.change = function(settings) {
			var that = this;
			
			// settings
			that.settings = module.setSettings(that.settings, settings);

			// target
			that.settings.target = (typeof that.settings.target === 'string' && /^[a-z]+/i.test(that.settings.target) ? '#' + that.settings.target : that.settings.target);
			that.elements.target = (typeof that.settings.target === 'object' && that.settings.target.nodeType ? that.settings.target : $(that.settings.target).get(0));

			return that;
		};
		// 텍스트 에디터 툴바 메뉴(각 기능) 현재 selection 에 따라 최신화
		EditText.prototype.setTextTooltipMenuState = function() {
			//console.log('setTextTooltipMenuState');
			/*
			현재 포커스 위치의 element 에서 부모(parentNode)노드를 검색하면서,
			텍스트 에디터메뉴에 해당하는 태그가 있는지 여부에 따라
			해당 버튼에 on/off 효과를 준다.
			*/
			var that = this;
			var key;
			if(module.isSelection() && module.getRange()) {
				for(key in that.elements.command) { // 버튼 선택 효과 초기화
					if(key === 'wrap') {
						continue;
					}
					//that.elements.command[key].classList.remove('active');
					that.elements.command[key].style.color = 'rgb(44, 45, 46)';
					that.elements.command[key].style.background = 'none';
				}
				// 현재노드 상위 검색
				module.getParent(
					module.selection.focusNode,
					null,
					function(node) {
						return typeof node.nodeName !== 'undefined' && typeof node.style !== 'undefined';
					},
					function(node, result) {
						//console.log(node.nodeName.toLowerCase());
						// style 확인
						/*
						var key;
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
								that.elements.command.bold.style.color = 'rgb(255, 255, 255)';
								that.elements.command.bold.style.backgroundColor = 'rgb(226, 69, 69)';
								break;
							case 'i':
							case 'em': // IE
								that.elements.command.italic.style.color = 'rgb(255, 255, 255)';
								that.elements.command.italic.style.backgroundColor = 'rgb(226, 69, 69)';
								break;
							case 'strike':
								that.elements.command.strikethrough.style.color = 'rgb(255, 255, 255)';
								that.elements.command.strikethrough.style.backgroundColor = 'rgb(226, 69, 69)';
								break;
							case 'u':
								that.elements.command.underline.style.color = 'rgb(255, 255, 255)';
								that.elements.command.underline.style.backgroundColor = 'rgb(226, 69, 69)';
								break;
							case "h1":
								that.elements.command.h1.style.color = 'rgb(255, 255, 255)';
								that.elements.command.h1.style.backgroundColor = 'rgb(226, 69, 69)';
								break;
							case "h2":
								that.elements.command.h2.style.color = 'rgb(255, 255, 255)';
								that.elements.command.h2.style.backgroundColor = 'rgb(226, 69, 69)';
								break;
							case "h3":
								that.elements.command.h3.style.color = 'rgb(255, 255, 255)';
								that.elements.command.h3.style.backgroundColor = 'rgb(226, 69, 69)';
								break;
							case "blockquote":
								that.elements.command.blockquote.style.color = 'rgb(255, 255, 255)';
								that.elements.command.blockquote.style.backgroundColor = 'rgb(226, 69, 69)';
								break;
							case 'a':
								that.elements.command.createLink.style.color = 'rgb(255, 255, 255)';
								that.elements.command.createLink.style.backgroundColor = 'rgb(226, 69, 69)';
								break;
						}
					}
				);
			}
		};
		// 텍스트 에디터 툴바 위치 설정 (보이기/숨기기)
		EditText.prototype.setTextTooltipMenuPostion = function(parameter) {
			//console.log('setTextTooltipMenuPostion');
			var that = this;

			var parameter = parameter || {};
			var toggle = parameter['toggle'];

			var clientRectBounds;
			var tooltip_width, tooltip_height;
			var top = 0, left = 0;

			if(module.isCollapsed() || typeof module.selection !== 'object' || toggle === 'hide') {
				// 툴바숨기기
				that.elements.tooltip.style.display = "none";
			}else if(module.getRange()) {
				that.elements.tooltip.style.display = "block"; // 렌더링 상태에서 offsetWidth, offsetHeight 측정
				// 툴팁 크기
				tooltip_width = that.elements.tooltip.offsetWidth;
				tooltip_height = that.elements.tooltip.offsetHeight;
				// top / left
				clientRectBounds = module.selection.getRangeAt(0).getBoundingClientRect();
				top = (clientRectBounds.top - tooltip_height) - 5;
				if(top < 0) {
					top = clientRectBounds.bottom + 5; // 툴팁 하단에 출력되도록 변경
					that.elements.tooltip.style.borderTop = '1px solid rgba(231, 68, 78, .86)';
					that.elements.tooltip.style.borderBottom = 'none';
				}else {
					that.elements.tooltip.style.borderBottom = '1px solid rgba(231, 68, 78, .86)';
					that.elements.tooltip.style.borderTop = 'none';
				}
				top += window.pageYOffset; // scroll
				left = Math.round((clientRectBounds.left + clientRectBounds.right) / 2);
				left -= Math.floor(tooltip_width / 2);
				if(left < 0) {
					left = 0;
				}else if((left + tooltip_width) > Math.max(document.body.scrollWidth, document.documentElement.scrollWidth, document.body.offsetWidth, document.documentElement.offsetWidth, document.documentElement.clientWidth)) {
					left = left - ((left + tooltip_width) - Math.max(document.body.scrollWidth, document.documentElement.scrollWidth, document.body.offsetWidth, document.documentElement.offsetWidth, document.documentElement.clientWidth));
				}
				left += window.pageXOffset; // scroll
				//
				that.elements.tooltip.style.top = top + "px";
				that.elements.tooltip.style.left = left + "px";
			}
		};
		// 툴팁 보이기
		EditText.prototype.setTooltipToggle = function() {
			var that = this;

			// 텍스트 / 멀티미디어 툴팁 중 하나만 보여야 한다.
			module.setSelection();
			if(that.settings.tooltip === true) {
				if(module.isSelection() && (!that.elements.target.contains(module.selection.focusNode) || (module.selection.focusNode.nodeType === 1 && /figure|img/.test(module.selection.focusNode.nodeName.toLowerCase())))) {
					/*
					console.log('----------');
					console.dir(module.selection);
					// 시작노드
					console.log('anchorNode.nodeName: ' + module.selection.anchorNode.nodeName);
					console.log('anchorNode.nodeValue: ' + module.selection.anchorNode.nodeValue);
					console.log('anchorNode.nodeType: ' + module.selection.anchorNode.nodeType);
					// 끝노드
					console.log('focusNode.nodeName: ' + module.selection.focusNode.nodeName);
					console.log('focusNode.nodeValue: ' + module.selection.focusNode.nodeValue);
					console.log('focusNode.nodeType: ' + module.selection.focusNode.nodeType);
					*/
					that.setTextTooltipMenuPostion({'toggle': 'hide'});
				}else {
					that.setTextTooltipMenuPostion();
				}
				that.setTextTooltipMenuState();
			}else {
				that.setTextTooltipMenuPostion({'toggle': 'hide'});
			}
		};
		EditText.prototype.on = function() {
			var that = this;

			// reset
			that.off();

			// contentEditable
			//console.log(that.elements.target);
			//console.log(that.elements.target.contentEditable);
			//console.log(that.elements.target.isContentEditable);
			if(!that.elements.target.isContentEditable) {
				that.elements.target.contentEditable = true; // 해당 element 내부 수정가능하도록 설정
			}

			// 마우스 이벤트
			$(document).on(env.event.down + '.EVENT_MOUSEDOWN_TEXTEDIT', function(e) {
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				var self = event && event.currentTarget; // event listener element
				var target = event && (event.target || event.srcElement); // event 가 발생한 element

				module.setSelection();
				that.setTooltipToggle();
			});
			$(document).on(env.event.up + '.EVENT_MOUSEUP_TEXTEDIT', function(e) {
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				var self = event && event.currentTarget; // event listener element
				var target = event && (event.target || event.srcElement); // event 가 발생한 element

				module.setSelection();
				that.setTooltipToggle();
			});
			
			// 키보드 이벤트
			$(that.elements.target).on('keydown.EVENT_KEYDOWN_TEXTEDIT', function(e) {
				//console.log('setContenteditableKeydown');
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event

				//console.log('keydown');
				module.setSelection();

				// getSelection 선택된 node
				if(module.isSelection()) {
					/*if(event.keyCode === 13) { // keyCode 13: enter
						// 현재노드 상위 검색
						module.getParent( 
							module.selection.anchorNode,
							that.elements.target,
							function(node) {
								switch(node.nodeName.toLowerCase()) {
									case 'p':

										break;
									default:
										return that.elements.target.isEqualNode(node);
										break;
								}
							},
							function(node, result) {
								return node;
							}
						);
					}*/
				}
			});
			$(that.elements.target).on('keyup.EVENT_KEYUP_TEXTEDIT', function(e) {
				//console.log('setContenteditableKeyup');
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				var insertedNode, unwrap, node, parent;

				//console.log('keyup');
				module.setSelection();

				// getSelection 선택된 node
				if(module.isSelection()) {
					if(event.keyCode === 13) { // keyCode 13: enter
						// DIV 내부에서 엔터를 눌렀을 경우 div 내부에서 br로 처리되므로 p 태그로 변경되도록 처리한다.
						if(module.selection.anchorNode.nodeType !== 1 || module.selection.anchorNode.nodeName.toLowerCase() !== 'p' || !(/block|inline-block/i.test(module.getDisplay(module.selection.anchorNode)))) {
							// 현재노드 상위 검색
							if(module.getParent( 
								module.selection.anchorNode,
								that.elements.target,
								function(node) {
									if(/code|pre/.test(node.nodeName.toLowerCase())) {
										return true;
									}
								},
								function(node, result) {
									return result;
								}
							) !== true) {
								module.setFormatBlock("p");
							}
						}
					}

					// -, *, 1. 입력에 따른 목록태그 변환
					// isCollapsed: 셀렉션의 시작지점과 끝지점이 동일한지의 여부
					// nodeValue: Text와 Comment 노드에서 실제 텍스트 문자열 추출
					/*if(module.selection.isCollapsed && module.selection.anchorNode.nodeValue && module.selection.anchorNode.parentNode.nodeName !== "LI") { 
						//console.log('module.selection.isCollapsed: ' + module.selection.isCollapsed);
						
						if(module.selection.anchorNode.nodeValue.match(/^[-*]\s/)) { 
							// "- 텍스트작성" 또는 "* 텍스트작성" 행태로 글을 작성했을 경우 목록태그로 변경
							document.execCommand('insertUnorderedList'); // ul 태그 생성
							module.selection.anchorNode.nodeValue = module.selection.anchorNode.nodeValue.substring(2);
							insertedNode = module.getParent( // 현재노드 상위로 존재하는 ul 태그 반환
								module.selection.anchorNode,
								null,
								function(node) {
									return node.nodeName.toLowerCase() === 'ul';
								},
								function(node, result) {
									return node;
								}
							);
						}else if(module.selection.anchorNode.nodeValue.match(/^1\.\s/)) { 
							// "1. 텍스트작성" 형태로 글을 작성했을 경우 목록태그로 변경
							document.execCommand('insertOrderedList'); // ol 태그 생성
							module.selection.anchorNode.nodeValue = module.selection.anchorNode.nodeValue.substring(3);
							insertedNode = module.getParent( // 현재노드 상위로 존재하는 ol 태그 반환
								module.selection.anchorNode,
								null,
								function(node) {
									return node.nodeName.toLowerCase() === 'ol';
								},
								function(node, result) {
									return node;
								}
							);
						}

						// ul 또는 ol 로 변경되었고, 현재 부모 태그가 p 또는 div 의 경우
						// p 또는 div 내부에 목록태그가 존재하지 않도록, 해당위치를 목록태그로 대체한다.
						unwrap = insertedNode && ["ul", "ol"].indexOf(insertedNode.nodeName.toLocaleLowerCase()) >= 0 && ["p", "div"].indexOf(insertedNode.parentNode.nodeName.toLocaleLowerCase()) >= 0;
						if(unwrap) {
							node = module.selection.anchorNode;
							parent = insertedNode.parentNode;
							parent.parentNode.insertBefore(insertedNode, parent);
							parent.parentNode.removeChild(parent);
							// 포커스(커서) 이동
							module.setCusor(node);
						}
					}*/

					that.setTooltipToggle();
				}
			});

			// 커서 (focus)
			$(that.elements.target).on('blur.EVENT_BLUR_TEXTEDIT', function(e) {
				that.setTooltipToggle();
			});

			// contenteditable paste text only
			// http://stackoverflow.com/questions/12027137/javascript-trick-for-paste-as-plain-text-in-execcommand
			$(that.elements.target).on('paste.EVENT_PASTE_TEXTEDIT', function(e) {
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				var text = '';

				// 기본 이벤트 중지
				event.preventDefault();
				if(event.clipboardData) {
					text = event.clipboardData.getData('text/plain');
				}else if(window.clipboardData) {
					text = window.clipboardData.getData('Text');
				}
				
				// 현재노드 상위 검색
				if(module.getParent( 
					module.selection.anchorNode,
					that.elements.target,
					function(node) {
						if(/code|pre/.test(node.nodeName.toLowerCase())) {
							return true;
						}
					},
					function(node, result) {
						return result;
					}
				) === true) {
					// code, pre 는 별도의 로직으로 넣는다.
					// execCommand 사용하면 각 라인마다 p태그가 들어간다.
					(function() {
						var fragment, line;
						var range;

						fragment = document.createDocumentFragment();
						fragment.appendChild(document.createTextNode(text));
						//line = document.createTextNode('\n');
						line = document.createTextNode(' '); // \u00a0
						fragment.appendChild(line);

						range = module.selection.getRangeAt(0);
						range.deleteContents();
						range.insertNode(fragment);

						range = document.createRange(); // 크로스 브라우저 대응 작업해야 한다.
						range.setStartAfter(line);
						range.collapse(true);

						module.selection.removeAllRanges();
						module.selection.addRange(range);
					})();
				}else if(document.queryCommandSupported('insertText')) {
					document.execCommand('insertText', false, text);
				}else {
					document.execCommand('paste', false, text);
				}
			});

			// document event
			$(document).on('resize.EVENT_RESIZE_TEXTEDIT_DOCUMENT', function(e) {
				that.setTooltipToggle();
			});
			/*$(document).on(env.event.up + '.EVENT_MOUSEUP_TEXTEDIT_DOCUMENT', function(e) {
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				var self = event && event.currentTarget; // event listener element
				var target = event && (event.target || event.srcElement); // event 가 발생한 element

				// 툴팁내부 클릭된 것인지 확인
				if(!that.elements.tooltip.contains(event.target)) {
					console.log('document mouseup');
					setTimeout(function() {
						module.setSelection();
						that.setTooltipToggle();
					}, 1);
				}
			});*/
		};
		EditText.prototype.off = function() {
			var that = this;

			// tooltip
			that.setTextTooltipMenuPostion({'toggle': 'hide'});

			// 마우스 이벤트
			$(document).off('.EVENT_MOUSEDOWN_TEXTEDIT')
			$(document).off('.EVENT_MOUSEUP_TEXTEDIT');

			// 키보드 이벤트
			$(that.elements.target).off('.EVENT_KEYDOWN_TEXTEDIT');
			$(that.elements.target).off('.EVENT_KEYUP_TEXTEDIT');
			$(that.elements.target).off('.EVENT_BLUR_TEXTEDIT');
			$(that.elements.target).off('.EVENT_PASTE_TEXTEDIT');

			// document event
			$(document).off('.EVENT_RESIZE_TEXTEDIT_DOCUMENT');
			//$(document).off('.EVENT_MOUSEUP_TEXTEDIT_DOCUMENT');
		};

		return EditText;
	})();

	// 텍스트를 제외한 여러 기능 (이미지, 동영상, 코드 등)
	var EditMulti = (function() {
		/*
		 * 인스턴스 생성시 메모리 관리를 위해 
		 * this 내부 함수로 두지 않고 스코프체이닝을 이용한 별도 함수로 
		 * 외부에 선언했음
		 */
		// 이미지 파일 선택 - input file 이벤트
		var setImageInputChange = (function() {
			if('FileReader' in window) { // IE10 이상
				// html5 FileReader
				return function(e, form, input, id, wrap) {
					var that = this;
					var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
					var self = event && event.currentTarget; // event listener element
					var target = event && (event.target || event.srcElement); // event 가 발생한 element
					var files = self.files;
					var i, max;

					for(i=0, max=files.length; i<max; i++) {
						(function(file) {
							var reader = new FileReader();
							reader.readAsDataURL(file); // base64
							reader.onload = function(e) {
								// 이미지 삽입
								that.put({'type': 'image', 'id': id, 'data': e.target.result});

								// 생성된 tag 삭제
								form.parentNode.removeChild(form);
							};
						})(files[i]);
					}
				};
			}else {
				// Server Submit
				return function(e, form, input) {
					var that = this;
					var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
					var self = event && event.currentTarget; // event listener element
					var target = event && (event.target || event.srcElement); // event 가 발생한 element
					var name = module.getKey();
					var iframe = document.createElement('iframe');

					// iframe 생성
					iframe.style.cssText = '';
					iframe.setAttribute('name', name);
					iframe.setAttribute('width', '0');
					iframe.setAttribute('height', '0');
					document.body.appendChild(iframe);

					// submit
					form.setAttribute('target', name);
					form.submit();
					iframe.onload = function() {
						try {
							// 생성된 tag 삭제
							form.parentNode.removeChild(form);
							iframe.parentNode.removeChild(iframe);
						}catch(e) {}
					};
				};
			}
		})();
		// 이미지 업로드 (파일찾기실행)
		var setImageTooltipMousedown = function(e) { 
			var that = this;
			var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
			var self = event && event.currentTarget; // event listener element
			var target = event && (event.target || event.srcElement); // event 가 발생한 element
			var fragment = document.createDocumentFragment();
			var wrap, id; // 이미지를 감싸는 div
			var form = document.createElement('form');
			var input = document.createElement('input'); // file input
			var hidden1 = document.createElement('input'); // 에디터 key (key에 해당하는 에디터)
			var hidden2 = document.createElement('input'); // file 넣을 위치 id
			var setInsertBeforeWrap = function(position) { // position 기준 이전에 삽입
				var div = document.createElement("div");
				position.parentNode.insertBefore(div, position);
				return div;
			};
			var setInsertAfterWrap = function(position) { // position 기준 다음에 삽입
				var div = document.createElement("div");
				position.parentNode.insertBefore(div, position.nextSibling);
				return div;
			};
			var setAppendWrap = function(position) { // position 기준 마지막에 삽입
				var div = document.createElement("div");
				position.appendChild(div);
				// div 다음 라인에 p 태그 삽입
				// document.execCommand("formatBlock", false, "p") 방식으로 넣어야 하지만, 포커스를 옮겨서 넣는 방식을 몰라, 우선 아래와 같이 작업
				(function() {
					var p = document.createElement("p");
					p.innerHTML = '<br />';
					div.parentNode.insertBefore(p, div.nextSibling);
				})();
				return div;
			};

			event.preventDefault(); // 현재 이벤트의 기본 동작을 중단한다.
			event.stopPropagation(); // 현재 이벤트가 상위로 전파되지 않도록 중단한다.

			// 이미지를 넣을 위치 설정
			if(module.isSelection()) {
				wrap = module.getParent(
					module.selection.anchorNode,
					null,
					function(node) { // condition (검사)
						/*
						console.log('node');
						console.log(node);
						console.log(node.parentNode);
						*/
						if(!that.elements.target.contains(node) || that.elements.target.isEqualNode(node)) {
							//console.log('setAppendWrap(that.elements.target)');
							return setAppendWrap(that.elements.target);
						}else if(node.parentNode && (node.parentNode.isEqualNode(that.elements.target) || (node.parentNode.nodeType === 1 && node.parentNode.nodeName.toLowerCase() !== 'p' && /block|inline-block/i.test(module.getDisplay(node.parentNode))))) {
							//console.log('setInsertBeforeWrap(node)');
							return setInsertBeforeWrap(node);
						}/*else if(node.nodeType === 1 && (node.getAttribute('data-type') || (node.storage && node.storage.type))) {
							//console.log('setInsertAfterWrap(node)');
							return setInsertAfterWrap(node);
						}*/
					}, 
					function(node, result) { // callback (검사결과가 true의 경우)
						if(node) {
							return result;
						}
					}
				);
			}else {
				wrap = setAppendWrap(that.elements.target);
			}
			if(!wrap || typeof wrap !== 'object' || !wrap.nodeName) {
				return false;
			}
			/*
			console.log('wrap');
			console.log(wrap);
			console.log(module.selection.anchorNode);
			console.log(module.selection.focusNode);
			return;
			*/
			// 이미지를 넣을 위치를 위해 id 속성 설정
			id = module.getKey();
			wrap.className = that.settings.classes.image.wrap;
			wrap.setAttribute("id", id);
			wrap.setAttribute("data-type", "image");
			wrap.storage = {
				'type': 'image'
			};

			// FileReader 를 지원하지 않는 브라우저를 위해 iframe 기반 파일 전송
			form.appendChild(hidden2);
			form.appendChild(hidden1);
			form.appendChild(input);
			fragment.appendChild(form);

			form.style.cssText = 'position: absolute; left: -9999px; top: -9999px;';
			form.setAttribute('action', that.settings.submit.image);
			form.setAttribute('method', 'post');
			form.setAttribute('enctype', 'multipart/form-data');

			hidden2.style.cssText = '';
			hidden2.setAttribute('type', 'hidden');
			hidden2.setAttribute('name', 'id');
			hidden2.setAttribute('value', id);

			hidden1.style.cssText = '';
			hidden1.setAttribute('type', 'hidden');
			hidden1.setAttribute('name', 'key');
			hidden1.setAttribute('value', that.settings.key);

			input.style.cssText = '';
			input.setAttribute('type', 'file');
			input.setAttribute('name', 'apiEditorImages[]');
			input.setAttribute('accept', 'image/*');
			input.setAttribute('multiple', 'multiple');

			input.onchange = function(e) {
				// 이미지 첨부 (이미지를 선택했을 경우 실행된다.)
				setImageInputChange.call(that, e, form, input, id, wrap);				
			};
			input.click(); // 실행

			document.body.appendChild(fragment);
		};
		var setCodeTooltipMousedown = function(e) {
			var that = this;
			var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
			var self = event && event.currentTarget; // event listener element
			var target = event && (event.target || event.srcElement); // event 가 발생한 element
			var fragment = document.createDocumentFragment();
			var div = document.createElement("div"); // 코드를 감싸는 div
			var pre = document.createElement("pre");
			var code = document.createElement("code");
			var p = document.createElement("p");

			event.preventDefault(); // 현재 이벤트의 기본 동작을 중단한다.
			event.stopPropagation(); // 현재 이벤트가 상위로 전파되지 않도록 중단한다.

			// 정보 구성
			div.className = that.settings.classes.code.wrap;
			div.setAttribute("data-type", "code");
			div.storage = {
				'type': 'code'
			};

			// element 삽입
			fragment.appendChild(div);
			fragment.appendChild(p);
			div.appendChild(pre);
			pre.appendChild(code);
			code.innerHTML = '<br />';
			p.innerHTML = '<br />';
			module.getParent(
				module.selection.anchorNode,
				null,
				function(node) { // condition (검사)
					if(!that.elements.target.contains(node) || that.elements.target.isEqualNode(node)) {
						return that.elements.target.appendChild(fragment);
					}else if(node.parentNode && (node.parentNode.isEqualNode(that.elements.target) || (node.parentNode.nodeType === 1 && node.parentNode.nodeName.toLowerCase() !== 'p' && /block|inline-block/i.test(module.getDisplay(node.parentNode))))) {
						return node.parentNode.insertBefore(fragment, node);
					}
				}, 
				function(node, result) { // callback (검사결과가 true의 경우)
					if(node) {
						return result;
					}
				}
			);

			// 포커스(커서) 이동
			module.setCusor(code);
		};
		var setLineTooltipMousedown = function(e) {
			var that = this;
			var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
			var self = event && event.currentTarget; // event listener element
			var target = event && (event.target || event.srcElement); // event 가 발생한 element
			var fragment = document.createDocumentFragment();
			var div = document.createElement("div");
			var hr = document.createElement("hr");
			var p = document.createElement("p");

			event.preventDefault(); // 현재 이벤트의 기본 동작을 중단한다.
			event.stopPropagation(); // 현재 이벤트가 상위로 전파되지 않도록 중단한다.

			// 정보 구성
			div.className = that.settings.classes.line.wrap;
			div.setAttribute("data-type", "line");
			div.storage = {
				'type': 'line'
			};
			hr.className = that.settings.classes.line.hr;

			// element 삽입
			div.appendChild(hr);
			fragment.appendChild(div);
			fragment.appendChild(p);
			p.innerHTML = '<br />';
			module.getParent(
				module.selection.anchorNode,
				null,
				function(node) { // condition (검사)
					if(!that.elements.target.contains(node) || that.elements.target.isEqualNode(node)) {
						return that.elements.target.appendChild(fragment);
					}else if(node.parentNode && (node.parentNode.isEqualNode(that.elements.target) || (node.parentNode.nodeType === 1 && node.parentNode.nodeName.toLowerCase() !== 'p' && /block|inline-block/i.test(module.getDisplay(node.parentNode))))) {
						return node.parentNode.insertBefore(fragment, node);
					}
				}, 
				function(node, result) { // callback (검사결과가 true의 경우)
					if(node) {
						return result;
					}
				}
			);

			// 포커스(커서) 이동
			module.setCusor(p);
		};

		// public
		var EditMulti = function(settings) {
			var that = this;
			that.settings = {
				'key': 'editor', 
				'target': null,
				'image': true, // 이미지 사용여부
				'video': false, // 비디오 사용여부
				'code': true, // 코드 사용여부
				'line': true, // 구분선 사용여부
				'tooltip': {
					'image': {
						'put': true, // 이미지 넣기 툴팁 보이기 / 숨기기
						'location': true // 이미지 위치 수정 툴팁 보이기 / 숨기기
					}
				},
				'size': {
					'image': {
						'min': {
							'width': 0,
							'height': 0
						},
						'max': {
							'width': 0,
							'height': 0
						}
					},
					'video': {
						'min': {
							'width': 0,
							'height': 0
						},
						'max': {
							'width': 0,
							'height': 0
						}
					}
				},
				'submit': {
					'image': '//makestory.net/files/editor', // 이미지 파일 전송 url
				},
				// element 에 설정할 class 속성값
				'classes': {
					'image': {
						'wrap': 'editor-image-wrap', // 이미지 감싸는 element
						'wide': 'editor-image-wide', // 이미지 와이드
						'left': 'editor-image-wrap-left', // 이미지 왼쪽 글자 오른쪽
						'right': 'editor-image-wrap-right', // 이미지 오른쪽 글자 왼쪽
						'figure': 'editor-image-figure', // img 태그 감싸는 element
						'img': 'editor-image-img',
						'figcaption': 'editor-image-figcaption'
					},
					'video': {
						'wrap': 'editor-video-wrap'
					},
					'code': {
						'wrap': 'editor-code-wrap'
					},
					'line': {
						'wrap': 'editor-line-wrap',
						'hr': 'editor-line-hr'
					}
				},
				'callback': {
					'init': null
				}
			};
			that.elements = {
				'target': null,
				'tooltip': null,
				'command': {
					'wrap': null
				},
				'other': {
					'wrap': null
				}
			};

			// settings
			that.change(settings);

			// init
			(function() {
				// element 생성
				var fragment = document.createDocumentFragment();
				var label;

				// 툴바
				that.elements.tooltip = document.createElement("div");
				that.elements.tooltip.style.cssText = 'transition: all .05s ease-out; position: absolute; color: rgb(44, 45, 46); border-radius: 3px; display: none;';
				that.elements.tooltip.appendChild(that.elements.command.wrap = document.createElement("div"));
				that.elements.tooltip.appendChild(that.elements.other.wrap = document.createElement("div"));
				fragment.appendChild(that.elements.tooltip);

				// 에디터 버튼
				label = document.createElement('label'); // input file 을 실행하기 위해 label tag 사용
				label.style.cssText = 'display: block; margin: 2px 4px; background: none; border: 0px; outline: none; cursor: pointer; -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;';
				if(that.settings.image === true) {
					that.elements.command.wrap.appendChild(that.elements.command.insertImage = (function(label) {
						label['storage'] = {
							'command': 'insertImage'
						};
						label.onmousedown = setImageTooltipMousedown.bind(that);
						//label.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" x="0px" y="0px" width="22" height="22" viewBox="0 0 368 368" style="fill: rgb(44, 45, 46);"><path d="M328,32H40C18,32,0,50,0,72v224c0,22,18,40,40,40h288c22,0,40-18,40-40V72C368,50,350,32,328,32z M352,185.6l-38-38 c-6.4-6.4-16-6.4-22.4,0L200,238.8l-0.4-0.4L153.2,192c-6-6-16.4-6-22.4,0l-39.2,39.2c-3.2,3.2-3.2,8,0,11.2 c3.2,3.2,8,3.2,11.2,0l39.2-39.2l46.4,46.4l0.4,0.4l-32.4,32.4c-3.2,3.2-3.2,8,0,11.2c1.6,1.6,3.6,2.4,5.6,2.4s4-0.8,5.6-2.4 l135.2-134.8l47.6,47.6c0.4,0.4,1.2,0.8,1.6,1.2V296c0,13.2-10.8,24-24,24H40c-13.2,0-24-10.8-24-24V72c0-13.2,10.8-24,24-24h288 c13.2,0,24,10.8,24,24V185.6z" /><path d="M72.4,250.4l-8,8c-3.2,3.2-3.2,8,0,11.2C66,271.2,68,272,70,272s4-0.8,5.6-2.4l8-8c3.2-3.2,3.2-8,0-11.2 C80.4,247.2,75.6,247.2,72.4,250.4z" /><path d="M88,80c-22,0-40,18-40,40s18,40,40,40s40-18,40-40S110,80,88,80z M88,144c-13.2,0-24-10.8-24-24s10.8-24,24-24 s24,10.8,24,24S101.2,144,88,144z" /></svg>';
						label.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" x="0px" y="0px" width="22" height="22" viewBox="0 0 64 64" style="fill: rgb(44, 45, 46);"><path d="M0,3.26315v57.4737015h64V3.26315H0z M62,5.2631502V34.480751L47.1523018,20.5346508 c-0.1992035-0.1875-0.4580002-0.2890015-0.7422028-0.2695007c-0.2733994,0.0156002-0.5282974,0.1425991-0.7059975,0.352499 L28.4267006,41.04245L15.4111004,30.3715496c-0.3984003-0.3270988-0.9863005-0.2967987-1.3496008,0.075201L2,42.8066483V5.2631502 H62z M2,58.7368507V45.6702499l12.8525-13.1707001l13.0684004,10.7137985 c0.4228001,0.347702,1.044899,0.2901001,1.3973999-0.1278992l17.2325001-20.3720989L62,37.2237511v21.5130997H2z" /><path d="M26,26.2631493c3.8593006,0,7-3.1406002,7-7c0-3.8592997-3.1406994-6.999999-7-6.999999 c-3.8593998,0-7,3.1406994-7,6.999999C19,23.1225491,22.1406002,26.2631493,26,26.2631493z M26,14.2631502 c2.7567997,0,5,2.2431993,5,4.999999c0,2.7569008-2.2432003,5-5,5c-2.7569008,0-5-2.2430992-5-5 C21,16.5063496,23.2430992,14.2631502,26,14.2631502z" /></svg>';
						//label.textContent = '/#/';
						return label;
					})(label.cloneNode()));
				}
				if(that.settings.video === true) {
					that.elements.command.wrap.appendChild(that.elements.command.insertVideo = (function(label) {
						label['storage'] = {
							'command': 'insertVideo'
						};
						//label.onmousedown = setImageTooltipMousedown.bind(that);
						label.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" x="0px" y="0px" width="22" height="22" viewBox="0 0 64 64" style="fill: rgb(44, 45, 46);"><path d="M42.4472008,36.1054993l-16-8c-0.3105011-0.1542988-0.6787014-0.1396999-0.9726009,0.0439014 C25.1795998,28.3320007,25,28.6532993,25,29v16c0,0.3466988,0.1795998,0.6679993,0.4745998,0.8506012 C25.6347008,45.9501991,25.8173008,46,26,46c0.1532993,0,0.3055992-0.0351982,0.4472008-0.1054993l16-8 C42.7860985,37.7246017,43,37.3788986,43,37S42.7860985,36.2753983,42.4472008,36.1054993z M27,43.3818016V30.6182003 L39.7635994,37L27,43.3818016z" /><path d="M60,5h-56C1.7909007,5,0.0000008,6.7908001,0.0000008,9v46c0,2.2092018,1.7908999,4,3.9999998,4h56 c2.2090988,0,4-1.7907982,4-4V9C64,6.7908001,62.2090988,5,60,5z M62,9v8h-8.3283005l2.6790009-10H60 C61.1026993,7,62,7.8972001,62,9z M21.2804241,7l-2.6790009,10H9.6508007l2.6788998-10H21.2804241z M23.3507004,7h8.9297218 l-2.6789989,10h-8.9297237L23.3507004,7z M34.3507004,7h8.9297218l-2.678997,10h-8.9297256L34.3507004,7z M45.3507004,7h8.9297218 l-2.678997,10h-8.9297256L45.3507004,7z M4.0000005,7h6.2594237L7.5805006,17H2.0000007V9 C2.0000007,7.8972001,2.8972008,7,4.0000005,7z M60,57h-56c-1.1027997,0-1.9999998-0.8972015-1.9999998-2V19h60v36 C62,56.1027985,61.1026993,57,60,57z" /></svg>';
						//label.textContent = '[]';
						return label;
					})(label.cloneNode()));
				}
				if(that.settings.code === true) {
					that.elements.command.wrap.appendChild(that.elements.command.insertCode = (function(label) {
						label['storage'] = {
							'command': 'insertCode'
						};
						label.onmousedown = setCodeTooltipMousedown.bind(that);
						//label.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" x="0px" y="0px" width="22" height="22" viewBox="0 0 511 511" style="fill: rgb(44, 45, 46);"><path d="M455.5,40h-400C24.897,40,0,64.897,0,95.5v320C0,446.103,24.897,471,55.5,471h400c30.603,0,55.5-24.897,55.5-55.5v-320 C511,64.897,486.103,40,455.5,40z M496,415.5c0,22.332-18.168,40.5-40.5,40.5h-400C33.168,456,15,437.832,15,415.5v-320 C15,73.168,33.168,55,55.5,55h400c22.332,0,40.5,18.168,40.5,40.5V415.5z" /><path d="M471.5,120h-432c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5h432c4.142,0,7.5-3.357,7.5-7.5S475.642,120,471.5,120z" /><path d="M55.5,95c1.98,0,3.91-0.8,5.3-2.2c1.4-1.39,2.2-3.32,2.2-5.3c0-1.971-0.8-3.91-2.2-5.3c-1.39-1.4-3.32-2.2-5.3-2.2 s-3.91,0.8-5.3,2.2c-1.4,1.39-2.2,3.329-2.2,5.3c0,1.979,0.8,3.91,2.2,5.3C51.59,94.2,53.52,95,55.5,95z" /><path d="M119.5,95c1.97,0,3.91-0.8,5.3-2.2c1.4-1.39,2.2-3.32,2.2-5.3c0-1.971-0.8-3.91-2.2-5.3c-1.39-1.4-3.33-2.2-5.3-2.2 c-1.98,0-3.91,0.8-5.3,2.2c-1.4,1.39-2.2,3.329-2.2,5.3c0,1.979,0.8,3.91,2.2,5.3C115.59,94.2,117.52,95,119.5,95z" /><path d="M87.5,95c1.98,0,3.91-0.8,5.3-2.2c1.4-1.39,2.2-3.32,2.2-5.3c0-1.971-0.8-3.91-2.2-5.3c-1.39-1.4-3.32-2.2-5.3-2.2 c-1.97,0-3.91,0.8-5.3,2.2c-1.4,1.39-2.2,3.329-2.2,5.3c0,1.979,0.8,3.91,2.2,5.3C83.59,94.2,85.53,95,87.5,95z" /><path d="M188.803,210.196c-2.929-2.928-7.678-2.928-10.606,0l-80,80c-2.929,2.93-2.929,7.678,0,10.607l80,80 c1.464,1.464,3.384,2.196,5.303,2.196s3.839-0.732,5.303-2.196c2.929-2.93,2.929-7.678,0-10.607L114.106,295.5l74.697-74.696 C191.732,217.874,191.732,213.126,188.803,210.196z" /><path d="M332.803,210.196c-2.929-2.928-7.678-2.928-10.606,0c-2.929,2.93-2.929,7.678,0,10.607l74.697,74.696l-74.697,74.696 c-2.929,2.93-2.929,7.678,0,10.607c1.464,1.464,3.384,2.196,5.303,2.196s3.839-0.732,5.303-2.196l80-80 c2.929-2.93,2.929-7.678,0-10.607L332.803,210.196z" /><path d="M290.063,200.451c-3.892-1.412-8.195,0.594-9.611,4.485l-64,176c-1.416,3.894,0.592,8.196,4.485,9.612 c0.846,0.308,1.711,0.453,2.563,0.453c3.064,0,5.941-1.893,7.049-4.938l64-176C295.964,206.17,293.956,201.867,290.063,200.451z" /></svg>';
						label.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" x="0px" y="0px" width="22" height="22" viewBox="0 0 64 64" style="fill: rgb(44, 45, 46);"><path d="M39.0732994,41.3769989C39.2314987,41.7645988,39.6054993,42,40,42c0.1259995,0,0.2528992-0.0233994,0.3769989-0.0732002 l12-4.8790016C52.7509995,36.8955002,52.9960976,36.5331993,53,36.1299019 c0.0038986-0.4043007-0.2362785-0.7705002-0.607399-0.9287033l-12-5.1210995 c-0.5038795-0.2148991-1.0956993,0.0185013-1.3125,0.5273018c-0.2168007,0.5077991,0.0194969,1.0956993,0.527298,1.3125 l9.7919998,4.1786976l-9.7762985,3.9746017C39.1113014,40.2812004,38.8652,40.8652,39.0732994,41.3769989z" /><path d="M13.6231003,37.0477982l12,4.8790016C25.7471008,41.9766006,25.8740005,42,26,42 c0.3945007,0,0.7686005-0.2354012,0.9267998-0.6230011c0.2080002-0.5117989-0.0380783-1.0957985-0.549799-1.3037987 l-9.7763996-3.9746017l9.7919998-4.1786976c0.5077991-0.2168007,0.7441196-0.8047009,0.5272999-1.3125 c-0.217701-0.5088005-0.8095016-0.7431011-1.3125-0.5273018l-12,5.1210995 c-0.3711004,0.1582031-0.6113005,0.5244026-0.6073999,0.9287033 C13.0039005,36.5331993,13.2490005,36.8955002,13.6231003,37.0477982z" /><path d="M28.5937996,45.9141006C28.7255993,45.9726982,28.8633003,46,28.9990005,46 c0.3837986,0,0.7490997-0.2216988,0.9151001-0.5937996l8-18c0.2236214-0.5048008-0.0030022-1.0957012-0.5078011-1.3203011 c-0.5038986-0.2235985-1.094799,0.0049-1.3204002,0.5078011l-8,18 C27.8623009,45.0985985,28.0888996,45.6894989,28.5937996,45.9141006z" /><path d="M60,5h-56C1.7908008,5,0.0000008,6.7908001,0.0000008,9v5v2v39c0,2.2090988,1.7908,4,3.9999998,4h56 c2.209198,0,4-1.7909012,4-4V16v-2V9C64,6.7908001,62.209198,5,60,5z M62,55c0,1.1027985-0.8972015,2-2,2h-56 c-1.1027997,0-1.9999998-0.8972015-1.9999998-2V16h60V55z M62,14h-60V9c0-1.1027999,0.8972001-2,1.9999998-2h56 c1.1027985,0,2,0.8972001,2,2V14z" /><path d="M6.0000005,9c-0.9649997,0-1.75,0.7849998-1.75,1.75c0,0.9649,0.7850003,1.75,1.75,1.75s1.75-0.7851,1.75-1.75 C7.7500005,9.7849998,6.9650006,9,6.0000005,9z M6.0000005,11.5c-0.4141998,0-0.75-0.3358002-0.75-0.75s0.3358002-0.75,0.75-0.75 c0.4142003,0,0.75,0.3358002,0.75,0.75S6.4142008,11.5,6.0000005,11.5z" /><path d="M16,9c-0.9649992,0-1.75,0.7849998-1.75,1.75c0,0.9649,0.7850008,1.75,1.75,1.75s1.75-0.7851,1.75-1.75 C17.75,9.7849998,16.9650002,9,16,9z M16,11.5c-0.4141998,0-0.75-0.3358002-0.75-0.75S15.5858002,10,16,10 s0.75,0.3358002,0.75,0.75S16.4141998,11.5,16,11.5z" /><path d="M11.000001,9c-0.9650002,0-1.75,0.7849998-1.75,1.75c0,0.9649,0.7849998,1.75,1.75,1.75s1.75-0.7851,1.75-1.75 C12.750001,9.7849998,11.9650002,9,11.000001,9z M11.000001,11.5c-0.4142008,0-0.75-0.3358002-0.75-0.75s0.3357992-0.75,0.75-0.75 c0.4141998,0,0.75,0.3358002,0.75,0.75S11.4142008,11.5,11.000001,11.5z" /></svg>';
						//label.textContent = '</>';
						return label;
					})(label.cloneNode()));
				}
				if(that.settings.line === true) {
					that.elements.command.wrap.appendChild(that.elements.command.insertLine = (function(label) {
						label['storage'] = {
							'command': 'insertLine'
						};
						label.onmousedown = setLineTooltipMousedown.bind(that);
						label.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" width="22" height="22" viewBox="0 0 32 32" style="fill: rgb(44, 45, 46);" enable-background="new 0 0 32 32"><path d="m9,17c-2.4,0-4.6,1-7,1-1.1,0-2-0.9-2-2s0.9-2 2-2c2.4,0 4.6,1 7,1h12c2.7,0 5.3-2 8-2 1.7,0 3,1.3 3,3s-1.3,3-3,3c-2.7,0-5.3-2-8-2h-12z" /></svg>';
						//label.textContent = '--';
						return label;
					})(label.cloneNode()));
				}

				// body 삽입
				document.body.appendChild(fragment);
			})();
		};
		EditMulti.prototype.change = function(settings) {
			var that = this;
			
			// settings
			that.settings = module.setSettings(that.settings, settings);

			// target
			that.settings.target = (typeof that.settings.target === 'string' && /^[a-z]+/i.test(that.settings.target) ? '#' + that.settings.target : that.settings.target);
			that.elements.target = (typeof that.settings.target === 'object' && that.settings.target.nodeType ? that.settings.target : $(that.settings.target).get(0));

			return that;
		};
		// 멀티미디어 에디터 툴바 위치 설정 (보이기/숨기기)
		EditMulti.prototype.setMultiTooltipMenuPostion = function(parameter) {
			var that = this;

			var parameter = parameter || {};
			var toggle = parameter['toggle'];

			var clientRectBounds;
			var clientRectBounds_editor;
			var tooltip_width, tooltip_height;
			var top = 0, left = 0;
			var height = 0;
			var gap = 10; // 커서가 위치한 라인과의 거리

			if(!module.isCollapsed() || typeof module.selection !== 'object' || toggle === 'hide') {
				// 숨기기
				that.elements.tooltip.style.display = "none";
			}else if(module.isSelection()) {
				that.elements.tooltip.style.display = "block"; // 렌더링 상태에서 offsetWidth, offsetHeight 측정
				// 툴팁 크기
				tooltip_width = that.elements.tooltip.offsetWidth;
				tooltip_height = that.elements.tooltip.offsetHeight;
				// left
				clientRectBounds_editor = that.elements.target.getBoundingClientRect();
				left = (clientRectBounds_editor.left - tooltip_width) - gap;
				if(left < 0) {
					left = clientRectBounds_editor.left + gap; // 툴팁 에디터 안쪽에 출력되도록 변경
				}
				left += window.pageXOffset; // scroll
				// top
				// #text node 는 getBoundingClientRect 없음
				if(module.selection.anchorNode && 'getBoundingClientRect' in module.selection.anchorNode) {
					clientRectBounds = module.selection.anchorNode.getBoundingClientRect();
				}else if(module.selection.focusNode && 'getBoundingClientRect' in module.selection.focusNode) {
					clientRectBounds = module.selection.focusNode.getBoundingClientRect();
				}else {
					clientRectBounds = module.selection.getRangeAt(0).getBoundingClientRect();
				}
				if(clientRectBounds.top > 0) {
					height = clientRectBounds.height || clientRectBounds.bottom - clientRectBounds.top;
					if(tooltip_height > height) {
						top = clientRectBounds.top - (tooltip_height - height);
					}else {
						top = clientRectBounds.top + (height - tooltip_height);
					}
				}
				top += window.pageYOffset; // scroll
				//
				that.elements.tooltip.style.top = top + "px";
				that.elements.tooltip.style.left = left + "px";
			}
		};
		// 이미지 에디터 툴바 위치 설정
		EditMulti.prototype.setImageTooltipMenuPostion = function(parameter) {
			var that = this;

		};
		// 툴팁 보이기
		EditMulti.prototype.setTooltipToggle = function() {
			var that = this;

			// 텍스트 / 멀티미디어 툴팁 중 하나만 보여야 한다.
			module.setSelection();
			if(module.isSelection() && that.elements.target.contains(module.selection.anchorNode)/* && module.selection.focusNode.nodeType === 1*/) {
				/*
				console.log('----------');
				console.dir(module.selection);
				// 시작노드
				console.log('anchorNode.nodeName: ' + module.selection.anchorNode.nodeName);
				console.log('anchorNode.nodeValue: ' + module.selection.anchorNode.nodeValue);
				console.log('anchorNode.nodeType: ' + module.selection.anchorNode.nodeType);
				// 끝노드
				console.log('focusNode.nodeName: ' + module.selection.focusNode.nodeName);
				console.log('focusNode.nodeValue: ' + module.selection.focusNode.nodeValue);
				console.log('focusNode.nodeType: ' + module.selection.focusNode.nodeType);
				*/

				// 현재노드 상위 검색
				if(module.getParent( 
					module.selection.anchorNode,
					that.elements.target,
					function(node) {
						if(/code|pre|figcaption|figure/.test(node.nodeName.toLowerCase())) {
							return true;
						}
					},
					function(node, result) {
						return result;
					}
				) === true) {
					that.setImageTooltipMenuPostion({'toggle': 'hide'}); // 이미지 관련 툴바
					that.setMultiTooltipMenuPostion({'toggle': 'hide'});
				}else if(/img/.test(module.selection.focusNode.nodeName.toLowerCase())) {
					that.setImageTooltipMenuPostion({'toggle': 'show'}); // 이미지 관련 툴바
					that.setMultiTooltipMenuPostion({'toggle': 'hide'});
				}else {
					that.setImageTooltipMenuPostion({'toggle': 'hide'}); // 이미지 관련 툴바
					that.setMultiTooltipMenuPostion();
				}
			}else {
				that.setImageTooltipMenuPostion({'toggle': 'hide'}); // 이미지 관련 툴바
				that.setMultiTooltipMenuPostion({'toggle': 'hide'});
			}
		};
		// 에디터에 데이터 넣기
		EditMulti.prototype.put = function(parameter) {
			var that = this;

			var parameter = parameter || {};
			var type = parameter['type'];
			var id = parameter['id'] && document.getElementById(parameter['id']); // 데이터를 넣을 위치 등에 사용
			var data = parameter['data'];

			// element 의 id 기준으로 데이터를 넣는다.
			if(!id) {
				if(module.isSelection()) {
					id = module.selection.anchorNode;
				}else {
					id = that.elements.target;
				}
			}

			switch(type) {
				// 이미지 삽입
				case 'image': 
					// data 의 종류 구분 
					// url, base64, element node
					(function() {
						//var rect = id.getBoundingClientRect();
						var min_width = that.settings.size.image.min.width;
						var min_height = that.settings.size.image.min.height;
						var max_width = that.settings.size.image.max.width;
						var max_height = that.settings.size.image.max.height;
						var i, max;
						var setImage = function(result) {
							// 이미지 사이즈 확인
							var img = new Image();
							img.src = result;
							img.className = that.settings.classes.image.img;
							//img.setAttribute("class", that.settings.classes.image.img);
							img.onload = function() { // this.src 를 변경할 경우 onload 이벤트가 실행된다.
								var canvas, canvas_context;
								var figure, figcaption;
								/*
								console.log(min_width, min_height);
								console.log(max_width, max_height);
								console.log(this.width, this.height);
								*/
								this.onload = null; // 이미지 resize 후 this.src 변경시 onload 가 중복 실행되지 않도록 초기화
								if((0 < min_width && this.width < min_width) || (0 < min_height && this.height < min_height) || (0 < max_width && max_width < this.width) || (0 < max_height && max_height < this.height)) {
									// 리사이즈를 위해 캔버스 객체 생성
									canvas = document.createElement('canvas');
									canvas_context = canvas.getContext("2d");
									canvas.width = this.width;
									canvas.height = this.height;

									// 캔버스 크기 설정
									// 대응점 = 현재위치 * 대응너비 / 현재너비
									if(0 < max_width && max_width < this.width) {
										canvas.width = max_width; // 가로
										canvas.height = Math.round(max_width * this.height/this.width); // 가로에 따른 비율계산
										//canvas.height = max_height; // 세로
										//canvas.width = Math.round(max_height * this.width/this.height); // 세로에 따른 비율계산
									}
									//console.log(canvas.width, canvas.height);

									// 이미지를 캔버스에 그리기
									canvas_context.drawImage(this, 0, 0, canvas.width, canvas.height);

									// 캔버스에 그린 이미지를 다시 data-uri 형태로 변환
									this.src = canvas.toDataURL("image/png"); // 주의! src 변경에 따른 onload 콜백 중복실행 가능성
								}

								// 반응형 가로크기 제어
								img.style.maxWidth = '100%';

								// figure, figcaption
								// http://html5doctor.com/the-figure-figcaption-that.elements/
								figure = document.createElement("figure");
								figure.className = that.settings.classes.image.figure;
								figcaption = document.createElement("figcaption");
								figcaption.className = that.settings.classes.image.figcaption;
								//figcaption.innerHTML = '<br />';
								figure.appendChild(img);
								figure.appendChild(figcaption);
								id.appendChild(figure);

								// 포커스(커서) 이동
								module.setCusor(figcaption);
							};
						};

						if(Array.isArray(data)) { // 이미지 여러개
							for(i=0, max=data.length; i<max; i++) {
								setImage(data[i]);
							}
						}else {
							setImage(data);
						}
					})();
					break;
			}
		};
		EditMulti.prototype.on = function() {
			var that = this;

			// reset
			that.off();
			
			// contentEditable
			//console.log(that.elements.target);
			//console.log(that.elements.target.contentEditable);
			//console.log(that.elements.target.isContentEditable);
			if(!that.elements.target.isContentEditable) {
				that.elements.target.contentEditable = true; // 해당 element 내부 수정가능하도록 설정
			}

			// 마우스 이벤트
			$(document).on(env.event.down + '.EVENT_MOUSEDOWN_MULTIEDIT', function(e) {
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				var self = event && event.currentTarget; // event listener element
				var target = event && (event.target || event.srcElement); // event 가 발생한 element

				//console.log('mousedown');
				//console.log(target);

				module.setSelection();
				if(that.elements.target.contains(target)) {
					// 현재노드 상위 검색
					module.getParent( 
						target,
						that.elements.target,
						function(node) {
							// 해당노드 확인 (line, img, figure 등)
							if(typeof node.storage === 'object' && node.storage.type) {
								switch(node.storage.type.toLowerCase()) {
									case 'line':
										// 기본 이벤트 중지
										event.preventDefault();
										// 포커스(커서) 이동
										module.setCusor(node.nextSibling);
										break;
								}
							}
						},
						function(node, result) {
							return node;
						}
					);
				}
				that.setTooltipToggle();			
			});
			$(document).on(env.event.up + '.EVENT_MOUSEUP_MULTIEDIT', function(e) {
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				var self = event && event.currentTarget; // event listener element
				var target = event && (event.target || event.srcElement); // event 가 발생한 element

				//console.log('mouseup');
				//console.log(target);

				module.setSelection();
				that.setTooltipToggle();
			});
			
			// 키보드 이벤트
			$(that.elements.target).on('keydown.EVENT_KEYDOWN_MULTIEDIT', function(e) {
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				var self = event && event.currentTarget; // event listener element
				var target = event && (event.target || event.srcElement); // event 가 발생한 element

				//console.log('keydown');
				//console.log(module.selection.anchorNode);

				// getSelection 선택된 node
				module.setSelection();
				if(module.isSelection()) {
					switch(event.keyCode) {
						// keyCode 13: enter
						case 13: 
							// 현재노드 상위 검색
							module.getParent( 
								module.selection.anchorNode,
								that.elements.target,
								function(node) {
									switch(node.nodeName.toLowerCase()) {
										case 'figure':
											// 기본 이벤트 중지
											event.preventDefault();
											break;
										// 한개의 실행코드에 case 문을 2개 이상 여러개 줄 경우 여러번 중복 실행될 수 있다. (node 상위검색 반복문 때문)
										case 'code':
										//case 'pre':
											// 기본 이벤트 중지
											event.preventDefault();
											(function() {
												var fragment, line;
												var range;

												// 1. add a new line
												// 개행문자: \r(캐럿이 그 줄 맨 앞으로), \n(캐럿이 다음 줄)
												fragment = document.createDocumentFragment();
												fragment.appendChild(document.createTextNode('\r'));
												line = document.createTextNode('\n');
												fragment.appendChild(line);

												// 2. make the br replace selection
												range = module.selection.getRangeAt(0);
												range.deleteContents();
												range.insertNode(fragment);
												
												// 3. create a new range
												range = document.createRange(); // 크로스 브라우저 대응 작업해야 한다.
												//range.setStart(line, 0);
												//range.setEnd(line, 0);
												range.setStartAfter(line);
												range.collapse(true);

												// 4. make the cursor there
												module.selection.removeAllRanges();
												module.selection.addRange(range);
											})();
											break;
										default:
											
											break;
									}
								},
								function(node, result) {
									return node;
								}
							);
							break;

						// keyCode 9: tab
						case 9:
							// 현재노드 상위 검색
							module.getParent( 
								module.selection.anchorNode,
								that.elements.target,
								function(node) {
									switch(node.nodeName.toLowerCase()) {
										// 한개의 실행코드에 case 문을 2개 이상 여러개 줄 경우 여러번 중복 실행될 수 있다. (node 상위검색 반복문 때문)
										case 'code':
										//case 'pre':
											// 기본 이벤트 중지
											event.preventDefault();
											//document.execCommand('indent', false, null); // 들여쓰기
											(function() {
												var tab;
												var	range;									

												tab = document.createTextNode("\u0009"); // \u0009: tap
												//tab = document.createTextNode("\u00a0\u00a0\u00a0\u00a0"); // \u00a0: space
												
												// 선택위치에 삽입
												range = module.selection.getRangeAt(0);
												range.insertNode(tab);
												range.setStartAfter(tab);
												range.setEndAfter(tab); 

												module.selection.removeAllRanges();
												module.selection.addRange(range);
											})();
											break;
										default:
											
											break;
									}
								},
								function(node, result) {
									return node;
								}
							);
							break;

						// keyCode 8: backspace
						case 8:
							// 현재노드 상위 검색
							module.getParent( 
								module.selection.anchorNode,
								that.elements.target,
								function(node) {
									if(typeof node.storage === 'object' && node.storage.type) {
										/*switch(node.storage.type.toLowerCase()) {
											
										}*/
									}else {
										switch(node.nodeName.toLowerCase()) {
											case 'code':
											case 'figcaption':
												(function() {
													var text = node.textContent || node.innerText;
													if(text && text.length <= 1) {
														// 기본 이벤트 중지
														event.preventDefault();
														node.innerHTML = '<br />';
													}
												})();
												break;
											case 'img':
											case 'figure':
												// 상위로 전파 중지
												//module.preventDefault(event);
												/*
												console.log(module.selection.focusNode);
												console.log(module.selection.focusNode.parentNode);
												*/
												// 삭제
												//module.selection.focusNode.parentNode.removeChild(module.selection.focusNode);
												break;
											default:
												
												break;
										}
									}	
								},
								function(node, result) {
									return node;
								}
							);
							break;
					}
				}
			});
			$(that.elements.target).on('keyup.EVENT_KEYUP_MULTIEDIT', function(e) {
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				var self = event && event.currentTarget; // event listener element
				var target = event && (event.target || event.srcElement); // event 가 발생한 element

				//console.log('keyup');
				//console.log(module.selection.anchorNode);

				// getSelection 선택된 node
				module.setSelection();
				if(module.isSelection()) {
					switch(event.keyCode) {
						// keyCode 13: enter
						case 13: 
							// 현재노드 상위 검색
							module.getParent( 
								module.selection.anchorNode,
								that.elements.target,
								function(node) {
									switch(node.nodeName.toLowerCase()) {
										case 'figure':
											// 기본 이벤트 중지
											//event.preventDefault();

											break;
										default:
											
											break;
									}
								},
								function(node, result) {
									return node;
								}
							);
							break;

						// keyCode 8: backspace
						case 8:
							// 현재노드 상위 검색
							module.getParent( 
								module.selection.anchorNode,
								that.elements.target,
								function(node) {
									if(typeof node.storage === 'object' && node.storage.type) {
										switch(node.storage.type.toLowerCase()) {
											case 'code':
												(function() {
													var pre = node.querySelector('pre');
													var code = node.querySelector('code');
													if(!pre || !code || !(code.textContent || code.innerText)) {
														// 포커스(커서) 이동
														module.setCusor(node.previousSibling || node.nextSibling);
														// 삭제
														node.parentNode.removeChild(node);
													}
												})();
												break;
										}
									}
								},
								function(node, result) {
									return node;
								}
							);
							break;

						// keyCode: 37(left), 38(up)
						case 37:
						case 38:
						// keyCode: 39(right), 40(down)
						case 39:
						case 40:
							// 현재노드 상위 검색
							module.getParent( 
								module.selection.anchorNode,
								that.elements.target,
								function(node) {
									// 해당노드 확인 (line, img, figure 등)
									if(typeof node.storage === 'object' && node.storage.type) {
										switch(node.storage.type.toLowerCase()) {
											case 'line':
												// 포커스(커서) 이동
												if(event.keyCode === 37 || event.keyCode === 38) {
													module.setCusor(node.previousSibling || node.nextSibling);
												}else if(event.keyCode === 39 || event.keyCode === 40) {
													module.setCusor(node.nextSibling || node.previousSibling);
												}
												break;
										}
									}
								},
								function(node, result) {
									return node;
								}
							);
							break;
					};
					that.setTooltipToggle();
				}
			});

			// 커서 (focus)
			$(that.elements.target).on('blur.EVENT_BLUR_MULTIEDIT', function(e) {
				that.setTooltipToggle();
			});
		};
		EditMulti.prototype.off = function() {
			var that = this;

			// tooltip
			that.setImageTooltipMenuPostion({'toggle': 'hide'});
			that.setMultiTooltipMenuPostion({'toggle': 'hide'});

			// 마우스 이벤트
			$(document).off('.EVENT_MOUSEDOWN_MULTIEDIT');
			$(document).off('.EVENT_MOUSEUP_MULTIEDIT');

			// 키보드 이벤트
			$(that.elements.target).off('.EVENT_KEYDOWN_MULTIEDIT');
			$(that.elements.target).off('.EVENT_KEYUP_MULTIEDIT');
			$(that.elements.target).off('.EVENT_BLUR_MULTIEDIT');
		};

		return EditMulti;
	})();

	// 오픈그래프
	var OpenGraph = function(settings) {
		var that = this;
		that.settings = {
			'key': 'editor', 
			'target': null,
			'submit': '//makestory.net/opengraph', // link url 정보를 받아 meta 정보를 돌려줄 서버측 url
			'classes': {
				'wrap': 'opengraph-wrap',
				'image': 'opengraph-image',
				'text': 'opengraph-text',
				'title': 'opengraph-title',
				'description': 'opengraph-description',
				'author': 'opengraph-author'
			},
			'callback': {
				'init': null
			}
		};
		that.elements = {};

		// settings
		that.change(settings);
	};
	OpenGraph.prototype.change = function(settings) {
		var that = this;

		// settings
		that.settings = module.setSettings(that.settings, settings);

		// target
		that.settings.target = (typeof that.settings.target === 'string' && /^[a-z]+/i.test(that.settings.target) ? '#' + that.settings.target : that.settings.target);
		that.elements.target = (typeof that.settings.target === 'object' && that.settings.target.nodeType ? that.settings.target : $(that.settings.target).get(0));

		return that;
	};
	OpenGraph.prototype.put = function(parameter) { // 오픈그래프 삽입
		var that = this;

		var parameter = parameter || {};
		var node = parameter['node'];
		var url = parameter['url'] || '';
		var fragment;
		var a, div, p, comment;

		if(typeof node === 'object' && node !== null && node.nodeType && (url && regexp.url.test(url) || module.isNodeCheck(node, 'url'))) {
			url = url || node.nodeValue;
			//console.log('url: ' + url);

			(function(node, url) {
				var fragment;
				var a, div, p;
				var tmp;
				var inserted;

				// url text 를 a 링크로 변경
				//paragraph = node.nodeValue.split(/\s+/); // 띄어쓰기 기준 문단 분리

				//console.log(node);
				if(!url.match("^(http|https)://")) {
					url = "http://" + url;
				}

				// 링크 구성 (새창 등 속성 설정)
				//var comment = document.createComment('{"url":"'.url.'"}');
				a = document.createElement("a");
				a.href = url;
				a.target = '_blank';
				a.textContent = a.innerText = url;
				if(tmp = node.parentNode.insertBefore(a, node)) {
					node.parentNode.removeChild(node);
					node = tmp;
				}else {
					return false;
				}

				// 링크 정보 구성
				fragment = document.createDocumentFragment();
				div = document.createElement("div");
				p = document.createElement("p");
				fragment.appendChild(div);
				fragment.appendChild(p);
				div.setAttribute("data-type", "opengraph");
				div.storage = {
					'type': 'opengraph'
				};

				// 빈공간, 하단영역 태그 내부 기본값 (크롬 등 일부 브라우저)
				div.innerHTML = '<br />';
				p.innerHTML = '<br />';

				// insertAdjacentHTML
				//node.parentNode.replaceChild(fragment, node);
				inserted = module.getParent(
					node,
					null,
					function(node) { // condition (검사)						
						if(!that.elements.target.contains(node) || that.elements.target.isEqualNode(node)) {
							return node;
						}else if(node.parentNode && (node.parentNode.isEqualNode(that.elements.target) || (node.parentNode.nodeType === 1 && node.parentNode.nodeName.toLowerCase() !== 'p' && /block|inline-block/i.test(module.getDisplay(node.parentNode))))) {
							return node;
						}
					}, 
					function(node, result) { // callback (검사결과가 true의 경우)
						if(node) {
							return result;
						}
					}
				);
				if(!inserted || typeof inserted !== 'object' || !inserted.nodeName) {
					inserted = node;
				}
				//if(inserted.parentNode.insertBefore(fragment, inserted)) { // 링크 이전 요소에 삽입
				if(inserted.parentNode.insertBefore(fragment, inserted.nextSibling)) { // 링크 다음 요소에 삽입
					// 포커스(커서) 이동
					module.setCusor(p);

					// 오픈그래프 정보 불러오기
					$.ajax({
						'url': that.settings.submit,
						'timeout': 10000,
						'data': {'url': encodeURIComponent(url)},
						'dataType': 'json',
						'success': function(json) {
							var result = {}
							var image = '';
							if(typeof json === 'object' && json.msg === 'success') {
								//console.dir(json);
								//console.log(div);
								result = json.result;
								if(result.image) {
									image = '<div class="' + that.settings.classes.image + '" style="background-image: url(' + result.image + ');"><br /></div>';
								}else {
									image = '<div class="' + that.settings.classes.image + '"></div>';
								}
								div.innerHTML = '\
									<a href="' + url + '" target="_blank" class="opengraph-wrap" style="display: block;">\
										' + image + '\
										<div class="' + that.settings.classes.text + '">\
											<strong class="' + that.settings.classes.title + '">' + result.title + '</strong>\
											<p class="' + that.settings.classes.description + '">' + result.description + '</p>\
											<p class="' + that.settings.classes.author + '">' + (result.author || url) + '</p>\
										</div>\
										<div style="clear: both;"></div>\
									</a>\
								';
							}else {
								// 제거
								div.parentNode.removeChild(div);
								p.parentNode.removeChild(p);
							}
						},
						'error': function() {
							// 제거
							div.parentNode.removeChild(div);
							p.parentNode.removeChild(p);
						}
					});
				}
			})(node, url);
		}
	};
	OpenGraph.prototype.on = function() {
		var that = this;

		// reset
		that.off();

		// contentEditable
		//console.log(that.elements.target);
		//console.log(that.elements.target.contentEditable);
		//console.log(that.elements.target.isContentEditable);
		if(!that.elements.target.isContentEditable) {
			that.elements.target.contentEditable = true; // 해당 element 내부 수정가능하도록 설정
		}

		// 키보드 이벤트
		$(that.elements.target).on('keydown.EVENT_KEYDOWN_OPENGRAPH', function(e) {
			var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event

			module.setSelection();
			if(module.isCollapsed()) {
				if(event.keyCode === 13 && module.isNodeCheck(module.selection.anchorNode, 'url')) { // keyCode 13: enter
					// url 이 존재하면, event 를 정지한다.
					module.preventDefault(event);
					/*
					console.log(last);
					console.log(module.selection.anchorNode);
					console.log(module.selection.anchorNode.nodeType);
					console.log(module.selection.anchorNode.nodeValue);
					console.log(module.selection.focusNode.nodeValue);
					*/
					// 삽입
					that.put({'node': module.selection.anchorNode});
				}else if(event.keyCode === 8 && module.isNodeCheck(module.selection.focusNode, 'opengraph')) { // keyCode 8: backspace
					// 상위로 전파 중지
					module.preventDefault(event);
					/*
					console.log(module.selection.focusNode);
					console.log(module.selection.focusNode.parentNode);
					*/
					// 삭제
					module.selection.focusNode.parentNode.removeChild(module.selection.focusNode);
				}
			}
		});
	};
	OpenGraph.prototype.off = function() {
		var that = this;

		// event
		$(that.elements.target).off('.EVENT_KEYDOWN_OPENGRAPH');
	};

	// public return
	return {
		search: function(key) {
			return module.instance[key] || false;
		},
		setup: function(settings) {
			var instance;

			settings['key'] = settings['key'] || settings['type'] || ''; // 중복생성 방지 key 검사
			if(settings['key'] && this.search(settings['key'])) {
				instance = this.search(settings['key']);
				if(instance.change/* && JSON.stringify(instance.settings) !== JSON.stringify(settings)*/) {
					instance.change(settings);
				}
			}else if(settings['type']) {	
				switch(settings['type']) {
					case 'text':
						instance = new EditText(settings);
						break;
					case 'multi':
						instance = new EditMulti(settings);
						break;
					case 'opengraph':
						instance = new OpenGraph(settings);
						break;
				}
				if(settings['key'] && instance) {
					module.instance[settings['key']] = instance;
				}
			};
			return instance;
		},
		on: function(key) { // 전체 또는 해당 key
			
		},
		off: function(key) { // 전체 또는 해당 key
			
		},
		remove: function() { // 인스턴스까지 모두 제거 (event off 포함)
			
		},
		put: function(key, data) {
			if(this.search(key)) {
				this.search(key).put(data);
			}
		}
	};

}, this);