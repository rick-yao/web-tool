<script setup lang="ts">
import {
  type TabsRootEmits,
  type TabsRootProps,
  useForwardPropsEmits,
} from 'radix-vue';

const props = defineProps<TabsRootProps>();
const emits = defineEmits<TabsRootEmits>();

const _forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <TabsRoot v-bind="forwarded">
    <slot />
  </TabsRoot>
</template>
