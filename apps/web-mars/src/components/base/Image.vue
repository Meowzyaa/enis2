<template>
  <img
    class="border-transparent relative"
    :class="[loaded ? 'select-none' : 'animate-pulse']"
    aria-hidden="false"
    draggable="false"
    loaded="lazy"
    :src="imageUrl"
    :alt="alt"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { ref, watch } from "vue"

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    required: true,
  },
})

const loaded = ref(false)
const imageUrl = ref("")

const checkImage = (url: string) => {
  return new Promise<string>((resolve, reject) => {
    const img = new Image()
    img.src = url
    img.onload = () => resolve(url)
    img.onerror = () => reject("Failed to load image")
  })
}

const handleImage = async () => {
  try {
    imageUrl.value = await checkImage(props.src)
    loaded.value = true
  } catch (err) {
    loaded.value = false
  }
}

watch(() => props.src, handleImage, { immediate: true })
</script>

<style>
@reference "@/assets/globals.css";

img:-moz-broken {
  opacity: 0;
}
img::after {
  content: "";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  @apply bg-black/10 dark:bg-white/10;
}
</style>
