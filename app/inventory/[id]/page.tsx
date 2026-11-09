'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ChevronLeft,
    Plus as PlusIcon,
    Save,
    X,
    Upload,
    Image as ImageIcon,
    Package,
    Tag,
    BarChart,
    Loader2,
    Trash2
} from 'lucide-react';
import {
    Form,
    Input,
    InputNumber,
    Select,
    Button,
    Switch,
    Divider,
    message,
    Table,
    Empty,
    Tooltip
} from 'antd';
import { productService } from '@/services/product.service';
import { Product } from '@/types/product';
import styles from './page.module.css';

const { TextArea } = Input;

export default function ProductDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [product, setProduct] = useState<Product | null>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [variants, setVariants] = useState<any[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [productData, catData, brandData] = await Promise.all([
                productService.getProductById(id),
                productService.getAdminCategories(),
                productService.getAdminBrands()
            ]);

            setProduct(productData);
            setCategories(catData);
            setBrands(brandData);
            setImageUrls(productData.images?.map(img => img.imageUrl) || []);
            setVariants(productData.variants || []);

            form.setFieldsValue({
                ...productData,
                originalPrice: productData.originalPrice,
                salePrice: productData.salePrice,
                isActive: productData.isActive,
                imageUrls: productData.images?.map(img => img.imageUrl) || []
            });
        } catch (error: any) {
            message.error('Không thể tải thông tin sản phẩm');
        } finally {
            setLoading(false);
        }
    }, [id, form]);

    useEffect(() => {
        if (id) fetchData();
    }, [id, fetchData]);

    // Hàm cập nhật trường bất kỳ cho biến thể
    const handleVariantChange = (index: number, field: string, value: any) => {
        setVariants(prev => {
            const next = [...prev];
            next[index] = {
                ...next[index],
                [field]: value !== null ? value : (field === 'stockQuantity' ? 0 : '')
            };
            return next;
        });
    };

    const handleAddVariant = () => {
        setVariants(prev => [
            ...prev,
            { id: null, sku: '', size: '', stockQuantity: 0 }
        ]);
    };

    const handleRemoveVariant = (index: number) => {
        setVariants(prev => prev.filter((_, i) => i !== index));
    };

    const onFinish = async (values: any) => {
        setSaving(true);
        try {
            const request = {
                ...values,
                imageUrls: imageUrls,
                variants: variants.map(v => ({
                    id: v.id,
                    size: v.size,
                    stockQuantity: v.stockQuantity,
                    sku: v.sku
                })) || []
            };
            await productService.updateProduct(id, request);
            message.success('Cập nhật sản phẩm thành công');
            fetchData();
        } catch (error: any) {
            message.error('Lỗi khi cập nhật sản phẩm: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.')) return;
        setDeleting(true);
        try {
            await productService.deleteProduct(id);
            message.success('Đã xóa sản phẩm thành công');
            router.push('/inventory');
        } catch (error: any) {
            message.error('Lỗi khi xóa sản phẩm: ' + (error.response?.data?.message || error.message));
        } finally {
            setDeleting(false);
        }
    };



    const handleAddImageUrl = () => {
        const url = prompt('Nhập URL hình ảnh:');
        if (url && url.trim()) {
            setImageUrls(prev => [...prev, url.trim()]);
        }
    };

    const handleRemoveImage = (index: number) => {
        setImageUrls(prev => prev.filter((_, i) => i !== index));
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader2 size={40} className={styles.spin} />
                <p>Đang tải dữ liệu sản phẩm...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className={styles.container}>
                <Empty description="Không tìm thấy sản phẩm" />
                <Button onClick={() => router.push('/inventory')}>Quay lại</Button>
            </div>
        );
    }

    const variantColumns = [
        { 
            title: 'SKU', 
            dataIndex: 'sku', 
            key: 'sku',
            render: (text: string, record: any, index: number) => (
                <Input
                    value={record.sku}
                    onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                    placeholder="Tự động"
                />
            )
        },
        { 
            title: 'Kích thước', 
            dataIndex: 'size', 
            key: 'size',
            render: (text: string, record: any, index: number) => (
                <Input
                    value={record.size}
                    onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                    placeholder="Size"
                />
            )
        },
        { 
            title: 'Tồn kho', 
            dataIndex: 'stockQuantity', 
            key: 'stockQuantity',
            render: (text: number, record: any, index: number) => (
                <InputNumber
                    min={0}
                    value={record.stockQuantity}
                    onChange={(val) => handleVariantChange(index, 'stockQuantity', val)}
                    style={{ width: '120px' }}
                />
            )
        },
        {
            title: '',
            key: 'action',
            render: (_: any, record: any, index: number) => {
                const canDelete = record.canDelete !== false;
                return (
                    <span 
                        style={{ display: 'inline-block', cursor: !canDelete ? 'not-allowed' : 'pointer' }}
                        title={!canDelete ? "Không thể xoá vì đã có trong đơn hàng" : "Xoá phiên bản"}
                    >
                        <Button 
                            type="text" 
                            danger 
                            disabled={!canDelete}
                            onClick={() => handleRemoveVariant(index)} 
                            icon={<Trash2 size={16} />} 
                            style={!canDelete ? { pointerEvents: 'none' } : {}}
                        />
                    </span>
                );
            }
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <div className={styles.backLink} onClick={() => router.push('/inventory')}>
                        <ChevronLeft size={18} />
                        <span>Quay lại Kho hàng</span>
                    </div>
                    <h1>{product.name}</h1>
                    <p>Mã sản phẩm: {product.id}</p>
                </div>
                <div className={styles.actions}>
                    <button type="button" className={styles.cancelBtn} onClick={() => router.push('/inventory')}>Hủy</button>
                    <button type="button" className={styles.saveBtn} onClick={() => form.submit()} disabled={saving}>
                        <Save size={18} style={{ marginRight: 8, display: 'inline-block', verticalAlign: 'middle' }} />
                        {saving ? 'Đang lưu...' : 'Lưu sản phẩm'}
                    </button>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                className={styles.mainContent}
            >
                <div>
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}><Package size={20} /> Thông tin chung</h2>
                        <Form.Item
                            label="Tên sản phẩm"
                            name="name"
                            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                        >
                            <Input placeholder="Tên sản phẩm" />
                        </Form.Item>
                        <Form.Item label="Mô tả" name="description">
                            <TextArea rows={5} placeholder="Mô tả sản phẩm..." />
                        </Form.Item>
                        <Form.Item
                            label="Link mô hình 3D (.glb)"
                            name="model3dUrl"
                            extra="Để trống nếu chỉ có ảnh. File mẫu có sẵn trên web khách: /models/demo-shoe.glb"
                            rules={[{ pattern: /^(https?:\/\/|\/).+\.(glb|gltf)(\?.*)?$/i, message: 'Link phải trỏ tới file .glb hoặc .gltf' }]}
                        >
                            <Input placeholder="https://.../giay.glb" />
                        </Form.Item>
                    </div>

                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}><ImageIcon size={20} /> Hình ảnh</h2>
                        <div className={styles.imageGrid}>
                            {imageUrls.map((url, index) => (
                                <div key={index} className={styles.imageItem}>
                                    <img src={url} alt={`Product ${index}`} />
                                    <button
                                        type="button"
                                        className={styles.removeImageBtn}
                                        onClick={() => handleRemoveImage(index)}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            <div className={styles.uploadPlaceholder} onClick={handleAddImageUrl}>
                                <PlusIcon size={24} />
                                <span style={{ fontSize: '0.75rem', marginTop: 4 }}>Thêm URL</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}><Tag size={20} /> Phiên bản (Tồn kho)</h2>
                        <Table
                            dataSource={variants}
                            columns={variantColumns}
                            pagination={false}
                            rowKey={(record, index) => record.id || index}
                            size="small"
                        />
                        <Button 
                            type="dashed" 
                            onClick={handleAddVariant} 
                            block 
                            icon={<PlusIcon size={16} />} 
                            style={{ marginTop: 16 }}
                        >
                            Thêm phiên bản mới
                        </Button>
                    </div>
                </div>

                <div>
                    <div className={`${styles.card} ${styles.sidebarCard}`}>
                        <h2 className={styles.cardTitle}><BarChart size={20} /> Phân loại</h2>
                        <Form.Item label="Danh mục" name="categoryId" rules={[{ required: true }]}>
                            <Select
                                placeholder="Chọn danh mục"
                                options={(categories || []).map(cat => ({ value: cat.id, label: cat.name }))}
                            />
                        </Form.Item>
                        <Form.Item label="Thương hiệu" name="brandId" rules={[{ required: true }]}>
                            <Select
                                placeholder="Chọn thương hiệu"
                                options={(brands || []).map(b => ({ value: b.id, label: b.name }))}
                            />
                        </Form.Item>
                        <Divider />
                        <div className={styles.priceGrid}>
                            <Form.Item label="Giá gốc (đ)" name="originalPrice" rules={[{ required: true }]}>
                                <InputNumber
                                    min={0}
                                    style={{ width: '100%' }}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') as any}
                                    parser={value => value!.replace(/\$\s?|(,*)/g, '') as any}
                                />
                            </Form.Item>
                            <Form.Item label="Giá khuyến mãi (đ)" name="salePrice" rules={[{ required: true }]}>
                                <InputNumber
                                    min={0}
                                    style={{ width: '100%' }}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') as any}
                                    parser={value => value!.replace(/\$\s?|(,*)/g, '') as any}
                                />
                            </Form.Item>
                        </div>
                        <Divider />
                        <div className={styles.dangerZone}>
                            <h2 className={styles.cardTitle} style={{ color: '#ef4444' }}><Trash2 size={20} /> Khu vực nguy hiểm</h2>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                Xóa sản phẩm này vĩnh viễn. Hành động này không thể hoàn tác.
                            </p>
                            <Button 
                                danger 
                                type="primary" 
                                onClick={handleDelete}
                                loading={deleting}
                                block
                                style={{ height: '40px', borderRadius: '8px', fontWeight: 600 }}
                            >
                                Xóa sản phẩm
                            </Button>
                        </div>
                    </div>


                </div>
            </Form>
        </div>
    );
}
