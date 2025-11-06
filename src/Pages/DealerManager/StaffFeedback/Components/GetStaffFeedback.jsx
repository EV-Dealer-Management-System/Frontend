import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Space, Input, Typography, Image, Button, Modal, App } from 'antd';
import { SearchOutlined, StarOutlined, PlusOutlined } from '@ant-design/icons';
import { GetStaffFeedback } from '../../../../App/DealerManager/StaffFeedbackManage/GetStaffFeedback.js';
import CreateStaffFeedback from './CreateStaffFeedback';

const { Text } = Typography;

const GetStaffFeedbackComponent = () => {
  const { message } = App.useApp(); // Sử dụng hook từ AntdApp
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [createVisible, setCreateVisible] = useState(false);

  useEffect(() => { 
    fetchFeedback(); 
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await GetStaffFeedback.getStaffFeedback();
      if (res?.isSuccess) {
        // Đảm bảo status là number (parse từ string nếu cần)
        const validData = (res.result || [])
          .filter(item => item && item.id)
          .map(item => ({
            ...item,
            status: typeof item.status === 'string' ? parseInt(item.status, 10) : item.status
          }));
        setData(validData);
      } else {
        message.error(res?.message || 'Không tải được feedback!');
        setData([]);
      }
    } catch (err) {
      message.error('Đã xảy ra lỗi khi tải feedback');
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(item => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      item.dealerName?.toLowerCase().includes(search) ||
      item.feedbackContent?.toLowerCase().includes(search)
    );
  });

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

  const columns = [
    { title: 'STT', dataIndex: 'index', render: (_, __, idx) => idx + 1, align: 'center', width: 60 },
    { title: 'Đại lý', dataIndex: 'dealerName', key: 'dealerName', width: 200, render: (text) => <Text strong>{text}</Text> },
    { title: 'Nội dung', dataIndex: 'feedbackContent', key: 'feedbackContent', ellipsis: true, render: (text) => <Text ellipsis={{ tooltip: text }}>{text || 'Không có nội dung'}</Text> },
    { title: 'Hình ảnh', dataIndex: 'imgUrls', key: 'imgUrls', align: 'center', width: 120, render: (imgUrls) => {
      if (!imgUrls || imgUrls.length === 0) return <Text type="secondary">Không có</Text>;
      return <Space>
        <Image.PreviewGroup>
          {imgUrls.slice(0, 3).map((url, i) => (
            <Image key={i} width={30} height={30} src={url} style={{ objectFit: 'cover', borderRadius: 4 }} />
          ))}
        </Image.PreviewGroup>
        {imgUrls.length > 3 && <Text type="secondary">+{imgUrls.length - 3}</Text>}
      </Space>;
    }},
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status', 
      width: 120, 
      align: 'center',
      render: (status, record) => {
        // Đảm bảo status được parse đúng
        const statusNum = typeof status === 'string' ? parseInt(status, 10) : status;
        return getStatusBadge(statusNum);
      }
    },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: (date) => new Date(date).toLocaleDateString('vi-VN'), width: 130 },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Input
            placeholder="Tìm kiếm theo tên đại lý, nội dung..."
            prefix={<SearchOutlined />}
            style={{ width: 350 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Button onClick={fetchFeedback} loading={loading}>Làm mới</Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setCreateVisible(true)}
          >
            Tạo Feedback
          </Button>
        </Space>
        <Space>
          <StarOutlined style={{ color: '#faad14', fontSize: 18 }} />
          <Text strong>Lịch sử Feedback DealerStaff</Text>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={filteredData}
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

      <Modal
        title="Tạo Feedback Mới"
        open={createVisible}
        onCancel={() => setCreateVisible(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <CreateStaffFeedback
          onSuccess={(responseMessage) => {
            setCreateVisible(false);
            fetchFeedback();
            // Hiển thị message tiếng Việt sau khi modal đóng
            setTimeout(() => {
              try {
                message.success({
                  content: 'Tạo feedback thành công! Feedback của bạn đã được gửi.',
                  duration: 5,
                });
              } catch (err) {
                console.error('Lỗi khi gọi message.success:', err);
              }
            }, 200);
          }}
          onCancel={() => setCreateVisible(false)}
        />
      </Modal>
    </Card>
  );
};

export default GetStaffFeedbackComponent;

