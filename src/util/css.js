/**
 * CSS
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