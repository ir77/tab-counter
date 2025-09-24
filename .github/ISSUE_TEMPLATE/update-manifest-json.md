---
name: manifest.json の更新（アイコン設定）
about: manifest.json にアイコンパスを追加
title: '[CONFIG] manifest.json の更新（アイコン設定）'
labels: ['configuration']
assignees: ''

---

## 概要
`manifest.json` を更新して、作成されたアイコンファイルを適切に設定します。

## 実装対象

### `icons` セクションの追加
```json
{
  "icons": {
    "16": "images/icon16.png",
    "32": "images/icon32.png", 
    "48": "images/icon48.png",
    "128": "images/icon128.png"
  }
}
```

### `action.default_icon` セクションの追加
```json
{
  "action": {
    "default_title": "Tab Counter",
    "default_popup": "popup.html",
    "default_icon": {
      "16": "images/icon16.png",
      "32": "images/icon32.png",
      "48": "images/icon48.png",
      "128": "images/icon128.png"
    }
  }
}
```

## 変更対象ファイル
- `src/manifest.json`

## 技術要件
- Manifest V3 の仕様に準拠
- 各サイズのアイコンパスが正確に設定されている
- 既存の設定を壊さない

## 期待される結果
- [ ] 拡張機能一覧でアイコンが表示される
- [ ] ツールバーでアイコンが表示される
- [ ] Chrome Web Store での表示が改善される

## 関連Issue
- アイコンファイルの作成 (#XX)
- 拡張機能アイコンの追加 (#XX)

## 完了条件
- [ ] `manifest.json` が正しく更新されている
- [ ] 拡張機能が正常に読み込まれる
- [ ] アイコンがすべてのサイズで適切に表示される