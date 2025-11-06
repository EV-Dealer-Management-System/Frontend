import React, { useState, useEffect } from 'react';
import { Row, Col, message, Button } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { ReloadOutlined, DashboardOutlined } from '@ant-design/icons';
import DealerStaffLayout from '../../../Components/DealerStaff/DealerStaffLayout';
import { getDealerStaffDashboard } from '../../../App/DealerStaff/Dashboard/DealerStaffDashboard';

// Import các components con
import DealerStaffStats from './Components/DealerStaffStats';
import QuickActions from './Components/QuickActions';
import RecentActivity from './Components/RecentActivity';

function DealerStaff() {
    const [loading, setLoading] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);

    // Fetch dữ liệu từ API
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await getDealerStaffDashboard();

            if (response?.isSuccess && response?.result) {
                setDashboardData(response.result);
                console.log('Dealer Staff Dashboard Data:', response.result);
            } else {
                console.warn('Dashboard API failed:', response);
                message.error('Không thể tải dữ liệu dashboard!');
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
        fetchDashboardData();
    }, []);

    // Xử lý refresh dữ liệu
    const handleRefresh = () => {
        fetchDashboardData();
    };



    return (
        <DealerStaffLayout>
            <PageContainer
                title={
                    <div className="flex items-center">
                        <DashboardOutlined className="mr-2 text-blue-500" />
                        Dashboard - Nhân Viên Đại Lý
                    </div>
                }
                subTitle="Tổng quan hoạt động bán hàng xe điện"
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
            >
                {/* Thống kê tổng quan */}
                <DealerStaffStats
                    dashboardData={dashboardData}
                    loading={loading}
                />

                {/* Tác vụ nhanh và Hoạt động gần đây */}
                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} lg={12}>
                        <QuickActions
                            dashboardData={dashboardData}
                            loading={loading}
                        />
                    </Col>

                    <Col xs={24} lg={12}>
                        <RecentActivity
                            dashboardData={dashboardData}
                            loading={loading}
                        />
                    </Col>
                </Row>
            </PageContainer>
        </DealerStaffLayout>
    );
}

export default DealerStaff;