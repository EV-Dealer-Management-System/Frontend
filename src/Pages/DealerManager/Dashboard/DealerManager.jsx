import React, { useState, useEffect } from "react";
import {
  Button,
  message,
  Spin,
  Typography,
} from "antd";
import {
  PageContainer,
} from "@ant-design/pro-components";
import {
  ReloadOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import DealerManagerLayout from "../../../Components/DealerManager/DealerManagerLayout";
import { getDealerManagerDashboard } from "../../../App/DealerManager/Dashboard/DealerManagerDashboard";

// Import các components con
import DashboardStats from './Components/DashboardStats';
import QuickActions from './Components/QuickActions';

const { Title, Text } = Typography;

function DealerManager() {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    dealerName: '',
    totalBookings: 0,
    totalDeliveries: 0,
    totalQuotes: 0,
    totalVehicles: 0,
    totalCustomers: 0,
    totalActiveStaff: 0
  });

  // Fetch dữ liệu từ API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getDealerManagerDashboard();

      if (response?.isSuccess && response?.result) {
        setDashboardData(response.result);
      } else {
        message.error('Không thể tải dữ liệu dashboard');
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu dashboard:', error);
      message.error('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại!');
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
    <DealerManagerLayout>
      <PageContainer
        title={
          <div className="flex items-center">
            <DashboardOutlined className="mr-2 text-blue-500" />
            Dashboard {dashboardData.dealerName || 'Đại Lý'}
          </div>
        }
        subTitle="Tổng quan hoạt động bán hàng và quản lý đại lý"
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
        style={{ maxWidth: 'none', width: '120%', marginLeft: '-100px' }}
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
            {/* Thống kê tổng quan - 6 KPI cards */}
            <DashboardStats
              dashboardData={dashboardData}
              loading={loading}
            />

            {/* Thao tác nhanh */}
            <QuickActions />
          </div>
        )}
      </PageContainer>
    </DealerManagerLayout>
  );
}

export default DealerManager;
