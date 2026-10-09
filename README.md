# Sike. — Growth-ready prototype core

Sike.は、将来の個人AI「Nagi.」へつながる自立型AIの試作コア。原型Sike.を保存し、コピーしたNagi.試作で自律的な学習・改善ループを検証する方針。

## 今ある土台
- 会話・会話履歴・Web検索の参照元表示
- AIモデル接続層の分離
- 端末内ジャーナル（経験・振り返り・改善案・実験・観察ログ）
- 改善案の候補を作る bounded observation cycle
- ジャーナルのJSONバックアップ書き出し・復元
- 変更ポリシーの基礎。コード変更は自動適用しない

## 重要な制約
- ジャーナルはブラウザの `localStorage` に保存される。ブラウザデータの消去・容量制限に備え、定期的にバックアップすること。
- 自己観察機能はログから改善候補を作るだけで、コードを書き換えたり、モデルの重みを学習させたりしない。
- サーバー側の永続記憶、ローカルモデルアダプター、自律的なコード改修ループは未実装。
- GitHubへの反映と、Vercelなどの公開環境へのデプロイは別作業。

## ファイル構成
- `core/agent.js` — エージェントと行動原則
- `core/memory.js` — ジャーナルとバックアップ
- `core/reflection.js` — 振り返り、改善案、実験記録
- `core/learning.js` — 記録を観察して改善候補を作る
- `core/policy.js` — 変更案の確認ポリシー
- `providers/` — AIモデル接続層
- `api/` — 会話API
- `index.html` — 会話UIと成長ジャーナル

## 環境変数
- `OPENAI_API_KEY`
- `AI_PROVIDER=openai`
- `AI_MODEL` — APIアカウントで利用可能なモデル名
- `AUTO_WEB_SEARCH=true|false`
- `MAX_OUTPUT_TOKENS=1200`

秘密情報をフロントエンドやGitへ保存しない。変更は小さくテストし、スナップショットと復旧手段を維持する。
