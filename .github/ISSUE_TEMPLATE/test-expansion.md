---
name: テストの拡充 (Test Expansion)
about: 単体テストとE2Eテストの充実
title: '[FEATURE] テストの拡充'
labels: ['enhancement', 'testing']
assignees: ''

---

## 概要
Tab Counter拡張機能のテスト体制を充実させるため、単体テストとE2Eテストを追加します。

## 実装対象

### `background.ts` の単体テスト
- [ ] `background_test.ts` のセットアップ (`chrome` API のモック)
- [ ] `updateDailyStats` 関数のテストケースを追加する  
- [ ] `determineBadgeColor` 関数のテストケースを追加する

### `popup.ts` の単体テスト
- [ ] `popup_test.ts` のセットアップ (DOM, `chrome.storage` API のモック)
- [ ] UI更新関数 (`updateTabCountDisplay` 等) のテストケースを追加する

### E2E (UI) テスト
- [ ] E2Eテストフレームワーク (Playwright等) の導入と設定
- [ ] ポップアップ表示を確認する基本的なUIテスト (`ui_test.ts`) を作成する

## 期待される成果
- 各関数の動作が正確にテストされる
- UIの動作が自動的に検証される
- CI/CDでのテスト自動実行体制の確立

## 補足事項
- Chrome APIのモック作成が必要
- DOM操作のテスト環境構築が必要
- E2Eテスト用の拡張機能読み込み環境が必要