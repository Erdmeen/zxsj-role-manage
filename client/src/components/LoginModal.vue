<template>
  <a-modal
    :open="showLoginModal"
    @update:open="$emit('update:showLoginModal', $event)"
    title="登录"
    @cancel="closeModal"
    :maskClosable="false"
    :footer="null"
    :width="400"
  >
    <a-form :model="loginForm">
      <a-form-item label="账号" name="username">
        <a-input
          v-model:value="loginForm.username"
          placeholder="请输入账号"
        />
      </a-form-item>
      <a-form-item label="密码" name="password">
        <a-input-password
          v-model:value="loginForm.password"
          placeholder="请输入密码"
          @keyup.enter="handleLogin"
        />
      </a-form-item>
      <div class="login-form-actions">
        <a-button type="primary" @click="handleLogin">登录</a-button>
      </div>
      <div class="login-tips">
        <div class="login-tip-item">
          <a-typography-text type="secondary">1. 登录后会将数据同步存储在服务器</a-typography-text>
        </div>
        <div class="login-tip-item">
          <a-typography-text type="secondary">2. 如需该功能，请联系哈根达斯开通</a-typography-text>
        </div>
      </div>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { message } from 'ant-design-vue';

const props = defineProps<{
  showLoginModal: boolean
}>();

const emit = defineEmits<{
  'update:showLoginModal': [value: boolean]
  'login': [username: string, password: string]
}>();

const loginForm = ref({
  username: '',
  password: ''
});

const handleLogin = () => {
  debugger;
  if (!loginForm.value.username || !loginForm.value.password) {
    message.error('请输入用户名和密码');
    return;
  }
  emit('login', loginForm.value.username, loginForm.value.password);
  loginForm.value = { username: '', password: '' };
};

const closeModal = () => {
  emit('update:showLoginModal', false);
  loginForm.value = { username: '', password: '' };
};
</script>

<style scoped>
.login-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 24px;
}

.login-tips {
  margin-top: 16px;
}
</style> 