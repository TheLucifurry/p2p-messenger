<script setup lang="ts">
import { darkTheme, GlobalThemeOverrides } from 'naive-ui';

const mainTheme: GlobalThemeOverrides = {
  common: {
    // primaryColor: '#7237F1',
    // primaryColorHover: '#945BFF',
    // primaryColorSuppl: '#5B2BC4',
    bodyColor: '#030303',
    // cardColor: '#120F1B',
  },
};
</script>

<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="mainTheme">
    <n-message-provider>
      <Main />
    </n-message-provider>
    <n-global-style />
  </n-config-provider>
</template>

<style lang="scss">
#app {
  height: 100%;
  box-sizing: border-box;

  & > .n-config-provider {
    height: inherit;
    width: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @media screen and (max-width: $screen-size-mobile-width) {
    padding: 0;
  }
}
</style>
