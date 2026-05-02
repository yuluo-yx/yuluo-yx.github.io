import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface TimelineItem {
  year: string;
  title: string;
  organization: string;
  description: string;
  type: 'work' | 'education';
}

interface TimelineProps {
  items: TimelineItem[];
}

export default function Timeline({ items }: TimelineProps) {
  // Parse dates and calculate positions
  const timelineData = useMemo(() => {
    const dates = items.map(item => new Date(item.year));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // Generate month markers
    const months: Date[] = [];
    const current = new Date(minDate);
    current.setDate(1);
    
    while (current <= maxDate) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }
    
    const totalDuration = Math.max(1, maxDate.getTime() - minDate.getTime());
    
    return {
      items: items.map((item, index) => ({
        ...item,
        date: dates[index],
        position: ((dates[index].getTime() - minDate.getTime()) / totalDuration) * 100,
      })),
      months: months.map(month => ({
        date: month,
        position: ((month.getTime() - minDate.getTime()) / totalDuration) * 100,
        label: month.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' }),
      })),
    };
  }, [items]);

  return (
    <div className="relative mt-8 md:mt-12">
      {/* 移动端使用纵向时间线，避免横向节点挤压重叠。 */}
      <div className="md:hidden">
        <div className="relative pl-5">
          <div className="absolute left-2 top-2 bottom-2 w-px bg-primary/40" />
          <div className="space-y-4">
            {timelineData.items.map((item, index) => (
              <motion.article
                key={`${item.year}-${item.title}`}
                className="relative rounded-lg border border-gray-200 bg-white/95 p-4 shadow-sm dark:border-gray-800 dark:bg-black/95"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3) }}
              >
                <span className="absolute -left-[19px] top-5 h-3 w-3 rounded-full border-2 border-light-bg bg-primary dark:border-dark-bg" />
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <time className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    {item.year}
                  </time>
                  <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                    {item.organization}
                  </span>
                </div>
                <h3 className="text-base font-bold leading-snug text-light-text dark:text-dark-text">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-light-text-secondary dark:text-dark-text-secondary">
                  {item.description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mb-24 hidden px-4 py-8 md:block">
        <div className="relative h-48">
        {/* Horizontal Line */}
        <div className="absolute left-0 right-0 bottom-12 h-0.5 bg-primary" />

        {/* Month Markers */}
        {timelineData.months.map((month, index) => (
          <div
            key={index}
            className="absolute bottom-12"
            style={{ left: `${month.position}%` }}
          >
            {/* Tick mark */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-primary/50" />
            {/* Month label - tilted */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary inline-block transform -rotate-45 origin-center">
                {month.label}
              </span>
            </div>
          </div>
        ))}

        {/* Timeline Events */}
        {timelineData.items.map((item, index) => {
          const isAbove = index % 2 === 0;
          const lineHeight = 60 + (index % 3) * 30; // 更长的层次不齐高度
          
          return (
            <motion.div
              key={index}
              className="absolute bottom-12 group cursor-pointer"
              style={{ left: `${item.position}%` }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Tooltip Card - Shows on hover */}
              <div className={`absolute ${isAbove ? 'bottom-full mb-4' : 'top-full mt-4'} left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20`}>
                <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg p-3 shadow-xl border border-gray-200 dark:border-gray-800 w-56">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-primary">
                      {item.year}
                    </span>
                  </div>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Vertical Line - 上下交错 */}
              <motion.div
                className={`absolute left-1/2 -translate-x-1/2 w-0.5 bg-primary group-hover:bg-primary/80 transition-colors ${isAbove ? 'bottom-0' : 'top-0'}`}
                initial={{ height: 0 }}
                whileInView={{ height: `${lineHeight}px` }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
              />

              {/* Event Title at the end of line */}
              <div className={`absolute left-1/2 -translate-x-1/2 text-center w-max max-w-[100px] ${isAbove ? 'bottom-full mb-1' : 'top-full mt-1'}`}
                   style={{ [isAbove ? 'bottom' : 'top']: `${lineHeight}px` }}>
                <p className="text-xs font-bold text-light-text dark:text-dark-text group-hover:text-primary transition-colors">
                  {item.title}
                </p>
              </div>
            </motion.div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
