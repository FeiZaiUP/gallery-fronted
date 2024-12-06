<template>
  <div class="home">
    <!-- 导航栏 -->
    <header>
      <nav>
        <a href="/" class="nav-item">SUGALLERY</a>
        <!-- 下拉菜单触发按钮 -->
        <div class="dropdown">
          <button class="dropbtn">Account</button>
          <div class="dropdown-content">
            <a href="/login">Login</a>
            <a href="/register">Register</a>
            <!-- 后端接口预留位置 -->
          </div>
        </div>
      </nav>
    </header>

    <!-- 欢迎标语 -->
    <section class="welcome-section">
      <h1>Welcome to SuGallery</h1>
      <p>Your go-to platform for discovering and sharing stunning images</p>
    </section>

    <!-- 大图展示 -->
    <section class="big-image-section">
      <div class="big-image-wrapper">
        <img :src="images[currentIndex].src" :alt="images[currentIndex].title" class="big-image" />
        <div class="image-info">
          <h3>{{ images[currentIndex].title }}</h3>
          <p>{{ images[currentIndex].description }}</p>
        </div>
      </div>
    </section>

    <!-- 小图缩略图展示 -->
    <section class="image-gallery">
      <div class="image-card" v-for="(image, index) in images" :key="image.id" @click="changeImage(index)">
        <img :src="image.src" :alt="image.title" class="thumbnail-image" />
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      // 静态图片数据
      images: [
        {
          id: 1,
          title: 'XIAOMI Su7',
          description: 'Xiaomi\'s first performance coupe.',
          src: '/images/sunset.jpg', // 本地图片
        },
        {
          id: 2,
          title: 'Fire Cloud',
          description: 'A stunning skyline view of a bustling city.',
          src: '/images/evening-sky.jpg', // 本地图片
        },
        {
          id: 3,
          title: 'Blue Grass',
          description: 'A serene forest path with vibrant green trees.',
          src: '/images/feathers.jpg', // 本地图片
        },
        {
          id: 4,
          title: 'Wheat Ears',
          description: '',
          src: '/images/grasses.jpg', // 本地图片
        },
        {
          id: 5,
          title: 'Maple Leaf',
          description: 'A calm ocean view with a gentle breeze.',
          src: '/images/leaf.jpg', // 本地图片
        },
        {
          id: 6,
          title: 'Airplane',
          description: 'A calm ocean view with a gentle breeze.',
          src: '/images/plane.jpg', // 本地图片
        },
        {
          id: 7,
          title: 'Half Moon',
          description: '',
          src: '/images/moon.jpg', // 本地图片
        },
        {
          id: 8,
          title: 'Snow Mountain',
          description: '',
          src: '/images/mountains.jpg', // 本地图片
        },
        {
          id: 9,
          title: 'Beautiful Girl',
          description: '',
          src: '/images/BeautiGirl.jpg', // 本地图片
        },
        {
          id: 10,
          title: 'BestWish',
          description: '',
          src: '/images/bestwish.png', // 本地图片
        },
      ],
      currentIndex: 0, // 当前展示的大图索引
    };
  },
  methods: {
    // 点击缩略图时切换大图
    changeImage(index) {
      this.currentIndex = index;
    },
  },
};
</script>

<style scoped>
/* 页面主体样式 */
.home {
  font-family: 'Arial', sans-serif;
  color: #333;
  text-align: center;
  margin: 20px;
}

/* 导航栏样式 */
header {
  background-color: #2c3e50;
  padding: 15px 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.nav-item {
  color: white;
  text-decoration: none;
  font-size: 1.2em;
  margin: 0 20px;
  transition: color 0.3s ease;
}

.nav-item:hover {
  color: #ff7f50;
}

/* 下拉菜单样式 */
.dropdown {
  position: relative;
  display: inline-block;
}

.dropbtn {
  background-color: #2c3e50;
  color: white;
  font-size: 1.2em;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

.dropdown-content {
  display: none;
  position: absolute;
  right: 0;
  background-color: #fff;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
  min-width: 160px;
  z-index: 1;
  border-radius: 5px;
}

.dropdown:hover .dropdown-content {
  display: block;
}

.dropdown-content a {
  color: #333;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}

.dropdown-content a:hover {
  background-color: #f1f1f1;
}

/* 欢迎标语样式 */
.welcome-section {
  background-color: #f0f8ff;
  padding: 40px 20px;
  margin-top: 20px;
}

.welcome-section h1 {
  font-size: 3em;
  color: #2c3e50;
  margin-bottom: 20px;
}

.welcome-section p {
  font-size: 1.3em;
  color: #555;
}

/* 大图展示样式 */
.big-image-section {
  margin-top: 40px;
}

.big-image-wrapper {
  position: relative;
  max-width: 100%;
  width: 80%; /* 最大宽度为80% */
  height: 0;
  padding-bottom: 56.25%; /* 16:9比例 */
  margin: 0 auto;
  overflow: hidden;
  border-radius: 10px;
  background-color: #ccc; /* 防止没有图片时背景显示为白色 */
}

.big-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保持16:9比例并填充容器 */
}

.image-info {
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10px;
  border-radius: 5px;
}

/* 图片库（缩略图）布局 */
.image-gallery {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
}

.image-card {
  width: 120px;
  height: 120px;
  overflow: hidden;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.image-card:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .big-image-wrapper {
    width: 95%; /* 在小屏幕上调整为宽度的95% */
    padding-bottom: 56.25%; /* 保持16:9比例 */
  }

  .welcome-section h1 {
    font-size: 2em;
  }

  .welcome-section p {
    font-size: 1em;
  }
}

@media (max-width: 480px) {
  .big-image-wrapper {
    width: 100%; /* 在极小的屏幕上使用100%宽度 */
    padding-bottom: 56.25%;
  }

  .image-gallery {
    flex-direction: column;
  }
}
</style>