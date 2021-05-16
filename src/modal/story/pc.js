/**
 * 
 */
import browser, { windowDocumentSize, browserScroll, } from '@src/browser';
import $ from '@src/dom';
import { getKey, extend, elementPosition, } from '@src/util';
import ModalState, { modalState } from "@src/modal/ModalState";

const EVENT_MOUSEDOWN_POPUP_STORY_REFRESH = 'EVENT_MOUSEDOWN_POPUP_STORY_REFRESH';
const EVENT_MOUSEDOWN_POPUP_STORY_HIDDEN = 'EVENT_MOUSEDOWN_POPUP_STORY_HIDDEN';
const EVENT_MOUSEDOWN_POPUP_STORY_FULLSCREEN = 'EVENT_MOUSEDOWN_POPUP_STORY_FULLSCREEN';
const EVENT_MOUSEDOWN_POPUP_STORY_CLOSE = 'EVENT_MOUSEDOWN_POPUP_STORY_CLOSE';

const EVENT_MOUSEDOWN_POPUP_STORY_MOVE = 'EVENT_MOUSEDOWN_POPUP_STORY_MOVE';
const EVENT_MOUSEMOVE_POPUP_STORY_MOVE = 'EVENT_MOUSEMOVE_POPUP_STORY_MOVE';
const EVENT_MOUSEUP_POPUP_STORY_MOVE = 'EVENT_MOUSEUP_POPUP_STORY_MOVE';

const EVENT_MOUSEMOVE_POPUP_STORY_RESIZE = 'EVENT_MOUSEMOVE_POPUP_STORY_RESIZE';
const EVENT_MOUSEUP_POPUP_STORY_RESIZE = 'EVENT_MOUSEUP_POPUP_STORY_RESIZE';
const EVENT_MOUSEDOWN_POPUP_STORY_RESIZE_RIGHT = 'EVENT_MOUSEDOWN_POPUP_STORY_RESIZE_RIGHT';
const EVENT_MOUSEDOWN_POPUP_STORY_RESIZE_BOTTOM = 'EVENT_MOUSEDOWN_POPUP_STORY_RESIZE_BOTTOM';
const EVENT_MOUSEDOWN_POPUP_STORY_RESIZE_RIGHTBOTTOM = 'EVENT_MOUSEDOWN_POPUP_STORY_RESIZE_RIGHTBOTTOM';

