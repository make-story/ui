/**
 * 디바이스, 유저에니전트
 */

// 기기방향, 모션
// https://developers.google.com/web/fundamentals/native-hardware/device-orientation?hl=ko
if(window.DeviceOrientationEvent) {
	window.addEventListener('deviceorientation', () => {

	}, false);
}
if(window.DeviceMotionEvent) {
	window.addEventListener('devicemotion', () => {

	});
}


// 회전
// https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Managing_screen_orientation#locking_the_screen_orientation
let orientation = (window.screen.orientation || {}).type || window.screen.mozOrientation || window.screen.msOrientation;
console.log('orientation', orientation);
if (orientation === "landscape-primary") {
  console.log("That looks good.");
} else if (orientation === "landscape-secondary") {
  console.log("Mmmh... the screen is upside down!");
} else if (orientation === "portrait-secondary" || orientation === "portrait-primary") {
  console.log("Mmmh... you should rotate your device to landscape");
} else if (orientation === undefined) {
  console.log("The orientation API isn't supported in this browser :(");
}
//window.screen.addEventListener("orientationchange", function () {
window.addEventListener("orientationchange", function(event) {
	const windowOrientation = window.orientation;
	if(windowOrientation === 0 || windowOrientation == 180) {
		
	}else if (windowOrientation == 90 || windowOrientation == -90) {

	}
	console.log("The orientation of the screen is: " + window.orientation);
});
//window.screen.orientation.lock('landscape');
window.screen.orientation
    .lock("portrait")
    .then(
        success => console.log(success),
        failure => console.log(failure)
    );
console.log('DEVICE!');