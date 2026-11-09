'use client';

import React, { useEffect, useState } from 'react';
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Pencil, Plus, Trash2, Truck } from 'lucide-react';
import { promotionService, ShippingRate } from '@/services/promotion.service';

const DEFAULT = 'DEFAULT';

// 34 tỉnh/thành sau sắp xếp từ 01/07/2025 — phải trùng với danh sách ở web khách hàng
const PROVINCES = [
    'Hà Nội', 'Hồ Chí Minh', 'Hải Phòng', 'Đà Nẵng', 'Cần Thơ', 'Huế',
    'An Giang', 'Bắc Ninh', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp',
    'Gia Lai', 'Hà Tĩnh', 'Hưng Yên', 'Khánh Hòa', 'Lai Châu', 'Lạng Sơn', 'Lào Cai', 'Lâm Đồng',
    'Nghệ An', 'Ninh Bình', 'Phú Thọ', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sơn La', 'Tây Ninh',
    'Thái Nguyên', 'Thanh Hóa', 'Tuyên Quang', 'Vĩnh Long',
];

const vnd = (n: number) => (n || 0).toLocaleString('vi-VN') + '₫';

export default function ShippingPage() {
    const [list, setList] = useState<ShippingRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<ShippingRate | null>(null);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm<Omit<ShippingRate, 'id'>>();

    const load = async () => {
        setLoading(true);
        try {
            const data = await promotionService.getShippingRates();
            // Mức mặc định luôn đứng đầu
            setList([...data].sort((a, b) => (a.province === DEFAULT ? -1 : b.province === DEFAULT ? 1 : a.province.localeCompare(b.province, 'vi'))));
        } catch {
            message.error('Không tải được bảng phí vận chuyển');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const openForm = (r: ShippingRate | null) => {
        setEditing(r);
        form.resetFields();
        form.setFieldsValue(r || { fee: 30000, estimatedDays: '2-4 ngày' });
        setOpen(true);
    };

    const submit = async () => {
        const values = await form.validateFields();
        setSaving(true);
        try {
            await promotionService.saveShippingRate(values);
            message.success('Đã lưu phí vận chuyển');
            setOpen(false);
            load();
        } catch (e: any) {
            message.error(e?.message || 'Lưu thất bại');
        } finally {
            setSaving(false);
        }
    };

    const used = new Set(list.map((r) => r.province));

    const columns: ColumnsType<ShippingRate> = [
        {
            title: 'Tỉnh / Thành',
            dataIndex: 'province',
            render: (p) => (p === DEFAULT ? <Tag color="green">Mặc định (các tỉnh còn lại)</Tag> : <b>{p}</b>),
        },
        { title: 'Phí ship', dataIndex: 'fee', render: vnd },
        { title: 'Thời gian dự kiến', dataIndex: 'estimatedDays', render: (d) => d || '—' },
        {
            title: '',
            align: 'right',
            render: (_, r) => (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <Button size="small" icon={<Pencil size={14} />} onClick={() => openForm(r)} />
                    {r.province !== DEFAULT && (
                        <Popconfirm
                            title={`Xóa phí riêng của ${r.province}?`}
                            description="Tỉnh này sẽ dùng mức phí mặc định."
                            okText="Xóa"
                            cancelText="Hủy"
                            onConfirm={async () => {
                                try {
                                    await promotionService.deleteShippingRate(r.id);
                                    load();
                                } catch (e: any) {
                                    message.error(e?.message || 'Xóa thất bại');
                                }
                            }}
                        >
                            <Button size="small" danger icon={<Trash2 size={14} />} />
                        </Popconfirm>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="page-head">
                <div>
                    <h1 className="page-title">
                        <Truck size={24} /> Phí vận chuyển
                    </h1>
                    <p className="page-subtitle">
                        Phí theo tỉnh/thành. Tỉnh không có cấu hình riêng dùng mức mặc định. Đơn từ ngưỡng miễn phí (cấu hình
                        <code> app.shipping.free-threshold</code>, mặc định 1.000.000₫) được miễn phí ship.
                    </p>
                </div>
                <Button type="primary" icon={<Plus size={16} />} onClick={() => openForm(null)}>
                    Thêm tỉnh
                </Button>
            </div>

            <div className="page-card">

                <Table rowKey="id" columns={columns} dataSource={list} loading={loading} pagination={false} />
            </div>

            <Modal
                title={editing ? `Sửa phí: ${editing.province === DEFAULT ? 'Mặc định' : editing.province}` : 'Thêm phí theo tỉnh'}
                open={open}
                onCancel={() => setOpen(false)}
                onOk={submit}
                confirmLoading={saving}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item name="province" label="Tỉnh / Thành" rules={[{ required: true, message: 'Chọn tỉnh/thành' }]}>
                        {editing ? (
                            <Input disabled />
                        ) : (
                            <Select
                                showSearch
                                placeholder="Chọn tỉnh/thành"
                                options={PROVINCES.filter((p) => !used.has(p)).map((p) => ({ value: p, label: p }))}
                            />
                        )}
                    </Form.Item>
                    <Form.Item name="fee" label="Phí ship (₫)" rules={[{ required: true, message: 'Nhập phí' }]}>
                        <InputNumber
                            min={0}
                            step={5000}
                            style={{ width: '100%' }}
                            formatter={(v) => `${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                            parser={(v) => Number((v || '').replace(/\./g, '')) as unknown as 0}
                        />
                    </Form.Item>
                    <Form.Item name="estimatedDays" label="Thời gian dự kiến">
                        <Input placeholder="VD: 1-2 ngày" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
