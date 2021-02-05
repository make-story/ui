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
	const fragment = document.createDocumentFragment();
	const element = document.createElement('div');
	fragment.appendChild(element);
	element.innerHTML = source;
	return fragment.firstChild.innerText;
}