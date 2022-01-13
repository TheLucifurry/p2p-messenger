<script setup lang="ts">
import { PropType } from 'vue';
import { ChatMsg, EMsgType } from '@/types/messages';
import { parseDate } from '@/helpers/datetime';

const props = defineProps({
  message: {
    type: Object as PropType<ChatMsg>,
    required: true,
    validator(value: ChatMsg) {
      return value.type !== EMsgType.EVENT;
    },
  },
  isLeftSided: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <div class="chat-message" :class="{ 'chat-message--left-sided': props.isLeftSided }">
    <div class="chat-message__text">{{ props.message.data }}</div>
    <div class="chat-message__status">
      <n-time
        class="chat-message__sent-time"
        :time="parseDate(props.message.time)"
        type="relative"
      />
    </div>
  </div>
</template>

<style lang="scss">
.chat-message {
  --sz-side-margin: 16px;

  max-width: 70%;
  background-color: $color-chat-message-bg;
  border-radius: 4px;
  margin: 0 var(--sz-side-margin);
  position: relative;

  &:not(.chat-message--left-sided)::before {
    position: absolute;
    border-radius: inherit;
    right: 100%;
    content: "";
    height: 100%;
    width: calc(var(--sz-side-margin) * 0.8);
    background: linear-gradient(
      -90deg,
      rgba($color-chat-message-bg, 0.06),
      #0000
    );
  }
  &.chat-message--left-sided::after {
    position: absolute;
    border-radius: inherit;
    top: 0;
    left: 100%;
    content: "";
    height: 100%;
    width: calc(var(--sz-side-margin) * 0.8);
    background: linear-gradient(
      90deg,
      rgba($color-chat-message-bg, 0.06),
      #0000
    );
  }
  &__text {
    padding: 4px 12px;
    white-space: pre-line;
  }
  &__status {
    // max-width: 100%;
    padding: 0 4px;
    display: flex;
    justify-content: end;
  }
  &__sent-time {
    font-size: smaller;
    color: #fff3;
  }

  &--left-sided {
    margin-left: auto;
    margin-right: var(--sz-side-margin);
  }
}
</style>
