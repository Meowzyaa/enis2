<template>
  <div class="fixed bottom-4 left-4 z-40 overflow-x-hidden">
    <transition-group
      enter-from-class="opacity-0 translate-y-3"
      enter-active-class="transition ease-out duration-200 transform"
      leave-active-class="transition ease-in duration-150 transform"
      leave-to-class="opacity-0 translate-y-3"
    >
      <Notification
        v-for="notification in notifications"
        :key="notification.id"
        :notification="notification"
        @close-notification="removeNotification(notification.id)"
      />
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { emitter } from "../../../services/bus.js"
import Notification from "./Notification.vue"

const notifications = ref<any[]>([])

const addNotification = (notification: any) => {
  notifications.value = [...notifications.value, notification]
  if (notification.progress && notification.delay > 0) {
    setTimeout(() => {
      removeNotification(notification.id)
    }, notification.delay)
  }
}

const removeNotification = (id: string) => {
  notifications.value = notifications.value.filter((item) => item.id !== id)
}

emitter.on("newNotification", (notification: any) => {
  addNotification(notification)
})
emitter.on("dismissNotification", (id: string) => {
  removeNotification(id)
})
emitter.on("clearNotifications", () => {
  notifications.value = []
})
</script>
