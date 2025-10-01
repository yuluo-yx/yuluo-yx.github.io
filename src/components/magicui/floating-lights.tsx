import React, { useEffect, useRef } from 'react'

interface FloatingLight {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  glowSize: number
  pulseSpeed: number
}

interface FloatingLightsProps {
  quantity?: number
  className?: string
  colors?: string[]
  minSize?: number
  maxSize?: number
  speed?: number
}

export default function FloatingLights({
  quantity = 15,
  className = '',
  colors = ['#06b6d4', '#67e8f9', '#a7f3d0', '#e0f2fe'],
  minSize = 1,
  maxSize = 3,
  speed = 0.3,
}: FloatingLightsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lightsRef = useRef<FloatingLight[]>([])
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createLight = (id: number): FloatingLight => {
      return {
        id,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        size: minSize + Math.random() * (maxSize - minSize),
        opacity: 0.4 + Math.random() * 0.6,
        color: colors[Math.floor(Math.random() * colors.length)] || '#06b6d4',
        glowSize: 8 + Math.random() * 12,
        pulseSpeed: 0.005 + Math.random() * 0.01,
      }
    }

    const initializeLights = () => {
      lightsRef.current = Array.from({ length: quantity }, (_, i) => createLight(i))
    }

    const updateLight = (light: FloatingLight, time: number) => {
      // 更新位置
      light.x += light.vx
      light.y += light.vy

      // 边界检测和反弹
      if (light.x <= 0 || light.x >= canvas.width) {
        light.vx *= -1
        light.x = Math.max(0, Math.min(canvas.width, light.x))
      }
      if (light.y <= 0 || light.y >= canvas.height) {
        light.vy *= -1
        light.y = Math.max(0, Math.min(canvas.height, light.y))
      }

      // 温和的脉冲效果
      light.opacity = 0.4 + 0.3 * (1 + Math.sin(time * light.pulseSpeed)) / 2
      light.size = (minSize + maxSize) / 2 + ((maxSize - minSize) / 6) * Math.sin(time * light.pulseSpeed * 1.2)
    }

    const drawLight = (light: FloatingLight) => {
      const gradient = ctx.createRadialGradient(
        light.x,
        light.y,
        0,
        light.x,
        light.y,
        light.glowSize,
      )

      // 创建发光效果
      gradient.addColorStop(0, `${light.color}${Math.floor(light.opacity * 255).toString(16).padStart(2, '0')}`)
      gradient.addColorStop(0.4, `${light.color}${Math.floor(light.opacity * 0.4 * 255).toString(16).padStart(2, '0')}`)
      gradient.addColorStop(1, `${light.color}00`)

      // 绘制光晕
      ctx.save()
      ctx.globalCompositeOperation = 'screen'
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(light.x, light.y, light.glowSize, 0, Math.PI * 2)
      ctx.fill()

      // 绘制核心光点
      ctx.globalCompositeOperation = 'screen'
      const coreGradient = ctx.createRadialGradient(
        light.x,
        light.y,
        0,
        light.x,
        light.y,
        light.size,
      )
      coreGradient.addColorStop(0, `#ffffff${Math.floor(light.opacity * 200).toString(16).padStart(2, '0')}`)
      coreGradient.addColorStop(0.6, `${light.color}${Math.floor(light.opacity * 180).toString(16).padStart(2, '0')}`)
      coreGradient.addColorStop(1, `${light.color}00`)

      ctx.fillStyle = coreGradient
      ctx.beginPath()
      ctx.arc(light.x, light.y, light.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      lightsRef.current.forEach((light) => {
        updateLight(light, time)
        drawLight(light)
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // 初始化
    resizeCanvas()
    initializeLights()
    animate(0)

    // 添加窗口大小变化监听器
    window.addEventListener('resize', resizeCanvas)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [quantity, colors, minSize, maxSize, speed])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 z-0 ${className}`}
      style={{
        width: '100%',
        height: '100%',
      }}
    />
  )
}
