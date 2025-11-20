import React from "react";
import { Alert } from "antd";
import { CalendarOutlined } from "@ant-design/icons";

const DebtPeriodInfo = ({ data }) => {
    if (!data) return null;

    const { periodFrom, periodTo } = data;

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    return (
        <div className="mb-4">
            <Alert
                message={
                    <span className="font-medium text-base">
                        <CalendarOutlined className="mr-2" />
                        Kỳ Công Nợ: {formatDate(periodFrom)} - {formatDate(periodTo)}
                    </span>
                }
                type="info"
                showIcon={false}
                className="border-blue-200 bg-blue-50"
            />
        </div>
    );
};

export default DebtPeriodInfo;
