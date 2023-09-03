import { FeedPost } from 'src/feed/models/post.interface';
import { Role } from './role.enum';

export interface User {
  id?: number;
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: Role;
  posts?: FeedPost[];
}
