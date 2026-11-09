'use client';

import React, { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { Button, DatePicker, Form, Input, InputNumber, Modal, Popconfirm, Radio, Switch, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Pencil, Plus, Ticket, Trash2 } from 'lucide-react';
import { promotionService, Voucher, VoucherRequest } from '@/services/promotion.service';

const vnd = (n: number | null | undefined) => (n || 0).toLocaleString('vi-VN') + '₫';
const money = {
    formatter: (v: string | number | undefined) => `${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    parser: (v: string | undefined) => Number((v || '').replace(/\./g, '')),
};

type FormValues = Omit<VoucherRequest, 'startAt' | 'endAt'> & { period?: [Dayjs | null, Dayjs | null] };

export default function VouchersPage() {
    const [list, setList] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Voucher | null>(null);
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm<FormValues>();
    const type = Form.useWatch('discountType', form);

    const load = async () => {
        setLoading(true);
        try {
            setList(await promotionService.getVouchers());
        } catch {
            message.error('Không tải được danh sách mã giảm giá');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const openForm = (v: Voucher | null) => {
        setEditing(v);
        form.resetFields();
        form.setFieldsValue(
            v
                ? { ...v, period: [v.startAt ? dayjs(v.startAt) : null, v.endAt ? dayjs(v.endAt) : null] }
                : { discountType: 'PERCENT', minOrderValue: 0, isActive: true, period: [dayjs(), dayjs().add(1, 'month')] }
        );
        setOpen(true);
    };

    const submit = async () => {
        const values = await form.validateFields();
        const { period, ...rest } = values;
        const payload: VoucherRequest = {
            ...rest,
            code: rest.code.trim().toUpperCase(),
            maxDiscount: rest.discountType === 'PERCENT' ? rest.maxDiscount ?? null : null,
            startAt: period?.[0] ? period[0].format('YYYY-MM-DDTHH:mm:ss') : null,
            endAt: period?.[1] ? period[1].format('YYYY-MM-DDTHH:mm:ss') : null,
        };
        setSaving(true);
        try {
            if (editing) await promotionService.updateVoucher(editing.id, payload);
            else await promotionService.createVoucher(payload);
            message.success(editing ? 'Đã cập nhật mã giảm giá' : 'Đã tạo mã giảm giá');
            setOpen(false);
            load();
        } catch (e: any) {
            message.error(e?.message || 'Lưu thất bại');
        } finally {
            setSaving(false);
        }
    };

    const remove = async (v: Voucher) => {
        try {
            await promotionService.deleteVoucher(v.id);
            message.success(v.usedCount > 0 ? 'Mã đã có đơn sử dụng nên được chuyển sang trạng thái tắt' : 'Đã xóa mã giảm giá');
            load();
        } catch (e: any) {
            message.error(e?.message || 'Xóa thất bại');
        }
    };

    const status = (v: Voucher) => {
        const now = dayjs();
        if (!v.isActive) return <Tag>Đã tắt</Tag>;
        if (v.endAt && now.isAfter(v.endAt)) return <Tag color="default">Hết hạn</Tag>;
        if (v.startAt && now.isBefore(v.startAt)) return <Tag color="blue">Chưa bắt đầu</Tag>;
        if (v.usageLimit && v.usedCount >= v.usageLimit) return <Tag color="orange">Hết lượt</Tag>;
        return <Tag color="green">Đang chạy</Tag>;
    };

    const columns: ColumnsType<Voucher> = [
        {
            title: 'Mã',
            dataIndex: 'code',
            render: (c, v) => (
                <div>
                    <b style={{ fontFamily: 'monospace', fontSize: 15 }}>{c}</b>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{v.description}</div>
                </div>
            ),
        },
        {
            title: 'Giảm',
            render: (_, v) =>
                v.discountType === 'PERCENT' ? (
                    <span>
                        {v.discountValue}%{v.maxDiscount ? ` (tối đa ${vnd(v.maxDiscount)})` : ''}
                    </span>
                ) : (
                    vnd(v.discountValue)
                ),
        },
        { title: 'Đơn tối thiểu', dataIndex: 'minOrderValue', render: vnd },
        {
            title: 'Thời gian',
            render: (_, v) => (
                <span style={{ fontSize: 12 }}>
                    {v.startAt ? dayjs(v.startAt).format('DD/MM/YYYY') : '—'} → {v.endAt ? dayjs(v.endAt).format('DD/MM/YYYY') : 'không giới hạn'}
                </span>
            ),
        },
        { title: 'Đã dùng', render: (_, v) => `${v.usedCount}${v.usageLimit ? ` / ${v.usageLimit}` : ''}` },
        { title: 'Trạng thái', render: (_, v) => status(v) },
        {
            title: '',
            align: 'right',
            render: (_, v) => (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <Button size="small" icon={<Pencil size={14} />} onClick={() => openForm(v)} />
                    <Popconfirm
                        title="Xóa mã giảm giá?"
                        description={v.usedCount > 0 ? 'Mã đã được dùng, hệ thống sẽ tắt mã thay vì xóa.' : undefined}
                        okText="Xóa"
                        cancelText="Hủy"
                        onConfirm={() => remove(v)}
                    >
                        <Button size="small" danger icon={<Trash2 size={14} />} />
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="page-head">
                <div>
                    <h1 className="page-title">
                        <Ticket size={24} /> Mã giảm giá
                    </h1>
                    <p className="page-subtitle">Tạo và quản lý voucher áp dụng khi khách thanh toán</p>
                </div>
                <Button type="primary" icon={<Plus size={16} />} onClick={() => openForm(null)}>
                    Tạo mã mới
                </Button>
            </div>

            <div className="page-card">

                <Table rowKey="id" columns={columns} dataSource={list} loading={loading} pagination={{ pageSize: 10 }} />
            </div>

            <Modal
                title={editing ? `Sửa mã ${editing.code}` : 'Tạo mã giảm giá'}
                open={open}
                onCancel={() => setOpen(false)}
                onOk={submit}
                confirmLoading={saving}
                okText="Lưu"
                cancelText="Hủy"
                width={640}
            >
                <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Form.Item
                            name="code"
                            label="Mã"
                            rules={[
                                { required: true, message: 'Nhập mã' },
                                { pattern: /^[A-Za-z0-9_-]{3,30}$/, message: 'Chỉ gồm chữ, số, - hoặc _ (3-30 ký tự)' },
                            ]}
                        >
                            <Input placeholder="VD: SUMMER20" style={{ textTransform: 'uppercase' }} />
                        </Form.Item>
                        <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
                            <Switch />
                        </Form.Item>
                    </div>
                    <Form.Item name="description" label="Mô tả hiển thị cho khách">
                        <Input placeholder="VD: Giảm 20% tối đa 200.000₫ cho đơn từ 1.000.000₫" />
                    </Form.Item>
                    <Form.Item name="discountType" label="Loại giảm">
                        <Radio.Group>
                            <Radio.Button value="PERCENT">Theo %</Radio.Button>
                            <Radio.Button value="FIXED">Số tiền cố định</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Form.Item
                            name="discountValue"
                            label={type === 'PERCENT' ? 'Phần trăm giảm' : 'Số tiền giảm (₫)'}
                            rules={[{ required: true, message: 'Nhập giá trị giảm' }]}
                        >
                            {type === 'PERCENT' ? (
                                <InputNumber min={1} max={100} addonAfter="%" style={{ width: '100%' }} />
                            ) : (
                                <InputNumber min={1000} step={10000} style={{ width: '100%' }} {...money} />
                            )}
                        </Form.Item>
                        {type === 'PERCENT' && (
                            <Form.Item name="maxDiscount" label="Giảm tối đa (₫)">
                                <InputNumber min={0} step={10000} style={{ width: '100%' }} placeholder="Không giới hạn" {...money} />
                            </Form.Item>
                        )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                        <Form.Item name="minOrderValue" label="Đơn tối thiểu (₫)">
                            <InputNumber min={0} step={50000} style={{ width: '100%' }} {...money} />
                        </Form.Item>
                        <Form.Item name="usageLimit" label="Tổng lượt dùng">
                            <InputNumber min={1} style={{ width: '100%' }} placeholder="Không giới hạn" />
                        </Form.Item>
                        <Form.Item name="perUserLimit" label="Lượt / khách">
                            <InputNumber min={1} style={{ width: '100%' }} placeholder="Không giới hạn" />
                        </Form.Item>
                    </div>
                    <Form.Item name="period" label="Thời gian áp dụng">
                        <DatePicker.RangePicker showTime format="DD/MM/YYYY HH:mm" allowEmpty={[true, true]} style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
