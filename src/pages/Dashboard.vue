<template>
  <div class="dashboard">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="logo">SUGALLERY</div>
      <div class="user-info">
        <span class="username">{{ username }}</span>
        <div class="dropdown">
          <button class="dropdown-btn">▼</button>
          <div class="dropdown-content">
            <a href="/user/profile">个人信息</a>
            <a href="/" @click="logout">登出</a>
          </div>
        </div>
      </div>
    </nav>

    <!-- 图片上传区域 -->
    <div class="upload-section">
      <h2>上传新图片</h2>
      <div class="upload-form">
        <!-- 图片选择 -->
        <input type="file" @change="handleFileChange" accept="image/*" />
        <!-- 图片标题 -->
        <input type="text" v-model="imageTitle" placeholder="请输入图片标题" />
        <!-- 标签选择框 -->
        <div class="tags-selector">
          <label for="tags">选择标签 (可选)</label>
          <select v-model="selectedTags" multiple>
            <option v-for="tag in availableTags" :key="tag.id" :value="tag.id">{{ tag.name }}</option>
          </select>
        </div>
        <!-- 上传按钮 -->
        <button @click="uploadImage" :disabled="!imageFile || !imageTitle">上传</button>
        <p v-if="uploading">上传中... {{ uploadProgress }}%</p>
      </div>
    </div>

    <!-- 图片展示区域 -->
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else class="image-gallery">
      <div v-for="(image, index) in images" :key="image.id" class="image-card">
        <input type="checkbox" :value="image.id" v-model="selectedImages" class="select-checkbox" />
        <img :src="`${$apiBaseUrl}${image.file}`" :alt="image.title" class="image" @click="viewImage(image)" />
        <div class="tags">
          <span v-for="tag in image.tags" :key="tag.id" class="tag">{{ tag.name }}</span>
        </div>
      </div>
    </div>

    <!-- 错误信息 -->
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

    <!-- 批量删除按钮 -->
    <div v-if="selectedImages.length > 0" class="batch-delete">
      <button @click="showBatchDeleteConfirmation">批量删除</button>
    </div>

    <!-- 批量删除确认弹窗 -->
    <div v-if="showConfirmDelete" class="confirmation-modal" @click.self="closeModal">
      <div class="confirmation-modal-content">
        <p>确定要删除选中的图片吗？</p>
        <button @click="bulkDeleteImages">确认删除</button>
        <button @click="closeModal">取消</button>
      </div>
    </div>

    <!-- 查看大图模态框 -->
    <div v-if="viewingImage" class="modal" @click.self="closeModal">
      <div class="modal-content">
        <img :src="`${$apiBaseUrl}${viewingImage.file}`" :alt="viewingImage.title" class="modal-image" />
        <h3>{{ viewingImage.title }}</h3>
        <p>{{ new Date(viewingImage.created_at).toLocaleString() }}</p>
        <button @click="closeModal">关闭</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '../axios.js';

export default {
  data() {
    return {
      username: '加载中...',
      images: [],
      loading: true,
      errorMessage: '',
      imageFile: null,
      imageTitle: '',
      uploading: false,
      uploadProgress: 0,
      selectedImages: [],
      viewingImage: null,
      showConfirmDelete: false,
      selectedTags: [],
      availableTags: []
    };
  },
  mounted() {
    this.fetchUserProfile();
    this.fetchImages();
    this.fetchTags();
  },
  methods: {
    // 获取用户资料
    async fetchUserProfile() {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          throw new Error('Access token is missing');
        }

        const response = await axios.get('/users/profile/', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        });

        this.username = response.username;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        this.username = '未知用户';
      }
    },

    // 获取图片列表
    async fetchImages() {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          throw new Error('User not authenticated');
        }

        const response = await axios.get('/images/', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        });

        this.images = response;
        this.loading = false;
      } catch (error) {
        console.error('Error fetching images:', error);
        this.errorMessage = '无法加载图片，请稍后再试。';
        this.loading = false;
      }
    },

    // 获取标签列表
    async fetchTags() {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          throw new Error('Access token is missing');
        }

        const response = await axios.get('/tags/', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        });

        this.availableTags = response.data;
      } catch (error) {
        console.error('Error fetching tags:', error);
        this.errorMessage = '无法加载标签，请稍后再试。';
      }
    },

    handleFileChange(event) {
      this.imageFile = event.target.files[0];
    },

    async uploadImage() {
      if (!this.imageFile || !this.imageTitle) return;

      this.uploading = true;
      this.uploadProgress = 0;

      const formData = new FormData();
      formData.append('file', this.imageFile);
      formData.append('title', this.imageTitle);
      formData.append('tags', JSON.stringify(this.selectedTags));

      const accessToken = localStorage.getItem('access_token');
      try {
        const response = await axios.post('/images/upload/', formData, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              this.uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            }
          }
        });

        this.images.push(response.data);
        this.uploading = false;
        this.imageFile = null;
        this.imageTitle = '';
        this.selectedTags = [];
      } catch (error) {
        console.error('Error uploading image:', error);
        this.uploading = false;
        this.errorMessage = '上传失败，请稍后再试。';
      }
    },

    viewImage(image) {
      this.viewingImage = image;
    },

    closeModal() {
      this.viewingImage = null;
      this.showConfirmDelete = false;
    },

    showBatchDeleteConfirmation() {
      this.showConfirmDelete = true;
    },

    async bulkDeleteImages() {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken || !this.selectedImages.length) return;

        // 改为 POST 请求
        await axios.post('/images/bulk_delete/', {
          image_ids: this.selectedImages
        }, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        });

        // 删除成功后更新页面
        this.images = this.images.filter(image => !this.selectedImages.includes(image.id));
        this.selectedImages = [];
        this.showConfirmDelete = false;
      } catch (error) {
        console.error('图片删除失败:', error);
        this.errorMessage = '删除失败，请稍后再试。';
      }
    }
  }
};
</script>


