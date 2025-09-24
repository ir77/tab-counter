---
name: background.ts の単体テスト実装
about: background.ts の関数の単体テストを追加
title: '[TEST] background.ts の単体テスト実装'
labels: ['testing', 'unit-test']
assignees: ''

---

## 概要
`background.ts` の主要関数について単体テストを実装します。

## 実装対象

### セットアップ
- [ ] `background_test.ts` のセットアップ (`chrome` API のモック)
- [ ] Chrome APIs (`chrome.tabs`, `chrome.storage`, `chrome.action`) のモック作成

### テスト対象関数
- [ ] `calculateUpdatedStats` 関数のテストケースを追加する
  - 新しい日の統計情報作成
  - 既存の日の統計情報更新  
  - 前日タブ数の記録
- [ ] `determineBadgeColor` 関数のテストケースを追加する
  - タブ数5以下で緑
  - 前日タブ数以下で緑
  - 今日の最低タブ数以下で緑
  - その他の場合で赤

### テストケース例
```typescript
Deno.test("calculateUpdatedStats - 新しい日の場合", () => {
  // テスト実装
});

Deno.test("determineBadgeColor - タブ数5以下", () => {
  // テスト実装  
});
```

## 関連ファイル
- `src/background.ts`
- `src/background_test.ts`
- `src/types.ts`

## 完了条件
- [ ] すべての関数がテストされている
- [ ] エッジケースが考慮されている
- [ ] `deno test` でテストが成功する