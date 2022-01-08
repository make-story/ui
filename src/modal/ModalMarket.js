/**
 * market
 */
 import browser, { windowDocumentSize, browserScroll, } from '../browser';
 import $ from '../dom';
 import { getKey, extend, elementPosition, fragmentHtml, } from '../util';
 import xhr from '../xhr';
 import webworker from '../webworker';
 import ModalBase from './ModalBase';
 import ModalState, { modalState } from "./ModalState";
 
 const EVENT_CLICK_CLOSE = 'EVENT_CLICK_CLOSE';
 const EVENT_CLICK_MARKET_GET = 'EVENT_CLICK_MARKET_GET';
 
 export default class ModalMarket extends ModalBase {
     constructor(settings) {
         super();
         this.settings = {
             'key': '',
             'webworker': {
                 'url': `//${window.location.host}/webworker/modal/index.js`,
             },
             'listeners': {
                 'show': null,
                 'hide': null,
                 'error': null,
                 'add': null // block 추가 이벤트 콜벡
             }
         };
         this.settings = extend(this.settings, settings);
         this.elements = {};
 
         // render
         this.render();
 
         // event
         this.event();
 
         // webworker
         this.worker = webworker(this.settings.webworker.url);
     }
 
     render() {
         let key = {
             close_button: getKey(),
             loading: getKey(),
             list: getKey(),
             view: getKey(),
         };
         let size, li, count;
 
         // 화면 중앙에 contents 가 위치하도록 계산
         size = windowDocumentSize();
         li = 150; // 리스트 (li태그) 1개 기준 가로 px (padding, margin 포함)
         count = Math.floor(size.document.width / li);
         if(5 < count) { // 최대 가로 출력 개수 제한
             count = 5;
         }
 
         // market
         let market = document.querySelector(`[${modalState.attributePrefix}-market]`);
         if(!market) {
             market = document.createElement('div');
             market.setAttribute(`${modalState.attributePrefix}-market`, 'market');
             //market.style.cssText = 'position: fixed; left: 0px; top: 0px;';
             modalState.container().appendChild(market);
         }
         this.elements.market = market;
 
         // mask
         this.elements.mask = document.createElement('div');
         this.elements.mask.style.cssText = 'position: fixed; display: none; left: 0px; top: 0px; width: 100%; height: 100%; background: rgb(253, 254, 255) none repeat scroll 0 0; opacity: .96; -khtml-user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-touch-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;';
         this.elements.market.appendChild(this.elements.mask);
 
         // contents
         this.elements.contents = document.createElement('div');
         this.elements.contents.style.cssText = `position: absolute; margin: 0 auto; width: ${(li * count)}px;`;
         this.elements.contents.innerHTML = `
             <header style="padding: 30px 10px 0px 10px;">
                 Market
                 <nav style=""></nav>
             </header>
             <div style="padding: 20px 0px 30px 0px;">
                 <!-- loading //-->
                 <div id="${key.loading}" class="loading" style="display: none;">
                     <div class="icon">
                         <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 24 30" style="enable-background:new 0 0 50 50;" xml:space="preserve"><rect x="0" y="10" width="4" height="10"><animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0s" dur="0.6s" repeatCount="indefinite" /></rect><rect x="8" y="10" width="4" height="10"><animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.15s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite" /></rect><rect x="16" y="10" width="4" height="10"><animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.3s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite" /></rect></svg>
                     </div>
                 </div>
                 <!-- app 리스트 //-->
                 <ul id="${key.list}" class="clear-after" style=""></ul>
                 <!-- app 뷰(설명 등 보기) //-->
                 <div id="${key.view}" style="display: none;"></div>
             </div>
             <!-- close button //-->
             <div style="position: fixed; top: 20px; right: 20px;">
                 <button id="${key.close_button}" style="padding: 2px 4px; border-radius: 3px;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 50 50" style="fill: rgb(44, 45, 46);"><path style="text-indent:0;text-align:start;line-height:normal;text-transform:none;block-progression:tb;-inkscape-font-specification:Bitstream Vera Sans" d="M 9.15625 6.3125 L 6.3125 9.15625 L 22.15625 25 L 6.21875 40.96875 L 9.03125 43.78125 L 25 27.84375 L 40.9375 43.78125 L 43.78125 40.9375 L 27.84375 25 L 43.6875 9.15625 L 40.84375 6.3125 L 25 22.15625 L 9.15625 6.3125 z" color="#000" overflow="visible" enable-background="accumulate" font-family="Bitstream Vera Sans"/></svg></button>
             </div>
         `;
 
         // container
         this.elements.container = document.createElement('div');
         this.elements.container.style.cssText = 'position: fixed; display: none; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; outline: none; -webkit-overflow-scrolling: touch;  -khtml-user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-touch-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;';
         this.elements.container.appendChild(this.elements.contents);
         this.elements.market.appendChild(this.elements.container);
 
         // search element
         this.elements.close_button = this.elements.container.querySelector(`#${key.close_button}`);
         this.elements.loading = this.elements.container.querySelector(`#${key.loading}`);
         this.elements.list = this.elements.container.querySelector(`#${key.list}`);
         this.elements.view = this.elements.container.querySelector(`#${key.view}`);
     }
 
     event() {
         $(this.elements.close_button).on(`${browser.event['click']}.${EVENT_CLICK_CLOSE}_${this.settings.key}`, (e) => {
             let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
             event.preventDefault();
             event.stopPropagation();
             this.hide();
         });
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
 
     position() {
         try {
             elementPosition(this.elements.contents, 'topcenter');
         }catch(e) {
             if(typeof this.settings.listeners.error === 'function') {
                 this.settings.listeners.error.call(this, e);
             }
         }
 
         return this;
     }
 
     async show({ callback, }={}) {
         let size = windowDocumentSize();
 
         // 스크롤바 사이즈만큼 여백
         if(size.window.height < size.document.height) {
             $('html').css({'margin-right': `${browser['scrollbar']}px`, 'overflow': 'hidden'});
         }
 
         // element
         this.elements.mask.style.zIndex = ++modalState.zindex;
         this.elements.mask.style.display = 'block';
         this.elements.container.style.zIndex = ++modalState.zindex;
         this.elements.container.style.display = 'block';
         this.position();
 
         // loading
         this.elements.loading.style.display = 'block';
 
         // 서버에서 블록 리스트를 받아와서 템플릿을 이용해서 페인팅한다.
         await this.imports();
 
         // loading
         this.elements.loading.style.display = 'none';
 
         // focus (웹접근성)
         modalState.active = document.activeElement;
         this.elements.container.setAttribute('tabindex', -1);
         this.elements.container.focus();
 
         // listeners
         if(typeof this.settings.listeners.show === 'function') {
             this.settings.listeners.show.call(this);
         }
         if(typeof callback === 'function') {
             callback.call(this);
         }
     }
 
     hide({ callback, }={}) {
         // 스크롤바 관련 (닫을 때 document 사이즈가 변경되었을 수 있기 때문에 if(조건문) 검사를 안한다.)
         $('html').css({'margin-right': modalState.defaultStyle['margin-right'], 'overflow': modalState.defaultStyle['overflow']});
 
         // element
         this.elements.container.style.display = 'none';
         this.elements.mask.style.display = 'none';
 
         // focus (웹접근성)
         if(modalState.active) {
             modalState.active.focus();
         }
 
         // listeners
         if(typeof this.settings.listeners.hide === 'function') {
             this.settings.listeners.hide.call(this);
         }
         if(typeof callback === 'function') {
             callback.call(this);
         }
     }
 
     async imports() { // market 내부 html 불러오기
         const that = this;
         const setMarketList = (result={}) => { // 리스트 생성
             let {
                 json,
                 html,
                 page,
             } = result;
         
             // html
             if(!page) {
                 this.elements.list.innerHTML = html;
             }else {
                 this.elements.list.appendChild(fragmentHtml(html));
             }
 
             // json
             Array.isArray(json.list) && json.list.forEach((item, index) => {
                 let {
                     block,
                     form,
                 } = item;
                 // 이벤트 수정해야 한다.
                 // list 에서 이벤트델리게이션 방식으로 해야 한다. - 이유는 버튼의 event off 가 없다.
                 $(this.elements.list.querySelector(`button[data-block="${block}"]`))
                 .off(`.${EVENT_CLICK_MARKET_GET}`)
                 .one(`${browser.event['down']}.${EVENT_CLICK_MARKET_GET}`, function() {
                     // 버튼 숨기기
                     this.style.display = 'none';
                     // block add listeners 실행
                     that.settings.listeners.add(block, form);
                 });
             });
             /*for(let i=0, max=result.json.list.length; i<max; i++) {
                 ((block, form) => { // 콜바이 레퍼런트가 발생하지 않도록 값복사 한다. (스코프 체이닝)
                     $(this.elements.list.querySelector(`button[data-block="${block}"]`)).on(browser.event['down'], () => {
                         // 버튼 숨기기
                         this.style.display = 'none';
                         // block add listeners
                         this.settings.listeners.add(block, form);
                     });
                 })(result.json.list[i].block, result.json.list[i].form);
             }*/
         };
 
         // worker 요청 
         let { result, } = await this.worker.message({
             'instance': 'market',
             'method': 'getList',
             'parameter': { 
                 'page': 0,
              },
         });
 
         // worker 응답에 따른 실행
         setMarketList(result);
     }
 }