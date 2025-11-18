import React from "react";
import { ProCard } from "@ant-design/pro-components";
import { InfoCircleOutlined, CheckSquareOutlined, FileSearchOutlined, SafetyOutlined } from "@ant-design/icons";
import { Timeline } from "antd";

// Component hiển thị hướng dẫn
function GuideCard() {
  return (
    <ProCard
      title={
        <div className="flex items-center gap-2">
          <InfoCircleOutlined className="text-blue-600" />
          <span>Hướng dẫn xác nhận</span>
        </div>
      }
      bordered
      headerBordered
      className="shadow-lg"
    >
      <Timeline
        items={[
          {
            color: "blue",
            dot: <FileSearchOutlined className="text-base" />,
            children: (
              <div>
                <p className="font-medium text-gray-800">Đọc kỹ hợp đồng</p>
                <p className="text-xs text-gray-600">Xem xét toàn bộ nội dung hợp đồng điện tử</p>
              </div>
            ),
          },
          {
            color: "green",
            dot: <CheckSquareOutlined className="text-base" />,
            children: (
              <div>
                <p className="font-medium text-gray-800">Kiểm tra thông tin</p>
                <p className="text-xs text-gray-600">Đảm bảo thông tin cá nhân và đơn hàng chính xác</p>
              </div>
            ),
          },
          {
            color: "orange",
            dot: <SafetyOutlined className="text-base" />,
            children: (
              <div>
                <p className="font-medium text-gray-800">Xác nhận hoặc từ chối</p>
                <p className="text-xs text-gray-600">Chọn hành động phù hợp với quyết định của bạn</p>
              </div>
            ),
          },
        ]}
      />
      <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
        <p className="text-xs text-gray-700 leading-relaxed">
          <strong>Lưu ý:</strong> Sau khi xác nhận, hợp đồng sẽ có hiệu lực pháp lý. 
          Nếu có thắc mắc, vui lòng liên hệ bộ phận hỗ trợ trước khi xác nhận.
        </p>
      </div>
    </ProCard>
  );
}

export default GuideCard;
