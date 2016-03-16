/*
template

@date
2016.03.16

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

-
사용예
<script id="template" type="text/template">
<p>Use the <strong>{{=power}}</strong>, {{=title}}!</p>

{{<people}}
	<p class="{{=test}}">{{=title}}</p>
	{{<deep}}
		<div>{{=ysm}}</div>
		{{<haha}}
			{{=ysm}}
		{{haha>}}
	{{deep>}}
{{people>}}
<p>ysm</p>
</script>
var paint = api.template.paint(document.getElementById('template').innerHTML, {
	'power': 'aa',
	'title': 'bb',
	'people': [
		{'test': 'ysm', 'title': 'cc', 'deep': {'ysm': 'aaa', 'haha': {'ysm': '유성민'}}},
		{'title': 'cc', 'deep': {'ysm': 'bbb', 'haha': false}}
	]
});
document.getElementById('target').innerHTML = paint;

-
참고
http://handlebarsjs.com/
https://mustache.github.io/mustache.5.html
*/

;(function(factory, global) {

	'use strict'; // ES5
	if(typeof global === 'undefined' || global != window) {
		return false;	
	}else if(!global.api) {
		global.api = {};
	}
	global.api.template = factory(global);

})(function(global, undefined) {

	'use strict'; // ES5

	// debug
	if(!global.debug) {
		global.debug = {
			'log': function(name, value) {
				if(typeof value === 'undefined') {
					console.log('----------【 ' + name + ' 】');
				}else {
					console.log('----------【 ' + name);
					console.log(value);
					console.log('---------- 】');
				}
			},
			'dir': function(name, value) {
				if(typeof value === 'undefined') {
					console.log('----------【');
					console.dir(name);
					console.log('---------- 】');
				}else {
					console.log('----------【 ' + name);
					console.dir(value);
					console.log('---------- 】');
				}
			}
		};
	}

	// 특수문자 앞에 '\' 삽입 (정규식에 대응하기 위함)
	var escapeRegExp = function(string) {
		return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
	};
	
	// 정규식
	var regexp = {
		'tag': {
			'open': new RegExp(escapeRegExp('{{') + "\\s*"), // {{
			'close': new RegExp("\\s*" + escapeRegExp('}}')) // }}
		},
		'type': {
			'variable': new RegExp('^[=|\\s*=|=\\s*](\\S+)'), // =tag
			'context_open': new RegExp('^[<|\\s*<|<\\s*](\\S+)'), // <tag
			'context_close': new RegExp('(\\S+)[>|\\s*>|>\\s*]$') // tag>
		}
	};


	// 1. 파싱
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


					this.template = this.template.substring(match_tag_close.index + match_tag_close[0].length);
				}
			}
			
			//debug.dir('match_tag_open', match_tag_open);
			//debug.dir('match_tag_close', match_tag_close);
			//debug.log('tag', tag);
			//debug.log('code', code);
			//debug.log('this.template', this.template);

			// code
			this.tree.push({'type': 'code', 'value': code});

			// tag
			if(regexp.type.variable.test(tag)) { // =tag
				// =tag 의 name 추출
				match_tag_name = tag.match(regexp.type.variable);
				if(match_tag_name) {
					this.tree.push({'type': 'variable', 'value': match_tag_name[1]});	
				}
			}else if(regexp.type.context_open.test(tag)) { // <tag
				// <tag 의 name 추출
				match_tag_name = tag.match(regexp.type.context_open); 
				if(match_tag_name) {
					// tag> 찾기 (<tag와 같은 name)
					match_close = this.template.match(new RegExp(escapeRegExp('{{') + match_tag_name[1] + '[>|\\s*>|>\\s*]' + escapeRegExp('}}')));
					if(match_close) {
						// {{<tag}} ... {{tag>}}  사이의 텍스트로 새로운 컨텍스트(파싱)생성
						this.tree.push({'type': 'context', 'value': new Parse(this.template.substring(0, match_close.index), match_tag_name[1], this)});
						this.template = this.template.substring(match_close[0].length + match_close.index);
					}
				}
			}
		}
	};



	// 2. 렌더
	var render = function render(parse, contents) {
		/*
		value 에 해당 context 의 영역을 준다
		global 은 {'key': 'value'} 의 전체값
		하위로 들어갈때, 해당하는 key의 값을 value 파라미터로 넘긴다.
		*/

		var tree = parse.tree || [];
		var contents = contents || {};
		var tokens = [];
		var i, max;

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
						}else if(typeof value === 'function') {
							tokens.push({'type': 'code', 'value': value.call(contents)});
						}else if(Array.isArray(value)) {
							for(j=0, max2=value.length; j<max2; j++) {
								tokens.push({'type': 'code', 'value': value[j]});
							}
						}else {
							tokens.push({'type': 'code', 'value': contents[tree[i].value]});
						}
						break;

					case 'context': // 하위 실행컨텍스트
						value = contents[tree[i].value.context];
						//debug.log('context value', value);
						if(!value) {
							continue;
						}else if(typeof value === 'function') {
							result = render(tree[i].value, value.call(contents));
							tokens = tokens.concat(result);
						}else if(Array.isArray(value)) {
							for(j=0, max2=value.length; j<max2; j++) {
								result = render(tree[i].value, value[j]);
								tokens = tokens.concat(result);
							}
						}else if(typeof value === 'object') {
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



	// 3. 프린팅
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


	
	//
	var Template = function() {
		this.cache = {};
	};
	Template.prototype = {
		'parse': function(template) {
			if(!this.cache[template]) {
				this.cache[template] = new Parse(template);
			}
			//debug.dir('this.cache[template]', this.cache[template]);
			return this.cache[template];
		},
		'render': function(template, contents) {
			var parse = this.cache[template];
			if(!parse) {
				parse = this.parse(template);
			}
			return render(parse, contents);
		},
		'paint': function(template, contents) {
			var render = this.render(template, contents);
			return paint(render);
		}
	};
	
	// public return
	return new Template();

}, this);