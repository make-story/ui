
export default class Singleton {
	// new Singleton()
	constructor() {
		// Singleton
		if(!Singleton._instance) {
			Singleton._instance = this;
		}
		
		// 클래스 공통적 사용 값 (테스트 값)
		this.index = 1;
		
		return Singleton._instance;
	}

	// Singleton.getInstance()
	static getInstance() {
		return this._instance;
	}

	setTest() {
		++this.index;
	}
}