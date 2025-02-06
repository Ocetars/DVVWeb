# Drone Vision Verification Web
无人机视觉方案验证平台

## API规范

### 基础运动控制
```javascript
// 前进
drone.moveForward(speedFactor = 1, duration = 0)
// 后退
drone.moveBackward(speedFactor = 1, duration = 0)
// 左移
drone.moveLeft(speedFactor = 1, duration = 0)
// 右移
drone.moveRight(speedFactor = 1, duration = 0)
// 上升
drone.moveUp(speedFactor = 1, duration = 0)
// 下降
drone.moveDown(speedFactor = 1, duration = 0)
// 立即停止
drone.stop()

参数说明：
- speedFactor: 速度系数（0.1~2.0）
- duration: 持续时间（秒），0表示持续运动直到调用stop()
```

### 摄像头访问
用户代码接收 frame 参数，这是当前帧的图像
```javascript
// 创建一个灰度图像
let gray = new cv.Mat();
cv.cvtColor(frame, gray, cv.COLOR_RGBA2GRAY);

// 创建一个彩色图像用于显示结果
let result = new cv.Mat();
cv.cvtColor(gray, result, cv.COLOR_GRAY2RGBA);

// 清理内存
gray.delete();

// 返回处理后的图像
return result;
```
```javascript
// 显示处理结果：
cv.customImshow(processedMat)
```

### 使用示例
```javascript
// 控制示例：前进2秒后右转
drone.moveForward(1, 2)
setTimeout(() => drone.moveRight(0.8, 1.5), 2000)
```
```javascript
// 图像处理示例：转换为灰度图
function processFrame(frame, cv) {
  const gray = new cv.Mat()
  cv.cvtColor(frame, gray, cv.COLOR_RGBA2GRAY)
  return gray
}
```

## 注意事项

1. 速度系数建议范围：0.1~2.0
2. 坐标系说明：Y轴为垂直方向，X/Z为水平面
3. 图像处理函数中请及时释放Mat对象：
    ```javascript
    mat.delete() // 处理完成后手动释放内存
    ```
4. 避免长时间阻塞操作，保持帧率在30fps以上
5. 使用try-catch处理图像处理异常