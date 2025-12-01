import { useEffect, useState } from "react";
export default function Journal() {
const [text, setText] = useState(() => localStorage.getItem("journal") || "");
useEffect(() => { localStorage.setItem("journal", text); }, [text]);
return (
<div>
<h2>Journal</h2>
<textarea className="textarea" rows={8} value={text} onChange={(e)=>setText(e.target.value)} placeholder="Stream your thoughts…" />
</div>
);
}
