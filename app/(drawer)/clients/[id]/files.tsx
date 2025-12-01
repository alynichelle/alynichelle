import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, Pressable, FlatList, Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { supabase } from "../../../../lib/supabase";

export default function ClientFiles() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [items, setItems] = useState<any[]>([]);
  const [msg, setMsg] = useState("");

  async function refresh() {
    const { data, error } = await supabase.storage.from("client-files").list(`${id}`, { limit: 100 });
    if (error?.message?.includes("not found")) {
      setItems([]);
      return;
    }
    setItems(data || []);
  }
  useEffect(() => {
    refresh();
  }, [id]);

  async function pickAndUpload() {
    try {
      const r = await DocumentPicker.getDocumentAsync({ multiple: false, copyToCacheDirectory: true });
      if (r.canceled || !r.assets?.[0]) return;
      const file = r.assets[0];
      const path = `${id}/${Date.now()}_${file.name || "upload"}`;
      const resp = await fetch(file.uri);
      const blob = await resp.blob();
      const { error } = await supabase.storage.from("client-files").upload(path, blob, { upsert: true, contentType: file.mimeType || undefined });
      setMsg(error ? error.message : "Uploaded.");
      refresh();
    } catch (e: any) {
      setMsg(e.message);
    }
  }
  async function signedUrl(name: string) {
    const { data, error } = await supabase.storage.from("client-files").createSignedUrl(`${id}/${name}`, 60 * 60);
    if (!error && data?.signedUrl) {
      if (Platform.OS === "web") window.open(data.signedUrl, "_blank");
      setMsg("Link created.");
    }
  }

  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Client Files</Text>
      <Pressable onPress={pickAndUpload} style={{ backgroundColor: "#c6b1e6", padding: 12, borderRadius: 12 }}>
        <Text style={{ textAlign: "center", fontWeight: "600", color: "#1a1a1f" }}>Upload</Text>
      </Pressable>
      <FlatList
        data={items}
        keyExtractor={(i) => i.name}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderWidth: 1, borderColor: "#eee", borderRadius: 12, marginBottom: 8 }}>
            <Text style={{ fontWeight: "600" }}>{item.name}</Text>
            <Pressable onPress={() => signedUrl(item.name)} style={{ marginTop: 6 }}>
              <Text style={{ color: "#3b5", fontWeight: "600" }}>Open</Text>
            </Pressable>
          </View>
        )}
      />
      {!!msg && <Text>{msg}</Text>}
    </View>
  );
}
