import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, Pressable, TextInput, FlatList, ScrollView, Platform } from "react-native";
import { supabase } from "../../../../lib/supabase";

export default function ClientForms() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [forms, setForms] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [sigName, setSigName] = useState("");
  const [checked, setChecked] = useState(false);
  const [msg, setMsg] = useState("");
  const [acceptId, setAcceptId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("legal_forms").select("*").eq("is_active", true).order("created_at", { ascending: true });
      setForms(data || []);
    })();
  }, []);

  async function accept() {
    if (!selected) return;
    if (!checked || !sigName) {
      setMsg("Please check consent and type your full name.");
      return;
    }
    const { data, error } = await supabase.from("client_form_acceptances").insert({
      client_id: id,
      form_id: selected.id,
      form_version: selected.version,
      accepted_name: sigName,
      accepted_checkbox: true,
    }).select().single();
    setMsg(error ? error.message : "Form signed ✅");
    if (!error) setAcceptId(data?.id || null);
  }

  async function exportPdf() {
    if (!acceptId) {
      setMsg("Sign the form first.");
      return;
    }
    const r = await fetch("/api/export-form-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acceptance_id: acceptId, upload: true })
    });
    if (!r.ok) {
      setMsg("PDF export failed");
      return;
    }
    setMsg("PDF exported and uploaded. Download from client files.");
  }

  async function pickAndUploadFile() {
    try {
      if (Platform.OS === "web") {
        const input = document.createElement("input");
        input.type = "file";
        input.onchange = async () => {
          const file = (input.files && input.files[0]) as File;
          if (!file) return;
          const path = `${id}/${Date.now()}_${file.name}`;
          const { error } = await supabase.storage.from("client-files").upload(path, file, { upsert: true });
          setMsg(error ? error.message : "File uploaded.");
        };
        input.click();
      } else {
        setMsg("File upload on native requires DocumentPicker—ask to enable next.");
      }
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  if (!selected) {
    return (
      <View style={{ gap: 12, padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "700" }}>Required forms</Text>
        <Pressable onPress={pickAndUploadFile} style={{ backgroundColor: "#eee", padding: 10, borderRadius: 10, marginBottom: 6 }}>
          <Text>Upload client file (photo ID, past work, etc.)</Text>
        </Pressable>
        <FlatList
          data={forms}
          keyExtractor={(f) => f.id}
          renderItem={({ item }) => (
            <Pressable onPress={() => setSelected(item)} style={{ padding: 12, borderWidth: 1, borderColor: "#eee", borderRadius: 12, marginBottom: 8 }}>
              <Text style={{ fontWeight: "600" }}>{item.title}</Text>
              <Text style={{ opacity: 0.7 }}>v{item.version} · {item.is_required ? "Required" : "Optional"}</Text>
            </Pressable>
          )}
        />
        {!!msg && <Text>{msg}</Text>}
      </View>
    );
  }

  return (
    <ScrollView style={{ padding: 16 }}>
      <Pressable onPress={() => setSelected(null)} style={{ marginBottom: 12 }}>
        <Text style={{ color: "#3b5", fontWeight: "600" }}>← Back</Text>
      </Pressable>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>{selected.title}</Text>
      <Text style={{ opacity: 0.7 }}>Version {selected.version}</Text>
      <View style={{ gap: 6, marginTop: 12 }}>
        <Text style={{ fontWeight: "600" }}>Review</Text>
        <Text>{selected.body_md}</Text>
      </View>
      <View style={{ gap: 6, marginTop: 8 }}>
        <Pressable onPress={() => setChecked(!checked)} style={{ padding: 10, borderRadius: 10, borderWidth: 1, borderColor: checked ? "#c6b1e6" : "#ddd", backgroundColor: checked ? "#efe9fb" : "transparent" }}>
          <Text>{checked ? "☑" : "☐"}  I agree to the above terms and consent to receive services.</Text>
        </Pressable>
        <Text>Type your full name (signature)</Text>
        <TextInput
          value={sigName}
          onChangeText={setSigName}
          placeholder="Full legal name"
          style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 10 }}
        />
        <Pressable onPress={accept} style={{ backgroundColor: "#c6b1e6", padding: 12, borderRadius: 12 }}>
          <Text style={{ textAlign: "center", fontWeight: "600", color: "#1a1a1f" }}>Sign & Save</Text>
        </Pressable>
        <Pressable onPress={exportPdf} style={{ backgroundColor: "#eee", padding: 12, borderRadius: 12 }}>
          <Text style={{ textAlign: "center", fontWeight: "600" }}>Export PDF</Text>
        </Pressable>
        {!!msg && <Text>{msg}</Text>}
      </View>
    </ScrollView>
  );
}
