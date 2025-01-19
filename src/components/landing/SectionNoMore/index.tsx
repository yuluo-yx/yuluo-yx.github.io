import { Icon } from '@iconify/react'
import type React from 'react'

interface SectionNoMoreProps {
  title: string | JSX.Element
  icon?: string
  href?: string
  children: React.ReactNode
}

export function SectionNoMore({ title, icon, href, children }: SectionNoMoreProps) {
  return (
    <section className="group/section py-2 max-lg:mx-4">
      <div className="mb-4 mt-8 inline-flex w-full items-center justify-between md:mt-6">
        <h2 className="m-0 inline-flex items-center justify-center gap-1 text-base">
          {icon && <Icon icon={icon} />}
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}
