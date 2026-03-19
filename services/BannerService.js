const BASE_URL = 'http://192.168.100.128/LaravelApp/public/api';

const BannerService = {
    getList: async (limit = 10) => {
        const url = `${BASE_URL}/banner-list?limit=${limit}`;
        // console.log('Calling Banner API:', url);

        try {
            const response = await fetch(url);
            const text = await response.text();

            // console.log('Raw Response (200 chars):', text.substring(0, 200));

            if (!response.ok) {
                // console.error('HTTP Error:', response.status);
                return [];
            }

            if (text.trim().startsWith('<')) {
                // console.error('API trả HTML, không phải JSON');
                return [];
            }

            const data = JSON.parse(text);
            // console.log('Banners loaded:', data.length, 'items');
            return data;
        } catch (error) {
            // console.error('Lỗi fetch banner:', error.message);
            return [];
        }
    }
};

export default BannerService;