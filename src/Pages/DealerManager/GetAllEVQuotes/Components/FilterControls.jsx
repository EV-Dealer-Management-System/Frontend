import React from "react";
import { ProCard } from "@ant-design/pro-components";
import { Select, Row, Col, Button } from "antd";
import { FilterOutlined, ReloadOutlined } from "@ant-design/icons";

const { Option } = Select;

function FilterControls({ onStatusFilter, onRefresh, loading }) {
    const handleStatusChange = (value) => {
        onStatusFilter(value === "all" ? null : parseInt(value));
    };

    return (
        <ProCard
            bordered
            className="mb-6 shadow-md bg-gradient-to-r from-blue-50 to-indigo-50"
            title={
                <span className="flex items-center gap-2">
                    <FilterOutlined className="text-blue-500" />
                    Bộ lọc báo giá
                </span>
            }
        >
            <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={8} lg={6}>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">
                            Trạng thái:
                        </label>
                        <Select
                            defaultValue="all"
                            className="w-full"
                            onChange={handleStatusChange}
                            placeholder="Chọn trạng thái"
                        >
                            <Option value="all">
                                <span className="flex items-center gap-2">
                                    📋 Tất cả
                                </span>
                            </Option>
                            <Option value="0">
                                <span className="flex items-center gap-2">
                                    ⏳ Chờ duyệt
                                </span>
                            </Option>
                            <Option value="1">
                                <span className="flex items-center gap-2">
                                    ✅ Đã duyệt
                                </span>
                            </Option>
                            <Option value="2">
                                <span className="flex items-center gap-2">
                                    ❌ Từ chối
                                </span>
                            </Option>
                        </Select>
                    </div>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">
                            Thao tác:
                        </label>
                        <Button
                            type="primary"
                            icon={<ReloadOutlined />}
                            onClick={onRefresh}
                            loading={loading}
                            className="bg-blue-500 hover:bg-blue-600 border-blue-500 hover:border-blue-600"
                        >
                            Làm mới
                        </Button>
                    </div>
                </Col>
            </Row>
        </ProCard>
    );
}

export default FilterControls;