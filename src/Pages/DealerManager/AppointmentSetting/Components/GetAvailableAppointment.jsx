import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Table, Card, message, Spin, Tag, Button, Space, Typography } from 'antd';
import { ReloadOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { GetAvailableSlot } from '../../../../App/DealerManager/AppointmentSetting/GetAvailableSlot';

const { Title, Text } = Typography;

const GetAvailableAppointment = forwardRef((props, ref) => {
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState([]);

  // Fetch dữ liệu slot có sẵn
  const fetchSlots = async () => {
    setLoading(true);
    try {
      const response = await GetAvailableSlot.getAvailableSlot();
      
      if (response.isSuccess) {
        const slotsData = (response.result || []).map((slot, index) => ({
          ...slot,
          key: index,
        }));
        setSlots(slotsData);
        message.success('Tải danh sách slot thành công!');
      } else {
        message.error(response.message || 'Có lỗi xảy ra khi tải dữ liệu');
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      message.error('Không thể tải danh sách slot. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  // Expose refresh method to parent component
  useImperativeHandle(ref, () => ({
    refresh: () => {
      fetchSlots();
    }
  }));

  // Làm mới dữ liệu
  const handleRefresh = () => {
    fetchSlots();
  };

  // Tính toán thống kê - đã xóa để không hiển thị cards thống kê

  // Format time từ "08:00:00" thành "08:00"
  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return timeString.substring(0, 5);
  };

  // Cấu hình cột cho bảng
  const columns = [
    {
      title: 'STT',
      dataIndex: 'key',
      key: 'key',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
      className: 'text-center font-medium',
    },
    {
      title: 'Khung Giờ',
      key: 'timeRange',
      render: (_, record) => (
        <Space size="small">
          <ClockCircleOutlined className="text-blue-500" />
          <span className="font-medium text-gray-800">
            {formatTime(record.openTime)} - {formatTime(record.closeTime)}
          </span>
        </Space>
      ),
      sorter: (a, b) => {
        const aStart = a.openTime || '00:00:00';
        const bStart = b.openTime || '00:00:00';
        return aStart.localeCompare(bStart);
      },
    },
    {
      title: 'Giờ Bắt Đầu',
      dataIndex: 'openTime',
      key: 'openTime',
      render: (time) => (
        <span className="text-gray-700">{formatTime(time)}</span>
      ),
      sorter: (a, b) => {
        const aStart = a.openTime || '00:00:00';
        const bStart = b.openTime || '00:00:00';
        return aStart.localeCompare(bStart);
      },
    },
    {
      title: 'Giờ Kết Thúc',
      dataIndex: 'closeTime',
      key: 'closeTime',
      render: (time) => (
        <span className="text-gray-700">{formatTime(time)}</span>
      ),
      sorter: (a, b) => {
        const aEnd = a.closeTime || '00:00:00';
        const bEnd = b.closeTime || '00:00:00';
        return aEnd.localeCompare(bEnd);
      },
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'isAvailable',
      key: 'isAvailable',
      render: (isAvailable) => {
        if (isAvailable === true) {
          return (
            <Tag 
              icon={<CheckCircleOutlined />} 
              color="success"
              className="px-3 py-1"
            >
              Có Sẵn
            </Tag>
          );
        } else {
          return (
            <Tag 
              icon={<CloseCircleOutlined />} 
              color="error"
              className="px-3 py-1"
            >
              Đã Đặt
            </Tag>
          );
        }
      },
      filters: [
        { text: 'Có Sẵn', value: true },
        { text: 'Đã Đặt', value: false },
      ],
      onFilter: (value, record) => record.isAvailable === value,
    },
  ];


  return (
    <div>
      {/* Header với title và nút - Đẹp hơn */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: 'none',
          background: '#fff'
        }}
        bodyStyle={{ padding: '20px 24px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
            }}>
              <ClockCircleOutlined style={{ color: '#fff', fontSize: '20px' }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, fontWeight: 600, color: '#1f2937' }}>
                Danh Sách Slot Lịch Lái Thử
              </Title>
              <Text type="secondary" style={{ fontSize: '13px' }}>
                Xem và quản lý các khung giờ có sẵn cho lái thử
              </Text>
            </div>
          </div>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
            size="large"
            style={{
              height: '44px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              border: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(24, 144, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 144, 255, 0.3)';
            }}
          >
            Làm Mới
          </Button>
        </div>
      </Card>

      {/* Bảng dữ liệu - Đẹp hơn */}
          <Card
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: 'none',
              background: '#fff'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Spin spinning={loading} tip="Đang tải dữ liệu...">
              <Table
                columns={columns}
                dataSource={slots}
                pagination={{
                  total: slots.length,
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} slot`,
                  className: 'text-center',
                }}
                scroll={{ x: 800 }}
                className="custom-table"
                locale={{
                  emptyText: (
                    <div className="text-center py-8">
                      <ClockCircleOutlined className="text-4xl text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg">
                        Chưa có slot nào
                      </p>
                    </div>
                  ),
                }}
              />
            </Spin>
          </Card>

        <style jsx>{`
          .custom-table .ant-table-thead > tr > th {
            background-color: #f8fafc;
            border-bottom: 2px solid #e2e8f0;
            font-weight: 600;
            color: #334155;
          }
          
          .custom-table .ant-table-tbody > tr:hover > td {
            background-color: #f1f5f9;
          }
          
          .custom-table .ant-table-tbody > tr > td {
            border-bottom: 1px solid #f1f5f9;
          }
        `}</style>
    </div>
  );
});

GetAvailableAppointment.displayName = 'GetAvailableAppointment';

export default GetAvailableAppointment;

