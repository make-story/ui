import ClassSingleton from './ClassSingleton';

export default class ClassCommon {
	constructor() {
		this.common = new ClassSingleton();
	}

	setClick() {
		this.common.setTest();
	}

	getClick() {
		return this.common.index;
	}
}