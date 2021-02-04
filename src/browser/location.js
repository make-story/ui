/**
 * Location (URL)
 */
/*
// hashchange 이벤트 (url 변경에 따른 location.href 기준 history 재설정)
window.onhashchange = function(event) {
	if(typeof event === 'object') {
		console.log('event', event);
		console.log('oldURL', event.oldURL);
		console.log('newURL', event.newURL);
	}
};
*/
export default {
	// hash
	// 해쉬값 형태를 '#/a/b/' path 형태로 할 것인가, '#{a:'',b:''} json 형태로 할 것인가 구분..
	/*
	(function(){
		let lastURL = document.URL;
		window.addEventListener("hashchange", function(event) {
			Object.defineProperty(event, "oldURL", {enumerable:true,configurable:true,value:lastURL});
			Object.defineProperty(event, "newURL", {enumerable:true,configurable:true,value:document.URL});
			lastURL = document.URL;
		});
	})();
	*/
	hash: {
		// 해쉬값 불러오기 
		get(key) {
			let hash = window.location.hash;
			let tmp;
			let criteria = {};
			let result;

			if(!hash) {
				hash = window.location.href.replace(/^[^#]*#?(.*)$/, '$1');
			}
			
			//console.log('hash', hash);
			if(hash) {
				// '#' 제거
				hash = hash.replace('#', '');
				
				// hash 에서 json 형태 추출 
				tmp = /([{|%7B].*[}|%7D])/.exec(hash);
				if(tmp && tmp[0]) {
					hash = tmp[0];
				}

				try {
					criteria = JSON.parse(decodeURIComponent(hash));
				}catch(error) {}
				
				//console.log('criteria', criteria);
				if(typeof criteria === 'object' && criteria !== null) {
					if(!key) {
						result = criteria;
					}else if(key in criteria) {
						result = criteria[key];
					}
				}
			}

			return result;
		},
		// 해쉬값 추가 
		// 웹킷엔진은 location.hash -> location.href 값 
		set(key, value) {
			let criteria = this.get() || {};
			let state = history.state && typeof history.state === 'object' ? JSON.parse(JSON.stringify(history.state))/* json deep copy, 함수불가능 */ : {}; // state: Read only

			//console.log('set', criteria);
			if(key) {
				if(typeof criteria === 'object' && criteria !== null) {
					criteria[key] = value; // 기존 key 데이터가 있었다면, 덮어쓰기가 된다. 
					value = encodeURIComponent(JSON.stringify(criteria));
				}else {
					value = encodeURIComponent('{"' + key + '":"' + value + '"}');
				}

				if(value) {
					window.location.hash = '#' + value;
					//window.location.href = '#' + value;
					if(typeof history.replaceState === 'function') { // IE10 이상지원 (popstate 이벤트가 발생할 수 있도록 replaceState 실행)
						history.replaceState(state, "", location.href); // IE에서는 세번째 파라미터값 필수 (세번째 파라미터 값으로 브라우저 URL변경됨)
					}
				}
			}
		},
		// 해쉬 제거 
		del(key) {
			let criteria = this.get() || {};
			let state = history.state && typeof history.state === 'object' ? JSON.parse(JSON.stringify(history.state))/* json deep copy, 함수불가능 */ : {}; // state: Read only (URL변경전 history 값)
			let value;

			//console.log('del', criteria);
			if(key && typeof criteria === 'object' && criteria !== null && key in criteria) {
				delete criteria[key]; // key 에 따른 데이터 제거 
				value = encodeURIComponent(JSON.stringify(criteria));

				if(value) {
					window.location.hash = '#' + value;
					//window.location.href = '#' + value;
					if(typeof history.replaceState === 'function') { // IE10 이상지원 (popstate 이벤트가 발생할 수 있도록 replaceState 실행)
						history.replaceState(state, "", location.href); // IE에서는 세번째 파라미터값 필수 (세번째 파라미터 값으로 브라우저 URL변경됨)
					}
				}
			}
		},
		// 해쉬값 존재여부
		has(key) {
			let criteria = this.get() || {};
			let is = false;

			//console.log('is', criteria);
			if(key && typeof criteria === 'object' && criteria !== null && key in criteria) {
				is = true;
			}
			
			return is;
		},
	},
	// url parameters
	// Location.search
	// https://developer.mozilla.org/ko/docs/Web/API/Location
	params: {
		get(url=window.location.href) {
			// window.location.search
			let queryString = url ? url.split('?')[1] : window.location.search.slice(1);
			let result = {};
			let arr = [];
			let i, max;
			let tmp;
			let index; // 파라미터가 배열형태 a[]=1&a[]=2&b[0]=1&b[1]=a 의 경우 해당 배열 인덱스  
			let key, value; // key=value&key=value
	
			if(queryString) {
				// 해쉬 제거
				queryString = queryString.split('#')[0];
				// & 기준 분리
				arr = queryString.split('&');
				for(i=0, max=arr.length; i<max; i++) {
					tmp = arr[i].split('='); // key, value
					index = '';
	
					// key / value
					key = tmp[0].replace(/\[\d*\]/, function(value) { // arr[]=1&arr[]=2 또는 arr[0]=1&arr[1]=2 등 배열형태 파라미터 
						index = value.slice(1, -1);
						return '';
					});
					key = key.toLowerCase();
					if(tmp[1] && typeof tmp[1] === 'string') {
						value = tmp[1];
						value = value.toLowerCase();
					}else {
						value = true;
					}
	
					if(key in result) { // 동일한 파라미터 키 있음 (파라미터 키 중복으로 존재함)
						if(typeof result[key] === 'string') {
							// 신규 배열 생성 
							result[key] = [result[key]];
						}
						if(!index) {
							// arr[]=1&arr[]=2 형태라면 push 로 순차 추가 
							result[key].push(value);
						}else {
							// index 가 존재하면 해당 index 배열에 추가 
							result[key][index] = value;
						}
					}else {
						result[key] = value;
					}
				}
			}
	
			return result;
		},
		set(key, value) {
			
		},
		del() {

		},
		has() {

		},
	}
};