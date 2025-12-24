<script setup lang="ts">
import {
  type DialogRootEmits,
  type DialogRootProps,
  useForwardPropsEmits,
} from 'radix-vue';

const props = defineProps<DialogRootProps>();
const emits = defineEmits<DialogRootEmits>();

const _forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <DialogRoot v-bind="forwarded">
    <slot />
  </DialogRoot>
</template>
