//import ClassSingleton from './ClassSingleton';
import ClassCommon from './ClassCommon';

export default class ClassA extends ClassCommon {
	constructor() {
		super();
	}

	setClick() {
		console.log(ClassA.name);
		super.setClick();
	}
}