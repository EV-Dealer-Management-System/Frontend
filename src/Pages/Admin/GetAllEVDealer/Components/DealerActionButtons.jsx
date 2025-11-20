import React from "react";
import { Button } from "antd";
import { EyeOutlined, HistoryOutlined, FileTextOutlined } from "@ant-design/icons";

// Component các nút hành động cho từng đại lý
function DealerActionButtons({ record, onViewRevenue, onViewDebtDetail, onViewPolicy }) {
    return (
        <div className="flex flex-col gap-1">
            <Button
                type="primary"
                icon={<EyeOutlined />}
                size="small"
                className="bg-blue-500 hover:bg-blue-600 w-full"
                onClick={() => onViewRevenue(record.id, record.name)}
            >
                Xem Doanh Thu
            </Button>
            <Button
                type="default"
                icon={<HistoryOutlined />}
                size="small"
                className="w-full"
                onClick={() => onViewDebtDetail(record.id, record.name)}
            >
                Chi Tiết Công Nợ
            </Button>
            <Button
                type="default"
                icon={<FileTextOutlined />}
                size="small"
                className="w-full border-green-500 text-green-600 hover:bg-green-50"
                onClick={() => onViewPolicy(record.id, record.name)}
            >
                Xem Điều Khoản
            </Button>
        </div>
    );
}

export default DealerActionButtons;