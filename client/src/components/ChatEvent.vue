<script setup lang="ts">
import { PropType } from 'vue';
import { ChatMsg, EEventType } from '@/types/messages';

const props = defineProps({
  message: {
    type: Object as PropType<ChatMsg>,
    required: true,
  },
});

const chatEvents = [
  'Chat created',
];

function getEventText(data: EEventType) {
  return typeof data === 'number' ? chatEvents[data] : data;
}
</script>

<template>
  <div round size="small" class="chat-event">{{ getEventText(props.message.data as EEventType) }}</div>
</template>

<style lang="scss">
.chat-event {
  --chat-event-fs: 14px;

  padding: 0 8px;
  background-color: #ffffff15;
  color: #999;
  font-size: var(--chat-event-fs);
  user-select: none;
  border-radius: var(--chat-event-fs);

  width: max-content;
  margin: auto;
}
</style>
