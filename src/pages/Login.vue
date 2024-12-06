<template>
  <div class="login-page">
    <div class="login-container">
      <div class="logo-container">
        <h1 class="logo">SUGALLERY</h1>
      </div>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <input
              v-model="username"
              type="text"
              placeholder="用户名"
              class="input-field"
              required
          />
        </div>
        <div class="form-group">
          <input
              v-model="password"
              type="password"
              placeholder="密码"
              class="input-field"
              required
          />
        </div>
        <button type="submit" class="login-button">登录</button>
      </form>
      <div v-if="loginError" class="error-message">
        {{ loginError }}
      </div>
    </div>
  </div>
</template>

<script>
import { login } from '../api/user';

export default {
  data() {
    return {
      username: localStorage.getItem('username') || '', // 获取用户名
      images: [],
      loginError: null, // 存储错误信息
    };
  },
  methods: {
    async handleLogin() {
      const loginData = {
        username: this.username,
        password: this.password,
      };

      try {
        // 调用登录接口
        const response = await login(loginData);
        console.log('登录成功:', response);
        // 保存 token
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        // 登录成功后，使用 Vue Router 跳转到用户空间主页
        this.$router.push({ path: '/user/dashboard' });  // 根据实际的路由路径修改
      } catch (error) {
        console.error('登录失败:', error);
        this.loginError = '登录失败，请检查用户名和密码。'; // 显示错误信息
      }
    },
  },
};
</script>

<style scoped>
/* 登录页面的样式 */
.login-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('/images/moon.jpg');
  background-size: cover;
  background-position: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 登录框容器 */
.login-container {
  background-color: rgba(255, 255, 255, 0.85); /* 半透明背景 */
  padding: 30px 40px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

/* 网站名称样式 */
.logo-container {
  margin-bottom: 20px;
}

.logo {
  font-size: 36px;
  color: #2d3436;
  font-weight: bold;
  letter-spacing: 2px;
  margin: 0;
}

/* 表单输入框样式 */
.form-group {
  margin-bottom: 15px;
}

.input-field {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 2px solid #dfe6e9;
  border-radius: 5px;
  outline: none;
  transition: border-color 0.3s;
}

.input-field:focus {
  border-color: #0984e3;
}

/* 登录按钮样式 */
.login-button {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  background-color: #0984e3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #74b9ff;
}

.login-button:active {
  background-color: #0984e3;
}

/* 错误信息显示 */
.error-message {
  color: red;
  margin-top: 15px;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-container {
    padding: 20px;
    width: 90%;
  }

  .logo {
    font-size: 30px;
  }

  .input-field {
    font-size: 14px;
  }

  .login-button {
    font-size: 14px;
  }
}
</style>