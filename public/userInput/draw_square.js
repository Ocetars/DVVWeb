// 使用全局变量存储状态，避免被重置
if (typeof window.currentStep === 'undefined') {
    window.currentStep = 0;
    window.startTime = Date.now();
}

const stepDuration = 2000; // 每个动作持续2秒

// 获取当前步骤已经执行的时间
const elapsedTime = Date.now() - window.startTime;

// 如果当前步骤执行时间超过预设时间，进入下一个步骤
if (elapsedTime >= stepDuration) {
    window.currentStep = (window.currentStep + 1) % 4;
    window.startTime = Date.now();
}

// 定义四个移动方向的命令（右、前、左、后）
const commands = [
    { hover: false, angle: 0, speed: 0.25, altitude: 1.0 },      // 向右
    { hover: false, angle: Math.PI/2, speed: 0.25, altitude: 1.0 },  // 向前
    { hover: false, angle: Math.PI, speed: 0.25, altitude: 1.0 },    // 向左
    { hover: false, angle: -Math.PI/2, speed: 0.25, altitude: 1.0 }  // 向后
];

// 返回当前步骤对应的命令和处理后的图像
return [commands[window.currentStep], frame];