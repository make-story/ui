/*
Editor (HTML5)

@date (버전관리)
2016.03

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

@browser compatibility


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

	var EDGE = -200; // 임시

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
				"click": window.DocumentTouch && document instanceof DocumentTouch ? 'tap' : 'click'
			}
		};
		if(env['check']['touch'] === true) {
			env['event']['down'] = 'touchstart';
			env['event']['move'] = 'touchmove';
			env['event']['up'] = 'touchend';
		}
	}

	// 모듈 (private)
	var module = (function() {
		function EditorModule() {
			var that = this;
			// key가 있는 인스턴스
			that.instance = {};
		}
		EditorModule.prototype = {
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
					if(condition(node)) {
						result = callback(node);
						if(typeof result !== 'undefined') {
							return result; // break
						}
					}
					// 상위 node
					node = node.parentNode;
				}
			},
			// 이미지삽입 시점의 위치값 저장
			getHorizontalBounds: function(nodes, target, event) {
				var bounds = [],
					bound,
					i,
					max,
					preNode,
					postNode,
					bottomBound,
					topBound,
					coordY;

				// Compute top and bottom bounds for each child element
				for(i=0, max=nodes.length-1; i<max; i++) {
					preNode = nodes[i];
					postNode = nodes[i+1] || null;

					bottomBound = preNode.getBoundingClientRect().bottom - 5;
					topBound = postNode.getBoundingClientRect().top;

					bounds.push({
						top: topBound,
						bottom: bottomBound,
						topElement: preNode,
						bottomElement: postNode,
						index: i+1
					});
				}
				
				//console.log('bounds');
				//console.dir(bounds);

				coordY = event.pageY - window.scrollY;

				// Find if there is a range to insert the image tooltip between two elements
				for(i=0, max=bounds.length; i<max; i++) {
					bound = bounds[i];
					if(coordY < bound.top && coordY > bound.bottom) {
						return bound;
					}
				}

				return null;
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
		return new EditorModule();
	})();

	// 에디터
	var Editor = function(settings) {
		var that = this;
		that.settings = {
			'key': '', 
			'target': null, // 에디터 적용 영역
			// 기능 사용여부
			'edit': {
				'text': true,
				'multi': true
			},
			// 파일 등을 불러올 서버 url
			'url': {
				'image': '//makestory.net/files/temp'
			},
			// 파일 등을 전송할 서버 url
			'submit': {
				'image': '//makestory.net/files/editor', // 이미지 파일 전송 url
				'opengraph': '//makestory.net/opengraph'
			},
			// 스타일 
			'style': {
				'image': {
					'left': '',
					'leftout': '',
					'right': '',
					'rightout': '',
					'center': ''
				}
			},
			'callback': {
				'init': null
			}
		};
		that.settings = module.setSettings(that.settings, settings);
		that.elements = {
			'target': null,
			'text': {
				'tooltip': undefined,
				'command': { // button
					'wrap': undefined // button element 들을 감싸고 있는 wrap
				},
				'other': {
					'wrap': undefined, // option element 들을 감싸고 있는 wrap
					'link': {} // url 입력창
				}
			},
			'multi': {
				'tooltip': undefined,
				'command': { // button
					'wrap': undefined // button element 들을 감싸고 있는 wrap	
				},
				'other': {
					'image': undefined
				}
			}
		};
		that.selection; // 선택된 텍스트 (window.getSelection())
		that.range; // selection 된 range(범위)
		that.composition = false; // 한글입력관련
		that.imageBound; // 이미지를 출력할 위치 (이미지 업로드 사이에 커서 위치가 변경될 수 있으므로 주의해야 한다.)

		// target
		that.settings.target = (typeof that.settings.target === 'string' && /^[a-z]+/i.test(that.settings.target) ? '#' + that.settings.target : that.settings.target);
		that.elements.target = (typeof that.settings.target === 'object' && that.settings.target.nodeType ? that.settings.target : $(that.settings.target).get(0));

		// private init
		(function init() {
			// 이미지 파일 선택
			var setImageInputChange = (function() {
				if('FileReader' in window) { // IE10 이상
					// html5 FileReader
					return function(e, form, input) {
						var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
						var files = this.files;
						var i, max;
						for(i=0, max=files.length; i<max; i++) {
							(function(file) {
								var reader = new FileReader();
								// Data URI Scheme
								//
								reader.readAsDataURL(file); // base64
								reader.onload = function(e) {
									// 이미지 삽입
									that.setPut({'type': 'image', 'data': e.target.result});
									// 생성된 tag 삭제
									form.parentNode.removeChild(form);

									//썸네일 이미지 생성
									/*tempImage = new Image(); //drawImage 메서드에 넣기 위해 이미지 객체화
									tempImage.src = e.target.result; //data-uri를 이미지 객체에 주입
									tempImage.onload = function () {
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
				var form = document.createElement('form');
				var input1 = document.createElement('input'); // file
				var input2 = document.createElement('input'); // key

				// Cache the bound that was originally clicked on before the image upload
				var childrenNodes = that.elements.target.children;
				var editBounds = that.elements.target.getBoundingClientRect();

				that.imageBound = module.getHorizontalBounds(childrenNodes, editBounds, event);
				/*
				console.log('childrenNodes');
				console.log(childrenNodes);
				console.log('editBounds');
				console.log(editBounds);
				console.log('imageBound');
				console.log(that.imageBound);
				*/

				// 1. input file 생성하고 실행(.click()); name="apiEditorImages[]"
				// position: absolute; left: -9999px; top: -9999px;

				// 2. 생성한 element 에 onchange(setImageInputChange) 이벤트 적용

				// 3. 글쓰기를 했을 때 해당 input file 부분 name 속성을 이용해서 서버에서 받는다.

				// 4. 서버에서 받은 후 img 의 src 주소를 변경해 줘야한다.


				// 문제는!!! 해당이미지를 지우게 된다면??

				// 업로드를 하면 생성한 input 태그를 삭제한다. (미디엄은 삭제를 하는데 왜 삭제할까????)
				// 아! 혹시 iframe 로 해당 파일을 전송하기 위한 것일까??? (XMLHttpRequest 레벨2 전에는 iframe 방식 뿐이였으니 사용가능성 높다)

				// temp 로 업로드 -> 글쓰기가 되면 이미지 파일을 public/files/images 로 이동

				// 이미지 파일명을 변경했는데... 변경된 파일명을 에디터가 어떻게 알수 있을까????????????????????????????
				// iframe 이라면 window.top.xxxx(); 로 현재 위치의 자스를 호출할 수 있지 않을까???
				// ajax 라면 반환값에 변경된 파일명이 있지 않을까???????

				form.appendChild(input2);
				form.appendChild(input1);
				fragment.appendChild(form);

				form.style.cssText = 'position: absolute; left: -9999px; top: -9999px;';
				form.setAttribute('action', that.settings.submit.image);
				form.setAttribute('method', 'post');
				form.setAttribute('enctype', 'multipart/form-data');

				input2.style.cssText = '';
				input2.setAttribute('type', 'hidden');
				input2.setAttribute('name', 'key');
				input2.setAttribute('value', that.settings.key);

				input1.style.cssText = '';
				input1.setAttribute('type', 'file');
				input1.setAttribute('name', 'apiEditorImages[]');
				input1.setAttribute('accept', 'image/*');
				input1.setAttribute('multiple', 'multiple');
				input1.onchange = function(e) {
					setImageInputChange.call(this, e, form, input1, input2);
				};
				input1.click(); // 실행
				document.body.appendChild(fragment);
			};
			// 에디터 버튼 mousedown 이벤트 (에디터 기능을 선택영역에 적용)
			var setTextTooltipMousedown = function(e) {
				//console.log('setTextTooltipMousedown');
				// down 했을 때 해당 버튼의 기능 적용
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				var target = event && (event.target || event.srcElement);
				var command = target['storage']['command']; // 버튼의 기능 종류

				event.preventDefault(); // 현재 이벤트의 기본 동작을 중단한다.
				event.stopPropagation(); // 현재 이벤트가 상위로 전파되지 않도록 중단한다.

				if(typeof that.selection === 'object' && 'rangeCount' in that.selection && that.selection.rangeCount > 0) {
					//console.log('에디터 기능 적용');
					switch(command) {
						case 'bold':
							if(that.selection.anchorNode && !module.getParent(
								that.selection.anchorNode,
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
							if(that.selection.focusNode && !module.getParent(
								that.selection.focusNode,
								// 조건
								function(node) { // condition (검사)
									return /^(b|strong)$/i.test(node.nodeName.toLowerCase()); 
								}, 
								// 조건에 따른 실행
								function(node) { // callback (검사결과가 true의 경우)
									return true;
								}
							)) {
								that.setFormatBlock(command);
							}
							break;
						case "blockquote": // 인용문 (들여쓰기)
							that.setFormatBlock(command);
							break;
						case 'createLink':
							// url 입력박스 보이기
							//that.elements['text']['command']['wrap'].style.display = 'none';
							that.elements['text']['other']['link']['wrap'].style.display = 'block';

							// 
							setTimeout(function() {
								//
								var url = module.getParent(
									that.selection.focusNode,
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
									that.elements['text']['other']['link']['input'].value = url;
								}else { // 신규 a 태그 생성
									document.execCommand("createLink", false, "#none");
								}
								// 위 a 태그의 위치를 기억한다.
								that.range = that.selection.getRangeAt(0); // range는 이 위치에서 실행되어야 정상 작동한다!
								//
								that.elements['text']['other']['link']['input'].focus();
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
				var url = that.elements['text']['other']['link']['input'].value;
				// 기억해둔 a 태그의 위치를 기능적용 위치로 설정한다.
				window.getSelection().addRange(that.range);
				// a 태그 초기화(삭제)
				document.execCommand('unlink', false);
				if(url !== "") {
					if(!url.match("^(http|https)://")) {
						url = "http://" + url;
					}
					// 사용자가 입력한 url이 있을 경우 a 태그의 href 최신화 (a 태그 재생성)
					document.execCommand('createLink', false, url);
				}
				that.elements['text']['other']['link']['input'].value = '';

				// url 입력박스 숨기기
				that.elements['text']['other']['link']['wrap'].style.display = 'none';

				//
				that.setTextTooltipMenuState();
			};
			// 에디터 링크 input keydown 이벤트
			var setTextTooltipLinkKeydown = function(e) {
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				if(e.keyCode === 13) {
					e.preventDefault();
					that.elements['text']['other']['link']['input'].blur(); // trigger blur
				}
			};
			// 에디터 button, input 등 생성 및 이벤트 설정
			var setCreateTooltipElement = function(parameter) { 
				var parameter = parameter || {};
				var edit = parameter['edit'];
				var command = parameter['command']; 

				var setButton = function() {

				};
				var setLabel = function() {

				};
				var style = {
					'button': 'padding: 0px; width: 30px; height: 30px; font-size: 14px; color: rgb(20, 29, 37); background: none; border: 0px; outline: none; cursor: pointer; -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;',
					'label': 'display: block; padding: 0px; width: 30px; height: 30px; font-size: 14px; color: rgb(20, 29, 37); background: none; border: 0px; outline: none; cursor: pointer; -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;'
				};
				var element;

				// 중복생성 방지

				

				// command
				switch(command) {
					case 'bold':
						// button
						element = document.createElement('button');
						element.style.cssText = style.button;
						element['storage'] = {
							'command': command
						};
						element.onmousedown = setTextTooltipMousedown; 
						element.onmouseup = setTextTooltipMouseup;
						that.elements[edit]['command'][command] = element;
						//
						element.textContent = 'B';
						element.style.fontWeight = 'bold';
						break;
					case 'italic':
						// button
						element = document.createElement('button');
						element.style.cssText = style.button;
						element['storage'] = {
							'command': command
						};
						element.onmousedown = setTextTooltipMousedown; 
						element.onmouseup = setTextTooltipMouseup;
						that.elements[edit]['command'][command] = element;
						//
						element.textContent = 'I';
						element.style.fontStyle = 'italic';
						break;
					case 'strikethrough':
						// button
						element = document.createElement('button');
						element.style.cssText = style.button;
						element['storage'] = {
							'command': command
						};
						element.onmousedown = setTextTooltipMousedown; 
						element.onmouseup = setTextTooltipMouseup;
						that.elements[edit]['command'][command] = element;
						//
						element.textContent = 'S';
						element.style.textDecoration = 'line-through';
						break;
					case 'underline':
						// button
						element = document.createElement('button');
						element.style.cssText = style.button;
						element['storage'] = {
							'command': command
						};
						element.onmousedown = setTextTooltipMousedown; 
						element.onmouseup = setTextTooltipMouseup;
						that.elements[edit]['command'][command] = element;
						//
						element.textContent = 'U';
						element.style.textDecoration = 'underline';
						break;
					case "h1":
						// button
						element = document.createElement('button');
						element.style.cssText = style.button;
						element['storage'] = {
							'command': command
						};
						element.onmousedown = setTextTooltipMousedown; 
						element.onmouseup = setTextTooltipMouseup;
						that.elements[edit]['command'][command] = element;
						//
						element.textContent = 'H1';
						break;
					case "h2":
						// button
						element = document.createElement('button');
						element.style.cssText = style.button;
						element['storage'] = {
							'command': command
						};
						element.onmousedown = setTextTooltipMousedown; 
						element.onmouseup = setTextTooltipMouseup;
						that.elements[edit]['command'][command] = element;
						//
						element.textContent = 'H2';
						break;
					case "h3":
						// button
						element = document.createElement('button');
						element.style.cssText = style.button;
						element['storage'] = {
							'command': command
						};
						element.onmousedown = setTextTooltipMousedown; 
						element.onmouseup = setTextTooltipMouseup;
						that.elements[edit]['command'][command] = element;
						//
						element.textContent = 'H3';
						break;
					case "blockquote":
						// button
						element = document.createElement('button');
						element.style.cssText = style.button;
						element['storage'] = {
							'command': command
						};
						element.onmousedown = setTextTooltipMousedown; 
						element.onmouseup = setTextTooltipMouseup;
						that.elements[edit]['command'][command] = element;
						//
						element.textContent = '"';
						break;
					case 'createLink': // link
						// button
						element = document.createElement('button');
						element.style.cssText = style.button;
						element['storage'] = {
							'command': command
						};
						//
						element.onmousedown = setTextTooltipMousedown; 
						element.onmouseup = setTextTooltipMouseup;
						that.elements[edit]['command'][command] = element;
						//
						element.textContent = '#';

						// option
						that.elements['text']['other']['link']['wrap'] = document.createElement("div"); // link option box
						that.elements['text']['other']['link']['input'] = document.createElement("input");
						that.elements['text']['other']['link']['wrap'].appendChild(that.elements['text']['other']['link']['input']);
						that.elements['text']['other']['wrap'].appendChild(that.elements['text']['other']['link']['wrap']);
						// style
						that.elements['text']['other']['link']['wrap'].style.cssText = 'display: none;';
						// event
						that.elements['text']['other']['link']['input'].onblur = setTextTooltipLinkBlur;
						that.elements['text']['other']['link']['input'].onkeydown = setTextTooltipLinkKeydown;
						break;
					case 'insertImage':
						// input file 을 실행하기 위해 label tag 사용
						element = document.createElement('label');
						element.style.cssText = style.button;
						element['storage'] = {
							'command': command
						};
						//
						element.onmousedown = setImageTooltipMousedown;
						//
						element.textContent = '+';
						break;
				}
				that.elements[edit]['command'][command] = element;

				return element;
			};
			var fragment = document.createDocumentFragment();
			// document 에 에디터 툴바존재여부 확인 후 생성


			// 텍스트 툴바
			that.elements['text']['tooltip'] = document.createElement("div");
			that.elements['text']['tooltip'].style.cssText = 'transition: all .3s ease-out; position: absolute; top: ' + EDGE + 'px; left: ' + EDGE + 'px; color: rgb(20, 29, 37); background-color: rgba(255, 255, 255, .86);';
			that.elements['text']['tooltip'].appendChild(that.elements['text']['command']['wrap'] = document.createElement("div"));
			that.elements['text']['tooltip'].appendChild(that.elements['text']['other']['wrap'] = document.createElement("div"));
			fragment.appendChild(that.elements['text']['tooltip']);

			// 텍스트 에디터 버튼
			that.elements['text']['command']['wrap'].appendChild(setCreateTooltipElement({'edit': 'text', 'command': 'h1'}));
			that.elements['text']['command']['wrap'].appendChild(setCreateTooltipElement({'edit': 'text', 'command': 'h2'}));
			that.elements['text']['command']['wrap'].appendChild(setCreateTooltipElement({'edit': 'text', 'command': 'h3'}));
			that.elements['text']['command']['wrap'].appendChild(setCreateTooltipElement({'edit': 'text', 'command': 'bold'}));
			that.elements['text']['command']['wrap'].appendChild(setCreateTooltipElement({'edit': 'text', 'command': 'italic'}));
			that.elements['text']['command']['wrap'].appendChild(setCreateTooltipElement({'edit': 'text', 'command': 'strikethrough'}));
			that.elements['text']['command']['wrap'].appendChild(setCreateTooltipElement({'edit': 'text', 'command': 'underline'}));
			that.elements['text']['command']['wrap'].appendChild(setCreateTooltipElement({'edit': 'text', 'command': 'blockquote'}));
			that.elements['text']['command']['wrap'].appendChild(setCreateTooltipElement({'edit': 'text', 'command': 'createLink'}));

			// 멀티미디어 툴바
			that.elements['multi']['tooltip'] = document.createElement("div");
			that.elements['multi']['tooltip'].style.cssText = 'transition: all .3s ease-out; position: absolute; top: ' + EDGE + 'px; left: ' + EDGE + 'px; color: rgb(20, 29, 37); background-color: rgba(255, 255, 255, .86);';
			that.elements['multi']['tooltip'].appendChild(that.elements['multi']['command']['wrap'] = document.createElement("div"));
			fragment.appendChild(that.elements['multi']['tooltip']);

			// 멀티미디어 에디터 버튼
			that.elements['multi']['command']['wrap'].appendChild(setCreateTooltipElement({'edit': 'multi', 'command': 'insertImage'}));
			

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
		that.on();

		// callback
		if(typeof that.settings.callback.init === 'function') {
			that.settings.callback.init.call(that, that.elements.target);
		}
	};
	Editor.prototype = {
		/*
		-
		아래는 텍스트 에디터의 동작 순서
		1. setSelection 선택된 텍스트
		2. setTextTooltipMousedown 툴바 기능 적용
		3. setTextTooltipMouseup 적용된 기능에 대해 툴바 상태 최신화
		*/
		// 텍스트 선택(selection)
		setSelection: function(e) {
			//console.log('setSelection');
			var that = this;
			var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
			var target = event && (event.target || event.srcElement);

			//console.log(target.isContentEditable);
			//console.log(document.activeElement.isContentEditable);
			that.selection = undefined;
			if(typeof target === 'object' && 'isContentEditable' in target && target.isContentEditable && that.composition === false) {
				that.selection = window.getSelection();
				//console.log('selection');
				//console.dir(that.selection);
			}
		},
		isSelection: function() {
			var that = this;
			if(typeof that.selection === 'object' && that.selection.anchorNode && that.selection.focusNode) {
				return true;
			}else {
				return false;
			}
		},
		// 툴팁 보이기
		setTooltipToggle: function(e) {
			var that = this;
			var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
			var target = event && (event.target || event.srcElement);

			// 텍스트 / 멀티미디어 툴팁 중 하나만 보여야 한다.
			if(that.isSelection()) {
				console.log('----------');
				console.dir(that.selection);
				// 시작노드
				console.log('anchorNode.nodeName: ' + that.selection.anchorNode.nodeName);
				console.log('anchorNode.nodeValue: ' + that.selection.anchorNode.nodeValue);
				console.log('anchorNode.nodeType: ' + that.selection.anchorNode.nodeType);
				// 끝노드
				console.log('focusNode.nodeName: ' + that.selection.focusNode.nodeName);
				console.log('focusNode.nodeValue: ' + that.selection.focusNode.nodeValue);
				console.log('focusNode.nodeType: ' + that.selection.focusNode.nodeType);
				
				
				switch(that.selection.focusNode.nodeName.toLowerCase()) {
					case 'figure':
					case 'img':
						if(that.selection.anchorNode.nodeName === that.selection.focusNode.nodeName) {
							that.setTextTooltipMenuPostion({'toggle': 'hide'});
							that.setMultiTooltipMenuPostion({'toggle': 'hide'});
							that.setImageTooltipMenuPostion();
						}
						break;
					default:
						that.setTextTooltipMenuState();
						that.setTextTooltipMenuPostion();
						that.setMultiTooltipMenuPostion();
						break;
				}
			}else {
				that.setTextTooltipMenuState();
				that.setTextTooltipMenuPostion();
				that.setMultiTooltipMenuPostion();
			}
		},
		// 현재 선택된 글자에 블록태그(파라미터의 tag)를 설정한다.
		setFormatBlock: function(tag) {
			var that = this;

			if(typeof tag === 'string') {
				if(that.isSelection() && 'rangeCount' in that.selection && that.selection.rangeCount > 0 && module.getParent( // 추가하려는 tag가 상위에 존재하는지 확인
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
		/*
		-
		이미지 관련

		현재는 마우스 위치에 따라서 이미지 툴바가 나오지만,
		커서위치에 따라 해당 라인의 첫 부분에 에디터가 나오도록 변경해야 한다!!

		브라우저 밖으로 에디터 툴팁이 나갔는지 검사할 필요 있음
		*/
		// 에디터에 데이터 넣기
		setPut: function(parameter) {
			var that = this;

			var parameter = parameter || {};
			var type = parameter['type'];
			var data = parameter['data'];

			switch(type) {
				case 'image':
					// data 의 종류 구분 
					// url, base64, element node


					//
					(function() {
						var setImage = function(result) {
							var figure, figcaption;
							var img, p;
							var tempImage;

							// figure, figcaption
							// http://html5doctor.com/the-figure-figcaption-elements/
							img = document.createElement("img");
							img.setAttribute('src', result);
							if(that.imageBound && that.imageBound.bottomElement) {

								console.log('imageBound.bottomElement');
								console.log(that.imageBound.bottomElement);

								// 추가하려는 tag 상위 존재여부 확인 (figure)
								if(module.getParent( 
									that.imageBound.bottomElement,
									// 조건
									function(node) {
										return node.nodeName.toLowerCase() === 'figure';
									},
									// 조건에 따른 실행
									function(node) {
										return node;
									}
								)) {
									that.elements.target.insertBefore(img, that.imageBound.bottomElement);
								}else {
									figure = document.createElement("figure");
									figcaption = document.createElement("figcaption");
									figure.appendChild(img);
									figure.appendChild(figcaption);
									that.elements.target.insertBefore(figure, that.imageBound.bottomElement);
								}
							}else {
								figure = document.createElement("figure");
								figcaption = document.createElement("figcaption");
								figure.appendChild(img);
								figure.appendChild(figcaption);
								that.elements.target.appendChild(figure);
							}
						};
						var i, max;

						if(Array.isArray(data)) {
							for(i=0, max=data.length; i<max; i++) {
								setImage(data[i]);
							}
						}else {
							setImage(data);
						}
					})();
					break;
			}
		},
		// 텍스트 에디터 툴바 메뉴(각 기능) 현재 selection 에 따라 최신화
		setTextTooltipMenuState: function() {
			//console.log('setTextTooltipMenuState');
			/*
			현재 포커스 위치의 element 에서 부모(parentNode)노드를 검색하면서,
			텍스트 에디터메뉴에 해당하는 태그가 있는지 여부에 따라
			해당 버튼에 on/off 효과를 준다.
			*/
			var that = this;
			var key;
			if(that.isSelection() && 'rangeCount' in that.selection && that.selection.rangeCount > 0) {
				for(key in that.elements['text']['command']) { // 버튼 선택 효과 초기화
					if(key === 'wrap') {
						continue;
					}
					//that.elements['text']['command'][key].classList.remove('active');
					that.elements['text']['command'][key].style.color = 'rgb(20, 29, 37)';
					that.elements['text']['command'][key].style.background = 'none';
				}
				module.getParent(
					that.selection.focusNode,
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
						if(node.style.color === '') {

						}
						
						// tag 확인
						switch(node.nodeName.toLowerCase()) {
							case 'b':
							case 'strong': // IE
								//that.elements['text']['command']['bold'].classList.add('active');
								that.elements['text']['command']['bold'].style.color = 'rgb(255, 255, 255)';
								that.elements['text']['command']['bold'].style.backgroundColor = 'rgb(226, 69, 69)';
								break;
							case 'i':
							case 'em': // IE
								that.elements['text']['command']['italic'].style.color = 'rgb(255, 255, 255)';
								that.elements['text']['command']['italic'].style.backgroundColor = 'rgb(226, 69, 69)';
								break;
							case 'strike':
								that.elements['text']['command']['strikethrough'].style.color = 'rgb(255, 255, 255)';
								that.elements['text']['command']['strikethrough'].style.backgroundColor = 'rgb(226, 69, 69)';
								break;
							case 'u':
								that.elements['text']['command']['underline'].style.color = 'rgb(255, 255, 255)';
								that.elements['text']['command']['underline'].style.backgroundColor = 'rgb(226, 69, 69)';
								break;
							case "h1":
								that.elements['text']['command']['h1'].style.color = 'rgb(255, 255, 255)';
								that.elements['text']['command']['h1'].style.backgroundColor = 'rgb(226, 69, 69)';
								break;
							case "h2":
								that.elements['text']['command']['h2'].style.color = 'rgb(255, 255, 255)';
								that.elements['text']['command']['h2'].style.backgroundColor = 'rgb(226, 69, 69)';
								break;
							case "h3":
								that.elements['text']['command']['h3'].style.color = 'rgb(255, 255, 255)';
								that.elements['text']['command']['h3'].style.backgroundColor = 'rgb(226, 69, 69)';
								break;
							case "blockquote":
								that.elements['text']['command']['blockquote'].style.color = 'rgb(255, 255, 255)';
								that.elements['text']['command']['blockquote'].style.backgroundColor = 'rgb(226, 69, 69)';
								break;
							case 'a':
								that.elements['text']['command']['createLink'].style.color = 'rgb(255, 255, 255)';
								that.elements['text']['command']['createLink'].style.backgroundColor = 'rgb(226, 69, 69)';
								break;
						}
					}
				);
			}
		},
		// 텍스트 에디터 툴바 위치 설정 (보이기/숨기기)
		setTextTooltipMenuPostion: function(parameter) {
			//console.log('setTextTooltipMenuPostion');
			var that = this;

			var parameter = parameter || {};
			var toggle = parameter['toggle'];

			var clientRectBounds;
			var tooltip_width, tooltip_height;
			var top = 0, left = 0;

			if((typeof that.selection === 'object' && that.selection.isCollapsed === true) || typeof that.selection !== 'object' || toggle === 'hide') {
				// 툴바숨기기
				that.elements['text']['tooltip'].style.top = EDGE + "px";
				that.elements['text']['tooltip'].style.left = EDGE + "px";
			}else if(that.isSelection()) {
				// 툴팁 크기
				tooltip_width = that.elements['text']['tooltip'].offsetWidth;
				tooltip_height = that.elements['text']['tooltip'].offsetHeight;
				// top / left
				clientRectBounds = that.selection.getRangeAt(0).getBoundingClientRect();
				top = (clientRectBounds.top - tooltip_height) - 5;
				if(top < 0) {
					top = clientRectBounds.bottom + 5; // 툴팁 하단에 출력되도록 변경
					that.elements['text']['tooltip'].style.borderTop = '1px solid rgba(231, 68, 78, .86)';
					that.elements['text']['tooltip'].style.borderBottom = 'none';
				}else {
					that.elements['text']['tooltip'].style.borderBottom = '1px solid rgba(231, 68, 78, .86)';
					that.elements['text']['tooltip'].style.borderTop = 'none';
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
				that.elements['text']['tooltip'].style.top = top + "px";
				that.elements['text']['tooltip'].style.left = left + "px";
			}
		},
		// 멀티미디어 에디터 툴바 위치 설정 (보이기/숨기기)
		setMultiTooltipMenuPostion: function(parameter) {
			var that = this;

			var parameter = parameter || {};
			var toggle = parameter['toggle'];

			var clientRectBounds;
			var clientRectBounds_Editor;
			var tooltip_width, tooltip_height;
			var top = 0, left = 0;
			var height = 0;

			if((typeof that.selection === 'object' && that.selection.isCollapsed === false) || typeof that.selection !== 'object' || toggle === 'hide') {
				// 숨기기
				that.elements['multi']['tooltip'].style.top = EDGE + "px";
				that.elements['multi']['tooltip'].style.left = EDGE + "px";
			}else if(that.isSelection()) {
				// 툴팁 크기
				tooltip_width = that.elements['multi']['tooltip'].offsetWidth;
				tooltip_height = that.elements['multi']['tooltip'].offsetHeight;
				// left
				clientRectBounds_Editor = that.elements.target.getBoundingClientRect();
				left = (clientRectBounds_Editor.left - tooltip_width) - 5;
				if(left < 0) {
					left = clientRectBounds_Editor.left + 5; // 툴팁 에디터 안쪽에 출력되도록 변경
					that.elements['multi']['tooltip'].style.border = 'none';
				}else {
					that.elements['multi']['tooltip'].style.borderRight = '1px solid rgba(231, 68, 78, .86)';
				}
				left += window.pageXOffset; // scroll
				// top
				// #text node 는 getBoundingClientRect 없음
				if(that.selection.anchorNode && 'getBoundingClientRect' in that.selection.anchorNode) {
					clientRectBounds = that.selection.anchorNode.getBoundingClientRect();
				}else if(that.selection.focusNode && 'getBoundingClientRect' in that.selection.focusNode) {
					clientRectBounds = that.selection.focusNode.getBoundingClientRect();
				}else {
					clientRectBounds = that.selection.getRangeAt(0).getBoundingClientRect();
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
				that.elements['multi']['tooltip'].style.top = top + "px";
				that.elements['multi']['tooltip'].style.left = left + "px";
			}
		},
		// 이미지 에디터 툴바 위치 설정
		setImageTooltipMenuPostion: function(parameter) {
			var that = this;


		},
		// 오픈그래프
		setOpengraph: function(parameter) {
			var that = this;

			var parameter = parameter || {};
			var node = parameter['node'];
			var url = parameter['url'] || '';
			var fragment;
			var a, div, p, comment;

			if(typeof node === 'object' && (url && regexp.url.test(url) || regexp.url.test(node.nodeValue)) && node.parentNode.nodeName.toLowerCase() !== 'a') {
				url = url || node.nodeValue;
				//console.log('url: ' + url);

				(function(node, url) {
					var fragment;
					var a, div, p, comment;

					//
					if(!url.match("^(http|https)://")) {
						url = "http://" + url;
					}

					fragment = document.createDocumentFragment();
					a = document.createElement("a");
					div = document.createElement("div");
					p = document.createElement("p");
					//comment = document.createComment('{"url":"'.url.'"}');
					fragment.appendChild(a);
					fragment.appendChild(div);
					fragment.appendChild(p);
					
					// 링크 구성 (새창 등 속성 설정)
					a.href = url;
					a.target = '_blank';
					a.textContent = a.innerText = url;

					// 빈공간, 하단영역 태그 내부 기본값 (크롬 등 일부 브라우저)
					div.innerHTML = '<br />';
					p.innerHTML = '<br />';

					// 사용자가 입력한 url 변경
					// insertAdjacentHTML
					//node.parentNode.replaceChild(fragment, node);
					if(node.parentNode.insertBefore(fragment, node)) {
						node.parentNode.removeChild(node);
					}

					// 오픈그래프 정보 불러오기
					api.xhr({
						'url': that.settings.submit.opengraph,
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
				})(node, url);
			}
		},
		// 에디터가 작동할 영역의 이벤트
		on: function() {
			var that = this;

			// storage
			if(typeof that.elements.target.storage !== 'object') {
				that.elements.target.storage = {};
			}else if(that.elements.target.storage['EVENT_MOUSEUP_EDITOR'] || that.elements.target.storage['EVENT_KEYDOWN_EDITOR'] || that.elements.target.storage['EVENT_KEYUP_EDITOR']) {
				// 이벤트가 중복되지 않도록 이미 적용되어 있는지 확인한다.				
				return true;
			}

			// contentEditable
			//console.log(that.elements.target);
			//console.log(that.elements.target.contentEditable);
			//console.log(that.elements.target.isContentEditable);
			if(!that.elements.target.isContentEditable) {
				//continue;
				that.elements.target.contentEditable = true; // 해당 element 내부 수정가능하도록 설정
			}

			// 마우스 이벤트
			$(that.elements.target).on(env.event.up + '.EVENT_MOUSEUP_EDITOR', function(e) {
				that.setSelection(e);
				that.setTooltipToggle(e);

				// 상위 태그에 p, div 등 블록 태그가 없을 때
				// p 태그를 삽입한다.


				
			});
			/*that.elements.target.addEventListener('mouseup', that.setSelection, false);
			that.elements.target.storage['EVENT_MOUSEUP_EDITOR'] = {
				"events": 'mouseup',
				"handlers": that.setSelection,
				"capture": false
			};*/
			
			// 키보드 이벤트
			$(that.elements.target).on('keydown.EVENT_KEYDOWN_EDITOR', function(e) {
				//console.log('setContenteditableKeydown');
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				var parentParagraph;
				var prevSibling;

				// 방향키, 엔터키 등
				that.setSelection(e);
				that.setTooltipToggle(e);

				// getSelection 선택된 node
				if(that.isSelection()) {
					if(event.keyCode === 13) { // keyCode 13: enter
						parentParagraph = module.getParent( // 현재노드 상위 검색
							that.selection.anchorNode,
							// 조건
							function(node) {
								node = node.nodeName.toLowerCase();
								return node === 'p' || node === 'figure';
							},
							// 조건에 따른 실행
							function(node) {
								return node;
							}
						);
						if(typeof parentParagraph === 'object' && parentParagraph.nodeType) {
							switch(parentParagraph.nodeName.toLowerCase()) {
								case 'p':
									// 현재 p태그 내부에 커서가 있으며
									// p태그 내부 텍스트가 입력되지 않은 빈상태이며
									// p태그 바로전 태그가 hr 태그의 경우
									// 사용자가 엔터키를 눌렀을 경우 작동하지 않도록 한다.
									prevSibling = parentParagraph.previousSibling; // 하나 전의 노드
									if(prevSibling && prevSibling.nodeName === "HR" && !prevSibling.textContent.length/*!parentParagraph.nodeValue.length*/) {
										// p 태그안에 위치하면서 상단 tag 가 hr 인 경우, 엔터키가 작동하지 않도록 한다.
										// enter 기본 이벤트 중지
										event.preventDefault();
									}
									break;
								case 'figure':
									// enter 기본 이벤트 중지
									event.preventDefault();
									break;
							}
						}
						// opengraph
						if(that.settings.submit.opengraph && that.selection.isCollapsed) {
							that.setOpengraph({'node': that.selection.anchorNode});
						}
					}
				}
			});
			$(that.elements.target).on('keyup.EVENT_KEYUP_EDITOR', function(e) {
				//console.log('setContenteditableKeyup');
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				var parentParagraph, prevSibling, prevPrevSibling, hr;
				var insertedNode, unwrap, node, parent, range;

				// 방향키, 엔터키 등
				that.setSelection(e);
				that.setTooltipToggle(e);

				// getSelection 선택된 node
				if(that.isSelection()) {
					if(event.keyCode === 13) { // keyCode 13: enter
						// DIV 내부에서 엔터를 눌렀을 경우 div 내부에서 br로 처리되므로 p 태그로 변경되도록 처리한다.
						if(that.selection.anchorNode.nodeName.toLowerCase() === 'div') {
							that.setFormatBlock("p");
						}

						parentParagraph = module.getParent( // 현재노드 상위 검색
							that.selection.anchorNode,
							// 조건
							function(node) {
								node = node.nodeName.toLowerCase();
								return node === 'p' || node === 'figure';
							},
							// 조건에 따른 실행
							function(node) {
								return node;
							}
						);
						if(typeof parentParagraph === 'object' && parentParagraph.nodeType) {
							switch(parentParagraph.nodeName.toLowerCase()) {
								case 'p':
									/*
									// 현재 포커스가 비어있는 p태그 내부에서 엔터를 눌렀을 경우 hr 태그로 변경되도록 처리한다.
									prevSibling = parentParagraph.previousSibling; // 하나 전의 노드
									prevPrevSibling = prevSibling;
									while(prevPrevSibling) {
										if(prevPrevSibling.nodeType !== Node.TEXT_NODE) { // Node는 전역변수 window.Node (TEXT_NODE: 3)
											break;
										}
										prevPrevSibling = prevPrevSibling.previousSibling; // 하나 전의 노드
									}
									// hr 태그 삽입
									if(prevSibling.nodeName === "P" && prevPrevSibling.nodeName !== "HR" && !prevSibling.textContent.length*//*!prevSibling.nodeValue.length*//*) {
										hr = document.createElement("hr");
										hr.contentEditable = false;
										parentParagraph.parentNode.replaceChild(hr, prevSibling);
									}
									*/
									break;
								case 'figure':
									/*
									figure 내부에 figcaption 태그가 없으면 figcaption 생성
									figcaption 생성후 아무것도 입력하지 않은 상태에서 엔터키를 누르면 
									figure 밖으로 빠져나옴

									근데 불편할것 같다.
									*/

									console.log('enter 정지!');
									console.log(parentParagraph);
									console.log(parentParagraph.nextSibling);

									/*
									https://www.google.co.kr/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#newwindow=1&q=chrome+contenteditable+p+tag+append
									http://stackoverflow.com/questions/35705291/cross-browser-way-to-insert-br-or-p-tag-when-hitting-enter-on-a-contenteditable
									http://stackoverflow.com/questions/3771824/select-range-in-contenteditable-div
									*/
									var p = document.createElement('p');
									var br = document.createElement("br"); // 크롬은 p 태그 내부 br 이 존재해야 한다.
									range = document.createRange();
									parentParagraph.parentNode.insertBefore(p, parentParagraph.nextSibling);
									range.setStart(p, 0);
									range.setEnd(p, 0);
									//range.selectNode(p);
									range.insertNode(br);
									range.setStartAfter(br);
									range.setEndAfter(br);
									that.selection.removeAllRanges();
									that.selection.addRange(range);
									break;
							}
						}
					}

					// -, *, 1. 입력에 따른 목록태그 변환
					// isCollapsed: 셀렉션의 시작지점과 끝지점이 동일한지의 여부
					// nodeValue: Text와 Comment 노드에서 실제 텍스트 문자열 추출
					/*if(that.selection.isCollapsed && that.selection.anchorNode.nodeValue && that.selection.anchorNode.parentNode.nodeName !== "LI") { 
						//console.log('that.selection.isCollapsed: ' + that.selection.isCollapsed);
						
						if(that.selection.anchorNode.nodeValue.match(/^[-*]\s/)) { 
							// "- 텍스트작성" 또는 "* 텍스트작성" 행태로 글을 작성했을 경우 목록태그로 변경
							document.execCommand('insertUnorderedList'); // ul 태그 생성
							that.selection.anchorNode.nodeValue = that.selection.anchorNode.nodeValue.substring(2);
							insertedNode = module.getParent( // 현재노드 상위로 존재하는 ul 태그 반환
								that.selection.anchorNode,
								// 조건
								function(node) {
									return node.nodeName.toLowerCase() === 'ul';
								},
								// 조건에 따른 실행
								function(node) {
									return node;
								}
							);
						}else if(that.selection.anchorNode.nodeValue.match(/^1\.\s/)) { 
							// "1. 텍스트작성" 형태로 글을 작성했을 경우 목록태그로 변경
							document.execCommand('insertOrderedList'); // ol 태그 생성
							that.selection.anchorNode.nodeValue = that.selection.anchorNode.nodeValue.substring(3);
							insertedNode = module.getParent( // 현재노드 상위로 존재하는 ol 태그 반환
								that.selection.anchorNode,
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
							node = that.selection.anchorNode;
							parent = insertedNode.parentNode;
							parent.parentNode.insertBefore(insertedNode, parent);
							parent.parentNode.removeChild(parent);

							range = document.createRange();
							range.setStart(node, 0);
							range.setEnd(node, 0);
							that.selection.removeAllRanges();
							that.selection.addRange(range);
						}
					}*/
				}
			});

			// contenteditable paste text only
			// http://stackoverflow.com/questions/12027137/javascript-trick-for-paste-as-plain-text-in-execcommand
			$(that.elements.target).on('paste', function(e) {
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

			// 커서 (focus)
			//$(that.elements.target).on('focus.EVENT_FOCUS_EDITOR', that.setSelection); // keydown, mouseup 이벤트와 중복 실행됨
			$(that.elements.target).on('blur.EVENT_BLUR_EDITOR', function(e) {
				that.setSelection(e);
				that.setTooltipToggle(e);
			});

			/*
			-
			커서 위치에 따라 이미지 삽입 툴바 보이기/숨기기/위치 설정
			
			*/
			
			// document event
			/*$(document).on(env.event.up + '.EVENT_MOUSEUP_EDITOR_DOCUMENT', function(e) {
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				//var target = event && (event.target || event.srcElement);
				// 툴팁내부 클릭된 것인지 확인
				if(!that.elements['text']['tooltip'].contains(event.target)) {
					console.log('document mouseup');
					setTimeout(function() {
						that.setSelection(event);
						that.setTooltipToggle();
					}, 1);
				}
			});*/
			
			// 한글입력관련
			$(document).on('compositionstart.EVENT_COMPOSITIONSTART_EDITOR', function() {
				that.composition = true;
			});
			$(document).on('compositionend.EVENT_COMPOSITIONEND_EDITOR', function() {
				that.composition = false;
			});
		},
		off: function() {
			var that = this;

			// 에디터가 사용된 대상의 이벤트 해제
			if(typeof that.elements.target.storage !== 'object') {
				return false;
			}

			// 마우스 이벤트
			$(that.elements.target).off('.EVENT_MOUSEUP_EDITOR');
			/*that.elements.target.removeEventListener(that.elements.target['storage']['EVENT_MOUSEUP_EDITOR']['events'], that.elements.target['storage']['EVENT_MOUSEUP_EDITOR']['handlers'], that.elements.target['storage']['EVENT_MOUSEUP_EDITOR']['capture']);
			delete that.elements.target['storage']['EVENT_MOUSEUP_EDITOR'];*/

			// 키보드 이벤트
			$(that.elements.target).off('.EVENT_KEYDOWN_EDITOR');
			/*that.elements.target.removeEventListener(that.elements.target['storage']['EVENT_KEYDOWN_EDITOR']['events'], that.elements.target['storage']['EVENT_KEYDOWN_EDITOR']['handlers'], that.elements.target['storage']['EVENT_KEYDOWN_EDITOR']['capture']);
			delete that.elements.target['storage']['EVENT_KEYDOWN_EDITOR'];*/
			$(that.elements.target).off('.EVENT_KEYUP_EDITOR');
			/*that.elements.target.removeEventListener(that.elements.target['storage']['EVENT_KEYUP_EDITOR']['events'], that.elements.target['storage']['EVENT_KEYUP_EDITOR']['handlers'], that.elements.target['storage']['EVENT_KEYUP_EDITOR']['capture']);
			delete that.elements.target['storage']['EVENT_KEYUP_EDITOR'];*/
			$(that.elements.target).off('.EVENT_BLUR_EDITOR');

			// document event
			//$(document).off('.EVENT_MOUSEUP_EDITOR_DOCUMENT');

			// 한글입력관련
			$(document).off('.EVENT_COMPOSITIONSTART_EDITOR');
			$(document).off('.EVENT_COMPOSITIONEND_EDITOR');
		}
	};

	// public return
	return {
		search: function(key) {
			return module.instance[key] || false;
		},
		setup: function(settings) {
			var instance;

			settings['key'] = settings['key'] || 'flicking'; // 중복생성 방지 key 검사
			if(settings['key'] && this.search(settings['key'])) {
				instance = this.search(settings['key']);
				if(instance.change/* && JSON.stringify(instance.settings) !== JSON.stringify(settings)*/) {
					instance.change(settings);
				}
			}else {
				instance = new Editor(settings);
				if(settings['key'] && instance) {
					module.instance[settings['key']] = instance;
				}
			}
			return instance;
		},
		on: function(key) { // 전체 또는 해당 key
			if(key) {
				this.search(key) && this.search(key).on();
			}else {
				for(key in module.instance) {
					if(module.instance.hasOwnProperty(key)) {
						module.instance[key].on();
					}
				}
			}
		},
		off: function(key) { // 전체 또는 해당 key
			if(key) {
				this.search(key) && this.search(key).off();
			}else {
				for(key in module.instance) {
					if(module.instance.hasOwnProperty(key)) {
						module.instance[key].off();
					}
				}
			}
		},
		put: function(key, parameter) {
			if(key) {
				this.search(key) && this.search(key).setPut(parameter);
			}
		}
	};

}, this);