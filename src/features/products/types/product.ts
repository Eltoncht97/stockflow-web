export type ProductCategory = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  minStock: number;
  isActive: boolean;
  categoryId: string;
  category: ProductCategory;
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = {
  sku: string;
  name: string;
  description: string | null;
  categoryId: string;
  price: string;
  minStock: number;
};
