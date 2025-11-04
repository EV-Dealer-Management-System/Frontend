import React, { useState, useEffect } from "react";
import { PageContainer } from "@ant-design/pro-components";
import { message } from "antd";
import AdminLayout from "../../../Components/Admin/AdminLayout";
import TierStatistics from "./Components/TierStatistics";
import TierTable from "./Components/TierTable";
import { GetAllDealerTier as GetAllDealerTierAPI } from "../../../App/EVMAdmin/DealerTierManagement/GetAllDealerTier";

function AdminGetAllDealerTier() {
    const [dealerTiers, setDealerTiers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDealerTiers();
    }, []);

    const fetchDealerTiers = async (showMessage = true) => {
        setLoading(true);
        try {
            const response = await GetAllDealerTierAPI();
            console.log("Dealer Tiers Response:", response);

            if (response && response.isSuccess) {
                const tiers = response.result || [];
                setDealerTiers(tiers);
                if (showMessage) {
                    message.success(`Đã tải ${tiers.length} dealer tier thành công`);
                }
            } else {
                message.error("Không thể tải danh sách dealer tier");
                setDealerTiers([]);
            }
        } catch (error) {
            console.error("Error fetching dealer tiers:", error);
            message.error("Có lỗi khi tải danh sách dealer tier");
            setDealerTiers([]);
        } finally {
            setLoading(false);
        }
    };

    // Tính toán statistics
    const statistics = {
        totalTiers: dealerTiers.length,
        avgCommission:
            dealerTiers.length > 0
                ? (
                    dealerTiers.reduce((sum, t) => sum + t.baseCommissionPercent, 0) /
                    dealerTiers.length
                ).toFixed(1)
                : 0,
        maxCreditLimit: dealerTiers.length > 0
            ? Math.max(...dealerTiers.map((t) => t.baseCreditLimit))
            : 0,
        minPenalty: dealerTiers.length > 0
            ? Math.min(...dealerTiers.map((t) => t.baseLatePenaltyPercent))
            : 0,
    };

    return (
        <AdminLayout>
            <PageContainer
                title="Quản Lý Dealer Tier"
                subTitle="Hệ thống phân cấp và chính sách cho đại lý"
                className="bg-gray-50"
            >
                {/* Statistics Cards */}
                <TierStatistics statistics={statistics} />

                {/* Dealer Tiers Table */}
                <TierTable
                    dealerTiers={dealerTiers}
                    loading={loading}
                    onReload={() => fetchDealerTiers(true)}
                    onUpdate={() => fetchDealerTiers(false)}
                />
            </PageContainer>
        </AdminLayout>
    );
}

export default AdminGetAllDealerTier;