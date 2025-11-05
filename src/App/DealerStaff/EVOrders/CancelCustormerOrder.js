import api from "../../../api/api";

export async function cancelCustomerOrder(orderId) {
  const res = await api.put(`/CustomerOrder/cancel-customer-order/${orderId}`);
  return res.data;
}