# Web Toolbox

[English](#english) | [中文](#中文)

---

<a name="english"></a>

## English

### 📋 Overview

Web Toolbox is a modern web application that provides various image processing tools. Currently featuring an advanced Image Optimizer that automatically converts and optimizes images to modern formats (WEBP and AVIF) and uploads them to Cloudflare R2 storage.

### ✨ Features

- **Image Format Conversion**: Automatically converts JPG, PNG, and WEBP images to optimized WEBP and AVIF formats
- **Cloudflare R2 Integration**: Direct upload to R2 object storage with public URL generation
- **Drag & Drop Interface**: Easy-to-use drag-and-drop or click-to-upload interface
- **Real-time Progress Tracking**: Monitor processing and uploading progress for each image
- **Code Snippet Generation**: Automatically generates HTML `<picture>` tags and Markdown snippets
- **Modern UI**: Built with Vue 3, Tailwind CSS, and shadcn-vue components
- **Extensible Architecture**: Designed to support multiple tools (more coming soon)

### 🚀 Tech Stack

- **Frontend Framework**: Vue 3 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix Vue + shadcn-vue
- **Image Processing**: @jsquash (AVIF, WEBP, PNG)
- **Cloud Storage**: AWS SDK for Cloudflare R2
- **Icons**: Lucide Vue Next

### 📦 Installation

```bash
# Clone the repository
git clone https://github.com/rick-yao/web-tool.git
cd web-tool

# Install dependencies (using pnpm)
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install
```

### 🔧 Configuration

Before using the Image Optimizer, you need to configure your Cloudflare R2 credentials:

1. Click the settings (⚙️) icon in the application
2. Fill in the following information:
   - **Account ID**: Your Cloudflare account ID
   - **Access Key ID**: R2 access key ID
   - **Secret Access Key**: R2 secret access key
   - **Bucket Name**: Your R2 bucket name
   - **Public Domain**: Your R2 public domain (e.g., `https://img.example.com`)

All settings are stored locally in your browser.

### 🛠️ Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### 📝 Usage

1. **Configure R2 Settings**: Click the settings icon and enter your R2 credentials
2. **Upload Images**: Drag and drop images or click to select files
3. **Processing**: The tool will automatically:
   - Convert images to WEBP and AVIF formats
   - Upload all versions to R2
   - Generate public URLs
4. **Get Code**: Copy the generated HTML or Markdown snippets for use in your projects

### 🏗️ Project Structure

```
web-tool/
├── src/
│   ├── components/
│   │   ├── ImageOptimizer.vue    # Main image optimizer component
│   │   ├── SettingsDialog.vue     # R2 settings dialog
│   │   └── ui/                    # shadcn-vue UI components
│   ├── composables/
│   │   ├── useImageProcessor.ts   # Image processing logic
│   │   └── useR2Upload.ts         # R2 upload logic
│   ├── App.vue                    # Root component
│   └── main.ts                    # Application entry point
├── public/
│   └── _headers                   # Cloudflare Pages headers config
├── package.json
└── vite.config.ts
```

### 📄 License

MIT

---

<a name="中文"></a>

## 中文

### 📋 概述

Web Toolbox 是一个现代化的 Web 应用程序，提供各种图像处理工具。目前提供高级图像优化器功能，可自动将图像转换并优化为现代格式（WEBP 和 AVIF），并上传到 Cloudflare R2 存储。

### ✨ 功能特性

- **图像格式转换**：自动将 JPG、PNG 和 WEBP 图像转换为优化的 WEBP 和 AVIF 格式
- **Cloudflare R2 集成**：直接上传到 R2 对象存储并生成公共 URL
- **拖放界面**：易于使用的拖放或点击上传界面
- **实时进度跟踪**：监控每张图像的处理和上传进度
- **代码片段生成**：自动生成 HTML `<picture>` 标签和 Markdown 代码片段
- **现代化界面**：使用 Vue 3、Tailwind CSS 和 shadcn-vue 组件构建
- **可扩展架构**：设计支持多种工具（更多功能即将推出）

### 🚀 技术栈

- **前端框架**：Vue 3 + TypeScript
- **构建工具**：Vite 7
- **样式**：Tailwind CSS 4
- **UI 组件**：Radix Vue + shadcn-vue
- **图像处理**：@jsquash (AVIF, WEBP, PNG)
- **云存储**：AWS SDK for Cloudflare R2
- **图标**：Lucide Vue Next

### 📦 安装

```bash
# 克隆仓库
git clone https://github.com/rick-yao/web-tool.git
cd web-tool

# 安装依赖（使用 pnpm）
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

### 🔧 配置

使用图像优化器之前，需要配置 Cloudflare R2 凭证：

1. 点击应用程序中的设置（⚙️）图标
2. 填写以下信息：
   - **Account ID**：您的 Cloudflare 账户 ID
   - **Access Key ID**：R2 访问密钥 ID
   - **Secret Access Key**：R2 秘密访问密钥
   - **Bucket Name**：您的 R2 存储桶名称
   - **Public Domain**：您的 R2 公共域名（例如：`https://img.example.com`）

所有设置都存储在浏览器本地。

### 🛠️ 开发

```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

### 📝 使用方法

1. **配置 R2 设置**：点击设置图标并输入您的 R2 凭证
2. **上传图像**：拖放图像或点击选择文件
3. **处理中**：工具将自动：
   - 将图像转换为 WEBP 和 AVIF 格式
   - 上传所有版本到 R2
   - 生成公共 URL
4. **获取代码**：复制生成的 HTML 或 Markdown 代码片段以在您的项目中使用

### 🏗️ 项目结构

```
web-tool/
├── src/
│   ├── components/
│   │   ├── ImageOptimizer.vue    # 主图像优化器组件
│   │   ├── SettingsDialog.vue     # R2 设置对话框
│   │   └── ui/                    # shadcn-vue UI 组件
│   ├── composables/
│   │   ├── useImageProcessor.ts   # 图像处理逻辑
│   │   └── useR2Upload.ts         # R2 上传逻辑
│   ├── App.vue                    # 根组件
│   └── main.ts                    # 应用入口点
├── public/
│   └── _headers                   # Cloudflare Pages 头配置
├── package.json
└── vite.config.ts
```

### 📄 许可证

MIT