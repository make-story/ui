/**
 * CSS
 */
/*
-
일반적인 CSS 문제처리
https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Cross_browser_testing/HTML_and_CSS
https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Cross_browser_testing/Introduction


-
접두사
> Mozilla 사용 
	-moz-
> Chrome / Opera / Safari 사용 
	-webkit-
> Microsoft는 
	-ms-
*/

// 반응형 계산
export const sizePercent = (target, content) => {
	// 공식 : target / content = result
	// 예제 : 60(구하고자하는 크기) / 320(기준) = 0.1875 -> 18.75%
	// 예제 : 10 / 320 = 0.03125 -> 3.125
	target = Number(t);
	content = Number(content);
	return (target / content) * 100;
}


// css 
// IE10 이상
export const matchMedia = (mediaQueryString) => {
	//window.matchMedia("(max-width: 570px)");
	return window.matchMedia(mediaQueryString).matches; // true / false
}