#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
JAVA_HOME="$HOME/.bubblewrap/jdk/jdk-17.0.11+9/Contents/Home"
ANDROID_HOME="$HOME/.bubblewrap/android_sdk"
KEYSTORE="$SCRIPT_DIR/minilife.keystore"
KEYSTORE_PASS="minilife123"
KEY_ALIAS="minilife"
OUTPUT_APK="$SCRIPT_DIR/MiniLife.apk"

export JAVA_HOME ANDROID_HOME
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/build-tools/35.0.0:$PATH"

echo "🔍 检查环境..."
[ ! -d "$JAVA_HOME" ] && echo "❌ JDK未找到" && exit 1
[ ! -f "$KEYSTORE" ] && echo "❌ 签名密钥未找到" && exit 1
echo "✅ JDK: $(java -version 2>&1 | head -1)"

echo "🔨 Gradle构建..."
cd "$SCRIPT_DIR" && chmod +x gradlew && ./gradlew assembleRelease --quiet

UNSIGNED="$SCRIPT_DIR/app/build/outputs/apk/release/app-release-unsigned.apk"
[ ! -f "$UNSIGNED" ] && echo "❌ 构建失败" && exit 1

echo "📐 对齐..."
zipalign -f -p 4 "$UNSIGNED" "$SCRIPT_DIR/aligned.apk"

echo "🔐 签名..."
apksigner sign --ks "$KEYSTORE" --ks-pass "pass:$KEYSTORE_PASS" --key-pass "pass:$KEYSTORE_PASS" --ks-key-alias "$KEY_ALIAS" --out "$OUTPUT_APK" "$SCRIPT_DIR/aligned.apk"

echo "🔍 验证..." && apksigner verify "$OUTPUT_APK"
rm -f "$SCRIPT_DIR/aligned.apk"

echo ""
echo "🎉 构建成功! $(du -h "$OUTPUT_APK" | cut -f1) → $OUTPUT_APK"
echo "部署: scp $OUTPUT_APK root@47.103.125.200:/opt/minilife/dist/MiniLife.apk"
