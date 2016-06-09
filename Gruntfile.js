/*
-
http://nuli.navercorp.com/sharing/blog/post/1132682

-
Grunt는 JavaScript Task Runner, JavaScript 프로젝트 관리를 위한 build-tool이다. 
Grunt 홈페이지에서 표현하고 있는 말을 인용하자면, grunt의 사용목적은 한마디로 ‘자동화’에 있다.
Grunt를 사용함으로써 프로젝트 build시에 원하는 작업, 
예를 들어 concatenating, minifying, validating 등을 편하게, 쉽게, 자동적으로 실행시킬 수 있다.

-
사용방법 
1. Grunt CLI 설치
 먼저, Grunt의 Command Line Interface(CLI)를 설치한다. 이때, ‘-g’ 는 설치를 global로 하여 콘솔 어디서나 grunt를 사용하기 위함이다.
 $ npm install -g grunt-cli
 
2. Grunt 설치
 프로젝트 폴더의 root경로에서 grunt를 설치한다. --save-dev 로 설치를 진행하면 grunt 설치와 동시에 다음 단계에서 생성할 package.json 파일과 연동시켜주며, 파일 내부의 devDependencies항목에 설치 대상(여기서는 grunt)을 자동으로 추가해준다.
 $ npm install grunt --save-dev
 
3. package.json 파일 생성
 $ npm init
 위의 command line 을 통해 아래처럼 보이는 package.json파일이 생성됨을 확인한다. 과정 중 특별히 기재할 사항이 없다면 계속 enter를 쳐서 넘겨도 무방하다. (자동적으로 해당 프로젝트의 정보를 입력해준다.) 

4. Gruntfile.js 파일 생성
package.json과 같은 위치(프로젝트 폴더의 root경로)에 Gruntfile.js를 생성한다. (Grunt가 실행될 때, 이 파일을 보고 어떠한 동작을 할지 결정하는데 쓰인다.) 

5. 사용을 원하는 Grunt Plugin 설치
 여기서는 grunt-contrib-concat 플러그인 설치를 예로 든다.
 $ npm install grunt-conrib-concat --save-dev

6. 실행하기
grunt 명령어로 실행한다. 정의해놓은 복수 개의 플러그인을 동시에 실행시킬 수 있다. 개별 실행을 시키고 싶다면 ‘grunt 플러그인이름’으로 실행하면 된다. 예) grunt concat
 $ grunt

-
자주 쓰이는 Grunt Plugin
grunt-contrib-concat
File을 통합한다.

grunt-contrib-uglify
UglifyJS를 통한 file minifying.

grunt-contrib-jshint
JSHint를 통한 file Validation.

grunt-contrib-cssmin
CSS 파일을 압축한다.
*/

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		//uglify 설정
		uglify: {
			options: {
				banner: '/* <%= grunt.template.today("yyyy-mm-dd") %> Copyright (c) Sung-min Yu. */ ' //파일의 맨처음 붙는 banner 설정
			},
			my_target: {
				files: {
					'public/build/api.dom.min.js': ['public/js/api.dom.js'],
					'public/build/api.flicking.min.js': ['public/js/api.flicking.js'],
					'public/build/api.modal.min.js': ['public/js/api.modal.js'],
					'public/build/api.socket.min.js': ['public/js/api.socket.js'],
					'public/build/api.state.min.js': ['public/js/api.state.js'],
					'public/build/api.template.min.js': ['public/js/api.template.js'],
					'public/build/api.util.min.js': ['public/js/api.util.js'],
					'public/build/api.validate.min.js': ['public/js/api.validate.js'],
					'public/build/api.xhr.min.js': ['public/js/api.xhr.js']
				}
			}
		},
		//concat 설정
		concat:{
			basic: {
				src: ['public/js/api.dom.js', 'public/js/api.flicking.js', 'public/js/api.modal.js', 'public/js/api.socket.js', 'public/js/api.state.js', 'public/js/api.template.js', 'public/js/api.util.js', 'public/js/api.validate.js', 'public/js/api.xhr.js'], //concat 타겟 설정(앞에서부터 순서대로 합쳐진다.)
				dest: 'public/build/api.js' //concat 결과 파일
			}
		}
	});
 
	// Load the plugin that provides the "uglify", "concat" tasks.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
 
	// Default task(s).
	grunt.registerTask('default', ['concat', 'uglify']); //grunt 명령어로 실행할 작업
 
};