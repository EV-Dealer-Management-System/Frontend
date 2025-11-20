import React, { useState } from "react";
import { Spin, Alert, Empty, Button, Space, Tooltip } from "antd";
import { 
  FileTextOutlined, 
  ZoomInOutlined, 
  ZoomOutOutlined, 
  ReloadOutlined,
  ExpandOutlined,
  CompressOutlined 
} from "@ant-design/icons";

// Component hiển thị PDF từ URL với chức năng zoom
function PDFViewer({ pdfUrl, loading, error }) {
  const [zoom, setZoom] = useState(100); // Zoom percentage
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoom(100);
  const toggleFullscreen = () => setIsFullscreen(prev => !prev);

  if (loading) {
    return (
      <div className="flex justify-center items-center" style={{ height: "70vh" }}>
        <Spin size="large" tip="Đang tải hợp đồng..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert
          message="Lỗi tải hợp đồng"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-8" style={{ height: "70vh" }}>
        <Empty
          image={<FileTextOutlined style={{ fontSize: 64, color: "#bfbfbf" }} />}
          description={
            <span className="text-gray-500 text-lg">
              Không tìm thấy hợp đồng. URL không hợp lệ.
            </span>
          }
        />
      </div>
    );
  }

  const containerClass = isFullscreen 
    ? "fixed inset-0 z-50 bg-white flex flex-col"
    : "w-full bg-gray-50 rounded-lg border border-gray-200 flex flex-col";
    
  const containerHeight = isFullscreen 
    ? "100vh" 
    : "calc(85vh - 40px)";

  return (
    <div className={containerClass} style={{ height: containerHeight }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <FileTextOutlined className="text-blue-500 text-lg" />
          <span className="font-medium text-gray-700">Hợp đồng điện tử</span>
          <span className="text-sm text-gray-500">({zoom}%)</span>
        </div>
        
        <Space>
          <Tooltip title="Thu nhỏ">
            <Button 
              icon={<ZoomOutOutlined />} 
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              size="small"
            />
          </Tooltip>
          
          <Tooltip title="Reset zoom">
            <Button 
              onClick={handleResetZoom}
              size="small"
              className="min-w-16 text-xs"
            >
              {zoom}%
            </Button>
          </Tooltip>
          
          <Tooltip title="Phóng to">
            <Button 
              icon={<ZoomInOutlined />} 
              onClick={handleZoomIn}
              disabled={zoom >= 300}
              size="small"
            />
          </Tooltip>
          
          <div className="w-px h-4 bg-gray-300" />
          
          <Tooltip title={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}>
            <Button 
              icon={isFullscreen ? <CompressOutlined /> : <ExpandOutlined />} 
              onClick={toggleFullscreen}
              size="small"
              type={isFullscreen ? "primary" : "default"}
            />
          </Tooltip>
        </Space>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div 
          className="mx-auto bg-white shadow-lg border border-gray-300 overflow-hidden"
          style={{ 
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            width: `${100 / (zoom / 100)}%`,
            minHeight: `${100 / (zoom / 100)}%`
          }}
        >
          <iframe
            src={pdfUrl}
            className="w-full border-0 block"
            style={{ 
              height: isFullscreen ? "90vh" : "75vh",
              minHeight: isFullscreen ? "90vh" : "75vh"
            }}
            title="Xem hợp đồng điện tử"
          />
        </div>
      </div>
    </div>
  );
}

export default PDFViewer;