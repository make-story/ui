
export default class ClassSingleton {
	constructor() {
		// Singleton
		if(!!ClassSingleton.instance) {
			return ClassSingleton.instance;
		}
		ClassSingleton.instance = this;

		// 클래스 공통적 사용 값
		this.index = 1;
		
		return this;
	}

	setTest() {
		++this.index;
	}
}