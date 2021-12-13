/**
 * npm 배포 명령 실행
 */
const execSync = require('child_process').execSync;

// 배포 리스트
const list = [];

// 쉘 명령 실행결과 반환
console.log(execSync("echo 'test'", { encoding: 'UTF-8' }));