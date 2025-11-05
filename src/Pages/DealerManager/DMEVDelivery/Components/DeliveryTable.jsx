import React from 'react';
import { Table } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import DeliveryStatusTag from './DeliveryStatusTag';

// Component bảng danh sách giao xe
function DeliveryTable({
    data,
    loading,
    pagination,
    onTableChange,
    onViewDetail
}) {
    const columns = [
        {
            title: 'Mã Booking',
            dataIndex: 'bookingEVId',
            key: 'bookingEVId',
            width: '25%',
            ellipsis: true,
            render: (text) => (
                <span className="font-mono text-xs text-gray-700">{text}</span>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: '15%',
            render: (status) => <DeliveryStatusTag status={status} />,
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            width: '30%',
            ellipsis: true,
            render: (text) => (
                <span className="text-sm text-gray-600">{text}</span>
            ),
        },
        {
            title: 'SL xe',
            key: 'vehicleCount',
            width: '10%',
            align: 'center',
            render: (_, record) => (
                <span className="font-semibold text-blue-600 text-sm">
                    {record.vehicleDeliveryDetails?.length || 0}
                </span>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdDate',
            key: 'createdDate',
            width: '12%',
            render: (date) => (
                <div className="text-xs">
                    <div className="font-medium">{new Date(date).toLocaleDateString('vi-VN')}</div>
                    <div className="text-gray-400">{new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            ),
            sorter: (a, b) => new Date(a.createdDate) - new Date(b.createdDate),
            defaultSortOrder: 'descend',
        },
        {
            title: '',
            key: 'action',
            width: '8%',
            align: 'center',
            render: (_, record) => (
                <EyeOutlined
                    className="text-blue-600 text-lg cursor-pointer hover:text-blue-800 transition-colors"
                    onClick={() => onViewDetail(record)}
                    title="Xem chi tiết"
                />
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Tổng số ${total} đơn giao xe`,
                pageSizeOptions: ['10', '20', '50', '100'],
            }}
            onChange={onTableChange}
            className="delivery-table"
        />
    );
}

export default DeliveryTable;
