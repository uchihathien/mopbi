import api from './api';

export interface Address {
    id: string;
    userId: string;
    label?: string;
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    district: string;
    ward: string;
    isDefault: boolean;
    createdAt: string;
}

export interface CreateAddressDto {
    label?: string;
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    district: string;
    ward: string;
    isDefault?: boolean;
}

class AddressService {
    async getAddresses(): Promise<Address[]> {
        const response = await api.get('/addresses');
        return response.data;
    }

    async createAddress(data: CreateAddressDto): Promise<Address> {
        const response = await api.post('/addresses', data);
        return response.data;
    }

    async updateAddress(id: string, data: Partial<CreateAddressDto>): Promise<Address> {
        const response = await api.put(`/addresses/${id}`, data);
        return response.data;
    }

    async deleteAddress(id: string): Promise<void> {
        await api.delete(`/addresses/${id}`);
    }

    async setDefaultAddress(id: string): Promise<Address> {
        const response = await api.put(`/addresses/${id}/default`);
        return response.data;
    }
}

export const addressService = new AddressService();
