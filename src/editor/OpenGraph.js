/**
 * 오픈그래프
 * 
 * [주의!]
 * super 키워드는 부모 constructor 호출과 부모 메소드 호출할 경우 사용
 */
import browser from '../browser';
import $ from '../dom';
import {
	getKey,
	setSettings,
	getDisplay,
	getParent,
	getNodeInfo,
	isNodeCheck,
} from './util';
import EditState, { editState } from './EditState';

const EVENT_KEYDOWN_OPENGRAPH = 'EVENT_KEYDOWN_OPENGRAPH';

export default class OpenGraph {
	constructor(target=null, settings={}) {
		//super();
		this.settings = {
			'key': 'editor', 
			'submit': '//makestory.net/opengraph', // link url 정보를 받아 meta 정보를 돌려줄 서버측 url
			'classes': {
				'wrap': 'opengraph-wrap',
				'image': 'opengraph-image',
				'text': 'opengraph-text',
				'title': 'opengraph-title',
				'description': 'opengraph-description',
				'author': 'opengraph-author'
			},
			'listeners': {
				'initialize': null
			}
		};
		this.elements = {
			'target': null,
		};
		
		// settings
		this.setSettings(target, settings);
	}

	setSettings(target=null, settings={}) {
		// settings
		this.settings = setSettings(this.settings, settings);

		// target
		target = (typeof target === 'string' && /^[a-z]+/i.test(target) ? `#${target}` : target);
		this.elements.target = (typeof target === 'object' && target.nodeType ? target : $(target).get(0));
	}

