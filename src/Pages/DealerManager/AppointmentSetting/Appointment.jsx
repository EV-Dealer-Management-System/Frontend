import React, { useState, useRef } from 'react';
import { Typography, Modal, Button, Space, Collapse, Card, Divider } from 'antd';
import { ScheduleOutlined, PlusOutlined, DownOutlined, UpOutlined, SettingOutlined } from '@ant-design/icons';
import DealerManagerLayout from '../../../Components/DealerManager/DealerManagerLayout';
import CreateAppointmentSetting from './Components/CreateAppointmentSetting';
import GetAvailableAppointment from './Components/GetAvailableAppointment';
import GetAppointmentSetting from './Components/GetAppointmentSetting';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const Appointment = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSettingCollapsed, setIsSettingCollapsed] = useState(true);
  const getAvailableAppointmentRef = useRef(null);
  const getAppointmentSettingRef = useRef(null);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSuccess = () => {
    setIsModalVisible(false);
    // Refresh danh sách slot sau khi tạo thành công
    if (getAvailableAppointmentRef.current) {
      getAvailableAppointmentRef.current.refresh();
    }
    if (getAppointmentSettingRef.current) {
      getAppointmentSettingRef.current.refresh();
    }
  };

  return (
    <DealerManagerLayout>
      <div style={{ padding: '24px', background: '#f5f7fa', minHeight: '100vh' }}>
        {/* Header với title và nút tạo - Đẹp hơn */}
        <Card 
          style={{ 
            marginBottom: 24, 
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: 'none',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
          bodyStyle={{ padding: '20px 24px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                <ScheduleOutlined style={{ color: '#fff', fontSize: '24px' }} />
              </div>
              <div>
                <Title level={2} style={{ margin: 0, color: '#fff', fontWeight: 700 }}>
                  Quản Lý Lịch Lái Xe
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
                  Quản lý và cấu hình các cuộc hẹn lái thử xe
                </Text>
              </div>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={showModal}
              style={{
                height: '48px',
                borderRadius: '8px',
                background: '#fff',
                color: '#667eea',
                border: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f0f0f0';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
            >
              Tạo Cài Đặt Cuộc Hẹn
            </Button>
          </div>
        </Card>

        {/* Phần Cấu hình Appointment Setting - Collapse đẹp hơn */}
        <Card
          style={{
            marginBottom: 24,
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: 'none',
            overflow: 'hidden'
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Collapse
            activeKey={isSettingCollapsed ? [] : ['1']}
            onChange={(keys) => setIsSettingCollapsed(!keys.includes('1'))}
            style={{ 
              backgroundColor: 'transparent',
              border: 'none',
            }}
            expandIconPosition="end"
            expandIcon={({ isActive }) => (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: isActive ? '#1890ff' : '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s'
              }}>
                {isActive ? (
                  <UpOutlined style={{ color: '#fff', fontSize: '14px' }} />
                ) : (
                  <DownOutlined style={{ color: '#666', fontSize: '14px' }} />
                )}
              </div>
            )}
          >
            <Panel
              header={
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0', width: '100%' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <SettingOutlined style={{ color: '#fff', fontSize: '18px' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Title level={4} style={{ margin: 0, fontWeight: 600, color: '#1f2937' }}>
                      Cấu Hình Đặt Lịch Lái Thử Xe Điện
                    </Title>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      Quản lý các thiết lập cho hệ thống đặt lịch lái thử xe điện
                    </Text>
                  </div>
                </div>
              }
              key="1"
              style={{ border: 'none' }}
            >
              <Divider style={{ margin: 0 }} />
              <div style={{ padding: '20px 24px' }}>
                <GetAppointmentSetting
                  ref={getAppointmentSettingRef}
                  onSettingChanged={() => {
                    getAvailableAppointmentRef.current && getAvailableAppointmentRef.current.refresh();
                  }}
                />
              </div>
            </Panel>
          </Collapse>
        </Card>
        
        {/* Danh sách slot */}
        <GetAvailableAppointment ref={getAvailableAppointmentRef} />

        <Modal
          title={
            <Space>
              <ScheduleOutlined style={{ color: '#1890ff' }} />
              <span style={{ fontWeight: 600, fontSize: 18 }}>
                Tạo Appointment Setting
              </span>
            </Space>
          }
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={800}
          destroyOnClose
          centered
        >
          <CreateAppointmentSetting onSuccess={handleSuccess} onCancel={handleCancel} />
        </Modal>
      </div>
    </DealerManagerLayout>
  );
};

export default Appointment;

