import { memo, useEffect, useRef, useState } from 'react';

const DATE_INFO_UPDATE_INTERVAL_MS = 50;

interface DateInfoSnapshot {
  year: number;
  dayOfYear: number;
  yearPercentage: string;
  dayPercentage: string;
}

function calculateDateInfo(): DateInfoSnapshot {
  const now = new Date();
  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const endOfYear = new Date(year + 1, 0, 1);
  const yearPercentage = ((now.getTime() - startOfYear.getTime()) / (endOfYear.getTime() - startOfYear.getTime())) * 100;
  const startOfDay = new Date(year, now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(year, now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  const dayPercentage = ((now.getTime() - startOfDay.getTime()) / (endOfDay.getTime() - startOfDay.getTime())) * 100;

  return {
    year,
    dayOfYear,
    yearPercentage: `${yearPercentage.toFixed(7)}%`,
    dayPercentage: `${dayPercentage.toFixed(7)}%`,
  };
}

function DateInfo() {
  const [initialDateInfo] = useState<DateInfoSnapshot>(() => calculateDateInfo());
  const yearRef = useRef<HTMLSpanElement>(null);
  const dayOfYearRef = useRef<HTMLSpanElement>(null);
  const yearPercentageRef = useRef<HTMLSpanElement>(null);
  const dayPercentageRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const updateDateInfo = () => {
      const dateInfo = calculateDateInfo();

      if (yearRef.current) {
        yearRef.current.textContent = String(dateInfo.year);
      }
      if (dayOfYearRef.current) {
        dayOfYearRef.current.textContent = String(dateInfo.dayOfYear);
      }
      if (yearPercentageRef.current) {
        yearPercentageRef.current.textContent = dateInfo.yearPercentage;
      }
      if (dayPercentageRef.current) {
        dayPercentageRef.current.textContent = dateInfo.dayPercentage;
      }
    };

    updateDateInfo();
    const interval = window.setInterval(() => {
      updateDateInfo();
    }, DATE_INFO_UPDATE_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-1 text-xl leading-8 text-light-text-secondary dark:text-dark-text-secondary">
      <p>
        今天是 <span ref={yearRef}>{initialDateInfo.year}</span> 年·第{' '}
        <span ref={dayOfYearRef}>{initialDateInfo.dayOfYear}</span> 天
      </p>
      <p>
        今年过了{' '}
        <span ref={yearPercentageRef} className="inline-block w-[12ch] tabular-nums">
          {initialDateInfo.yearPercentage}
        </span>{' '}
        · 今天过了{' '}
        <span ref={dayPercentageRef} className="inline-block w-[12ch] tabular-nums">
          {initialDateInfo.dayPercentage}
        </span>
      </p>
      <p>时光似箭，日月如梭...</p>
    </div>
  );
}

export default memo(DateInfo);
