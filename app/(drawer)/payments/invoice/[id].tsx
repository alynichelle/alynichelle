import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, TextInput, FlatList } from "react-native";
import { supabase } from "../../../../lib/supabase";
import { addPayment } from "../../../../services/payments";

type Row = { method: "cash" | "card" | "credit"; amount: string; note?: string };
const METHODS = ["cash", "card", "credit"] as const;

export default function InvoiceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [inv, setInv] = useState<any>(null);
  const [rows, setRows] = useState<Row[]>([{ method: "cash", amount: "", note: "" }]);
  const [existing, setExisting] = useState<any[]>([]);
  const [msg, setMsg] = useState("");

  async function refresh() {
    const { data: i } = await supabase.from("invoices").select("*").eq("id", id).single();
    setInv(i);
    const { data: pays } = await supabase.from("payments").select("*").eq("invoice_id", id).order("created_at", { ascending: false });
    setExisting(pays || []);
  }
  useEffect(() => {
    refresh();
  }, [id]);

  const paidCents = useMemo(() => (existing || []).reduce((s, p) => s + (p.amount_cents || 0), 0), [existing]);
  const draftCents = useMemo(() => rows.reduce((s, r) => s + Math.round((parseFloat(r.amount || "0") || 0) * 100), 0), [rows]);
  const remainingCents = Math.max(0, (inv?.total_cents || 0) - paidCents - draftCents);

  function setRow(i: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function addRow() {
    setRows((prev) => [...prev, { method: "cash", amount: "", note: "" }]);
  }
  function delRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function saveRows() {
    if (!inv) return;
    for (const r of rows) {
      const amount_cents = Math.round((parseFloat(r.amount || "0") || 0) * 100);
      if (amount_cents <= 0) continue;
      const { error } = await addPayment({
        invoice_id: inv.id,
        method: r.method,
        amount_cents,
        note: r.note,
      });
      if (error) {
        setMsg(error);
        return;
      }
    }
    setRows([{ method: "cash", amount: "", note: "" }]);
    setMsg("Payments saved.");
    refresh();
  }

  if (!inv) return <View style={{ padding: 16 }}><Text>Loading…</Text></View>;
  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Invoice</Text>
      <Text>Status: {inv.status} · Total: ${(inv.total_cents / 100).toFixed(2)}</Text>
      <Text>Already paid: ${(paidCents / 100).toFixed(2)}</Text>
      <Text>Draft add: ${(draftCents / 100).toFixed(2)}</Text>
      <Text>Remaining (after draft): ${(remainingCents / 100).toFixed(2)}</Text>

      <Text style={{ marginTop: 8, fontWeight: "700" }}>Add split payments</Text>
      <FlatList
        data={rows}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item, index }) => (
          <View style={{ borderWidth: 1, borderColor: "#eee", borderRadius: 12, padding: 10, marginBottom: 8 }}>
            <Text>Method</Text>
            <View style={{ flexDirection: "row", gap: 6, marginVertical: 6 }}>
              {METHODS.map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setRow(index, { method: m })}
                  style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: item.method === m ? "#c6b1e6" : "#eee" }}
                >
                  <Text style={{ fontWeight: "600" }}>{m}</Text>
                </Pressable>
              ))}
            </View>
            <Text>Amount (USD)</Text>
            <TextInput
              keyboardType="decimal-pad"
              value={item.amount}
              onChangeText={(v) => setRow(index, { amount: v })}
              style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 10, marginBottom: 6 }}
            />
            <Text>Note (optional)</Text>
            <TextInput
              value={item.note}
              onChangeText={(v) => setRow(index, { note: v })}
              style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 10 }}
            />
            <Pressable onPress={() => delRow(index)} style={{ marginTop: 8 }}>
              <Text style={{ color: "#a00", fontWeight: "600" }}>Remove</Text>
            </Pressable>
          </View>
        )}
      />
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Pressable onPress={addRow} style={{ backgroundColor: "#eee", padding: 12, borderRadius: 12 }}>
          <Text style={{ fontWeight: "600" }}>+ Add row</Text>
        </Pressable>
        <Pressable onPress={saveRows} style={{ backgroundColor: "#c6b1e6", padding: 12, borderRadius: 12 }}>
          <Text style={{ fontWeight: "600", color: "#1a1a1f" }}>Save payments</Text>
        </Pressable>
      </View>
      {!!msg && <Text>{msg}</Text>}
    </View>
  );
}
