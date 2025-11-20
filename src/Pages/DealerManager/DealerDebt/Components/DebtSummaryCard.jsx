import React from "react";
import { Card, Statistic, Row, Col, Button } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined, WalletOutlined, FileTextOutlined } from "@ant-design/icons";

const DebtSummaryCard = ({ data, loading, onViewDetails }) => {
    if (!data) return null;

    const { closingBalance, openingBalance, overpaidAmount } = data;

    return (
        <Card
            loading={loading}
            className="mb-4 shadow-sm"
            title="Tổng Quan Tài Chính"
            extra={
                <Button
                    type="primary"
                    icon={<FileTextOutlined />}
                    onClick={onViewDetails}
                >
                    Xem Chi Tiết
                </Button>
            }
        >
            <Row gutter={16}>
                <Col span={8}>
                    <Statistic
                        title="Số Dư Đầu Kỳ"
                        value={openingBalance}
                        precision={0}
                        valueStyle={{ color: "#3f8600" }}
                        prefix={<WalletOutlined />}
                        suffix="VNĐ"
                    />
                </Col>
                <Col span={8}>
                    <Statistic
                        title="Số Dư Cuối Kỳ"
                        value={closingBalance}
                        precision={0}
                        valueStyle={{ color: closingBalance > 0 ? "#cf1322" : "#3f8600" }}
                        prefix={closingBalance > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                        suffix="VNĐ"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                        (Dương: Còn nợ, Âm: Trả thừa)
                    </div>
                </Col>
                <Col span={8}>
                    <Statistic
                        title="Số Tiền Trả Thừa"
                        value={overpaidAmount}
                        precision={0}
                        valueStyle={{ color: "#1890ff" }}
                        suffix="VNĐ"
                    />
                </Col>
            </Row>
        </Card>
    );
};

export default DebtSummaryCard;
