export const Friends: Friend[] = [
  {
    title: 'pil0txia',
    description: '不会摄影的白帽子不是好机长！',
    website: 'https://www.pil0txia.com/',
    avatar: 'https://avatars.githubusercontent.com/u/41445332',
  },
]

export type Friend = {
  title: string
  description: string
  website: string
  avatar?: string
}
