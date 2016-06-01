/*
State Handler (상태값에 따른 이벤트 실행)

@date (버전관리)
2016.05.02

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

@browser compatibility

-
사용예

*/

;(function(global, undefined) {

	'use strict'; // ES5
	if(typeof global === 'undefined' || global !== window) {
		return false;	
	}else if(!global.api) {
		global.api = {};
	}
	
	global.api.state = function(settings) {
		var settings = settings || {};
		
		return (function() {
			var storage = {}; // 상태값 저장
			var dictionary = { // 상태값 변경에 따른 이벤트 핸들러
				/*
				'ysm.a.b.c': [
					{
						'value': '콜백을 실행시킬 값', 
						'handler': {
							'이벤트 키' : '콜백실행 함수',
							...
						},
						...
					},
					...
				]
				*/
			}; 
			// namespace 해당하는 프로퍼티 (속도가 가장 빨라야하는 부분)
			var property = function(parameter) {
				var parameter = parameter || {};
				var name = parameter['name'] || '';
				var value = parameter['value'];
				var is = 'value' in parameter;

				var arr = [];
				var i, max;
				var parent = storage;

				// eval 사용 고려 (속도문제)
				
				
				// 프로퍼티 분리
				arr = name.split('.');

				// 네임스페이스 확인
				for(i=0, max=arr.length-1; i<max; i++) {
					if(typeof parent[arr[i]] === 'object') {
						parent = parent[arr[i]];
					}/*else if(is) { // set (값 설정모드)
						parent = parent[arr[i]] = {};
					}*/else {
						parent = parent[arr[i]] = {};
					}
				}

				// 마지막 프로퍼티값 확인 (네임스페이스의 마지막)
				if(is) { // set (값 설정모드)
					parent = parent[arr[i]] = value;
				}else if(arr[i] in parent) { // get (값 반환모드)
					if(parent[arr[i]] && typeof parent[arr[i]] === 'object' && (Array.isArray(parent[arr[i]]) || /^{.*}$/.test(JSON.stringify(parent[arr[i]])))) {
						// 값복사 
						// 오브젝트 타입을 반환할 때 사용자가 프로퍼티값을 수동으로 변경하지 못하도록 하기 위함. 
						// 수동으로 변경할 경우 콜백작동이 안함
						parent = JSON.parse(JSON.stringify(parent[arr[i]]));
					}else {
						parent = parent[arr[i]];
					}
				}else { // init (값 초기화)
					parent = parent[arr[i]] = undefined;
				}

				return parent;
			};
			
			return {
				// 값 반환
				get: function(name) {
					return property({'name': name});
				},
				// 값 설정
				set: function(parameter) {
					var parameter = parameter || {};
					var name = parameter['name'] || '';
					var value = parameter['value'];

					var i, max;
					var key;
					property({'name': name, 'value': value});

					// handler 실행
					if(dictionary[name]) {
						for(i=0, max=dictionary[name].length; i<max; i++) {
							if(dictionary[name][i]['value'] === value) {
								for(key in dictionary[name][i]['handler']) {
									dictionary[name][i]['handler'][key].call(this, value);
								}
								break;
							}
						}
					}
				},
				// 이벤트 설정
				on: function(parameter) {
					var parameter = parameter || {};
					var name = parameter['name']; // namespace
					var value = parameter['value']; // value
					var key = parameter['key'] || api.key(); // 이벤트키
					var handler = typeof parameter['handler'] === 'function' ? parameter['handler'] : function() {};

					var i, max;
					var is = false;
					var tmp;

					// handler 설정
					if(!dictionary[name]) {
						dictionary[name] = [];
					}
					for(i=0, max=dictionary[name].length; i<max; i++) { 
						// 기존 value 에 해당되는 콜백이 있는지 확인하여 설정
						if(dictionary[name][i]['value'] === value) {
							dictionary[name][i]['handler'][key] = handler;
							is = true;
							break;
						}
					}
					if(is === false) {
						// 기존 value에 해당하는 콜백이 하나도 없으면 새로 설정
						dictionary[name].push((function() {
							var tmp = {'value': value, 'handler': {}};
							tmp['handler'][key] = handler;
							return tmp;
						})());
					}
				},
				// 이벤트 해제
				off: function(parameter) {
					var parameter = parameter || {};
					var name = parameter['name'] || ''; // namespace
					var key = parameter['key']; // 이벤트키
					var i, max;
					var is = false;

					if(dictionary[name]) {
						if(key && dictionary[name] && key) {
							// 이벤트 키에 해당하는 콜백만 제거
							for(i=0, max=dictionary[name].length; i<max; i++) {
								if(key in dictionary[name][i]['handler']) {
									is = delete dictionary[name][i]['handler'][key];
									break;
								}
							}
						}else if(!key) {
							// 해당 콜백 전체 제거
							is = delete dictionary[name];
						}
					}

					return is;
				}
			};
		})();
	};

})(this);