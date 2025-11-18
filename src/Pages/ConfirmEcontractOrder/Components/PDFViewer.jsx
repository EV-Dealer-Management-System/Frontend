import React from "react";
import { Spin, Alert, Empty } from "antd";
import { FileTextOutlined } from "@ant-design/icons";

// Component hiển thị PDF từ URL
function PDFViewer({ pdfUrl, loading, error }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" tip="Đang tải hợp đồng..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi tải hợp đồng"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  if (!pdfUrl) {
    return (
      <Empty
        image={<FileTextOutlined style={{ fontSize: 64, color: "#bfbfbf" }} />}
        description={
          <span className="text-gray-500">
            Không tìm thấy hợp đồng. URL không hợp lệ.
          </span>
        }
      />
    );
  }

  return (
    <div className="w-full bg-gray-50 rounded-lg overflow-hidden" style={{ height: "calc(80vh - 80px)" }}>
      <iframe
        src={pdfUrl}
        className="w-full h-full border-0"
        title="Xem hợp đồng điện tử"
      />
    </div>
  );
}

export default PDFViewer;