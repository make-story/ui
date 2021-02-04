// settings
export const setSettings = (settings, options) => {
	let key;
	for(key in options) {
		if(!options.hasOwnProperty(key)) {
			continue;
		}else if(options[key] && options[key].constructor === Object && !options[key].nodeType) {
			settings[key] = settings[key] || {};
			settings[key] = setSettings(settings[key], options[key]);
		}else {
			settings[key] = options[key];
		}
	}
	return settings;
}

// key (일반적인 고유값)
export const getKey = () => ['editor', new Date().getTime(), (Math.random() * (1 << 30)).toString(16).replace('.', '')].join('').substr(0, 24);

// css display
export const getDisplay = (element) => {
	let display = '';
	if(typeof element === 'object' && element !== null && element.nodeType) {
		if(element.style.display) { // style로 값을 구할 수 있는 경우
			display = element.style.display;
		}else if(element.currentStyle && element.currentStyle.display) { // IE의 경우
			display = element.currentStyle.display;
		}else if(document.defaultView && document.defaultView.getComputedStyle) {
			if(document.defaultView.getComputedStyle(element, null).getPropertyValue) {
				display = document.defaultView.getComputedStyle(element, null).getPropertyValue('display');
			}
		}
	}
	return display;
}

// 단위 분리
export const numberUnit = (value) => { 
	// [1]: 숫자값
	// [2]: 단위
	return /^([0-9]+)(\D+)$/i.exec(value);
}

// 숫자여부 확인
export const isNumeric = (value) => {
	return !isNaN(parseFloat(value)) && isFinite(value);
}

// 숫자만 추출
export const numberReturn = (value) => { 
	return String(value).replace(/[^+-\.\d]|,/g, '');
}

// 현재 node 상위(parentNode)를 검색하며, condition 결과에 따른 callback 실행
// 상위노드 탐색을 얼마나 줄이느냐가 관건
export const getParent = (current/*노드검색 시작점*/, last/*노드검색 끝점*/, condition/*노드를 확인하며, 참/거짓 리턴을 위한 실행함수*/, callback/*최종 반환값 리턴을 위한 실행함수*/) => {
	let result;
	if(typeof current !== 'object' || current === null || !current.nodeType) {
		return;
	}
	if(typeof last !== 'object' || (last !== null && !last.nodeType)) {
		last = null;
	}
	while(current.parentNode) {
		// 1. condition 실행
		// 리턴값이 true 의 경우, callback 함수 실행
		result = condition(current); 
		if(result) {
			// 2. callback 실행 (return 값이 있을 경우 반환)
			result = callback(current, result);
			if(typeof result !== 'undefined') {
				// 3. callback 리턴값이 있을 경우 break
				return result;
			}
		}
		// 검색 제한
		if(last && (!last.contains(current) || last.isEqualNode(current))) {
			return;
		}
		// 상위 node
		current = current.parentNode;
	}
}

// 노드 정보 
export const getNodeInfo = (node) => {
	let result = {
		'node': null, 
		'type': '', // nodeType
		'name': '', // nodeName
		'edit': '', // code, line, image, swipe, video 등 종류 
		'value': '' // nodeValue || data-value
	};

	if(!node || typeof node !== 'object' || !node.nodeType) {
		return result;
	}
	result.node = node;
	result.type = node.nodeType;
	result.value = node.nodeValue;
	if(typeof node.nodeName === 'string') {
		result.name = node.nodeName.toLowerCase();
	}
	if(node.nodeType === 1) {
		result.edit = node.getAttribute('data-edit');
		if(!result.edit && node.storage && typeof node.storage === 'object' && node.storage.edit) {
			result.edit = node.storage.edit;
		}
		if(result.edit) {
			result.value = node.getAttribute('data-value') || result.value;
		}
	}

	return result;
}

// node 종류 check
export const isNodeCheck = (node, check) => { 
	let edit;
	let is = false;

	if(node && typeof node === 'object' && node.nodeType) {
		edit = typeof node.storage === 'object' && typeof node.storage.edit === 'string' ? node.storage.edit.toLowerCase() : '';
		if(node && node.nodeType === 1 && !edit) {
			edit = node.getAttribute('data-edit');
		}
		switch(check) {
			case 'url':
				if(node.nodeType === 3 && node.parentNode.nodeName.toLowerCase() !== 'a' && node.nodeValue && regexp.url.test(node.nodeValue)) { // nodeType 3: textnode
					is = true;
				}
				break;
			case 'opengraph':
				if(edit === 'opengraph' || (node.nodeType === 3 && typeof node.parentNode.storage === 'object' && node.parentNode.storage.edit === 'opengraph')) { // nodeType 3: textnode
					is = true;	
				}
				break;
		}
	}

	return is;
}