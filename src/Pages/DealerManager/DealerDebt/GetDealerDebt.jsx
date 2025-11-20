import React, { useState, useEffect, useCallback } from "react";
import { Spin, Result, Button, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { jwtDecode } from "jwt-decode";
import DealerManagerLayout from "../../../Components/DealerManager/DealerManagerLayout";
import DebtSummaryCard from "./Components/DebtSummaryCard";
import DebtDetailTable from "./Components/DebtDetailTable";
import DebtPeriodInfo from "./Components/DebtPeriodInfo";
import DebtDetailModal from "./Components/DebtDetailModal";
import { getDealerBalanceAtQuarter } from "../../../App/DealerManager/DealerDebt/GetDealerBalanceAtQuarter";

const GetDealerDebt = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const fetchDebtData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("jwt_token");
            if (!token) {
                throw new Error("Không tìm thấy token xác thực");
            }

            const decoded = jwtDecode(token);
            // Thử tìm dealerId trong token với các key phổ biến
            const dealerId = decoded.DealerId || decoded.dealerId || decoded.dealer_id;

            const response = await getDealerBalanceAtQuarter(dealerId);

            if (response && response.isSuccess) {
                setData(response.result);
            } else {
                throw new Error(response?.message || "Không thể tải thông tin công nợ");
            }
        } catch (err) {
            console.error("Error fetching debt data:", err);
            setError(err.message);
            message.error(err.message || "Có lỗi xảy ra khi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDebtData();
    }, [fetchDebtData]);

    const renderContent = () => {
        if (loading && !data) {
            return (
                <div className="flex justify-center items-center py-24">
                    <Spin size="large" tip="Đang tải dữ liệu công nợ..." />
                </div>
            );
        }

        if (error) {
            return (
                <Result
                    status="error"
                    title="Không thể tải dữ liệu"
                    subTitle={error}
                    extra={[
                        <Button
                            type="primary"
                            key="retry"
                            icon={<ReloadOutlined />}
                            onClick={fetchDebtData}
                        >
                            Thử lại
                        </Button>,
                    ]}
                />
            );
        }

        if (!data) {
            return (
                <Result
                    status="info"
                    title="Không có dữ liệu"
                    subTitle="Hiện tại không có thông tin công nợ cho kỳ này."
                    extra={[
                        <Button key="reload" onClick={fetchDebtData} icon={<ReloadOutlined />}>
                            Tải lại
                        </Button>,
                    ]}
                />
            );
        }

        return (
            <div className="space-y-4">
                <DebtPeriodInfo data={data} />
                <DebtSummaryCard
                    data={data}
                    loading={loading}
                    onViewDetails={() => setIsModalVisible(true)}
                />
                <DebtDetailTable data={data} loading={loading} />
                <DebtDetailModal
                    visible={isModalVisible}
                    onClose={() => setIsModalVisible(false)}
                    periodData={data}
                />
            </div>
        );
    };

    return (
        <DealerManagerLayout>
            <PageContainer
                header={{
                    title: "Quản Lý Công Nợ",
                    breadcrumb: {},
                }}
                extra={[
                    <Button
                        key="refresh"
                        icon={<ReloadOutlined />}
                        onClick={fetchDebtData}
                        loading={loading}
                    >
                        Làm mới
                    </Button>,
                ]}
            >
                {renderContent()}
            </PageContainer>
        </DealerManagerLayout>
    );
};

export default GetDealerDebt;
