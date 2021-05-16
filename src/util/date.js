/**
 * 날짜
 * 
 * https://github.com/nhn/tui.code-snippet/blob/master/formatDate/formatDate.js
 */

// date format
export const date = (date=new Date()) => {
	const year = date.getFullYear();
	const month = `0${date.getMonth() + 1}`.slice(-2);
	const day = `0${date.getDate()}`.slice(-2);
	const hour = `0${date.getHours()}`.slice(-2);
	const minute = `0${date.getMinutes()}`.slice(-2);
	const second = `0${date.getSeconds()}`.slice(-2);
	const time = date.getTime();
	return {
		year,
		month,
		day,
		hour,
		minute,
		second,
		time,
	};
}

// 몇일째 되는날
/*
사용예: (year, month, day 분리 입력 또는 new Date 인스턴스값 입력)
getDateSpecificInterval({'year': year, 'month': month, 'day': day}, 10); // +10일
getDateSpecificInterval(new Date(), -19); // -19일
*/
export const dateSpecificInterval = (date=new Date(), interval=0) => {
	let instance;
	if(date instanceof Date) { //{'instance': 값}
		instance = date;
	}else if(date && typeof date === 'object' && date.year && date.month && date.day) { // {'year': 값, 'month': 값, 'day': 값}
		instance = new Date(parseInt(date.year), parseInt(date.month) - 1, parseInt(date.day));
	}else {
		return false;
	}
	interval = Number(interval);
	return new Date(Date.parse(instance) + interval * 1000 * 60 * 60 * 24);
}

// 날짜차이
export const dateBetween = (start='', end='') => { // start: 2015-10-27, end: 2015-12-27
	if(!start || !end || start.indexOf('-') <= 0 || end.indexOf('-') <= 0) {
		return false;
	}

	const startArr = start.split("-");
	const endArr = end.split("-");
	const startObj = new Date(startArr[0], Number(startArr[1])-1, startArr[2]);
	const endObj = new Date(endArr[0], Number(endArr[1])-1, endArr[2]);

	const years = endObj.getFullYear() - startObj.getFullYear();
	const months = endObj.getMonth() - startObj.getMonth();
	const days = endObj.getDate() - startObj.getDate();

	const day = (endObj.getTime()-startObj.getTime())/(1000*60*60*24);
	const month = (years * 12 + months + (days >= 0 ? 0 : -1));
	const year = Math.floor(month / 12);
	
	return {
		day,
		month,
		year,
	};
}

// 해당 년월의 마지막 날짜
export const lastday = (year, month) => {
	const arr = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	if((year %4 == 0 && year % 100 !== 0) || year % 400 == 0) {
		arr[1] = 29;
	}
	return arr[month-1];
}