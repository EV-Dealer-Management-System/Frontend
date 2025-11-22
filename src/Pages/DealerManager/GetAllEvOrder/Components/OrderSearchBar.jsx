import React from 'react';
import { Row, Col, Input, Select, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

const statusOptions = [
    { label: "Tất cả", value: "" },
    { label: "Chờ thanh toán toàn phần", value: 0 },
    { label: "Chờ cọc", value: 1 },
    { label: "Đang chờ", value: 2 },
    { label: "Đang cọc", value: 4 },
    { label: "Hoàn tất", value: 5 },
    { label: "Đã hủy", value: 6 },
];

function OrderSearchBar({ 
    searchText, 
    setSearchText, 
    statusFilter, 
    setStatusFilter, 
    onSearch, 
    onReload 
}) {
    return (
        <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
            <Col flex="auto">
                <Input.Search
                    placeholder="Tìm theo tên hoặc SĐT khách hàng"
                    allowClear
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onSearch={onSearch}
                />
            </Col>
            <Col>
                <Select
                    placeholder="Trạng thái"
                    style={{ width: 180 }}
                    options={statusOptions}
                    value={statusFilter}
                    onChange={(v) => {
                        if (v === undefined) {
                            setStatusFilter("");
                        } else {
                            setStatusFilter(v);
                        }
                    }}
                    allowClear={statusFilter !== ""}
                />
            </Col>
            <Col>
                <Button icon={<ReloadOutlined />} onClick={onReload}>
                    Tải lại
                </Button>
            </Col>
        </Row>
    );
}

export default OrderSearchBar;