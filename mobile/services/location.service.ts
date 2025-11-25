import axios from 'axios';

const PROVINCES_API = 'https://provinces.open-api.vn/api';

export interface Province {
    code: number;
    name: string;
    districts: District[];
}

export interface District {
    code: number;
    name: string;
    wards: Ward[];
}

export interface Ward {
    code: number;
    name: string;
}

class LocationService {
    async getProvinces(): Promise<Province[]> {
        try {
            const response = await axios.get(`${PROVINCES_API}/?depth=3`);
            return response.data;
        } catch (error) {
            console.error('Get provinces error:', error);
            throw error;
        }
    }

    async getProvinceByCode(code: number): Promise<Province> {
        try {
            const response = await axios.get(`${PROVINCES_API}/p/${code}?depth=3`);
            return response.data;
        } catch (error) {
            console.error('Get province error:', error);
            throw error;
        }
    }

    async getDistrictByCode(code: number): Promise<District> {
        try {
            const response = await axios.get(`${PROVINCES_API}/d/${code}?depth=2`);
            return response.data;
        } catch (error) {
            console.error('Get district error:', error);
            throw error;
        }
    }
}

export const locationService = new LocationService();
