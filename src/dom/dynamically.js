/**
 * 동적 추가
 */

const queue = []; // 대기
const uninitialized = []; // 실패
const complete = []; // 성공

// 배열 특정 item 제거
const setListRemoveItem = (list, key, value) => {
    let index = 0;
    while (index < list.length) {
        if (list[index][key] === value) {
            // 배열에서 제거
            list.splice(index, 1);
        } else {
            ++index;
        }
    }
    return list;
};

// document에 존재하는 script element 리스트
const getScript = function() {
    const elements = document.getElementsByTagName('script');
    //const elements = document.scripts;
    const scripts = [];
    let src;
    if(elements && typeof elements === 'object') {
        for(let i=elements.length-1; i>=0; i-=1) {
            if(typeof elements[i].src !== 'undefined' && elements[i].src !== '') {
                //src = elements[i].src; // 상대경로가 자동 절대경로로 변경
                src = elements[i].getAttribute('src');
                scripts.push(src);
            }
        }
    }

    return scripts;
};

// script element 생성
const setScriptCreate = function(attributes) {
    //const element = config.xhtml ? document.createElementNS('http://www.w3.org/1999/xhtml', 'html:script') : document.createElement('script'); // 참고
    const element = document.createElement("script");
    element.type = 'text/javascript';

    if(!options || typeof options !== 'object') {
        options = {};
    }
    if(attributes && typeof attributes === 'object') {
        for(let key in attributes) {
            element.setAttribute(key, attributes[key]);
        }
    }
    
    return element;
};

// element 를 head 에 추가
const setScriptAppend = function(element, options) {
    const head = document.getElementsByTagName('head')[0]; 
    const base = document.getElementsByTagName('base')[0];

    if(base) {
        head = base.parentNode;
        head.insertBefore(element, base);
    }else {
        head.appendChild(element);
    }

    return element;
};

const setScriptLoad = (src='') => {
    // complete 또는 uninitialized 배열에 이미 존재하는지 확인
    if(uninitialized.includes(src)) {
        return new Promise((resolve, reject) => reject());
    }else if(complete.includes(src)) {
        return new Promise((resolve, reject) => resolve());
    }
    
    // 신규 element 생성
    const promise = new Promise((resolve, reject) => queue.push({ src, resolve, reject }));
    const element = setScriptAppend(setScriptCreate({ src }));
    //element.src = src;
    //setScriptAppend(element);
    const handlers = function(event) {
        const list = queue.filter(item => item.src === src);
        console.log(element.readyState);
        if(event.type === 'error') { // 실패
            // uninitialized
            !uninitialized.includes(src) && uninitialized.push(src);
            list.forEach(item => item.reject(event));
        }else if(event.type === 'load') { // 성공
            // complete
            !complete.includes(src) && complete.push(src);
            list.forEach(item => item.resolve(event));
        }
        setListRemoveItem(queue, 'src', src);
    };
    element.addEventListener('readystatechange', handlers, false);
    element.addEventListener('error', handlers, false);
    element.addEventListener('load', handlers, false);

    return promise;
};

setScriptAppend(setScriptLoad('test.js'));