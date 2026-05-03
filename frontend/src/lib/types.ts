export type Role = "user" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  isVerified: boolean;
  createdAt?: string;
}

export interface Product {
  _id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  salePrice?: number;
  images: string[];
  fileUrl?: string;
  version?: string;
  techStack: string[];
  rating: number;
  numReviews: number;
  downloads: number;
  seller?: Pick<User, "_id" | "name" | "avatar">;
  isPublished?: boolean;
  createdAt?: string;
}

export interface Review {
  _id: string;
  product: string;
  user: { _id: string; name: string; avatar?: string };
  rating: number;
  comment: string;
  createdAt: string;
}

export type OrderStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  product: Product;
  price: number;
  qty: number;
}

export interface Order {
  _id: string;
  user: string | User;
  orderItems: OrderItem[];
  totalAmount: number;
  paymentStatus: OrderStatus;
  sessionId?: string;
  createdAt: string;
}

export interface Category {
  _id: string;
  count: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}
export interface ApiList<T> {
  success: true;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: T[];
}
