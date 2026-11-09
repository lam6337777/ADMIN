'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button, Switch, Space, Divider, message } from 'antd';
import { Plus, Minus, Package, Tag, FileText, Image as ImageIcon, Layers } from 'lucide-react';
import { productService } from '@/services/product.service';
import { AdminCategory, AdminBrand, ProductRequest, VariantRequest } from '@/types/product';

interface AddProductModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

export default function AddProductModal({ visible, onCancel, onSuccess }: AddProductModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<AdminCategory[]>([]);
    const [brands, setBrands] = useState<AdminBrand[]>([]);

    useEffect(() => {
        if (visible) {
            const fetchData = async () => { 
                try {
                    const [cats, brs] = await Promise.all([
                        productService.getAdminCategories(),
                        productService.getAdminBrands()
                    ]);
                    setCategories(cats);
                    setBrands(brs);
                } catch (error) {
                    message.error('Không thể tải dữ liệu danh mục hoặc thương hiệu');
                }
            };
            fetchData();
        }
    }, [visible]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // Chuyển đổi dữ liệu form sang ProductRequest
            const request: ProductRequest = {
                name: values.name,
                description: values.description,
                categoryId: values.categoryId,
                brandId: values.brandId,
                originalPrice: values.originalPrice,
                salePrice: values.salePrice,
                isFeatured: values.isFeatured || false,
                model3dUrl: values.model3dUrl?.trim() || undefined,
                imageUrls: values.imageUrls ? values.imageUrls.split('\n').filter((url: string) => url.trim() !== '') : [],
                variants: values.variants || []
            };

            await productService.createProduct(request);
            message.success('Thêm sản phẩm thành công!');
            form.resetFields();
            onSuccess();
        } catch (error: any) {
            console.error('Submit error:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Package size={20} /><span>Thêm sản phẩm mới</span></div>}
            open={visible}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            width={800}
            okText="Thêm sản phẩm"
            cancelText="Hủy"
            centered
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ isFeatured: false, variants: [{ size: '', stockQuantity: 0 }] }}
                style={{ marginTop: '20px' }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item
                        name="name"
                        label="Tên sản phẩm"
                        rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                    >
                        <Input placeholder="VD: Nike Air Max 270" />
                    </Form.Item>

                    <Form.Item
                        name="categoryId"
                        label="Danh mục"
                        rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                    >
                        <Select placeholder="Chọn danh mục">
                            {(categories || []).map(cat => (
                                <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="brandId"
                        label="Thương hiệu"
                        rules={[{ required: true, message: 'Vui lòng chọn thương hiệu' }]}
                    >
                        <Select placeholder="Chọn thương hiệu">
                            {(brands || []).map(brand => (
                                <Select.Option key={brand.id} value={brand.id}>{brand.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="isFeatured" label="Sản phẩm nổi bật" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item
                        name="originalPrice"
                        label="Giá gốc (VNĐ)"
                        rules={[{ required: true, message: 'Vui lòng nhập giá gốc' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>

                    <Form.Item
                        name="salePrice"
                        label="Giá khuyến mãi (Tùy chọn)"
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>
                </div>

                <Form.Item
                    name="description"
                    label={<div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FileText size={14} /><span>Mô tả</span></div>}
                >
                    <Input.TextArea rows={4} placeholder="Mô tả và chi tiết sản phẩm..." />
                </Form.Item>

                <Form.Item
                    name="imageUrls"
                    label={<div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ImageIcon size={14} /><span>Link hình ảnh</span></div>}
                    extra="Mỗi link hình ảnh trên một dòng. Link đầu tiên sẽ là ảnh chính."
                >
                    <Input.TextArea rows={3} placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg" />
                </Form.Item>

                <Form.Item
                    name="model3dUrl"
                    label="Link mô hình 3D (.glb) — không bắt buộc"
                    extra="Khách sẽ xem được sản phẩm 3D trên trang chi tiết. File mẫu có sẵn: /models/demo-shoe.glb"
                    rules={[{ pattern: /^(https?:\/\/|\/).+\.(glb|gltf)(\?.*)?$/i, message: 'Link phải trỏ tới file .glb hoặc .gltf' }]}
                >
                    <Input placeholder="https://.../giay.glb" />
                </Form.Item>

                <Divider orientation="left" style={{ margin: '24px 0 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 600 }}>
                        <Layers size={18} />
                        <span>Phiên bản sản phẩm</span>
                    </div>
                </Divider>

                <Form.List name="variants">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8, alignItems: 'flex-start' }} align="baseline">
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'size']}
                                        rules={[{ required: true, message: 'Kích thước?' }]}
                                    >
                                        <Input placeholder="Kích thước" style={{ width: 80 }} />
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'stockQuantity']}
                                        rules={[{ required: true, message: 'Số lượng?' }]}
                                    >
                                        <InputNumber placeholder="Số lượng" min={0} style={{ width: 80 }} />
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'sku']}
                                    >
                                        <Input placeholder="SKU (Tùy chọn)" style={{ width: 180 }} />
                                    </Form.Item>
                                    {fields.length > 1 && (
                                        <Button
                                            type="text"
                                            onClick={() => remove(name)}
                                            icon={<Minus size={16} />}
                                            danger
                                        />
                                    )}
                                </Space>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<Plus size={16} />}>
                                    Thêm phiên bản khác
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
            </Form>
        </Modal>
    );
}
