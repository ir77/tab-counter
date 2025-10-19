# E2Eテストガイド

このドキュメントでは、Tab Counter Chrome拡張機能のE2E（エンドツーエンド）テストについて説明します。

## 概要

E2EテストはPuppeteerを使用して、実際のChromeブラウザ環境で拡張機能をテストします。これにより、以下のような実際の動作を検証できます:

- 拡張機能が正常にロードされること
- タブの開閉時にchrome.storage.localが正しく更新されること
- dailyStatsが正確に記録されること
- バッジカウントが正しく表示されること

## 前提条件

E2Eテストを実行するには、以下が必要です:

1. **Deno**: バージョン2.0以上
2. **Chrome/Chromium**: システムにインストールされていること
3. **ビルド済みの拡張機能**: `dist`フォルダに拡張機能がビルドされていること

## テストの実行

### 1. 拡張機能のビルド

E2Eテストを実行する前に、拡張機能をビルドする必要があります:

```sh
deno task build
```

### 2. E2Eテストの実行

E2Eテストを実行するには、以下のコマンドを使用します:

```sh
deno task test:e2e
```

このコマンドは、Chromeブラウザを起動し、拡張機能をロードして、テストを実行します。

**注意**: E2Eテストは`headless: false`モードで実行されるため、ブラウザウィンドウが表示されます。これは、Chrome拡張機能のテストにはheadlessモードが使用できないためです。

### 3. CI環境での実行

CI環境では、E2Eテストはデフォルトでスキップされます。これは、CI環境でGUIブラウザを起動することが困難なためです。

CI環境でE2Eテストを実行したい場合は、以下の設定が必要です:

- Xvfb（仮想フレームバッファ）のセットアップ
- Chromeのインストール
- `CI`環境変数を設定しない、またはテストの`ignore`フラグを調整

## テストファイル

### `src/background_e2e_test.ts`

このファイルには、background.tsのE2Eテストが含まれています:

1. **拡張機能のロード確認**: 拡張機能が正常にロードされ、Service Workerが起動することを確認
2. **タブ数のカウント**: タブを開閉したときに、chrome.storage.localのtabCountが更新されることを確認
3. **dailyStatsの記録**: dailyStatsが正しく保存され、適切なフィールド（date, high, low）を持つことを確認
4. **複数タブの処理**: 複数のタブを開閉しても、カウントが正確に追跡されることを確認

## テストヘルパー関数

### `launchBrowserWithExtension()`

Chrome拡張機能をロードしてPuppeteerブラウザインスタンスを起動します。

```typescript
const browser = await launchBrowserWithExtension();
```

### `getChromeStorageLocal(browser)`

拡張機能のchrome.storage.localの内容を取得します。

```typescript
const storage = await getChromeStorageLocal(browser);
console.log(storage.tabCount); // 現在のタブ数
console.log(storage.dailyStats); // 日次統計
```

### `sleep(ms)`

指定したミリ秒待機します。バックグラウンドスクリプトの処理を待つために使用します。

```typescript
await sleep(500); // 500ms待機
```

## トラブルシューティング

### Chromeが見つからない

Puppeteerが使用するChromeが見つからない場合、環境変数`PUPPETEER_EXECUTABLE_PATH`でChromeのパスを指定できます:

```sh
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
deno task test:e2e
```

### タイムアウトエラー

テストがタイムアウトする場合は、`sleep()`の待機時間を増やしてください。遅いマシンでは、バックグラウンドスクリプトの処理に時間がかかる場合があります。

### Service Workerが見つからない

拡張機能が正しくビルドされていることを確認してください:

```sh
deno task build
ls dist/ # manifest.json, background.js などが存在することを確認
```

## ベストプラクティス

1. **テストの独立性**: 各テストは独立して実行できるようにし、他のテストに依存しないようにします
2. **適切な待機時間**: バックグラウンドスクリプトの処理を待つために、`sleep()`を使用します
3. **リソースのクリーンアップ**: テストの最後に必ず`browser.close()`を呼び出します
4. **エラーハンドリング**: `try-finally`ブロックを使用して、エラーが発生してもブラウザを閉じるようにします

## 今後の拡張

E2Eテストフレームワークは、以下のような追加テストに拡張できます:

- **ポップアップUI**: ポップアップを開いて、表示される統計情報を確認
- **バッジのテスト**: chrome.action.setBadgeText()が正しく呼び出されることを確認
- **日付変更のテスト**: 日付が変わったときのlastPreviousDayCountの動作を確認
- **パフォーマンステスト**: 大量のタブを開閉したときのパフォーマンスを測定

## 参考リンク

- [Puppeteer公式ドキュメント](https://pptr.dev/)
- [Chrome Extensions Testing](https://developer.chrome.com/docs/extensions/mv3/tut_debugging/)
- [Deno Testing](https://deno.land/manual/basics/testing)