export default function() {
    let resize_domain = 0; // 리사이즈 버튼 영역
    let padding_contents = 5;

    // resize 버튼 크기
    if(browser.is.touch === true) { // 터치 기기에서는 사용자 손가락 터치 영역을 고려하여 범위를 넓게 한다.
        resize_domain = 16;
    }else {
        resize_domain = 10;
    }

    // contents   
    // box-shadow: -1px 1px 1px rgba(0, 0, 0, .10), 1px 1px 1px rgba(0, 0, 0, .10);
    this.elements.contents = document.createElement('section');
    //this.elements.contents.style.cssText = 'position: fixed; box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, .05); border: 1px solid rgb(44, 45, 46); outline: none;'; // border 스타일 변경시 리사이즈 후 스타일도 함께 변경해 줘야한다.
    this.elements.contents.style.cssText = `position: fixed; outline: none; padding: ${padding_contents}px; border-radius: 0px; background-color: rgba(251, 252, 253, .86); -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent; box-shadow: 1px 1px 1px rgba(0, 0, 0, .06); border: 1px solid rgb(44, 45, 46);`; // border 스타일 변경시 리사이즈 후 스타일도 함께 변경해 줘야한다.
    this.elements.contents.innerHTML = `
        <!-- header //-->
        <header id="${this.key.header}" style="position: relative; width: 100%; height: 35px; box-sizing: border-box;">
            <div style="height: 30px;">
                <!-- title //-->
                <div id="${this.key.title}" style="position: absolute; top: 7px; left: 18px; font-size: 12px; color: rgb(44, 45, 46); user-select: none;">${decodeURIComponent(this.settings.title)}</div>
                <!-- progress //-->
                <div id="${this.key.progress}" style="position: absolute; width: 100%; bottom: -3px;">
                    <div id="${this.key.bar}" style="background-color: rgba(231, 68, 78, .86); width: 0%; height: 3px; display: none;"></div>
                </div>
                <!-- button //-->
                <div id="${this.key.button_group}" style="position: absolute; top: 0px; right: 0px; padding: 0px 9px;">
                    <button id="${this.key.button_refresh}" style="width: 30px; height: 30px; background-image: url(&quot;//${window.location.host}/images/popup-buttons-30-b.png&quot;); background-position: 0px 0px; background-repeat: no-repeat;"></button>
                    <button id="${this.key.button_hidden}" style="width: 30px; height: 30px; background-image: url(&quot;//${window.location.host}/images/popup-buttons-30-b.png&quot;); background-position: -30px 0px; background-repeat: no-repeat;"></button>
                    ${(browser.is.fullscreen === true ? `<button id="${this.key.button_fullscreen}" style="width: 30px; height: 30px; background-image: url(&quot;//${window.location.host}/images/popup-buttons-30-b.png&quot;); background-position: -60px 0px; background-repeat: no-repeat;"></button>` : ``)}
                    <button id="${this.key.button_close}" style="width: 30px; height: 30px; background-image: url(&quot;//${window.location.host}/images/popup-buttons-30-b.png&quot;); background-position: -90px 0px; background-repeat: no-repeat;"></button>
                </div>
            </div>
        </header>
        <!-- main //-->
        <div id="${this.key.main}" style="width: 100%; clear: both; box-sizing: border-box; height: 352px;">
            <iframe id="${this.key.iframe}" src="" srcdoc="" width="100%" height="100%" style="margin: 0px; padding: 0px; pointer-events: auto; background-color: rgba(245, 246, 247, .86); border: 0; box-sizing: border-box;"></iframe>
        </div>
        <!-- resize //-->
        <div id="${this.key.right_resize}" style="top: 0px; right: -${resize_domain}px; width: ${resize_domain}px; height: 100%; cursor: e-resize; position: absolute; display: block;"></div>
        <div id="${this.key.bottom_resize}" style="left: 0px; bottom: -${resize_domain}px; width: 100%; height: ${resize_domain}px; cursor: s-resize; position: absolute; display: block;"></div>
        <div id="${this.key.right_bottom_resize}" style="right: -${resize_domain}px; bottom: -${resize_domain}px; width: ${resize_domain}px; height: ${resize_domain}px; cursor: se-resize; position: absolute; display: block;"></div>
    `;
    this.elements.story.appendChild(this.elements.contents);

    // search element
    /*
    -
    // 팝업 타이틀, 제어 버튼 등 toolkit (모바일에서는 하단에 적용)
    -
    // iframe 은 상위 element의 고정된 height 픽셀값이 있어야 정확한 height="100%" 가 적용된다.
    // 그러므로 iframe 를 감싸는 main(div) 를 만든다.
    */
    this.elements.header = this.elements.contents.querySelector(`#${this.key.header}`);
    this.elements.title = this.elements.contents.querySelector(`#${this.key.title}`);
    this.elements.progress = this.elements.contents.querySelector(`#${this.key.progress}`);
    this.elements.bar = this.elements.contents.querySelector(`#${this.key.bar}`);
    this.elements.main = this.elements.contents.querySelector(`#${this.key.main}`);
    this.elements.iframe = this.elements.contents.querySelector(`#${this.key.iframe}`);
    this.elements.button_group = this.elements.contents.querySelector(`#${this.key.button_group}`);
    this.elements.button_refresh = this.elements.contents.querySelector(`#${this.key.button_refresh}`);
    this.elements.button_hidden = this.elements.contents.querySelector(`#${this.key.button_hidden}`);
    this.elements.button_fullscreen = this.elements.contents.querySelector(`#${this.key.button_fullscreen}`);
    this.elements.button_close = this.elements.contents.querySelector(`#${this.key.button_close}`);
    this.elements.right_resize = this.elements.contents.querySelector(`#${this.key.right_resize}`);
    this.elements.bottom_resize = this.elements.contents.querySelector(`#${this.key.bottom_resize}`);
    this.elements.right_bottom_resize = this.elements.contents.querySelector(`#${this.key.right_bottom_resize}`);

    // storage (bunch modal 등에서 사용됨)
    this.elements.contents.storage = {
        'key': this.settings.key,
        //'title': encodeURIComponent(this.settings.title) // decodeURIComponent
        'title': this.settings.title
    };

    // load 
    if(this.elements.iframe) {
        this.elements.iframe.onload = this.imports.bind(this);
    }else {
        this.imports.call(this);
    }

    // event
    $(this.elements.button_refresh).on(`${browser.event['down']}.${EVENT_MOUSEDOWN_POPUP_STORY_REFRESH}`, (e) => { // iframe 새로고침
        let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
        //let touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
        let touch = event.touches; // touchstart

        event.preventDefault();
        event.stopPropagation();

        if(this.elements.iframe) {
            //this.elements.iframe.contentWindow.location.reload(true); // 비표준
            //this.elements.iframe.src += '';
        }
        this.imports.call(this);
    });
    $(this.elements.button_hidden).on(`${browser.event['down']}.${EVENT_MOUSEDOWN_POPUP_STORY_HIDDEN}`, (e) => { // 팝업 숨기기
        let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
        //let touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
        let touch = event.touches; // touchstart

        event.preventDefault();
        event.stopPropagation();

        //this.elements.contents.style.display = 'none';
        this.hide();
    });
    $(this.elements.button_fullscreen).on(`${browser.event['down']}.${EVENT_MOUSEDOWN_POPUP_STORY_FULLSCREEN}`, (e) => { // fullscreen button
        let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
        //let touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
        let touch = event.touches; // touchstart
        let target;

        // 풀스크린 target
        if(this.elements.iframe) {
            target = this.elements.iframe;
        }else {
            target = this.elements.main;
        }

        /*
        -
        풀스크린상태여부
        !document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement
        -
        body를 전체화면 타겟으로 설정할경우: document.requestFullscreen -> document.documentElement.requestFullscreen (전체화면 취소는 document.exitFullscreen 형태)
        본문 요소를 전체 화면으로 구현하는 것이 당연하다고 생각할 수 있지만, WebKit 또는 Blink 기반 렌더링 엔진을 사용하는 경우 본문 너비가 촤대한 작은 크기로 줄어들고 그 안에 모든 콘텐츠가 들어가는 이상한 현상을 보게 될 것입니다. (Mozilla Gecko는 괜찮습니다.)
        */
        if(((document.fullscreenElement && document.fullscreenElement !== null) || document.mozFullScreen || document.webkitIsFullScreen)) {
            // 축소
            if(document.exitFullscreen) { // hrome, Firefox 및 IE에서 프리픽스됨.
                document.exitFullscreen();
            }else if(document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }else if(document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }else {
            // 확대
            if(target.requestFullscreen) { // Chrome, Firefox, IE에서 프리픽스됨
                target.requestFullscreen();
            }else if(target.mozRequestFullScreen) {
                target.mozRequestFullScreen();
            }else if(target.webkitRequestFullscreen) {
                target.webkitRequestFullscreen();
            }else if(target.msRequestFullscreen) {
                target.msRequestFullscreen();
            }
        }

        event.preventDefault();
        event.stopPropagation();
    });
    $(this.elements.button_close).on(`${browser.event['down']}.${EVENT_MOUSEDOWN_POPUP_STORY_CLOSE}`, (e) => { // 팝업 닫기 (삭제)
        let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
        //let touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
        let touch = event.touches; // touchstart

        event.preventDefault();
        event.stopPropagation();

        // iframe 중지
        if(this.elements.iframe) {
            this.elements.iframe.onload = null;
        }
        //this.elements.contents.style.display = 'none';
        this.remove();
    });
    $(this.elements.header).on(`${browser.event['down']}.${EVENT_MOUSEDOWN_POPUP_STORY_MOVE}`, (e) => { // 팝업이동 mouse down
        let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
        //let touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
        let touch = event.touches; // touchstart
        let mouse = {}; 
        
        let snap = [];
        let section;
        let i, max;

        event.preventDefault();
        event.stopPropagation();

        // 초기화
        $(window).off(`.${EVENT_MOUSEMOVE_POPUP_STORY_MOVE}`);
        $(window).off(`.${EVENT_MOUSEUP_POPUP_STORY_MOVE}`);

        // iframe
        if(this.elements.iframe) {
            this.elements.iframe.style.pointerEvents = 'auto';
        }

        // 멀티터치 방지
        if(touch && touch.length && 1 < touch.length) {
            return;
        }

        // button_group 내부에서 클릭된 이벤트
        if($(this.elements.button_group).contains(event.target)) {
            console.log('[모달 정보] button group 내부 target');
            return false;
        }

        // 팝업의 마지막 left, top 값을 초기화 한다.
        this.last.left = 0;
        this.last.top = 0;

        // z-index
        modalState.zindex += 1;
        this.elements.contents.style.zIndex = modalState.zindex;

        // 마우스 위치
        mouse = {
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
        mouse.down.top = mouse.down.top - Number(String(this.elements.contents.style.top).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5'));
        mouse.down.left = mouse.down.left - Number(String(this.elements.contents.style.left).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5'));

        // snap 대상 element 배열에 저장
        snap = [];
        section = this.elements.story.querySelectorAll('section');
        for(i=0, max=section.length; i<max; i++) {
            // 현재 element(story)를 제외한 element 들을 리스트에 담는다 (현재 display되고 있는 다른 story layer)
            if(this.elements.contents.isEqualNode(section[i]) === false && section[i].style && section[i].style.display !== 'none') {
                snap.push({
                    'top': parseInt(section[i].offsetTop),
                    'left': parseInt(section[i].offsetLeft),
                    'bottom': parseInt(section[i].offsetTop + section[i].offsetHeight),
                    'right': parseInt(section[i].offsetLeft + section[i].offsetWidth)
                });
            }
        }

        // mouse move (left, top 이동)
        if(this.elements.iframe) {
            this.elements.iframe.style.pointerEvents = 'none';
        }
        $(window).on(`${browser.event['move']}.${EVENT_MOUSEMOVE_POPUP_STORY_MOVE}`, (e) => {
            let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
            //let touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
            let touch = event.touches || event.changedTouches;
            let top, left, bottom, right;
            let i, max;
            let interval;

            event.preventDefault();
            event.stopPropagation();

            // 마우스 위치
            if(touch) {
                mouse.move.top = touch[0].pageY;
                mouse.move.left = touch[0].pageX;
            }else {
                mouse.move.top = event.pageY;
                mouse.move.left = event.pageX;
            }

            // 현재 팝업의 위치(영역)
            top = (mouse.move.top - mouse.down.top);
            left = (mouse.move.left - mouse.down.left);
            bottom = parseInt(top + this.elements.contents.offsetHeight);
            right = parseInt(left + this.elements.contents.offsetWidth);

            // 스크롤 제어
            this.elements.contents.scrollIntoView(false); // true 일 경우 엘리먼트가 스크롤 영역의 상단에 위치하도록 스크롤 됩니다. 만약  false 인 경우 스크롤 영역의 하단에 위치하게 됩니다.
            //this.elements.contents.scrollIntoView({block: "end", behavior: "instant"}); // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView

            // snap 영역 검사
            interval = this.snap; // snap 을 발생시키도록하는 element와 element 간의 간격
            for(i=0, max=snap.length; i<max; i++) {
                /*
                -
                사각형(top, left, bottom, right) snap 가능 영역 산정
                top영역: (snap[i].top - interval)
                left영역: (snap[i].left - interval)
                bottom영역: (snap[i].bottom + interval)
                righr영역: (snap[i].right + interval)
                위 영역(다른 팝업 element)안으로 움직이고 있는 팝업이 들어오면 snap 을 검사한다.
                */
                if(top < (snap[i].bottom + interval) && bottom > (snap[i].top - interval) && right > (snap[i].left - interval) && left < (snap[i].right + interval)) {
                    // left 또는 right
                    if(Math.abs(snap[i].left - left) <= interval) {
                        left = snap[i].left;
                    }else if(Math.abs(snap[i].left - right) <= interval) {
                        left = snap[i].left - this.elements.contents.offsetWidth;
                    }else if(Math.abs(snap[i].right - right) <= interval) {
                        left = snap[i].right - this.elements.contents.offsetWidth;
                    }else if(Math.abs(snap[i].right - left) <= interval) {
                        left = snap[i].right;
                    }

                    // top 또는 bottom
                    if(Math.abs(snap[i].top - top) <= interval) {
                        top = snap[i].top;
                    }else if(Math.abs(snap[i].top - bottom) <= interval) {
                        top = snap[i].top - this.elements.contents.offsetHeight;
                    }if(Math.abs(snap[i].bottom - bottom) <= interval) {
                        top = snap[i].bottom - this.elements.contents.offsetHeight;
                    }else if(Math.abs(snap[i].bottom - top) <= interval) {
                        top = snap[i].bottom;
                    }

                    break;
                }
            }

            // 위치 적용
            if(0 <= top) {
                this.elements.contents.style.top = top + 'px';
            }
            if(0 <= left) {
                this.elements.contents.style.left = left + 'px';
            }
        });
        // mouse up
        $(window).on(`${browser.event['up']}.${EVENT_MOUSEUP_POPUP_STORY_MOVE}`, (e) => {
            let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
            let touch = event.changedTouches; // touchend

            event.preventDefault();

            // 초기화
            $(window).off(`.${EVENT_MOUSEMOVE_POPUP_STORY_MOVE}`);
            $(window).off(`.${EVENT_MOUSEUP_POPUP_STORY_MOVE}`);

            // iframe
            if(this.elements.iframe) {
                this.elements.iframe.style.pointerEvents = 'auto';
            }
        });
    });

    // resize event
    let setMousePositionOn = (callback) => {
        if(!callback || typeof callback !== 'function') {
            return false;
        }

        //console.log('[모달 정보] resize mouse on');

        // z-index
        modalState.zindex += 1;
        this.elements.contents.style.zIndex = modalState.zindex;

        // style
        this.elements.contents.style.border = '1px dashed rgb(44, 45, 46)';

        // event
        $('iframe', this.elements.story).css({'pointerEvents': 'none'});
        $(window).off(`.${EVENT_MOUSEMOVE_POPUP_STORY_RESIZE}`);
        $(window).on(`${browser.event['move']}.${EVENT_MOUSEMOVE_POPUP_STORY_RESIZE}`, (e) => {
            let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
            //let touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
            let touch = event.touches || event.changedTouches;
            let top, left;

            event.preventDefault();
            event.stopPropagation();

            /*
            pageX/pageY : <html> element in CSS pixels.
            clientX/clientY : viewport(browser) in CSS pixels.
            screenX/screenY : screen in device pixels.
            */

            // 마우스 위치
            if(touch) {
                top = touch[0].clientY;
                left = touch[0].clientX;
            }else {
                top = event.clientY;
                left = event.clientX;
            }

            // 값 보정  
            top -= Number(String(this.elements.contents.style.top).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')); // 현재 팝업의 top 값
            top -= resize_domain; // resize 버튼 크기
            if(0 < top && padding_contents < top) {
                top = top - padding_contents;
            }
            left -= Number(String(this.elements.contents.style.left).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')); // 현재 팝업의 left 값
            left -= resize_domain; // resize 버튼 크기
            if(0 < left && padding_contents < left) {
                left = left - padding_contents;
            }

            //console.log('[모달 정보] top: ' + top + ', left: ' + left);
            callback({'top': top, 'left': left});
        });
    };
    let setMousePositionOff = (callback) => {
        $(window).off(`.${EVENT_MOUSEUP_POPUP_STORY_RESIZE}`);
        $(window).on(`${browser.event['up']}.${EVENT_MOUSEUP_POPUP_STORY_RESIZE}`, (e) => {
            let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
            let touch = event.changedTouches; // touchend

            //console.log('[모달 정보] resize mouse off');

            // event
            $(window).off(`.${EVENT_MOUSEMOVE_POPUP_STORY_RESIZE}`);
            $(window).off(`.${EVENT_MOUSEUP_POPUP_STORY_RESIZE}`);
            $('iframe', this.elements.story).css({'pointerEvents': 'auto'});
            //this.elements.iframe.style.pointerEvents = 'auto';

            // style
            //this.elements.contents.style.border = '1px solid transparent';
            this.elements.contents.style.border = '1px solid rgb(44, 45, 46)';
            //this.elements.contents.style.border = '0px';
            document.documentElement.style.cursor = 'auto'; // <html>

            // callback
            if(callback && typeof callback === 'function') {
                callback();
            }
        });
    };
    $(this.elements.right_resize).on(`${browser.event['down']}.${EVENT_MOUSEDOWN_POPUP_STORY_RESIZE_RIGHT}`, (e) => {
        let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
        //let touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
        let touch = event.touches; // touchstart

        event.preventDefault();
        event.stopPropagation();

        // 초기화
        $(window).off(`.${EVENT_MOUSEMOVE_POPUP_STORY_RESIZE}`);
        $(window).off(`.${EVENT_MOUSEUP_POPUP_STORY_RESIZE}`);

        // 멀티터치 방지
        if(touch && touch.length && 1 < touch.length) {
            return;
        }

        document.documentElement.style.cursor = 'e-resize'; // <html>
        setMousePositionOn((position={}) => {
            let { left=0, top=0, } = position;

            //left -= Number(String(this.elements.contents.style.left).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')); // 현재 팝업의 left 값
            //left -= resize_domain; // resize 버튼 크기
            if(0 <= left && this.settings.min.width <= left) {
                window.localStorage.setItem(['modal', this.settings.key, 'width'].join(''), left);
                this.elements.contents.style.width = left + 'px';
            }
        });
        setMousePositionOff();
    });
    $(this.elements.bottom_resize).on(`${browser.event['down']}.${EVENT_MOUSEDOWN_POPUP_STORY_RESIZE_BOTTOM}`, (e) => {
        let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
        //let touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
        let touch = event.touches; // touchstart

        event.preventDefault();
        event.stopPropagation();

        // 초기화
        $(window).off(`.${EVENT_MOUSEMOVE_POPUP_STORY_RESIZE}`);
        $(window).off(`.${EVENT_MOUSEUP_POPUP_STORY_RESIZE}`);

        // 멀티터치 방지
        if(touch && touch.length && 1 < touch.length) {
            return;
        }

        document.documentElement.style.cursor = 's-resize'; // <html>
        setMousePositionOn((position={}) => {
            let { left=0, top=0, } = position;

            //top -= Number(String(this.elements.contents.style.top).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')); // 현재 팝업의 top 값
            //top -= resize_domain; // resize 버튼 크기
            if(0 <= top && this.settings.min.height <= top) {
                window.localStorage.setItem(['modal', this.settings.key, 'height'].join(''), top);
                this.elements.contents.style.height = top + 'px';
                //this.elements.main.style.height = (Number(String(this.elements.contents.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(this.elements.contents.style.borderTopWidth).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(this.elements.contents.style.borderBottomWidth).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(this.elements.header.style.height)).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5'))) + 'px';
                this.elements.main.style.height = (Number(String(this.elements.contents.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(this.elements.header.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5'))) + 'px';
            }
        });
        setMousePositionOff();
    });
    $(this.elements.right_bottom_resize).on(`${browser.event['down']}.${EVENT_MOUSEDOWN_POPUP_STORY_RESIZE_RIGHTBOTTOM}`, (e) => {
        let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
        //let touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
        let touch = event.touches; // touchstart

        event.preventDefault();
        event.stopPropagation();

        // 초기화
        $(window).off(`.${EVENT_MOUSEMOVE_POPUP_STORY_RESIZE}`);
        $(window).off(`.${EVENT_MOUSEUP_POPUP_STORY_RESIZE}`);

        // 멀티터치 방지
        if(touch && touch.length && 1 < touch.length) {
            return;
        }

        document.documentElement.style.cursor = 'se-resize'; // <html>
        setMousePositionOn((position={}) => {
            let { left=0, top=0, } = position;

            //left -= Number(String(this.elements.contents.style.left).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')); // 현재 팝업의 left 값
            //left -= resize_domain;
            if(0 <= left && this.settings.min.width <= left) {
                window.localStorage.setItem(['modal', this.settings.key, 'width'].join(''), left);
                this.elements.contents.style.width = left + 'px';
            }
            //top -= Number(String(this.elements.contents.style.top).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')); // 현재 팝업의 top 값
            //top -= resize_domain;
            if(0 <= top && this.settings.min.height <= top) {
                window.localStorage.setItem(['modal', this.settings.key, 'height'].join(''), top);
                this.elements.contents.style.height = top + 'px';
                //this.elements.iframe.height = Number(String(this.elements.contents.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(this.elements.header.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5'));
                //this.elements.main.style.height = (Number(String(this.elements.contents.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(this.elements.contents.style.borderTopWidth).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(this.elements.contents.style.borderBottomWidth).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(this.elements.header.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5'))) + 'px';
                this.elements.main.style.height = (Number(String(this.elements.contents.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(this.elements.header.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5'))) + 'px';
            }
        });
        setMousePositionOff();
    });
}