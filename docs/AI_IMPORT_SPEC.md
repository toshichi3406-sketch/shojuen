# SHOJUEN WORKBOARD AI Import Specification

This specification is shared by ChatGPT and Claude.

## Purpose

At the end of a work session, the AI should summarize only WORKBOARD-relevant facts and proposals into structured JSON.

The JSON is imported into the WORKBOARD "AI取込候補" inbox first. It must never write directly to authoritative business tables.

## Safety rules

1. Do not infer prices, MOQ, shipping terms, payment terms, lead times, or other commercial terms.
2. Price-related information must always use candidate_type = "price_candidate" and remain a candidate until owner/admin approval.
3. Historical emails/chats are references only. They are not authoritative commercial terms.
4. If a fact is uncertain, mark it in payload as "要確認" and reduce confidence.
5. Do not invent customer IDs, product IDs, document IDs, dates, or statuses.
6. If an existing ID is unknown, omit target_id rather than guessing.
7. Attachments/PDF binaries are not imported by this JSON flow. Metadata about documents may be included.
8. Do not create duplicate candidates for the same fact within one session.
9. Preserve useful notes/memos in payload.note or payload.memo.
10. Clearly distinguish completed facts from future plans.

## Top-level JSON

```json
{
  "source": "claude",
  "source_session_id": "claude-session-unique-id",
  "session_title": "シンガポール営業フォローアップ",
  "source_timestamp": "2026-10-09T12:00:00+09:00",
  "summary": "セッション全体の短い要約",
  "candidates": []
}
```

Allowed source values:
- chatgpt
- claude
- manual
- other

source_session_id should be stable and unique when available. It is used to prevent duplicate imports.

## Candidate types

### new_work
A genuinely new task/action item.

Recommended payload:
```json
{
  "status": "todo",
  "customer_id": "C001",
  "customer_name": "Example Cafe",
  "work_type": "海外",
  "assignee": "あかね",
  "priority": "中",
  "due_date": null,
  "next_action": "提案内容を確認して送信",
  "country": "Singapore",
  "origin_type": "Outbound",
  "channel": "Email",
  "product_ids": ["M003"],
  "memo": "必要な補足"
}
```

### work_update
Change to an existing work item.

target_id should be the existing Wxxx ID if known.

### work_event
An append-only fact/history item such as:
- email sent
- reply received
- sample requested
- sample shipped
- call completed
- proposal presented
- document submitted

Recommended payload:
```json
{
  "work_item_id": "W001",
  "event_type": "email_sent",
  "event_date": "2026-10-09T12:00:00+09:00",
  "channel": "Email",
  "note": "M003 proposal sent"
}
```

### customer_update
Candidate change/addition to customer master information.

Useful payload fields:
- name
- country
- category
- contact_name
- email
- phone
- instagram
- linkedin
- note

### product_update
Candidate change/addition to product master information.

Useful payload fields:
- name
- producer
- origin
- use_case
- color_note
- umami_note
- bitterness_note
- aroma_note
- cost
- standard_wholesale_price
- moq
- supply_status
- memo
- documents

Document metadata example:
```json
{
  "documents": [
    {
      "title": "残留農薬検査証明書",
      "status": "取得済み",
      "note": "Singapore向け提出候補"
    }
  ]
}
```

Do not include file binaries.

### price_candidate
Always requires human review.

Recommended payload:
```json
{
  "customer_id": "C001",
  "customer_name": "Example Cafe",
  "product_id": "M003",
  "price": 10500,
  "currency": "JPY",
  "unit": "kg",
  "moq": "5kg",
  "shipping_terms": "要確認",
  "payment_terms": "要確認",
  "effective_from": null,
  "evidence_note": "会話中で松下さんが提案候補として言及。確定とは明言されていない。"
}
```

Never turn a price_candidate into an authoritative current price automatically.

### decision
A matter requiring owner judgment.

Useful for:
- whether to send
- whether to discount
- whether to approve sample
- whether to accept terms
- whether to change product positioning

## Candidate envelope

Every candidate should follow:

```json
{
  "candidate_type": "new_work",
  "target_id": null,
  "title": "MatchayaへM003再提案",
  "confidence": 0.92,
  "payload": {}
}
```

confidence:
- 0.95-1.00: explicit fact stated clearly
- 0.80-0.94: strong contextual support
- 0.60-0.79: useful but needs checking
- below 0.60: usually do not include unless important; mark 要確認

## Claude historical backlog extraction prompt

Use this prompt with 3-5 representative conversations first:

```text
あなたはSHOJUEN WORKBOARDへのデータ移行担当です。
この会話（または指定された過去会話）から、WORKBOARDに必要な情報だけを抽出してください。

必ず次のルールを守ってください。

- 出力は有効なJSONだけ。説明文やMarkdownは付けない。
- 価格、MOQ、送料、支払条件、納期などの商条件を推測しない。
- 商条件は会話で明示されていても candidate_type="price_candidate" とし、確定データ扱いしない。
- 既存ID（Wxxx/Cxxx/Mxxx）が会話内で明確な場合だけ target_id や *_id に使う。不明なら推測しない。
- 「送信した」「返信を受けた」「発送した」など完了済みの事実は work_event。
- 「これから送る」「検討する」「確認する」は new_work / work_update / decision。
- 顧客情報は customer_update、商品情報は product_update。
- 証明書・規格書・検査資料などは product_update.payload.documents にメタ情報として含める。ファイル本体は扱わない。
- 備考や重要な背景は payload.memo / payload.note に落とす。
- 不確実な情報は "要確認" と明記し confidence を下げる。
- 同じ事実を重複して候補化しない。
- source は "claude"。
- source_session_id は会話を一意に識別できる値があれば入れる。なければ null。
- session_title は元会話の題名または内容を表す短い題名。
- source_timestamp は分かる場合のみISO 8601で入れる。
- candidates は1〜100件。

以下の形式に厳密に従ってください。

{
  "source": "claude",
  "source_session_id": null,
  "session_title": "",
  "source_timestamp": null,
  "summary": "",
  "candidates": [
    {
      "candidate_type": "new_work",
      "target_id": null,
      "title": "",
      "confidence": 0.9,
      "payload": {}
    }
  ]
}
```

## Rollout plan

1. Test with 3-5 representative Claude conversations.
2. Review extraction quality in AI取込候補.
3. Adjust rules if misclassification is found.
4. Import historical backlog in small batches.
5. Only after quality is stable, consider semi-automation.
