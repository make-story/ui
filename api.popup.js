/*
Popup

@version
0.1 (2015.07.07)

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

box-sizing: 내용 부분만 사이즈가 적용되는 content-box와 달리안의 여백과 선을 포함시켜 사이즈를 적용시켜줍니다. 
*/

;(function(factory, global) {

	'use strict'; // ES5
	if(typeof global === 'undefined' || global != window || !('api' in global) || !('utility' in global.api) || !('xhr' in global.api)) {
		return false;	
	}
	global.api.popup = factory(global, global.api.utility, global.api.xhr);

})(function(global, utility, xhr, undefined) {

	'use strict'; // ES5

	if(!utility || !xhr) {
		console.log('[오류] 종속된 파일 로드 오류');
		return false;
	}

	// 팝업
	var Popup = function() {
		var that = this;

		// instance - 팝업별 Module 인스턴스값이 저장되며, popup key 로 해당 인스턴스를 불러온다.
		that.instance = {};

		// settings (팝업 종류별로 사용하는 설정값) - 마지막으로 열었던 left, top 위치 또는 width, height 값
		that.settings = {
			// 스냅관련
			'gap': 20, // story 팝업간 차이
			'left': 0,
			'top': 0
		};

		// element 값
		that.element = {
			"container": undefined,
			// 작업표시줄(번치) - 생성된 popup(story) element 리스트를 보여주며, 사용자가 선택적으로 해당 element 를 remove 할 수 있다.
			// story 의 _ 숨김버튼을 클릭하면, bunch 리스트에 추가되고, x 닫기버튼을 클릭하면 해당 popup element 가 remove 된다.
			"bunch": undefined,
			//"mask": undefined, // 마스크는 각자 필요한 팝업 부분에서 쓰도록 한다.
			"folder": undefined,
			"story": undefined,
			"layer": undefined,
			"push": undefined,
			"confirm": undefined,
			"alert": undefined
		};

		// 팝업 z-index 관리
		that.zindex = 100;

		// time
		that.time = {
			'close': null
		};

		// callback
		that.callback = {
			'resize': {}
		};

		// 현재 실행중인 팝업 정보 (popup 키: element 값이 저장됨)
		that.action = {
			/*
			'종류': {
				'popup key값': 'popup element값'
			}
			*/
			'bunch': {},
			'folder': {}, // block 폴더
			'story': {}, // story 팝업
			'layer': {},
			'push': {},
			'confirm': {},
			'alert': {}
		};

		// init
		that.init();

		// event
		that.setDocumentMousedownOn();
		that.setResizeOn();
	};
	Popup.prototype = {
		// 초기값 설정
		init: function() {
			var that = this;
			var fragment;

			// body
			if(!document.body) {
				console.log('[오류] document.body 정보없음');
				return false;
			}

			// element 생성작업
			if(document.getElementById('api_container')) {
				that.element.container = document.getElementById('api_container');
				//that.element.mask = that.element.container.getElementById('api_container_mask');
				that.element.folder = that.element.container.getElementById('api_container_folder');
				that.element.story = that.element.container.getElementById('api_container_story');
				that.element.center = that.element.container.getElementById('api_container_center');
				that.element.lefttop = that.element.container.getElementById('api_container_lefttop');
				that.element.leftbottom = that.element.container.getElementById('api_container_leftbottom');
				that.element.righttop = that.element.container.getElementById('api_container_righttop');
				that.element.rightbottom = that.element.container.getElementById('api_container_rightbottom');
				that.element.bunch = that.element.container.getElementById('api_container_bunch');
			}else {
				fragment = document.createDocumentFragment();

				// ---------- 

				// popup container - 팝업 element(종류별) 전체를 감싸고 있는 것
				that.element.container = document.createElement('div');
				that.element.container.id = 'api_container';
				that.element.container.style.cssText = 'position: fixed; left: 0px; top: 0px;';
				fragment.appendChild(that.element.container);

				// 실행중인 팝업 리스트 출력 (전체화면)
				that.element.bunch = document.createElement('div');
				//that.element.bunch.id = 'api_action';
				that.element.bunch.style.cssText = 'position: fixed; left: 0px; top: -100%; width: 100%; height: 100%; overflow: auto; background-color: rgba(26, 27, 28, 0.90); border-bottom: 1px solid rgb(51, 52, 53); display: none;';
				fragment.appendChild(that.element.bunch);
				api.dom(that.element.bunch).on(api['env']['event']['down'] + '.EVENT_MOUSEDOWN_popup_bunch', function(e) {
					var event = e || window.event;
					if(event.preventDefault) { // 현재 이벤트의 기본 동작을 중단한다.
						event.preventDefault();
					}else {
						event.returnValue = false;
					}
					if(event.stopPropagation) { // 현재 이벤트가 상위로 전파되지 않도록 중단한다.
						event.stopPropagation();
					}else {
						event.cancelBubble = true;
					}
				});

				// ---------- 

				/*
				// mask 
				that.element.mask = document.createElement('div');
				//that.element.mask.id = 'api_container_mask';
				that.element.mask.style.cssText = 'position: fixed; left: 0px; top: 0px; width: 100%; height: 100%; overflow: auto; background-color: rgba(255, 255, 255, 0.5); display: none;';
				that.element.container.appendChild(that.element.mask);
				*/

				// ---------- 

				// folder container (폴더는 한개만 열린다)
				that.element.folder = document.createElement('div');
				//that.element.folder.id = 'api_container_folder';
				that.element.folder.style.cssText = 'position: fixed; left: 0px; top: 0px;';
				that.element.container.appendChild(that.element.folder);

				// story container (스토리는 여러개 열릴 수 있다)
				that.element.story = document.createElement('div');
				//that.element.story.id = 'api_container_story';
				that.element.story.style.cssText = 'position: fixed; left: 0px; top: 0px;';
				that.element.container.appendChild(that.element.story);

				// ---------- 

				// layer
				that.element.layer = document.createElement('div');
				//that.element.layer.id = 'api_container_layer';
				that.element.layer.style.cssText = 'position: fixed; left: 0px; top: 0px;';
				that.element.container.appendChild(that.element.layer);

				// push
				that.element.push = document.createElement('div');
				//that.element.push.id = 'api_container_push';
				that.element.push.style.cssText = 'position: fixed; left: 0px; top: 0px;';
				that.element.container.appendChild(that.element.push);

				// confirm
				that.element.confirm = document.createElement('div');
				//that.element.confirm.id = 'api_container_confirm';
				that.element.confirm.style.cssText = 'position: fixed; left: 0px; top: 0px;';
				that.element.container.appendChild(that.element.confirm);

				// alert
				that.element.alert = document.createElement('div');
				//that.element.alert.id = 'api_container_alert';
				that.element.alert.style.cssText = 'position: fixed; left: 0px; top: 0px;';
				that.element.container.appendChild(that.element.alert);

				// ----------

				//document.body.insertBefore(fragment, document.body.firstChild);
				document.body.appendChild(fragment);
			}
		},
		// 팝업 종류별 인스턴스(모듈) 생성 - 해당 키의 인스턴스가 생성되었는지를 확인하는데 사용할 수도 있다.
		// 팝업 종류별로 설정되는 옵션은 parameter['settings'][' ... '] = ''; 형식으로 준다.
		setup: function(parameter) {
			var that = this;

			// parameter
			var parameter = parameter || {};
			var key = parameter['key']; // popup key
			var form = parameter['form']; // 종류: folder, story, layer(말풍선), target(해당 element 근처) 등
			var align = parameter['align']; // 위치: left, right, center, {'top': 값, 'left': 값}
			var width = parameter['width'] || 0;  // popup width 픽셀값
			var height = parameter['height'] || 0;  // popup height 픽셀값
			//var animate = parameter['animate']; // 애니메이션 방식
			//var transitionend = parameter['transitionend']; // transitionend 콜백
			var settings = parameter['settings']; // popup 설정값 (form 종류에 따라 설정값 형식이 다르다)

			// ---------- ---------- ---------- ---------- ---------- ----------

			if(!key || !form) {
				console.log('[오류] setup 필수값');
				return false;
			}else if(key in that['instance'] && typeof that['instance'][key]['element']['container'] === 'object') {
				console.log('[경고] 존재 key (이미 생성된 것)');
				//return false;
				//return that['instance'][key]['element']['container'];
				return that['instance'][key];
			}

			// ---------- ---------- ---------- ---------- ---------- ----------

			// 모듈
			var Module = function() {
				// info
				this.key; // popup key
				this.form; // 종류
				this.align; // 위치
				this.width; 
				this.height;
				this.animate;
				this.transitionend;
				//
				this.left; 
				this.top;

				// settings (팝업 종류별 설정값)
				this.settings = {
					/*
					// 제목
					"title": "",
					// folder
					"grid": "부모 grid (팝업 open을 실행한 grid 값)",
					"title_callback": function() {},
					// story
					"block": "자신을 실행시킨 block 의 key",
					*/
				};

				// 생성된 element 리스트 (container 는 필수)
				this.element = {
					"container": undefined
				};
			};

			// ---------- ---------- ---------- ---------- ---------- ----------

			// popup 별로 인스턴스를 만든다.
			// key 로 해당 인스턴스를 불러와 동작 시킨다.
			// new Module.call(parameter);
			that['instance'][key] = new Module();
			that['instance'][key]['key'] = key;
			that['instance'][key]['form'] = form;
			if(typeof align === 'object' && ('left' in align || 'right' in align || 'top' in align || 'bottom' in align)) {
				that['instance'][key]['align'] = align;
			}else if(typeof parameter['align'] === 'string' && /center|lefttop|leftbottom|righttop|rightbottom/.test(align)) {
				that['instance'][key]['align'] = align;
			}else {
				that['instance'][key]['align'] = 'center';
			}
			that['instance'][key]['width'] = width;
			that['instance'][key]['height'] = height;
			//that['instance'][key]['animate'] = animate;
			/*if(typeof transitionend === 'function') {
				that['instance'][key]['transitionend'] = transitionend;
			}*/
			if(typeof settings === 'object') { // 사용자 설정값 추가 (각 팝업 종류별 설정값 리스트)
				that['instance'][key]['settings'] = settings;	
			}

			// element 생성
			if(!that.setCreateElement({'key': key})) {
				return false;
			}

			// 인스턴스 반환
			return that['instance'][key];
		},
		//
		getInstance: function(parameter) {
			var that = this;

			// parameter
			var parameter = parameter || {};
			var key = parameter['key']; // popup key

			if(that['instance'][key] && that['instance'][key]['element']['container'] && typeof that['instance'][key]['element']['container'] === 'object') {
				return that['instance'][key];
			}else {
				console.log('[경고] 해당 key 존재하지 않음');
				return false;
			}
		},
		// document mousedown
		setDocumentMousedownOn: function() {
			var that = this;

			// 이벤트 키를 검사하여, 이미 이벤트가 설정되었는지 확인 (이벤트 중복 설정 방지)
			if(document['storage'] && document['storage']['EVENT_MOUSEDOWN_popup_document']) {
				console.log('[경고] 중복이벤트 실행');
				return;
			}

			// container 에 click 이벤트가 발생했을 때
			// body 또는 html 이 검색되도록 data-type="popup" 이 검출되지 않으면 현재 실행중인 action 팝업을 모두 닫는다.
			api.dom(document).on(api['env']['event']['down'] + '.EVENT_MOUSEDOWN_popup_document', function(e) {
				var event = e || window.event;
				var key;
				var is = false;

				// folder 검사
				for(key in that['action']['folder']) {
					if(that['action']['folder'][key].contains(event.target)) {
						is = true;
						break;
					}
				}
				if(is === false) {
					/*
					// 현재 이벤트가 상위로 전파되지 않도록 중단한다.
					if(event.stopPropagation) { 
						event.stopPropagation();
					}else {
						event.cancelBubble = true;
					}
					// 현재 이벤트의 기본 동작을 중단한다.
					if(event.preventDefault) { 
						event.preventDefault();
					}else {
						event.returnValue = false;
					}
					*/
					that.setAllHide({'form': ['folder']});	
				}
			});
		},
		setDocumentMousedownOff: function() {
			var that = this;

			api.dom(document).off('.EVENT_MOUSEDOWN_popup_document');
		},
		// 브라우저 리사이즈 콜백
		setResizeOn: function() {
			var that = this;
			var time = null;

			// 이벤트 키를 검사하여, 이미 이벤트가 설정되었는지 확인 (이벤트 중복 설정 방지)
			if(window['storage'] && window['storage']['EVENT_RESIZE_popup_window']) {
				console.log('[경고] 중복이벤트 실행');
				return;
			}
			api.dom(window).on(api['env']['event']['resize'] + '.EVENT_RESIZE_popup_window', function(e) {
				var key;
				window.clearTimeout(time);
				time = window.setTimeout(function(){ 
					// 등록된 resize 콜백 실행 (setOpen 메소드 등에서 설정됨)
					for(key in that['callback']['resize']) {
						if(typeof that['callback']['resize'][key] === 'function') {
							that['callback']['resize'][key](key);
						}
					}
				}, 200);
			});
		},
		setResizeOff: function() {
			var that = this;
			api.dom(window).off('.EVENT_RESIZE_popup_window');
		},
		// popup element 검색
		getContainerElement: function(parameter) {
			var that = this;

			// parameter
			var parameter = parameter || {};
			var key = parameter['key']; // popup key

			// ---------- ---------- ---------- ---------- ---------- ----------

			if(!key) {
				console.log('[오류] key 정보없음');
				return false;
			}

			// ---------- ---------- ---------- ---------- ---------- ----------

			return (that['instance'][key] && that['instance'][key]['element']['container'] && typeof that['instance'][key]['element']['container'] === 'object' && that['instance'][key]['element']['container']) || (function() {
				// instance 에 해당 element 값이 없으므로 document 에서 검색
				console.log('[search] popup document');
				return document.querySelector('[data-type="popup"][data-key="' + key + '"]');
			})();
		},
		// 팝업 종류별 element 생성
		setCreateElement: function(parameter) {
			var that = this;

			// parameter
			var parameter = parameter || {};
			var key = parameter['key']; // popup key

			// ---------- ---------- ---------- ---------- ---------- ----------

			// container 
			if(!that['element']['container']) {
				console.log('[오류] container 정보없음');
				return false;
			}

			// element 가 이미 생성되어 있는지 확인한다
			if(that['instance'][key] && that['instance'][key]['element']['container'] && typeof that['instance'][key]['element']['container'] === 'object') {
				console.log('[오류] popup element');
				return false;
			}

			// ---------- ---------- ---------- ---------- ---------- ----------

			// 인스턴스
			var instance = that['instance'][key]; // 팝업별 인스턴스
			var fragment;

			// 팝업 종류별 작업
			switch(instance['form']) {
				case 'bunch':
					fragment = that.setBunchElement(instance);
					that['element']['bunch'].insertBefore(fragment, that['element']['bunch'].firstChild);
					break;
				case 'folder':
					fragment = that.setFolderElement(instance);
					that['element']['folder'].insertBefore(fragment, that['element']['folder'].firstChild);
					break;
				case 'story':
					fragment = that.setStoryElement(instance);
					that['element']['story'].insertBefore(fragment, that['element']['story'].firstChild);
					break;
				case 'layer':
					fragment = that.setLayerElement(instance);
					that['element']['layer'].insertBefore(fragment, that['element']['layer'].firstChild);
					break;
				case 'push':
					fragment = that.setPushElement(instance);
					that['element']['push'].insertBefore(fragment, that['element']['push'].firstChild);
					break;
				case 'confirm':
					fragment = that.setConfirmElement(instance);
					that['element']['confirm'].insertBefore(fragment, that['element']['confirm'].firstChild);
					break;
				case 'alert':
					fragment = that.setAlertElement(instance);
					that['element']['alert'].insertBefore(fragment, that['element']['alert'].firstChild);
					break;
			}

			return fragment;
		},
		// 번치 팝업 생성
		setBunchElement: function(instance) {
			var that = this;

			//
			var fragment = document.createDocumentFragment();

			// container 생성
			var container = instance['element']['container'] = api.dom('<section>').data({'type': 'popup', 'key': instance['key'], 'form': instance['form']}).prop({'storage': {'type': 'popup'}}).get(0);
			container.style.cssText = 'position: relative;';
			container.style.msTransitionProperty = container.style.OTransitionProperty = container.style.MozTransitionProperty = container.style.webkitTransitionProperty = container.style.transitionProperty = 'left, top';
			container.style.msTransitionDuration = container.style.OTransitionDuration = container.style.MozTransitionDuration = container.style.webkitTransitionDuration = container.style.transitionDuration = '1s';
			fragment.appendChild(container);

			// header
			var header = instance['element']['header'] = document.createElement('header');
			header.style.cssText = 'position: relative; height: 40px;';
			container.appendChild(header);

			// 팝업닫기 버튼
			var button_close = instance['element']['button_close'] = document.createElement('button');
			button_close.style.cssText = "position: absolute; right: 0px; width: 40px; height: 40px; background-image: url('./images/popup-buttons.png'); background-position: -30px 0px; background-repeat: no-repeat;";
			api.dom(button_close).on(api['env']['event']['down'], function(e) {
				var event = e || window.event;
				//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
				var touch = event.touches; // touchstart

				// 현재 이벤트가 상위로 전파되지 않도록 중단한다.
				if(event.stopPropagation) { 
					event.stopPropagation();
				}else {
					event.cancelBubble = true;
				}
				// 현재 이벤트의 기본 동작을 중단한다.
				if(event.preventDefault) { 
					event.preventDefault();
				}else {
					event.returnValue = false;
				}

				//container.style.display = 'none';
				that.setClose({'key': instance['key']});
			});
			header.appendChild(button_close);

			// content
			var content = instance['element']['content'] = document.createElement('div');
			content.style.cssText = "height: 260px; overflow: auto;";
			container.appendChild(content);

			return fragment;
		},
		// center, lefttop, leftbottom, righttop, rightbottom
		setLayerElement: function(instance) {
			var that = this;

			// 레이어에 넣을 값 확인
			if(!instance['settings']['element'] || !instance['settings']['element'].nodeType) {
				console.log('[오류] element값 없음');
			}

			//
			var fragment = document.createDocumentFragment();
			var container = instance['element']['container'] = api.dom('<section>').data({'type': 'popup', 'key': instance['key'], 'form': instance['form']}).prop({'storage': {'type': 'popup'}}).get(0);
			container.style.cssText = 'position: absolute;';
			fragment.appendChild(container);
			container.appendChild(instance['settings']['element']);

			return fragment;
		},
		// 알림 (align 값을 사용자가 옵션지정함, 레이아웃 디자인 cssText를 옵션으로 받음)
		setPuchElement: function(instance) {

		},
		// 확인창 (레이아웃 디자인 cssText를 옵션으로 받음)
		setConfirmElement: function(instance) {

		},
		// 경고창 (레이아웃 디자인 cssText를 옵션으로 받음)
		setAlertElement: function(instance) {

		},
		// 폴더 팝업 생성
		setFolderElement: function(instance) {
			var that = this;

			//
			var fragment = document.createDocumentFragment();

			// id 을 html 에 설정한 후 appendChild 시키고, 이후 id값으로 element 값을 찾아 저장해두는 구조
			var keys = {
				'header': api.key(),
				'title_input': api.key(),
				'title_button': api.key(),
				'close_button': api.key(),
				'grid': api.key(),
				'parent': api.key()
			};
			var width = 300 + api['env']['browser']['scrollbar'];

			// container 생성
			var container = instance['element']['container'] = api.dom('<section>').data({'type': 'popup', 'key': instance['key'], 'form': instance['form']}).prop({'storage': {'type': 'popup'}}).get(0);
			container.style.cssText = 'position: absolute; width: ' + width + 'px; box-shadow: 0px 0px 10px rgb(228, 229, 230); border-radius: 5px; transition-property: left, top; transition-duration: .5s;';
			container.innerHTML = '\
				<!-- header //-->\
				<header id="' + keys['header'] + '" style="margin: 0 auto; height: 50px; background-color: rgb(255, 255, 255); border-radius: 5px 5px 0px 0px;">\
					<!-- 폴더명 입력 //-->\
					<div style="position: absolute; left: 20px; top: 12px;">\
						<input type="text" name="" value="" id="' + keys['title_input'] + '" style="padding: 5px; width: 170px; height: 17px; background-color: rgb(248, 249, 250); border: 0; font-size: 13px; color: #4C4D4E; border-radius: 5px;">\
						<button id="' + keys['title_button'] + '" style="padding: 0px; display: inline-block; position: relative; left: -45px; border: 0; background-color: transparent; font-size: 13px;">Done</button>\
					</div>\
					<!-- 폴더 닫기 등 버튼 //-->\
					<div style="position: absolute; right: 20px; top: 14px;">\
						<button id="' + keys['close_button'] + '" style="padding: 0px; border: 0; background-color: transparent; font-size: 13px;">Close</button>\
					</div>\
				</header>\
				<!-- grid //-->\
				<div style="max-height: 200px; background-color: rgb(248, 249, 250); border-top: 2px solid rgb(232, 233, 234); border-bottom: 2px solid rgb(232, 233, 234); overflow-x: hidden; overflow-y: auto;">\
					<div id="' + keys['grid'] + '" data-type="content" style="margin: 0 auto; width: 300px;"></div>\
				</div>\
				<!-- parent grid move //-->\
				<div id="' + keys['parent'] + '" data-type="parent" data-folder="' + instance['key'] + '" data-grid="' + instance['settings']['grid'] + '" style="margin: 0 auto; padding-top: 32px; height: 68px; font-size: 14px; color: #E1E2E3; text-align: center; background-color: rgb(255, 255, 255); border-radius: 0px 0px 5px 5px; -moz-user-select: none; ">\
					<!-- 상위폴더로 이동할 경우 여기로 드래그 //-->\
					If you go to the parent folder<br>and drag it here\
				</div>\
			';
			fragment.appendChild(container);

			//
			var header = instance['element']['header'] = api.dom(fragment).find('#' + keys['header']).get(0);
			var title_input = instance['element']['title_input'] = api.dom(fragment).find('#' + keys['title_input']).get(0);
			var title_button = instance['element']['title_button'] = api.dom(fragment).find('#' + keys['title_button']).get(0);
			var close_button = instance['element']['close_button'] = api.dom(fragment).find('#' + keys['close_button']).get(0);
			var grid = instance['element']['grid'] = api.dom(fragment).find('#' + keys['grid']).get(0);

			api.dom(title_button).on(api['env']['event']['click'], function(e) {
				var event = e || window.event;
				var value = title_input.value;
				// 현재 이벤트가 상위로 전파되지 않도록 중단한다.
				if(event.stopPropagation) { 
					event.stopPropagation();
				}else {
					event.cancelBubble = true;
				}
				// 현재 이벤트의 기본 동작을 중단한다.
				if(event.preventDefault) { 
					event.preventDefault();
				}else {
					event.returnValue = false;
				}
				// 폴더 제목 변경
				if(typeof instance['settings']['title_callback'] === 'function') {
					instance['settings']['title_callback'].call(this, {'key': instance['key'], 'title': encodeURIComponent(value || '')});
				}
			});
			api.dom(close_button).on(api['env']['event']['click'], function(e) {
				var event = e || window.event;
				// 현재 이벤트가 상위로 전파되지 않도록 중단한다.
				if(event.stopPropagation) { 
					event.stopPropagation();
				}else {
					event.cancelBubble = true;
				}
				// 현재 이벤트의 기본 동작을 중단한다.
				if(event.preventDefault) { 
					event.preventDefault();
				}else {
					event.returnValue = false;
				}
				that.setHide({'key': instance['key']});
			});


			// 하단 parent grid 정보를 추적하기 위한 element 추가
			// data-type="parent" data-grid="부모 grid 키" data-folder="현재 folder 키" data-form="부모 grid 종류(main 또는 folder)"
			// 해당 folder 의 부모 grid
			// 부모 grid 값이 ysm 이 아니면 모두 folder 이다.
			// data-type="parent" data-folder="현재 folder 키" data-grid="부모 grid 키" 
			var parent = instance['element']['parent'] = api.dom(fragment).find('#' + keys['parent']).get(0);
			parent['storage'] = {
				'type': 'parent',
				'folder': instance['key'], 
				'grid': instance['settings']['grid']
			};

			return fragment;
		},
		// story 팝업 생성
		setStoryElement: (function() {
			// story 내부 html 불러오기
			var setIframeHTML = function(instance) {
				if(!instance || !instance['key'] || !instance['element']) {
					return false;
				}
				/*
				오프라인 실행과 온라인 실행을 구분
				오프라인: instance['settings']['url'] 값이 있음
				*/
				xhr({
					'type': 'post',
					'url': './select/html', 
					'data': {
						'block': instance['key']
					},
					'progressDownload': function(progress) {
						//console.log(progress);
						instance['element']['bar'].style.width = progress + '%';
						if(progress >= 100) {
							instance['element']['bar'].style.display = 'none';
						}
					},
					'success': function(html) {
						instance['element']['iframe'].onload = null; // 이벤트 정지
						//console.log('load HTML: ' + html);

						// sandbox
						//instance['element']['iframe'].sandbox = "allow-script"; // iframe 내부 스크립트

						// srcdoc: 
						// 코드 중 큰따옴표("")를 사용해서는 안 되므로 대신 &quot;를 사용해야 한다.
						// src 속성과 srcdoc 속성을 둘다 지정했을 때는 srcdoc 속성이 우선되며, srcdoc가 지원하지 않는 브라우저에서는 src 속성이 동작하게 됩니다.
						// https://github.com/jugglinmike/srcdoc-polyfill
						instance['element']['iframe'].srcdoc = decodeURIComponent(html || ''); // encodeURIComponent / decodeURIComponent

						// html
						//(instance['element']['iframe'].contentDocument || instance['element']['iframe'].contentWindow.document).body.innerHTML = 'test'; // body
						//(instance['element']['iframe'].contentDocument || instance['element']['iframe'].contentWindow.document).write('test'); // body
						//(instance['element']['iframe'].contentDocument || instance['element']['iframe'].contentWindow.document).documentElement.innerHTML = html;
					}
				});
			};

			// 모바일, PC 분기
			if(api['env']['device'] === 'mobile') {
				// mobile
				return function(instance) {
					var that = this;

					//
					var fragment;
					var container;
					var header, title, progress, bar, content, iframe;
					var button_group, button_refresh, button_hidden, button_close;

					//
					fragment = document.createDocumentFragment();
					container = instance['element']['container'] = api.dom('<section>').data({'type': 'popup', 'key': instance['key'], 'form': instance['form']}).prop({'storage': {'type': 'popup'}}).get(0);
					container.style.cssText = 'position: fixed;'; // 모바일은 전체화면으로 출력
					//container.style.left = 0;
					//container.style.top = 0;
					container.classList.add('popup_story_common');
					fragment.appendChild(container);

					// 팝업 타이틀, 제어 버튼 등 toolkit (모바일에서는 하단에 적용)
					header = instance['element']['header'] = document.createElement('header');
					header.style.cssText = "position: fixed; bottom: 5px; right: 5px;";
					header.style.boxSizing = header.style.mozBoxSizing = header.style.webkitBoxSizing = 'border-box';
					container.appendChild(header);

					// progressbar (xhr 로딩 진행율 표시)
					progress = instance['element']['progress'] = document.createElement('div');
					progress.style.cssText = "position: absolute; top: -4px; width: 100%;";
					bar = instance['element']['bar'] = document.createElement('div');
					bar.style.cssText = "background-color: rgba(237, 85, 101, 0.8); width: 0%; height: 3px; border-radius: 1px;";
					progress.appendChild(bar);
					header.appendChild(progress);

					// ----------

					// iframe 은 상위 element의 고정된 height 픽셀값이 있어야 정확한 height="100%" 가 적용된다.
					// 그러므로 iframe 를 감싸는 content(div) 를 만든다.
					content = instance['element']['content'] = document.createElement('div');
					if(api['env']['browser']['name'] === 'safari') {
						// safari 에서는 iframe 내부에 스크롤바가 생기도록 하려면 아래 div 가 필요하다.
						content.style.cssText = "overflow: auto; -webkit-overflow-scrolling: touch;"; // webkitOverflowScrolling
					}
					content.style.clear = 'both';
					content.style.width = '100%';
					//content.style.height = (utility.getNumber(container.style.height) - utility.getNumber(container.style.borderTopWidth) - utility.getNumber(container.style.borderBottomWidth) - utility.getNumber(header.style.height)) + 'px'; // 2: border 2개(1 + 1) 값
					//content.style.height = (utility.getNumber(container.style.height) - utility.getNumber(header.style.height)) + 'px';
					content.style.boxSizing = content.style.mozBoxSizing = content.style.webkitBoxSizing = 'border-box';
					container.insertBefore(content, container.firstChild); // 모바일의 경우 content 는 header 상단에 노출

					// iframe
					iframe = instance['element']['iframe'] = document.createElement('iframe');
					iframe.style.cssText = "margin: 0; padding: 0; pointer-events: auto; background-color: #F6F8FA; box-sizing: border-box; -moz-box-sizing: border-box; -webkit-box-sizing: border-box;";
					iframe.src = ""; // html을 불러오지 못할 경우를 대비하여 기본 html파일 경로를 적용해 둔다.
					iframe.width = "100%";
					iframe.height = "100%";
					iframe.setAttribute('scrolling', 'auto'); // HTML 4 only
					iframe.setAttribute('marginwidth', 0); // HTML 4 only
					iframe.setAttribute('marginheight', 0); // HTML 4 only
					iframe.setAttribute('frameborder', 0); // HTML 4 only
					iframe.onload = function() {
						setIframeHTML.call(this, instance);
					};
					(content || container).appendChild(iframe);

					// ----------

					// 버튼 모음
					button_group = instance['element']['button_group'] = document.createElement('div');
					button_group.style.cssText = "background-color: rgba(62, 65, 67, 0.92); box-shadow: 0 0 1px rgb(62, 65, 67); border-radius: 5px;";
					header.appendChild(button_group);

					// iframe 새로고침
					button_refresh = instance['element']['button_refresh'] = document.createElement('button');
					button_refresh.style.cssText = "width: 40px; height: 40px; background-image: url('./images/popup-buttons-40.png'); background-position: 0px 0px; background-repeat: no-repeat;";
					api.dom(button_refresh).on(api['env']['event']['down'], function(e) {
						var event = e || window.event;
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches; // touchstart
						
						// 현재 이벤트가 상위로 전파되지 않도록 중단한다.
						if(event.stopPropagation) { 
							event.stopPropagation();
						}else {
							event.cancelBubble = true;
						}
						// 현재 이벤트의 기본 동작을 중단한다.
						if(event.preventDefault) { 
							event.preventDefault();
						}else {
							event.returnValue = false;
						}

						//iframe.contentWindow.location.reload(true); // 비표준
						//iframe.src += '';
						setIframeHTML.call(this, instance);
					});
					button_group.appendChild(button_refresh);
					
					// 팝업 숨기기
					button_hidden = instance['element']['button_hidden'] = document.createElement('button');
					button_hidden.style.cssText = "width: 40px; height: 40px; background-image: url('./images/popup-buttons-40.png'); background-position: -40px 0px; background-repeat: no-repeat;";
					api.dom(button_hidden).on(api['env']['event']['down'], function(e) {
						var event = e || window.event;
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches; // touchstart

						// 현재 이벤트가 상위로 전파되지 않도록 중단한다.
						if(event.stopPropagation) { 
							event.stopPropagation();
						}else {
							event.cancelBubble = true;
						}
						// 현재 이벤트의 기본 동작을 중단한다.
						if(event.preventDefault) { 
							event.preventDefault();
						}else {
							event.returnValue = false;
						}

						//container.style.display = 'none';
						that.setHide({'key': instance['key']});
					});
					button_group.appendChild(button_hidden);

					// 팝업 닫기 (삭제)
					button_close = instance['element']['button_close'] = document.createElement('button'); 
					button_close.style.cssText = "width: 40px; height: 40px; background-image: url('./images/popup-buttons-40.png'); background-position: -80px 0px; background-repeat: no-repeat;";
					api.dom(button_close).on(api['env']['event']['down'], function(e) {
						var event = e || window.event;
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches; // touchstart
						
						// 현재 이벤트가 상위로 전파되지 않도록 중단한다.
						if(event.stopPropagation) { 
							event.stopPropagation();
						}else {
							event.cancelBubble = true;
						}
						// 현재 이벤트의 기본 동작을 중단한다.
						if(event.preventDefault) { 
							event.preventDefault();
						}else {
							event.returnValue = false;
						}

						// iframe 중지
						iframe.onload = null;
						//container.style.display = 'none';
						that.setClose({'key': instance['key']});
					});
					button_group.appendChild(button_close);
					
					return fragment;
				};
			}else {
				// pc, mobile
				return function(instance) {
					var that = this;

					//
					var fragment;
					var container;
					var header, title, progress, bar, content, iframe;
					var button_group, button_refresh, button_hidden, button_close;

					//
					fragment = document.createDocumentFragment();
					container = instance['element']['container'] = api.dom('<section>').data({'type': 'popup', 'key': instance['key'], 'form': instance['form']}).prop({'storage': {'type': 'popup'}}).get(0);
					//container.style.cssText = 'position: absolute; border: 1px solid rgb(33, 41, 48);';
					container.style.cssText = 'position: absolute; border: 1px solid rgb(62, 65, 67);';
					//container.style.left = 0;
					//container.style.top = 0;
					container.classList.add('popup_story_common');
					fragment.appendChild(container);

					// 팝업 타이틀, 제어 버튼 등 toolkit (모바일에서는 하단에 적용)
					header = instance['element']['header'] = document.createElement('header');
					//header.style.cssText = "position: relative; width: 100%; height: 30px; background-color: rgba(33, 41, 48, 0.88); border-bottom: 1px solid rgb(33, 41, 48);";
					header.style.cssText = "position: relative; width: 100%; height: 30px; background-color: rgba(62, 65, 67, 0.92); border-bottom: 1px solid rgb(62, 65, 67);";
					header.style.boxSizing = header.style.mozBoxSizing = header.style.webkitBoxSizing = 'border-box';
					container.appendChild(header);

					// 팝업 제목
					title = instance['element']['title'] = document.createElement('div');
					title.style.cssText = "position: absolute; top: 7px; left: 18px; font-size: 12px; color: #D9D9D9; cursor: move; -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;";
					title.textContent = instance['settings']['title'] && decodeURIComponent(instance['settings']['title']) || decodeURIComponent('Story');
					header.appendChild(title);

					// progressbar (xhr 로딩 진행율 표시)
					progress = instance['element']['progress'] = document.createElement('div');
					progress.style.cssText = "position: absolute; width: 100%; bottom: -4px;";
					bar = instance['element']['bar'] = document.createElement('div');
					bar.style.cssText = "background-color: rgba(237, 85, 101, 0.8); width: 0%; height: 3px; border-radius: 1px;";
					progress.appendChild(bar);
					header.appendChild(progress);

					// ----------

					// iframe 은 상위 element의 고정된 height 픽셀값이 있어야 정확한 height="100%" 가 적용된다.
					// 그러므로 iframe 를 감싸는 content(div) 를 만든다.
					content = instance['element']['content'] = document.createElement('div');
					content.style.cssText = "width: 100%; clear: both;";
					content.style.boxSizing = content.style.mozBoxSizing = content.style.webkitBoxSizing = 'border-box';
					container.appendChild(content);

					// iframe
					iframe = instance['element']['iframe'] = document.createElement('iframe');
					iframe.style.cssText = "margin: 0; padding: 0; pointer-events: auto; background-color: #F6F8FA; box-sizing: border-box; -moz-box-sizing: border-box; -webkit-box-sizing: border-box;";
					iframe.src = ""; // html을 불러오지 못할 경우를 대비하여 기본 html파일 경로를 적용해 둔다.
					iframe.width = "100%";
					iframe.height = "100%";
					iframe.setAttribute('scrolling', 'auto'); // HTML 4 only
					iframe.setAttribute('marginwidth', 0); // HTML 4 only
					iframe.setAttribute('marginheight', 0); // HTML 4 only
					iframe.setAttribute('frameborder', 0); // HTML 4 only
					iframe.onload = function() {
						setIframeHTML.call(this, instance);
					};
					(content || container).appendChild(iframe);

					// ----------

					// 버튼 모음
					button_group = instance['element']['button_group'] = document.createElement('div');
					//button_group.style.cssText = "position: absolute; top: 0px; right: 0px; padding: 0 9px; background-color: rgb(33, 41, 48);";
					button_group.style.cssText = "position: absolute; top: 0px; right: 0px; padding: 0 9px; background-color: rgb(62, 65, 67);";
					header.appendChild(button_group);

					// iframe 새로고침
					button_refresh = instance['element']['button_refresh'] = document.createElement('button');
					button_refresh.style.cssText = "width: 30px; height: 30px; background-image: url('./images/popup-buttons-30.png'); background-position: 0px 0px; background-repeat: no-repeat;";
					api.dom(button_refresh).on(api['env']['event']['down'], function(e) {
						var event = e || window.event;
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches; // touchstart
						
						// 현재 이벤트가 상위로 전파되지 않도록 중단한다.
						if(event.stopPropagation) { 
							event.stopPropagation();
						}else {
							event.cancelBubble = true;
						}
						// 현재 이벤트의 기본 동작을 중단한다.
						if(event.preventDefault) { 
							event.preventDefault();
						}else {
							event.returnValue = false;
						}

						//iframe.contentWindow.location.reload(true); // 비표준
						//iframe.src += '';
						setIframeHTML.call(this, instance);
					});
					button_group.appendChild(button_refresh);
					
					// 팝업 숨기기
					button_hidden = instance['element']['button_hidden'] = document.createElement('button');
					button_hidden.style.cssText = "width: 30px; height: 30px; background-image: url('./images/popup-buttons-30.png'); background-position: -30px 0px; background-repeat: no-repeat;";
					api.dom(button_hidden).on(api['env']['event']['down'], function(e) {
						var event = e || window.event;
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches; // touchstart

						// 현재 이벤트가 상위로 전파되지 않도록 중단한다.
						if(event.stopPropagation) { 
							event.stopPropagation();
						}else {
							event.cancelBubble = true;
						}
						// 현재 이벤트의 기본 동작을 중단한다.
						if(event.preventDefault) { 
							event.preventDefault();
						}else {
							event.returnValue = false;
						}

						//container.style.display = 'none';
						that.setHide({'key': instance['key']});
					});
					button_group.appendChild(button_hidden);

					// fullscreen button
					if(api['env']['check']['fullscreen'] === true) {
						(function setFullscreenButton() {
							// https://msdn.microsoft.com/en-us/library/dn265028(v=vs.85).aspx
							//var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
							//var fullscreenEnabled = document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled || document.msFullscreenEnabled;
							var button_size = instance['element']['button_size'] = document.createElement('button'); 
							button_size.style.cssText = "width: 30px; height: 30px; background-image: url('./images/popup-buttons-30.png'); background-position: -60px 0px; background-repeat: no-repeat;";
							api.dom(button_size).on(api['env']['event']['down'], function(e) {
								var event = e || window.event;
								//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
								var touch = event.touches; // touchstart

								if(((document.fullscreenElement && document.fullscreenElement != null) || document.mozFullScreen || document.webkitIsFullScreen)) {
									// 축소
									if(document.exitFullscreen) {
										document.exitFullscreen();
									}else if(document.mozCancelFullScreen) {
										document.mozCancelFullScreen();
									}else if(document.webkitExitFullscreen) {
										document.webkitExitFullscreen();
									}
								}else {
									// 확대
									if(iframe.requestFullscreen) {
										iframe.requestFullscreen();
									}else if(iframe.mozRequestFullScreen) {
										iframe.mozRequestFullScreen();
									}else if(iframe.webkitRequestFullscreen) {
										iframe.webkitRequestFullscreen();
									}else if(iframe.msRequestFullscreen) {
										iframe.msRequestFullscreen();
									}
								}

								// 현재 이벤트가 상위로 전파되지 않도록 중단한다.
								if(event.stopPropagation) { 
									event.stopPropagation();
								}else {
									event.cancelBubble = true;
								}
								// 현재 이벤트의 기본 동작을 중단한다.
								if(event.preventDefault) { 
									event.preventDefault();
								}else {
									event.returnValue = false;
								}
							});
							button_group.appendChild(button_size);
						})();
					}

					// 팝업 닫기 (삭제)
					button_close = instance['element']['button_close'] = document.createElement('button'); 
					button_close.style.cssText = "width: 30px; height: 30px; background-image: url('./images/popup-buttons-30.png'); background-position: -90px 0px; background-repeat: no-repeat;";
					api.dom(button_close).on(api['env']['event']['down'], function(e) {
						var event = e || window.event;
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches; // touchstart
						
						// 현재 이벤트가 상위로 전파되지 않도록 중단한다.
						if(event.stopPropagation) { 
							event.stopPropagation();
						}else {
							event.cancelBubble = true;
						}
						// 현재 이벤트의 기본 동작을 중단한다.
						if(event.preventDefault) { 
							event.preventDefault();
						}else {
							event.returnValue = false;
						}

						// iframe 중지
						iframe.onload = null;
						//container.style.display = 'none';
						that.setClose({'key': instance['key']});
					});
					button_group.appendChild(button_close);

					// ----------
					
					// 팝업이동 mouse down
					api.dom(header).on(api['env']['event']['down'], function(e) {
						var event = e || window.event;
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches; // touchstart

						// 현재 이벤트가 상위로 전파되지 않도록 중단한다.
						if(event.stopPropagation) { 
							event.stopPropagation();
						}else {
							event.cancelBubble = true;
						}
						// 현재 이벤트의 기본 동작을 중단한다.
						if(event.preventDefault) { 
							event.preventDefault();
						}else {
							event.returnValue = false;
						}

						// 멀티터치 방지
						if(touch && touch.length && 1 < touch.length) {
							return;
						}

						// button_group 내부에서 클릭된 이벤트
						if(api.dom(button_group).contains(event.target)) {
							console.log('[경고] button_group 내부 target');
							return false;
						}

						// 팝업의 마지막 left, top 값을 초기화 한다.
						that['settings']['left'] = 0;
						that['settings']['top'] = 0;

						// z-index
						that.zindex += 1;
						container.style.zIndex = that.zindex;

						// 마우스 위치
						var mouse = {
							'down': {
								'left': 0,
								'top': 0
							},
							'move': {
								'left': 0,
								'top': 0
							}
						};
						if(touch) {
							mouse.down.top = touch[0].pageY;
							mouse.down.left = touch[0].pageX;
						}else {
							mouse.down.top = event.pageY;
							mouse.down.left = event.pageX;
						}
						mouse.down.top = mouse.down.top - utility.getNumber(container.style.top);
						mouse.down.left = mouse.down.left - utility.getNumber(container.style.left);

						// snap 대상 element 배열에 저장
						var snap = [];
						var section = that['element']['story'].querySelectorAll('section');
						var i, max;
						for(i=0, max=section.length; i<max; i++) {
							// 현재 실행되고 있는 element 가 아닌 것만 리스트에 담는다 (현재 display되고 있는 story layer)
							if(container.isEqualNode(section[i]) === false && section[i].style && section[i].style.display != 'none') { 
								snap.push({
									'top': parseInt(section[i].offsetTop),
									'left': parseInt(section[i].offsetLeft),
									'bottom': parseInt(section[i].offsetTop + section[i].offsetHeight),
									'right': parseInt(section[i].offsetLeft + section[i].offsetWidth)
								});
							}
						}

						// mouse move
						iframe.style.pointerEvents = 'none';
						api.dom(window).on(api['env']['event']['move'] + '.EVENT_MOUSEMOVE_popup_story_move', function(e) {
							var event = e || window.event;
							//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
							var touch = event.touches || event.changedTouches;

							// 현재 이벤트가 상위로 전파되지 않도록 중단한다.
							if(event.stopPropagation) { 
								event.stopPropagation();
							}else {
								event.cancelBubble = true;
							}
							// 현재 이벤트의 기본 동작을 중단한다.
							if(event.preventDefault) { 
								event.preventDefault();
							}else {
								event.returnValue = false;
							}

							// 마우스 위치
							if(touch) {
								mouse.move.top = touch[0].pageY;
								mouse.move.left = touch[0].pageX;
							}else {
								mouse.move.top = event.pageY;
								mouse.move.left = event.pageX;
							}

							// 현재 팝업의 위치(영역)
							var top = (mouse.move.top - mouse.down.top);
							var left = (mouse.move.left - mouse.down.left);
							var bottom = parseInt(top + container.offsetHeight);
							var right = parseInt(left + container.offsetWidth);

							// 스크롤 제어
							container.scrollIntoView(false); // true 일 경우 엘리먼트가 스크롤 영역의 상단에 위치하도록 스크롤 됩니다. 만약  false 인 경우 스크롤 영역의 하단에 위치하게 됩니다.
							//container.scrollIntoView({block: "end", behavior: "instant"}); // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView

							// snap 영역 검사
							var i, max;
							var interval = 10; // snap 을 발생시키도록하는 element와 element 간의 간격
							for(i=0, max=snap.length; i<max; i++) {
								/*
								-
								사각형(top, left, bottom, right) snap 가능 영역 산정
								(snap[i].top - interval)
								(snap[i].left - interval)
								(snap[i].bottom + interval)
								(snap[i].right + interval)
								위 영역(다른 팝업 element)안으로 움직이고 있는 팝업이 들어오면 snap 을 검사한다.
								*/
								if(top < (snap[i].bottom + interval) && bottom > (snap[i].top - interval) && right > (snap[i].left - interval) && left < (snap[i].right + interval)) {
									// left 또는 right
									if(Math.abs(snap[i].left - left) <= interval) {
										left = snap[i].left;
									}else if(Math.abs(snap[i].left - right) <= interval) {
										left = snap[i].left - container.offsetWidth;
									}else if(Math.abs(snap[i].right - right) <= interval) {
										left = snap[i].right - container.offsetWidth;
									}else if(Math.abs(snap[i].right - left) <= interval) {
										left = snap[i].right;
									}

									// top 또는 bottom
									if(Math.abs(snap[i].top - top) <= interval) {
										top = snap[i].top;
									}else if(Math.abs(snap[i].top - bottom) <= interval) {
										top = snap[i].top - container.offsetHeight;
									}if(Math.abs(snap[i].bottom - bottom) <= interval) {
										top = snap[i].bottom - container.offsetHeight;
									}else if(Math.abs(snap[i].bottom - top) <= interval) {
										top = snap[i].bottom;
									}

									break;
								}
							}
							
							// 위치 적용
							if(0 <= top) {
								container.style.top = top + 'px';
							}
							if(0 <= left) {
								container.style.left = left + 'px';
							}
						});
						// mouse up
						api.dom(window).on(api['env']['event']['up'] + '.EVENT_MOUSEUP_popup_story_move', function(e) {
							var event = e || window.event;
							var touch = event.changedTouches; // touchend

							// 현재 이벤트의 기본 동작을 중단한다.
							if(event.preventDefault) { 
								event.preventDefault();
							}else {
								event.returnValue = false;
							}

							api.dom(window).off('.EVENT_MOUSEMOVE_popup_story_move');
							api.dom(window).off('.EVENT_MOUSEUP_popup_story_move');
							iframe.style.pointerEvents = 'auto';
						});
					});

					// resize element
					// mobile 이 아닌경우만 story 팝업 리사이징이 가능하다
					(function setResize() {
						var min_width = 320; // 최소 width
						var min_height = 320; // 최소 height
						var resize_domain = 0; // resize 버튼 크기
						if(api['env']['check']['touch'] === true) { // 터치 기기에서는 사용자 손가락 터치 영역을 고려하여 범위를 넓게 한다.
							resize_domain = 16;
						}else {
							resize_domain = 10;
						}
						var right_resize = instance['element']['right_resize'] = document.createElement('div');
						var bottom_resize = instance['element']['bottom_resize'] = document.createElement('div');
						var right_bottom_resize = instance['element']['right_bottom_resize'] = document.createElement('div');
						right_resize.style.cssText = 'top: 0; right: -' + resize_domain + 'px; width: ' + resize_domain + 'px; height: 100%; cursor: e-resize;';
						bottom_resize.style.cssText = 'left: 0; bottom: -' + resize_domain + 'px; width: 100%; height: ' + resize_domain + 'px; cursor: s-resize;';
						right_bottom_resize.style.cssText = 'right: -' + resize_domain + 'px; bottom: -' + resize_domain + 'px; width: ' + resize_domain + 'px; height: ' + resize_domain + 'px; cursor: se-resize;';
						right_resize.style.position = bottom_resize.style.position = right_bottom_resize.style.position = 'absolute';
						right_resize.style.display = bottom_resize.style.display = right_bottom_resize.style.display = 'block';
						//right_resize.style.border = bottom_resize.style.border = right_bottom_resize.style.border = '1px solid #2D8AE8';

						// resize event
						var setMousePositionOn = function(callback) {
							if(!callback || typeof callback != 'function') {
								return false;
							}
							
							// z-index
							that.zindex += 1;
							container.style.zIndex = that.zindex;

							console.log('on');
							container.style.border = '1px dashed #000';
							api.dom('iframe', that['element']['story']).style({'pointerEvents': 'none'});
							api.dom(window).on(api['env']['event']['move'] + '.EVENT_MOUSEMOVE_popup_story_resize', function(e) {
								var event = e || window.event;
								//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
								var touch = event.touches || event.changedTouches;

								// 현재 이벤트가 상위로 전파되지 않도록 중단한다.
								if(event.stopPropagation) { 
									event.stopPropagation();
								}else {
									event.cancelBubble = true;
								}
								// 현재 이벤트의 기본 동작을 중단한다.
								if(event.preventDefault) { 
									event.preventDefault();
								}else {
									event.returnValue = false;
								}

								/*
								pageX/pageY : <html> element in CSS pixels.
								clientX/clientY : viewport in CSS pixels.
								screenX/screenY : screen in device pixels.
								*/
								var top, left;
								// 마우스 위치
								if(touch) {
									top = touch[0].pageY;
									left = touch[0].pageX;
								}else {
									top = event.pageY;
									left = event.pageX;
								}

								//console.log('top: ' + top + ', left: ' + left);
								callback.call({'top': top, 'left': left});
							});
						};
						var setMousePositionOff = function(callback) {
							api.dom(window).on(api['env']['event']['up'] + '.EVENT_MOUSEUP_popup_story_resize', function(e) {
								var event = e || window.event;
								var touch = event.changedTouches; // touchend

								console.log('off');
								api.dom(window).off('.EVENT_MOUSEMOVE_popup_story_resize');
								api.dom(window).off('.EVENT_MOUSEUP_popup_story_resize');
								api.dom('iframe', that['element']['story']).style({'pointerEvents': 'auto'});
								//iframe.style.pointerEvents = 'auto';
								container.style.border = '1px solid rgb(62, 65, 67)';
								document.documentElement.style.cursor = 'auto'; // <html>
								if(callback && typeof callback === 'function') {
									callback();
								}
							});
						};
						
						// localStorage 에 width, height 의 값을 저장한다.
						api.dom(right_resize).on(api['env']['event']['down'], function(e) {
							var event = e || window.event;
							//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
							var touch = event.touches; // touchstart
					
							// 현재 이벤트가 상위로 전파되지 않도록 중단한다.
							if(event.stopPropagation) { 
								event.stopPropagation();
							}else {
								event.cancelBubble = true;
							}
							// 현재 이벤트의 기본 동작을 중단한다.
							if(event.preventDefault) { 
								event.preventDefault();
							}else {
								event.returnValue = false;
							}

							// 멀티터치 방지
							if(touch && touch.length && 1 < touch.length) {
								return;
							}
					
							document.documentElement.style.cursor = 'e-resize'; // <html>
							setMousePositionOn(function() {
								var left = this.left || 0;
								var top = this.top || 0;
					
								left -= utility.getNumber(container.style.left); // 현재 팝업의 left 값
								left -= resize_domain; // resize 버튼 크기
								if(0 <= left && min_width <= left) {
									window.localStorage.setItem((instance['form'] + instance['key'] + 'width'), left);
									container.style.width = left + 'px';
								}
							});
							setMousePositionOff();
						});
						api.dom(bottom_resize).on(api['env']['event']['down'], function(e) {
							var event = e || window.event;
							//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
							var touch = event.touches; // touchstart
					
							// 현재 이벤트가 상위로 전파되지 않도록 중단한다.
							if(event.stopPropagation) { 
								event.stopPropagation();
							}else {
								event.cancelBubble = true;
							}
							// 현재 이벤트의 기본 동작을 중단한다.
							if(event.preventDefault) { 
								event.preventDefault();
							}else {
								event.returnValue = false;
							}

							// 멀티터치 방지
							if(touch && touch.length && 1 < touch.length) {
								return;
							}
					
							document.documentElement.style.cursor = 's-resize'; // <html>
							setMousePositionOn(function() {
								var left = this.left || 0;
								var top = this.top || 0;
					
								top -= utility.getNumber(container.style.top); // 현재 팝업의 top 값
								top -= resize_domain; // resize 버튼 크기
								if(0 <= top && min_height <= top) {
									window.localStorage.setItem((instance['form'] + instance['key'] + 'height'), top);
									container.style.height = top + 'px';
									//content.style.height = (utility.getNumber(container.style.height) - utility.getNumber(container.style.borderTopWidth) - utility.getNumber(container.style.borderBottomWidth) - utility.getNumber(header.style.height)) + 'px';
									content.style.height = (utility.getNumber(container.style.height) - utility.getNumber(header.style.height)) + 'px';
								}
							});
							setMousePositionOff();
						});
						api.dom(right_bottom_resize).on(api['env']['event']['down'], function(e) {
							var event = e || window.event;
							//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
							var touch = event.touches; // touchstart
					
							// 현재 이벤트가 상위로 전파되지 않도록 중단한다.
							if(event.stopPropagation) { 
								event.stopPropagation();
							}else {
								event.cancelBubble = true;
							}
							// 현재 이벤트의 기본 동작을 중단한다.
							if(event.preventDefault) { 
								event.preventDefault();
							}else {
								event.returnValue = false;
							}

							// 멀티터치 방지
							if(touch && touch.length && 1 < touch.length) {
								return;
							}
					
							document.documentElement.style.cursor = 'se-resize'; // <html>
							setMousePositionOn(function() {
								var left = this.left || 0;
								var top = this.top || 0;
					
								left -= utility.getNumber(container.style.left); // 현재 팝업의 left 값
								left -= resize_domain;
								if(0 <= left && min_width <= left) {
									window.localStorage.setItem((instance['form'] + instance['key'] + 'width'), left);
									container.style.width = left + 'px';
								}
								top -= utility.getNumber(container.style.top); // 현재 팝업의 top 값
								top -= resize_domain;
								if(0 <= top && min_height <= top) {
									window.localStorage.setItem((instance['form'] + instance['key'] + 'height'), top);
									container.style.height = top + 'px';
									//iframe.height = utility.getNumber(container.style.height) - utility.getNumber(header.style.height);
									//content.style.height = (utility.getNumber(container.style.height) - utility.getNumber(container.style.borderTopWidth) - utility.getNumber(container.style.borderBottomWidth) - utility.getNumber(header.style.height)) + 'px';
									content.style.height = (utility.getNumber(container.style.height) - utility.getNumber(header.style.height)) + 'px';
								}
							});
							setMousePositionOff();
						});

						container.appendChild(right_resize);
						container.appendChild(bottom_resize);
						container.appendChild(right_bottom_resize);
					})();
					
					return fragment;
				};
			}
		})(),
		// window, document 의 width / height
		getWinDocWidthHeight: function() {
			return {
				'window': {
					"width": window.innerWidth || document.documentElement.clientWidth || 0,
					"height": window.innerHeight || document.documentElement.clientHeight || 0
				},
				'document': {
					"width": Math.max(
						document.body.scrollWidth, document.documentElement.scrollWidth,
						document.body.offsetWidth, document.documentElement.offsetWidth,
						document.documentElement.clientWidth
					),
					"height": Math.max(
						document.body.scrollHeight, document.documentElement.scrollHeight,
						document.body.offsetHeight, document.documentElement.offsetHeight,
						document.documentElement.clientHeight
					)
				}
			};
		},
		// 크기 (모바일 대응이 필요함)
		setElementWidthHeight: function(parameter) {
			var that = this;

			// parameter
			var parameter = parameter || {};
			var key = parameter['key'];

			// ---------- ---------- ---------- ---------- ---------- ----------

			// 해당 key 가 instance 에 존재하는지(생성되어 있는지) 확인
			if(!that['instance'][key] || !that['instance'][key]['form']) {
				console.log('[오류] instance setElementWidthHeight');
				return false;
			}

			// element 존재여부 확인
			if(!that['instance'][key]['element']['container'] || typeof that['instance'][key]['element']['container'] != 'object') {
				console.log('[오류] popup element');
				return false;	
			}

			// ---------- ---------- ---------- ---------- ---------- ----------

			// 현재 popup 모듈
			var instance = that['instance'][key]; // 인스턴스
			var form = instance['form']; // popup 종류
			var element = instance['element'];

			//
			var size = that.getWinDocWidthHeight();

			switch(instance['form']) {
				case 'bunch':
					instance['element']['container'].style.width = '300px';
					instance['element']['container'].style.height = '300px';
					break;
				case 'story':
					if(api['env']['device'] === 'mobile') {
						// 모바일에서의 style
						instance['element']['container'].style.width = (size['window']['width'] - api['env']['browser']['scrollbar']) + 'px';
						instance['element']['container'].style.height = size['window']['height'] + 'px';
						instance['element']['content'].style.height = size['window']['height'] + 'px';
					}else {
						// instance['key'], instance['form'] 값으로 localStorage 에 width, height 의 마지막 값이 저장되어 있는지 확인한다.
						instance['element']['container'].style.width = (window.localStorage.getItem((instance['form'] + instance['key'] + 'width')) || 320) + 'px';
						instance['element']['container'].style.height = (window.localStorage.getItem((instance['form'] + instance['key'] + 'height')) || 320) + 'px';
						instance['element']['content'].style.height = (utility.getNumber(instance['element']['container'].style.height) - utility.getNumber(instance['element']['header'].style.height)) + 'px';
					}
					break;
				default:
					
					break;
			}
		},
		// 위치
		setElementLeftTop: function(parameter) {
			var that = this;

			// parameter
			var parameter = parameter || {};
			var key = parameter['key'];

			// ---------- ---------- ---------- ---------- ---------- ----------

			// 해당 key 가 instance 에 존재하는지(생성되어 있는지) 확인
			if(!that['instance'][key] || !that['instance'][key]['form']) {
				console.log('[오류] instance setElementLeftTop');
				return false;
			}

			// element 존재여부 확인
			if(!that['instance'][key]['element']['container'] || typeof that['instance'][key]['element']['container'] != 'object') {
				console.log('[오류] popup element');
				return false;	
			}

			// ---------- ---------- ---------- ---------- ---------- ----------

			// 현재 popup 모듈
			var instance = that['instance'][key]; // 인스턴스

			//
			var queue = { 
				/*
				css property 기본값
				position: static
				visibility: visible
				display: inline | block
				*/
				'position': /^(static)$/i,
				'visibility': /^(visible)$/i,
				'display': /^(inline|block)$/i
			};
			var index;

			// 
			var center = {'left': 0, 'top': 0};
			var size;
			var left, right, top, bottom;
			var tmp_height, tmp_top;
			var align;
			switch(instance['form']) {
				case 'bunch':
				case 'folder':
					align = 'center';
					break;
				case 'story':
					if(api['env']['check']['mobile']) {
						instance['element']['container'].style.left = '0px';
						instance['element']['container'].style.top = '0px';
					}else if(!instance['element']['container'].style.left && !instance['element']['container'].style.top) {
						// childElementCount 를 활용하여 story 팝업 element개수 * childElementCount 계산하여 사용하자
						if((that['settings']['gap'] * 5) < that['settings']['left'] || (that['settings']['gap'] * 5) < that['settings']['top']) {
							that['settings']['left'] = 0;
							that['settings']['top'] = 0;
						}
						that['settings']['left'] += that['settings']['gap'];
						that['settings']['top'] += that['settings']['gap'];
						instance['element']['container'].style.left = that['settings']['left'] + 'px';
						instance['element']['container'].style.top = that['settings']['top'] + 'px';
					}
					break;
				case 'layer':
					align = instance['align'] || 'center';
					break;
				default:
					align = instance['align'] || 'center';
					break;
			}
			console.log('form: ' + instance['form']);
			console.log('align: ' + align);
			console.log('width: ' + instance['width']);
			console.log('height: ' + instance['height']);

			// 위치 설정
			if(typeof align === 'string') {
				// center
				if(/center$/ig.test(align)) {
					// window, document 
					size = that.getWinDocWidthHeight();

					// element width / height 값 설정
					//if(typeof instance['width'] != 'number' || typeof instance['height'] != 'number' || instance['width'] === 0 || instance['height'] === 0) {
						// 해당 element 가 display:none; 상태라면, 정확한 width/height 값을 가져올 수 있도록 스타일값을 잠시 변경한다.
						if(instance['element']['container'].style.display === 'none') {
							// 현재 설정된 css 값 확인
							for(index in queue) {
								if(queue[index].test(instance['element']['container'].style[index])) { 
									// 현재 element에 설정된 style의 값이 queue 목록에 지정된 기본값(style property default value)과 동일하거나 없으므로 
									// 작업 후 해당 property 초기화(삭제)
									queue[index] = null;
								}else { 
									// 현재 element에 설정된 style의 값이 queue 목록에 지정된 기본값(style property default value)이 아니므로 
									// 현재 설정된 값을 저장(종료 후 현재값으로 재설정)
									queue[index] = instance['element']['container'].style[index];
								}
							}
							instance['element']['container'].style.position = 'absolute';
							instance['element']['container'].style.visibility = 'hidden';
							instance['element']['container'].style.display = 'block';
							instance['width'] = instance['element']['container'].offsetWidth; // (border + padding + width 값, display: none 의 경우는 0 반환)
							instance['height'] = instance['element']['container'].offsetHeight; // (border + padding + width 값, display: none 의 경우는 0 반환)
							// 값 반환을 위해 임시 수정했던 style 복구
							for(index in queue) {
								instance['element']['container'].style[index] = queue[index];
							}
						}else {
							instance['width'] = instance['element']['container'].offsetWidth;
							instance['height'] = instance['element']['container'].offsetHeight;
						}
					//}

					// 계산
					if(size.window.width > instance['width']) {
						center['left'] = Math.round(size.window.width / 2) - Math.round(instance['width'] / 2);
					}else {
						// 윈도우 사이즈(가로)보다 DIV 사이즈가 더 클경우
						center['left'] = 0; 
					}
					if(size.window.height > instance['height']) {
						center['top'] = Math.round(size.window.height / 2) - Math.round(instance['height'] / 2);
					}else {
						// 윈도우 사이즈(세로)보다 DIV 사이즈가 더 클경우
						center['top'] = 0; 
					}
					// top값 + div높이 > body(window) 전체 높이보다 클경우 (div가 페이지보다 더 아래로 내려가지 않도록함.)
					tmp_height = Math.max(size.window.height, size.document.height);
					tmp_top = Math.round(center['top'] + instance['height']);
					if(tmp_top > tmp_height) {
						center['top'] = center['top'] - Math.round(tmp_top - tmp_height);
					}
					// 위치값이 0보다 작지않도록 제어
					if(center['left'] < 0) {
						center['left'] = 0;
					}
					if(center['top'] < 0) {
						center['top'] = 0;
					}
				}
				// left, right 으로 시작하는 설정값
				if(/^left/ig.test(align)) {
					// lefttop, leftbottom, leftcenter
					left = '0px';
					top = center['top'] + 'px';
				}else if(/^right/i.test(align)) {
					// righttop, rightbottom, rightcenter
					right = '0px';
					top = center['top'] + 'px';
				}
				// top, bottom 으로 끝나는 설정값
				if(/top$/i.test(align)) {
					// lefttop, righttop, centertop
					top = '0px';
				}else if(/bottom$/i.test(align)) {
					// leftbottom, rightbottom, centerbottom
					bottom = '0px';
				}
				// 위치 설정
				if(!left && !right && !top && !bottom) {
					instance['element']['container'].style.left = center['left'] + 'px';
					instance['element']['container'].style.top = center['top'] + 'px';
				}else {
					if(left) {
						instance['element']['container'].style.left = left;
					}else if(right) {
						instance['element']['container'].style.right = right;
					}
					if(top) {
						instance['element']['container'].style.top = top;
					}else if(bottom) {
						instance['element']['container'].style.bottom = bottom;
					}
				}
			}else if(typeof align === 'object') { // 사용자 설정값
				if('left' in align) {
					instance['element']['container'].style.left = align['left'] + 'px';
				}else if('right' in align) {
					instance['element']['container'].style.right = align['right'] + 'px';
				}
				if('top' in align) {
					instance['element']['container'].style.top = align['top'] + 'px';
				}else if('bottom' in align) {
					instance['element']['container'].style.bottom = align['bottom'] + 'px';
				}
			}else {
				console.log('[경고] 팝업 위치값');
			}
		},
		// 보이기
		setShow: function(parameter) {
			var that = this;

			// parameter
			var parameter = parameter || {};
			var key = parameter['key'];

			// ---------- ---------- ---------- ---------- ---------- ----------

			// 해당 key 가 instance 에 존재하는지(생성되어 있는지) 확인
			if(!that['instance'][key] || !that['instance'][key]['form']) {
				console.log('[오류] instance setShow');
				return false;
			}

			// element 존재여부 확인
			if(!that['instance'][key]['element']['container'] || typeof that['instance'][key]['element']['container'] != 'object') {
				console.log('[오류] popup element');
				return false;	
			}

			// 실행 상태에 존재하는지 확인
			if(!that['action'][that['instance'][key]['form']][key]) {
				console.log('[오류] action 상태가 아님');
				return false;
			}

			// ---------- ---------- ---------- ---------- ---------- ----------

			// 현재 popup 모듈
			var instance = that['instance'][key]; // 인스턴스

			// zindex
			that.zindex += 1;
			that['instance'][key]['element']['container'].style.zIndex = that.zindex;
			
			// 팝업 종류별 작업 (애니메이션 등)
			switch(instance['form']) {
				case 'bunch':
					// bunch element 애니매이션 (위에서 아래로 내려옴)
					that['element']['bunch'].style.display = 'block';
					api.animationQueue({'element': that['element']['bunch'], 'animation': 'animation_moveToBottomBounce', 'complete': function() {
						this.style.top = '0px';
						instance['element']['container'].style.display = 'block';

						// story 리스트 생성
						var key;
						var div, button_close, title_div, title_node;
						var title;
						var fragment;
						var i = 0;
						// 현재 실행중인 story 목록 생성
						for(key in that['action']['story']) {
							title = that['instance'][key]['element']['title'].textContent;
							//
							fragment = document.createDocumentFragment();
							//
							div = document.createElement('div');
							div.style.cssText = "position: relative; margin: 5px 0px; padding: 5px 0px; height: 30px; border-bottom: 1px dashed rgba(255, 255, 255, 0.2); opacity: 1;";
							fragment.appendChild(div);

							button_close = document.createElement('button');
							button_close.style.cssText = "position: absolute; left: 0px; width: 30px; height: 30px; background-image: url('./images/popup-buttons.png'); background-position: -30px 0px; background-repeat: no-repeat;";
							div.appendChild(button_close);

							title_div = document.createElement('div');
							title_div.style.cssText = "position: absolute; right: 0px; top: 12px; text-align: right; color: rgb(255, 255, 255); font-size: 13px;";
							div.appendChild(title_div);

							// 팝업이름을 클릭하면, bunch팝업이 닫으면서, 해당 팝업 open 을 실행하자!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
							title_node = document.createTextNode(title);
							title_div.appendChild(title_node);

							// 각 팝업 닫기 이벤트
							// 클로저: for문안에 실행할 구문을 익명함수( (function() {})와 같은 형태)로 만들고는 i를 파라미터로 넘기면서 실행시켜버립니다.(익명함수에 (i)를 붙혀서 바로 실행시켰습니다.) 이렇게 하면 익명함수안의 내부변수인 m에 i의 값이 할당되어 버리고 구조상은 실행뒤에 소멸되어야 하지만 클로저로 인하여 각 값으로 할당된 멤버변수를 각 이벤트리스너에서 그대로 사용할 수 있게 됩니다.
							(function(d, b, k) {
								api.dom(b).on(api['env']['event']['down'], function(e) {
									var event = e || window.event;
									that.setClose({'key': k});
									d.parentNode.removeChild(d);
								});
							})(div, button_close, key);

							//
							instance['element']['content'].appendChild(fragment);

							//
							// animation-delay
							div.style.webkitAnimationDelay = div.style.MozAnimationDelay = div.style.msAnimationDelay = div.style.OAnimationDelay = div.style.animationDelay = '.' + (i++) + 's';
							api.animationQueue({'element': div, 'animation': 'animation_moveBottomToTop'});
						}

						// 브라우저 리사이즈 이벤트 (left, top 값 변경)


					}});
					break;
				case 'folder':
					instance['element']['container'].style.display = 'block';
					break;
				case 'story':
					instance['element']['container'].style.display = 'block';
					// 모바일의 경우 사이즈가 변경되었을 수 있으므로 팝업크기를 다시 설정해 준다.
					if(api['env']['device'] === 'mobile') {
						that.setElementWidthHeight({'key': key});
					}
					break;
				case 'layer':
					instance['element']['container'].style.display = 'block';
					break;
				default:
					instance['element']['container'].style.display = 'block';
					break;
			}
		},
		// 숨기기
		setHide: function(parameter) {
			var that = this;

			// parameter
			var parameter = parameter || {};
			var key = parameter['key'];
			//var callback = parameter['callback'];

			// ---------- ---------- ---------- ---------- ---------- ----------

			// 해당 key 가 instance 에 존재하는지(생성되어 있는지) 확인
			if(!that['instance'][key] || !that['instance'][key]['form']) {
				console.log('[오류] instance setHide');
				return false;
			}

			// element 존재여부 확인
			if(!that['instance'][key]['element']['container'] || typeof that['instance'][key]['element']['container'] != 'object') {
				console.log('[오류] popup element');
				return false;	
			}

			// 실행 상태에 존재하는지 확인
			if(!that['action'][that['instance'][key]['form']][key]) {
				console.log('[오류] action 상태가 아님');
				return false;
			}

			// ---------- ---------- ---------- ---------- ---------- ----------

			// 팝업 종류별 작업 (애니메이션 등)
			switch(that['instance'][key]['form']) {
				case 'bunch':
					that['instance'][key]['element']['container'].style.display = 'none';
					break;
				case 'folder':
				case 'story':
					that['instance'][key]['element']['container'].style.display = 'none';
					break;
				case 'layer':
					that['instance'][key]['element']['container'].style.display = 'none';
					break;
			}
		},
		setAllHide: function(parameter) {
			var that = this;

			// parameter
			var parameter = parameter || {};
			var form = parameter['form'] || []; // 전체 숨기기를 적용할 form(종류)

			// ---------- ---------- ---------- ---------- ---------- ----------

			var index, key;
			for(index in form) {
				if(that['action'][form[index]]) {
					for(key in that['action'][form[index]]) {
						that.setHide({'key': key});
					}
				}
			}
		},
		// popup open (해당 key 인스턴스의 팝업종류에 따라 실행)
		setOpen: function(parameter) {
			var that = this;

			// parameter
			var parameter = parameter || {};
			var key = parameter['key'];

			// ---------- ---------- ---------- ---------- ---------- ----------

			// 해당 key 가 instance 에 존재하는지(생성되어 있는지) 확인
			if(!that['instance'][key] || !that['instance'][key]['form']) {
				console.log('[오류] instance setOpen');
				return false;
			}

			// element 존재여부 확인
			if(!that['instance'][key]['element']['container'] || typeof that['instance'][key]['element']['container'] != 'object') {
				console.log('[오류] popup element');
				return false;	
			}

			// 실행 상태에 존재하는지 확인
			if(key in that['action'][that['instance'][key]['form']]) {
				console.log('[경고] ' + key + ' 현재 실행중인 상태');
				that.setShow({'key': key});
				return false;
			}

			// ---------- ---------- ---------- ---------- ---------- ----------

			// 현재 popup 모듈
			var instance = that['instance'][key]; // 인스턴스
			var form = instance['form']; // popup 종류
			var element;

			// popup element 존재여부에 따른 작업
			if(!instance['element']['container'] || typeof instance['element']['container'] != 'object') {
				// document 에서 element 존재하면 제거
				element = that.getContainerElement({'key': key});
				if(element) {
					element.parentNode.removeChild(element);
				}
				// 새로 생성
				if(!that.setCreateElement({'key': key})) {
					console.log('[오류] create popup element');
					return false;
				}
			}

			// 팝업 종류별 추가작업
			switch(form) {
				case 'bunch':
					//
					that['element']['bunch'].style.zIndex = ++that.zindex;
					// document resize 이벤트 실행

					break;
				case 'folder':
					//that['element']['folder'].style.display = 'block';
					that.setAllHide({'form': ['folder']}); // 기존 open 된 folder 모두 close
					// document resize 이벤트 실행

					break;
				case 'story':
					// document resize 이벤트 실행
					that['callback']['resize'][key] = function() {
						that.setElementWidthHeight({'key': key});
						that.setElementLeftTop({'key': key});
					};
					break;
				case 'layer':
					
					break;
			}

			// 실행상태 추가
			if(!that['action'][form]) {
				that['action'][form] = {};
			}
			that['action'][form][key] = instance['element']['container'];

			// width / height 설정
			that.setElementWidthHeight({'key': key});

			// 보이기
			that.setShow({'key': key});

			// 위치 설정
			that.setElementLeftTop({'key': key});
		},
		// popup close (element 삭제)
		setClose: function(parameter) {
			var that = this;

			// parameter
			var parameter = parameter || {};
			var key = parameter['key'];

			// ---------- ---------- ---------- ---------- ---------- ----------

			// 해당 key 가 instance 에 존재하는지(생성되어 있는지) 확인
			if(!that['instance'][key] || !that['instance'][key]['form']) {
				console.log('[오류] instance setClose');
				return false;
			}

			// element 존재여부 확인
			if(!that['instance'][key]['element']['container'] || typeof that['instance'][key]['element']['container'] != 'object') {
				console.log('[오류] popup element');
				return false;	
			}

			// 실행 상태에 존재하는지 확인
			if(!that['action'][that['instance'][key]['form']][key]) {
				console.log('[오류] action 상태가 아님');
				return false;
			}

			// ---------- ---------- ---------- ---------- ---------- ----------

			// 현재 popup 모듈
			var instance = that['instance'][key]; // 인스턴스
			var form = instance['form']; // popup 종류

			//
			if(0 <= (that['settings']['left'] - that['settings']['gap'])) {
				that['settings']['left'] -= that['settings']['gap'];
			}
			if(0 <= (that['settings']['top'] - that['settings']['gap'])) {
				that['settings']['top'] -= that['settings']['gap'];
			}

			//
			if(delete that['action'][form][key]) {
				// 팝업 종류별 작업 (애니메이션 등)
				switch(form) {
					case 'bunch':
						api.animationQueue({'element': that['element']['bunch'], 'animation': 'animation_moveToTop', 'complete': function() {
							that['element']['bunch'].style.top = '-100%';
							that['element']['bunch'].style.left = '0px';
							that['element']['bunch'].style.display = 'none';
							//instance['element']['content'].innerHTML = '';
							// 출력했던 리스트들 제거
							while(instance['element']['content'].hasChildNodes()) {
								instance['element']['content'].removeChild(instance['element']['content'].lastChild);
							}
						}});
						break;
					case 'folder':
					case 'story':
						instance['element']['container'].parentNode.removeChild(instance['element']['container']) && delete that['instance'][key];
						break;
					case 'layer':
						instance['element']['container'].parentNode.removeChild(instance['element']['container']) && delete that['instance'][key];
						break;
					default:
						
						break;
				}

				// 실행상태 목록에서 제거, element 제거, instance 제거
				//delete that['action'][form][key] && instance['element']['container'].parentNode.removeChild(instance['element']['container']) && delete that['instance'][key];

				/*utility.closeCall(that['time']['close']);
				that['time']['close'] = utility.startCall(function() {
					if(Object.keys(that['action']['folder']).length === 0 && Object.keys(that['action']['story']).length === 0 && Object.keys(that['action']['layer']).length === 0) {
						// 연속으로 다른 팝업이 오픈될 수 있으므로 지연시간을 두고 닫는다.
						that['element']['container'].style.display = 'none';
					}
				}, 800);*/

				// document resize 이벤트 정지
				that['callback']['resize'][key] && delete that['callback']['resize'][key];

			}
		},
		// 전체 종료
		setAllClose: function(parameter) {
			var that = this;

			// parameter
			var parameter = parameter || {};
			var form = parameter['form'] || []; // 전체 닫기를 적용할 form(종류)

			// ---------- ---------- ---------- ---------- ---------- ----------

			var index, key;
			for(index in form) {
				if(that['action'][form[index]]) {
					for(key in that['action'][form[index]]) {
						that.setClose({'key': key});
					}
				}
			}
		}
	};

	// public return
	return new Popup();

}, this);