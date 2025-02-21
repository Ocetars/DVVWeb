// 配置常量
const CONFIG = {
    SEARCH_PATTERN: {
        STEP_DURATION: 7000,
        COMMANDS: [
            { hover: false, angle: -Math.PI/2, speed: 0.3, altitude: 1.0 },  // 向前
            { hover: false, angle: 0, speed: 0.45, altitude: 1.0 },          // 向右
            { hover: false, angle: Math.PI/2, speed: 0.3, altitude: 1.0 },   // 向后
            { hover: false, angle: Math.PI, speed: 0.5, altitude: 1.0 }      // 向左
        ],
        ACTION_TEXTS: ['FORWARD', 'RIGHT', 'BACKWARD', 'LEFT']
    },
    RED_DETECTION: {
        HSV_LOWER: [0, 100, 100, 255],
        HSV_UPPER: [10, 255, 255, 255],
        ALIGNMENT_THRESHOLD: 5
    },
    DISPLAY: {
        FONT: cv.FONT_HERSHEY_SIMPLEX,
        COLOR: new cv.Scalar(0, 0, 128, 255),
        FONT_SCALE: 0.5,
        LINE_THICKNESS: 1.5
    }
};

// 初始化全局状态
if (typeof window.currentStep === 'undefined') {
    window.currentStep = 0;
}

// 工具函数
function cleanup(resources) {
    resources.forEach(resource => {
        if (resource && typeof resource.delete === 'function') {
            resource.delete();
        }
    });
}

// 获取当前高度
const currentHeight = drone.movement.model.position.y;

// 初始化OpenCV对象
const hsvFrame = new cv.Mat();
const mask = new cv.Mat();
const contours = new cv.MatVector();
const hierarchy = new cv.Mat();

try {
    // HSV 转换和红色检测
    cv.cvtColor(frame, hsvFrame, cv.COLOR_RGB2HSV);
    const lowerRed = new cv.Mat(hsvFrame.rows, hsvFrame.cols, hsvFrame.type(), CONFIG.RED_DETECTION.HSV_LOWER);
    const upperRed = new cv.Mat(hsvFrame.rows, hsvFrame.cols, hsvFrame.type(), CONFIG.RED_DETECTION.HSV_UPPER);
    cv.inRange(hsvFrame, lowerRed, upperRed, mask);

    // 形态学处理
    const kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(5, 5));
    cv.morphologyEx(mask, mask, cv.MORPH_OPEN, kernel);
    cv.morphologyEx(mask, mask, cv.MORPH_CLOSE, kernel);

    // 轮廓检测
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
        const circle = cv.minEnclosingCircle(maxContour);
        
        // 绘制检测结果
        cv.circle(frame, circle.center, circle.radius, new cv.Scalar(0, 255, 0, 255), 2);
        
        // 计算偏移
        const imageCenter = frame.cols / 2;
        const imageMiddle = frame.rows / 2;
        const xOffset = circle.center.x - imageCenter;
        const yOffset = circle.center.y - imageMiddle;
        
        // 判断是否对准
        const isAligned = Math.abs(xOffset) <= CONFIG.RED_DETECTION.ALIGNMENT_THRESHOLD && 
                         Math.abs(yOffset) <= CONFIG.RED_DETECTION.ALIGNMENT_THRESHOLD;

        // 显示状态信息
        const { FONT, COLOR, FONT_SCALE, LINE_THICKNESS } = CONFIG.DISPLAY;
        cv.putText(frame, 'Red Circle Detected', new cv.Point(10, 20), 
                   FONT, FONT_SCALE, COLOR, LINE_THICKNESS);
        cv.putText(frame, `Alignment: ${isAligned ? 'Aligned' : 'Aligning'}`, 
                   new cv.Point(10, 45), FONT, FONT_SCALE, COLOR, LINE_THICKNESS);
        cv.putText(frame, `Offset: X=${xOffset.toFixed(1)}, Y=${yOffset.toFixed(1)}`,
                   new cv.Point(10, 70), FONT, FONT_SCALE, COLOR, LINE_THICKNESS);

        cleanup([hsvFrame, lowerRed, upperRed, mask, kernel, contours, hierarchy]);

        if (!isAligned) {
            // 计算移动参数
            const offset = Math.sqrt(xOffset * xOffset + yOffset * yOffset);
            const speed = Math.min(Math.max(offset / 100, 0.1), 0.3);
            const angle = Math.abs(xOffset) > Math.abs(yOffset)
                ? (xOffset > 0 ? 0 : Math.PI)
                : (yOffset > 0 ? Math.PI / 2 : -Math.PI / 2);
            
            return [{ 
                hover: false, 
                angle: angle,
                speed: speed,
                altitude: 1.0 
            }, frame];
        } else {
            return [{ 
                hover: true, 
                angle: 0, 
                speed: 0, 
                altitude: 0.1 
            }, frame];
        }
    } else {
        cleanup([hsvFrame, lowerRed, upperRed, mask, kernel, contours, hierarchy]);

        if (currentHeight < 1.0) {
            return [{
                hover: true,
                angle: Math.PI/2,
                speed: 0.2,
                altitude: 1.2
            }, frame];
        } else {
            // 执行搜索模式
            if (!window.startTime) {
                window.startTime = Date.now();
                window.currentStep = 0;
            }

            const elapsedTime = Date.now() - window.startTime;
            if (elapsedTime >= CONFIG.SEARCH_PATTERN.STEP_DURATION) {
                window.currentStep = (window.currentStep + 1) % 4;
                window.startTime = Date.now();
            }

            // 显示搜索状态
            const { FONT, COLOR, FONT_SCALE, LINE_THICKNESS } = CONFIG.DISPLAY;
            cv.putText(frame, `Action: ${CONFIG.SEARCH_PATTERN.ACTION_TEXTS[window.currentStep]}`, 
                       new cv.Point(10, 20), FONT, FONT_SCALE, COLOR, LINE_THICKNESS);
            cv.putText(frame, 'Searching...', new cv.Point(10, 45),
                       FONT, FONT_SCALE, COLOR, LINE_THICKNESS);

            return [CONFIG.SEARCH_PATTERN.COMMANDS[window.currentStep], frame];
        }
    }
} catch (error) {
    console.error('处理错误:', error);
    cleanup([hsvFrame, lowerRed, upperRed, mask, kernel, contours, hierarchy]);
    return [CONFIG.SEARCH_PATTERN.COMMANDS[window.currentStep], frame];
}