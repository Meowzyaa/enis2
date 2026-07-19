import { nanoid } from "nanoid"
import { emitter } from "./bus"
import type { NotificationOptions } from "../types"

const notify = {
  show: ({
    id = nanoid(),
    message,
    type = "info",
    delay = 3000,
    progress = true,
    closable = true,
    actions = {},
  }: NotificationOptions) => {
    emitter.emit("newNotification", {
      id,
      message,
      type,
      delay,
      progress,
      closable,
      actions,
    })
  },
  dismiss: (id: string) => {
    emitter.emit("dismissNotification", id)
  },
  clear: () => {
    emitter.emit("clearNotifications")
  },
}

export { notify }
