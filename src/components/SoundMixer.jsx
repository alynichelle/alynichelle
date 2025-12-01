import { useEffect, useRef, useState } from "react";
const sounds = [
{ id: "rain", label: "Rain", src: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_5c8d0e.mp3?filename=rain-ambient-110280.mp3" },
{ id: "waves", label: "Waves", src: "https://cdn.pixabay.com/download/audio/2021/11/16/audio_5b9f37.mp3?filename=ocean-waves-ambient-96941.mp3" },
{ id: "fire", label: "Fireplace", src: "https://cdn.pixabay.com/download/audio/2021/11/15/audio_2b5c7e.mp3?filename=campfire-ambient-96927.mp3" },
];
export default function SoundMixer() {
const [volumes, setVolumes] = useState({ rain: 0.6, waves: 0.0, fire: 0.0 });
const audio = useRef({});
useEffect(() => {
sounds.forEach(s => {
if (!audio.current[s.id]) {
const el = new Audio(s.src);
el.loop = true;
audio.current[s.id] = el;
}
const el = audio.current[s.id];
el.volume = volumes[s.id] ?? 0;
if (el.volume > 0 && el.paused) el.play().catch(() => {});
if (el.volume === 0 && !el.paused) el.pause();
});
}, [volumes]);
return (
<div>
<h2>Ambient Mixer</h2>
{sounds.map(s => (
<div className="row" key={s.id}>
<label>{s.label}</label>
<input type="range" min={0} max={1} step={0.01}
value={volumes[s.id] ?? 0}
onChange={(e) => setVolumes(v => ({ ...v, [s.id]: parseFloat(e.target.value) }))} />
</div>
))}
</div>
);
}
