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
  </div>
</template>