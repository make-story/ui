/**
 * https://prettier.io/docs/en/configuration.html
 * https://prettier.io/docs/en/options.html
 */

module.exports = {
	arrowParens: 'avoid', // 화살표 함수 괄호
	bracketSpacing: true, // 대괄호 사이에 공백여부
	endOfLine: 'auto', // OS별 줄넘김 LF, CRLF
	printWidth: 80, // 최대 줄 길이 (권장가이드 80)
	semi: true, // 세미콜론 적용여부
	singleQuote: true, // 큰따옴표 대신 작은따옴표 사용여부
	jsxSingleQuote: true, // JSX에서 큰따옴표 대신 작은따옴표 사용여부
	tabWidth: 2, // 들여쓰기 공백수
	trailingComma: 'all', // 개체, 배열 등 항목끝 쉼표
	useTabs: false, // 공백 대신 탭으로 들여쓰기 여부
  };
  