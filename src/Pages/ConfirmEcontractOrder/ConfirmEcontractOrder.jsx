import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { message, Modal, Row, Col } from "antd";
import { PageContainer, ProCard } from "@ant-design/pro-components";
import { confirmCustomerOrder } from "../../App/DealerStaff/EVOrders/ConfirmCustomerOrder";
import PDFViewer from "./components/PDFViewer";
import ConfirmationActions from "./components/ConfirmationActions";
import OrderInfoCard from "./components/OrderInfoCard";
import GuideCard from "./components/GuideCard";

// Trang xác nhận hợp đồng điện tử
function ConfirmEcontractOrder() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Lấy params từ URL
    const downloadUrl = searchParams.get("downloadUrl");
    const customerOrderId = searchParams.get("customerOrderId");
    const email = searchParams.get("email");

    // State quản lý
    const [loading, setLoading] = useState(false);
    const [confirmationSent, setConfirmationSent] = useState(false);
    const [pdfError, setPdfError] = useState(null);

    // Kiểm tra params khi component mount
    useEffect(() => {
        if (!downloadUrl || !customerOrderId || !email) {
            message.error("Thiếu thông tin xác nhận. Vui lòng kiểm tra lại đường link.");
            setPdfError("Thiếu thông tin cần thiết để xác nhận hợp đồng");
        }
    }, [downloadUrl, customerOrderId, email]);

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
                    {/* PDF Viewer - Chiếm 2/3 màn hình */}
                    <Col xs={24} lg={16}>
                        <ProCard
                            title="Nội dung hợp đồng"
                            bordered
                            headerBordered
                            className="shadow-lg"
                            style={{ minHeight: "80vh" }}
                        >
                            <PDFViewer
                                pdfUrl={downloadUrl}
                                loading={false}
                                error={pdfError}
                            />
                        </ProCard>
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
