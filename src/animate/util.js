// 정규식
export const regexp = {
	pixel_unit_list: /width$|height$|top|right|bottom|left|fontSize|letterSpacing|lineHeight|^margin*|^padding*/i, // 단위 px 해당되는 것
	time_unit_list: /.+(-duration|-delay)$/i, // seconds (s) or milliseconds (ms)
	position_list: /^(top|right|bottom|left)$/,
	display_list: /^(display|visibility|opacity|)$/i,
	text: /^(\D+)$/i, // 텍스트
	num_unit: /^([0-9]+)(\D+)$/i, // 단위
	num: /^[+-]?\d+(\.\d+)?$/, // 숫자
	source_num: /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source, // +=, -= 숫자와 연산자 분리
	trim: /(^\s*)|(\s*$)/g // 양쪽 여백
};

// 숫자/단위 분리 (예: 10px -> [0]=>10px, [1]=>10, [2]=>'px')
export const getNumberUnit = function(value) {
	//let regexp_source_num = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;
	let regexp_number = new RegExp(`^(${regexp.source_num})(.*)$`, "i");
	let matches = regexp_number.exec(value);

	if(matches) {
		return matches;
	}else {
		return [value];
	}
};