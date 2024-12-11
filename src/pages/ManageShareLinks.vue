<template>
  <div class="manage-share-links">
    <h1 class="title">管理分享链接</h1>

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
            <button @click="deleteShareLink(link.share_code)" class="delete-btn">删除</button>
          </td>
        </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div class="pagination">
        <button :disabled="page <= 1 || !totalPages" @click="fetchShareLinks(page - 1)" class="page-btn">上一页</button>
        <span class="page-info">第 {{ page }} 页</span>
        <button :disabled="page >= totalPages || !totalPages" @click="fetchShareLinks(page + 1)" class="page-btn">下一页</button>
      </div>

      <!-- 批量删除按钮 -->
      <div class="batch-actions">
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
      shareLinks: [],  // 当前页面的分享链接
      page: 1,         // 当前页码
      totalPages: 1,   // 总页数
      loading: true,   // 加载状态
      errorMessage: "", // 错误信息
      selectedLinks: [], // 选中的分享链接ID
      selectAll: false, // 是否全选
      baseUrl: 'http://192.168.1.175:8188', // 网站的基本URL
    };
  },
  methods: {
    // 获取分享链接列表
    async fetchShareLinks(page = 1) {
      try {
        this.loading = true;  // 设置为加载中
        this.errorMessage = ""; // 清空错误信息

        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          throw new Error('用户未认证');
        }

        // 确保 page 被正确替换
        const url = `/images/share/manage/?page=${page}`;  // 直接将 page 插入到 URL 中
        console.log(url);  // 打印 URL，检查是否正确

        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${accessToken}`, // 传递 token
          }
        });

        this.shareLinks = response.data.results;
        this.page = page;
        this.totalPages = Math.ceil(response.data.count / 5);  // 每页5条数据
        this.loading = false;  // 加载完成
      } catch (error) {
        console.error('获取分享链接失败:', error);
        this.errorMessage = '无法加载分享链接，请稍后再试。';
        this.loading = false;  // 加载完成
      }
    },

    // 删除单个分享链接
    async deleteShareLink(shareCode) {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          throw new Error('用户未认证');
        }

        await axios.delete(`/images/share/manage/delete/`, {
          data: { share_codes: [shareCode] },
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        });

        // 删除成功后刷新当前页
        await this.fetchShareLinks(this.page);
        alert("分享链接已删除");
      } catch (error) {
        console.error('删除分享链接失败:', error);
        alert("删除失败，请稍后再试。");
      }
    },

    // 批量删除选中的分享链接
    async deleteSelectedLinks() {
      if (this.selectedLinks.length === 0) {
        alert("请至少选择一个分享链接");
        return;
      }

      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          throw new Error('用户未认证');
        }

        await axios.delete(`/images/share/manage/delete/`, {
          data: {share_codes: this.selectedLinks},
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        });

        // 删除成功后刷新当前页
        await this.fetchShareLinks(this.page);
        this.selectedLinks = []; // 清空选中的链接
        alert("选中的分享链接已删除");
      } catch (error) {
        console.error('批量删除分享链接失败:', error);
        alert("删除失败，请稍后再试。");
      }
    },

    // 格式化过期时间
    formatExpireTime(expireTime) {
      const date = new Date(expireTime);
      return date.toLocaleString();  // 根据浏览器时区格式化时间
    },

    // 生成分享链接的完整URL
    generateShareLinkUrl(shareCode) {
      return `${this.baseUrl}/share/${shareCode}`;
    },

    // 全选或取消全选
    toggleSelectAll() {
      if (this.selectAll) {
        this.selectedLinks = this.shareLinks.map(link => link.share_code);
      } else {
        this.selectedLinks = [];
      }
    },
  },
  mounted() {
    this.fetchShareLinks();  // 初始加载分享链接
  },
};
</script>

<style scoped>
.manage-share-links {
  margin: 20px;
  font-family: Arial, sans-serif;
}

.title {
  text-align: center;
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

.loading, .error-message {
  text-align: center;
  font-size: 16px;
}

.share-links-container {
  margin-top: 20px;
}

.share-links-table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  border: 1px solid #ddd;
  text-align: center;
}

th {
  background-color: #f4f4f4;
  font-weight: bold;
}

button {
  padding: 6px 12px;
  margin: 5px;
  border-radius: 25px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #45a049;
}

.page-btn {
  padding: 8px 16px;
  margin: 0 5px;
  border-radius: 25px;
  background-color: #f0f0f0;
  color: #333;
  border: none;
  cursor: pointer;
}

.page-btn:hover {
  background-color: #ddd;
}

.page-info {
  font-size: 16px;
  margin: 0 10px;
}

.batch-actions {
  margin-top: 20px;
  text-align: center;
}

.batch-delete-btn {
  padding: 8px 16px;
  background-color: #f44336;
  color: white;
  border-radius: 25px;
  border: none;
  cursor: pointer;
}

.batch-delete-btn:hover {
  background-color: #e53935;
}

.no-share-links {
  text-align: center;
  font-size: 18px;
  color: #666;
}
</style>