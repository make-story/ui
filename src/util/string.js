/**
 * 문자열
 */

// Replace all occurances of a string in a string
export const replaceAll = (value='', find='', replace='') => {
	return value.replace(new RegExp(find.toString().replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1'), 'g'), replace.toString());
}

// 글자 Byte 수 출력
export const stringByteLength = (value='') => {
	return (typeof value === 'string') ? value.replace(/[\0-\x7f]|([0-\u07ff]|(.))/g,"$&$1$2").length : 0;
}

// length 만큼 문자열 분리 배열 반환 
export const stringSplitLength = (value='', length=5) => {
	return (typeof value === 'string') ? value.match(new RegExp('.{1,' + length + '}', 'g')) : value;
}

// 말줄임
// CSS : 
/*
// 한 줄 자르기 
display: inline-block; 
width: 200px; 
white-space: 
nowrap; overflow: hidden; 
text-overflow: ellipsis; 

// 여러 줄 자르기 추가 스타일 
white-space: normal; 
line-height: 1.2; 
height: 3.6em; 
text-align: left; 
word-wrap: break-word; 
display: -webkit-box; 
-webkit-line-clamp: 3; 
-webkit-box-orient: vertical;
*/
// jQuery : https://github.com/jjenzz/jquery.ellipsis/blob/master/jquery.ellipsis.js
export const stringEllipsis = (value='', length, ellipsis='...') => {
	if(typeof value === 'string' && !isNaN(parseFloat(length)) && isFinite(length) && length < value.length) {
		return value.substr(0, length-2) + ellipsis;
	}else {
		return value;
	}
}