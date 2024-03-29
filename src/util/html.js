/**
 * HTML
 */


// fragment 에 html 삽입 후 반환
export const fragmentHtml = (html='') => {
	// Source: https://github.com/Alhadis/Snippets/blob/master/js/polyfills/IE8-child-elements.js
	/*if(!("firstElementChild" in document.documentElement)) {
		Object.defineProperty(Element.prototype, "firstElementChild", {
			get = () {
				for(var nodes = this.children, n, i = 0, l = nodes.length; i < l; ++i) {
					if(n = nodes[i], 1 === n.nodeType) {
						return n;
					}
				}
				return null;
			}
		});
	}*/

	let fragment = document.createDocumentFragment(); // fragment 가 document에 렌더링(삽입)되기 전에, 셀렉터로 fragment 내부 element 검색이 가능하다.
	let temp;
	let child;
	/*
	temp = document.createElement('template'); // IE 미지원
	temp.innerHTML = html;
	fragment.appendChild(temp.content);
	*/
	temp = document.createElement('div');
	temp.innerHTML = html;
	while(child = temp.firstChild) { // temp.firstElementChild (textnode 제외)
		fragment.appendChild(child);
	}

	return fragment;
}

// parseHTML
// IE9이상 사용가능
// parseHTML(htmlString);
export const parseHTML = (html='') => {
	let temp;
	//let childNodes = [];
	/*
	temp = document.createElement('div');
	childNodes = [];
	temp.innerHtml = html;
	childNodes = temp.childNodes;
	*/
	temp = document.implementation.createHTMLDocument();
	temp.body.innerHTML = html;
	return temp.body.children;
}

// Remove HTML from a string
export const stripHTML = (source) => {
	/*
	if(source && typeof source === 'string') {
		return source.replace(/(<([^>]+)>)/ig, "");
	}else {
		return source;
	}
	*/
	// 클라이언트 전용
	/*const fragment = document.createDocumentFragment();
	const element = document.createElement('div');
	fragment.appendChild(element);
	element.innerHTML = source;
	return fragment.firstChild.innerText;*/
	/*let element = document.createElement("div");
	element.innerHTML = source;
	return element.textContent || element.innerText || "";*/
	// NodeJS 에서도 사용가능
	return source.replace(/<[^>]*>?/gm, '');
}

// 특정 태그 삭제
export const stripTag = (tag, source) => {
	//const pattern = /<style[^>]*>((\n|\r|.)*?)<\/style>/gim;
	const pattern = new RegExp('<' + tag + '[^>]*>((\n|\r|.)*?)</' + tag + '>', 'gim');
    return (source || '').replace(pattern, '');
}

// 개행문자 줄바꿈 <br /> 변경
// text = text.replace(/(?:\r\n|\r|\n)/g, '<br />');
export const lineAlignment = (text='', max=2) => {
	let arr = [];
	if(text && typeof text === 'string') {
		arr = text.split('\n');
		if(0 < max && max < arr.length) {
			arr = arr.slice(0, max);
		}
		//text.replace(/(\r\n|\n|\r)/g, '<br />');
		return arr.join('<br />');
	}else {
		return text;
	}
}

// Transform the given string into HTML Entity string.
export function encodeHTMLEntity(html) {
	let entities = {
	  '"': 'quot',
	  '&': 'amp',
	  '<': 'lt',
	  '>': 'gt',
	  '\'': '#39'
	};
  
	return html.replace(/[<>&"']/g, function(m0) {
	  return entities[m0] ? '&' + entities[m0] + ';' : m0;
	});
}
export function decodeHTMLEntity(htmlEntity) {
	let entities = {
	  '&quot;': '"',
	  '&amp;': '&',
	  '&lt;': '<',
	  '&gt;': '>',
	  '&#39;': '\'',
	  '&nbsp;': ' '
	};
  
	return htmlEntity.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;/g, function(m0) {
	  return entities[m0] ? entities[m0] : m0;
	});
}