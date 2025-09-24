---
name: E2E (UI) テストの実装
about: End-to-End UIテストの導入と実装
title: '[TEST] E2E (UI) テストの実装'
labels: ['testing', 'e2e', 'ui']
assignees: ''

---

## 概要
Tab Counter拡張機能のE2E (End-to-End) テストを実装し、実際のブラウザ環境でのUIテストを自動化します。

## 実装対象

### テストフレームワークの導入
- [ ] E2Eテストフレームワーク (Playwright等) の導入と設定
- [ ] Chrome拡張機能テスト用の設定
- [ ] テスト実行環境の構築

### テストケースの実装
- [ ] ポップアップ表示を確認する基本的なUIテスト (`ui_test.ts`) を作成する
  - 拡張機能アイコンクリックでポップアップが開く
  - タブ数が正しく表示される
  - 統計情報が表示される
- [ ] タブ操作のテストケース
  - タブを開く/閉じる操作での表示更新
  - バッジテキストの更新確認
  - バッジ色の変更確認

### テスト環境設定
```javascript
// Playwright設定例
test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    // 拡張機能の読み込み
  });
});
```

## 技術要件
- [ ] Chrome/Chromium での拡張機能読み込み
- [ ] ヘッドレスモードでの実行対応
- [ ] CI/CD環境での実行対応

## 関連ファイル
- 新規: `tests/e2e/ui_test.ts`
- 新規: `playwright.config.ts` (設定ファイル)
- `src/popup.html`
- `src/popup.ts`
- `src/background.ts`

## 完了条件
- [ ] E2Eテストが正常に実行される
- [ ] 主要なUI操作がテストされている
- [ ] CI/CDでテストが自動実行される