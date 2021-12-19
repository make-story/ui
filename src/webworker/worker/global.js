/**
 * 공통 전역변수
 */
/*
-
global 변수: self

-
사용가능한 기능
https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope
navigator 객체
location 객체(읽기전용)
XMLHttpRequest 함수
Base64 ASCII와 2진 데이터 간의 상호 변환을 위한 atob() 및 btoa() 함수
setTimeout() / clearTimeout() 및 setInterval() / clearInterval()
dump()
애플리케이션 캐시
importScripts() 메서드를 사용하는 외부 스크립트
기타 웹워커 생성
new URL
*/
importScripts('//github.com/make-story/ui.git/src/webworker/worker/xhrSimple.js');

self.isGlobalModule = true; // global import 확인용도

const isTestMode = (new URL(self.location.href).searchParams.get('test') === 'true'); // worker 호출할 때, url (.js 파일) 파라미터 값 확인
const network = navigator && 'onLine' in navigator ? navigator.onLine : true; // 통신연결 (온라인: true, 오프라인: false)
const server = '//' + self.location.host; // 특정 서버로 연결(포트, 호스트 등 변경 또는 테스트시)
const regexp = { // 정규식
	//main_grid: /ysm/i, // main grid 키
	main_grid: new RegExp(initialGridKey, "i"),
	tag: /<(\w+)[^>]*>/,
	num_unit: /^([0-9]+)(\D+)$/i, // 단위
	text: /^(\D+)$/i, // 텍스트
	num: /^[+-]?\d+(\.\d+)?$/, // 숫자
	trim: /(^\s*)|(\s*$)/g // 양쪽 여백
};

console.log('isTestMode', isTestMode);