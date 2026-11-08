export type Role = 'USER' | 'ADMIN';

export interface Links {
  self?: string;
  update?: string;
  delete?: string;
  [name: string]: string | undefined;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  interests: string[];
  _links?: Links;
}

export interface Note {
  _id: string;
  owner: string | { _id: string; name: string } | null;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  _links: Links;
}

export interface Post {
  _id: string;
  author: string | { _id: string; name: string };
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  _links: Links;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  _links: {
    self: string;
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
}

export interface InterestGroup {
  interest: string;
  count: number;
  users: { _id: string; name: string }[];
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface MessageResponse {
  message: string;
}

// GET /users/:id/posts
export interface UserPosts extends Paginated<Post> {
  user: { _id: string; name: string };
}
