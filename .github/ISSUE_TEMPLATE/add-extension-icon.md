---
name: 拡張機能アイコンの追加 (Add Extension Icon)
about: 拡張機能用のアイコンファイルを追加
title: '[FEATURE] 拡張機能アイコンの追加'
labels: ['enhancement', 'ui']
assignees: ''

---

## 概要
Tab Counter拡張機能に適切なアイコンを追加し、Chrome Web Storeや拡張機能一覧で視認性を向上させます。

## 実装対象

### アイコンファイルの作成
- [ ] `images` ディレクトリを作成
- [ ] `128x128` のアイコン (`icon128.png`) を追加する
- [ ] `48x48` のアイコン (`icon48.png`) を追加する  
- [ ] `32x32` のアイコン (`icon32.png`) を追加する
- [ ] `16x16` のアイコン (`icon16.png`) を追加する

### manifest.json の更新
- [ ] `manifest.json` を更新し、全サイズのアイコンパスを登録する
- [ ] `action.default_icon` セクションを追加する
- [ ] `icons` セクションを追加する

## 期待される成果
- 拡張機能が適切なアイコンで表示される
- Chrome Web Store公開準備が整う
- ユーザビリティの向上

## デザイン要件
- タブカウント機能が視覚的に分かるデザイン
- Chromeの拡張機能アイコンガイドラインに準拠
- シンプルで認識しやすいデザイン

## 技術要件
- PNG形式
- 各サイズで適切な解像度
- manifest.json V3の仕様に準拠