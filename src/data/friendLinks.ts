import { siteBrand } from '../config/brand';

export interface FriendLink {
  id: string;
  name: string;
  href: string;
  description: string;
  avatar: string;
  tags?: string[];
}

export const myFriendCard: FriendLink = {
  id: 'yuluo',
  name: siteBrand.name,
  href: siteBrand.url,
  description: siteBrand.description,
  avatar: siteBrand.logoPath,
  tags: ['AI', 'Opensource', 'MicroService'],
};

export const friendLinks: FriendLink[] = [
  {
    id: 'pil0txia',
    name: 'pil0txia',
    description: '不会摄影的白帽子不是好机长！',
    href: 'https://www.pil0txia.com/',
    avatar: 'https://avatars.githubusercontent.com/u/41445332',
  },
  {
    id: 'cuthbert',
    name: 'Cuthbert',
    description: 'Hi there, I am Cuthbert, a software engineer.',
    href: 'https://cxhello.top',
    avatar: 'https://cxhello.top/_next/image?url=%2Fstatic%2Fimages%2Flogo.jpg&w=256&q=100',
  },
];
