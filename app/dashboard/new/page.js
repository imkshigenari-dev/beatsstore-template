import NewBeatForm from "./new-beat-form";
import { GENRES } from "../../../lib/beats";

export default function NewBeatPage() {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 24 }}>新しいビートを投稿</h1>
      <NewBeatForm genres={GENRES} />
    </div>
  );
}
