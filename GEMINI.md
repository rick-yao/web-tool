# 项目上下文: Vue 图片压缩与 R2 上传工具

## 1. 项目概述
构建一个纯前端应用，允许用户上传图片，在浏览器端进行格式转换（WebP/AVIF）和压缩，然后将处理后的三个文件直接上传到 Cloudflare R2 存储桶，并返回访问链接。

## 2. 技术栈与开发规范

### 核心框架
- **框架:** Vue 3 (Composition API, `<script setup>`)
- **构建工具:** Vite
- **语言:** TypeScript
- **状态/工具库:** VueUse (`@vueuse/core`) - 用于处理 LocalStorage 持久化和常用 Hooks。

### UI 与样式
- **UI 组件库:** `shadcn-vue` (Shadcn UI 的 Vue 移植版)。
- **CSS 框架:** Tailwind CSS v4。
- **图标库:** `lucide-vue-next`。
- **设计风格:** 极简主义，单页应用。

### 工具链与格式化
- **代码规范/格式化:** Biome (`@biomejs/biome`)。
- **规则:** 严格遵守 Biome 默认规则。**严禁**使用 ESLint 或 Prettier。

### 推荐依赖
- **R2 交互:** `@aws-sdk/client-s3` (Cloudflare R2 兼容 S3 协议)。
- **图片处理:** `browser-image-compression` (用于压缩) 或原生 `Canvas API` (用于格式转换)。

## 3. 功能需求详情

### A. 配置管理 (Credentials)
1. **输入界面:** 创建一个设置面板（使用 Dialog 弹窗或侧边栏），包含以下字段：
   - Account ID (账户 ID)
   - Access Key ID
   - Secret Access Key
   - Bucket Name (存储桶名称)
   - Public Domain (自定义域名，可选，用于生成最终访问链接)
2. **持久化:** 使用 VueUse 的 `useStorage` 将这些敏感信息保存在浏览器的 `localStorage` 中。
3. **校验:** 在执行上传操作前，检查配置是否存在。

### B. 图片处理逻辑
当用户拖入或选择图片时，需生成 3 个版本的文件：
1. **文件 1 (WebP):** 将原图转换为 `image/webp` 格式 (质量: ~0.8)。
2. **文件 2 (AVIF):** 将原图转换为 `image/avif` 格式 (质量: ~0.8)。
   *注意：需检测浏览器是否支持 AVIF 编码，若不支持则需进行降级处理或提示。*
3. **文件 3 (压缩原图):** 保持原格式（JPG/PNG），但进行有损压缩以减小体积。

### C. 文件命名规则
所有 3 个文件应遵循统一命名格式：
- 格式: `[原文件名slug]_[时间戳].[扩展名]`
- 示例: 若原名为 `My Photo.jpg`，时间戳为 `1715693322`
  - `my-photo_1715693322.webp`
  - `my-photo_1715693322.avif`
  - `my-photo_1715693322.jpg` (压缩后的原图)

### D. Cloudflare R2 上传
1. 使用用户提供的密钥初始化 S3 Client。
2. Endpoint 格式: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`。
3. **并发上传:** 同时上传生成的 3 个文件。
4. **CORS 提示:** 如果上传失败，提示用户检查 R2 存储桶的 CORS 配置（需允许 PUT 方法）。

### E. 结果展示
1. 展示处理列表和状态（处理中 -> 上传中 -> 完成）。
2. 成功后，显示 3 个文件的最终 URL。
   - 如果配置了 `Public Domain`，链接为: `https://<Public Domain>/<filename>`
   - 否则使用默认 R2 链接。
3. 提供“一键复制”按钮。

## 4. UI/UX 设计规格
- **布局:**
  - 顶部导航栏：左侧标题，右侧“设置”图标按钮。
  - 核心区域：一个大的拖拽上传区域 (Dropzone)，使用 shadcn-vue 的 Card 组件设计。
  - 列表区域：上传区域下方展示处理结果卡片。
- **组件使用:**
  - `Button`, `Input`, `Label` (表单)
  - `Dialog` (设置弹窗)
  - `Progress` (上传进度条)
  - `Toast` (Sonner，用于成功/错误提示)

## 5. 编码准则
- **Vue 风格:** 必须使用 Composition API 和 `<script setup lang="ts">`。
- **模块化:**
  - 图片处理逻辑封装在 `composables/useImageProcessor.ts`。
  - 上传逻辑封装在 `composables/useR2Upload.ts`。
- **类型安全:** 严禁使用 `any`，所有 Props 和 Emits 必须定义类型。
