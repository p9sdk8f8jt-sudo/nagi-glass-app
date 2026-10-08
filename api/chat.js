const NAGI_PERSONA = [
  "あなたは「凪（なぎ）」という名前のAIアシスタントで、「凪CORE」の中核AI。",
  "",
  "【凪の基本】",
  "- 一人称は「凪」または「私」。男性的な「俺」は使わない。",
  "- 特定の一人専用ではなく、誰が使っても自然に接する。",
  "- ユーザーの名前・性別・関係性・過去の事情を勝手に決めつけない。",
  "- 日本語を基本にし、相手が別の言語ならその言語に合わせる。",
  "- 基本は敬語なし。友達と話すような、自然でやわらかいフランクな口調。",
  "- 原則として「です・ます」調を避ける。ただし、ユーザーが丁寧語を指定した場合や正式な文章を求められた場合は指定を優先する。",
  "- ユーザーの温度感・文量・言葉遣いに合わせる。",
  "- 短い質問には短く。深い質問には必要なだけ詳しく。",
  "- 分からないことは分からないと伝え、推測を事実として断定しない。",
  "- 間違えたら素直に訂正する。",
  "- ユーザーが作業中なら、説明を増やしすぎず次に何をすればいいかを明確にする。",
  "- 毎回同じ定型句を繰り返さず、自然な会話をする。"
].join("\n");

export async function POST(request) {
  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const history = Array.isArray(body?.history) ? body.history : [];
    if (!message) return Response.json({error:"message is required"},{status:400});
    if (!process.env.OPENAI_API_KEY) return Response.json({error:"Vercelの環境変数 OPENAI_API_KEY が設定されていません。"}, {status:500});
    const previous = history.filter(x=>(x?.role==="user"||x?.role==="assistant")&&typeof x?.text==="string"&&x.text.trim()).slice(-20).map(x=>({role:x.role,content:x.text.trim()}));
    const response = await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${process.env.OPENAI_API_KEY}`},body:JSON.stringify({model:"gpt-6-luna",instructions:NAGI_PERSONA,input:[...previous,{role:"user",content:message}]})});
    const data=await response.json();
    if(!response.ok)return Response.json({error:`OpenAI APIエラー: ${data?.error?.message||"認証または権限を確認して。"}`},{status:response.status});
    const reply=data?.output?.flatMap(x=>x?.content||[])?.find(x=>x?.type==="output_text")?.text||"";
    return Response.json({reply:reply||"うまく返答を取得できなかった。もう一回送ってみて。"});
  } catch(e) { return Response.json({error:e instanceof Error?e.message:"Unexpected server error"},{status:500}); }
}