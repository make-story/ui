/**
 * 실행중인 story 팝업 리스트
 */
import browser, { windowDocumentSize, browserScroll, } from '@src/browser';
import $ from '@src/dom';
import { getKey, extend, elementPosition, } from '@src/util';
import ModalBase from '@src/modal/ModalBase';
import ModalState, { modalState } from "@src/modal/ModalState";

const EVENT_CLICK_CLOSE = 'EVENT_CLICK_CLOSE';

export default class ModalBunch extends ModalBase {
    constructor(settings) {
        super();
        this.settings = {
			'key': '',
			'listeners': {
				'show': null,
				'hide': null,
				'error': null
			},
			'esc': true // 키보드 esc 닫기실행
		};
		this.settings = extend(this.settings, settings);
		this.elements = {};

        // render
		this.render();

        // event
        this.event();
    }

    render() {
        let key = {
            close_button: getKey(),
            list: getKey(),
        };
        let size, li, count;

        // 화면 중앙에 contents 가 위치하도록 계산
        size = windowDocumentSize();
        li = 100; // 리스트 (li태그) 1개 기준 가로 px (padding, margin 포함)
        count = Math.floor(size.document.width / li);
        if(9 < count) { // 최대 가로 출력 개수 제한
            count = 9;
        }

        // bunch
		let bunch = document.querySelector(`[${modalState.attributePrefix}-bunch]`);
		if(!bunch) {
			bunch = document.createElement('div');
			bunch.setAttribute(`${modalState.attributePrefix}-bunch`, 'bunch');
			//bunch.style.cssText = 'position: fixed; left: 0px; top: 0px;';
			modalState.container().appendChild(bunch);
		}
		this.elements.bunch = bunch;

        // mask
        this.elements.mask = document.createElement('div');
        this.elements.mask.style.cssText = 'position: fixed; display: none; left: 0px; top: 0px; width: 100%; height: 100%; background: rgb(253, 254, 255) none repeat scroll 0 0; opacity: .96; -khtml-user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-touch-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;';
        this.elements.bunch.appendChild(this.elements.mask);

        // contents
        this.elements.contents = document.createElement('div');
        this.elements.contents.style.cssText = `position: absolute; margin: 0 auto; width: ${(li * count)}px;`;
        this.elements.contents.innerHTML = `
            <header style="padding: 30px 10px 0px 10px;">
                This is the running kit list.
                <nav style=""></nav>
            </header>
            <div style="padding: 20px 0px 30px 0px;">
                <!-- app 리스트 //-->
                <ul id="${key.list}" class="clear-after" style=""></ul>
            </div>
            <!-- close button //-->
            <div style="position: fixed; top: 20px; right: 20px;">
                <button id="${key.close_button}" style="padding: 2px 4px; border-radius: 3px;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 50 50" style="fill: rgb(44, 45, 46);"><path style="text-indent:0;text-align:start;line-height:normal;text-transform:none;block-progression:tb;-inkscape-font-specification:Bitstream Vera Sans" d="M 9.15625 6.3125 L 6.3125 9.15625 L 22.15625 25 L 6.21875 40.96875 L 9.03125 43.78125 L 25 27.84375 L 40.9375 43.78125 L 43.78125 40.9375 L 27.84375 25 L 43.6875 9.15625 L 40.84375 6.3125 L 25 22.15625 L 9.15625 6.3125 z" color="#000" overflow="visible" enable-background="accumulate" font-family="Bitstream Vera Sans"/></svg></button>
            </div>
        `;

        // container
        this.elements.container = document.createElement('div');
        this.elements.container.style.cssText = 'position: fixed; display: none; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; outline: none; -webkit-overflow-scrolling: touch; -khtml-user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-touch-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;';
        this.elements.container.appendChild(this.elements.contents);
        this.elements.bunch.appendChild(this.elements.container);

        // search element
        this.elements.close_button = this.elements.container.querySelector(`#${key.close_button}`);
        this.elements.list = this.elements.container.querySelector(`#${key.list}`);
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

    show({ callback, }={}) {
        let size = windowDocumentSize();

        // 실행중인 stroy
        (() => {
            let i, max;
            let story = document.querySelector(`[${modalState.attributePrefix}-story]`);
            let child = story.children;
            let fragment = document.createDocumentFragment();
            let li;

            // TextNode 포함 내부 element 전체 제거
            while(this.elements.list.hasChildNodes()) {
                this.elements.list.removeChild(this.elements.list.lastChild);
            }
            // story elements 검색
            for(i=0, max=child.length; i<max; i++) {
                // story storage (title 이 modal 생성시 저장된다.)
                if(child[i].storage) {
                    // li 생성
                    li = document.createElement('li');
                    li.style.cssText = "float: left; position: relative; margin: 5px; padding: 10px; width: 68px; height: 68px; border: 1px solid rgba(44, 45, 46, .96); border-radius: 3px; overflow: hidden;";
                    li.innerHTML = `
                        <button style="margin: 0; padding: 0; color: rgb(44, 45, 46); word-wrap:break-word; word-break:break-all" data-type="title">
                            ${decodeURIComponent(child[i].storage.title)}
                        </button>
                        <button style="position: absolute; right: 10px; bottom: 10px; margin: 0; padding: 0px; color: rgb(44, 45, 46);" data-type="close">
                            close
                        </button>
                    `;

                    // event
                    (function(li, key) {
                        let title_button, close_button;
                        if(modalState.instance[key]) {
                            // 레이어가 종료(삭제)될 때 하위 이벤트도 같이 해제 되어야 한다.
                            title_button = li.querySelector('button[data-type="title"]');
                            $(title_button).on(browser.event['down'], function() {
                                // story 삭제
                                modalState.instance[key].show();
                                // bunch 닫기
                                this.hide();
                            });
                            close_button = li.querySelector('button[data-type="close"]');
                            $(close_button).on(browser.event['down'], function() {
                                // story 삭제
                                modalState.instance[key].remove();
                                // li 삭제
                                li.parentNode.removeChild(li);
                            });
                        }
                    })(li, child[i].storage.key);
                    //
                    fragment.appendChild(li);
                }
            }
            this.elements.list.appendChild(fragment);
        })();

        // 스크롤바 사이즈만큼 여백
        if(size.window.height < size.document.height) {
            $('html').css({'margin-right': `${browser.scrollbar}px`, 'overflow': 'hidden'});
        }

        // element
        this.elements.mask.style.zIndex = ++modalState.zindex;
        this.elements.mask.style.display = 'block';
        this.elements.container.style.zIndex = ++modalState.zindex;
        this.elements.container.style.display = 'block';
        this.position();

        // focus (웹접근성)
        modalState.active = document.activeElement;
        this.elements.container.setAttribute('tabindex', -1);
        this.elements.container.focus();

        // queue
        modalState.removeQueue(this.settings.key); // 기존값 제거
        modalState.queue['order'].push(this.settings.key);

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

        // queue
        modalState.removeQueue(this.settings.key); // 기존값 제거

        // listeners
        if(typeof this.settings.listeners.hide === 'function') {
            this.settings.listeners.hide.call(this);
        }
        if(typeof callback === 'function') {
            callback.call(this);
        }
    }
}