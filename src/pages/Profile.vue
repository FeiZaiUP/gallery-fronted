<template>
  <div>
    <h1>Profile</h1>
    <p>Welcome, {{ username }}</p>
  </div>
</template>

<script>
export default {
  name: 'Profile',
  data() {
    return {
      username: 'John Doe',
    };
  },
};
</script>
