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
            <a href="/share-links/manage">我的分享</a>
            <a href="/" @click="logout">登出</a>
          </div>
        </div>
      </div>
    </nav>

    <!-- 提示信息 -->
    <transition name="fade">
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
        <button class="close-btn" @click="clearMessage">×</button>
      </div>
    </transition>
    <transition name="fade">
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
        <button class="close-btn" @click="clearMessage">×</button>
      </div>
    </transition>

    <!-- 操作台 -->
    <div class="action-bar">
      <div class="search-box-wrapper">
        <input type="text" v-model="searchKeyword" placeholder="请输入图片标题搜索" class="search-box"/>
        <button @click="searchImages" class="search-btn">查询</button>
      </div>
      <div class="upload-wrapper">
        <input ref="fileInput" type="file" multiple @change="handleFileChange" accept="image/*" class="file-input"/>
        <input type="text" v-model="imageTitle" placeholder="请输入图片标题" class="title-input"/>
        <div v-if="selectedTags.length > 0">
          <span v-for="tag in selectedTags" :key="tag" class="tag">{{ tag }}</span>
        </div>
        <button
            @click="uploadImages" :disabled="uploading || imageFiles.length === 0" class="upload-btn">
          {{ uploading ? `上传中 ${uploadProgress}%` : '上传' }}
        </button>
      </div>
      <!-- 批量删除按钮 -->
      <div v-if="selectedImages.length > 0" class="batch-delete">
        <button @click="showBatchDeleteConfirmation">删除</button>
      </div>
    </div>

    <!-- 图片展示区域 -->
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else class="image-gallery">
      <div v-for="(image, index) in images" :key="image.id" class="image-card">
        <input type="checkbox" :value="image.id" v-model="selectedImages" class="select-checkbox"/>
        <img :src="`${$apiBaseUrl}${image.file}`" :alt="image.title" class="image" @click="viewImage(image)"/>
        <div class="tags">
          <span v-for="tag in image.tags" :key="tag.id" class="tag">{{ tag.name }}</span>
        </div>
      </div>
    </div>
    <!-- 分页 -->
    <div class="pagination">
      <button :disabled="page <= 1 || !totalPages" @click="changePage(page - 1)" class="page-btn">上一页</button>
      <span class="page-info">第 {{ page }} 页 / 共 {{ totalPages }} 页</span>
      <button :disabled="page >= totalPages || !totalPages" @click="changePage(page + 1)" class="page-btn">下一页</button>
    </div>


    <!-- 批量删除确认弹窗 -->
    <div v-if="showConfirmDelete" class="confirmation-modal" @click.self="closeModal('confirmDelete')">
      <div class="confirmation-modal-content">
        <p>确定要删除选中的图片吗？</p>
        <button @click="bulkDeleteImages">确认删除</button>
        <button @click="closeModal('confirmDelete')">取消</button>
      </div>
    </div>
    <!-- 分享链接弹窗 -->
    <div v-if="showShareModalFlag" class="modal" @click.self="closeModal('shareModal')">
      <div class="modal-content">
        <h3>创建分享链接</h3>
        <div>
          <label for="sharePassword">密码 (可选):</label>
          <input type="password" id="sharePassword" v-model="sharePassword" placeholder="请输入密码">
        </div>
        <div>
          <label for="expireDuration">有效期:</label>
          <select id="expireDuration" v-model="expireDuration">
            <option value="3600">1 小时后</option>
            <option value="86400">1 天后</option>
            <option value="604800">7 天后</option>
            <option value="">永不过期</option>
          </select>
        </div>
        <button @click="createShareLink" :disabled="creatingShareLink">创建</button>
        <button @click="closeModal('shareModal')">关闭</button>
      </div>
    </div>


    <!-- 显示生成的分享链接 -->
    <div v-if="generatedShareLink" class="modal share-modal" @click.self="closeModal('generatedShareLink')">
      <div class="modal-content">
        <h3>分享链接已生成</h3>
        <p>分享链接：</p>
        <div class="share-link-wrapper">
          <input type="text" :value="`${baseUrl}/share/${generatedShareLink.share_code}`" readonly class="share-link-input" />
          <button @click="copyShareLink" class="copy-btn">复制链接</button>
        </div>
        <div v-if="copySuccess" class="copy-success-message">链接已复制到剪贴板！</div>
        <button @click="closeModal('generatedShareLink')">关闭</button>
      </div>
    </div>


    <!-- 错误信息 -->
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

    <!-- 查看大图模态框 -->
    <div v-if="viewingImage" class="modal" @click.self="closeModal('viewingImage')">
      <div class="modal-content">
        <img
            :src="`${$apiBaseUrl}${viewingImage.file}`"
            :alt="viewingImage.title"
            class="modal-image"
        />
        <h3>{{ viewingImage.title }}</h3>
        <p>{{ new Date(viewingImage.created_at).toLocaleDateString() }}</p>
        <button @click="closeModal('viewingImage')">关闭</button>
      </div>
    </div>
  </div>
