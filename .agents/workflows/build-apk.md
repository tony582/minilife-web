---
description: 构建并部署 MiniLife Android APK（TWA 方案）
---

# 构建并部署 MiniLife Android APK

## 概述

MiniLife 的 Android APK 基于 **TWA (Trusted Web Activity)** 方案，本质上是用 Chrome 壳包装 PWA 网站。
APK 约 1.7MB，安装后全屏运行，体验和原生 App 一致。

## 前置条件

以下工具在首次构建时已安装，后续构建无需重新安装：

- **JDK 17**: `~/.bubblewrap/jdk/jdk-17.0.11+9/Contents/Home`
- **Android SDK**: `~/.bubblewrap/android_sdk`
- **Bubblewrap CLI**: `npm install -g @bubblewrap/cli`（包名是 `@bubblewrap/cli`）
- **签名密钥**: `android-apk/minilife.keystore`（密码: `minilife123`，别名: `minilife`）

> ⚠️ **重要**: `minilife.keystore` 是 APK 的签名密钥，丢失后无法更新 APK。请妥善备份。

## 快速构建（一键脚本）

// turbo
```bash
cd /Users/dulaidila/.gemini/antigravity/scratch/minilife/android-apk && ./build-apk.sh
```

脚本会自动完成：构建 → 签名 → 对齐 → 输出 `MiniLife.apk`

## 部署到服务器

// turbo
```bash
scp /Users/dulaidila/.gemini/antigravity/scratch/minilife/android-apk/MiniLife.apk root@47.103.125.200:/opt/minilife/dist/MiniLife.apk
```

密码: `Chenlu19880425!`

部署后用户即可从 `https://ml.minilife.online/install-guide.html` 下载最新 APK。

## 手动构建步骤（如脚本失败）

### 1. 设置环境变量

```bash
export JAVA_HOME=/Users/dulaidila/.bubblewrap/jdk/jdk-17.0.11+9/Contents/Home
export ANDROID_HOME=/Users/dulaidila/.bubblewrap/android_sdk
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/build-tools/35.0.0:$PATH"
```

### 2. Gradle 构建

```bash
cd /Users/dulaidila/.gemini/antigravity/scratch/minilife/android-apk
chmod +x gradlew
./gradlew assembleRelease
```

输出路径: `app/build/outputs/apk/release/app-release-unsigned.apk`

### 3. 对齐 APK

```bash
zipalign -v -p 4 app/build/outputs/apk/release/app-release-unsigned.apk app-release-aligned.apk
```

### 4. 签名 APK

```bash
apksigner sign \
  --ks minilife.keystore \
  --ks-pass pass:minilife123 \
  --key-pass pass:minilife123 \
  --ks-key-alias minilife \
  --out MiniLife.apk \
  app-release-aligned.apk
```

### 5. 验证签名

```bash
apksigner verify MiniLife.apk
```

### 6. 上传到服务器

```bash
scp MiniLife.apk root@47.103.125.200:/opt/minilife/dist/MiniLife.apk
```

## 版本更新

如果需要更新 APK 版本号（比如上架应用商店后要求递增）：

1. 编辑 `android-apk/twa-manifest.json`
   - `appVersionCode`: 递增（如 1 → 2）
   - `appVersionName`: 语义化版本号（如 "1.0.0" → "1.1.0"）

2. 编辑 `android-apk/app/build.gradle`
   - 更新 `versionCode` 和 `versionName`

3. 重新运行构建脚本

## 关键文件说明

| 文件 | 说明 |
|------|------|
| `android-apk/twa-manifest.json` | TWA 配置（包名、域名、颜色、图标等） |
| `android-apk/minilife.keystore` | APK 签名密钥（⚠️ 务必备份） |
| `android-apk/build.gradle` | Gradle 构建配置 |
| `android-apk/build-apk.sh` | 一键构建脚本 |
| `public/.well-known/assetlinks.json` | Digital Asset Links（域名和 APK 的绑定） |
| `public/install-guide.html` | 安装引导页（含 APK 下载按钮） |

## Digital Asset Links

`public/.well-known/assetlinks.json` 将域名 `ml.minilife.online` 和 APK 的签名证书绑定。
这样 Android 打开 APK 时不会显示 Chrome 地址栏（全屏 TWA 模式）。

如果更换了签名密钥，需要重新获取 SHA256 指纹并更新：

```bash
keytool -list -v -keystore minilife.keystore -storepass minilife123 -alias minilife | grep SHA256
```

## 服务器 Nginx 配置

已在 `/etc/nginx/sites-available/minilife` 中添加：

```nginx
# APK 下载
location ~ \.apk$ {
    add_header Content-Type "application/vnd.android.package-archive";
    add_header Content-Disposition "attachment";
    try_files $uri =404;
}

# Digital Asset Links
location /.well-known/ {
    add_header Content-Type "application/json";
    try_files $uri =404;
}
```

## 常见问题

### Q: Bubblewrap init 卡在交互式提示怎么办？
不要用 `bubblewrap init`，直接手动编辑 `twa-manifest.json` + 运行 `./gradlew assembleRelease`。

### Q: `androidSdk isn't correct` 错误？
确保 `~/.bubblewrap/android_sdk/bin` 目录存在（是 `cmdline-tools/latest/bin` 的软链接）。

### Q: APK 安装后显示 Chrome 地址栏？
检查 `assetlinks.json` 是否能通过 `https://ml.minilife.online/.well-known/assetlinks.json` 访问，
且其中的 SHA256 指纹和 keystore 中的一致。
