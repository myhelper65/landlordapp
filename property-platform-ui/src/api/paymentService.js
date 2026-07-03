import api from './axiosInstance';

export const getPaymentMethods = async () => {
    const response = await api.get('/payment-methods');
    return response.data;
};

export const addPaymentMethod = async (paymentMethodData) => {
    const response = await api.post('/payment-methods', paymentMethodData);
    return response.data;
};

export const deletePaymentMethod = async (id) => {
    const response = await api.delete(`/payment-methods/${id}`);
    return response.data;
};
