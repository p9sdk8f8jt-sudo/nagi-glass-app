# Sike.

Sike.は、将来の個人AI「Nagi.」へつながる自立型AIの試作コア。

## 現在
- 会話
- 会話履歴
- AIプロバイダ分離
- 自動Web検索（AIが必要と判断した場合）
- 検索結果の参照元表示
- 将来のツール追加を前提にした構造

## 構成
- core/ — Sike.の人格・エージェント制御
- providers/ — AIモデル接続層
- api/ — Web API
- index.html — UI

## 環境変数
- OPENAI_API_KEY
- AI_PROVIDER=openai
- AI_MODEL=gpt-6-luna
- AUTO_WEB_SEARCH=true
- MAX_OUTPUT_TOKENS=1200

AI_MODELを変更すれば、将来対応する別モデルへ差し替えられる設計。
