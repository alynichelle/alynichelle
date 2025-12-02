import { useEffect, useState } from "react";
const DEFAULTS = [
"I am safe in my own company.",
"My breath brings me back to center.",
"Small steps compound into big change.",
"I honor rest as productive.",
];
export default function Affirmations() {
const [items, setItems] = useState(() => {
try { return JSON.parse(localStorage.getItem("affirmations")) || DEFAULTS; }
catch { return DEFAULTS; }
});
const [text, setText] = useState("");
const [i, setI] = useState(0);
useEffect(() => { localStorage.setItem("affirmations", JSON.stringify(items)); }, [items]);
return (
<div>
<h2>Affirmations</h2>
<div className="big center">{items[i % items.length]}</div>
<div className="row gap">
<button className="btn" onClick={() => setI(i + 1)}>Next</button>
<input className="grow" placeholder="Add new…" value={text} onChange={e=>setText(e.target.value)} />
<button className="btn" onClick={() => { if(text.trim()){ setItems([...items, text.trim()]); setText(""); } }}>Add</button>
</div>
</div>
);
}
