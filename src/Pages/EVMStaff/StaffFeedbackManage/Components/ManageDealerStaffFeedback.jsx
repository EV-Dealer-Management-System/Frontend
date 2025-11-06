import React, { useState, useEffect, useMemo } from 'react';
import { Table, Card, Tag, Space, Input, Typography, Image, Button, Select, App } from 'antd';
import { SearchOutlined, StarOutlined, FilterOutlined } from '@ant-design/icons';
import { GetStaffFeedback } from '../../../../App/DealerManager/StaffFeedbackManage/GetStaffFeedback';
import { UpdateDealerFeedbackStatus } from '../../../../App/EVMStaff/DealerFeedback/UpdateDealerFeedbackStatus';
const { Text } = Typography;
const { Option } = Select;

const ManageDealerStaffFeedback = () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState(null); // null = tất cả
  const [updatingId, setUpdatingId] = useState(null);
  const [recentlyUpdatedIds, setRecentlyUpdatedIds] = useState(new Set()); // Track feedback vừa cập nhật

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await GetStaffFeedback.getStaffFeedback();
      
      if (response?.isSuccess) {
        // Lọc bỏ các item không có id và chỉ lấy những item hợp lệ
        // Đảm bảo status là number (parse từ string nếu cần)
        const validData = (response.result || [])
          .filter(item => item && item.id)
          .map(item => ({
            ...item,
            status: typeof item.status === 'string' ? parseInt(item.status, 10) : item.status
          }));
        setData(validData);
      } else {
        message.error(response?.message || 'Không thể tải danh sách feedback');
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching dealer staff feedbacks:', error);
      message.error('Đã xảy ra lỗi khi tải danh sách feedback');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (feedbackId, newStatus, currentStatus) => {
    // Đảm bảo status là number
    const currentStatusNum = typeof currentStatus === 'string' ? parseInt(currentStatus, 10) : currentStatus;
    const newStatusNum = typeof newStatus === 'string' ? parseInt(newStatus, 10) : newStatus;

    // Kiểm tra nếu feedback đã được xử lý rồi (status != 0)
    if (currentStatusNum !== 0 && currentStatusNum !== null && currentStatusNum !== undefined) {
      message.warning('Feedback này đã được xử lý rồi và không thể thay đổi trạng thái!');
      return;
    }

    // Kiểm tra nếu đang cập nhật từ trạng thái đã xử lý
    const feedback = data.find(item => item.id === feedbackId);
    const feedbackStatus = typeof feedback?.status === 'string' ? parseInt(feedback.status, 10) : feedback?.status;
    if (feedback && feedbackStatus !== 0) {
      message.warning('Feedback này đã được xử lý rồi và không thể thay đổi trạng thái!');
      return;
    }

    try {
      setUpdatingId(feedbackId);
      const response = await UpdateDealerFeedbackStatus.updateStatusDealerFeedback(feedbackId, newStatusNum);

      if (response?.isSuccess || response?.success) {
        message.success('Cập nhật trạng thái thành công!');
        // Thêm feedback ID vào danh sách vừa cập nhật
        setRecentlyUpdatedIds(prev => new Set([...prev, feedbackId]));
        // Xóa khỏi danh sách sau 30 giây
        setTimeout(() => {
          setRecentlyUpdatedIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(feedbackId);
            return newSet;
          });
        }, 30000);
        fetchFeedbacks();
      } else {
        message.error(response?.message || 'Cập nhật trạng thái thất bại');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Đã xảy ra lỗi khi cập nhật trạng thái');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    // Đảm bảo status là number
    const statusNum = typeof status === 'string' ? parseInt(status, 10) : status;
    
    const statusMap = {
      0: { text: 'Chờ xử lý', color: 'gold' },
      1: { text: 'Đã chấp nhận', color: 'cyan' },
      2: { text: 'Đã từ chối', color: 'red' },
      3: { text: 'Đã trả lời', color: 'green' },
      4: { text: 'Đã hủy', color: 'default' },
    };
    const statusInfo = statusMap[statusNum] || { text: `Không xác định (${status})`, color: 'default' };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  // Sắp xếp và filter dữ liệu
  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Filter theo search text
    if (searchText) {
      const search = searchText.toLowerCase();
      result = result.filter(item =>
        item.dealerName?.toLowerCase().includes(search) ||
        item.feedbackContent?.toLowerCase().includes(search)
      );
    }

    // Filter theo trạng thái
    if (statusFilter !== null && statusFilter !== undefined) {
      result = result.filter(item => {
        const itemStatus = typeof item.status === 'string' ? parseInt(item.status, 10) : item.status;
        return itemStatus === statusFilter;
      });
    }

    // Sắp xếp theo thứ tự ưu tiên:
    // 1. Chờ xử lý (status = 0)
    // 2. Vừa cập nhật (trong recentlyUpdatedIds) - ngay sau chờ xử lý
    // 3. Các trạng thái khác
    result.sort((a, b) => {
      const statusA = typeof a.status === 'string' ? parseInt(a.status, 10) : a.status;
      const statusB = typeof b.status === 'string' ? parseInt(b.status, 10) : b.status;
      const isRecentlyUpdatedA = recentlyUpdatedIds.has(a.id);
      const isRecentlyUpdatedB = recentlyUpdatedIds.has(b.id);

      // Ưu tiên 1: Chờ xử lý (status = 0) - luôn lên đầu
      if (statusA === 0 && statusB !== 0) return -1;
      if (statusB === 0 && statusA !== 0) return 1;

      // Nếu cả hai đều là chờ xử lý, ưu tiên vừa cập nhật
      if (statusA === 0 && statusB === 0) {
        if (isRecentlyUpdatedA && !isRecentlyUpdatedB) return -1;
        if (isRecentlyUpdatedB && !isRecentlyUpdatedA) return 1;
        // Nếu cả hai đều không hoặc đều vừa cập nhật, sắp xếp theo ngày tạo
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }

      // Ưu tiên 2: Vừa cập nhật (ngay sau chờ xử lý)
      // Nếu a vừa cập nhật và b không vừa cập nhật, a lên trước
      if (isRecentlyUpdatedA && !isRecentlyUpdatedB) return -1;
      if (isRecentlyUpdatedB && !isRecentlyUpdatedA) return 1;

      // Ưu tiên 3: Sắp xếp theo ngày tạo (mới nhất trước)
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return result;
  }, [data, searchText, statusFilter, recentlyUpdatedIds]);

  const columns = [
    {
      title: 'STT',
      key: 'index',
      align: 'center',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Đại lý',
      dataIndex: 'dealerName',
      key: 'dealerName',
      width: 200,
      render: (text) => <Text strong>{text || 'N/A'}</Text>,
    },
    {
      title: 'Nội dung',
      dataIndex: 'feedbackContent',
      key: 'feedbackContent',
      ellipsis: true,
      render: (text) => (
        <Text ellipsis={{ tooltip: text }}>{text || 'Không có nội dung'}</Text>
      ),
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'imgUrls',
      key: 'imgUrls',
      align: 'center',
      width: 120,
      render: (imgUrls) => {
        if (!imgUrls || imgUrls.length === 0) {
          return <Text type="secondary">Không có</Text>;
        }
        return (
          <Space>
            <Image.PreviewGroup>
              {imgUrls.slice(0, 3).map((url, index) => (
                <Image
                  key={index}
                  width={30}
                  height={30}
                  src={url}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                />
              ))}
            </Image.PreviewGroup>
            {imgUrls.length > 3 && <Text type="secondary">+{imgUrls.length - 3}</Text>}
          </Space>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 120,
      render: (status, record) => {
        // Đảm bảo status được parse đúng
        const statusNum = typeof status === 'string' ? parseInt(status, 10) : status;
        return getStatusBadge(statusNum);
      },
    },
    {
      title: 'Cập nhật trạng thái',
      key: 'updateStatus',
      align: 'center',
      width: 200,
      render: (_, record) => {
        // Đảm bảo status là number
        const recordStatus = typeof record.status === 'string' ? parseInt(record.status, 10) : record.status;
        // Nếu feedback đã được xử lý (status != 0), disable select
        const isProcessed = recordStatus !== 0 && recordStatus !== null && recordStatus !== undefined;
        
        return (
          <Select
            value={recordStatus}
            onChange={(value) => handleUpdateStatus(record.id, value, recordStatus)}
            loading={updatingId === record.id}
            disabled={updatingId === record.id || isProcessed}
            style={{ width: 170 }}
            placeholder="Chọn trạng thái"
          >
            {/* Chỉ hiển thị option 0 nếu chưa được xử lý, và các option 1-4 luôn hiển thị */}
            {!isProcessed && <Option value={0}>Chờ xử lý</Option>}
            <Option value={1}>Đã chấp nhận</Option>
            <Option value={2}>Đã từ chối</Option>
            <Option value={3}>Đã trả lời</Option>
            <Option value={4}>Đã hủy</Option>
          </Select>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A',
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        {/* Header với title */}
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <StarOutlined style={{ color: '#faad14', fontSize: 18 }} />
            <Text strong style={{ fontSize: '16px' }}>Quản lý Feedback Dealer Staff</Text>
          </Space>
          <Button onClick={fetchFeedbacks} loading={loading}>Làm mới</Button>
        </div>

        {/* Search và Filter */}
        <Space size="middle" wrap>
          <Input
            placeholder="Tìm kiếm theo tên đại lý, nội dung..."
            prefix={<SearchOutlined />}
            style={{ width: 350 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Select
            placeholder="Lọc theo trạng thái"
            style={{ width: 200 }}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            allowClear
            suffixIcon={<FilterOutlined />}
          >
            <Option value={0}>Chờ xử lý</Option>
            <Option value={1}>Đã chấp nhận</Option>
            <Option value={2}>Đã từ chối</Option>
            <Option value={3}>Đã trả lời</Option>
            <Option value={4}>Đã hủy</Option>
          </Select>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={filteredAndSortedData}
        loading={loading}
        rowKey="id"
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: [10, 20, 50, 100],
          defaultPageSize: 10,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} feedback`,
        }}
        scroll={{ x: true }}
      />
    </Card>
  );
};

export default ManageDealerStaffFeedback;
