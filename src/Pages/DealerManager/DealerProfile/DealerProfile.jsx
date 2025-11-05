import React, { useState, useEffect } from 'react';
import { Typography, Spin, message, Space, Button } from 'antd';
import { ShopOutlined, ReloadOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import DealerManagerLayout from '../../../Components/DealerManager/DealerManagerLayout';
import { getDealerProfile } from '../../../App/DealerManager/DealerProfile/DealerProfile';

// Import các components con
import DealerInfoCard from './Components/DealerInfoCard';
import ManagerInfoCard from './Components/ManagerInfoCard';
import BankInfoCard from './Components/BankInfoCard';
import ContractListCard from './Components/ContractListCard';

const { Text } = Typography;

function DealerProfile() {
    const [loading, setLoading] = useState(false);
    const [dealerData, setDealerData] = useState(null);

    useEffect(() => {
        loadDealerProfile();
    }, []);

    const loadDealerProfile = async () => {
        try {
            setLoading(true);
            const response = await getDealerProfile();

            if (response.isSuccess) {
                setDealerData(response.result);
            } else {
                message.error(response.message || 'Không thể tải thông tin đại lý');
            }
        } catch (error) {
            console.error('Error loading dealer profile:', error);
            message.error('Có lỗi xảy ra khi tải thông tin đại lý');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DealerManagerLayout>
                <div className="flex justify-center items-center h-96">
                    <Spin size="large" tip="Đang tải thông tin đại lý..." />
                </div>
            </DealerManagerLayout>
        );
    }

    if (!dealerData || !dealerData.dealer) {
        return (
            <DealerManagerLayout>
                <div className="flex justify-center items-center h-96">
                    <Text type="secondary">Không tìm thấy thông tin đại lý</Text>
                </div>
            </DealerManagerLayout>
        );
    }

    const { dealer, memberTotal, econtractDealer } = dealerData;

    return (
        <DealerManagerLayout>
            <PageContainer
                title={
                    <Space>
                        <ShopOutlined className="text-blue-600" />
                        <span>Thông tin đại lý</span>
                    </Space>
                }
                extra={[
                    <Button
                        key="reload"
                        icon={<ReloadOutlined />}
                        onClick={loadDealerProfile}
                        loading={loading}
                    >
                        Tải lại
                    </Button>
                ]}
            >
                <div className="space-y-4">
                    {/* Thông tin cơ bản */}
                    <DealerInfoCard dealer={dealer} memberTotal={memberTotal} />

                    {/* Thông tin người quản lý */}
                    <ManagerInfoCard dealer={dealer} />

                    {/* Thông tin ngân hàng */}
                    <BankInfoCard dealer={dealer} />

                    {/* Hợp đồng điện tử */}
                    <ContractListCard econtractDealer={econtractDealer} />
                </div>
            </PageContainer>
        </DealerManagerLayout>
    );
}

export default DealerProfile;
