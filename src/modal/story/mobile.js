/**
 * 
 */
import browser, { windowDocumentSize, browserScroll, } from '../browser';
import $ from '../dom';
import { getKey, extend, elementPosition, } from '../util';
import ModalState, { modalState } from "./ModalState";

const EVENT_MOUSEDOWN_POPUP_STORY_REFRESH = 'EVENT_MOUSEDOWN_POPUP_STORY_REFRESH';
const EVENT_MOUSEDOWN_POPUP_STORY_HIDDEN = 'EVENT_MOUSEDOWN_POPUP_STORY_HIDDEN';
const EVENT_MOUSEDOWN_POPUP_STORY_CLOSE = 'EVENT_MOUSEDOWN_POPUP_STORY_CLOSE';

export default function() {
    // contents
    /*
    -
    // 팝업 타이틀, 제어 버튼 등 toolkit (모바일에서는 하단에 적용)
    -
    // iframe 은 상위 element의 고정된 height 픽셀값이 있어야 정확한 height="100%" 가 적용된다.
    // 그러므로 iframe 를 감싸는 main(div) 를 만든다.
    this.elements.main.style.boxSizing = this.elements.main.style.mozBoxSizing = this.elements.main.style.webkitBoxSizing = 'border-box';
    */
    this.elements.contents = document.createElement('section');
    this.elements.contents.style.cssText = 'position: fixed; outline: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;'; // 모바일은 전체화면으로 출력
    this.elements.contents.innerHTML = `
        <!-- main //-->
        <div id="${this.key.main}" style="clear: both; width: 100%; box-sizing: border-box; height: 382px;">
            <iframe id="${this.key.iframe}" src="" srcdoc="" width="100%" height="100%" style="margin: 0px; padding: 0px; pointer-events: auto; background-color: rgba(245, 246, 247, .86); border: 0; box-sizing: border-box;"></iframe>
        </div>
        <!-- header //-->
        <header id="${this.key.header}" style="position: fixed; bottom: 5px; right: 5px; box-sizing: border-box;">
            <!-- progressbar //-->
            <div id="${this.key.progress}" style="position: absolute; top: -4px; width: 100%;">
                <div id="${this.key.bar}" style="background-color: rgba(231, 68, 78, .86); width: 0%; height: 3px; border-radius: 1px; display: none;"></div>
            </div>
            <!-- button //-->
            <div id="${this.key.button_group}" style="background-color: rgba(44, 45, 46, .86); box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, 0.1); border-radius: 3px;">
                <button id="${this.key.button_refresh}" style="width: 40px; height: 40px; background-image: url(&quot;//${window.location.host}/images/popup-buttons-40.png&quot;); background-position: 0px 0px; background-repeat: no-repeat;"></button>
                <button id="${this.key.button_hidden}" style="width: 40px; height: 40px; background-image: url(&quot;//${window.location.host}/images/popup-buttons-40.png&quot;); background-position: -40px 0px; background-repeat: no-repeat;"></button>
                <button id="${this.key.button_close}" style="width: 40px; height: 40px; background-image: url(&quot;//${window.location.host}/images/popup-buttons-40.png&quot;); background-position: -80px 0px; background-repeat: no-repeat;"></button>
            </div>
        </header>
    `;
    this.elements.story.appendChild(this.elements.contents);

    // search element
    this.elements.header = this.elements.contents.querySelector(`#${this.key.header}`);
    this.elements.progress = this.elements.contents.querySelector(`#${this.key.progress}`);
    this.elements.bar = this.elements.contents.querySelector(`#${this.key.bar}`);
    this.elements.main = this.elements.contents.querySelector(`#${this.key.main}`);
    this.elements.iframe = this.elements.contents.querySelector(`#${this.key.iframe}`);
    this.elements.button_group = this.elements.contents.querySelector(`#${this.key.button_group}`);
    this.elements.button_refresh = this.elements.contents.querySelector(`#${this.key.button_refresh}`);
    this.elements.button_hidden = this.elements.contents.querySelector(`#${this.key.button_hidden}`);
    this.elements.button_close = this.elements.contents.querySelector(`#${this.key.button_close}`);

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
    $(this.elements.button_refresh).on(`${browser.event['down']}.${EVENT_MOUSEDOWN_POPUP_STORY_REFRESH}`, (e) => { // 새로고침
        var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
        //var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
        var touch = event.touches; // touchstart

        event.preventDefault();
        event.stopPropagation();

        this.imports.call(this);
    });
    $(this.elements.button_hidden).on(`${browser.event['down']}.${EVENT_MOUSEDOWN_POPUP_STORY_HIDDEN}`, (e) => { // 팝업 숨기기
        var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
        //var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
        var touch = event.touches; // touchstart

        event.preventDefault();
        event.stopPropagation();

        //this.elements.contents.style.display = 'none';
        this.hide();
    });
    $(this.elements.button_close).on(`${browser.event['down']}.${EVENT_MOUSEDOWN_POPUP_STORY_CLOSE}`, (e) => { // 팝업 닫기 (element 삭제)
        var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
        //var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
        var touch = event.touches; // touchstart

        event.preventDefault();
        event.stopPropagation();

        //this.elements.contents.style.display = 'none';
        this.remove();
    });
}