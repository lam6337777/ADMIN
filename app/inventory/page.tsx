'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit2, ChevronDown, Package, AlertTriangle, XCircle, DollarSign, FileUp, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Table, Select, Button, message, Empty } from 'antd';
import axiosInstance from '@/lib/axios';
import { productService } from '@/services/product.service';
import { Product, PageResponse, Category, Brand } from '@/types/product';
import styles from './page.module.css';
import StatCard from '@/components/ui/StatCard';
import { useAppDispatch, useAppSelector } from '@/store/redux/hooks';
import { fetchDashboardStats } from '@/store/redux/slices/dashboardSlice';
import { RootState } from '@/store/redux/store';
import AddProductModal from './_components/AddProductModal';

export default function InventoryPage() {
    const dispatch = useAppDispatch();
    const { stats } = useAppSelector((state: RootState) => state.dashboard);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [importing, setImporting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<PageResponse<Product> | null>(null);
    const [page, setPage] = useState(0);
    const [categories, setCategories] = useState<string[]>([]);
    const [brands, setBrands] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        categoryName: undefined as string | undefined,
        brandName: undefined as string | undefined,
        sortBy: 'newest'
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const fetchFilterData = useCallback(async () => {
        try {
            const data = await productService.getProductFilters();
            setCategories(data.categories);
            setBrands(data.brands);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu lọc', error);
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const result = await productService.getProducts({
                page,
                size: 10,
                categoryName: filters.categoryName,
                brandName: filters.brandName,
                sortBy: filters.sortBy,
                q: searchQuery.trim() || undefined
            });
            setData(result);
        } catch (error: any) {
            message.error('Lỗi khi tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    }, [page, searchQuery, filters]);

    useEffect(() => {
        fetchFilterData();
    }, [fetchFilterData]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        searchTimeoutRef.current = setTimeout(() => {
            setSearchQuery(value);
            setPage(0); // Reset về trang 1 khi search
        }, 500);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Reset input value to allow selecting same file again
        event.target.value = '';

        if (!file.name.endsWith('.csv')) {
            message.error('Vui lòng chọn file định dạng .csv');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setImporting(true);
        try {
            const response = await axiosInstance.post('/api/admin/products/import-csv', formData, {
                withCredentials: true,
            });

            if (response.data.success) {
                message.success(response.data.message || `Đã import thành công sản phẩm từ CSV`);
                fetchProducts(); // Refresh data
            } else {
                message.error(response.data.message || 'Lỗi khi import CSV');
            }
        } catch (error: any) {
            message.error(error.message || 'Lỗi kết nối khi import CSV');
        } finally {
            setImporting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.')) return;
        try {
            await productService.deleteProduct(id);
            message.success('Đã xóa sản phẩm thành công');
            fetchProducts();
            dispatch(fetchDashboardStats());
        } catch (error: any) {
            message.error('Lỗi khi xóa sản phẩm: ' + (error.response?.data?.message || error.message));
        }
    };


    const columns = [
        {
            title: 'SẢN PHẨM',
            dataIndex: 'name',
            key: 'name',
            render: (_: any, record: Product) => {
                const primaryImage = record.images?.find(img => img.isPrimary) || record.images?.[0];
                return (
                    <div className={styles.productCell}>
                        <img
                            src={primaryImage?.imageUrl || 'https://via.placeholder.com/100'}
                            alt={record.name}
                            className={styles.productImage}
                        />
                        <div className={styles.productInfo}>
                            <span className={styles.productName}>{record.name}</span>
                            <span className={styles.productVariant}>
                                {record.variants?.length > 0
                                    ? `Size: ${record.variants[0].size}`
                                    : 'Không có phiên bản'}
                            </span>
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'SKU',
            key: 'sku',
            render: (_: any, record: Product) => (
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                    {record.variants?.[0]?.sku || 'N/A'}
                </span>
            )
        },
        {
            title: 'DANH MỤC',
            dataIndex: 'categoryName',
            key: 'categoryName',
            render: (text: string) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{text}</span>
        },
        {
            title: 'TỒN KHO',
            key: 'stock',
            render: (_: any, record: Product) => {
                const totalStock = record.variants?.reduce((sum, v) => sum + v.stockQuantity, 0) || 0;
                let status = 'CÒN HÀNG';
                let statusClass = styles.inStock;

                if (totalStock === 0) {
                    status = 'HẾT HÀNG';
                    statusClass = styles.outOfStock;
                } else if (totalStock < 10) {
                    status = 'SẮP HẾT';
                    statusClass = styles.lowStock;
                }

                const percent = Math.min((totalStock / 100) * 100, 100); // Giả định max là 100 cho UI

                return (
                    <div className={styles.stockLevelWrapper}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className={styles.progressBar} style={{ flex: 1 }}>
                                <div
                                    className={styles.progressFill}
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                            <span style={{ fontSize: '0.875rem', fontWeight: 700, fontStyle: 'italic' }}>{totalStock}</span>
                        </div>
                        <span className={`${styles.stockStatus} ${statusClass}`}>{status}</span>
                    </div>
                );
            }
        },
        {
            title: 'GIÁ',
            dataIndex: 'salePrice',
            key: 'salePrice',
            render: (price: number) => <span className={styles.price}>{price?.toLocaleString('vi-VN')}đ</span>
        },
        {
            title: 'THAO TÁC',
            key: 'actions',
            render: (_: any, record: Product) => (
                <div className={styles.actions}>
                    <Link href={`/inventory/${record.id}`}>
                        <Edit2 size={18} className={styles.actionIcon} />
                    </Link>
                    <Trash2 
                        size={18} 
                        className={`${styles.actionIcon} ${styles.actionDelete}`} 
                        onClick={() => handleDelete(record.id)}
                    />
                </div>
            )
        }
    ];

    useEffect(() => {
        if (!stats) {
            dispatch(fetchDashboardStats());
        }
    }, [dispatch, stats]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <h1>Kho sản phẩm</h1>
                    <p>Quản lý mức tồn kho và chi tiết sản phẩm.</p>
                </div>
                <div className={styles.headerActions}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept=".csv"
                        onChange={handleFileChange}
                    />
                    <button
                        className={styles.importButton}
                        onClick={handleImportClick}
                        disabled={importing}
                    >
                        {importing ? <Loader2 size={16} className={styles.spin} /> : <FileUp size={16} />}
                        <span>{importing ? 'Đang tải...' : 'Nhập CSV'}</span>
                    </button>
                    <button
                        className={styles.addButton}
                        onClick={() => setIsModalVisible(true)}
                    >
                        <Plus size={16} />
                        <span>Thêm sản phẩm</span>
                    </button>
                </div>
            </div>

            <AddProductModal
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSuccess={() => {
                    setIsModalVisible(false);
                    fetchProducts();
                    dispatch(fetchDashboardStats());
                }}
            />

            <div className={styles.filterCard}>
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm, SKU..."
                        className={styles.searchInput}
                        onChange={handleSearchChange}
                    />
                </div>
                <Select
                    placeholder="Tất cả danh mục"
                    className={styles.select}
                    allowClear
                    onChange={(val) => {
                        setFilters(prev => ({ ...prev, categoryName: val }));
                        setPage(0);
                    }}
                    options={[
                        { value: undefined, label: 'Tất cả danh mục' },
                        ...(categories || []).map(name => ({ value: name, label: name }))
                    ]}
                />
                <Select
                    placeholder="Tất cả thương hiệu"
                    className={styles.select}
                    allowClear
                    onChange={(val) => {
                        setFilters(prev => ({ ...prev, brandName: val }));
                        setPage(0);
                    }}
                    options={[
                        { value: undefined, label: 'Tất cả thương hiệu' },
                        ...(brands || []).map(name => ({ value: name, label: name }))
                    ]}
                />
                <Select
                    defaultValue="newest"
                    className={styles.select}
                    onChange={(val) => {
                        setFilters(prev => ({ ...prev, sortBy: val }));
                        setPage(0);
                    }}
                    options={[
                        { value: 'newest', label: 'Mới nhất' },
                        { value: 'price_asc', label: 'Giá: Thấp đến Cao' },
                        { value: 'price_desc', label: 'Giá: Cao đến Thấp' },
                        { value: 'best_selling', label: 'Bán chạy nhất' }
                    ]}
                />
            </div>

            <div className={styles.tableContainer}>
                <Table
                    rowKey="id"
                    dataSource={data?.content || []}
                    columns={columns}
                    pagination={false}
                    loading={loading}
                    className="custom-table"
                    locale={{ emptyText: <Empty description="Không có sản phẩm nào" /> }}
                />
            </div>

            <div className={styles.pagination}>
                <span className={styles.paginationText}>
                    Hiển thị {data?.numberOfElements || 0} trong số {data?.totalElements || 0} sản phẩm
                </span>
                <div className={styles.paginationBtns}>
                    <button
                        className={styles.pageBtn}
                        disabled={page === 0 || loading}
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                    >
                        Trước
                    </button>
                    <button
                        className={`${styles.pageBtn} ${page === (data?.totalPages || 1) - 1 ? '' : styles.pageBtnActive}`}
                        disabled={page === (data?.totalPages || 1) - 1 || loading}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Tiếp
                    </button>
                </div>
            </div>

            <div className={styles.statsGrid}>
                <StatCard
                    title="TỔNG SẢN PHẨM"
                    value={stats ? stats.totalProducts?.toLocaleString() : '---'}
                    icon={Package}
                />
                <StatCard
                    title="CẢNH BÁO SẮP HẾT"
                    value={stats ? stats.lowStockAlerts?.toLocaleString() : '---'}
                    icon={AlertTriangle}
                />
                <StatCard
                    title="HẾT HÀNG"
                    value={stats ? stats.outOfStock?.toLocaleString() : '---'}
                    icon={XCircle}
                />
                <StatCard
                    title="GIÁ TRỊ TỒN KHO"
                    value={stats ? `${stats.totalInventoryValue?.toLocaleString('vi-VN')}đ` : '---'}
                    icon={DollarSign}
                />
            </div>
        </div>
    );
}
