import React from "react";
import { Card, Descriptions, Tag } from "antd";

const DebtDetailTable = ({ data, loading }) => {
    if (!data) return null;

    const {
        purchasesAmount,
        paymentsAmount,
        commissionsAmount,
        penaltiesAmount,
        note,
        referenceNo,
    } = data;

    return (
        <Card loading={loading} className="mb-4 shadow-sm" title="Chi Tiết Giao Dịch Trong Kỳ">
            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                <Descriptions.Item label="Tổng Tiền Mua Hàng">
                    <span className="font-semibold text-orange-600">
                        {purchasesAmount?.toLocaleString("vi-VN")} VNĐ
                    </span>
                </Descriptions.Item>
                <Descriptions.Item label="Tổng Tiền Thanh Toán">
                    <span className="font-semibold text-green-600">
                        {paymentsAmount?.toLocaleString("vi-VN")} VNĐ
                    </span>
                </Descriptions.Item>
                <Descriptions.Item label="Hoa Hồng Được Hưởng">
                    <span className="font-semibold text-blue-600">
                        {commissionsAmount?.toLocaleString("vi-VN")} VNĐ
                    </span>
                </Descriptions.Item>
                <Descriptions.Item label="Phí Phạt">
                    <span className="font-semibold text-red-600">
                        {penaltiesAmount?.toLocaleString("vi-VN")} VNĐ
                    </span>
                </Descriptions.Item>
                <Descriptions.Item label="Mã Tham Chiếu">
                    <Tag color="geekblue">{referenceNo || "N/A"}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Ghi Chú">
                    {note || "Không có ghi chú"}
                </Descriptions.Item>
            </Descriptions>
        </Card>
    );
};

export default DebtDetailTable;
