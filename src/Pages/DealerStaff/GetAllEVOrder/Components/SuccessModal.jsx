import React from 'react';
import { Modal, Space, Button, Typography } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

function SuccessModal({ visible, message, onClose }) {
    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="ok" type="primary" onClick={onClose}>
                    Đóng
                </Button>,
            ]}
            title="Thông báo"
        >
            <Space direction="vertical" align="center" style={{ width: "100%" }}>
                <CheckCircleOutlined style={{ fontSize: 48, color: "#52c41a" }} />
                <Text strong style={{ fontSize: 16, textAlign: "center" }}>
                    {message}
                </Text>
            </Space>
        </Modal>
    );
}

export default SuccessModal;
