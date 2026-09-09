import { Redis } from "@upstash/redis";

let kv;
function getKV() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  if (!kv) kv = Redis.fromEnv();
  return kv;
}

export const CUSTOM_ORDER_PRICE_JPY = 15000;
export const GENRES = ["hip-hop", "trap", "rnb", "drill", "lo-fi", "pop"];

export const PLANS = {
  rental: {
    id: "rental",
    label: "レンタルビーツ",
    priceJPY: 5500,
    description: "MP3での納品。商用・非商用問わず自由に利用可。楽曲から発生する収益は甲乙で分配。コンテンツID登録は不可、独占権なし。",
    deliverables: ["MP3"],
    exclusivity: false,
  },
  premium: {
    id: "premium",
    label: "プレミアムリース",
    priceJPY: 15000,
    description: "WAV(24bit)での納品。商用・非商用問わず自由に利用可。収益分配なしで利益を独占できます。コンテンツID登録は不可、独占的な著作権譲渡ではありません。",
    deliverables: ["WAV (24bit)"],
    exclusivity: false,
  },
  exclusive: {
    id: "exclusive",
    label: "独占購入",
    priceJPY: 33000,
    description: "WAVでの納品。以後このビートは新規販売を停止します。コンテンツID登録可能。既にリース契約中の方はそのまま利用を継続できます。",
    deliverables: ["WAV (24bit)"],
    exclusivity: true,
  },
};

const BEATS_INDEX_KEY = "beats:index";
const beatKey = (id) => "beats:item:" + id;

export async function listBeats(genre, { includeHidden = false } = {}) {
  const db = getKV();
  if (!db) return [];
  const ids = (await db.get(BEATS_INDEX_KEY)) || [];
  if (!ids.length) return [];
  let beats = (await Promise.all(ids.map((id) => db.get(beatKey(id))))).filter(Boolean);
  if (!includeHidden) beats = beats.filter((b) => b.visibility === "public");
  return genre ? beats.filter((b) => b.genre === genre) : beats;
}

export async function getBeat(id) {
  return (await getKV().get(beatKey(id))) || null;
}

export async function saveBeat(beat) {
  await getKV().set(beatKey(beat.id), beat);
  const ids = (await getKV().get(BEATS_INDEX_KEY)) || [];
  if (!ids.includes(beat.id)) await getKV().set(BEATS_INDEX_KEY, [beat.id, ...ids]);
  return beat;
}

export async function deleteBeat(id) {
  await getKV().del(beatKey(id));
  const ids = (await getKV().get(BEATS_INDEX_KEY)) || [];
  await getKV().set(BEATS_INDEX_KEY, ids.filter((x) => x !== id));
}
