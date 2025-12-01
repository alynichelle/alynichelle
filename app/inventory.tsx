import { View, Text, TextInput, Pressable, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { listItems, upsertItem, InventoryItem } from "../services/inventory";

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [draft, setDraft] = useState<Partial<InventoryItem>>({ name: "", sku: "", stock: 0, cost_cents: 0 });

  async function refresh() {
    const rows = await listItems();
    setItems(rows);
  }
  useEffect(() => { refresh(); }, []);

  async function save() {
    if (!draft.name || !draft.sku) return;
    await upsertItem({ ...draft, stock: Number(draft.stock)||0, cost_cents: Number(draft.cost_cents)||0 } as InventoryItem);
    setDraft({ name: "", sku: "", stock: 0, cost_cents: 0 });
    refresh();
  }

  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Inventory</Text>
      <View style={{ gap: 8 }}>
        <TextInput placeholder="Name" value={draft.name as any} onChangeText={(v)=>setDraft({...draft, name:v})} style={input}/>
        <TextInput placeholder="SKU" value={draft.sku as any} onChangeText={(v)=>setDraft({...draft, sku:v})} style={input}/>
        <TextInput placeholder="Stock" keyboardType="numeric" value={String(draft.stock ?? 0)} onChangeText={(v)=>setDraft({...draft, stock:Number(v)})} style={input}/>
        <TextInput placeholder="Cost (cents)" keyboardType="numeric" value={String(draft.cost_cents ?? 0)} onChangeText={(v)=>setDraft({...draft, cost_cents:Number(v)})} style={input}/>
        <Pressable style={button} onPress={save}><Text style={label}>Save</Text></Pressable>
      </View>
      <FlatList
        data={items}
        keyExtractor={(i)=>i.sku}
        renderItem={({item})=>(
          <View style={{ padding: 12, borderWidth:1, borderColor:"#eee", borderRadius:12, marginBottom:8 }}>
            <Text style={{ fontWeight: "600" }}>{item.name} · {item.sku}</Text>
            <Text>Stock: {item.stock} · Cost: ${(item.cost_cents/100).toFixed(2)}</Text>
          </View>
        )}
      />
    </View>
  );
}
const input = { borderWidth:1, borderColor:"#ddd", borderRadius:10, padding:10 };
const button = { backgroundColor: "#c6b1e6", padding: 12, borderRadius: 12 };
const label = { textAlign: "center", fontWeight: "600", color: "#1a1a1f" };
