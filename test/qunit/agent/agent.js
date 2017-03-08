/**
 * Naver egjs test 자료 참고
 * 
 */

var agent = [
	{
		// iPhone 3.0
		"device" : "iPhone 3.0",
		"ua" : "Mozilla/5.0 (iPod; U; CPU iPhone OS 3_0 like Mac OS X;ko-kr)AppleWebKit/528.18(KHTML, like Gecko)Version/4.0 Mobile/7A341 Safari/528.16",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "safari",
			"version" : "4.0"
		}
	},
	{
		// iPhone 4.3.3
		"device" : "iPhone 4.3.3",
		"ua" : "Mozilla/5.0 (iPhone;U;CPU iPhone OS 4_3_3 like Max OS X;ko-kr) AppleWebKit/533.17.9(KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "safari",
			"version" : "5.0.2"
		}
	},
	{
		// iPad 4.2.1
		"device" : "ipad 4.2.1",
		"ua" : "Mozilla/5.0 (iPad;U;CPU OS 4_2_1 like Mac OS X;ko-kr) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8C148 Safari/6533.18.5",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "safari",
			"version" : "5.0.2"
		}
	},
	{
		// iPad 4.3.3
		"device" : "ipad 4.3.3",
		"ua" : "Mozilla/5.0 (iPad; U; CPU OS 4_3_3 like Mac OS X;ko-kr)AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "safari",
			"version" : "5.0.2"
		}
	},
	{
		// iPhone 5.0.1
		"device" : "iPhone 5.0.1",
		"ua" : "Mozilla/5.0 (iPhone;CPU iPhone OS 5_0_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A405 Safari/7534.48.3",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "safari",
			"version" : "5.1"
		}
	},
	{
		// iPhone 6.0
		"device" : "iPhone 6.0",
		"ua" : "Mozilla/5.0 (iPhone;CPU iPhone OS 6_0_2 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A551 Safari/8536.25",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "safari",
			"version" : "6.0"
		}
	},
	{
		// iPhone 6.1.2
		"device" : "iPhone 6.1.2",
		"ua" : "Mozilla/5.0 (iPhone;CPU iPhone OS 6_1_2 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10B146 Safari/8536.25",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "safari",
			"version" : "6.0"
		}
	},
	{
		// iPhone 7.0
		"device" : "iPhone 7.0",
		"ua" : "Mozilla/5.0 (iPhone;CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10B146 Safari/8536.25",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "safari",
			"version" : "6.0"
		}
	},
	{
		// iPhone 8.0
		"device" : "iPhone 8.0",
		"ua" : "Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12B440 Safari/600.1.4",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "safari",
			"version" : "8.0"
		}
	},
	{
		// iPhone 8.0 - webview (Naver)
		"device" : "iPhone 8.0 - webview (Naver)",
		"ua" : "Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12B440 NAVER(inapp; search; 390; 6.0.2)",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "safari",
			"version" : "-1",
			"webview" : true
		}
	},
	{
		// iPhone 8.0 - webview
		"device" : "iPhone 8.0 - webview",
		"ua" : "Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12B440",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "safari",
			"version" : "-1",
			"webview" : true
		}
	},
	{
		// iPhone 9.0
		"device" : "iPhone 9.0",
		"ua" : "Mozilla/5.0 (iPhone; CPU iPhone OS 9_0 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13A452 Safari/601.1",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "safari",
			"version" : "9.0"
		}
	},
	{
		// iPhone 9.0 - webview (Naver) on iPhone 4S
		"device" : "iPhone 9.0 - webview (Naver app)",
		"ua" : "Mozilla/5.0 (iPhone; CPU iPhone OS 9_0 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13A452 NAVER(inapp; search; 450; 6.4.5; 4S)",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "safari",
			"version" : "-1",
			"webview" : true
		}
	},
	{
		// iPhone 9.0 - webview (LINE app)
		"device" : "iPhone 9.0 - webview (LINE app)",
		"ua" : "Mozilla/5.0 (iPhone; CPU iPhone OS 9_0 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13A452 Safari Line/5.4.0",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "safari",
			"version" : "-1",
			"webview" : true
		}
	},
	{
		// iPhone 10.0 - WKWebView
		"device" : "iPhone 10.0 - WKWebView",
		"ua" : "Mozilla/5.0 (iPhone; CPU iPhone OS 10_0_2 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) Mobile/14A456 NAVER(inapp; search; 560; 7.7.0; 7)",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "safari",
			"version" : "-1",
			"webview" : true
		}
	},
	{
		// iPad 10.0 - WKWebView
		"device" : "iPad 10.0 - WKWebView",
		"ua" : "Mozilla/5.0 (iPad; CPU OS 10_0_2 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) Mobile/14A456 Version/5.1 Safari/7534.48.3 NAVER(inapp; search; 134; 7.7.0)",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "safari",
			"version" : "-1",
			"webview" : true
		}
	},
	{
		// GalaxyS:2.1
		"device" : "GalaxyS:2.1",
		"ua" : "Mozilla/5.0 (Linux;U;Android 2.1;ko-kr;SHW-M110S Build/ÉCLAIR) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari/530.17",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "default",
			"version" : "-1"
		}
	},
	{
		// GalaxyS:2.2
		"device" : "GalaxyS:2.2",
		"ua" : "Mozilla/5.0 (Linux;U;Android 2.2;ko-kr;SHW-M110S Build/FROYO) AppleWebKit/533.1(KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "default",
			"version" : "-1"
		}
	},
	{
		// GalaxyS:2.3.4
		"device" : "GalaxyS:2.3.4",
		"ua" : "Mozilla/5.0 (Linux;U;Android 2.3.4;ko-kr;SHW-M110S Build/GINGERBREAD)AppleWebKit/533.1(KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "default",
			"version" : "-1"
		}
	},
	{
		// GalaxyS2:2.3.3
		"device" : "GalaxyS2:2.3.3",
		"ua" : "Mozilla/5.0 (Linux;U;Android 2.3.3;ko-kr;SHW-M250S Build/GINGERBREAD) AppleWebKit/533.1(KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "default",
			"version" : "-1"
		}
	},
	{
		// GalaxyNote:2.3.6
		"device" : "GalaxyNote:2.3.6",
		"ua" : "Mozilla/5.0 (Linux;U;Android 2.3.6;ko-kr;SHV-E160S Build/GINGERBREAD) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "default",
			"version" : "-1"
		}
	},
	{
		// GalaxyTab2:3.1
		"device" : "GalaxyTab2:3.1",
		"ua" : "Mozilla/5.0 (Linux;U; Android 3.1;ko-kr;SHW-M380S Build/HMJ37) AppleWebkit/534.13(KHTML, like Gecko) Version/4.0 Safari/534.13",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "default",
			"version" : "-1"
		}
	},
	{
		// GalaxyNexus:4.0.1
		"device" : "GalaxyNexus:4.0.1",
		"ua" : "Mozilla/5.0 (Linux;U;Android 4.0.1;ko-kr;Galaxy Nexus Build/ITL41F)AppleWebKit/534.30 (KHTML, like Gecko)Version/4.0 Mobile Safari/534.30",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "default",
			"version" : "-1"
		}
	},
	{
		// GalaxyS3:4.0.4
		"device" : "GalaxyS3:4.0.4",
		"ua" : "Mozilla/5.0 (Linux; U; Android 4.0.4; ko-kr; SHV-E210S Build/IMM76D) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "default",
			"version" : "-1"
		}
	},
	{
		// GalaxyS2:chrome
		"device" : "GalaxyS2:chrome",
		"ua" : "Mozilla/5.0 (Linux; U;Android 4.0.3;ko-kr; SHW-M250S Build/IML74K) AppleWebKit/535.7 (KHTML, like Gecko) Chrome/16.0.912.77 Mobile Safari/535.7",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "chrome",
			"version" : "16.0.912.77"
		}
	},
	{
		// GalaxyS4:4.2.2
		"device" : "GalaxyS4:4.2.2",
		"ua" : "Mozilla/5.0 (Linux; Android 4.2.2; ko-kr; SAMSUNG SHV-E300S Build/JDQ39) AppleWebKit/535.19 (KHTML, like Gecko) Version/1.0 Chrome/18.0.1025.308 Mobile Safari/535.19",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "sbrowser",
			"version" : "18.0.1025.308"
		}
	},
	{
		// GalaxyS4:chrome
		"device" : "GalaxyS4:chrome",
		"ua" : "Mozilla/5.0 (Linux; Android 4.2.2; SHV-E300S Build/JDQ39) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "chrome",
			"version" : "18.0.1025.166"
		}
	},
	{
		// GalaxyS5:4.4.2
		"device" : "GalaxyS5:4.4.2",
		"ua" : "Mozilla/5.0 (Linux; Android 4.4.2; SAMSUNG SM-G900S Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Version/1.6 Chrome/28.0.1500.94 Mobile Safari/537.36",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "sbrowser",
			"version" : "28.0.1500.94"
		}
	},
	{
		// GalaxyS5:chrome
		"device" : "GalaxyS5:chrome",
		"ua" : "Mozilla/5.0 (Linux; Android 4.4.2; SM-G900S Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.108 Mobile Safari/537.36",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "chrome",
			"version" : "42.0.2311.108"
		}
	},
	{
		// GalaxyS5 4.4.2 - webview (NAVER app)
		"device" : "GalaxyS5 - webview",
		"ua" : "Mozilla/5.0 (Linux; Android 4.4.2; SM-G900S Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/28.0.1500.94 Mobile Safari/537.36 NAVER(inapp; search; 340; 6.0.5)",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "chrome",
			"version" : "28.0.1500.94",
			"webview" : true
		}
	},
	{
		// GalaxyS5 5.0 - webview
		"device" : "GalaxyS5 5.0 - webview",
		"ua" : "Mozilla/5.0 (Linux; Android 5.0; SM-G900S Build/LRX21T; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/42.0.2311.138 Mobile Safari/537.36",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "chrome",
			"version" : "42.0.2311.138",
			"webview" : true
		}
	},
	{
		// GalaxyS5 - higgs
		"device" : "GalaxyS5 - higgs",
		"ua" : "Mozilla/5.0 (Linux; Android 4.4.2; SM-G900S Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.61 Mobile Safari/537.36 NAVER(higgs; search; 340; 6.0.5; 1.0.6.2)",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "chrome",
			"version" : "33.0.1750.61",
			"webview" : true
		}
	},
	{
		// GalaxyS6 5.1.1
		"device" : "GalaxyS6:5.1.1",
		"ua" : "Mozilla/5.0 (Linux; Android 5.1.1; SAMSUNG SM-G925S Build/LMY47X) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/3.2 Chrome/38.0.2125.102 Mobile Safari/537.36",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "sbrowser",
			"version" : "38.0.2125.102"
		}
	},
	{
		// GalaxyS6:chrome
		"device" : "GalaxyS6:chrome",
		"ua" : "Mozilla/5.0 (Linux; Android 5.1.1; SM-G925S Build/LMY47X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.84 Mobile Safari/537.36",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "chrome",
			"version" : "45.0.2454.84"
		}
	},
	{
		// GalaxyS6 5.1.1 - webview (Naver app)
		"device" : "GalaxyS6 - webview (Naver app)",
		"ua" : "Mozilla/5.0 (Linux; Android 5.1.1; SM-G925S Build/LMY47X; wv) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.95 Mobile Safari/537.36 NAVER(inapp; search; 390; 6.4.5)",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "chrome",
			"version" : "45.0.2454.95",
			"webview" : true
		}
	},
	{
		// GalaxyS6 5.1.1 - webview (KAKAOTALK app)
		"device" : "GalaxyS6 - webview (KAKAOTALK app)",
		"ua" : "Mozilla/5.0 (Linux; Android 5.1.1; SM-G925S Build/LMY47X; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/45.0.2454.95 Mobile Safari/537.36;KAKAOTALK",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "chrome",
			"version" : "45.0.2454.95",
			"webview" : true
		}
	},
	{
		// GalaxyS6 5.1.1 - webview (Facebook app)
		"device" : "GalaxyS6 - webview (Facebook app)",
		"ua" : "Mozilla/5.0 (Linux; Android 5.1.1; SM-G925S Build/LMY47X; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/45.0.2454.95 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/50.0.0.10.54;]",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "chrome",
			"version" : "45.0.2454.95",
			"webview" : true
		}
	},
	{
		// GalaxyS7 Edge 6.0.1
		"device" : "GalaxyS7Edge:6.0.1",
		"ua" : "Mozilla/5.0 (Linux; Android 6.0.1; SAMSUNG SM-G935L Build/MMB29K) AppleWebkit/537.36 (KHTML, like Gecko) SamsungBrowser/4.0 Chrome/44.0.2403.133 Mobile Safari/537.36",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "sbrowser",
			"version" : "44.0.2403.133"
		}
	},
	{
		// GalaxyS7 Edge 6.0.1:chrome
		"device" : "GalaxyS7Edge:chrome",
		"ua" : "Mozilla/5.0 (Linux; Android 6.0.1; SM-G935L Build/MMB29K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.91 Mobile Safari/537.36",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "chrome",
			"version" : "49.0.2623.91"
		}
	},
	{
		// GalaxyS7 Edge 6.0.1 - webview (Naver app)
		"device" : "GalaxyS7Edge - webview (Naver app)",
		"ua" : "Mozilla/5.0 (Linux; Android 6.0.1; SM-G935L Build/MMB29K) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/48.0.2564.10 Mobile Safari/537.36 NAVER(inapp; search; 430; 6.9.1)",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "chrome",
			"version" : "48.0.2564.10",
			"webview" : true
		}
	},
	{
		// GalaxyNexus:4.2.2
		"device" : "GalaxyNexus:4.2.2",
		"ua" : "Mozilla/5.0 (Linux; Android 4.2.2;ko-kr; Galaxy Nexus Build/JDQ39) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "default",
			"version" : "-1"
		}
	},
	{
		// GalaxyNexus:chrome
		"device" : "GalaxyNexus:chrome",
		"ua" : "Mozilla/5.0 (Linux; Android 4.2.2; Galaxy Nexus Build/JDQ39) AppleWebKit/537.22 (KHTML, like Gecko) Chrome/18.0.1364.169 Mobile Safari/537.22",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "chrome",
			"version" : "18.0.1364.169"
		}
	},
	{
		// GalaxyNexus:chrome
		"device" : "GalaxyNexus:chrome",
		"ua" : "Mozilla/5.0 (Linux; Android 4.2.2; Galaxy Nexus Build/JDQ39) AppleWebKit/537.22 (KHTML, like Gecko) Chrome/25.0.1364.169 Mobile Safari/537.22",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "chrome",
			"version" : "25.0.1364.169"
		}
	},
	{
		// GalaxyNote2:chrome
		"device" : "GalaxyNote2:chrome",
		"ua" : "Mozilla/5.0 (Linux; Android 4.3; SHV-E250S Build/JSS15J) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.59 Mobile Safari/537.36",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "chrome",
			"version" : "31.0.1650.59"
		}
	},
	{
		// Xiaomi_2013061_TD:browser
		"device" : "Xiaomi_2013061_TD:browser",
		"ua" : "Xiaomi_2013061_TD/V1 Linux/3.4.5 Android/4.2.1 Release/09.18.2013 Browser/AppleWebKit534.30 Mobile Safari/534.30 MBBMS/2.2 System/Android 4.2.1 XiaoMi/MiuiBrowser/1.0",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "default",
			"version" : "-1"
		}
	},
	{
		// window && IE
		"device" : "window && IE",
		"ua" : "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; IPMS/930D0D0A-04A359770A0; TCO_20090615095913; InfoPath.2; .NET CLR 2.0.50727)",
		"check": {
			"mobile": false
		},
		"browser" : {
			"name" : "explorer",
			"version" : "7.0"
		}
	},
	{
		// Windows 7 && IE
		"device" : "Windows 7 && IE",
		"ua" : "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0)",
		"check": {
			"mobile": false
		},
		"browser" : {
			"name" : "explorer",
			"version" : "8.0"
		}
	},
	{
		// Windows 7 && IE
		"device" : "Windows 7 && IE",
		"ua" : "Mozilla/5.0 (Windows NT 6.1;; APCPMS=^N20120502090046254556C65BBCE3E22DEE3F_24184^; Trident/7.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; InfoPath.3; .NET4.0C; .NET4.0E; TCO_20150325103347; rv:11.0) like Gecko",
		"check": {
			"mobile": false
		},
		"browser" : {
			"name" : "explorer",
			"version" : "11.0"
		}
	},
	{
		// Windows 7 && Chrome
		"device" : "Windows 7 && Chrome",
		"ua" : "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.101 Safari/537.36",
		"check": {
			"mobile": false
		},
		"browser" : {
			"name" : "chrome",
			"version" : "41.0.2272.101"
		}
	},
	{
		// Windows 7 && Firefox
		"device" : "Windows 7 && Firefox",
		"ua" : "Mozilla/5.0 (Windows NT 6.1; rv:36.0) Gecko/20100101 Firefox/36.0",
		"check": {
			"mobile": false
		},
		"browser" : {
			"name" : "firefox",
			"version" : "36.0"
		}
	},
	{
		// IE11 on Windows 10
		"device" : "64-bit Windows 8.1 Update && IE11",
		"ua" : "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko",
		"check": {
			"mobile": false
		},
		"browser" : {
			"name" : "explorer",
			"version" : "11.0"
		}
	},
	{
		// 64-bit Windows 8.1 Update && IE11
		"device" : "64-bit Windows 8.1 Update && IE11",
		"ua" : "Mozilla/5.0 (Windows NT 6.3; Win64, x64; Trident/7.0; Touch; rv:11.0) like Gecko",
		"check": {
			"mobile": false
		},
		"browser" : {
			"name" : "explorer",
			"version" : "11.0"
		}
	},
	{
		// 64-bit Windows 8.1 Update && IE11 for the desktop
		"device" : "64-bit Windows 8.1 Update && IE11 for the desktop",
		"ua" : "Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; Touch; rv:11.0) like Gecko",
		"check": {
			"mobile": false
		},
		"browser" : {
			"name" : "explorer",
			"version" : "11.0"
		}
	},
	{
		// Windows 10 && Microsoft Edge for desktop
		"device" : "Windows 10 && Microsoft Edge for desktop",
		"ua" : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.10240",
		"check": {
			"mobile": false
		},
		"browser" : {
			"name" : "edge",
			"version" : "12.10240"
		}
	},
	{
		// Mac && Chrome
		"device" : "Mac && Chrome",
		"ua" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.101 Safari/537.36",
		"check": {
			"mobile": false
		},
		"browser" : {
			"name" : "chrome",
			"version" : "41.0.2272.101"
		}
	},
	{
		// Mac && Safari
		"device" : "Mac && Safari",
		"ua" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/600.3.18 (KHTML, like Gecko) Version/8.0.3 Safari/600.3.18",
		"check": {
			"mobile": false
		},
		"browser" : {
			"name" : "safari",
			"version" : "8.0.3"
		}
	},
	{
		// Phantomjs (default value)
		"device" : "Phantomjs (default value)",
		"ua" : "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.9.8 Safari/534.34",
		"check": {
			"mobile": false
		},
		"browser" : {
			"name" : "phantomjs",
			"version" : "1.9.8"
		}
	},
	{
		// Window XP && ie6
		"device" : "Window XP && ie6",
		"ua" : "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322; .NET CLR 1.0.3705; Media Center PC 3.1)",
		"check": {
			"mobile": false
		},
		"browser" : {
			"name" : "explorer",
			"version" : "6.0"
		}
	},
	{
		// Window && ie6
		"device" : "Window && ie6",
		"ua" : "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322; .NET CLR 1.0.37052000; Media Center PC 3.1)",
		"check": {
			"mobile": false
		},
		"browser" : {
			"name" : "explorer",
			"version" : "6.0"
		}
	},
	{
		// Window XP && ie7
		"device" : "Window XP && ie7",
		"ua" : "Mozilla/5.0 (compatible; MSIE 7.0; Windows NT 5.0; Trident/4.0; FBSMTWB; .NET CLR 2.0.34861; .NET CLR 3.0.3746.3218; .NET CLR 3.5.33652; msn OptimizedIE8;ENUS)",
		"check": {
			"mobile": false
		},
		"browser" : {
			"name" : "explorer",
			"version" : "7.0"
		}
	},
	{
		// Window Vista && ie6.2
		"device" : "Window Vista && ie6.2",
		"ua" : "Mozilla/5.3 (compatible; MSIE 6.2; Windows NT 6.0)",
		"check": {
			"mobile": false
		},
		"browser" : {
			"name" : "explorer",
			"version" : "6.2"
		}
	},
	{
		// Window 2000 && ie6
		"device" : "Window 2000 && ie6",
		"ua" : "Mozilla/4.0 (compatible; MSIE 6.0; Windows 2000)",
		"check": {
			"mobile": false
		},
		"browser" : {
			"name" : "explorer",
			"version" : "6.0"
		}
	},
	{
		// Phantomjs Window (default value)
		"device" : "Phantomjs Window (default value)",
		"ua" : "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.9.8 Safari/534.34",
		"check": {
			"mobile": false
		},
		"browser" : {
			"name" : "phantomjs",
			"version" : "1.9.8"
		}
	},
	{
		"device" : "Phantomjs (default value)",
		"ua" : "Mozilla/5.0 (Unknown; Linux x86_64) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.9.8 Safari/534.34",
		"check": {
			"mobile": false
		},
		"browser" : {
			"name" : "phantomjs",
			"version" : "1.9.8"
		}
	}
];

