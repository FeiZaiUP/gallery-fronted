import axios from 'axios';

// 创建 axios 实例
const instance = axios.create({
    baseURL: 'http://192.168.1.175:8000/api',  // 设置后端API的基础 URL
    timeout: 10000, // 请求超时时间
    headers: {
        'Content-Type': 'application/json',
    },
});

// 添加请求拦截器
instance.interceptors.request.use(
    (config) => {
        // 在请求之前添加 token（如果存在）
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 添加响应拦截器
instance.interceptors.response.use(
    (response) => response, // 返回响应的 data 部分
    (error) => {
        // 错误处理
        console.error('API 请求错误:', error);
        return Promise.reject(error);
    }
);

export default instance;
