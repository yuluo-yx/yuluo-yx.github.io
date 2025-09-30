import React, { useEffect, useState } from 'react'

function DateInfo() {
  const [dateInfo, setDateInfo] = useState<string>('')

  const calculateDateInfo = () => {
    const now = new Date()
    const year = now.getFullYear()
    const startOfYear = new Date(year, 0, 1)
    const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const endOfYear = new Date(year + 1, 0, 1)
    const yearPercentage = ((now.getTime() - startOfYear.getTime()) / (endOfYear.getTime() - startOfYear.getTime())) * 100
    const startOfDay = new Date(year, now.getMonth(), now.getDate(), 0, 0, 0, 0)
    const endOfDay = new Date(year, now.getMonth(), now.getDate() + 1, 0, 0, 0, 0)
    const dayPercentage = ((now.getTime() - startOfDay.getTime()) / (endOfDay.getTime() - startOfDay.getTime())) * 100

    return `今天是 ${year} 年·第 ${dayOfYear} 天 · 今年过了 ${yearPercentage.toFixed(8)}% 今天过了 ${dayPercentage.toFixed(10)}%，时光似箭，日月如梭... \n`
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setDateInfo(calculateDateInfo())
    }, 50) // 从1000ms改为50ms，提升更新频率

    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      {dateInfo}
    </div>
  )
}

export default DateInfo
