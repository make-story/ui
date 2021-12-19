/**
 * xhr simple
 */
const xhrSimple = (parameter={}) => {
    return new Promise((resolve, reject) => {
        let settings = { // 기본 설정값
            'contentType': 'application/x-www-form-urlencoded',
            'type': 'GET', // GET이나 POST 같은 HTTP 메서드 타입
            'url': '', // 요청할 URL 주소
            'async': false, // 동기(false)/비동기(ture) 방식 (grid worker 필히 비동기 방식으로 사용해야 한다.)
            'timeout': 0, // timeout
    
            'data': {}, // 서버에 보낼 문자열 값이나 자바스크립트 데이터 객체
            'dataType': 'json', // 서버 측에서 응답받을 데이터의 형식을 문자열로 지정 (json, text, jsonp)
            
            'beforeSend': undefined, // 요청하기 전 실행할 콜백 함수
            'complete': undefined, // 요청이 끝난 후 실행할 콜백 함수
            'success': undefined, // 요청이 성공했을 때 실행할 콜백 함수
            'error': undefined, // 에러 콜백 함수 (timeout 포함)

            ...parameter,
        };
        let instance, arr = [], name, data;
    
        // 유효성 검사
        if(/[^get|post|put|delete]/i.test(settings.type)) { // HTTP 타입 (get|post|put|delete|options|head|trace|connect)
            //return false;
            reject(false);
        }
        if(typeof settings.url !== 'string' || settings.url.replace(/\s/g, '') === '' /*|| !/^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/.test(settings.url)*/) { // url
            //return false;
            reject(false);
        }
        if(typeof settings.async !== 'boolean') { // 동기/비동기 
            //return false;
            reject(false);
        }
        if(isNaN(parseFloat(settings.timeout)) || !isFinite(settings.timeout)) { // timeout
            //return false;
            reject(false);
        }
    
        // data 처리
        if(typeof settings.data === 'string' && settings.data !== '') { // string
            settings.data.replace(/([^=&]+)=([^&]*)/g, function(m, name, value) {
                arr.push(name + '=' + value);
            });
        }else if(typeof settings.data === 'object' && Object.keys(settings.data).length > 0) { // object
            for(name in settings.data) {
                if(settings.data.hasOwnProperty(name)) {
                    arr.push(name + '=' + settings.data[name]);
                }
            }
        }
        data = arr.join('&');
        if(settings.type.toLowerCase() === 'get') { // GET
            settings.url += settings.url.lastIndexOf('?') > -1 ? '&' + data : '?' + data;
            settings.contentType = null;
        }
    
        // XMLHttpRequest 인스턴스
        instance = new XMLHttpRequest();
    
        // 요청
        instance.open(settings.type, settings.url, settings.async);
        instance.setRequestHeader('Accept', '*/*');
        instance.setRequestHeader('X-Requested-With', 'XMLHttpRequest'); // X-Requested-With 헤더는, 해당 요청이 Ajax라는 걸 의미 (비표준)
        if(settings.contentType) {
            instance.setRequestHeader('Content-Type', settings.contentType);
        }
    
        // timeout
        if(settings.timeout > 0) {
            instance.timeout = settings.timeout; // time in milliseconds
        }
    
        // dataType
        instance.responseType = !settings.dataType || /json|text/i.test(settings.dataType.toLowerCase()) ? 'text' : settings.dataType; // text(default) || arraybuffer || blob || document(xml)
    
        // 받는중
        instance.onreadystatechange = function() {
            switch(instance.readyState) {
                case 0: // 객체만 생성되고 아직 초기화되지 않은 상태(open 메소드가 호출되지 않음)
                    if(typeof settings.beforeSend === 'function') {
                        settings.beforeSend.call(this);
                    }
                    break;
                case 1: // open 메소드가 호출되고 아직 send 메소드가 불리지 않은 상태
                case 2: // send 메소드가 불렸지만 status와 헤더는 도착하지 않은 상태
                    // 연결 진행
                    break;
                case 3: // 데이터의 일부를 받은 상태
                    if(typeof settings.complete === 'function') {
                        settings.complete.call(this);
                    }
                    break;
                case 4: // 데이터를 전부 받은 상태
                    if(instance.status !== 200) {
                        // 403(접근거부), 404(페이지없음), 500(서버오류발생)
                    }
                    break;
            }
        };
        // 완료
        instance.onload = function(event) { 
            //console.dir(this);
            //console.dir(instance);
            //this.getResponseHeader("Last-Modified")
            //this.getResponseHeader("Content-Type")
            if(instance.status == 200) {
                let data = instance.response || instance.responseText || instance.responseXML; // XMLHttpRequest Level 2
                if(typeof data === 'string' && settings.dataType.toLowerCase() === 'json') {
                    data = JSON.parse(data);
                }
                if(typeof settings.success === 'function') {
                    settings.success.call(this, data);
                }
                resolve(data);
            }
        };
        // 에러
        instance.ontimeout = function(event) {
            //throw event;
            if(typeof settings.error === 'function') {
                settings.error.call(this, event);
            }
            reject(event);
        };
        instance.onerror = function(event) {
            //throw event;
            if(typeof settings.error === 'function') {
				settings.error.call(this, event);
			}
            reject(event);
        };
    
        // 전송
        instance.send(data || null);

        // 취소
		//instance.abort();
    });
};