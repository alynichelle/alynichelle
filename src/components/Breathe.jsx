import { useEffect, useMemo, useRef, useState } from "react";
export default function Breathe() {
const [seconds, setSeconds] = useState(4);
const [phase, setPhase] = useState("Inhale");
const [running, setRunning] = useState(false);
const phases = useMemo(() => ["Inhale", "Hold", "Exhale", "Hold"], []);
const idxRef = useRef(0);
const timeRef = useRef(seconds);

useEffect(() => { timeRef.current = seconds; }, [seconds]);
useEffect(() => {
if (!running) return;
setPhase(phases[idxRef.current]);
let t = timeRef.current;
const id = setInterval(() => {
t -= 1;
if (t <= 0) {
idxRef.current = (idxRef.current + 1) % phases.length;
setPhase(phases[idxRef.current]);
t = timeRef.current;
}
}, 1000);
return () => clearInterval(id);
}, [running, phases]);

return (
<div>
<header className="row">
<h2>Box Breathing</h2>
<div className="row gap">
<label>{seconds}s</label>
<input type="range" min={3} max={8} value={seconds}
onChange={(e) => setSeconds(parseInt(e.target.value))} />
</div>
</header>
<div className="center big">{phase}</div>
<button onClick={() => setRunning(v => !v)} className="btn">
{running ? "Pause" : "Start"}
</button>
</div>
);
}
