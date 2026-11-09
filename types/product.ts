export interface ProductImage {
    id: number;
    imageUrl: string;
    sortOrder: number;
    isPrimary: boolean;
}

export interface ProductVariant {
    id: number;
    size: string;
    color: string;
    stockQuantity: number;
    sku: string;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    categoryName: string;
    categoryId: string;
    brandName: string;
    brandId: number;
    originalPrice: number;
    salePrice: number;
    model3dUrl?: string | null;
    isActive: boolean;
    isFeatured: boolean;
    totalSold: number;
    avgRating: number;
    reviewCount: number;
    createdAt: string;
    images: ProductImage[];
    variants: ProductVariant[];
}

export interface PageResponse<T> {
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    size: number;
    content: T[];
    number: number;
    numberOfElements: number;
    empty: boolean;
}

export interface ProductApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
}

export interface Brand {
    id: number;
    name: string;
}

export interface ProductFiltersResponse {
    categories: string[];
    brands: string[];
}

export interface ProductQueryParams {
    categoryName?: string;
    brandName?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    page?: number;
    size?: number;
    q?: string;
}

export interface VariantRequest {
    id?: number;
    size: string;
    color: string;
    stockQuantity: number;
    sku?: string;
}

export interface ProductRequest {
    name: string;
    description?: string;
    categoryId?: string;
    brandId?: number;
    originalPrice: number;
    salePrice?: number;
    isFeatured?: boolean;
    /** Link file mô hình 3D .glb (không bắt buộc) */
    model3dUrl?: string;
    variants: VariantRequest[];
    imageUrls: string[];
}

export interface AdminCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
}

export interface AdminBrand {
    id: number;
    name: string;
    description?: string;
    logoUrl?: string;
}
