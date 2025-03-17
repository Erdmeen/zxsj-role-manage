<template>
  <a-card class="header-card">
    <div class="title-container">
      <div class="title-left">
        <a-typography-title :level="1">诛仙世界角色周任务记录</a-typography-title>
        <a-typography-paragraph>说明：数据存储在浏览器缓存中，清除缓存等操作会导致数据丢失，请自行导出备份。</a-typography-paragraph>
      </div>
      <div class="title-right">
        <div class="reset-info">
          <a-typography-text>下次重置时间：<a-typography-text type="success">{{ nextResetDate }}</a-typography-text></a-typography-text>
          <a-typography-text>距离重置还有：<a-typography-text type="danger">{{ daysUntilReset }}天</a-typography-text></a-typography-text>
        </div>
        <a-space direction="vertical" :size="8">
          <a-space>
            <a-button type="dashed" @click="$emit('login')" v-if="!isLoggedIn">登录同步</a-button>
            <a-button @click="$emit('exportData')">导出数据</a-button>
          </a-space>
          <a-space>
            <a-button type="primary" @click="$emit('addRole')" v-if="!showAddRoleForm">添加角色</a-button>
            <a-button type="primary" danger @click="$emit('cancelAddRole')" v-if="showAddRoleForm">取消添加</a-button>
            <a-button @click="$emit('importData')">导入数据</a-button>
          </a-space>
        </a-space>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

defineProps<{
  isLoggedIn: boolean
  showAddRoleForm: boolean
}>();

defineEmits<{
  'login': []
  'addRole': []
  'cancelAddRole': []
  'exportData': []
  'importData': []
}>();

const nextResetDate = computed(() => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilWednesday = (3 - dayOfWeek + 7) % 7;
  const nextWednesday = new Date(now);
  nextWednesday.setDate(now.getDate() + daysUntilWednesday);
  nextWednesday.setHours(0, 0, 0, 0);
  return nextWednesday.toLocaleDateString("zh-CN");
});

const daysUntilReset = computed(() => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  return (3 - dayOfWeek + 7) % 7 || 7;
});
</script>

<style scoped>

.title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-right {
  text-align: right;
}

.reset-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style> 