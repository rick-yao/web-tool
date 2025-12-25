<script setup lang="ts">
import { ref } from 'vue';
import { Settings } from 'lucide-vue-next';
import type { R2Config } from '@/composables/useR2Upload';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const props = defineProps<{
  config: R2Config;
}>();

const isOpen = ref(false);

const save = () => {
  isOpen.value = false;
};
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger as-child>
      <Button variant="ghost" size="icon">
        <Settings class="h-5 w-5" />
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Cloudflare R2 Settings</DialogTitle>
        <DialogDescription>
          Configure your Cloudflare R2 credentials here. All fields are required except Public Domain.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="accountId" class="text-right">Account ID</Label>
          <Input id="accountId" v-model="props.config.accountId" class="col-span-3" placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="accessKey" class="text-right">Access Key</Label>
          <Input id="accessKey" v-model="props.config.accessKeyId" class="col-span-3" type="password" placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="secretKey" class="text-right">Secret Key</Label>
          <Input id="secretKey" v-model="props.config.secretAccessKey" class="col-span-3" type="password" placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="bucket" class="text-right">Bucket Name</Label>
          <Input id="bucket" v-model="props.config.bucketName" class="col-span-3" placeholder="my-bucket" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="domain" class="text-right">Public Domain</Label>
          <Input id="domain" v-model="props.config.publicDomain" placeholder="cdn.example.com (optional)" class="col-span-3" />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" @click="save">Save changes</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
