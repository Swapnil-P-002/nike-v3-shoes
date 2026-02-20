export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  category: string;
  sizes: number[];
  colors: { name: string; hex: string }[];
  images: string[];
  description: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  stock?: number;
  lastAction?: "add" | "edit" | "delete";
  isPendingDelete?: boolean;
  isSoftDeleted?: boolean;
  deletedAt?: string;
  previousState?: any;
}

export const products: Product[] = [];
