<template>
  <label class="switch-label">
    <input
      class="switch default-focus rounded-full cursor-pointer"
      type="checkbox"
      :checked="modelValue"
      @change="
        emit('update:modelValue', ($event.target as HTMLInputElement).checked)
      "
    />
    <span class="switch-label-sr">Slider</span>
  </label>
</template>

<script setup lang="ts">
defineProps({
  modelValue: {
    type: Boolean,
    required: false,
  },
  id: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(["update:modelValue"])
</script>

<style scoped>
.switch-label {
  display: flex;
  transition: transform 0.3s ease-in-out;
  -webkit-tap-highlight-color: transparent;
}
.switch-label-sr {
  clip: rect(1px, 1px, 1px, 1px);
  overflow: hidden;
  position: absolute;
  width: 1px;
  height: 1px;
}
.switch {
  position: relative;
  width: 3em;
  height: 1.5em;
  -webkit-appearance: none;
  appearance: none;
}
.switch:before,
.switch:after {
  animation-duration: 0.6s;
  animation-timing-function: ease-in-out;
  content: "";
  display: block;
  position: absolute;
}
.switch:before {
  background-color: var(--switch-track);
  border-radius: 0.75em;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: background-color 0.3s ease-in-out;
}
.switch:after {
  background-color: hsl(0, 0%, 100%);
  border-radius: 0.5em;
  top: 0.25em;
  left: 0.25em;
  width: 1em;
  height: 1em;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
  transition:
    transform 0.25s cubic-bezier(0.23, 1, 0.32, 1),
    width 0.25s cubic-bezier(0.23, 1, 0.32, 1);
}
/* Thumb stretches under the finger, then snaps to the other side. */
.switch:active:after {
  width: 1.3em;
}
.switch:checked:active:after {
  transform: translateX(1.2em);
}
.switch:checked:before {
  background-color: var(--color-coral);
}
.switch:checked:after {
  transform: translateX(1.5em);
}
</style>
