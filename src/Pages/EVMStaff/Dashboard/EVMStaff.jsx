import React, { useState, useEffect } from "react";
import { PageContainer } from "@ant-design/pro-components";
import { Button, message, Spin } from "antd";
import { ReloadOutlined, DashboardOutlined } from '@ant-design/icons';
import EVMStaffLayout from "../../../Components/EVMStaff/EVMStaffLayout";
import { EVMGetAllEVDealer } from "../../../App/EVMStaff/Dashboard/GetEVAllDealer";
import { getAllEVDelivery } from "../../../App/EVMStaff/EVDelivery/GetAllEVDelivery";
import { getAllEVBookings } from "../../../App/DealerManager/EVBooking/GetAllEVBooking";
import { GetStaffFeedback } from "../../../App/DealerManager/StaffFeedbackManage/GetStaffFeedback";

// Import các components con
import DashboardStats from "./Components/DashboardStats";
import BookingOverview from "./Components/BookingOverview";
import ContractCharts from "./Components/BookingCharts";
import DeliveryMetrics from "./Components/DeliveryMetrics";
import DealerOverview from "./Components/DealerOverview";

function EVMStaff() {
    const [loading, setLoading] = useState(false);
    const [feedbackData, setFeedbackData] = useState([]);
    const [bookingData, setBookingData] = useState([]);
    const [deliveryData, setDeliveryData] = useState([]);
    const [dealerData, setDealerData] = useState([]);

    // Fetch dữ liệu từ API
    const fetchData = async () => {
        try {
            setLoading(true);

            // Gọi song song 4 API
            const [feedbackResponse, bookingResponse, deliveryResponse, dealerResponse] = await Promise.all([
                GetStaffFeedback.getStaffFeedback(),
                getAllEVBookings(),
                getAllEVDelivery(1, 10000, null),
                EVMGetAllEVDealer({ pageSize: 10000 })
            ]);

            // Xử lý dữ liệu feedback
            if (feedbackResponse?.isSuccess && feedbackResponse?.result) {
                setFeedbackData(feedbackResponse.result);
            }

            // Xử lý dữ liệu booking
            if (bookingResponse?.isSuccess && bookingResponse?.result?.data) {
                setBookingData(bookingResponse.result.data);
            }

            // Xử lý dữ liệu giao xe
            if (deliveryResponse?.isSuccess && deliveryResponse?.result?.data) {
                setDeliveryData(deliveryResponse.result.data);
            }

            // Xử lý dữ liệu đại lý
            if (dealerResponse?.isSuccess && dealerResponse?.result?.data) {
                setDealerData(dealerResponse.result.data);
            }

        } catch (error) {
            console.error('Lỗi khi tải dữ liệu dashboard:', error);
            message.error('Không thể tải dữ liệu dashboard. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    // Load dữ liệu khi component mount
    useEffect(() => {
        fetchData();
    }, []);

    // Xử lý refresh dữ liệu
    const handleRefresh = () => {
        fetchData();
    };

    return (
        <EVMStaffLayout>
            <PageContainer
                title={
                    <div className="flex items-center">
                        <DashboardOutlined className="mr-2 text-blue-500" />
                        Dashboard EVM Staff
                    </div>
                }
                subTitle="Tổng quan quản lý hợp đồng và giao xe cho đại lý"
                extra={
                    <Button
                        type="primary"
                        icon={<ReloadOutlined />}
                        onClick={handleRefresh}
                        loading={loading}
                    >
                        Làm mới dữ liệu
                    </Button>
                }
                style={{ maxWidth: 'none', width: '120%', marginLeft: '-50px' }}
                className="w-full"
                contentStyle={{ padding: '8px 16px', width: '120%' }}
            >
                {loading && (
                    <div className="flex justify-center items-center py-8">
                        <Spin size="large" />
                    </div>
                )}

                {!loading && (
                    <div>
                        {/* Thống kê tổng quan - 4 KPI cards */}
                        <DashboardStats
                            feedbackData={feedbackData}
                            deliveryData={deliveryData}
                            dealerData={dealerData}
                            loading={loading}
                        />

                        {/* Booking Overview - Hiển thị booking chờ dealer ký và chờ duyệt */}
                        <BookingOverview
                            bookingData={bookingData}
                            loading={loading}
                        />

                        {/* Bảng booking chờ duyệt */}
                        <ContractCharts
                            bookingData={bookingData}
                            loading={loading}
                        />

                        {/* Performance Metrics - Pending/In Transit/Completed */}
                        <DeliveryMetrics
                            deliveryData={deliveryData}
                            loading={loading}
                        />

                        {/* Top 5 đại lý có booking nhiều nhất */}
                        <DealerOverview
                            dealerData={dealerData}
                            bookingData={bookingData}
                            loading={loading}
                        />
                    </div>
                )}
            </PageContainer>
        </EVMStaffLayout>
    );
}

export default EVMStaff;
