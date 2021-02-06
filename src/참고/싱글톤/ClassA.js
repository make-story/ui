import Singleton from 'Singleton';

class ClassA extends Singleton {
	constructor() {
		super();
	}
	
	singletonMethod1() {
		// ...
	}
	
	singletonMethod2() {
		// ...
	}
	
	// ...
}

console.log(
	ClassA.instance === ClassA.instance,
	ClassA.instance === new ClassA,
	new ClassA === new ClassA
); // true, true, true