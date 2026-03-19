// src/services/CategoryService.js
import httpAxios from "./httpAxios";

const CategoryService = {
    getList: async() => {
        const cate = await httpAxios.get("/category-list");
        return cate.data;
    },

};

export default CategoryService;