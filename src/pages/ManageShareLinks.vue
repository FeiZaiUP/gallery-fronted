<template>
  <!-- 导航栏 -->
  <nav class="navbar">
    <div class="logo"><a class="logo-link" href="/user/dashboard">SUGALLERY</a></div>
  </nav>
  <div class="manage-share-links">
    <h1 class="title">我的分享链接</h1>

    <!-- 显示加载状态 -->
    <div v-if="loading" class="loading">正在加载分享链接...</div>

    <!-- 显示错误信息 -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <!-- 显示分享链接列表 -->
    <div v-if="shareLinks && shareLinks.length > 0" class="share-links-container">
      <table class="share-links-table">
        <thead>
        <tr>
          <th>
            <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
          </th>
          <th>分享链接</th>
          <th>过期时间</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="link in shareLinks" :key="link.id" class="share-link-row">
          <td>
            <input type="checkbox" v-model="selectedLinks" :value="link.share_code" />
          </td>
          <td>
            <a v-if="link.share_code" :href="generateShareLinkUrl(link.share_code)" target="_blank">
              {{ generateShareLinkUrl(link.share_code) }}
            </a>
            <span v-else>无效链接</span>
          </td>
          <td>{{ formatExpireTime(link.expire_time) }}</td>
          <td>
            <span :class="{'status-expired': isExpired(link), 'status-valid': !isExpired(link)}">
              {{ isExpired(link) ? '已过期' : '有效' }}
            </span>
          </td>
          <td class="action-buttons">
            <button @click="invalidateShareLink(link.share_code)" class="invalidate-btn">作废</button>
            <button @click="deleteShareLink(link.share_code)" class="delete-btn">删除</button>
          </td>
        </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div class="pagination">
        <button :disabled="page <= 1 || !totalPages" @click="fetchShareLinks(page - 1)" class="page-btn">上一页</button>
        <span class="page-info">第 {{ page }} 页 / 共 {{ totalPages }} 页</span>
        <button :disabled="page >= totalPages || !totalPages" @click="fetchShareLinks(page + 1)" class="page-btn">下一页</button>
      </div>

      <!-- 批量操作按钮 -->
      <div class="batch-actions">
        <button @click="invalidateSelectedLinks" :disabled="selectedLinks.length === 0" class="batch-invalidate-btn">批量作废</button>
        <button @click="deleteSelectedLinks" :disabled="selectedLinks.length === 0" class="batch-delete-btn">批量删除</button>
      </div>
    </div>

    <!-- 如果没有分享链接 -->
    <div v-else class="no-share-links">
      <p>没有可管理的分享链接。</p>
    </div>
  </div>
</template>

<script>
import axios from "@/axios.js";

export default {
  data() {
    return {
      shareLinks: [],
      page: 1,
      pageSize: 10,
      totalPages: 1,
      loading: true,
      errorMessage: "",
      selectedLinks: [],
      selectAll: false,
      baseUrl: "http://192.168.1.175:8188",
    };
  },
  methods: {
    async fetchShareLinks(page = 1) {
      try {
        this.loading = true;
        this.errorMessage = "";
        const accessToken = this.validateToken();
        const response = await axios.get("/images/share/manage/", {
          params: { page, page_size: this.pageSize },
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const { results, count } = response.data;
        this.shareLinks = results || [];
        this.page = page;
        this.totalPages = Math.ceil(count / this.pageSize);
      } catch (error) {
        this.errorMessage = error.response?.data?.message || "加载失败，请稍后重试。";
      } finally {
        this.loading = false;
      }
    },
    async deleteShareLink(shareCode) {
      if (!confirm("确认删除该分享链接？")) return;
      try {
        const accessToken = this.validateToken();
        await axios.delete("/images/share/manage/delete/", {
          data: { share_codes: [shareCode] },
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        alert("删除成功！");
        await this.fetchShareLinks(this.page);
      } catch (error) {
        alert("删除失败，请稍后重试。");
      }
    },
    async invalidateShareLink(shareCode) {
      if (!confirm("确认作废该分享链接？")) return;
      try {
        const accessToken = this.validateToken();
        await axios.post("/images/share/manage/", {
          share_codes: [shareCode] }, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        alert("链接已作废！");
        await this.fetchShareLinks(this.page);
      } catch (error) {
        alert("作废失败，请稍后重试。");
      }
    },
    async invalidateSelectedLinks() {
      if (!this.selectedLinks.length || !confirm("确认作废选中的分享链接？")) return;
      try {
        const accessToken = this.validateToken();
        await axios.post("/images/share/manage/", {
          share_codes: this.selectedLinks }, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        alert("批量作废成功！");
        this.selectedLinks = [];
        await this.fetchShareLinks(this.page);
      } catch (error) {
        alert("作废失败，请稍后重试。");
      }
    },
    validateToken() {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) throw new Error("用户未登录");
      return accessToken;
    },
    generateShareLinkUrl(shareCode) {
      return `${this.baseUrl}/share/${shareCode}`;
    },
    isExpired(link) {
      const now = new Date();
      return new Date(link.expire_time) <= now;
    },
    toggleSelectAll() {
      this.selectedLinks = this.selectAll ? this.shareLinks.map((link) => link.share_code) : [];
    },
    formatExpireTime(expireTime) {
      const date = new Date(expireTime);
      return date.toLocaleString();
    },
  },
  mounted() {
    this.fetchShareLinks();
  },
};
</script>

<style scoped>
.manage-share-links {
  margin: 20px auto;
  font-family: "Arial", sans-serif;
  max-width: 1680px;
  color: #333;
}

.title {
  text-align: center;
  font-size: 28px;
  color: #4CAF50;
  margin-bottom: 20px;
}

.loading,
.error-message {
  text-align: center;
  font-size: 18px;
  margin: 10px 0;
}

.share-links-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

th, td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: center;
}

th {
  background-color: #f9f9f9;
  font-weight: bold;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

button {
  padding: 8px 14px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

button:hover {
  opacity: 0.9;
}

.invalidate-btn {
  background-color: #FFA500;
  color: white;
}

.delete-btn {
  background-color: #FF4D4F;
  color: white;
}

.page-btn {
  background-color: #007BFF;
  color: white;
}

.page-btn:disabled {
  background-color: #d6d6d6;
  cursor: not-allowed;
}

.batch-invalidate-btn {
  background-color: #FF5722;
  color: white;
}

.batch-delete-btn {
  background-color: #D32F2F;
  color: white;
}

.status-expired {
  color: #FF4D4F;
  font-weight: bold;
}

.status-valid {
  color: #4CAF50;
  font-weight: bold;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
}

.page-info {
  margin: 0 15px;
  font-size: 16px;
  color: #666;
}

.no-share-links {
  text-align: center;
  font-size: 18px;
  color: #666;
  margin-top: 20px;
}

.logo {
  text-align: center;
  margin: 20px 0;
}

.logo-link {
  text-decoration: none;
  color: #4CAF50;
  font-size: 24px;
  font-weight: bold;
}

.logo-link:hover {
  text-decoration: underline;
}
</style>
