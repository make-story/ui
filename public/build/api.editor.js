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
			/*
			드래그로 선택된 영역 조각
			Range 인터페이스는 노드와 텍스트 노드를 포함한 문서의 일부(fragment)이다.
			'문서의 특정 부분’을 정의하는 것이라 생각하면 쉽다.
			*/
			getRange: function(index) {
				var range = '';
				if(typeof this.selection === 'object' && this.selection !== null && this.selection.rangeCount > 0) { // rangeCount 는 커서 자체도 하나의 range 로 본다.
					// this.selection.rangeCount
					range = this.selection.getRangeAt(index || 0);
				}
				return range;
			},
			// 현재 node 상위(parentNode)를 검색하며, condition 결과에 따른 callback 실행
			getParent: function(node, condition, callback) {
				var result;
				if(typeof node !== 'object' || !node.nodeType) {
					return;
				}
				while(node.parentNode) {
					// condition 함수를 실행하여 리턴값이 true 의 경우, callback 함수 실행
					// 1. condition 실행
					// 2. callback 실행 (condition 함수의 실행 결과에 따름)
					result = condition(node);
					if(result) {
						result = callback(node, result);
						if(typeof result !== 'undefined') {
							return result; // break
						}
					}
					// 상위 node
					node = node.parentNode;
				}
			},
			// 현재 선택된 글자에 블록태그(파라미터의 tag)를 설정한다.
			setFormatBlock: function(tag) {
				var that = this;
				if(typeof tag === 'string') {
					if(that.isSelection() && that.getRange() && that.getParent( // 추가하려는 tag가 상위에 존재하는지 확인
						that.selection.focusNode,
						// 조건
						function(node) {
							return node.nodeName.toLowerCase() === tag.toLowerCase();
						},
						// 조건에 따른 실행
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
			},
			// css display
			getDisplay: function(element) {
				var display = '';
				if(typeof element === 'object' && element.nodeType) {
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
			stopCapture: function(e) {
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				if(event.preventDefault) { 
					event.preventDefault();
				}else {
					event.returnValue = false;
				}
			},
			// 현재 이벤트가 상위로 전파되지 않도록 중단한다.
			stopBubbling: function(e) {
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
	var EditText = function(settings) {
		var that = this;
		that.settings = {
			'key': 'editor', 
			'target': null,
			'tooltip': true,
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

		// private init 
		(function() {
			// 에디터 버튼 mousedown 이벤트 (에디터 기능을 선택영역에 적용)
			var setTextTooltipMousedown = function(e) {
				//console.log('setTextTooltipMousedown');
				// down 했을 때 해당 버튼의 기능 적용
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				var target = event && (event.target || event.srcElement);
				var command = target['storage']['command']; // 버튼의 기능 종류

				event.preventDefault(); // 현재 이벤트의 기본 동작을 중단한다.
				event.stopPropagation(); // 현재 이벤트가 상위로 전파되지 않도록 중단한다.

				if(module.getRange()) {
					//console.log('에디터 기능 적용');
					switch(command) {
						case 'bold':
							if(module.selection.anchorNode && !module.getParent(
								module.selection.anchorNode,
								// 조건
								function(node) { // condition (검사)
									return /^(h1|h2|h3)$/i.test(node.nodeName.toLowerCase()); // h1, h2, h3 태그는 진한색의 글자이므로 제외
								}, 
								// 조건에 따른 실행
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
							if(module.selection.focusNode && !module.getParent(
								module.selection.focusNode,
								// 조건
								function(node) { // condition (검사)
									return /^(b|strong)$/i.test(node.nodeName.toLowerCase()); 
								}, 
								// 조건에 따른 실행
								function(node) { // callback (검사결과가 true의 경우)
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
									// 조건
									function(node) {
										return typeof node.href !== 'undefined';
									},
									// 조건에 따른 실행
									function(node) {
										return node.href;
									}
								);
								// 선택된(셀렉) 곳에 a 태그 존재 확인
								if(typeof url !== "undefined") { // 이미 a 태그 생성되어 있음
									that.elements.other.link.input.value = url;
								}else { // 신규 a 태그 생성
									document.execCommand("createLink", false, '#none');
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
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				var target = event && (event.target || event.srcElement);
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
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				var url = that.elements.other.link.input.value;

				// 기억해둔 a 태그의 위치를 기능적용 위치로 설정한다.
				window.getSelection().removeAllRanges();
				window.getSelection().addRange(that.range);
				if(url) {
					if(!url.match("^(http://|https://|mailto:)")) {
						url = "http://" + url;
					}
					document.execCommand('createLink', false, url);
				}else {
					// a 태그 초기화(삭제)
					document.execCommand('unlink', false);
				}
				
				// url 입력박스 숨기기
				that.elements.other.link.wrap.style.display = 'none';

				//
				that.setTextTooltipMenuState();
				that.setTextTooltipMenuPostion();
			};
			// 에디터 링크 input keydown 이벤트
			var setTextTooltipLinkKeydown = function(e) {
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				if(e.keyCode === 13) {
					e.preventDefault();
					that.elements.other.link.input.blur(); // trigger blur
				}
			};
			var fragment = document.createDocumentFragment();
			var button;

			// 텍스트 툴바
			that.elements.tooltip = document.createElement("div");
			that.elements.tooltip.setAttribute('id', that.settings.key);
			that.elements.tooltip.style.cssText = 'transition: all .05s ease-out; position: absolute; color: rgb(44, 45, 46); background-color: rgba(255, 255, 255, .96); display: none;';
			that.elements.tooltip.appendChild(that.elements.command.wrap = document.createElement("div"));
			that.elements.tooltip.appendChild(that.elements.other.wrap = document.createElement("div"));
			fragment.appendChild(that.elements.tooltip);

			// 텍스트 에디터 버튼
			button = document.createElement('button');
			button.style.cssText = 'padding: 0px; width: 30px; height: 30px; font-size: 14px; color: rgb(44, 45, 46); background: none; border: 0px; outline: none; cursor: pointer; -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;';
			that.elements.command.wrap.appendChild(that.elements.command.h1 = (function(button) {
				button['storage'] = {
					'command': 'h1'
				};
				button.onmousedown = setTextTooltipMousedown; 
				button.onmouseup = setTextTooltipMouseup;
				button.textContent = 'H1';
				return button;
			})(button.cloneNode()));
			that.elements.command.wrap.appendChild(that.elements.command.h2 = (function(button) {
				button['storage'] = {
					'command': 'h2'
				};
				button.onmousedown = setTextTooltipMousedown; 
				button.onmouseup = setTextTooltipMouseup;
				button.textContent = 'H2';
				return button;
			})(button.cloneNode()));
			that.elements.command.wrap.appendChild(that.elements.command.h3 = (function(button) {
				button['storage'] = {
					'command': 'h3'
				};
				button.onmousedown = setTextTooltipMousedown; 
				button.onmouseup = setTextTooltipMouseup;
				button.textContent = 'H3';
				return button;
			})(button.cloneNode()));
			that.elements.command.wrap.appendChild(that.elements.command.bold = (function(button) {
				button['storage'] = {
					'command': 'bold'
				};
				button.onmousedown = setTextTooltipMousedown; 
				button.onmouseup = setTextTooltipMouseup;
				button.textContent = 'B';
				button.style.fontWeight = 'bold';
				return button;
			})(button.cloneNode()));
			that.elements.command.wrap.appendChild(that.elements.command.italic = (function(button) {
				button['storage'] = {
					'command': 'italic'
				};
				button.onmousedown = setTextTooltipMousedown; 
				button.onmouseup = setTextTooltipMouseup;
				button.textContent = 'I';
				button.style.fontStyle = 'italic';
				return button;
			})(button.cloneNode()));
			that.elements.command.wrap.appendChild(that.elements.command.strikethrough = (function(button) {
				button['storage'] = {
					'command': 'strikethrough'
				};
				button.onmousedown = setTextTooltipMousedown; 
				button.onmouseup = setTextTooltipMouseup;
				button.textContent = 'S';
				button.style.textDecoration = 'line-through';
				return button;
			})(button.cloneNode()));
			that.elements.command.wrap.appendChild(that.elements.command.underline = (function(button) {
				button['storage'] = {
					'command': 'underline'
				};
				button.onmousedown = setTextTooltipMousedown;
				button.onmouseup = setTextTooltipMouseup;
				button.textContent = 'U';
				button.style.textDecoration = 'underline';
				return button;
			})(button.cloneNode()));
			that.elements.command.wrap.appendChild(that.elements.command.blockquote = (function(button) {
				button['storage'] = {
					'command': 'blockquote'
				};
				button.onmousedown = setTextTooltipMousedown; 
				button.onmouseup = setTextTooltipMouseup;
				button.textContent = '"';
				return button;
			})(button.cloneNode()));
			that.elements.command.wrap.appendChild(that.elements.command.createLink = (function(button) {
				button['storage'] = {
					'command': 'createLink'
				};
				button.onmousedown = setTextTooltipMousedown; 
				button.onmouseup = setTextTooltipMouseup;
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
				that.elements.other.link.input.onblur = setTextTooltipLinkBlur;
				that.elements.other.link.input.onkeydown = setTextTooltipLinkKeydown;
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
			module.getParent(
				module.selection.focusNode,
				// 조건
				function(node) {
					return typeof node.nodeName !== 'undefined' && typeof node.style !== 'undefined';
				},
				// 조건에 따른 실행
				function(node) {
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
			if(module.isSelection() && module.selection.focusNode.nodeType === 1 && /figure|img/.test(module.selection.focusNode.nodeName.toLowerCase())) {
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
		$(that.elements.target).on(env.event.down + '.EVENT_MOUSEDOWN_TEXTEDIT', function(e) {
			that.setTooltipToggle();
		});
		$(that.elements.target).on(env.event.up + '.EVENT_MOUSEUP_TEXTEDIT', function(e) {
			that.setTooltipToggle();
		});
		
		// 키보드 이벤트
		$(that.elements.target).on('keydown.EVENT_KEYDOWN_TEXTEDIT', function(e) {
			//console.log('setContenteditableKeydown');
			var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event

			//console.log('keydown');

			// 방향키, 엔터키 등
			module.setSelection();

			// getSelection 선택된 node
			if(module.isSelection()) {
				if(event.keyCode === 13) { // keyCode 13: enter
					// 현재노드 상위 검색
					module.getParent( 
						module.selection.anchorNode,
						// 조건
						function(node) {
							switch(node.nodeName.toLowerCase()) {
								case 'p':

									break;
								case 'figure':
									// enter 기본 이벤트 중지
									event.preventDefault();
									break;
								default:
									return that.elements.target.isEqualNode(node);
									break;
							}
						},
						// 조건에 따른 실행
						function(node) {
							return node;
						}
					);
				}
			}
		});
		$(that.elements.target).on('keyup.EVENT_KEYUP_TEXTEDIT', function(e) {
			//console.log('setContenteditableKeyup');
			var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
			var insertedNode, unwrap, node, parent, range;

			//console.log('keyup');

			// 방향키, 엔터키 등
			module.setSelection();

			// getSelection 선택된 node
			if(module.isSelection()) {
				if(event.keyCode === 13) { // keyCode 13: enter
					// DIV 내부에서 엔터를 눌렀을 경우 div 내부에서 br로 처리되므로 p 태그로 변경되도록 처리한다.
					//if(module.selection.anchorNode.nodeName.toLowerCase() === 'div') {
					if(module.selection.anchorNode.nodeType !== 1 || module.selection.anchorNode.nodeName.toLowerCase() !== 'p' || !(/block|inline-block/i.test(module.getDisplay(module.selection.anchorNode)))) {
						module.setFormatBlock("p");
					}

					// 현재노드 상위 검색
					module.getParent( 
						module.selection.anchorNode,
						// 조건
						function(node) {
							switch(node.nodeName.toLowerCase()) {
								case 'p':

									break;
								case 'figure':

									break;
								default:
									return that.elements.target.isEqualNode(node);
									break;
							}
						},
						// 조건에 따른 실행
						function(node) {
							return node;
						}
					);
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
							// 조건
							function(node) {
								return node.nodeName.toLowerCase() === 'ul';
							},
							// 조건에 따른 실행
							function(node) {
								return node;
							}
						);
					}else if(module.selection.anchorNode.nodeValue.match(/^1\.\s/)) { 
						// "1. 텍스트작성" 형태로 글을 작성했을 경우 목록태그로 변경
						document.execCommand('insertOrderedList'); // ol 태그 생성
						module.selection.anchorNode.nodeValue = module.selection.anchorNode.nodeValue.substring(3);
						insertedNode = module.getParent( // 현재노드 상위로 존재하는 ol 태그 반환
							module.selection.anchorNode,
							// 조건
							function(node) {
								return node.nodeName.toLowerCase() === 'ol';
							},
							// 조건에 따른 실행
							function(node) {
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

						range = document.createRange();
						range.setStart(node, 0);
						range.setEnd(node, 0);
						module.selection.removeAllRanges();
						module.selection.addRange(range);
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

			event.preventDefault();
			if(event.clipboardData) {
				text = event.clipboardData.getData('text/plain');
			}else if(window.clipboardData) {
				text = window.clipboardData.getData('Text');
			}
			if(document.queryCommandSupported('insertText')) {
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
			//var target = event && (event.target || event.srcElement);
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
		$(that.elements.target).off('.EVENT_MOUSEDOWN_TEXTEDIT')
		$(that.elements.target).off('.EVENT_MOUSEUP_TEXTEDIT');

		// 키보드 이벤트
		$(that.elements.target).off('.EVENT_KEYDOWN_TEXTEDIT');
		$(that.elements.target).off('.EVENT_KEYUP_TEXTEDIT');
		$(that.elements.target).off('.EVENT_BLUR_TEXTEDIT');
		$(that.elements.target).off('.EVENT_PASTE_TEXTEDIT');

		// document event
		$(document).off('.EVENT_RESIZE_TEXTEDIT_DOCUMENT');
		//$(document).off('.EVENT_MOUSEUP_TEXTEDIT_DOCUMENT');
	};

	// 멀티미디어 에디터
	var EditMulti = function(settings) {
		var that = this;
		that.settings = {
			'key': 'editor', 
			'target': null,
			'image': true, // 이미지 에디터 사용여부
			'movie': true, // 비디오 에디터 사용여부
			'tooltip': {
				'image': {
					'put': true, // 이미지 넣기 툴팁 보이기 / 숨기기
					'location': true // 이미지 위치 수정 툴팁 보이기 / 숨기기
				}
			},
			'submit': {
				'image': '//makestory.net/files/editor', // 이미지 파일 전송 url
			},
			'class': {
				'image': ''
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
			}
		};

		// settings
		that.change(settings);

		// private init
		(function() {
			// 이미지 파일 선택 - input file 이벤트
			var setImageInputChange = (function() {
				if('FileReader' in window) { // IE10 이상
					// html5 FileReader
					return function(e, form, input, id, wrap) {
						var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
						var files = this.files;
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
						var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
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
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
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

				// 이미지를 넣을 위치 설정
				if(module.isSelection()) {
					wrap = module.getParent(
						module.selection.anchorNode,
						// 조건
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
						// 조건에 따른 실행
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
				wrap.setAttribute("id", id);
				wrap.setAttribute("data-type", "image");
				if(!wrap.storage) {
					wrap.storage = {
						'type': 'image'
					};
				}

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
					setImageInputChange.call(this, e, form, input, id, wrap);
				};
				input.click(); // 실행

				document.body.appendChild(fragment);
			};
			var fragment = document.createDocumentFragment();
			var label;

			// 멀티미디어 툴바
			that.elements.tooltip = document.createElement("div");
			that.elements.tooltip.style.cssText = 'transition: all .05s ease-out; position: absolute; color: rgb(44, 45, 46); background-color: rgba(255, 255, 255, .96); display: none;';
			that.elements.tooltip.appendChild(that.elements.command.wrap = document.createElement("div"));
			fragment.appendChild(that.elements.tooltip);

			// 멀티미디어 에디터 버튼
			label = document.createElement('label'); // input file 을 실행하기 위해 label tag 사용
			label.style.cssText = 'display: block; margin: 2px 4px; background: none; border: 0px; outline: none; cursor: pointer; -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;';
			that.elements.command.wrap.appendChild(that.elements.command.insertImage = (function(label) {
				label['storage'] = {
					'command': 'insertImage'
				};
				label.onmousedown = setImageTooltipMousedown;
				label.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" x="0px" y="0px" width="22" height="22" viewBox="0 0 368 368" style="fill: rgb(44, 45, 46);"><path d="M328,32H40C18,32,0,50,0,72v224c0,22,18,40,40,40h288c22,0,40-18,40-40V72C368,50,350,32,328,32z M352,185.6l-38-38 c-6.4-6.4-16-6.4-22.4,0L200,238.8l-0.4-0.4L153.2,192c-6-6-16.4-6-22.4,0l-39.2,39.2c-3.2,3.2-3.2,8,0,11.2 c3.2,3.2,8,3.2,11.2,0l39.2-39.2l46.4,46.4l0.4,0.4l-32.4,32.4c-3.2,3.2-3.2,8,0,11.2c1.6,1.6,3.6,2.4,5.6,2.4s4-0.8,5.6-2.4 l135.2-134.8l47.6,47.6c0.4,0.4,1.2,0.8,1.6,1.2V296c0,13.2-10.8,24-24,24H40c-13.2,0-24-10.8-24-24V72c0-13.2,10.8-24,24-24h288 c13.2,0,24,10.8,24,24V185.6z" fill="#000"/><path d="M72.4,250.4l-8,8c-3.2,3.2-3.2,8,0,11.2C66,271.2,68,272,70,272s4-0.8,5.6-2.4l8-8c3.2-3.2,3.2-8,0-11.2 C80.4,247.2,75.6,247.2,72.4,250.4z" fill="#000"/><path d="M88,80c-22,0-40,18-40,40s18,40,40,40s40-18,40-40S110,80,88,80z M88,144c-13.2,0-24-10.8-24-24s10.8-24,24-24 s24,10.8,24,24S101.2,144,88,144z" fill="#000"/></svg>';
				//label.textContent = '+';
				return label;
			})(label.cloneNode()));
			that.elements.command.wrap.appendChild(that.elements.command.insertVideo = (function(label) {
				label['storage'] = {
					'command': 'insertVideo'
				};
				//label.onmousedown = setImageTooltipMousedown;
				label.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" x="0px" y="0px" width="22" height="22" viewBox="0 0 64 64" style="fill: rgb(44, 45, 46);"><path d="M42.4472008,36.1054993l-16-8c-0.3105011-0.1542988-0.6787014-0.1396999-0.9726009,0.0439014 C25.1795998,28.3320007,25,28.6532993,25,29v16c0,0.3466988,0.1795998,0.6679993,0.4745998,0.8506012 C25.6347008,45.9501991,25.8173008,46,26,46c0.1532993,0,0.3055992-0.0351982,0.4472008-0.1054993l16-8 C42.7860985,37.7246017,43,37.3788986,43,37S42.7860985,36.2753983,42.4472008,36.1054993z M27,43.3818016V30.6182003 L39.7635994,37L27,43.3818016z" fill="#000"/><path d="M60,5h-56C1.7909007,5,0.0000008,6.7908001,0.0000008,9v46c0,2.2092018,1.7908999,4,3.9999998,4h56 c2.2090988,0,4-1.7907982,4-4V9C64,6.7908001,62.2090988,5,60,5z M62,9v8h-8.3283005l2.6790009-10H60 C61.1026993,7,62,7.8972001,62,9z M21.2804241,7l-2.6790009,10H9.6508007l2.6788998-10H21.2804241z M23.3507004,7h8.9297218 l-2.6789989,10h-8.9297237L23.3507004,7z M34.3507004,7h8.9297218l-2.678997,10h-8.9297256L34.3507004,7z M45.3507004,7h8.9297218 l-2.678997,10h-8.9297256L45.3507004,7z M4.0000005,7h6.2594237L7.5805006,17H2.0000007V9 C2.0000007,7.8972001,2.8972008,7,4.0000005,7z M60,57h-56c-1.1027997,0-1.9999998-0.8972015-1.9999998-2V19h60v36 C62,56.1027985,61.1026993,57,60,57z" fill="#000"/></svg>';
				return label;
			})(label.cloneNode()));

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
		if(module.isSelection() && module.selection.focusNode.nodeType === 1 && /img/.test(module.selection.focusNode.nodeName.toLowerCase())) {
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
			that.setImageTooltipMenuPostion({'toggle': 'show'});
			that.setMultiTooltipMenuPostion({'toggle': 'hide'});
		}else {
			that.setImageTooltipMenuPostion({'toggle': 'hide'});
			that.setMultiTooltipMenuPostion();
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
					var setSize = function() {
						//썸네일 이미지 생성
						/*var tempImage = new Image(); //drawImage 메서드에 넣기 위해 이미지 객체화
						tempImage.src = result; //data-uri를 이미지 객체에 주입
						tempImage.onload = function() {
							//리사이즈를 위해 캔버스 객체 생성
							var canvas = document.createElement('canvas');
							var canvasContext = canvas.getContext("2d");

							//캔버스 크기 설정
							canvas.width = 100; //가로 100px
							canvas.height = 100; //세로 100px

							//이미지를 캔버스에 그리기
							canvasContext.drawImage(this, 0, 0, 100, 100);

							//캔버스에 그린 이미지를 다시 data-uri 형태로 변환
							var dataURI = canvas.toDataURL("image/jpeg");

							//썸네일 이미지 보여주기
							document.querySelector('#thumbnail').src = dataURI;

							//썸네일 이미지를 다운로드할 수 있도록 링크 설정
							document.querySelector('#download').href = dataURI;

							//<a id="download" download="thumbnail.jpg"></a> download 속성은 다운로드할 대상의 파일명을 미리 지정할 수 있다.
						};*/
					};
					var setImage = function(result) {
						var img = new Image();
						img.src = result;
						img.setAttribute("class", that.settings.class.image);
						img.onload = function() {
							var figure, figcaption;
							//var rect = that.elements.target.getBoundingClientRect();
							var rect = id.getBoundingClientRect();

							// 이미지 크기 변경
							if(rect.width && this.width && rect.width < this.width) {
								//img.setAttribute('width', '100%');
								img.style.width = '100%';
								img.style.maxWidth = this.width + 'px';
								img.style.maxHeight = this.height + 'px';

								//console.log(rect.width);
								//console.log(this.width);
								//console.log(img);
							}

							// figure, figcaption
							// http://html5doctor.com/the-figure-figcaption-that.elements/
							figcaption = document.createElement("figcaption");
							//figcaption.innerHTML = '<br />';
							figure = document.createElement("figure");
							figure.appendChild(img);
							figure.appendChild(figcaption);
							id.appendChild(figure);
						};
					};

					var i, max;
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
		$(that.elements.target).on(env.event.down + '.EVENT_MOUSEDOWN_MULTIEDIT', function(e) {
			that.setTooltipToggle();
		});
		$(that.elements.target).on(env.event.up + '.EVENT_MOUSEUP_MULTIEDIT', function(e) {
			that.setTooltipToggle();
		});
		
		// 키보드 이벤트
		$(that.elements.target).on('keydown.EVENT_KEYDOWN_MULTIEDIT', function(e) {
			//console.log('setContenteditableKeydown');
			var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event

			//console.log('keydown');

			// 방향키, 엔터키 등
			module.setSelection();

			// getSelection 선택된 node
			if(module.isSelection()) {
				if(event.keyCode === 13) { // keyCode 13: enter
					//console.log(module.selection.anchorNode.nodeName.toLowerCase());

					// 현재노드 상위 검색
					module.getParent( 
						module.selection.anchorNode,
						// 조건
						function(node) {
							switch(node.nodeName.toLowerCase()) {
								case 'figure':
									// enter 기본 이벤트 중지
									event.preventDefault();
									break;
								default:
									return that.elements.target.isEqualNode(node);
									break;
							}
						},
						// 조건에 따른 실행
						function(node) {
							return node;
						}
					);

					
				}
			}
		});
		$(that.elements.target).on('keyup.EVENT_KEYUP_MULTIEDIT', function(e) {
			//console.log('setContenteditableKeyup');
			var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event

			//console.log('keyup');

			// 방향키, 엔터키 등
			module.setSelection();

			// getSelection 선택된 node
			if(module.isSelection()) {
				if(event.keyCode === 13) { // keyCode 13: enter
					// 현재노드 상위 검색
					module.getParent( 
						module.selection.anchorNode,
						// 조건
						function(node) {
							switch(node.nodeName.toLowerCase()) {
								case 'figure':
									/*
									figure 내부에 figcaption 태그가 없으면 figcaption 생성
									figcaption 생성후 아무것도 입력하지 않은 상태에서 엔터키를 누르면 
									figure 밖으로 빠져나옴

									근데 불편할것 같다.
									*/
									//event.preventDefault();

									/*
									https://www.google.co.kr/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#newwindow=1&q=chrome+contenteditable+p+tag+append
									http://stackoverflow.com/questions/35705291/cross-browser-way-to-insert-br-or-p-tag-when-hitting-enter-on-a-contenteditable
									http://stackoverflow.com/questions/3771824/select-range-in-contenteditable-div
									*/
									/*var p = document.createElement('p');
									var br = document.createElement("br"); // 크롬은 p 태그 내부 br 이 존재해야 한다.
									range = document.createRange();
									node.parentNode.insertBefore(p, node.nextSibling);
									range.setStart(p, 0);
									range.setEnd(p, 0);
									//range.selectNode(p);
									range.insertNode(br);
									range.setStartAfter(br);
									range.setEndAfter(br);
									module.selection.removeAllRanges();
									module.selection.addRange(range);*/
									break;
								default:
									return that.elements.target.isEqualNode(node);
									break;
							}
						},
						// 조건에 따른 실행
						function(node) {
							return node;
						}
					);
				}

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
		$(that.elements.target).off('.EVENT_MOUSEDOWN_MULTIEDIT');
		$(that.elements.target).off('.EVENT_MOUSEUP_MULTIEDIT');

		// 키보드 이벤트
		$(that.elements.target).off('.EVENT_KEYDOWN_MULTIEDIT');
		$(that.elements.target).off('.EVENT_KEYUP_MULTIEDIT');
		$(that.elements.target).off('.EVENT_BLUR_MULTIEDIT');
	};

	// 오픈그래프
	var OpenGraph = function(settings) {
		var that = this;
		that.settings = {
			'key': 'editor', 
			'target': null,
			'submit': '//makestory.net/opengraph',
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

		if(typeof node === 'object' && node.nodeType && (url && regexp.url.test(url) || that.check(node))) {
			url = url || node.nodeValue;
			//console.log('url: ' + url);

			(function(node, url) {
				var fragment;
				var a, div, p;
				var tmp;
				var inserted;
				var position, range;

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
				//div.innerHTML = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 24 30" style="enable-background:new 0 0 50 50;" xml:space="preserve"><rect x="0" y="10" width="4" height="10"><animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0s" dur="0.6s" repeatCount="indefinite" /></rect><rect x="8" y="10" width="4" height="10"><animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.15s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite" /></rect><rect x="16" y="10" width="4" height="10"><animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.3s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite" /></rect></svg>';
				p.innerHTML = '<br />';

				// insertAdjacentHTML
				//node.parentNode.replaceChild(fragment, node);
				inserted = module.getParent(
					node,
					// 조건
					function(node) { // condition (검사)						
						if(!that.elements.target.contains(node) || that.elements.target.isEqualNode(node)) {
							return node;
						}else if(node.parentNode && (node.parentNode.isEqualNode(that.elements.target) || (node.parentNode.nodeType === 1 && node.parentNode.nodeName.toLowerCase() !== 'p' && /block|inline-block/i.test(module.getDisplay(node.parentNode))))) {
							return node;
						}
					}, 
					// 조건에 따른 실행
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
					// 포커스 이동
					position = module.selection.getRangeAt(0).focusOffset;
					range = document.createRange(); // 크로스 브라우저 대응 작업해야 한다.
					range.setStart(p, position);
					range.setEnd(p, position);
					range.collapse(true);
					module.selection.removeAllRanges();
					module.selection.addRange(range);

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
									image = '<div class="opengraph-image" style="background-image: url(' + result.image + ');"><br /></div>';
								}else {
									image = '<div class="opengraph-image"></div>';
								}
								div.innerHTML = '\
									<a href="' + url + '" target="_blank" class="opengraph-wrap" style="display: block;">\
										' + image + '\
										<div class="opengraph-text">\
											<strong class="opengraph-title">' + result.title + '</strong>\
											<p class="opengraph-description">' + result.description + '</p>\
											<p class="opengraph-url">' + (result.author || url) + '</p>\
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
	OpenGraph.prototype.check = function(node) { // node에 url이 존재하는지 검사
		var is = false;

		if(typeof node === 'object' && node.nodeType === 3 && node.nodeValue && regexp.url.test(node.nodeValue)) { // nodeType 3: textnode
			is = true;
		}

		return is;
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
			if(event.keyCode === 13 && module.isCollapsed() && that.check(module.selection.anchorNode)) { // keyCode 13: enter
				// url 이 존재하면, event 를 정지한다.
				module.stopCapture(event);
				/*
				console.log(last);
				console.log(module.selection.anchorNode);
				console.log(module.selection.anchorNode.nodeType);
				console.log(module.selection.anchorNode.nodeValue);
				console.log(module.selection.focusNode.nodeValue);
				*/
				that.put({'node': module.selection.anchorNode});
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