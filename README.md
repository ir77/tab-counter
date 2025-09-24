# Tab Counter

## 概要

開いているタブの数をアイコンに表示するGoogle
Chrome拡張機能です。さらに、日々のタブ利用状況を統計として記録し、ポップアップで詳細を確認できます。

## 主な機能

- 現在開いているタブの総数を、拡張機能アイコンのバッジにリアルタイムで表示します。
- ポップアップで、以下の詳細な統計情報を確認できます。
  - 現在のタブ数
  - 今日の最高・最低タブ数
  - 前日のセッション終了時のタブ数

## 導入方法

1. このリポジトリをダウンロードまたはクローンします。
2. Chromeで `chrome://extensions` を開きます。
3. 右上の「デベロッパーモード」をオンにします。
4. 「パッケージ化されていない拡張機能を読み込む」をクリックし、このリポジトリの
   `dist` フォルダを選択します。

## 開発

このプロジェクトは [Deno](https://deno.land/) を使用して開発されています。

- [Deno](https://deno.land/manual/getting_started/installation)

### ビルド

以下のコマンドを実行すると、`src` ディレクトリのソースコードがビルドされ、`dist`
ディレクトリに成果物が出力されます。

```sh
deno task build
```

### 開発課題

このプロジェクトの開発課題は GitHub Issues で管理されています。新しい課題や機能要望がある場合は、以下のテンプレートを使用して Issue を作成してください。

#### 主要な開発課題

**テスト関連**
- [テストの拡充 (Test Expansion)](.github/ISSUE_TEMPLATE/test-expansion.md) - 単体テストとE2Eテストの実装
  - [background.ts の単体テスト](.github/ISSUE_TEMPLATE/background-unit-test.md)
  - [popup.ts の単体テスト](.github/ISSUE_TEMPLATE/popup-unit-test.md)
  - [E2E (UI) テスト](.github/ISSUE_TEMPLATE/e2e-ui-test.md)

**UI/UX改善**
- [拡張機能アイコンの追加 (Add Extension Icon)](.github/ISSUE_TEMPLATE/add-extension-icon.md) - アイコンファイルの作成と設定
  - [アイコンファイルの作成](.github/ISSUE_TEMPLATE/create-icon-files.md)
  - [manifest.json の更新（アイコン設定）](.github/ISSUE_TEMPLATE/update-manifest-json.md)

#### Issue の作成方法

1. [Issues ページ](https://github.com/ir77/tab-counter/issues) にアクセス
2. "New issue" をクリック
3. 適切なテンプレートを選択
4. 必要な情報を入力して作成
