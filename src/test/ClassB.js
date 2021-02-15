//import ClassSingleton from './ClassSingleton';
import ClassCommon from './ClassCommon';

export default class ClassB extends ClassCommon {
	constructor() {
		super();
	}

	setClick() {
		console.log(ClassB.name);
		super.setClick();
	}
}