var nativeVersionProfile = [
	{
		// Window 2000 && IE8에서 IE7모드
		"ua" : "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; IPMS/DE240D0A-14B4E9316A6-00000032300C; TCO_20100114140812; .NET CLR 1.1.4322; .NET CLR 2.0.50727; .NET CLR 3.0.04506.30; InfoPath.2; .NET CLR 3.0.04506.648; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; OfficeLiveConnector.1.3; OfficeLivePatch.0.0)",
		"check": {
			"mobile": false
		},
		"browser" : {
			"name" : "explorer",
			"version" : "7.0",
			"nativeVersion" : "8"
		},
		"_documentMode" : 8
	},
	{
		// Window 2000 && IE8에서 호환모드
		"ua" : "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; IPMS/DE240D0A-14B4E9316A6-00000032300C; TCO_20100114140812; .NET CLR 1.1.4322; .NET CLR 2.0.50727; .NET CLR 3.0.04506.30; InfoPath.2; .NET CLR 3.0.04506.648; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; OfficeLiveConnector.1.3; OfficeLivePatch.0.0)",
		"check": {
			"mobile": false
		},
		"browser" : {
			"name" : "explorer",
			"version" : "7.0",
			"nativeVersion" : "8"
		},
		"_documentMode" : 9
	},
	{
		// Window7, IE9에서 호환 모드
		"ua" : "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C)",
		"check": {
			"mobile": false
		},
		"browser" : {
			"name" : "explorer",
			"version" : "7.0",
			"nativeVersion" : "9"
		},
		"_documentMode" : 7
	},
	{
		// IE11
		"ua" : "Mozilla/5.0 (Windows NT 6.3; Trident/7.0; Touch; .NET4.0E; .NET4.0C; Tablet PC 2.0; rv:11.0) like Gecko",
		"check": {
			"mobile": false
		},
		"browser" : {
			"name" : "explorer",
			"version" : "7.0",
			"nativeVersion" : "11"
		},
		"_documentMode" : 11
	},
	{
		// IE11 호환성
		"ua" : "Mozilla/5.0 (Windows NT 6.3; Trident/7.0; Touch; .NET4.0E; .NET4.0C; Tablet PC 2.0; rv:11.0) like Gecko",
		"check": {
			"mobile": false
		},
		"browser" : {
			"name" : "explorer",
			"version" : "7.0",
			"nativeVersion" : "11"
		},
		"_documentMode" : 7
	},
	{
		// Window phone 8 && ie10
		"ua" : "Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; SAMSUNG; SGH-T899M",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "explorer",
			"version" : "10.0",
			"nativeVersion" : "10"
		}
	},
	{
		// Window mobile
		"ua" : "Mozilla/5.0 (Mobile; Windows Phone 8.1; Android 4.0; ARM; Trident/7.0; Touch; rv:11.0; IEMobile/11.0; NOKIA; Lumia 520) like iPhone OS 7_0_3 Mac OS X AppleWebKit/537 (KHTML, like Gecko) Mobile Safari/537",
		"check": {
			"mobile": true
		},
		"browser" : {
			"name" : "explorer",
			"version" : "11.0",
			"nativeVersion" : "11"
		}
	}
];