import { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
}

interface Branch {
  start: Point;
  length: number;
  theta: number;
}

interface PlumOptions {
  speed?: number; // 控制生长速度的帧率除数，越大越慢
  density?: number; // 控制茂密程度，0-1之间，越大越茂密
  startPoints?: Point[]; // 起始点
  color?: string; // 梅花颜色
}

export function usePlum(options: PlumOptions = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { speed = 5, density = 0.7, startPoints = [], color = 'rgba(139, 92, 246, 0.3)' } = options;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置canvas尺寸为窗口大小
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 初始化
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;

    let pendingTasks: (() => void)[] = [];

    // 从指定点开始生成梅花
    function init() {
      if (!canvas) return;
      
      if (startPoints.length === 0) {
        // 默认从左下角和右下角开始
        const leftBottom = { x: 0, y: canvas.height };
        const rightBottom = { x: canvas.width, y: canvas.height };
        
        step({
          start: leftBottom,
          length: 10,
          theta: -Math.PI / 4, // 向右上生长
        });
        
        step({
          start: rightBottom,
          length: 10,
          theta: -3 * Math.PI / 4, // 向左上生长
        });
      } else {
        // 使用自定义起始点
        startPoints.forEach(point => {
          step({
            start: point,
            length: 10,
            theta: -Math.PI / 4,
          });
        });
      }
    }

    function step(b: Branch, depth = 0) {
      const end = getEndPoint(b);
      drawBranch(b);

      // 限制生长范围到屏幕高度的一半
      if (!canvas) return;
      const halfHeight = canvas.height / 2;
      if (end.y < halfHeight) {
        return; // 如果已经超过一半高度，停止生长
      }

      // 让梅花自然分裂，不是每次都产生两个分支
      if (depth < 4 || Math.random() < 0.5) {
        // 左分支 - 更大的角度变化
        const leftEnd = getEndPoint({
          start: end,
          length: b.length + (Math.random() * 2 - 1),
          theta: b.theta - 0.2 * Math.random(),
        });
        
        // 只有在范围内才继续生长
        if (leftEnd.y >= halfHeight) {
          pendingTasks.push(() =>
            step(
              {
                start: end,
                length: b.length + (Math.random() * 2 - 1),
                theta: b.theta - 0.2 * Math.random(),
              },
              depth + 1
            )
          );
        }
      }
      
      if (depth < 4 || Math.random() < 0.5) {
        // 右分支
        const rightEnd = getEndPoint({
          start: end,
          length: b.length + (Math.random() * 2 - 1),
          theta: b.theta + 0.2 * Math.random(),
        });
        
        // 只有在范围内才继续生长
        if (rightEnd.y >= halfHeight) {
          pendingTasks.push(() =>
            step(
              {
                start: end,
                length: b.length + (Math.random() * 2 - 1),
                theta: b.theta + 0.2 * Math.random(),
              },
              depth + 1
            )
          );
        }
      }
    }

    function frame() {
      const tasks: (() => void)[] = [];
      pendingTasks = pendingTasks.filter((task) => {
        // 根据密度调整任务执行概率
        if (Math.random() > (1 - density)) {
          tasks.push(task);
          return false;
        }
        return true;
      });
      tasks.forEach((fn) => fn());
    }

    let framesCount = 0;
    let animationId: number;

    function startFrame() {
      animationId = requestAnimationFrame(() => {
        framesCount += 1;
        // 根据speed控制生长速度
        if (framesCount % speed === 0) {
          frame();
        }
        startFrame();
      });
    }

    function lineTo(p1: Point, p2: Point) {
      if (!ctx) return;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    function getEndPoint(b: Branch): Point {
      return {
        x: b.start.x + b.length * Math.cos(b.theta),
        y: b.start.y + b.length * Math.sin(b.theta),
      };
    }

    function drawBranch(b: Branch) {
      lineTo(b.start, getEndPoint(b));
    }

    // 启动
    init();
    startFrame();

    // 清理
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [speed, density, startPoints, color]);

  return canvasRef;
}
