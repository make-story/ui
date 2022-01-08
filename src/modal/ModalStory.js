/**
 * 스토리
 * iFrame 또는 ShadowDOM 기반 켄텐츠 출력
 */
 import browser, { windowDocumentSize, browserScroll, } from '../browser';
 import $ from '../dom';
 import { getKey, extend, elementPosition, } from '../util';
 import xhr from '../xhr';
 import ModalBase from './ModalBase';
 import ModalState, { modalState } from "./ModalState";
 import renderMobile from './story/mobile';
 import renderPC from './story/pc';
 
 const isIOS = /(iphone|ipad|ipod)/i.test((window.navigator.userAgent || window.navigator.vendor || window.opera).toLowerCase());
 
 export default class ModalStory extends ModalBase {
     constructor(settings) {
         super();
         this.settings = {
             'key': '',
             'listeners': {
                 'show': null,
                 'hide': null,
                 'remove': null,
                 'error': null
             },
             'theme:': {}, // 테마 (스타일 변경)
             'title': '',
             'min': { // 최소 크기
                 'width': 300,
                 'height': 300
             }
         };
         this.settings = extend(this.settings, settings);
         this.elements = {};
         this.before = { // 값 변경전 기존 설정값 저장
             'scrollLeft': 0,
             'scrollTop': 0
         };
 
         // story 팝업간 차이
         this.gap = 20;
         // snap 을 발생시키도록하는 element와 element 간의 간격
         this.snap = 10;
         // 마지막 열었던 story 팝업 left, top 값
         this.last = {
             'left': 0,
             'top': 0
         };
 
         // render
         this.render();
     }
 
     render() {
         // key
         this.key = {
             header: getKey(),
             title: getKey(),
             progress: getKey(),
             bar: getKey(),
             main: getKey(),
             iframe: getKey(),
             button_group: getKey(),
             button_refresh: getKey(),
             button_hidden: getKey(),
             button_fullscreen: getKey(),
             button_close: getKey(),
             right_resize: getKey(),
             bottom_resize: getKey(),
             right_bottom_resize: getKey(),
         };
 
         // story
         let story = document.querySelector(`[${modalState.attributePrefix}-story]`);
         if(!story) {
             story = document.createElement('div');
             story.setAttribute(`${modalState.attributePrefix}-story`, 'story');
             //story.style.cssText = 'position: fixed; left: 0px; top: 0px;';
             modalState.container().appendChild(story);
         }
         this.elements.story = story;
 
         // mobile / pc 분기 렌더링
         if(browser.monitor === 'mobile') {
             renderMobile.call(this);
         }else {
             renderPC.call(this);
         }
     }
 
     change(settings) {
         let key, tmp;
 
         try {
             for(key in settings) {
                 switch(key) {
                     case 'type':
                     case 'key':
                         break;
                     case 'listeners':
                         for(tmp in settings[key]) {
                             if(settings[key].hasOwnProperty(tmp)) {
                                 this.settings.listeners[tmp] = settings[key][tmp];
                             }
                         }
                         break;
                     default:
                         if(key in this.settings) {
                             this.settings[key] = settings[key];
                         }
                         break;
                 }
             }
         }catch(e) {
             if(typeof this.settings.listeners.error === 'function') {
                 this.settings.listeners.error.call(this, e);
             }
         }
 
         return this;
     }
 
     /*position({ top, left }={}) {
         let target = this.elements.contents;
 
         target.style.webkitTransitionDuration = target.style.MozTransitionDuration = target.style.msTransitionDuration = target.style.OTransitionDuration = target.style.transitionDuration = '0s';
         if(top && left) {
             target.style.webkitTransform = 'translate(' + left + 'px, ' + top + 'px)' + 'translateZ(0)';
             target.style.msTransform = target.style.MozTransform = target.style.OTransform = 'translate(' + left + 'px, ' + top + 'px)';
         }else if(top) {
             target.style.webkitTransform = 'translateY(' + top + 'px)' + 'translateZ(0)';
             target.style.msTransform = target.style.MozTransform = target.style.OTransform = 'translateY(' + top + 'px)';
         }else if(left) {
             target.style.webkitTransform = 'translateX(' + left + 'px)' + 'translateZ(0)';
             target.style.msTransform = target.style.MozTransform = target.style.OTransform = 'translateX(' + left + 'px)';
         }
     }*/
 
     show({ callback, }={}) {
         let size, scroll = browserScroll();
 
         // 이미 show 되어 있는 상태인지 확인
 
 
 
         // IOS 의 position: fixed 버그 대응
         if(isIOS === true) {
             $('html').css({'position': 'fixed'});
             this.before['scrollLeft'] = scroll.left;
             this.before['scrollTop'] = scroll.top;
         }
 
         // element
         if(this.settings.mask && typeof this.elements.mask === 'object' && this.elements.mask.nodeType) {
             this.elements.mask.style.zIndex = ++modalState.zindex;
             this.elements.mask.style.display = 'block';
         }
         if(browser.monitor === 'mobile') { // 모바일에서의 style
             size = windowDocumentSize();
 
             this.elements.contents.style.width = `${(size.window.width - browser.scrollbar)}px`;
             this.elements.contents.style.height = `${size.window.height}px`;
             this.elements.main.style.height = `${size.window.height}px`;
 
             //
             this.elements.contents.style.left = '0px';
             this.elements.contents.style.top = '0px';
         }else {
             // this.settings.key, 'modal' 값으로 localStorage 에 width, height 의 마지막 값이 저장되어 있는지 확인한다.
             this.elements.contents.style.width = (window.localStorage.getItem((`modal${this.settings.key}width`)) || this.settings.min.width) + 'px';
             this.elements.contents.style.height = (window.localStorage.getItem((`modal${this.settings.key}height`)) || this.settings.min.height) + 'px';
             this.elements.main.style.height = (Number(String(this.elements.contents.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(this.elements.header.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5'))) + 'px';
 
             // childElementCount 를 활용하여 story 팝업 element개수 * childElementCount 계산하여 사용하자
             if((this.gap * 5) < this.last.left || (this.gap * 5) < this.last.top) {
                 this.last.left = 0;
                 this.last.top = 0;
             }
             this.last.left += this.gap;
             this.last.top += this.gap;
             this.elements.contents.style.left = `${this.last.left}px`;
             this.elements.contents.style.top = `${this.last.top}px`;
         }
         this.elements.contents.style.zIndex = ++modalState.zindex;
         this.elements.contents.style.display = 'block';
 
         // focus (웹접근성)
         modalState.active = document.activeElement;
         this.elements.contents.setAttribute('tabindex', -1);
         this.elements.contents.focus();
 
         // listeners
         if(typeof this.settings.listeners.show === 'function') {
             this.settings.listeners.show.call(this);
         }
         if(typeof callback === 'function') {
             callback.call(this);
         }
     }
 
     hide({ callback, }={}) {
         // IOS
         if(isIOS === true) {
             $('html').css({'position': modalState.defaultStyle['position']});
             window.scrollTo(this.before['scrollLeft'], this.before['scrollTop']);
         }
 
         // element
         this.elements.contents.style.display = 'none';
         if(this.settings.mask && typeof this.elements.mask === 'object' && this.elements.mask.nodeType) {
             this.elements.mask.style.display = 'none';
         }
 
         // focus (웹접근성)
         if(modalState.active) {
             modalState.active.focus();
         }
 
         // story 팝업의 겹쳐서 열리는 것을 방지하기 위한 값 다시계산
         if(0 <= (this.last.left - this.gap)) {
             this.last.left -= this.gap;
         }
         if(0 <= (this.last.top - this.gap)) {
             this.last.top -= this.gap;
         }
 
         // listeners
         if(typeof this.settings.listeners.hide === 'function') {
             this.settings.listeners.hide.call(this);
         }
         if(typeof callback === 'function') {
             callback.call(this);
         }
     }
 
     remove({ callback, }={}) {
         // IOS
         if(isIOS === true) {
             $('html').css({'position': modalState.defaultStyle['position']});
             window.scrollTo(this.before['scrollLeft'], this.before['scrollTop']);
         }
 
         // element
         if(this.elements.mask) {
             this.elements.mask.parentNode.removeChild(this.elements.mask);
         }
         if(this.elements.contents) {
             this.elements.contents.parentNode.removeChild(this.elements.contents);
         }
         this.elements = {};
 
         // focus (웹접근성)
         if(modalState.active) {
             modalState.active.focus();
         }
 
         // story 팝업의 겹쳐서 열리는 것을 방지하기 위한 값 다시계산
         if(0 <= (this.last.left - this.gap)) {
             this.last.left -= this.gap;
         }
         if(0 <= (this.last.top - this.gap)) {
             this.last.top -= this.gap;
         }
 
         // instance
         modalState.removeInstance(this.settings['key']);
 
         // listeners
         if(typeof callback === 'function') {
             callback.call(this);
         }
     }
 
     imports({ callback, }={}) { // story 내부 html 불러오기
         const setScriptTag = function(node, { is=true, type="", src="", code="", }={}) {
             let script = document.createElement("script");
             let setRemove = (script) => {
                 script.parentNode.removeChild(script);
             };
 
             //console.log(code);
             //script.text = code;
             if(type) {
                 script.type = type;
             }
             if(src) {
                 // <script src=""></script>
                 script.setAttribute("src", src);
             }else if(code) {
                 // <script>inline code</script>
                 script.appendChild(document.createTextNode(code)); 
             }
             // 삽입
             node.parentNode.insertBefore(script, node);
             // 실행 후 제거
             if(is !== false) {
                 if(src) {
                     script.onload = (event) => {
                         console.log(event.type); // error, load
                         setRemove(script);
                     }
                 }else if(code && script.parentNode) {
                     setRemove(script);
                 }
             }else {
                 script = null;
             }
         };
         const setScriptCodeLoad = (node) => {
             let instance = new XMLHttpRequest();
             if(typeof instance !== 'object' || !('withCredentials' in instance)) {
                 return;
             }
             //instance.abort();
             instance.open('GET', node.src, false); // 동기방식으로 호출
             //instance.setRequestHeader('Accept', '*/*');
             //instance.setRequestHeader('X-Requested-With', 'XMLHttpRequest'); // X-Requested-With 헤더는, 해당 요청이 Ajax라는 걸 의미 (비표준)
             //instance.timeout = 3000; // time in milliseconds
             instance.onreadystatechange = function() {
                 switch(instance.readyState) {
                     case 0: // 객체만 생성되고 아직 초기화되지 않은 상태(open 메소드가 호출되지 않음)
                         break;
                     case 1: // open 메소드가 호출되고 아직 send 메소드가 불리지 않은 상태
                     case 2: // send 메소드가 불렸지만 status와 헤더는 도착하지 않은 상태
                         // 연결 진행
                         break;
                     case 3: // 데이터의 일부를 받은 상태
                         break;
                     case 4: // 데이터를 전부 받은 상태
                         break;
                 }
             };
             instance.onload = function(event) { 
                 let code;
                 if(instance.status == 200) {
                     code = instance.response || instance.responseText || instance.responseXML; // XMLHttpRequest Level 2
                     setScriptTag(node, { code, });
                 }
             };
             instance.ontimeout = function(event) {
 
             };
             instance.onerror = function(event) {
 
             };
             instance.send();
         };
         const setScripts = (scripts) => {
             // 동적 html load(ajax)된 script tag 는 실행이 안된다. 아래와 같이 실행해줘야 한다.
             for(let i=0, max=scripts.length; i<max; i++) {
                 let node = scripts[i];
                 let code;
                 //console.log(node);
                 if(node.src) { 
                     // <script src="" /> 형태 
                     // jQuery 코드 내부 호출 형태 참고
                     /*$.ajax({
                         url: node.src,
                         type: "GET",
                         dataType: "script",
                         async: false,
                         global: false,
                         "throws": true
                     });*/
 
                     // 동기 방식으로 적용해야 하므로, 아래 방식을 사용할 수 없다.
                     /*(function() {
                         let script = document.createElement("script");
                         // 해당 script 속성 
                         script.async = false;
                         //if(s.scriptCharset) {
                             //script.charset = s.scriptCharset;
                         //}
                         script.src = node.src;
 
                         script.onload = script.onreadystatechange = function(_, isAbort) {
                             if(isAbort || !script.readyState || /loaded|complete/.test( script.readyState)) {
                                 // Handle memory leak in IE
                                 script.onload = script.onreadystatechange = null;
 
                                 // Remove the script
                                 if(script.parentNode) {
                                     script.parentNode.removeChild(script);
                                 }
 
                                 // Dereference the script
                                 script = null;
 
                                 // Callback if not abort
                                 if(!isAbort) {
                                     // 다음 스크립트를 실행시켜야 한다.
 
                                     //callback(200, "success");
                                 }
                             }
                         };
 
                         // Circumvent IE6 bugs with base elements (#2709 and #4378) by prepending
                         // Use native DOM manipulation to avoid our domManip AJAX trickery
                         node.parentNode.insertBefore(script, node);
                     })();*/
 
                     // <script src=""></script>
                     setScriptCodeLoad(node, { src: node.src, });
                 }else { 
                     // <script>code...</script> 형태 
                     code = (node.text || node.textContent || node.innerHTML || "").replace(/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g, "");
                     //window["eval"].call(window, code);
                     setScriptTag(node, { code, });
                 }
             }
         };
         const progressDownload = (progress) => {
             console.log('[모달 정보] progress', progress);
             if(typeof this.elements.bar === 'object') {
                 this.elements.bar.style.display = 'block';
                 this.elements.bar.style.width = `${progress}%`;
                 if(progress >= 100) {
                     window.setTimeout(() => {
                         this.elements.bar.style.display = 'none';
                     }, 300);
                 }
             }
         };
         const success = (html) => {
             let template;
             let scripts, head, first;
             let code;
             
             // encodeURIComponent / decodeURIComponent
             html = decodeURIComponent(html || ''); 
             //console.log('[모달 정보] load HTML', html);
             
             // iframe / shadow dom 분기처리 
             if(this.elements.iframe) {
                 console.log('[모달 정보] iframe load HTML');
                 //console.log('[모달 정보] iframe load HTML', html);
 
                 // onload 이벤트 정지
                 this.elements.iframe.onload = null; 
 
                 // sandbox
                 //this.elements.iframe.sandbox = "allow-script"; // iframe 내부 스크립트
 
                 // srcdoc - IE지원안함 
                 // 코드 중 큰따옴표("")를 사용해서는 안 되므로 대신 &quot;를 사용해야 한다.
                 // src 속성과 srcdoc 속성을 둘다 지정했을 때는 srcdoc 속성이 우선되며, srcdoc가 지원하지 않는 브라우저에서는 src 속성이 동작하게 됩니다.
                 // https://github.com/jugglinmike/srcdoc-polyfill
                 // https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement/srcdoc
                 if('srcdoc' in this.elements.iframe) {
                     this.elements.iframe.srcdoc = html;
                 }else {
                     this.elements.iframe.contentWindow.document.open('text/html', 'replace');
                     this.elements.iframe.contentWindow.document.write(html);
                     this.elements.iframe.contentWindow.document.close();
                 }
 
                 // html
                 //(this.elements.iframe.contentDocument || this.elements.iframe.contentWindow.document).body.innerHTML = 'test'; // body
                 //(this.elements.iframe.contentDocument || this.elements.iframe.contentWindow.document).write('test'); // body
                 //(this.elements.iframe.contentDocument || this.elements.iframe.contentWindow.document).documentElement.innerHTML = html;
             }else if(this.elements.main) {
                 console.log('[모달 정보] main load HTML');
                 //console.log('[모달 정보] main load HTML', html);
 
                 this.elements.main.style.overflow = 'auto';
                 if(this.elements.main.shadowRoot) {
                     // 기존 shadow dom 적용되어 있음 
                     this.elements.main.shadowRoot.innerHTML = html;
                 }else {
                     // 신규 shadow dom 적용 
                     this.elements.main.innerHTML = '';
                     //this.elements.main.attachShadow({mode: 'open'}).innerHTML = html; // shadow dom 내부 script 스크립트 동작안함 (text 방식 외부 스크립트 코드는 작동안한다)
                     //this.elements.main.attachShadow({mode: 'open'}).appendChild(document.importNode(template.content, true));
                     //this.elements.main.attachShadow({mode: 'open'}).appendChild(template.content.cloneNode(true));
                     this.elements.main.attachShadow({mode: 'open'}).innerHTML = html;
                 }
 
                 // shadow dom 내부 script 리스트, head 위치 
                 scripts = this.elements.main.shadowRoot.querySelectorAll('script');
                 head = this.elements.main.shadowRoot.querySelector('head');
                 first = this.elements.main.shadowRoot.firstChild;
 
                 // makestory 전용 코드 (makestory 와 외부 html코드 연결 통로제공)
                 code = `
                     console.log(document.getRootNode());
                     console.log(document.getRootNode({composed:false}));
                     console.log(document.getRootNode({composed:true}));
                     console.log("${this.key.main}");
                     /*if(typeof makestory === "undefined") {
                         let makestory = {};
                     }else if(typeof makestory !== "object") {
                         makestory = {};
                     }*/
                     let makestory = {};
                     makestory.document = document.getRootNode().getElementById("${this.key.main}").shadowRoot;
                     makestory.getElementById = function(selector) {
                         return makestory.document.getElementById(selector);
                     };
                     makestory.querySelector = function(selector) {
                         return makestory.document.querySelector(selector);
                     };
                     makestory.querySelectorAll = function(selector) {
                         return makestory.document.querySelectorAll(selector);
                     };
                 `;
                 if(scripts.length) {
                     //console.log(scripts);
                     setScriptTag(scripts[0], { is: false, code, });
                 }else if(head) {
                     //console.log(head);
                     setScriptTag(head.firstChild, { is: false, code, });
                 }else if(first) {
                     //console.log(first);
                     setScriptTag(first, { is: false, code, });
                 }else {
                     //console.log('[모달 에러!]');
                     return false;
                 }
 
                 setScripts(scripts);
             }else {
                 console.error('[모달 에러!] load HTML');
             }
 
             // callback
             if(typeof callback === 'function') {
                 callback.call(this);
             }
         };
 
         /*
         오프라인 실행과 온라인 실행을 구분
         오프라인: this.settings.url 값이 있음
         */
         xhr({
             'type': 'get',
             'url': `//${window.location.host}/data/story`,
             'data': {
                 'block': this.settings['key']
             },
             'progressDownload': progressDownload,
             'success': success,
         });
     }
 }
 