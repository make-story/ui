/**
 * 폴더
 */
import browser, { windowDocumentSize, browserScroll, } from '@src/browser';
import $ from '@src/dom';
import { getKey, extend, elementPosition, } from '@src/util';
import ModalBase from '@src/modal/ModalBase';
import ModalState, { modalState } from "@src/modal/ModalState";

const EVENT_BLUR_TITLE = 'EVENT_BLUR_TITLE';
const EVENT_KEYUP_TITLE = 'EVENT_KEYUP_TITLE';
const EVENT_CLICK_CLOSE = 'EVENT_CLICK_CLOSE';
const EVENT_RESIZE = 'EVENT_RESIZE';

export default class ModalFolder extends ModalBase {
    constructor(settings) {
        super();
        this.settings = {
			'key': '',
			'position': 'center',
			'mask': null, // 값이 있으면 해당 mask element 를 실행한다.
			'listeners': {
				'show': null,
				'hide': null,
				'remove': null,
				'error': null,
				'title': null // 폴더명 변경 이벤트 콜백
			},
			'theme:': {}, // 테마 (스타일 변경)
			'mode': 'view', // 방식 (폴더 제목등 수정가능한지 상태값) - view: 읽기모드, edit: 수정모드
			'grid': '', // 상위 grid 값 (parent grid key)
			'title': 'Folder',
			'esc': true // 키보드 esc 닫기실행
		};
		this.settings = extend(this.settings, settings);
		this.elements = {};
		this.time = null;
		this.display = 'flex'; // block | flex
		this.min = {
			width: 310,
			height: 310
		};
		this.min.width += browser.scrollbar; // 스크롤바 가로 픽셀
		this.max = {
			width: this.min.width,
			height: this.min.height * 2
		};

        // render
		this.render();

        // event
        this.event();
    }

    render() {
        // key
        let key = {
            header: getKey(),
            title_input: getKey(),
            close_button: getKey(),
            grid: getKey(),
            parent: getKey(),
        };

        // folder
		let folder = document.querySelector(`[${modalState.attributePrefix}-folder]`);
		if(!folder) {
			folder = document.createElement('div');
			folder.setAttribute(`${modalState.attributePrefix}-folder`, 'folder');
			//folder.style.cssText = 'position: fixed; left: 0px; top: 0px;';
			modalState.container().appendChild(folder);
		}
		this.elements.folder = folder;

        // mask
        if(typeof this.settings.mask === 'boolean' && this.settings.mask === true) { // mask 값이 element 가 아닌 boolean 타입일 때
            this.elements.mask = document.createElement('div');
            this.elements.mask.style.cssText = 'position: fixed; display: none; left: 0px; top: 0px; width: 100%; height: 100%; background: rgb(240, 241, 242) none repeat scroll 0 0; opacity: .96; -khtml-user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-touch-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;';
            this.elements.folder.appendChild(this.elements.mask);
        }else if(this.settings.mask && typeof this.elements.mask === 'object') {
            this.elements.mask = this.settings.mask.nodeType ? this.settings.mask : $(this.settings.mask).get(0);
            this.elements.mask.display = 'none';
        }

        // contents
        this.elements.contents = document.createElement('div');
        this.elements.contents.style.cssText = `position: fixed; display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; align-content: stretch; width: ${this.min.width}px; height: ${this.min.height}px; box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, .05); border: 1px solid rgb(240, 241, 242); border-radius: 3px; outline: none; -khtml-user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-touch-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;`;
        this.elements.contents.innerHTML = `
            <!-- header //-->
            <header id="${key.header}" style="height: 50px; background-color: rgb(253, 254, 255); border-radius: 3px 3px 0 0; -khtml-user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-touch-select: none;">
                <!-- 폴더명 입력 //-->
                <input type="text" name="" value="${decodeURIComponent(this.settings.title)}" id="${key.title_input}" style="position: absolute; left: 20px; top: 12px; padding: 5px; width: 170px; height: 17px; border: 0; font-size: 13px; color: rgb(76, 77, 78); border-radius: 3px; outline: none;" />
                <!-- 폴더 닫기 등 버튼 //-->
                <button id="${key.close_button}" style="position: absolute; right: 20px; top: 12px; padding: 5px; border: 0; background-color: transparent; font-size: 13px; color: rgb(76, 77, 78);">close</button>
            </header>
            <!-- grid //-->
            <div id="${key.grid}" data-type="content" style="flex: 1; display: flex; min-height: 150px; background-color: rgba(253, 254, 255, .96); border-top: 1px dashed rgb(240, 241, 242); border-bottom: 1px dashed rgb(240, 241, 242); overflow: hidden;">
                <!-- grid 로딩 메시지 //-->
                <div class="loading">
                    <p class="message">Loading...</p>
                </div>
            </div>
            <!-- parent grid move //-->
            <div id="${key.parent}" data-type="parent" data-folder="${this.settings['key']}" data-grid="${this.settings['grid']}" style="padding-top: 32px; height: 68px; font-size: 14px; color: rgb(225, 226, 227); text-align: center; background-color: rgb(253, 254, 255); border-radius: 0 0 3px 3px; -webkit-touch-callout: none; -webkit-touch-select: none; -khtml-user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; user-select: none; cursor: default;">
                <!-- 상위폴더로 이동할 경우 여기로 드래그 //-->
                If you go to the parent folder<br>and drag it here
            </div>
        `;
        this.elements.contents.setAttribute('data-type', 'folder');
        this.elements.contents.setAttribute('data-key', this.settings['key']);
        if('dataset' in this.elements.contents) {
            this.elements.contents.dataset.type = 'folder';
            this.elements.contents.dataset.key = this.settings['key'];
        }
        this.elements.folder.appendChild(this.elements.contents);

        // search element
        this.elements.header = this.elements.contents.querySelector(`#${key.header}`);
        this.elements.title_input = this.elements.contents.querySelector(`#${key.title_input}`);
        this.elements.close_button = this.elements.contents.querySelector(`#${key.close_button}`);
        this.elements.grid = this.elements.contents.querySelector(`#${key.grid}`); // api.grid.js 에서 folder 내부 target 지정할 때 사용됨
        this.elements.parent = this.elements.contents.querySelector(`#${key.parent}`);

        // element storage
        this.elements.parent.storage = {
            'type': 'parent',
            'folder': this.settings['key'], // folder key
            'grid': this.settings['grid'] // parent grid key
        };
    }

