import React from "react";
import { Button, Space, Result } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, SafetyOutlined } from "@ant-design/icons";
import { ProCard } from "@ant-design/pro-components";

// Component hiển thị các nút xác nhận/từ chối
function ConfirmationActions({ onAccept, onReject, loading, confirmationSent }) {
  if (confirmationSent) {
    return (
      <ProCard bordered className="shadow-lg">
        <Result
          status="success"
          title="Đã gửi phản hồi thành công"
          subTitle="Cảm ơn bạn đã xác nhận. Bạn có thể đóng trang này."
        />
      </ProCard>
    );
  }

  return (
    <ProCard
      title={
        <div className="flex items-center gap-2">
          <SafetyOutlined className="text-blue-600" />
          <span>Xác nhận hợp đồng</span>
        </div>
      }
      bordered
      headerBordered
      className="shadow-lg"
    >
      <div className="text-center">
        <p className="text-gray-600 mb-6 text-base">
          Vui lòng xem xét kỹ hợp đồng và chọn hành động phù hợp:
        </p>
        <Space direction="vertical" size="large" className="w-full">
          <Button
            type="primary"
            size="large"
            icon={<CheckCircleOutlined />}
            onClick={onAccept}
            loading={loading}
            block
            className="h-12 text-base font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-0"
          >
            Tôi đồng ý và xác nhận
          </Button>
          <Button
            danger
            size="large"
            icon={<CloseCircleOutlined />}
            onClick={onReject}
            loading={loading}
            block
            className="h-12 text-base font-semibold"
          >
            Tôi không đồng ý
          </Button>
        </Space>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-gray-600 leading-relaxed">
            Bằng việc nhấn "Tôi đồng ý và xác nhận", bạn xác nhận đã đọc và hiểu rõ các điều khoản trong hợp đồng.
          </p>
        </div>
      </div>
    </ProCard>
  );
}

export default ConfirmationActions;