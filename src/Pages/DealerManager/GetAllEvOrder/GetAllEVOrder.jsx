import React, { useState, useEffect, useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Space, Typography, message, Spin, ConfigProvider } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import viVN from 'antd/lib/locale/vi_VN';

import DealerManagerLayout from '../../../Components/DealerManager/DealerManagerLayout';
import { getAllCustomerOrders } from '../../../App/DealerStaff/EVOrders/GetAllCustomerOrders';

import OrderTable from './Components/OrderTable';
import OrderDetailDrawer from './Components/OrderDetailDrawer';
import OrderSearchBar from './Components/OrderSearchBar';
import OrderStats from './Components/OrderStats';

const { Title } = Typography;

function OrderListManagerView() {
  // States
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  // Detail drawer states
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Search & Filter - đơn giản hóa theo pattern DealerStaff
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Header stats - tính toán như DealerStaff
  const headerStats = useMemo(() => {
    const total = pagination.total || orders.length;
    const pending = orders.filter((o) => [0, 1, 4, 8, 9].includes(o.status)).length;
    const completed = orders.filter((o) => [3, 5].includes(o.status)).length;
    const cancelled = orders.filter((o) => [6, 7].includes(o.status)).length;
    return { total, pending, done: completed, cancelled };
  }, [orders, pagination.total]);

  // Fetch orders - theo pattern DealerStaff
  const fetchOrders = async (page = 1, pageSize = 10, { silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);

      const params = {
        pageNumber: page,
        pageSize: pageSize,
      };

      const response = await getAllCustomerOrders(params);

      if (response?.isSuccess && response.result) {
        const { data, pagination: serverPaging } = response.result;
        setOrders(data || []);

        if (serverPaging) {
          setPagination({
            current: serverPaging.pageNumber,
            pageSize: serverPaging.pageSize,
            total: serverPaging.totalItems,
          });
        } else {
          setPagination({
            current: page,
            pageSize,
            total: data?.length || 0,
          });
        }
      } else {
        message.error(
          response?.message || 
          response?.errors?.[0] || 
          "Không tải được danh sách đơn hàng từ máy chủ"
        );
      }
    } catch (err) {
      console.error('Fetch orders failed:', err);
      message.error('Lỗi kết nối máy chủ!');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchOrders(1, 10);
  }, []);

  // Handlers
  const handlePageChange = (page, pageSize) => {
    fetchOrders(page, pageSize);
  };

  const openDetail = (record) => {
    setSelectedOrder(record);
    setDetailVisible(true);
  };

  const closeDetail = () => {
    setDetailVisible(false);
    setSelectedOrder(null);
  };

  // Filter orders - theo pattern DealerStaff
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const customer = o.customer || {};
      const search = searchText.trim().toLowerCase();
      const matchSearch =
        !search ||
        (customer.fullName || '').toLowerCase().includes(search) ||
        (customer.phoneNumber || '').toLowerCase().includes(search) ||
        (o.orderNo || '').toLowerCase().includes(search);
      const matchStatus =
        statusFilter === '' || o.status === Number(statusFilter);
      return matchSearch && matchStatus;
    });
  }, [orders, searchText, statusFilter]);

  return (
    <DealerManagerLayout>
      <ConfigProvider locale={viVN}>
        <PageContainer
          title={
            <Space>
              <ShoppingCartOutlined className="text-blue-600" />
              <span>Quản lý đơn hàng xe điện</span>
            </Space>
          }
          subTitle="Xem và theo dõi tình trạng các đơn hàng của khách hàng"
          className="bg-gray-50 min-h-screen"
        >
          {/* Stats */}
          <OrderStats stats={headerStats} />

          {/* Search Bar */}
          <OrderSearchBar
            searchText={searchText}
            setSearchText={setSearchText}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onSearch={() => fetchOrders(1, pagination.pageSize)}
            onReload={() => fetchOrders(1, pagination.pageSize)}
          />

          {/* Table */}
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <Spin size="large" />
            </div>
          ) : (
            <OrderTable
              orders={filteredOrders}
              pagination={pagination}
              loading={loading}
              onPageChange={handlePageChange}
              onViewDetail={openDetail}
            />
          )}

          {/* Order Detail Drawer */}
          <OrderDetailDrawer
            open={detailVisible}
            order={selectedOrder}
            onClose={closeDetail}
          />
        </PageContainer>
      </ConfigProvider>
    </DealerManagerLayout>
  );
}

export default OrderListManagerView;