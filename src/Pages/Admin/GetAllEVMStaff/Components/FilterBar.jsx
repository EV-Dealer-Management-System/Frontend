import React from 'react';
import { Card, Select, Button, Space, Typography, Statistic, Row, Col, Input } from 'antd';
import {
    ThunderboltOutlined,
    FileTextOutlined,
    DatabaseOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import {ConfigProvider} from "antd";
import viVN from 'antd/lib/locale/vi_VN';

const { Option } = Select;
const { Text } = Typography;
const { Search } = Input;

function FilterBar({ selectedPage, onPageChange, onApply, loading, onSearchChange }) {
    return (
        <ConfigProvider locale={viVN}>
        <Card className="mb-4">
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <Space direction="vertical" className="w-full" size={8}>
                        <Text type="secondary" className="text-xs">Tìm Kiếm</Text>
                        <Search
                            placeholder="Nhập tên, email hoặc địa chỉ..."
                            size="large"
                            allowClear
                            onChange={(e) => onSearchChange(e.target.value)}
                            />
                    </Space>
                </Col>
                <Col xs={24} lg={8}>
                    <Space direction="vertical" className="w-full" size={8}>
                        <Text type="secondary" className="text-xs">Hành động</Text>
                        <Button
                            type="primary"
                            size="large"
                            block
                            onClick={onApply}
                            loading={loading}
                            icon={<ReloadOutlined />}
                        >
                            {loading ? 'Đang tải...' : 'Tải lại dữ liệu'}
                        </Button>
                    </Space>
                </Col>
            </Row>
        </Card>
        </ConfigProvider>
    );
}

export default FilterBar;
