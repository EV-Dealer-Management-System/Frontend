import api from "../../../api/api";

export const CreateEVOrder = async (orderData) => {
  const res = await api.post("/CustomerOrder/create-customer-order", {
    customerId: orderData.customerId,
    quoteId: orderData.quoteId,
    isPayFull: !!orderData.isPayFull,
  });
  console.log(res.data);
  return res.data;
}; 

