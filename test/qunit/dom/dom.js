/**
 * env 테스트
 */

function test(factory, global) {
	
	// 클라이언트 브라우저 환경
	var agent = (global.navigator.userAgent || global.navigator.vendor || global.opera).toLowerCase();
 	var environment = { // PC, 사용자 환경
		"check": { // true, false 
			"mobile": (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i.test(agent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(agent.substr(0, 4))),
		},
		"browser": {
			"name": null, // chrome | safari | opera | firefox | explorer (브라우저 구분)
			"version": null
		}
	};

	// browser 
	(function() {
		//var app_name = global.navigator.appName;
		//var app_version = global.navigator.appVersion;
		var offset_name, offset_version;

		// if문 순서 중요함
		//environment['browser']['name'] = app_name;
		//environment['browser']['version'] = String(parseFloat(app_version));
		if((offset_version = agent.indexOf("opr/")) !== -1) {
			environment['browser']['name'] = "opera";
			environment['browser']['version'] = agent.substring(offset_version + 4);
		}else if((offset_version = agent.indexOf("opera")) !== -1) {
			environment['browser']['name'] = "opera";
			environment['browser']['version'] = agent.substring(offset_version + 6);
			if((offset_version = agent.indexOf("version")) !== -1) {
				environment['browser']['version'] = agent.substring(offset_version + 8);
			}
		}else if((offset_version = agent.indexOf("msie")) !== -1) {
			environment['browser']['name'] = "explorer";
			environment['browser']['version'] = agent.substring(offset_version + 5);
		}else if((offset_version = agent.indexOf("chrome")) !== -1) {
			environment['browser']['name'] = "chrome";
			environment['browser']['version'] = agent.substring(offset_version + 7);
		}else if((offset_version = agent.indexOf("safari")) !== -1) {
			environment['browser']['name'] = "safari";
			environment['browser']['version'] = agent.substring(offset_version + 7);
			if((offset_version = agent.indexOf("version")) !== -1) {
				environment['browser']['version'] = agent.substring(offset_version + 8);
			}
		}else if((offset_version = agent.indexOf("firefox")) !== -1) {
			environment['browser']['name'] = "firefox";
			environment['browser']['version'] = agent.substring(offset_version + 8);
		}else if((offset_name = agent.lastIndexOf(' ') + 1) < (offset_version = agent.lastIndexOf('/'))) { 
			environment['browser']['name'] = agent.substring(offset_name, offset_version);
			environment['browser']['version'] = agent.substring(offset_version + 1);
			/*if(environment['browser']['name'].toLowerCase() === environment['browser']['name'].toUpperCase()) {
				environment['browser']['name'] = app_name;
			}*/
		}

		if((offset_version = environment['browser']['version'].indexOf(';')) !== -1) {
			environment['browser']['version'] = environment['browser']['version'].substring(0, offset_version);
		}
		if((offset_version = environment['browser']['version'].indexOf(' ')) !== -1) {
			environment['browser']['version'] = environment['browser']['version'].substring(0, offset_version);
		}
	})();

	return environment;
}

QUnit.module("Agent Test", {
	// 단위 테스트를 수행하기 전에 beforeEach 함수가 실행
	beforeEach: function() { // 1.x: setup
		//this.agent = agent;
		this.fakeWindow = {
			"navigator": {}
		};
	},
	// 단위 테스트가 종료된 후에 afterEach 함수가 실행
	afterEach: function() { // 1.x: teardown
		
	}
});

$.each(agent, function(i, v) {
	QUnit.test(v.device, function(assert) {
		// Given
		this.fakeWindow.navigator.userAgent = v.ua;

		// When
		var env = test(null, this.fakeWindow);

		//Then
		//console.log(env.browser.name, v.browser.name);
		assert.equal(env.browser.name, v.browser.name, "check browser name");
		assert.equal(env.browser.version, v.browser.version, "check browser Version");
	});
	
});
