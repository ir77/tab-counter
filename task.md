# Node + Vite 方式への完全移行タスク

## 0. 前提・ゴール
- 現行: Deno + TypeScript + Manifest V3。
- 目標: Node.js + Vite をベースにビルド、Vitest + Playwright でテストを回せる状態にする。
- 成果物: npm scripts によるビルド/テスト/フォーマット、CI 連携、ドキュメント更新まで完了。
- 何か問題があれば、このtask.mdを更新しながら進める。

## 1. フェーズ別タスク

### フェーズ1: 現状棚卸し (1日)
- [ ] Deno 専用 API 利用箇所の洗い出し (env, fs, URL imports など)。
- [ ] `deno.json` 内タスク・lint 設定の整理。
- [ ] Chrome 拡張ビルドの成果物 (配置/命名) を記録。

### フェーズ2: Node + Vite 足場構築 (2日)
- [ ] `package.json` 作成 (Node 20 LTS 前提、npm scripts ひな形追加)。
- [ ] `tsconfig.*` と Vite 設定 (`vite.config.ts`) 追加。Manifest や HTML のエントリ設定。
- [ ] ESLint/Prettier などフォーマット/静的解析ツール導入方針を決め、設定投入。
- [ ] `npm run dev`/`build`/`lint`/`fmt`/`test` の最小スクリプトを定義。

### フェーズ3: ソース変換 (3日)
- [ ] Deno 特有の import URL や `.ts` 拡張子指定を Node 解決方式へ変更。
- [ ] `@types/chrome` など型依存を追加し、型エラーを解消。
- [ ] Vite ビルドで生成される `dist/` を Chrome 拡張として読み込めるか手動確認。
- [ ] 不要となる Deno 固有ファイル (`deno.json`, `build.ts` 等) の削除計画を立案。

### フェーズ4: テスト基盤再構築 (3日)
- [ ] `vitest.config.ts` を作成し、ユニットテスト1本を移植 (Red/Green/Refactor を記録)。
- [ ] Chrome API モックを `setupFiles` で集中管理。
- [ ] Playwright の設定を Node 用に調整し、E2E 1本を npm 経由で動作確認。
- [ ] `npm run test:unit` / `npm run test:e2e` を確立し、`npm run test` で統合。

### フェーズ5: CI・ドキュメント更新 (2日)
- [ ] CI (GitHub Actions 等) を npm コマンドへ置換し、`npm run all` で lint/build/test を実行。
- [ ] `README.md` / `AGENTS.md` / 開発手順に Node + Vite 前提の指南を反映。
- [ ] `deno task all` の記述を削除し、新コマンドへ誘導。

### フェーズ6: 検証 & クリーンアップ (1日)
- [ ] 主要ユースケース (バッジ表示/タブカウント) を手動 + E2E で回帰確認。
- [ ] 不要ファイル削除と `.gitignore` 更新。
- [ ] 依存バージョン固定 (package-lock.json 生成) と最終レビュー。

## 2. リスクと対策
| リスク | 対策 |
| --- | --- |
| Vite 変換後の成果物差異 | 既存 dist と比較、Playwright で早期検出 |
| Node 移行による依存肥大 | Vite の `manualChunks` や `optimizeDeps` 調整 |
| テストモック漏れ | Vitest `setupFiles` に Chrome API モックテンプレートを作成 |
| CI での Playwright 環境不足 | `npx playwright install --with-deps` を CI 前段に追加 |

## 3. 成功条件
- `npm run build` で Chrome 拡張パッケージが生成され、実機読み込み可能。
- `npm run test` が Vitest + Playwright を通過。
- CI がグリーンで、README/AGENTS が Node + Vite 手順に更新済み。

以上をベースに Baby Steps/TDD を守りつつ進行します。