</template>


<script>
import axios from '@/axios.js';

export default {
  data() {
    return {
      username: '加载中...',
      searchKeyword: '',  // 搜索关键字
      images: [],
      loading: false,
      page: 1,
      pageSize: 12,
      totalPages: 1,
      successMessage: '',
      errorMessage: '',
      imageFiles: [], // 保存多个图片文件
      imageTitle: '',
      uploading: false,
      uploadProgress: 0,
      selectedImages: [],
      viewingImage: null,
      showConfirmDelete: false,
      selectedTags: [],
      availableTags: [],
      showShareModalFlag: false, // 分享模态框
      sharePassword: '',
      expireTime: null,
      expireDuration: "", // 新增的有效期选项，默认为空（永不过期）
      creatingShareLink: false,
      generatedShareLink: null, // 保存生成的分享链接
      baseUrl: 'http://192.168.1.175:8188', // 图片分享查看链接接口
      copySuccess: false, // 复制成功状态
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

        this.username = response.data.username;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        this.username = '未知用户';
      }
    },


    // 查询按钮点击后执行搜索
    async searchImages() {
      this.page = 1;  // 重置为第一页
      await this.fetchImages();
    },

    // 获取图片列表
    async fetchImages() {
      this.loading = true;
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          throw new Error('用户未认证');
        }

        const response = await axios.get('/images/', {
          params: {
            page: this.page,
            page_size: this.pageSize,
            keyword: this.searchKeyword,
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        });

        this.images = response.data.results; // 当前页数据
        this.totalImages = response.data.count; // 总数
        this.totalPages = Math.ceil(this.totalImages / this.pageSize); // 计算总页数
      } catch (error) {
        console.error('Error fetching images:', error);
        if (error.response && error.response.data && error.response.data.error) {
          this.errorMessage = error.response.data.error;
        } else {
          this.errorMessage = '服务器内部错误，请稍后重试';
        }
      } finally {
        this.loading = false;
      }
    },

    async changePage(newPage) {
      if (newPage < 1 || newPage > this.totalPages) return;
      this.page = newPage;
      await this.fetchImages(); // 更新当前页数据
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

    // 监听文件选择事件
    handleFileChange(event) {
      this.imageFiles = Array.from(event.target.files);  // 选择多张图片
    },

    // 执行上传
    async uploadImages() {
      if (this.imageFiles.length === 0 || !this.imageTitle) {
        this.errorMessage = '请选择至少一张图片并输入标题';
        setTimeout(this.clearMessage, 3000);
        return;
      }

      this.uploading = true;
      this.uploadProgress = 0;
      const formData = new FormData();

      this.imageFiles.forEach((file) => {
        formData.append('file', file);  // 多文件批量上传
      });

      formData.append('title', this.imageTitle);
      // formData.append('tags', JSON.stringify(this.selectedTags));

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
          },
        });

        this.successMessage = '图片上传成功';
        setTimeout(this.clearMessage, 3000);
        this.clearForm();
        // **上传成功后刷新图片列表**
        await this.fetchImages();
      } catch (error) {
        this.errorMessage = '图片上传失败，请选择需要上传的图片';
        setTimeout(this.clearMessage, 3000);
      } finally {
        this.uploading = false;
      }
    },

    // 清空表单
    clearForm() {
      this.$refs.fileInput.value = '';
      this.imageFiles = [];
      this.imageTitle = '';
      this.selectedTags = [];
    },

    clearMessage() {
      this.successMessage = '';
      this.errorMessage = '';
    },

    viewImage(image) {
      this.viewingImage = image;
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
        // 显示上传成功提示
        this.successMessage = '图片已删除';
        setTimeout(this.clearMessage, 3000);
        this.images = this.images.filter(image => !this.selectedImages.includes(image.id));
        this.selectedImages = [];
        this.showConfirmDelete = false;
      } catch (error) {
        console.error('图片删除失败:', error);
        this.errorMessage = '删除失败，请稍后再试。';
      }
    },

    // 显示分享弹窗
    showShareModal() {
      this.showShareModalFlag = true;
    },

    validateISODate(dateString) {
      const date = new Date(dateString);
      return date.toISOString() === dateString; // 确保格式和值都有效
    },

    async createShareLink() {
      if (!this.selectedImages.length) {
        this.errorMessage = "请至少选择一张图片！";
        setTimeout(this.clearMessage, 3000);
        return;
      }

      const payload = { images: this.selectedImages };
      if (this.sharePassword) payload.password = this.sharePassword;

      // 根据用户选择的有效期计算到期时间
      if (this.expireDuration) {
        const currentTime = new Date();
        const expireTime = new Date(currentTime.getTime() + parseInt(this.expireDuration) * 1000);
        payload.expire_time = expireTime.toISOString();
      }

      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) throw new Error("用户未登录！");

        const response = await axios.post("/images/share/", payload, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        this.generatedShareLink = response.data || response;
        const link = `${this.baseUrl}/share/${this.generatedShareLink?.share_code}`;

        // 自动复制到剪贴板
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(link);
          this.successMessage = "分享链接创建成功并已复制到剪贴板！";
        } else {
          this.fallbackCopyTextToClipboard(link);
          this.successMessage = "分享链接创建成功，请手动复制！";
        }

        this.closeModal("shareModal");
        setTimeout(this.clearMessage, 3000);
      } catch (error) {
        const responseData = error.response?.data || {};
        this.errorMessage = responseData.detail ||
            Object.values(responseData.errors || {}).join(" ") ||
            "创建分享失败，请检查输入内容！";
        setTimeout(this.clearMessage, 3000);
      }
    },

    copyShareLink() {
      try {
        if (!this.generatedShareLink?.share_code) {
          this.errorMessage = "无效的分享链接，无法复制！";
          setTimeout(this.clearMessage, 3000);
          return;
        }

        const link = `${this.baseUrl}/share/${this.generatedShareLink.share_code}`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(link).then(() => {
            this.successMessage = "链接已成功复制到剪贴板！";
            setTimeout(this.clearMessage, 3000);
          });
        } else {
          this.fallbackCopyTextToClipboard(link);
          this.successMessage = "链接已成功复制到剪贴板！";
          setTimeout(this.clearMessage, 3000);
        }
      } catch (error) {
        console.error("复制时出错:", error);
        this.errorMessage = "发生未知错误，请重试！";
        setTimeout(this.clearMessage, 3000);
      }
    },

    fallbackCopyTextToClipboard(text) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand("copy");
      } catch (err) {
        console.error("Fallback: Unable to copy", err);
      }
      document.body.removeChild(textarea);
    },

    // 关闭模态框
    closeModal(modalName) {
      if (modalName === 'viewingImage') {
        this.viewingImage = null;
      } else if (modalName === 'confirmDelete') {
        this.showConfirmDelete = false;
      } else if (modalName === 'shareModal') {
        this.showShareModalFlag = false;
        this.selectedImages = []; // 清空选中图片状态
      }else if (modalName === 'generatedShareLink') {
        this.generatedShareLink = null;
      }
    }
  }
};
</script>


<style scoped>
@import "@/assets/styles/image.css";
</style>