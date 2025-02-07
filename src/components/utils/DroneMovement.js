import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class DroneMovement {
  constructor(scene) {
    this.scene = scene;
    this.clock = new THREE.Clock();
    this.model = null;
    this.mixer = null; // 动画混合器
    this.animations = []; // 存储动画片段
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.maxSpeed = 0.005;
    this.altitude = 0.5;

    // 运动控制队列
    this.commandQueue = [];
    this.activeCommand = null;

    this.loadModel();
  }

  loadModel() {
    const loader = new GLTFLoader();
    loader.load(
      '/dji_phantom_4_animation/scene.gltf',
      (gltf) => {
        this.model = gltf.scene;
        // 调整模型大小和位置
        this.model.scale.set(1, 1, 1);
        this.model.position.set(0, 0.5, 0.5);
        this.model.rotation.y = -Math.PI / 2;
        this.scene.add(this.model);

        // 设置动画
        this.mixer = new THREE.AnimationMixer(this.model);
        this.animations = gltf.animations;
        if (this.animations.length > 0) {
          this.animations.forEach(clip => {
            const action = this.mixer.clipAction(clip);
            action.setDuration(1); // 动画持续时间
            action.timeScale = 1.5; // 加速播放
            action.play();
            console.log('播放动画:', clip.name);
          });
        }
        console.log('动画列表:', this.animations);
      },
      (progress) => {
        console.log('加载进度:', (progress.loaded / progress.total * 100) + '%');
      },
      (error) => {
        console.error('模型加载出错:', error);
      }
    );
  }

  // 运动控制方法
  moveForward(speedFactor = 1, duration = 0) {
    this.enqueueCommand('forward', speedFactor, duration);
  }

  moveBackward(speedFactor = 1, duration = 0) {
    this.enqueueCommand('backward', speedFactor, duration);
  }

  moveLeft(speedFactor = 1, duration = 0) {
    this.enqueueCommand('left', speedFactor, duration);
  }

  moveRight(speedFactor = 1, duration = 0) {
    this.enqueueCommand('right', speedFactor, duration);
  }

  moveUp(speedFactor = 1, duration = 0) {
    this.enqueueCommand('up', speedFactor, duration);
  }

  moveDown(speedFactor = 1, duration = 0) {
    this.enqueueCommand('down', speedFactor, duration);
  }

  enqueueCommand(movement, speedFactor = 1, duration = 0) {
    console.log(`入队命令: ${movement}, 速度因子: ${speedFactor}, 持续时间: ${duration}`);
    if (duration <= 0) {
      console.log('持续时间为0或负数，命令被忽略');
      return;
    }
    
    // 检查是否已有相同的命令在队列中
    const hasSameCommand = this.commandQueue.some(cmd => 
      cmd.movement === movement && 
      cmd.speedFactor === speedFactor && 
      cmd.duration === duration
    );
    
    if (hasSameCommand) {
      console.log('已有相同命令在队列中，忽略重复命令');
      return;
    }
    
    this.commandQueue.push({ movement, speedFactor, duration });
    console.log('命令已入队，当前队列长度:', this.commandQueue.length);
    this.tryStartNextCommand();
  }

  tryStartNextCommand() {
    if (!this.activeCommand && this.commandQueue.length > 0) {
      const command = this.commandQueue.shift();
      this.startCommand(command);
    }
  }

  startCommand(command) {
    this.activeCommand = {
      ...command,
      endTime: performance.now() + command.duration * 1000
    };
    // 根据命令设置速度
    switch (command.movement) {
      case 'forward': 
        this.velocity.set(0, 0, -this.maxSpeed * command.speedFactor); 
        break;
      case 'backward': 
        this.velocity.set(0, 0, this.maxSpeed * command.speedFactor); 
        break;
      case 'left': 
        this.velocity.set(-this.maxSpeed * command.speedFactor, 0, 0); 
        break;
      case 'right': 
        this.velocity.set(this.maxSpeed * command.speedFactor, 0, 0); 
        break;
      case 'up': 
        this.velocity.set(0, this.maxSpeed * command.speedFactor, 0); 
        break;
      case 'down': 
        this.velocity.set(0, -this.maxSpeed * command.speedFactor, 0); 
        break;
      default: 
        this.velocity.set(0, 0, 0);
    }
    console.log(`开始${command.movement}运动, 持续${command.duration}秒`);
  }

  stopCommand() {
    if (this.activeCommand) {
      console.log(`结束${this.activeCommand.movement}运动`);
      this.velocity.set(0, 0, 0);
      this.activeCommand = null;
    }
  }

  update(delta) {
    // 更新动画混合器，保证动画与帧率无关
    if (this.mixer) {
      this.mixer.update(delta);
    }

    // 检查当前命令是否完成
    if (this.activeCommand) {
      const currentTime = performance.now();
      console.log(`当前时间: ${currentTime}, 结束时间: ${this.activeCommand.endTime}`);
      console.log(`当前命令: ${this.activeCommand.movement}, 速度: ${JSON.stringify(this.velocity)}`);
      
      if (currentTime >= this.activeCommand.endTime) {
        console.log('命令执行完成，停止运动');
        this.stopCommand();
        this.tryStartNextCommand();
      }
    }

    // 运动模型
    if (this.model) {
      const frameVelocity = this.velocity.clone().multiplyScalar(delta * 60);
      this.model.position.add(frameVelocity);
      this.altitude = this.model.position.y;
    }
  }
} 