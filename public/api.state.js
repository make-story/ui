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
var state = api.state();

// key 로 설정된 event.action 값이 true 로 설정될 경우, handler 실행 
state.on({
	'key': 'event.action', // .(마침표) 프로퍼티 깊이가 된다.
	'value': true, // 해당 key의 value 값에 따라 handler 실행된다. 
	'handler': function() {
		that.setBlockMoveOn();
	}
});
state.get('event.action');
state.set({'key': 'event.action', 'value': true});
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
				var key = parameter['key'] || '';
				var value = parameter['value'];
				var is = 'value' in parameter;

				var arr = [];
				var i, max;
				var result = storage; // get / set 에 따라 반환값이 다를 수 있다.

				// eval 사용 고려 (속도문제)
				
				
				// 프로퍼티 분리
				arr = key.split('.');

				// 네임스페이스 확인
				for(i=0, max=arr.length-1; i<max; i++) {
					if(typeof result[arr[i]] === 'object') {
						result = result[arr[i]];
					}/*else if(is) { // set (값 설정모드)
						result = result[arr[i]] = {};
					}*/else {
						result = result[arr[i]] = {};
					}
				}

				// 마지막 프로퍼티값 확인 (네임스페이스의 마지막)
				if(is) { // set (값 설정모드)
					result = result[arr[i]] = value;
				}else if(arr[i] in result) { // get (값 반환모드)
					if(result[arr[i]] && typeof result[arr[i]] === 'object' && (Array.isArray(result[arr[i]]) || /^{.*}$/.test(JSON.stringify(result[arr[i]])))) {
						// 값복사 
						// 오브젝트 타입을 반환할 때 사용자가 프로퍼티값을 수동으로 변경하지 못하도록 하기 위함. 
						// 수동으로 변경할 경우 콜백작동이 안함
						result = JSON.parse(JSON.stringify(result[arr[i]]));
					}else {
						result = result[arr[i]];
					}
				}else { // initialize (값 초기화)
					result = result[arr[i]] = undefined;
				}

				return result;
			};
			
			return {
				// 값 반환
				get: function(key) {
					return property({'key': key});
				},
				// 값 설정
				set: function(parameter) {
					var parameter = parameter || {};
					var key = parameter['key'] || '';
					var value = parameter['value']; // 값 타입이 여러개가 올 수 있다.
					var index;
					var i, max;
					
					property({'key': key, 'value': value});

					// handler 실행
					if(key in dictionary) {
						for(i=0, max=dictionary[key].length; i<max; i++) {
							if(dictionary[key][i]['value'] === value) {
								for(index in dictionary[key][i]['handler']) {
									dictionary[key][i]['handler'][index].call(this, value);
								}
								break;
							}
						}
					}
				},
				// 이벤트 설정
				on: function(parameter) {
					var parameter = parameter || {};
					var key = parameter['key']; // namespace
					var value = parameter['value']; // value
					var index = value && JSON.stringify(value) || 'api.state';
					var handler = typeof parameter['handler'] === 'function' ? parameter['handler'] : function() {};

					var i, max;
					var is = false;
					var tmp;

					if(!key) {
						return false;
					}

					// handler 설정
					if(!dictionary[key]) {
						dictionary[key] = [];
					}
					for(i=0, max=dictionary[key].length; i<max; i++) { 
						// 기존 value 에 해당되는 콜백이 있는지 확인하여 설정 (기존 이벤트 변경)
						if(dictionary[key][i]['value'] === value) {
							dictionary[key][i]['handler'][index] = handler;
							is = true;
							break;
						}
					}
					if(is === false) {
						// 기존 value에 해당하는 콜백이 하나도 없으면 새로 설정
						dictionary[key].push((function() {
							var tmp = {'value': value, 'handler': {}};
							tmp['handler'][index] = handler;
							return tmp;
						})());
					}
				},
				// 이벤트 해제
				off: function(parameter) {
					var parameter = parameter || {};
					var key = parameter['key'] || ''; // namespace
					var value = parameter['value'] || '';
					var index = value && JSON.stringify(value) || '';
					var i, max;
					var is = false;

					if(key in dictionary) {
						if(index) {
							// 해당 콜백 value에 따른 선택 제거
							for(i=0, max=dictionary[key].length; i<max; i++) {
								if(index in dictionary[key][i]['handler']) {
									is = delete dictionary[key][i]['handler'][index];
									break;
								}
							}
						}else {
							// 해당 콜백 전체 제거
							is = delete dictionary[key];
						}
					}

					return is;
				}
			};
		})();
	};

})(this);