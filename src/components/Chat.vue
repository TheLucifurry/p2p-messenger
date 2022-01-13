<script setup lang="ts">
import IconMore from '@vicons/fluent/MoreVertical32Filled';
import IconShare from '@vicons/fluent/ShareAndroid24Filled';
import IconSend from '@vicons/fluent/Send28Filled';

import { ref } from 'vue';
import { ChatMsg, EMsgType } from '@/types/messages';
import { useStoreChat } from '@/stores/chat';

const storeChat = useStoreChat();
const inputMessage = ref('');

function sendMessage() {
  const messageText = inputMessage.value.trim();
  if (!messageText) return;
  storeChat.addUserMessage(messageText);
  inputMessage.value = '';
}

// Handlers
function onInputMessageChange(str: string) {
  inputMessage.value = str.trim();
}
function onInputMessageKeyupEnter(e: KeyboardEvent) {
  if (e.shiftKey) return;
  sendMessage();
}
function onButtonSendClick() {
  sendMessage();
}
</script>

<template>
  <n-card title="Serverless Chat" class="chat" :bordered="false">
    <template #header-extra>
      <!-- <header class="chat__header"> -->
      <n-button text style="font-size: 28px; margin-right: 14px">
        <n-icon>
          <IconShare />
        </n-icon>
      </n-button>
      <n-button text style="font-size: 28px">
        <n-icon>
          <IconMore />
        </n-icon>
      </n-button>
      <!-- </header> -->
    </template>
    <div class="chat__body">
      <div v-for="(msg, ix) in storeChat.getMessages" :key="ix" class="chat__row">
        <ChatEvent v-if="msg.type === EMsgType.EVENT" :message="msg" />
        <ChatMessage v-else :message="msg" :is-left-sided="msg.type === EMsgType.OUT" />
      </div>
    </div>
    <template #action>
      <footer class="chat__footer">
        <div class="chat__input-message-container">
          <n-input
            v-model:value="inputMessage"
            placeholder="Write a message..."
            type="textarea"
            size="small"
            :autosize="{ maxRows: 8 }"
            @change="onInputMessageChange"
            @keyup.enter="onInputMessageKeyupEnter"
          />
        </div>
        <div class="chat__button-send-container">
          <n-button text style="font-size: 28px" @click="onButtonSendClick">
            <n-icon>
              <IconSend />
            </n-icon>
          </n-button>
        </div>
      </footer>
    </template>
  </n-card>
</template>

<style lang="scss">
// Customizing
.chat {
  // .n-card {
  //   --n-border-radius: 32px;
  // }

  .n-card-header {
    padding: 16px;
  }
  .n-card__content {
    overflow-y: auto;
    padding: 0;

    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-track {
      background-color: rgba(52, 4, 80, 0.15);
    }
    &::-webkit-scrollbar-thumb {
      background-color: darkgrey;
      border-radius: 3px;
      outline: 1px solid slategrey;
    }
  }
  .n-card__action {
    padding: 0;
  }

  .n-input--textarea {
    .n-input-wrapper {
      padding: 8px;
    }
    textarea::-webkit-scrollbar {
      width: 4px;
    }
    textarea::-webkit-scrollbar-track {
      background-color: rgba(52, 4, 80, 0.15);
    }
    textarea::-webkit-scrollbar-thumb {
      background-color: darkgrey;
      border-radius: 3px;
      outline: 1px solid slategrey;
    }
  }
}

.chat {
  --sz-button-send-container: 64px;

  box-shadow: 0 0 32px 16px #fff1;
  height: 100%;

  &__body {
    background-color: #000c;
    padding: 12px 0;
    min-height: 100%;
    box-sizing: border-box;
  }
  &__row {
    width: 100%;
    padding: 6px 0;
  }
  &__footer {
    display: flex;
    align-items: center;
    padding: 12px;
    padding-right: 0;
  }
  &__input-message-container {
    display: flex;
    width: calc(100% - var(--sz-button-send-container));
  }
  &__button-send-container {
    display: flex;
    justify-content: center;
    width: var(--sz-button-send-container);
  }
}
</style>
