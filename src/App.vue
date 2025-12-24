<script setup lang="ts">
import {
  useClipboard,
  useDropZone,
  useFileDialog,
  useStorage,
} from '@vueuse/core';
import { ref } from 'vue';
import { toast } from 'vue-sonner';
import {
  type ProcessingResult,
  useImageProcessor,
} from '@/composables/useImageProcessor';
import { type R2Config, useR2Upload } from '@/composables/useR2Upload';

// State
const config = useStorage<R2Config>('r2-config', {
  accountId: '',
  accessKeyId: '',
  secretAccessKey: '',
  bucketName: '',
  publicDomain: '',
});

interface Task {
  id: number;
  originalName: string;
  status: 'processing' | 'uploading' | 'completed' | 'error';
  progress: number;
  error: string;
  results: { type: string; url: string }[];
}

const dropZoneRef = ref<HTMLElement>();
const isDragging = ref(false);
const tasks = ref<Task[]>([]); // Store processing tasks

const { processImage } = useImageProcessor();
const { uploadFiles } = useR2Upload();
const { copy } = useClipboard();

// biome-ignore lint/correctness/noUnusedVariables: used in template
const { open, onChange } = useFileDialog({
  accept: 'image/*',
  multiple: true,
});

// File handling
function onDrop(files: File[] | null) {
  isDragging.value = false;
  if (files) {
    handleFiles(files);
  }
}

useDropZone(dropZoneRef, {
  onDrop,
  onEnter: () => {
    isDragging.value = true;
  },
  onLeave: () => {
    isDragging.value = false;
  },
  onOver: () => {
    isDragging.value = true;
  },
});

onChange((files) => {
  if (files) {
    handleFiles(Array.from(files));
  }
});

async function handleFiles(files: File[]) {
  // Validate config
  if (
    !config.value.accountId ||
    !config.value.bucketName ||
    !config.value.accessKeyId ||
    !config.value.secretAccessKey
  ) {
    toast.error('Please configure R2 settings first');
    return;
  }

  for (const file of files) {
    const task = {
      id: Date.now() + Math.random(),
      originalName: file.name,
      status: 'processing' as
        | 'processing'
        | 'uploading'
        | 'completed'
        | 'error',
      progress: 0, // 0-50 for processing, 50-100 for uploading
      error: '',
      results: [] as { type: string; url: string }[],
    };
    tasks.value.unshift(task);
    processAndUpload(file, task);
  }
}

async function processAndUpload(file: File, task: Task) {
  try {
    // 1. Process
    task.status = 'processing';
    task.progress = 25;

    const result: ProcessingResult = await processImage(file);
    task.progress = 50;

    // 2. Upload
    task.status = 'uploading';
    const filesToUpload = result.files.map((f) => f.file);

    const uploadResults = await uploadFiles(filesToUpload, config.value);

    task.results = uploadResults.map((r) => ({
      type: (r.fileType.split('/')[1] ?? 'UNKNOWN').toUpperCase(),
      url: r.url,
    }));

    task.status = 'completed';
    task.progress = 100;
    toast.success(`Processed ${file.name}`);
  } catch (error: unknown) {
    const e = error as Error;
    console.error(e);
    task.status = 'error';
    task.error = e.message;
    toast.error(`Error processing ${file.name}: ${e.message}`);
  }
}

