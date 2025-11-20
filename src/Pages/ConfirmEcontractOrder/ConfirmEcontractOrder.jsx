import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { message, Modal, Row, Col, Button, Space, Divider, Card, Slider } from "antd";
import { FileTextOutlined, FilePdfOutlined, DownloadOutlined, EyeOutlined, ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
import { PageContainer, ProCard } from "@ant-design/pro-components";
import { confirmCustomerOrder, getEcontractPreview } from "../../App/DealerStaff/EVOrders/ConfirmCustomerOrder";
import PDFViewer from "../Admin/SignContract/Components/PDF/PDFViewer";
import ConfirmationActions from "./Components/ConfirmationActions";
import OrderInfoCard from "./Components/OrderInfoCard";
import GuideCard from "./Components/GuideCard";

// Trang xác nhận hợp đồng điện tử
function ConfirmEcontractOrder() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Lấy params từ URL - theo pattern ContractPage
    const getRawDownloadUrl = () => {
        // Lấy raw URL để tránh decode tự động của React Router
        const rawSearch = window.location.search;
        const match = rawSearch.match(/[?&]downloadUrl=([^&]*)/); 
        return match ? match[1] : null; // Không decode, giữ nguyên như trong URL
    };
    
    const downloadUrl = getRawDownloadUrl();
    const customerOrderId = searchParams.get("customerOrderId");
    const email = searchParams.get("email");
    
    // Debug log để kiểm tra URL
    console.log('Raw downloadUrl from URL:', downloadUrl);
    console.log('CustomerOrderId:', customerOrderId);
    console.log('Email:', email);    // State quản lý
    const [loading, setLoading] = useState(false);
    const [confirmationSent, setConfirmationSent] = useState(false);
    const [pdfError, setPdfError] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(true);
    
    // PDF Viewer states - giống ContractView
    const [showInlineViewer, setShowInlineViewer] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1.25);

    // Kiểm tra params và load PDF khi component mount
    useEffect(() => {
        if (!downloadUrl || !customerOrderId || !email) {
            message.error("Thiếu thông tin xác nhận. Vui lòng kiểm tra lại đường link.");
            setPdfError("Thiếu thông tin cần thiết để xác nhận hợp đồng");
            setPdfLoading(false);
            return;
        }

        // Load PDF từ API - theo pattern ContractPage
        const loadPDF = async () => {
            setPdfLoading(true);
            setPdfError(null);
            
            try {
                console.log("Loading PDF from downloadUrl:", downloadUrl);
                console.log("Raw URL length:", downloadUrl?.length);
                
                const pdfBlobUrl = await getEcontractPreview(downloadUrl);
                console.log("PDF blob URL created:", pdfBlobUrl?.substring(0, 50) + '...');
                setPdfUrl(pdfBlobUrl);
            } catch (error) {
                console.error("Error loading PDF:", error);
                console.error("Error response:", error.response);
                
                // Hiển thị thông báo lỗi cụ thể dựa trên loại lỗi
                let errorMessage = "Không thể tải hợp đồng. Vui lòng thử lại sau.";
                
                if (error.isNotFound) {
                    errorMessage = "📄 " + error.message;
                    message.error(error.message);
                } else if (error.isUnauthorized) {
                    errorMessage = "🔒 " + error.message;
                    message.warning(error.message);
                } else if (error.isForbidden) {
                    errorMessage = "⛔ " + error.message;
                    message.warning(error.message);
                } else if (error.isTimeout) {
                    errorMessage = "⏱️ " + error.message;
                    message.error(error.message);
                } else {
                    errorMessage = error.message || errorMessage;
                    message.error(error.message || "Có lỗi xảy ra khi tải hợp đồng");
                }
                
                setPdfError(errorMessage);
            } finally {
                setPdfLoading(false);
            }
        };

        loadPDF();
    }, [downloadUrl, customerOrderId, email]);

    // Cleanup: Revoke blob URL khi component unmount - theo pattern ContractPage
    useEffect(() => {
        return () => {
            if (pdfUrl) {
                console.log('Cleaning up PDF blob URL:', pdfUrl.substring(0, 50) + '...');
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [pdfUrl]);

    // PDF handling functions - giống ContractView
    const togglePDFViewer = () => {
        if (!pdfUrl) {
            message.warning('Không có link PDF');
            return;
        }
        setShowInlineViewer(!showInlineViewer);
    };

    const openPdfInNewTab = () => {
        if (!pdfUrl) {
            message.warning('Không có link PDF');
            return;
        }
        window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    };

    const downloadPdfFile = () => {
        if (!pdfUrl) {
            message.warning('Không có file PDF để tải xuống');
            return;
        }
        
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `hop-dong-${customerOrderId || 'contract'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        message.success('Đang tải file PDF...');
    };

    // Zoom controls - giống ContractView
    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 0.25, 3.0));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
    };

    const handleZoomReset = () => {
        setZoomLevel(1.25);
    };

    // Xử lý xác nhận hợp đồng
    const handleConfirm = async (isAccept) => {
        setLoading(true);
        try {
            await confirmCustomerOrder(customerOrderId, email, isAccept);
            setConfirmationSent(true);

            Modal.success({
                title: isAccept ? "Xác nhận thành công" : "Đã từ chối hợp đồng",
                content: isAccept
                    ? "Bạn đã xác nhận hợp đồng thành công. Chúng tôi sẽ tiếp tục xử lý đơn hàng của bạn."
                    : "Bạn đã từ chối hợp đồng. Nếu có thắc mắc, vui lòng liên hệ với chúng tôi.",
                onOk: () => {
                    navigate("/");
                }
            });
        } catch (error) {
            message.error(
                error.response?.data?.message ||
                "Có lỗi xảy ra khi xác nhận. Vui lòng thử lại sau."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <PageContainer
                header={{
                    title: "Xác Nhận Hợp Đồng Điện Tử",
                    subTitle: "Vui lòng xem xét kỹ nội dung hợp đồng trước khi xác nhận",
                    ghost: true,
                }}
                className="backdrop-blur-sm"
            >
                <Row gutter={[24, 24]}>
                    {/* PDF Section - giống ContractView */}
                    <Col xs={24} lg={16}>
                        {/* Contract Info */}
                        <Card 
                            title={
                                <span className="flex items-center">
                                    <FilePdfOutlined className="text-red-500 mr-2" />
                                    Thông Tin Hợp Đồng
                                </span>
                            }
                            className="mb-4"
                        >
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="font-medium">Mã đơn hàng:</span>
                                    <span className="text-gray-600 font-mono">{customerOrderId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Email:</span>
                                    <span className="text-gray-600">{email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Trạng thái:</span>
                                    <span className={`font-semibold ${
                                        pdfLoading ? 'text-blue-600' :
                                        pdfError ? 'text-red-600' :
                                        pdfUrl ? 'text-green-600' : 'text-gray-600'
                                    }`}>
                                        {pdfLoading ? 'Đang tải...' :
                                         pdfError ? 'Lỗi tải PDF' :
                                         pdfUrl ? '✅ Sẵn sàng xem' : 'Chưa tải'}
                                    </span>
                                </div>
                            </div>
                        </Card>

                        {/* PDF Actions - giống ContractView */}
                        <Card className="mb-4">
                            <div className="text-center py-6">
                                <FilePdfOutlined className="text-6xl text-red-400 mb-4" />
                                
                                {pdfLoading && (
                                    <div>
                                        <h4 className="text-lg font-medium mb-2">Đang tải hợp đồng...</h4>
                                        <p className="text-gray-500 mb-4">Vui lòng đợi trong giây lát</p>
                                    </div>
                                )}
                                
                                {pdfError && (
                                    <div>
                                        <h4 className="text-lg font-medium mb-2 text-red-600">Không thể tải PDF</h4>
                                        <p className="text-lg font-bold text-red-600 mb-4">{pdfError}</p>
                                        <Button 
                                            type="primary" 
                                            onClick={() => window.location.reload()}
                                        >
                                            Thử lại
                                        </Button>
                                    </div>
                                )}
                                
                                {pdfUrl && !pdfLoading && (
                                    <div>
                                        <h4 className="text-lg font-medium mb-4">Hợp đồng đã sẵn sàng</h4>
                                        
                                        <Space size="large" wrap>
                                            <Button
                                                type="primary"
                                                size="large"
                                                icon={<EyeOutlined />}
                                                onClick={togglePDFViewer}
                                                className="bg-purple-500 hover:bg-purple-600"
                                            >
                                                {showInlineViewer ? 'Ẩn PDF' : 'Xem PDF'}
                                            </Button>
                                            
                                            <Button
                                                size="large"
                                                icon={<FilePdfOutlined />}
                                                onClick={openPdfInNewTab}
                                            >
                                                Mở tab mới
                                            </Button>
                                            
                                            <Button
                                                type="primary"
                                                size="large"
                                                icon={<DownloadOutlined />}
                                                onClick={downloadPdfFile}
                                                className="bg-green-500 hover:bg-green-600"
                                            >
                                                Tải xuống
                                            </Button>
                                        </Space>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Inline PDF Viewer - giống ContractView */}
                        {showInlineViewer && pdfUrl && (
                            <Card 
                                title={
                                    <div className="flex items-center justify-between">
                                        <span>PDF Viewer</span>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-gray-500">
                                                Zoom: {Math.round(zoomLevel * 100)}%
                                            </span>
                                            <Space>
                                                <Button 
                                                    size="small" 
                                                    icon={<ZoomOutOutlined />} 
                                                    onClick={handleZoomOut}
                                                    disabled={zoomLevel <= 0.5}
                                                />
                                                <Button 
                                                    size="small" 
                                                    onClick={handleZoomReset}
                                                    type={zoomLevel === 1.5 ? 'primary' : 'default'}
                                                >
                                                125%
                                                </Button>
                                                <Button 
                                                    size="small" 
                                                    icon={<ZoomInOutlined />} 
                                                    onClick={handleZoomIn}
                                                    disabled={zoomLevel >= 3.0}
                                                />
                                            </Space>
                                        </div>
                                    </div>
                                }
                                className="mb-4"
                            >
                                {/* Zoom Slider */}
                                <div className="mb-4 px-4">
                                    <Row align="middle" gutter={16}>
                                        <Col span={2}>
                                            <span className="text-xs text-gray-500">50%</span>
                                        </Col>
                                        <Col span={20}>
                                            <Slider
                                                min={0.5}
                                                max={3.0}
                                                step={0.25}
                                                value={zoomLevel}
                                                onChange={setZoomLevel}
                                                tooltip={{
                                                    formatter: (value) => `${Math.round(value * 100)}%`
                                                }}
                                            />
                                        </Col>
                                        <Col span={2} className="text-right">
                                            <span className="text-xs text-gray-500">300%</span>
                                        </Col>
                                    </Row>
                                </div>
                                
                                {/* PDF Viewer Container */}
                                <div className="border rounded-lg bg-white max-h-[80vh] overflow-auto flex justify-center">
                                    <PDFViewer
                                        contractNo={customerOrderId || 'PDF'}
                                        pdfUrl={pdfUrl}
                                        showAllPages={true}
                                        scale={zoomLevel}
                                    />
                                </div>
                            </Card>
                        )}
                    </Col>

                    {/* Actions Panel - Chiếm 1/3 màn hình */}
                    <Col xs={24} lg={8}>
                        <div className="space-y-6">
                            {/* Confirmation Actions */}
                            <ConfirmationActions
                                onAccept={() => handleConfirm(true)}
                                onReject={() => handleConfirm(false)}
                                loading={loading}
                                confirmationSent={confirmationSent}
                            />

                            {/* Thông tin đơn hàng */}
                            <OrderInfoCard
                                customerOrderId={customerOrderId}
                                email={email}
                            />

                            {/* Hướng dẫn */}
                            <GuideCard />
                        </div>
                    </Col>
                </Row>
            </PageContainer>
        </div>
    );
}

export default ConfirmEcontractOrder;
