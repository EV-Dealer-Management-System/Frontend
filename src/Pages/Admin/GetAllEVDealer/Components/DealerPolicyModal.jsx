import React from "react";
import { message, Descriptions, Tag, Statistic, Row, Col, Button } from "antd";
import { PercentageOutlined, DollarOutlined, WalletOutlined, ClockCircleOutlined, EditOutlined } from "@ant-design/icons";
import { getDealerEffectivePolicy } from "../../../../App/EVMAdmin/GetAllEVDealer/GetDealerPolicy";

// Hook để xử lý hiển thị modal chính sách đại lý
function useDealerPolicyModal(modal, onEditPolicy) {
    const handleViewPolicy = async (dealerId, dealerName) => {
        try {
            const response = await getDealerEffectivePolicy(dealerId);
            
            // API trả về dữ liệu trực tiếp trong response.data
            if (response && response.data && response.status === 200) {
                const policy = response.data;
                
                const modalInstance = modal.info({
                    title: (
                        <div className="flex items-center justify-between">
                            <span>Chính Sách Đại Lý: {policy.dealerName}</span>
                            <div className="flex items-center gap-2">
                                <Tag color={policy.source === "Tier" ? "blue" : "orange"}>
                                    {policy.source === "Tier" ? "Từ Tier" : "Ghi Đè"}
                                </Tag>
                                <Button
                                    type="primary"
                                    size="small"
                                    icon={<EditOutlined />}
                                    className="bg-green-500 hover:bg-green-600"
                                    onClick={() => {
                                        modalInstance.destroy();
                                        if (onEditPolicy) {
                                            onEditPolicy(dealerId, dealerName, policy);
                                        }
                                    }}
                                >
                                    Chỉnh Sửa
                                </Button>
                            </div>
                        </div>
                    ),
                    width: 850,
                    content: (
                        <div className="mt-4">
                            {/* Statistics Cards */}
                            <Row gutter={[16, 16]} className="mb-6">
                                <Col xs={12} sm={12} md={6}>
                                    <Statistic
                                        title="Hoa Hồng"
                                        value={policy.commissionPercent}
                                        precision={2}
                                        suffix="%"
                                        valueStyle={{ color: '#3f8600', fontSize: '18px' }}
                                        prefix={<PercentageOutlined />}
                                    />
                                </Col>
                                <Col xs={12} sm={12} md={6}>
                                    <Statistic
                                        title="Hạn Mức Tín Dụng"
                                        value={policy.creditLimit / 1000000}
                                        precision={0}
                                        suffix="M VNĐ"
                                        valueStyle={{ color: '#1890ff', fontSize: '18px' }}
                                        prefix={<DollarOutlined />}
                                    />
                                </Col>
                                <Col xs={12} sm={12} md={6}>
                                    <Statistic
                                        title="Phí Trả Chậm"
                                        value={policy.latePenaltyPercent}
                                        precision={2}
                                        suffix="%"
                                        valueStyle={{ color: '#cf1322', fontSize: '18px' }}
                                        prefix={<ClockCircleOutlined />}
                                    />
                                </Col>
                                <Col xs={12} sm={12} md={6}>
                                    <Statistic
                                        title="Đặt Cọc"
                                        value={policy.depositPercent}
                                        precision={2}
                                        suffix="%"
                                        valueStyle={{ color: '#faad14', fontSize: '18px' }}
                                        prefix={<WalletOutlined />}
                                    />
                                </Col>
                            </Row>

                            {/* Details Table */}
                            <Descriptions bordered column={2} size="small" className="mb-4">
                                <Descriptions.Item label="Dealer Tier" span={2}>
                                    <Tag color="blue" className="text-sm px-2 py-1">
                                        {policy.dealerTierName}
                                    </Tag>
                                    <span className="ml-2 text-gray-500">Level {policy.dealerTierLevel}</span>
                                </Descriptions.Item>

                                {policy.overrideNote && (
                                    <Descriptions.Item label="Ghi Chú Ghi Đè" span={2}>
                                        <span className="text-gray-700">{policy.overrideNote}</span>
                                    </Descriptions.Item>
                                )}

                                {policy.overrideEffectiveFrom && (
                                    <Descriptions.Item label="Hiệu Lực Từ">
                                        {new Date(policy.overrideEffectiveFrom).toLocaleDateString('vi-VN', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit'
                                        })}
                                    </Descriptions.Item>
                                )}

                                {policy.overrideEffectiveTo && (
                                    <Descriptions.Item label="Hiệu Lực Đến">
                                        {new Date(policy.overrideEffectiveTo).toLocaleDateString('vi-VN', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit'
                                        })}
                                    </Descriptions.Item>
                                )}

                                <Descriptions.Item label="Cập Nhật Lúc" span={policy.overrideEffectiveFrom ? 1 : 2}>
                                    {new Date(policy.resolvedAt).toLocaleString('vi-VN', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </Descriptions.Item>
                            </Descriptions>
                        </div>
                    ),
                    okText: 'Đóng',
                    okButtonProps: {
                        className: 'bg-blue-500 hover:bg-blue-600'
                    }
                });
            } else {
                message.error('Không thể tải dữ liệu chính sách đại lý');
            }
        } catch (error) {
            console.error('Error fetching dealer policy:', error);
            message.error('Có lỗi xảy ra khi tải chính sách đại lý');
        }
    };

    return { handleViewPolicy };
}

export default useDealerPolicyModal;
