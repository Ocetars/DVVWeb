// 初始化全局状态
if (typeof window.currentStep === 'undefined') {
    window.currentStep = 0;
    window.startTime = Date.now();
}

// 使用 OpenCV 进行红色圆检测
const hsvFrame = new cv.Mat();
cv.cvtColor(frame, hsvFrame, cv.COLOR_RGB2HSV);

// 定义红色范围（HSV 颜色空间）
const lowerRed = new cv.Mat(hsvFrame.rows, hsvFrame.cols, hsvFrame.type(), [0, 100, 100, 255]);
const upperRed = new cv.Mat(hsvFrame.rows, hsvFrame.cols, hsvFrame.type(), [10, 255, 255, 255]);
const mask = new cv.Mat();
cv.inRange(hsvFrame, lowerRed, upperRed, mask);

// 形态学操作去除噪声
const kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(5, 5));
cv.morphologyEx(mask, mask, cv.MORPH_OPEN, kernel);
cv.morphologyEx(mask, mask, cv.MORPH_CLOSE, kernel);

// 查找轮廓
const contours = new cv.MatVector();
const hierarchy = new cv.Mat();
cv.findContours(mask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

// 查找最大轮廓
let maxContour = null;
let maxArea = 0;
for (let i = 0; i < contours.size(); i++) {
    const contour = contours.get(i);
    const area = cv.contourArea(contour);
    if (area > maxArea) {
        maxArea = area;
        maxContour = contour;
    }
}

// 如果找到红色圆
if (maxContour) {
    // 计算最小外接圆
    let circle = cv.minEnclosingCircle(maxContour);
    
    // 在图像上绘制检测结果
    cv.circle(frame, circle.center, circle.radius, new cv.Scalar(0, 255, 0, 255), 2);
    
    // 计算圆心在图像中的相对位置
    const imageCenter = frame.cols / 2;
    const imageMiddle = frame.rows / 2;
    const xOffset = circle.center.x - imageCenter;
    const yOffset = circle.center.y - imageMiddle;
    
    // 判断是否在目标正上方（允许小范围偏差）
    const isAligned = Math.abs(xOffset) <= 10 && Math.abs(yOffset) <= 10;
    
    if (!isAligned) {
        // 如果未对准，调整位置
        let angle;
        if (Math.abs(xOffset) > Math.abs(yOffset)) {
            angle = xOffset > 0 ? 0 : Math.PI;
        } else {
            angle = yOffset > 0 ? Math.PI / 2 : -Math.PI / 2;
        }
        
        clearMemory();
        return [{ 
            hover: false, 
            angle: angle,
            speed: 0.1,
            altitude: 1.0 
        }, frame];
    } else {
        // 已对准，降低到0.1米高度
        clearMemory();
        return [{ 
            hover: true, 
            angle: 0, 
            speed: 0, 
            altitude: 0.1 
        }, frame];
    }
} else {
    // 如果没找到红色圆，继续画正方形
    const stepDuration = 2000; // 每个动作持续2秒
    const elapsedTime = Date.now() - window.startTime;

    if (elapsedTime >= stepDuration) {
        window.currentStep = (window.currentStep + 1) % 4;
        window.startTime = Date.now();
    }

    const commands = [
        { hover: false, angle: 0, speed: 0.25, altitude: 1.0 },      // 向右
        { hover: false, angle: Math.PI/2, speed: 0.25, altitude: 1.0 },  // 向前
        { hover: false, angle: Math.PI, speed: 0.25, altitude: 1.0 },    // 向左
        { hover: false, angle: -Math.PI/2, speed: 0.25, altitude: 1.0 }  // 向后
    ];

    clearMemory();
    return [commands[window.currentStep], frame];
}

function clearMemory() {
    // 释放内存
    hsvFrame.delete();
    lowerRed.delete();
    upperRed.delete();
    mask.delete();
    kernel.delete();
    contours.delete();
    hierarchy.delete();
}

// 用来调试
return [{ 
    hover: true, 
    angle: 0, 
    speed: 0, 
    altitude: 0.2 
}, frame];