    event() {
        const that = this;

        $(this.elements.title_input).on(`blur.${EVENT_BLUR_TITLE}_${this.settings.key}`, function(e) { // 폴터 타이틀 변경 이벤트
            let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
            let value = this.value;
            event.preventDefault();
            event.stopPropagation();
            // 폴더 제목 변경
            if(that.settings.mode === 'edit' && typeof that.settings.listeners.title === 'function') {
                that.settings.listeners.title(encodeURIComponent(value || ''));
            }
        });
        (() => {
            let before; // 이전 타이틀 설정값 (계속 엔터키를 눌렀을 때 불필요한 동기화 방지)
            $(this.elements.title_input).on(`keyup.${EVENT_KEYUP_TITLE}_${this.settings.key}`, function(e) { // 폴터 타이틀 변경 이벤트 (enter key)
                let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
                let code = event.which || event.keyCode;
                let value = this.value;

                if(that.settings.mode === 'edit') {
                    if(code === 13) {
                        // 폴더 제목 변경
                        if(before !== value && typeof that.settings.listeners.title === 'function') {
                            that.settings.listeners.title(encodeURIComponent(value || ''));
                            before = value;
                        }
                        if(typeof that.elements.title_input.blur === 'function') {
                            that.elements.title_input.blur();
                        }
                    }else {
                        // 화면 title 변경 (실시간 변경)
                        //console.log('[모달 정보] 폴터 타이틀 변경', value);
                    }
                }
            });
        })();
        $(this.elements.close_button).on(`${browser.event.click}.${EVENT_CLICK_CLOSE}_${this.settings.key}`, (e) => { // 폴더 닫기 버튼 이벤트
            let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
            event.preventDefault(event);
            event.stopPropagation(event);
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
                    case 'mode':
                        this.settings[key] = settings[key];
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

    size() {
        let size = windowDocumentSize();
        let value = 100;
        let height = value * Math.floor(size.browser.height / value);
        height -= value;

        if(height < this.min.height) {
            height = this.min.height;
        }else if(this.max.height < height) {
            height = this.max.height;
        }
        this.elements.contents.style.height = `${height}px`;
    }

    position() {
        let scroll, result;

        try {
            //scroll = browserScroll();
            result = elementPosition(this.elements.contents, this.settings.position);
            //this.elements.contents.style.left = (scroll.left + result.left) + 'px';
            //this.elements.contents.style.top = (scroll.top + result.top) + 'px';
        }catch(e) {
            if(typeof this.settings.listeners.error === 'function') {
                this.settings.listeners.error.call(this, e);
            }
        }

        return this;
    }

    show({ callback, }={}) {
        let size = windowDocumentSize();

        // 폴더 제목 작업모드
        this.titleToggle();

        // 스크롤바 사이즈만큼 여백
        if(size.window.height < size.document.height) {
            $('html').css({'margin-right': `${browser.scrollbar}px`, 'overflow': 'hidden'});
        }

        // element
        this.elements.contents.style.webkitTransition = this.elements.contents.style.MozTransition = this.elements.contents.style.msTransition = this.elements.contents.style.OTransition = this.elements.contents.style.transition = 'left 0s, top 0s';
        if(this.settings.mask && typeof this.elements.mask === 'object' && this.elements.mask.nodeType) {
            this.elements.mask.style.zIndex = ++modalState.zindex;
            this.elements.mask.style.display = 'block';
        }
        this.elements.contents.style.zIndex = ++modalState.zindex;
        this.elements.contents.style.display = this.display;
        this.size();
        this.position();
        if(browser.monitor === 'pc') {
            this.elements.contents.style.webkitTransition = this.elements.contents.style.MozTransition = this.elements.contents.style.msTransition = this.elements.contents.style.OTransition = this.elements.contents.style.transition = 'left .5s, top .5s';
            //this.elements.contents.style.transition = 'left .5s, top .5s';
        }

        // focus (웹접근성)
        modalState.active = document.activeElement;
        this.elements.contents.setAttribute('tabindex', -1);
        this.elements.contents.focus();

        // queue
        modalState.removeQueue(this.settings.key); // 기존값 제거
        modalState.queue['order'].push(this.settings.key);

        // resize 이벤트 실행 (이벤트 키는 this.settings.key 를 활용한다.)
        $(window).off(`resize.${EVENT_RESIZE}_${this.settings.key}`).on(`resize.${EVENT_RESIZE}_${this.settings.key}`, (e) => {
            window.clearTimeout(this.time);
            this.time = window.setTimeout(() => {
                this.size();
                this.position();
            }, 50);
        });

        // listeners
        if(typeof this.settings.listeners.show === 'function') {
            this.settings.listeners.show.call(this);
        }
        if(typeof callback === 'function') {
            callback.call(this);
        }
    }

    hide({ callback, }={}) {
        // 폴더 제목 작업모드
        this.titleToggle();

        // 스크롤바 관련 (닫을 때 document 사이즈가 변경되었을 수 있기 때문에 if(조건문) 검사를 안한다.)
        $('html').css({'margin-right': modalState.defaultStyle['margin-right'], 'overflow': modalState.defaultStyle['overflow']});

        // element
        this.elements.contents.style.display = 'none';
        if(this.settings.mask && typeof this.elements.mask === 'object' && this.elements.mask.nodeType) {
            this.elements.mask.style.display = 'none';
        }

        // focus (웹접근성)
        if(modalState.active) {
            modalState.active.focus();
        }

        // queue
        modalState.removeQueue(this.settings.key); // 기존값 제거

        // resize 이벤트 종료
        $(window).off(`resize.${EVENT_RESIZE}_${this.settings.key}`);

        // listeners
        if(typeof this.settings.listeners.hide === 'function') {
            this.settings.listeners.hide.call(this);
        }
        if(typeof callback === 'function') {
            callback.call(this);
        }
    }

    remove({ callback, }={}) {
        // 스크롤바 관련 (닫을 때 document 사이즈가 변경되었을 수 있기 때문에 if(조건문) 검사를 안한다.)
        $('html').css({'margin-right': modalState.defaultStyle['margin-right'], 'overflow': modalState.defaultStyle['overflow']});

        // element
        if(this.elements.mask) {
            this.elements.mask.parentNode.removeChild(this.elements.mask);
        }
        if(this.elements.contents) {
            this.elements.contents.parentNode.removeChild(this.elements.contents);
        }
        this.elements = {};

        // queue
        modalState.removeQueue(this.settings.key); // 기존값 제거

        // instance
        modalState.removeInstance(this.settings.key);

        // resize 이벤트 종료
        $(window).off(`resize.${EVENT_RESIZE}_${this.settings.key}`);

        // listeners
        if(typeof callback === 'function') {
            callback.call(this);
        }
    }

    titleToggle({ mode=this.settings['mode'] }={}) {
        // 폴더 제목 작업모드
        if(mode !== 'edit') {
            this.elements.title_input.readOnly = true;
            this.elements.title_input.style.backgroundColor = 'transparent';
        }else {
            this.elements.title_input.readOnly = false;
            this.elements.title_input.style.backgroundColor = 'rgba(240, 241, 242, .86)';
        }

        this.settings['mode'] = mode;
    }
}
