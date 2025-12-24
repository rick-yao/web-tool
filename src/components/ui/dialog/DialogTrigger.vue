<script setup lang="ts">
import type { DialogTriggerProps } from 'radix-vue';

const _props = defineProps<DialogTriggerProps>();
</script>

<template>
  <DialogTrigger v-bind="props">
    <slot />
  </DialogTrigger>
</template>
