<script setup>
</script>

<template>
  <header class="header">
    <div class="search-bar">
      <input type="text" placeholder="Search..." />
    </div>
    <div class="user-profile">
      <span>Admin User</span>
    </div>
  </header>
</template>

<style scoped>
.header {
  height: 64px;
  background-color: #1a1a1a;
  border-bottom: 1px solid #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
}

.search-bar input {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #333;
  background-color: #2a2a2a;
  color: white;
}

.user-profile {
  color: #fff;
}
</style>
