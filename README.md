# Tab Counter

[![Deno CI](https://github.com/ir77/tab-counter/actions/workflows/ci.yml/badge.svg)](https://github.com/ir77/tab-counter/actions/workflows/ci.yml)

# 概要

開いているタブの数をアイコンに表示するGoogle
Chrome拡張機能です。さらに、日々のタブ利用状況を統計として記録し、ポップアップで詳細を確認できます。

# 主な機能

- 現在開いているタブの総数を、拡張機能アイコンのバッジにリアルタイムで表示します。
- ポップアップで、以下の詳細な統計情報を確認できます。
  - 現在のタブ数
  - 今日の最高・最低タブ数
  - 前日のセッション終了時のタブ数

# 導入方法

1. このリポジトリをダウンロードまたはクローンします。
2. Chromeで `chrome://extensions` を開きます。
3. 右上の「デベロッパーモード」をオンにします。
4. 「パッケージ化されていない拡張機能を読み込む」をクリックし、このリポジトリの
   `dist` フォルダを選択します。

# 開発

このプロジェクトは [Deno](https://deno.land/) を使用して開発されています。

- [Deno](https://deno.land/manual/getting_started/installation)

## ビルド、テスト、フォーマット

以下のコマンドを実行すると、各種必要な処理がすべて実行されます。

```sh
deno task all
```

### E2Eテスト

実際のブラウザ環境でのE2Eテストを実行するには:

```sh
deno task build
deno task test:e2e
```

詳細については、[README_E2E_TESTING.md](./README_E2E_TESTING.md)を参照してください。

## TODO

### **拡張機能アイコンの追加 (Add Extension Icon)**

- [ ] `images` ディレクトリを作成し、`128x128` のアイコン (`icon128.png`)
      を追加する
- [ ] `48x48`, `32x32`, `16x16` の各サイズのアイコンを追加する
- [ ] `manifest.json` を更新し、全サイズのアイコンパスを登録する