function copyToClipboard(text: string) {
  copy(text);
  toast.success('Copied to clipboard');
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground font-sans">
    <Toaster />

    <!-- Navbar -->
    <header class="border-b">
      <div
        class="container mx-auto px-4 h-16 flex items-center justify-between"
      >
        <div class="flex items-center gap-2">
          <div
            class="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground"
          >
            <ImageIcon class="h-5 w-5" />
          </div>
          <h1 class="text-xl font-bold tracking-tight">
            Image Optimizer & Uploader
          </h1>
        </div>
        <SettingsDialog />
      </div>
    </header>

    <main class="container mx-auto px-4 py-8 max-w-3xl">
      <Tabs default-value="optimizer" class="w-full">
        <div class="flex items-center justify-center mb-8">
          <TabsList class="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="optimizer"> Image Optimizer </TabsTrigger>
            <TabsTrigger value="tbd"> Coming Soon </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="optimizer" class="space-y-8">
          <!-- Drop Zone -->
          <div
            ref="dropZoneRef"
            @click="() => open()"
            :class="[
              'border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer hover:bg-muted/50 group',
              isDragging
                ? 'border-primary bg-muted/50'
                : 'border-muted-foreground/25',
            ]"
          >
            <div class="flex flex-col items-center gap-4">
              <div
                class="h-16 w-16 bg-muted rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
              >
                <UploadCloud class="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 class="text-lg font-semibold">Drop images here</h3>
                <p class="text-sm text-muted-foreground mt-1">
                  or click to select files
                </p>
              </div>
              <p class="text-xs text-muted-foreground">
                Supports JPG, PNG, WEBP (Auto converts to WEBP + AVIF)
              </p>
            </div>
          </div>

          <!-- Task List -->
          <div v-if="tasks.length > 0" class="space-y-4">
            <h2 class="text-lg font-semibold">Recent Activity</h2>

            <TransitionGroup name="list" tag="div" class="space-y-4">
              <Card
                v-for="task in tasks"
                :key="task.id"
                class="overflow-hidden"
              >
                <CardContent class="p-4">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-3">
                      <div class="p-2 bg-muted rounded-md">
                        <FileImage class="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p class="font-medium text-sm">
                          {{ task.originalName }}
                        </p>
                        <div
                          class="flex items-center gap-2 text-xs text-muted-foreground mt-0.5"
                        >
                          <span
                            v-if="task.status === 'processing'"
                            class="text-blue-500 flex items-center gap-1"
                          >
                            <Loader2 class="h-3 w-3 animate-spin" />
                            Processing...
                          </span>
                          <span
                            v-else-if="task.status === 'uploading'"
                            class="text-yellow-500 flex items-center gap-1"
                          >
                            <Loader2 class="h-3 w-3 animate-spin" /> Uploading
                            to R2...
                          </span>
                          <span
                            v-else-if="task.status === 'completed'"
                            class="text-green-500 flex items-center gap-1"
                          >
                            <Check class="h-3 w-3" /> Completed
                          </span>
                          <span
                            v-else-if="task.status === 'error'"
                            class="text-red-500"
                          >
                            Failed: {{ task.error }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Progress
                    v-if="
                      task.status !== 'completed' && task.status !== 'error'
                    "
                    :model-value="task.progress"
                    class="h-1 mb-2"
                  />

                  <!-- Results -->
                  <div
                    v-if="task.status === 'completed'"
                    class="grid gap-2 mt-4 bg-muted/30 p-3 rounded-md"
                  >
                    <div
                      v-for="res in task.results"
                      :key="res.url"
                      class="flex items-center justify-between text-sm group/item"
                    >
                      <div class="flex items-center gap-2">
                        <span
                          class="text-xs font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground w-12 text-center"
                          >{{ res.type }}</span
                        >
                        <a
                          :href="res.url"
                          target="_blank"
                          class="text-muted-foreground truncate max-w-[200px] sm:max-w-[300px] hover:text-primary hover:underline"
                          >{{ res.url }}</a
                        >
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        class="h-6 w-6 opacity-0 group-hover/item:opacity-100 transition-opacity"
                        @click="copyToClipboard(res.url)"
                      >
                        <Copy class="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TransitionGroup>
          </div>
        </TabsContent>

        <TabsContent value="tbd">
          <Card>
            <CardContent
              class="flex flex-col items-center justify-center p-12 text-center"
            >
              <div
                class="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4"
              >
                <Loader2 class="h-6 w-6 text-muted-foreground animate-spin" />
              </div>
              <h3 class="text-lg font-semibold">Coming Soon</h3>
              <p class="text-sm text-muted-foreground mt-2">
                This feature is currently under development. Stay tuned!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
