import * as THREE from 'three';

export class DroneMovement {
  constructor() {
    this.model = null;
    // 当前运动命令，格式: { hover: boolean, angle: number, speed: number, altitude: number }
    // 默认命令为悬停（水平无运动），高度稍后在加载模型时初始化
    this.command = { hover: true, angle: 0, speed: 0, altitude: 0 };
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

  // 在每帧调用，根据命令更新模型位置
  update(delta) {
    if (!this.model) return;
    const cmd = this.command || { hover: true, angle: 0, speed: 0, altitude: this.model.position.y };

    if (!cmd.hover) {
      // 计算水平运动：将极坐标（angle, speed）转换为笛卡尔坐标
      const dx = Math.cos(cmd.angle) * cmd.speed * delta;
      const dz = Math.sin(cmd.angle) * cmd.speed * delta;
      this.model.position.x += dx;
      this.model.position.z += dz;
    }
    // 平滑调整高度到目标 altitude（垂直运动）
    const currentY = this.model.position.y;
    const targetY = cmd.altitude;
    const lerpFactor = 0.2 * delta; // 高度调整速率
    this.model.position.y = currentY + (targetY - currentY) * lerpFactor;
  }
} 