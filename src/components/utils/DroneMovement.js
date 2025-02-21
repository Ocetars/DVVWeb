export class DroneMovement {
  constructor() {
    this.model = null;
    // 当前运动命令，格式: { hover: boolean, angle: number, speed: number, altitude: number }
    // 默认命令为悬停（水平无运动），高度稍后在加载模型时初始化
    this.command = { hover: true, angle: 0, speed: 0, altitude: 0 };
    // 添加当前实际角度属性
    this.currentAngle = 0;
  }

  // 新增方法：设置加载后的无人机模型
  setModel(model) {
    this.model = model;
    // 初始化高度为模型当前高度
    this.command.altitude = model.position.y;
  }

  // 新增方法：设置新的运动控制命令
  // command 格式: { hover: boolean, angle: number, speed: number, altitude: number }
  setMovementCommand(command) {
    this.command = command;
  }

  // 新增：直接设置无人机位置
  setPosition(x, y, z) {
    if (this.model) {
      this.model.position.x = x;
      this.model.position.y = y;
      this.model.position.z = z;
    }
  }

  // 在每帧调用，根据命令更新模型位置
  update(delta) {
    if (!this.model) return;
    const cmd = this.command || { hover: true, angle: 0, speed: 0, altitude: this.model.position.y };

    if (!cmd.hover) {
      // 平滑过渡到目标角度
      const angleDiff = cmd.angle - this.currentAngle;
      // 处理角度跨越360度的情况
      if (angleDiff > Math.PI) {
        this.currentAngle += Math.PI * 2;
      } else if (angleDiff < -Math.PI) {
        this.currentAngle -= Math.PI * 2;
      }
      // 使用线性插值实现平滑转向
      const rotationSpeed = 2.0; // 调整该值可以改变转向速度
      this.currentAngle += (cmd.angle - this.currentAngle) * rotationSpeed * delta;

      // 使用实际当前角度计算移动
      const dx = Math.cos(this.currentAngle) * cmd.speed * delta;
      const dz = Math.sin(this.currentAngle) * cmd.speed * delta;
      this.model.position.x += dx;
      this.model.position.z += dz;
    }
    
    // 平滑调整高度到目标 altitude（垂直运动）
    const currentY = this.model.position.y;
    const targetY = cmd.altitude;
    const lerpFactor = 0.4 * delta; // 高度调整速率
    this.model.position.y = currentY + (targetY - currentY) * lerpFactor;
  }
} 