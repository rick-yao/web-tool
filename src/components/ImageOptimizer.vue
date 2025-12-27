<script setup lang="ts">
import { useClipboard, useDropZone, useFileDialog } from '@vueuse/core';
import { CheckCircle2, Copy, Loader2, Upload, XCircle } from 'lucide-vue-next';
import { ref } from 'vue';
import { toast } from 'vue-sonner';
import SettingsDialog from '@/components/SettingsDialog.vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  type ProcessingResult,
  useImageProcessor,
} from '@/composables/useImageProcessor';
import { type R2Config, useR2Upload } from '@/composables/useR2Upload';

const props = defineProps<{
  config: R2Config;
}>();

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
const tasks = ref<Task[]>([]);

const { processImage } = useImageProcessor();
const { uploadFiles } = useR2Upload();
const { copy } = useClipboard();

const { open, onChange } = useFileDialog({
  accept: 'image/*',
  multiple: true,
});

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
  if (
    !props.config.accountId ||
    !props.config.bucketName ||
    !props.config.accessKeyId ||
    !props.config.secretAccessKey
  ) {
    toast.error('Please configure R2 settings first');
    return;
  }

  for (const file of files) {
    const task: Task = {
      id: Date.now() + Math.random(),
      originalName: file.name,
      status: 'processing',
      progress: 0,
      error: '',
      results: [],
    };
    tasks.value.unshift(task);
    processAndUpload(file, task.id);
  }
}

async function processAndUpload(file: File, taskId: number) {
  // Find the task index in the array
  const taskIndex = tasks.value.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) {
    console.error('[processAndUpload] Task not found:', taskId);
    return;
  }

  // Get a reference to the task to avoid repeated array access and type issues
  const task = tasks.value[taskIndex];
  if (!task) {
    console.error('[processAndUpload] Task is undefined:', taskId);
    return;
  }

  try {
    task.status = 'processing';
    task.progress = 25;

    const result: ProcessingResult = await processImage(file);
    task.progress = 50;

    task.status = 'uploading';
    const filesToUpload = result.files.map((f) => f.file);

    const uploadResults = await uploadFiles(filesToUpload, props.config);

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

function generateHtmlSnippet(results: { type: string; url: string }[]): string {
  const avif = results.find((r) => r.type === 'AVIF');
  const webp = results.find((r) => r.type === 'WEBP');
  const fallback =
    results.find(
      (r) => r.type === 'PNG' || r.type === 'JPG' || r.type === 'JPEG',
    ) ?? results[0];

  // Safety check: if no results exist, return empty picture tag
  if (!fallback) {
    return '<picture>\n  <img src="" alt="Image description">\n</picture>';
  }

  let html = '<picture>\n';
  if (avif) {
    html += `  <source srcset="${avif.url}" type="image/avif">\n`;
  }
  if (webp) {
    html += `  <source srcset="${webp.url}" type="image/webp">\n`;
  }
  html += `  <img src="${fallback.url}" alt="Image description">\n`;
  html += '</picture>';
  return html;
}
</script>

<template>
  <div class="space-y-8">
    <!-- Settings Button -->
    <div class="flex justify-end">
      <SettingsDialog :config="config" />
    </div>

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
          <Upload class="h-8 w-8 text-muted-foreground" />
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
        <Card v-for="task in tasks" :key="task.id" class="overflow-hidden">
          <CardContent class="p-4">
            <div class="flex items-center justify-between mb-2">
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
                    <Loader2 class="h-3 w-3 animate-spin" />
                    Uploading to R2...
                  </span>
                  <span
                    v-else-if="task.status === 'completed'"
                    class="text-green-500 flex items-center gap-1"
                  >
                    <CheckCircle2 class="h-3 w-3" />
                    Completed
                  </span>
                  <span
                    v-else-if="task.status === 'error'"
                    class="text-red-500 flex items-center gap-1"
                  >
                    <XCircle class="h-3 w-3" />
                    Failed: {{ task.error }}
                  </span>
                </div>
              </div>
            </div>

            <Progress
              v-if="task.status !== 'completed' && task.status !== 'error'"
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
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary"
                  >
                    {{ res.type }}
                  </span>
                  <button
                    @click="copyToClipboard(res.url)"
                    class="text-muted-foreground hover:text-primary transition-colors truncate text-left flex-1 cursor-pointer"
                    :title="'Click to copy: ' + res.url"
                  >
                    {{ res.url }}
                  </button>
                </div>
                <Copy
                  class="h-3 w-3 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity"
                />
              </div>
            </div>

            <!-- Code Snippets -->
            <div v-if="task.status === 'completed'" class="mt-4">
              <Tabs default-value="html" class="w-full">
                <TabsList class="grid w-full grid-cols-2">
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="markdown">Markdown</TabsTrigger>
                </TabsList>
                <TabsContent value="html" class="mt-2">
                  <button
                    @click="copyToClipboard(generateHtmlSnippet(task.results))"
                    class="w-full text-left p-3 bg-muted rounded-md hover:bg-muted/80 transition-colors cursor-pointer group"
                    title="Click to copy HTML code"
                  >
                    <pre
                      class="text-xs font-mono text-muted-foreground overflow-x-auto"
                    ><code>{{ generateHtmlSnippet(task.results) }}</code></pre>
                    <div
                      class="flex items-center gap-1 mt-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Copy class="h-3 w-3" />
                      <span>Click to copy</span>
                    </div>
                  </button>
                </TabsContent>
                <TabsContent value="markdown" class="mt-2">
                  <div class="space-y-2">
                    <button
                      v-for="res in task.results"
                      :key="res.url"
                      @click="
                        copyToClipboard(
                          `![${res.type.toLowerCase()}](${res.url})`
                        )
                      "
                      class="w-full text-left p-3 bg-muted rounded-md hover:bg-muted/80 transition-colors cursor-pointer group flex items-center justify-between"
                      :title="`Click to copy ${res.type} Markdown`"
                    >
                      <pre
                        class="text-xs font-mono text-muted-foreground overflow-x-auto flex-1"
                      ><code>![{{ res.type.toLowerCase() }}]({{ res.url }})</code></pre>
                      <Copy
                        class="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
                      />
                    </button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </TransitionGroup>
    </div>
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
