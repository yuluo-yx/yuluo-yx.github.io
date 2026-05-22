import type { IconType } from 'react-icons';
import {
  FiBookOpen,
  FiCamera,
  FiFileText,
  FiFolder,
  FiLink,
  FiUser,
} from 'react-icons/fi';

export interface NavItem {
  name: string;
  path: string;
  icon: IconType;
}

export const navItems: NavItem[] = [
  { name: 'About', path: '/', icon: FiUser },
  { name: 'Blogs', path: '/blogs', icon: FiFileText },
  { name: 'Projects', path: '/projects', icon: FiFolder },
  { name: 'Topics', path: '/topics', icon: FiBookOpen },
  { name: 'Gallery', path: '/gallery', icon: FiCamera },
  { name: 'Links', path: '/links', icon: FiLink },
];
