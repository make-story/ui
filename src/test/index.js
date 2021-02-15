
import ClassA from './ClassA';
import ClassB from './ClassB';

// https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Classes
// https://dev.to/tomekbuszewski/singleton-in-javascript-1d5i
document.querySelector('#test').innerHTML = `
	<button class="classTest">ClassA</button>
	<button class="classTest">ClassB</button>
`;

const a = new ClassA();
const b = new ClassB();
const $buttons = document.querySelectorAll('.classTest');
$buttons[0].onclick = () => {
	a.setClick();
	alert(a.getClick());
};
$buttons[1].onclick = () => {
	b.setClick();
	alert(b.getClick());
};