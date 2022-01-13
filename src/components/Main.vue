<script setup lang="ts">
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
