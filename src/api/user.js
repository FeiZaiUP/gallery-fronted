import axios from '../axios';

// 用户注册
export const register = async (data) => {
    try {
        const response = await axios.post('/users/register/', data);
        return response.data;
    } catch (error) {
        console.error('注册失败', error);
        throw error;
    }
};

// 用户登录
export const login = async (data) => {
    try {
        // 打印发送的数据，确认格式
        // console.log('Sending login request with data:', data);
        const response = await axios.post('/users/login/', data, {
            headers: {
                'Content-Type': 'application/json', // 确保请求头正确
            }
        });
        // 打印完整响应，确认响应格式
        // console.log('Login response:', response);

        if (response && response.access && response.refresh) {
            const { access, refresh } = response;
            // localStorage.setItem('username', response.username);
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            return response;
        } else {
            throw new Error('Invalid response format: access or refresh token missing.');
        }
    } catch (error) {
        console.error('Login error:', error.response || error);
        throw error;
    }
};



// 获取用户信息
export const getUserProfile = async () => {
    try {
        const response = await axios.get('/users/profile/');
        return response.data;
    } catch (error) {
        console.error('获取用户信息失败', error);
        throw error;
    }
};

// 刷新 token
export const refreshToken = async () => {
    try {
        const response = await axios.post('/users/token/refresh/', {
            refresh: localStorage.getItem('refresh_token'),
        });
        // 刷新 token 后，保存新的 token
        localStorage.setItem('token', response.data.access_token);
        return response.data;
    } catch (error) {
        console.error('刷新 token 失败', error);
        throw error;
    }
};
