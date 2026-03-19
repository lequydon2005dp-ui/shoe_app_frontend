// src/services/ProductService.js
import httpAxios from "./httpAxios";

const ProductService = {
  getList: async () => {
    const prod = await httpAxios.get("/product-list");
    return prod.data;
  },
getDetail: async (id) => {
    try {
      const response = await httpAxios.get(`/products/${id}`);
      // axios trả về dữ liệu trong thuộc tính `data`
      return response.data;
    } catch (error) {
      // Ném lỗi ra ngoài để component có thể bắt và xử lý.
      console.error(`Lỗi khi lấy chi tiết sản phẩm ID ${id}:`, error);
      throw error;
    }
  }
};

export default ProductService;