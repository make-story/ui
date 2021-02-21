import $ from '../../dom';

export default (target='#event', options={}) => {
	$(target).html(`
		<button id="dispatchEvent1">dispatchEvent1</button>
		<button id="dispatchEvent2">dispatchEvent2</button>
		<button id="dynamicEvent1">dynamicEvent1 add</button>
		<button id="dynamicEvent2">dynamicEvent2 dispatch</button>
	`);

	/**
	 * 트리거 테스트
	 */
	const dispatchEvent1 = document.querySelector('#dispatchEvent1');
	const dispatchEvent2 = document.querySelector('#dispatchEvent2');
	dispatchEvent1.onclick = (event) => {
		// 트리거
		document.dispatchEvent(new CustomEvent('buildData', { detail: 'dispatchEvent1!!!!!' }));
	};
	dispatchEvent2.onclick = (event) => {
		// 트리거
		document.dispatchEvent(new CustomEvent('buildData', { detail: 'dispatchEvent2!!!!!' }));
	};

	/**
	 * 동적 이젠트 관련 테스트
	 */
	const dynamicEvent1 = document.querySelector('#dynamicEvent1');
	const dynamicEvent2 = document.querySelector('#dynamicEvent2');

	// 동적 이벤트 생성
	dynamicEvent1.addEventListener('click', (event) => {
		console.log('dynamicEvent1');
		document.addEventListener('dynamicEvent', function(event) { 
			console.log('dynamicEvent event', event);  
		}, false);
	}, { once: true });

	// 동적 생성된 이벤트 트리거 
	dynamicEvent2.addEventListener('click', (event) => {
		document.dispatchEvent(new CustomEvent('dynamicEvent', { detail: 'dynamicEvent2!!!!!' }));
	});



	/*
	기본적인 커스텀 이벤트
	*/
	document.addEventListener('build', function(event) { 
		console.log('build event', event);  
	}, false);
	document.dispatchEvent(new Event('build'));  

	/*
	사용자 데이터를 추가한 커스텀 이벤트
	*/
	document.addEventListener('buildData', function(event) { 
		console.log('buildData event', event.detail);  
	}, false);
	document.dispatchEvent(new CustomEvent('buildData', { detail: '데이터 받아라!!!!!' }));



	/*
	MDN 예제
	이벤트 버블링을 활용, 이벤트 델리게이션 방식
	https://developer.mozilla.org/ko/docs/Web/Guide/Events/Creating_and_triggering_events#%EC%9D%B4%EB%B2%A4%ED%8A%B8_%EB%B2%84%EB%B8%94%EB%A7%81

	<form>
		<textarea></textarea>
	</form>
	*/
	const form = document.querySelector('form');
	const textarea = document.querySelector('textarea');
	if(form && textarea) {
		// 새로운 이벤트를 생성하고, 버블링을 허용하며, "details" 프로퍼티로 전달할 데이터를 제공합니다
		const eventAwesome = new CustomEvent('awesome', {
			bubbles: true,
			detail: { text: () => textarea.value }
		});
		
		// form 엘리먼트는 커스텀 "awesome" 이벤트를 리슨한 후 전달된 text() 메소드의 결과를 콘솔에 출력합니다
		form.addEventListener('awesome', e => console.log(e.detail.text()));
		
		// 사용자가 입력한대로, form 내의 textarea 는 이벤트를 디스패치/트리거하여 시작점으로 사용합니다
		textarea.addEventListener('input', e => e.target.dispatchEvent(eventAwesome));
	}


	/*
	MDN 예제
	이벤트를 동적으로 생성하고 디스패칭하기
	https://developer.mozilla.org/ko/docs/Web/Guide/Events/Creating_and_triggering_events#%EC%9D%B4%EB%B2%A4%ED%8A%B8%EB%A5%BC_%EB%8F%99%EC%A0%81%EC%9C%BC%EB%A1%9C_%EC%83%9D%EC%84%B1%ED%95%98%EA%B3%A0_%EB%94%94%EC%8A%A4%ED%8C%A8%EC%B9%AD%ED%95%98%EA%B8%B0

	<form>
		<textarea></textarea>
	</form>
	*/
	if(form && textarea) {
		form.addEventListener('awesome', e => console.log(e.detail.text()));

		textarea.addEventListener('input', function() {
			// 이벤트 즉시 생성 및 디스패치/트리거
			// 노트: 선택적으로, 우리는 "함수 표현"("화살표 함수 표현" 대신)을 사용하므로 "this"는 엘리먼트를 나타냅니다
			this.dispatchEvent(new CustomEvent('awesome', { bubbles: true, detail: { text: () => textarea.value } }))
		});
	}
};