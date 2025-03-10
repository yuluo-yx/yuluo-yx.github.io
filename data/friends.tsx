export const Friends: Friend[] = [
  {
    title: 'pil0txia',
    description: '不会摄影的白帽子不是好机长！',
    website: 'https://www.pil0txia.com/',
    avatar: 'https://avatars.githubusercontent.com/u/41445332',
  },
  {
    title: 'Cuthbert',
    description: 'Hi there, I am Cuthbert, a software engineer.',
    website: 'https://cxhello.top',
    avatar: 'https://cxhello.top/_next/image?url=%2Fstatic%2Fimages%2Flogo.jpg&w=256&q=100',
  },

]

export type Friend = {
  title: string
  description: string
  website: string
  avatar?: string
}