	put({ node, url='', }={}) { // 오픈그래프 삽입
		let fragment;
		let a, div, p, comment;
		let temp;
		let inserted;

		if(node && typeof node === 'object' && node.nodeType && (url && regexp.url.test(url) || isNodeCheck(node, 'url'))) {
			url = url || node.nodeValue;
			//console.log('url: ' + url);

			// url text 를 a 링크로 변경
			//paragraph = node.nodeValue.split(/\s+/); // 띄어쓰기 기준 문단 분리

			//console.log(node);
			if(!url.match("^(http|https)://")) {
				url = `http://${url}`;
			}

			// 링크 구성 (새창 등 속성 설정)
			//let comment = document.createComment('{"url":"'.url.'"}');
			a = document.createElement("a");
			a.href = url;
			a.target = '_blank';
			a.textContent = a.innerText = url;
			if(temp = node.parentNode.insertBefore(a, node)) {
				node.parentNode.removeChild(node);
				node = temp;
			}else {
				return false;
			}

			// 링크 정보 구성
			fragment = document.createDocumentFragment();
			div = document.createElement("div");
			p = document.createElement("p");
			fragment.appendChild(div);
			fragment.appendChild(p);
			div.setAttribute("data-edit", "opengraph");
			div.setAttribute("data-value", JSON.stringify({}));
			div.storage = {
				'edit': 'opengraph'
			};

			// 빈공간, 하단영역 태그 내부 기본값 (크롬 등 일부 브라우저)
			div.innerHTML = '<br />';
			p.innerHTML = '<br />';

			// insertAdjacentHTML
			//node.parentNode.replaceChild(fragment, node);
			inserted = getParent(
				node,
				null,
				(node) => { // condition (검사)						
					if(!this.elements.target.contains(node) || this.elements.target.isEqualNode(node)) {
						return node;
					}else if(node.parentNode && (node.parentNode.isEqualNode(this.elements.target) || (node.parentNode.nodeType === 1 && node.parentNode.nodeName.toLowerCase() !== 'p' && /block|inline-block/i.test(getDisplay(node.parentNode))))) {
						return node;
					}
				}, 
				(node, result) => { // callback (검사결과가 true의 경우)
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
				// 포커스(커서) 이동
				editState.setCusor(p);

				// 오픈그래프 정보 불러오기
				(() => {
					const success = (data) => {
						let result = {}
						let image = '';
						if(typeof data === 'object' && data.status === 'success') {
							//console.dir(data);
							//console.log(div);
							result = data.result;
							if(result.image) {
								image = `<div class="${this.settings.classes.image}" style="background-image: url(${(result.image).replace(/(<([^>]+)>)/ig,"")});"><br /></div>`;
							}else {
								image = `<div class="${this.settings.classes.image}"></div>`;
							}
							div.innerHTML = `
								<a href="${url}" target="_blank" class="opengraph-wrap" style="display: block;">
									${image}
									<div class="${this.settings.classes.text}">
										<strong class="${this.settings.classes.title}">${(result.title || '').replace(/(<([^>]+)>)/ig,"")}</strong>
										<p class="${this.settings.classes.description}">${(result.description || '').replace(/(<([^>]+)>)/ig,"")}</p>
										<p class="${this.settings.classes.author}">${(result.author || url).replace(/(<([^>]+)>)/ig,"")}</p>
									</div>
									<div style="clear: both;"></div>
								</a>
							`;
						}else {
							// 제거
							div.parentNode.removeChild(div);
							p.parentNode.removeChild(p);
						}
					};
					const error = (event) => {
						console.log(event);
						// 제거
						div.parentNode.removeChild(div);
						p.parentNode.removeChild(p);
					};

					// XMLHttpRequest
					const xhr = new XMLHttpRequest();

					// 요청
					xhr.open('GET', [(this.settings.submit.lastIndexOf('?') > -1 ? `&` : `?`), `url=${encodeURIComponent(url)}`].join(''), true);
					xhr.setRequestHeader('Accept', '*/*');
					xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest'); // X-Requested-With 헤더는, 해당 요청이 Ajax라는 걸 의미 (비표준)
					//xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
					xhr.timeout = 10000;
					xhr.responseType = 'text';

					// 업로드와 다운로드 진행율을 계산하는 콜백 함수를 단계적 응답 이벤트에 설정
					xhr.upload.onprogress = (event) => {

					};
					xhr.onprogress = (event) => {
						let total = event.total || 0;
						let loaded = event.loaded || 0;
						console.log(Number((100 / total) * loaded).toFixed(2));
					};

					// 받는중
					xhr.onreadystatechange = () => {
						switch(xhr.readyState) {
							case 0: // 객체만 생성되고 아직 초기화되지 않은 상태(open 메소드가 호출되지 않음)
								
								break;
							case 1: // open 메소드가 호출되고 아직 send 메소드가 불리지 않은 상태
							case 2: // send 메소드가 불렸지만 status와 헤더는 도착하지 않은 상태
								// 연결 진행
								break;
							case 3: // 데이터의 일부를 받은 상태
								
								break;
							case 4: // 데이터를 전부 받은 상태
								// xhr.status
								// 403(접근거부), 404(페이지없음), 500(서버오류발생)
								break;
						}
					};

					// 완료
					xhr.onload = (event) => { 
						let data;
						if(xhr.status == 200) {
							data = xhr.response || xhr.responseText || xhr.responseXML; // XMLHttpRequest Level 2
							if(typeof data === 'string') {
								try {
									data = JSON.parse(data);
									typeof data === 'object' && success(data);
								}catch(e) {
									error(e);
								}
							}
						}
					};

					// 에러
					xhr.ontimeout = function(event) {
						error(event);
					};
					xhr.onerror = function(event) {
						error(event);
					};

					// 전송
					try {
						xhr.send(null);
					}catch(e) {}

					// 취소
					//xhr.abort();
				})();
			}
		}
	}
	
	on() {
		// reset
		this.off();

		// contentEditable
		//console.log(this.elements.target);
		//console.log(this.elements.target.contentEditable);
		//console.log(this.elements.target.isContentEditable);
		if(!this.elements.target.isContentEditable) {
			this.elements.target.contentEditable = true; // 해당 element 내부 수정가능하도록 설정
		}

		// 키보드 이벤트
		$(this.elements.target).on(`keydown.${EVENT_KEYDOWN_OPENGRAPH}`, (e) => {
			let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event

			editState.setSelection();
			if(editState.isCollapsed()) {
				if(event.keyCode === 13 && isNodeCheck(editState.selection.anchorNode, 'url')) { // keyCode 13: enter
					// url 이 존재하면, event 를 정지한다.
					event.preventDefault();
					/*
					console.log(last);
					console.log(editState.selection.anchorNode);
					console.log(editState.selection.anchorNode.nodeType);
					console.log(editState.selection.anchorNode.nodeValue);
					console.log(editState.selection.focusNode.nodeValue);
					*/
					// 삽입
					this.put({'node': editState.selection.anchorNode});
				}else if(event.keyCode === 8 && isNodeCheck(editState.selection.focusNode, 'opengraph')) { // keyCode 8: backspace
					// 상위로 전파 중지
					event.preventDefault();
					/*
					console.log(editState.selection.focusNode);
					console.log(editState.selection.focusNode.parentNode);
					*/
					// 삭제
					editState.selection.focusNode.parentNode.removeChild(editState.selection.focusNode);
				}
			}
		});
	}

	off() {
		// event
		$(this.elements.target).off(`.${EVENT_KEYDOWN_OPENGRAPH}`);
	}
}