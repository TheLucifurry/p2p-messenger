<script setup lang="ts">
import { onMounted } from 'vue';
import { useMessage } from 'naive-ui';
import { useStoreChat } from '@/stores/chat';

const storeChat = useStoreChat();

// See: src/types/globals.d.ts
window.$message = useMessage();

onMounted(() => {
  storeChat.pageLoaded();
});
</script>

<template>
  <div class="main">
    <Chat />
  </div>
</template>

<style lang="scss">
.main {
  height: 100%;
  width: 600px;

  @media screen and (max-width: $screen-size-mobile-width) {
    margin: 0;
    width: 100%;
  }

  @media screen and (min-width: $screen-size-mobile-width) {
    height: 90%;
  }
}
</style>
