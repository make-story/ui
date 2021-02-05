/**
 * 숫자, 단위 
 */
import regexp from './regexp';

// 숫자 랜덤값
export const numberRandom = (max=1, min=0) => {
	if(min >= max) {
		return max;
	}
	return Math.floor(Math.random() * (max - min) + min);
}

// 단위 분리
export const numberUnit = (value) => { 
	// [1]: 숫자값
	// [2]: 단위
	return /^([0-9]+)(\D+)$/i.exec(value);
}
// 숫자/단위 분리 (예: 10px -> [0]=>10px, [1]=>10, [2]=>'px')
/*export const numberUnit = (value) => {
	//const regexp_source_num = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;
	const regexp_number = new RegExp("^(" + regexp.source_num + ")(.*)$", "i");
	const matches = regexp_number.exec(value);
	return matches ? matches : [value];
}*/

// 숫자여부 확인
export const isNumeric = (value) => {
	return !isNaN(parseFloat(value)) && isFinite(value);
}

// 숫자만 추출
export const numberReturn = (value) => { 
	return isNumeric(value) ?  value : String(value).replace(/[^+-\.\d]|,/g, '');
}

// 금액
export const numberFormat = (value) => {
	value = String(value);
	let reg = /(^[+-]?\d+)(\d{3})/;
	while(reg.test(value)) {
		value = value.replace(reg, '$1' + ',' + '$2');
	}
	/*
	let parts = value.toString().split(".");
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return parts.join(".");
	*/
	return value;
}

// 금액 4단위 한글변환
export const numberMoney = (money) => {
	let won  = (money + "").replace(/,/g, ""); // 콤마제거 
	let unit  = [/*"원",*/"", "만", "억", "조", "경", "해", "자", "양", "구", "간", "정"]; // 금액단위 (4단위)
	let change = ""; // 변환금액 
	let pattern = /(-?[0-9]+)([0-9]{4})/;
	let arr = []; // 4단위 분리 값 
	let count = 0;
	let index = 0;
	let j, i;
	let temp1, temp2;

	while(pattern.test(won)) {
		won = won.replace(pattern, "$1,$2"); // 4단위 분리 ,(콤마) 넣음
	}
	arr = won.split(",");
	count = arr.length; // ,(콤마) 기준 분리 배열크기 
	index = count - 1; 

	// 단위 앞부분부터 확인 반복문 
	for(j=0; j<count; j++) {
		if(unit[index] === undefined) {
			break;
		}
		temp1 = 0;
		for(i=0; i<arr[j].length; i++) {
			temp2 = arr[j].substring(i, i+1);
			temp1 = temp1 + Number(temp2);
		}
		if(temp1 > 0) {
			change += arr[j] + unit[index];
			if(0 < index) { // 원단위 이상의 경우 break
				break;
			}
		}
		index--;
	}

	return change;
}

// 소수점 단위 금액
export const floatFormat = (value) => {
	value = String(value);
	let orgnum = value;
	let arrayOfStrings = [];

	if(value.length > 3) {
		value = value + ".";
	}
	arrayOfStrings = value.split('.');
	value = '' + arrayOfStrings[0];

	if(value.length > 3) {
		let mod = value.length % 3;
		let output = (mod > 0 ? (value.substring(0, mod)) : '');
		for(let i=0; i<Math.floor(value.length / 3); i++) {
			if((mod == 0) && (i == 0)) {
				output += value.substring(mod + 3 * i, mod + 3 * i + 3);
			}else{
				output += ',' + value.substring(mod + 3 * i, mod + 3 * i + 3);
			}
		}

		if(orgnum.indexOf(".") > -1) {
			output += '.' + arrayOfStrings[1];
		}
		return (output);
	}else{
		return orgnum;
	}
}

// 콤마 제거
export const removeComma = (value) => {
	value = String(value);
	let result = '';
	let substr = '';
	let i, max;
	for(i=0, max=value.length; i<max; i++) {
		substr = value.substring(i, i+1);
		if(substr !== ',') {
			result += substr;
		}
	}
	return result;
}

// 지정자리 반올림 (값, 자릿수)
export const round = (n, pos) => {
	let digits = Math.pow(10, pos);
	let sign = 1;
	if(n < 0) {
		sign = -1;
	}
	// 음수이면 양수처리후 반올림 한 후 다시 음수처리
	n = n * sign;
	let num = Math.round(n * digits) / digits;
	num = num * sign;
	return num.toFixed(pos); // toFixed: string 타입 반환
}

// 지정자리 버림 (값, 자릿수) - 양수만 가능
export const floor = (n, pos) => {
	let digits = Math.pow(10, pos);
	let num = Math.floor(n * digits) / digits;
	return num.toFixed(pos); // toFixed: string 타입 반환
}

// 지정자리 올림 (값, 자릿수)
export const ceiling = (n, pos) => {
	let digits = Math.pow(10, pos);
	let num = Math.ceil(n * digits) / digits;
	return num.toFixed(pos); // toFixed: string 타입 반환
}