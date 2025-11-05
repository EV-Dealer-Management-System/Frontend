import React, { useState, useEffect } from 'react';
import { Card, Typography, message, Form, Switch, InputNumber, TimePicker, Button, Space, App as AntApp } from 'antd';
import { ScheduleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { CreateAppointmentSetting as CreateAppointmentSettingApi } from '../../../../App/DealerManager/AppointmentSetting/CreateAppointmentSetting';
import { GetAppointmentSetting } from '../../../../App/DealerManager/AppointmentSetting/GetAppointmentSetting';

const { Title, Text } = Typography;

const CreateAppointmentSetting = ({ onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [hasExistingSetting, setHasExistingSetting] = useState(false);
  const { notification } = AntApp.useApp();

  useEffect(() => {
    const checkExisting = async () => {
      try {
        const res = await GetAppointmentSetting.getAppointmentSetting();
        if (res?.isSuccess && res?.result) {
          setHasExistingSetting(true);
          message.warning('Đại lý đã có AppointmentSetting. Không thể tạo mới, vui lòng cập nhật.');
        }
      } catch (e) {
        // Nếu lỗi 404 hoặc không có setting thì cho phép tạo
      }
    };
    checkExisting();
  }, [onCancel]);

  const handleSubmit = async (values) => {
    if (hasExistingSetting) {
      message.warning('Đại lý đã có AppointmentSetting. Không thể tạo mới, vui lòng cập nhật.');
      return;
    }
    try {
      setSubmitting(true);

      const payload = {
        allowOverlappingAppointments: values.allowOverlappingAppointments ?? false,
        maxConcurrentAppointments: values.maxConcurrentAppointments,
        openTime: values.openTime ? values.openTime.format('HH:mm:ss') : null,
        closeTime: values.closeTime ? values.closeTime.format('HH:mm:ss') : null,
        minIntervalBetweenAppointments: values.minIntervalBetweenAppointments ?? 0,
        breakTimeBetweenAppointments: values.breakTimeBetweenAppointments ?? 0,
      };

      const res = await CreateAppointmentSettingApi.createAppointmentSetting(payload);
      if (res?.isSuccess) {
        message.success(res.message || 'Tạo thiết lập lịch hẹn thành công');
        notification.success({
          message: 'Tạo AppointmentSetting thành công',
          description: 'Cấu hình mới đã được lưu. Danh sách sẽ được làm mới.',
          placement: 'topRight',
        });
        form.resetFields();
        onSuccess?.();
      } else {
        message.error(res?.message || 'Tạo thiết lập thất bại');
      }
    } catch (error) {
      message.error(error?.response?.data?.message || 'Có lỗi khi tạo thiết lập');
    } finally {
      setSubmitting(false);
    }
  };

  if (hasExistingSetting) {
    return (
      <Card>
        <Title level={4}>
          <ScheduleOutlined style={{ color: '#faad14', marginRight: 8 }} />
          Đã có AppointmentSetting
        </Title>
        <Text type="danger">
          Đại lý này đã có AppointmentSetting. Bạn không thể tạo mới, vui lòng dùng chức năng Cập nhật.
        </Text>
        <div style={{ marginTop: 16 }}>
          <Space>
            <Button type="primary" onClick={onCancel}>Đóng</Button>
          </Space>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Title level={4}>
          <ScheduleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          Tạo Appointment Setting
        </Title>
        <Text type="secondary">Thiết lập mặc định cho việc tạo lịch hẹn.</Text>
      </Card>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          allowOverlappingAppointments: false,
          maxConcurrentAppointments: 1,
          minIntervalBetweenAppointments: 0,
          breakTimeBetweenAppointments: 0,
          openTime: dayjs('08:00:00', 'HH:mm:ss'),
          closeTime: dayjs('18:00:00', 'HH:mm:ss'),
        }}
        onFinish={handleSubmit}
      >
        <Form.Item
          name="allowOverlappingAppointments"
          label="Cho phép lịch hẹn trùng nhau"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="maxConcurrentAppointments"
          label="Số lịch hẹn đồng thời tối đa"
          rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
        >
          <InputNumber min={1} max={100} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Khung giờ hoạt động">
          <Space.Compact style={{ width: '100%' }}>
            <Form.Item name="openTime" noStyle rules={[{ required: true, message: 'Chọn giờ mở cửa' }]}> 
              <TimePicker style={{ width: '50%' }} format="HH:mm:ss" />
            </Form.Item>
            <Form.Item name="closeTime" noStyle rules={[{ required: true, message: 'Chọn giờ đóng cửa' }]}> 
              <TimePicker style={{ width: '50%' }} format="HH:mm:ss" />
            </Form.Item>
          </Space.Compact>
        </Form.Item>

        <Form.Item
          name="minIntervalBetweenAppointments"
          label="Khoảng cách tối thiểu giữa 2 lịch (phút)"
        >
          <InputNumber min={0} max={600} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="breakTimeBetweenAppointments"
          label="Thời gian nghỉ giữa các lịch (phút)"
        >
          <InputNumber min={0} max={600} style={{ width: '100%' }} />
        </Form.Item>

        <Space>
          <Button type="primary" htmlType="submit" loading={submitting}>
            Tạo mới
          </Button>
          <Button onClick={onCancel} disabled={submitting}>
            Hủy
          </Button>
        </Space>
      </Form>
    </div>
  );
};

export default CreateAppointmentSetting;

