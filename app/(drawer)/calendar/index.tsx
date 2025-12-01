import dayjs from "dayjs";
import { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, ScrollView, PanResponder, GestureResponderEvent, PanResponderGestureState } from "react-native";
import { rangeForView, listBookingsBetween, listBlocksBetween } from "../../../services/calendar";
import { Link } from "expo-router";
import { supabase } from "../../../lib/supabase";

export default function Calendar() {
  const [view, setView] = useState<"month" | "week" | "day">("week");
  const [refDate, setRefDate] = useState(dayjs().format());
  const [events, setEvents] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const containerH = 24 * 48;
  const hourHeight = containerH / 24;
  const startY = useRef<number | null>(null);
  const [dragRange, setDragRange] = useState<{ start: number; end: number } | null>(null);

  async function refresh() {
    const { start, end } = rangeForView(view, refDate);
    const bookings = await listBookingsBetween(start.toISOString(), end.toISOString());
    const blks = await listBlocksBetween(start.toISOString(), end.toISOString());
    setEvents(bookings);
    setBlocks(blks);
  }
  useEffect(() => {
    refresh();
  }, [view, refDate]);

  function yToTime(y: number) {
    const h = Math.max(0, Math.min(23.99, y / hourHeight));
    const minutes = Math.round(h * 60);
    const d = dayjs(refDate).startOf("day").add(minutes, "minute");
    return d;
  }
  const pan = PanResponder.create({
    onStartShouldSetPanResponder: () => view === "day",
    onPanResponderGrant: (e: GestureResponderEvent) => {
      startY.current = e.nativeEvent.locationY;
      const s = yToTime(startY.current);
      setDragRange({ start: s.valueOf(), end: s.valueOf() });
    },
    onPanResponderMove: (_e, g: PanResponderGestureState) => {
      if (startY.current == null) return;
      const currentY = startY.current + g.dy;
      const end = yToTime(currentY);
      setDragRange((r) => (r ? { ...r, end: end.valueOf() } : null));
    },
    onPanResponderRelease: async () => {
      if (!dragRange) return;
      const s = dayjs(Math.min(dragRange.start, dragRange.end));
      const e = dayjs(Math.max(dragRange.start, dragRange.end));
      if (e.diff(s, "minute") < 15) {
        setDragRange(null);
        return;
      }
      await supabase
        .from("availability_blocks")
        .insert({ title: "Blocked", start_at: s.toISOString(), end_at: e.toISOString(), is_blocked: true });
      setDragRange(null);
      refresh();
    },
  });

  return (
    <View style={{ padding: 12, gap: 10 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Calendar</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {["month", "week", "day"].map((v) => (
          <Pressable key={v} onPress={() => setView(v as any)} style={{ backgroundColor: view === v ? "#c6b1e6" : "#eee", padding: 8, borderRadius: 8 }}>
            <Text style={{ fontWeight: "600" }}>{v.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Pressable onPress={() => setRefDate(dayjs(refDate).subtract(1, view === "month" ? "month" : view === "week" ? "week" : "day").format())} style={nav}><Text>◀</Text></Pressable>
        <Pressable onPress={() => setRefDate(dayjs().format())} style={nav}><Text>Today</Text></Pressable>
        <Pressable onPress={() => setRefDate(dayjs(refDate).add(1, view === "month" ? "month" : view === "week" ? "week" : "day").format())} style={nav}><Text>▶</Text></Pressable>
      </View>

      {view !== "day" ? (
        <ScrollView style={{ height: 520 }}>
          <Text style={{ fontWeight: "700", marginBottom: 6 }}>{labelFor(view, refDate)}</Text>
          {blocks.map((b) => (
            <View key={b.id} style={{ padding: 8, borderWidth: 1, borderColor: "#f3c", borderRadius: 8, marginBottom: 6, backgroundColor: "#fff0fb" }}>
              <Text style={{ fontWeight: "600" }}>Blocked: {fmt(b.start_at)}–{fmt(b.end_at)}</Text>
              <Text>{b.title || "Unavailable"}</Text>
            </View>
          ))}
          {events.map((e) => (
            <View key={e.id} style={{ padding: 8, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, marginBottom: 6 }}>
              <Text style={{ fontWeight: "600" }}>{fmt(e.start_at)}–{fmt(e.end_at)} • {e.client_name}</Text>
              <Text style={{ opacity: 0.7 }}>{e.service_id} · {e.status}</Text>
              <Link href={`/clients/${e.client_id ?? ""}`} asChild>
                <Pressable style={{ marginTop: 6, backgroundColor: "#c6b1e6", padding: 8, borderRadius: 8 }}>
                  <Text style={{ textAlign: "center", fontWeight: "600", color: "#1a1a1f" }}>Client file</Text>
                </Pressable>
              </Link>
              <Link href={`/bookings/${e.id}`} asChild>
                <Pressable style={{ marginTop: 6, backgroundColor: "#eee", padding: 8, borderRadius: 8 }}>
                  <Text style={{ textAlign: "center", fontWeight: "600" }}>Booking</Text>
                </Pressable>
              </Link>
            </View>
          ))}
          {events.length === 0 && blocks.length === 0 && <Text style={{ opacity: 0.7 }}>No items.</Text>}
        </ScrollView>
      ) : (
        <View style={{ borderWidth: 1, borderColor: "#eee", borderRadius: 12, overflow: "hidden", height: 520 }} {...pan.panHandlers}>
          <View style={{ flexDirection: "row" }}>
            <View style={{ width: 52, backgroundColor: "#fafafa", borderRightWidth: 1, borderRightColor: "#eee" }}>
              {hours.map((h) => (
                <View key={h} style={{ height: hourHeight, paddingHorizontal: 6 }}>
                  <Text style={{ fontSize: 12, color: "#666" }}>{String(h).padStart(2, "0")}:00</Text>
                </View>
              ))}
            </View>
            <View style={{ flex: 1, position: "relative" }}>
              {hours.map((h) => (
                <View key={h} style={{ height: hourHeight, borderTopWidth: 1, borderTopColor: "#f1f1f1" }} />
              ))}
              {blocks.map((b) => {
                const s = dayjs(b.start_at);
                const e = dayjs(b.end_at);
                const top = s.diff(dayjs(refDate).startOf("day"), "minute") / 60 * hourHeight;
                const h = Math.max(6, e.diff(s, "minute") / 60 * hourHeight);
                return (
                  <View key={b.id} style={{ position: "absolute", left: 6, right: 6, top, height: h, backgroundColor: "#ffe0f6", borderWidth: 1, borderColor: "#f3c", borderRadius: 8, padding: 6 }}>
                    <Text style={{ fontWeight: "600" }}>{b.title || "Blocked"}</Text>
                  </View>
                );
              })}
              {events.map((e) => {
                const s = dayjs(e.start_at);
                const ed = dayjs(e.end_at);
                const top = s.diff(dayjs(refDate).startOf("day"), "minute") / 60 * hourHeight;
                const h = Math.max(6, ed.diff(s, "minute") / 60 * hourHeight);
                return (
                  <View key={e.id} style={{ position: "absolute", left: 6, right: 6, top, height: h, backgroundColor: "#eaf3ff", borderWidth: 1, borderColor: "#8ab4ff", borderRadius: 8, padding: 6 }}>
                    <Text style={{ fontWeight: "600" }}>{e.client_name}</Text>
                    <Text style={{ opacity: 0.7, fontSize: 12 }}>{fmt(e.start_at)}–{fmt(e.end_at)}</Text>
                  </View>
                );
              })}
              {dragRange && (() => {
                const s = dayjs(Math.min(dragRange.start, dragRange.end));
                const ed = dayjs(Math.max(dragRange.start, dragRange.end));
                const top = s.diff(dayjs(refDate).startOf("day"), "minute") / 60 * hourHeight;
                const h = Math.max(6, ed.diff(s, "minute") / 60 * hourHeight);
                return <View style={{ position: "absolute", left: 4, right: 4, top, height: h, borderWidth: 1, borderStyle: "dashed", borderColor: "#a38dd7", backgroundColor: "#f4f0ff" }} />;
              })()}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
const nav = { backgroundColor: "#eee", padding: 8, borderRadius: 8 };
function labelFor(view: "month" | "week" | "day", iso: string) {
  const d = dayjs(iso);
  if (view === "day") return d.format("dddd, MMM D YYYY");
  if (view === "week") return `Week of ${d.startOf("week").format("MMM D")} – ${d.endOf("week").format("MMM D")}`;
  return d.format("MMMM YYYY");
}
const fmt = (iso: string) => dayjs(iso).format("HH:mm");
