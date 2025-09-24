---
name: popup.ts の単体テスト実装
about: popup.ts の UI関数の単体テストを追加
title: '[TEST] popup.ts の単体テスト実装'
labels: ['testing', 'unit-test', 'ui']
assignees: ''

---

## 概要
`popup.ts` のUI更新関数について単体テストを実装します。

## 実装対象

### セットアップ
- [ ] `popup_test.ts` のセットアップ (DOM, `chrome.storage` API のモック)
- [ ] DOM環境の構築（jsdom等）
- [ ] `chrome.storage` API のモック作成

### テスト対象関数
- [ ] `updateTabCountDisplay` 関数のテストケース
  - 正常な数値表示
  - undefined時の"..."表示
  - null要素時の安全な処理
- [ ] `updateDailyStatsDisplay` 関数のテストケース
  - 統計データの正常表示
  - undefined時の"..."表示
  - null要素時の安全な処理
- [ ] `updatePreviousDayDisplay` 関数のテストケース
  - 前日データの表示/非表示切り替え
  - データがある場合の表示
  - データがない場合の非表示

### DOM要素のモック
```typescript
// DOM要素のモック例
const mockDocument = {
  getElementById: (id: string) => {
    // モック実装
  }
};
```

## 関連ファイル
- `src/popup.ts`
- `src/popup_test.ts`
- `src/popup.html`
- `src/types.ts`

## 完了条件
- [ ] すべてのUI更新関数がテストされている
- [ ] エラーハンドリングが適切にテストされている
- [ ] `deno test` でテストが成功する