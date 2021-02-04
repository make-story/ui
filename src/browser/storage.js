/**
 * BOM localStorage, sessionStorage (쿠키 추가 예정)
 * IE8이상 사용가능 (폴리필: https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage)
 */
export default {
	clear(type="") {
		switch(type) {
			case 'local':
				window.localStorage.clear();
				break;
			case 'session':
				window.sessionStorage.clear();
				break;
		}
	},
	length(type="") {
		let count = 0;

		switch(type) {
			case 'local':
				count = window.localStorage.length;
				break;
			case 'session':
				count = window.sessionStorage.length;
				break;
		}

		return count;
	},
	get(type="", key="") {
		let item = '';
		
		if(!key || !this.length(type)) {
			return;
		}
		switch(type) {
			case 'local':
				item = window.localStorage.getItem(key); // return type string
				break;
			case 'session':
				item = window.sessionStorage.getItem(key); // return type string
				break;
		}
		item = (typeof item === 'string' && /^{.*}$|^\[.*\]$/.test(item)) ? JSON.parse(item) : item;

		return item;
	},
	set(type="", key="", item) {
		if(!key) {
			return;
		}
		item = (item && typeof item === 'object' && Object.keys(item).length > 0) ? JSON.stringify(item) : (item || '');
		switch(type) {
			case 'local':
				window.localStorage.setItem(key, item);
				break;
			case 'session':
			default:
				window.sessionStorage.setItem(key, item);
				break;
		}
	},
	del(type="", key="") {
		if(!key) {
			return;
		} 
		switch(type) {
			case 'local':
				window.localStorage.removeItem(key);
				break;
			case 'session':
			default:
				window.sessionStorage.removeItem(key);
				break;
		}
	},
};