<style scoped>
/* 标签选择框 */
.tags-selector select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
}

/* 图片卡片中的标签样式 */
.image-card .tags {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.image-card .tags .tag {
  background-color: #f4f4f4;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 12px;
  color: #333;
}

  /* 导航栏样式 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #b2732b;
  padding: 10px;
  color: rgba(11, 11, 54, 0.65);
}

.navbar .logo {
  font-size: 26px;
  font-weight: bolder;
}

.navbar .user-info {
  position: relative;
  display: flex;
  align-items: center;
}

.navbar .username {
  margin-right: 10px;
  font-size: 18px;
  font-weight: bold;
}

.navbar .dropdown {
  position: relative;
  display: inline-block;
}

/* 下拉按钮样式 */
.navbar .dropdown-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}

/* 下拉菜单样式 */
.navbar .dropdown-content {
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 160px;
  max-width: 250px; /* 设置最大宽度 */
  z-index: 1;
  left: 0; /* 保证下拉框从按钮的左边开始 */
  top: 100%; /* 将下拉框放置在按钮下方 */
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2); /* 增加阴影效果 */
  border-radius: 4px; /* 圆角 */
}

/* 鼠标悬停时显示下拉框 */
.navbar .dropdown:hover .dropdown-content {
  display: block;
}

/* 下拉框中的每个链接 */
.navbar .dropdown-content a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}

/* 链接悬停时的样式 */
.navbar .dropdown-content a:hover {
  background-color: #ddd;
}

/* 响应式调整（确保下拉框在小屏幕上不超出） */
@media (max-width: 768px) {
  .navbar .dropdown-content {
    min-width: 120px;
    max-width: 200px; /* 调整宽度以适应小屏幕 */
  }
}

.upload-section {
  padding: 10px;
  background-color: #f4f4f4;
  margin: 10px;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
  margin: 0 auto;
}

.upload-form input[type="file"],
.upload-form input[type="text"] {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.upload-form select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.upload-form button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.upload-form button:disabled {
  background-color: #ccc;
}

.upload-form p {
  font-size: 16px;
  color: #333;
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 每行最多显示5张图片 */
  gap: 20px;
  padding: 20px;
}

.image-card {
  position: relative;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  background-color: #fff;
}

.image-card img {
  width: 100%;
  height: auto;
  object-fit: contain;
  max-height: 320px;
  cursor: pointer;
}

.image-card input[type="checkbox"] {
  position: absolute;
  top: 10px;
  left: 10px;
}

.image-info {
  padding: 10px;
  background-color: #f4f4f4;
  border-top: 1px solid #ddd;
}

.image-info h3 {
  font-size: 18px;
  margin: 0;
}

.image-info p {
  font-size: 14px;
  color: #666;
}

.batch-delete {
  padding: 10px;
  background-color: #f4f4f4;
  text-align: center;
}

.batch-delete button {
  background-color: red;
  color: white;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.confirmation-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
}

.confirmation-modal-content {
  background-color: white;
  padding: 20px;
  text-align: center;
  max-width: 400px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  text-align: center;
  max-width: 80%;
}

.modal-image {
  width: 100%;
  max-width: 1140px;
  height: auto;
}
</style>