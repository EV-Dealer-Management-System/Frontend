import React from "react";
import { Descriptions, message } from "antd";
import { getDealerBalanceAtQuarter } from "../../../../App/EVMAdmin/DealerTierManagement/GetDealerBalanceAtQuarter";

// Component hiển thị modal doanh thu đại lý
function DealerRevenueModal({ modal }) {
    const handleViewRevenue = async (dealerId, dealerName) => {
        try {
            const response = await getDealerBalanceAtQuarter(dealerId);
            if (response.isSuccess) {
                const data = response.result;
                modal.info({
                    title: `Doanh Thu Đại Lý: ${dealerName}`,
                    width: 700,
                    content: (
                        <div className="mt-4">
                            <Descriptions bordered column={2} size="small">
                                <Descriptions.Item label="Kỳ Từ" span={1}>
                                    {new Date(data.periodFrom).toLocaleDateString('vi-VN')}
                                </Descriptions.Item>
                                <Descriptions.Item label="Kỳ Đến" span={1}>
                                    {new Date(data.periodTo).toLocaleDateString('vi-VN')}
                                </Descriptions.Item>
                                <Descriptions.Item label="Số Dư Đầu Kỳ" span={2}>
                                    <span className="font-semibold text-blue-600">
                                        {data.openingBalance?.toLocaleString('vi-VN')} VNĐ
                                    </span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Số Tiền Mua Hàng" span={2}>
                                    <span className="font-semibold text-orange-600">
                                        {data.purchasesAmount?.toLocaleString('vi-VN')} VNĐ
                                    </span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Số Tiền Thanh Toán" span={2}>
                                    <span className="font-semibold text-green-600">
                                        {data.paymentsAmount?.toLocaleString('vi-VN')} VNĐ
                                    </span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Hoa Hồng" span={2}>
                                    <span className="font-semibold text-purple-600">
                                        {data.commissionsAmount?.toLocaleString('vi-VN')} VNĐ
                                    </span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Phí Phạt" span={2}>
                                    <span className="font-semibold text-red-600">
                                        {data.penaltiesAmount?.toLocaleString('vi-VN')} VNĐ
                                    </span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Số Dư Cuối Kỳ" span={2}>
                                    <span className="font-bold text-lg text-blue-700">
                                        {data.closingBalance?.toLocaleString('vi-VN')} VNĐ
                                    </span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Số Tiền Trả Thừa" span={2}>
                                    <span className="font-semibold text-teal-600">
                                        {data.overpaidAmount?.toLocaleString('vi-VN')} VNĐ
                                    </span>
                                </Descriptions.Item>
                                {data.note && (
                                    <Descriptions.Item label="Ghi Chú" span={2}>
                                        {data.note}
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </div>
                    ),
                    okText: 'Đóng',
                });
            } else {
                message.error(response.message || 'Không thể tải dữ liệu doanh thu');
            }
        } catch (error) {
            console.error('Error fetching dealer revenue:', error);
            message.error('Có lỗi xảy ra khi tải dữ liệu doanh thu');
        }
    };

    return { handleViewRevenue };
}

export default DealerRevenueModal;