<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { ref } from 'vue';
import { type R2Config } from '@/composables/useR2Upload';
import SettingsDialog from '@/components/SettingsDialog.vue';
import ImageOptimizer from '@/components/ImageOptimizer.vue';
import { Toaster } from '@/components/ui/sonner';

const config = useStorage<R2Config>('r2-config', {
  accountId: '',
  accessKeyId: '',
  secretAccessKey: '',
  bucketName: '',
  publicDomain: '',
});

const activeTab = ref<'image-optimizer' | 'tool2'>('image-optimizer');
</script>

<template>
  <div class="min-h-screen bg-background text-foreground font-sans">
    <Toaster />

    <!-- Navbar with Tabs -->
    <header class="border-b">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-6">
            <!-- Logo & Title -->
            <div class="flex items-center gap-2">
              <div
                class="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-5 w-5"
                >
                  <path
                    d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
                  />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <h1 class="text-xl font-bold tracking-tight">Web Toolbox</h1>
            </div>

            <!-- Tab Navigation -->
            <nav class="flex items-center gap-1">
              <button
                @click="activeTab = 'image-optimizer'"
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                  activeTab === 'image-optimizer'
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                ]"
              >
                Image Optimizer
              </button>
              <button
                @click="activeTab = 'tool2'"
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                  activeTab === 'tool2'
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                ]"
              >
                Coming Soon
              </button>
            </nav>
          </div>

          <SettingsDialog />
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8 max-w-3xl">
      <ImageOptimizer v-if="activeTab === 'image-optimizer'" :config="config" />

      <!-- Coming Soon Tool -->
      <div v-else-if="activeTab === 'tool2'" class="space-y-8">
        <div class="border rounded-xl p-12 text-center">
          <div
            class="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-8 w-8 text-muted-foreground animate-spin"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold">Coming Soon</h3>
          <p class="text-sm text-muted-foreground mt-2">
            This feature is currently under development. Stay tuned!
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Styles are now in individual components */
</style>
