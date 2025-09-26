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

### テスト

テストの実行:

```sh
deno task test
```

### カバレッジ測定

コードカバレッジを測定して品質を確認できます。目標値は **80%以上** に設定されています。

#### 手動でのカバレッジ測定

```sh
# テストをカバレッジ測定付きで実行
deno task test:cov

# カバレッジレポートをコンソールに表示
deno task coverage

# HTMLレポートを生成（coverage/html/index.html）
deno task coverage:html

# LCOVファイルを生成（coverage/lcov.info）
deno task coverage:lcov
```

#### CI連携

GitHub ActionsでCIを実行する際に、カバレッジが自動的に測定されます：

- テスト実行時にカバレッジデータを収集
- カバレッジレポートの生成
- 80%未満の場合はCIが失敗

#### 公式ドキュメント

- [Deno Coverage コマンド公式ドキュメント](https://docs.deno.com/runtime/reference/cli/coverage/)
- [Deno Test コマンド公式ドキュメント](https://docs.deno.com/runtime/reference/cli/test/)

### TODO

#### **テストの拡充 (Test Expansion)**

- [ ] **`background.ts` の単体テスト**
  - [ ] `background_test.ts` のセットアップ (`chrome` API のモック)
  - [ ] `updateDailyStats` 関数のテストケースを追加する
  - [ ] `determineBadgeColor` 関数のテストケースを追加する
- [ ] **`popup.ts` の単体テスト**
  - [ ] `popup_test.ts` のセットアップ (DOM, `chrome.storage` API のモック)
  - [ ] UI更新関数 (`updateTabCountDisplay` 等) のテストケースを追加する
- [ ] **E2E (UI) テスト**
  - [ ] E2Eテストフレームワーク (Playwright等) の導入と設定
  - [ ] ポップアップ表示を確認する基本的なUIテスト (`ui_test.ts`) を作成する

#### **拡張機能アイコンの追加 (Add Extension Icon)**

- [ ] `images` ディレクトリを作成し、`128x128` のアイコン (`icon128.png`)
      を追加する
- [ ] `48x48`, `32x32`, `16x16` の各サイズのアイコンを追加する
- [ ] `manifest.json` を更新し、全サイズのアイコンパスを登録する
