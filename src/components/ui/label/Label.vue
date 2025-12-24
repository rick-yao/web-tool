<script setup lang="ts">
import { Label } from 'radix-vue';
import { cva } from 'class-variance-authority';
import type { LabelProps } from 'radix-vue';
import { computed, type HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
);

const props = defineProps<LabelProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});
</script>

<template>
  <Label v-bind="delegatedProps" :class="cn(labelVariants(), props.class)">
    <slot />
  </Label>
</template>
