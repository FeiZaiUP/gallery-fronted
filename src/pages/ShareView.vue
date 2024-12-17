<template>
  <div>
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="logo">SUGALLERY</div>
    </nav>

  <div class="share-view">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else>
      <div v-if="error" class="error">{{ error }}</div>

      <!-- 如果需要密码保护，显示密码输入框 -->
      <div v-if="isProtected && !passwordEntered">
        <p>此分享已被密码保护，请输入密码：</p>
        <input v-model="password" type="password" placeholder="输入密码" />
        <button @click="verifyPassword">解锁</button>
      </div>

      <!-- 图片展示部分 -->
      <div v-else>
        <div class="images">
          <img v-for="image in images" :key="image.id" :src="image.url" :alt="image.title" />
        </div>
      </div>

    </div>
  </div>
  </div>
</template>

<script>
import axios from "@/axios.js";

export default {
  data() {
    return {
      loading: true,
      error: null,
      isProtected: false,   // 是否需要密码保护
      passwordEntered: false,  // 用户是否输入了密码
      password: "",  // 用户输入的密码
      images: [],  // 分享的图片
      expireTime: "",  // 分享的有效期
      shareCode: this.$route.params.share_code,  // 获取 share_code
    };
  },
  methods: {
    // 获取分享数据
    async fetchShareData() {
      try {
        // 获取分享链接的数据
        const response = await axios.get(
            `http://192.168.1.175:8000/api/share/${this.shareCode}/`,
            {params: {password: this.password}}
        );
        console.log(response);  // 打印返回数据

        if (response && response.data) {
          // 如果返回的数据包含图片
          if (Array.isArray(response.data.images) && response.data.images.length > 0) {
            this.images = response.data.images.map(image => ({
              id: image.id,
              title: image.title,
              url: `http://192.168.1.175:8000${image.file}`,  // 确保图片URL拼接正确
            }));
          } else {
            this.error = "没有图片可显示";
            this.loading = false;
            return;
          }

          // 处理有效期
          this.expireTime = response.data.expire_time;

          // 判断是否需要密码保护
          this.isProtected = response.data.is_protected || false;

          // 如果需要密码，设置为未输入状态，等待用户输入密码
          if (this.isProtected && !this.passwordEntered) {
            this.loading = false;  // 停止加载
            return;
          }

          this.loading = false;
        } else {
          this.error = "分享链接数据加载失败！";
          this.loading = false;
        }
      } catch (err) {
        console.error("Error occurred during fetch:", err);

        if (err.response?.status === 404) {
          this.error = "分享链接不存在";
        } else if (err.response?.status === 403) {
          // 处理 403 错误，区分密码保护和其他权限问题
          const errorDetail = err.response?.data?.detail;

          if (errorDetail === "Password required") {
            // 如果服务器返回的错误信息是“Password required”，说明该链接受密码保护
            this.error = "此链接受密码保护，请输入密码";
            this.passwordEntered = false; // 重置为未输入密码
            this.loading = false;  // 停止加载等待用户输入密码
          } else if (errorDetail === "Invalid password") {
            // 如果是密码错误，提示重新输入密码
            this.error = "密码错误，请重新输入";
            this.passwordEntered = false;  // 标记为未输入密码
            this.loading = false;  // 停止加载等待重新输入密码
          } else {
            // 其他403错误，通用错误提示
            this.error = "权限不足，无法访问该链接";
            this.loading = false;
          }
        } else {
          this.error = err.response?.data?.detail || "加载分享内容失败！";
          this.loading = false;
        }
      }
    },

    async verifyPassword() {
      try {
        const params = { password: this.password };  // 传递用户输入的密码

        // 发送带密码的请求
        const response = await axios.get(
            `http://192.168.1.175:8000/api/share/${this.shareCode}/`,
            { params: params }
        );

        // 密码验证成功，加载图片
        this.images = response.data.images.map(image => ({
          id: image.id,
          title: image.title,
          url: `http://192.168.1.175:8000${image.file}`,
        }));
        this.expireTime = response.data.expire_time;

        // 设置已输入密码
        this.passwordEntered = true;
        this.loading = false;
      } catch (err) {
        console.error("Error occurred during fetch:", err);

        if (err.response?.status === 403) {
          this.error = "密码错误，请重新输入";
        } else if (err.response?.status === 404) {
          this.error = "分享链接不存在";
        } else {
          this.error = err.response?.data?.detail || "加载分享内容失败！";
        }

        this.loading = false;
      }
    }
  },
  mounted() {
    this.fetchShareData();  // 初次加载时获取分享内容
  },
};
</script>

<style scoped>
.share-view {
  text-align: center;
}

.images img {
  width: 100%;
  max-width: 1440px;
  margin: 10px 0;
}

.error {
  color: red;
  font-weight: bold;
}

.loading {
  font-size: 20px;
  color: gray;
}

input {
  margin: 10px;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}
</style>
