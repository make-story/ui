/*
template

@date (버전관리)
2016.03.16

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

@browser compatibility
서버환경, 브라우저환경 지원
CommonJS, AMD

-
사용예
<script id="template" type="text/template">
<p>Use the <strong>{{=power}}</strong>, {{=title}}!</p>

{{<people>}}
	<p class="{{=test}}">{{=title}}</p>
	{{<deep>}}
		<div>{{=ysm}}</div>
		{{<haha>}}
			{{=ysm}}
		{{</haha>}}
	{{</deep>}}
{{</people>}}
<p {{=event}}>ysm</p>
</script>

<script>
var paint = api.template.paint(document.getElementById('template').innerHTML, {
	'power': 'aa',
	'title': 'bb',
	'people': [
		{'test': 'ysm', 'title': 'cc', 'deep': {'ysm': 'aaa', 'haha': {'ysm': '유성민'}}},
		{'title': 'cc', 'deep': {'ysm': 'bbb', 'haha': false}}
	]
});
document.getElementById('target').innerHTML = paint;
</script>

-
참고
http://handlebarsjs.com/
https://mustache.github.io/mustache.5.html

-
템플릿 파일 (TMPL 파일)

*/

;(function(factory, global) {

	'use strict'; // ES5
	if(typeof exports === 'object' && exports && typeof exports.nodeName !== 'string') { // CommonJS
		factory(exports);
	}else if(typeof define === 'function' && define.amd) { // AMD
		define(['exports'], factory);
	}else {
		// debug
		/*if(!global.debug) {
			global.debug = {
				'log': function(name, value) {
					if(typeof value === 'undefined') {
						console.log('----------【 ' + name + ' 】');
					}else {
						console.log('----------【' + name);
						console.log(value);
						console.log('】----------');
					}
				},
				'dir': function(name, value) {
					if(typeof value === 'undefined') {
						console.log('----------【');
						console.dir(name);
						console.log('】----------');
					}else {
						console.log('----------【' + name);
						console.dir(value);
						console.log('】----------');
					}
				}
			};
		}*/
		// api
		if(!global.api) {
			global.api = {};
		}
		global.api.template = {};
		factory(global.api.template);
	}

})(function(template, undefined) {

	'use strict'; // ES5

	// 특수문자 앞에 '\' 삽입 (정규식에 대응하기 위함)
	var escapeRegExp = function(string) {
		return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
	};
	
	// 정규식
	var regexp = {
		'tag': {
			//'variable': new RegExp(escapeRegExp('${') + "\\s*" + escapeRegExp('}')), // ECMA6 template ${}
			'open': new RegExp(escapeRegExp('{{') + "\\s*"), // {{
			'close': new RegExp("\\s*" + escapeRegExp('}}')) // }}
		},
		'type': {
			'variable': new RegExp('^[\\s]*[^<|^>]?[\\s]*=?[\\s]*(\\w+)[\\s]*[^<|^>]?[\\s]*'), // =tag 또는 tag
			'context_open': new RegExp('<[\\s]*=?[\\s]*(\\w+)[\\s]*>'), // <tag>
			//'context_close': new RegExp('<[\\s]*\\/[\\s]*(\\w+)[\\s]*>') // </tag>
		}
	};

	// 1. 파싱 - template 에서 html code와 {{tag}} code 분리
	var Parse = function Parse(template, context, parent) {
		this.template = template || '';
		this.context = context || 'global';
		this.parent = parent || null;
		this.tree = [];

		var match_tag;
		var match_tag_open, match_tag_close;
		var match_tag_name;
		var match_close;
		var tag; // {{tag}}
		var code; // 일반 html code
		while(this.template !== '') {

			//debug.log('template', this.template);
			
			// {{tag}} 검색
			/*match_tag = this.template.match(new RegExp(escapeRegExp('{{') + '(\\S+)' + escapeRegExp('}}')));
			//debug.dir('match_tag', match_tag);
			if(!match_tag) {
				tag = '';
				code = this.template;
				this.template = '';
			}else {
				tag = match_tag[1]; // {{tag}}
				code = this.template.substring(0, match_tag.index);
				this.template = this.template.substring(match_tag[0].length + match_tag.index);
			}*/
			match_tag_open = this.template.match(regexp.tag.open); // {{ 시작부분 검색
			match_tag_close = this.template.match(regexp.tag.close); // }} 종료부분 검색
			if(!match_tag_open) {
				tag = '';
				code = this.template;
				this.template = '';
			}else {
				tag = '';
				code = this.template.substring(0, match_tag_open.index);
				if(!match_tag_close) {
					this.template = this.template.substring(match_tag_open.index + match_tag_open[0].length);	
				}else {
					tag = this.template.substring(match_tag_open.index + match_tag_open[0].length, match_tag_close.index); // {{tag}}
					// tag 내부에 {{ 열기 부분이 존재하는지 확인 (닫기 전에 열기가 발생한 것)


					// 
					this.template = this.template.substring(match_tag_close.index + match_tag_close[0].length);
				}
			}
			
			//debug.dir('match_tag_open', match_tag_open);
			//debug.dir('match_tag_close', match_tag_close);
			//debug.log('tag', tag);
			//debug.log('code', code);
			//debug.log('this.template', this.template);

			// code
			this.tree.push({'type': 'code', 'value': code}); // html 등의 tag

			// tag
			if(regexp.type.context_open.test(tag)) { // <tag>
				// <tag> 에서 tag에 해당하는 부분 추출 (컨텍스트명)
				match_tag_name = tag.match(regexp.type.context_open); 
				if(match_tag_name) {
					// </tag> 찾기 (<tag>와 같은 name, 컨텍스트가 끝나는 부분)
					//match_close = this.template.match(new RegExp(escapeRegExp('{{') + match_tag_name[1] + '[>|\\s*>|>\\s*]' + escapeRegExp('}}')));
					match_close = this.template.match(new RegExp(escapeRegExp('{{') + '<[\\s]*\\/[\\s]*(' + match_tag_name[1] + ')[\\s]*>' + escapeRegExp('}}')));
					if(match_close) {
						// {{<tag>}} ... {{</tag>}}  사이의 텍스트로 새로운 컨텍스트(파싱)생성
						this.tree.push({'type': 'context', 'value': new Parse(this.template.substring(0, match_close.index), match_tag_name[1], this)}); // 컨텍스트 (해당 컨텍스트 파싱)
						this.template = this.template.substring(match_close[0].length + match_close.index);
					}
				}
			}else if(regexp.type.variable.test(tag)) { // =tag 또는 tag
				// =tag 에서 tag에 해당하는 부분 추출 (변수명)
				match_tag_name = tag.match(regexp.type.variable);
				if(match_tag_name) {
					this.tree.push({'type': 'variable', 'value': match_tag_name[1]}); // 변수 (json 데이터에서 변수명에 해당하는 값을 바인딩)
				}
			}
		}
	};

	// 2. 렌더 - 파서단계에서 분리된 {{tag}}에 값 적용
	var render = function render(parse, contents) {
		/*
		value 에 해당 context 의 영역을 준다
		global 은 {'key': 'value'} 의 전체값
		하위로 들어갈때, 해당하는 key의 값을 value 파라미터로 넘긴다.
		*/

		var tree = parse.tree || []; // 파싱된 트리
		var contents = contents || {}; // 변수에 할당(파싱된 트리에 contents값 설정)할 json 데이터
		var tokens = []; // 코드 조각 
		var i, max;

		//debug.dir('tree', tree);
		//debug.dir('contents', contents);

		var j, max2;
		var value;
		var result;
		for(i=0, max=tree.length; i<max; i++) {
			// type이 code가 아닌 것을 code로 변환하여 tokens에 넣는다.
			if('type' in tree[i] && 'value' in tree[i]) {
				switch(tree[i].type) {
					case 'variable': // 변수
						value = contents[tree[i].value];
						//debug.log('variable value', value);
						if(!value) {
							continue;
						}else if(typeof value === 'function') { // function type
							tokens.push({'type': 'code', 'value': value.call(contents)}); 
						}else if(Array.isArray(value)) { // array type
							for(j=0, max2=value.length; j<max2; j++) {
								tokens.push({'type': 'code', 'value': value[j]});
							}
						}else { // true || 기타값
							tokens.push({'type': 'code', 'value': contents[tree[i].value]});
						}
						break;

					case 'context': // 하위 실행컨텍스트
						value = contents[tree[i].value.context];
						//debug.log('context value', value);
						if(!value) {
							continue;
						}else if(typeof value === 'function') { // json 값이 function type
							result = render(tree[i].value, value.call(contents));
							tokens = tokens.concat(result);
						}else if(Array.isArray(value)) { // json 값이 array type
							for(j=0, max2=value.length; j<max2; j++) {
								result = render(tree[i].value, value[j]);
								tokens = tokens.concat(result);
							}
						}else if(typeof value === 'object') { // json 값이 object type (json 형식)
							result = render(tree[i].value, value);
							tokens = tokens.concat(result);
						}else { // json 값이 boolen type
							result = render(tree[i].value, value);
							tokens = tokens.concat(result);
						}
						break;

					default: // code
						tokens.push(tree[i]);
						break;
				}
			}
		}

		return tokens;
	};

	// 3. 프린팅 - html 반환
	var paint = function paint(render) {
		var i, max;
		var codes = [];
		for(i=0, max=render.length; i<max; i++) {
			if(render[i]['type'] === 'code') {
				codes.push(render[i]['value']);
			}
		}

		return codes.join('');
	};

	// 메모이제이션
	var cache = {}; 

	// public return
	template.parse = function(template) {
		var parse = cache[template]; // 기존 파싱되었던 템플릿인지 확인
		if(!parse) { 
			parse = new Parse(template);
		}
		//debug.dir('cache[template]', cache[template]);
		return parse;
	};
	template.render = function(template, contents) { // 사용성이 별로 없지만, 흐름확인을 위해 public 
		var parse = this.parse(template);
		return render(parse, contents);
	};
	template.paint = function(template, contents) {
		var render = this.render(template, contents);
		return paint(render);
	};
	if(typeof window === 'object' && window.document && window.document.createDocumentFragment) {
		template.fragment = function(template, contents) { // fragment 에 html 삽입 후 반환
			var paint = this.paint(template, contents);
			var fragment = document.createDocumentFragment(); // fragment 가 document에 렌더링(삽입)되기 전에, 셀렉터로 fragment 내부 element 검색이 가능하다.
			if(paint) {
				/*
				var temp = document.createElement('template'); // IE 미지원
				temp.innerHTML = paint;
				fragment.appendChild(temp.content);
				*/
				var temp = document.createElement('div');
				var child;
				temp.innerHTML = paint;
				while(child = temp.firstChild) { // temp.firstElementChild 는 제약이 있음 (textnode 제외)
					fragment.appendChild(child);
				}
			}
			return fragment;
		};
	}
	return template;

}, this);