<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { ref } from 'vue';
import type { R2Config } from '@/composables/useR2Upload';

const config = useStorage<R2Config>('r2-config', {
  accountId: '',
  accessKeyId: '',
  secretAccessKey: '',
  bucketName: '',
  publicDomain: '',
});

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
        <DialogTitle>Settings</DialogTitle>
        <DialogDescription>
          Configure your Cloudflare R2 credentials here.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="accountId" class="text-right">Account ID</Label>
          <Input id="accountId" v-model="config.accountId" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="accessKey" class="text-right">Access Key</Label>
          <Input id="accessKey" v-model="config.accessKeyId" class="col-span-3" type="password" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="secretKey" class="text-right">Secret Key</Label>
          <Input id="secretKey" v-model="config.secretAccessKey" class="col-span-3" type="password" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="bucket" class="text-right">Bucket</Label>
          <Input id="bucket" v-model="config.bucketName" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="domain" class="text-right">Domain</Label>
          <Input id="domain" v-model="config.publicDomain" placeholder="e.g., cdn.example.com" class="col-span-3" />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" @click="save">Save changes</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
