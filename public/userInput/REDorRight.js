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
    
    // 初始高度和目标高度
    const searchAltitude = 1.0;  // 搜索时的高度
    const targetAltitude = 0.2;  // 最终悬停高度
    
    // 判断是否在目标正上方（允许小范围偏差）
    const isAligned = Math.abs(xOffset) <= 10 && Math.abs(yOffset) <= 10;
    
    if (!isAligned) {
        // 如果未对准，保持在较高位置调整水平位置
        let angle;
        if (Math.abs(xOffset) > Math.abs(yOffset)) {
            // 左右偏移更大，优先调整水平方向
            angle = xOffset > 0 ? 0 : Math.PI;
        } else {
            // 前后偏移更大，优先调整前后方向
            angle = yOffset > 0 ? Math.PI / 2 : -Math.PI / 2;
        }
        
        clearMemory();
        return [{ 
            hover: false, 
            angle: angle,
            speed: 0.1,
            altitude: searchAltitude 
        }, frame];
    } else {
        // 已对准，判断是否需要下降
        const currentAltitude = drone.movement.model.position.y;
        if (Math.abs(currentAltitude - targetAltitude) > 0.05) {
            // 需要下降，保持水平位置不变
            clearMemory();
            return [{ 
                hover: true, 
                angle: 0, 
                speed: 0, 
                altitude: targetAltitude 
            }, frame];
        } else {
            // 位置已调整完成，保持悬停
            clearMemory();
            return [{ 
                hover: true, 
                angle: 0, 
                speed: 0, 
                altitude: targetAltitude 
            }, frame];
        }
    }
} else {
    // 如果没有找到红色圆，在较高位置向右移动查找
    clearMemory();
    return [{ 
        hover: false, 
        angle: 0, 
        speed: 0.1, 
        altitude: drone.movement.model.position.y 
    }, frame];
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