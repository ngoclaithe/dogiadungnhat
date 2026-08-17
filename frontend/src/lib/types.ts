export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  imageUrl: string | null;
  featured: boolean;
  navOrder: number;
  _count?: { products: number };
};

export type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  shortDescription: string | null;
  price: number | null;
  compareAtPrice: number | null;
  inStock: boolean;
  condition: string;
  brand: string | null;
  featured: boolean;
  sourceUrl: string | null;
  category: Category;
  images: ProductImage[];
};

export type ProductList = {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverUrl: string | null;
  publishedAt: string;
};

export type CmsPage = {
  id: string;
  title: string;
  slug: string;
  content: string;
};

export type Order = {
  id: string;
  code: string;
  status: string;
  customerName: string;
  phone: string;
  email: string | null;
  address: string;
  note: string | null;
  total: number;
  createdAt: string;
  items: { id: string; name: string; price: number; quantity: number }[];
};

export type SitemapPayload = {
  categories: { slug: string; name: string; updatedAt: string }[];
  products: { slug: string; name: string; updatedAt: string }[];
  posts: { slug: string; title: string; updatedAt: string }[];
  pages: { slug: string; title: string; updatedAt: string }[];
};

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number | null;
  image: string | null;
  quantity: number;
};
