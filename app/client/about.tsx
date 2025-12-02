import { useEffect, useState } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { supabase } from "../../lib/supabase";
import { Link } from "expo-router";

export default function AboutArtist() {
  const [p, setP] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("providers")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true })
        .limit(1);
      setP(data?.[0] || null);
    })();
  }, []);

  if (!p) return <View style={{ padding: 16 }}><Text>Loading…</Text></View>;

  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Text style={{ fontSize: 26, fontWeight: "800" }}>About {p.name}</Text>
      {!!p.photo_url && (
        <Image
          source={{ uri: p.photo_url }}
          style={{ width: "100%", height: 220, borderRadius: 16, backgroundColor: "#eee" }}
        />
      )}
      {!!p.bio && <Text style={{ lineHeight: 22 }}>{p.bio}</Text>}
      {!!p.specialties?.length && <Text style={{ opacity: 0.8 }}>Specialties: {p.specialties.join(" • ")}</Text>}
      <Link href="/booking" asChild>
        <Pressable style={{ backgroundColor: "#c6b1e6", padding: 12, borderRadius: 12, marginTop: 6 }}>
          <Text style={{ textAlign: "center", fontWeight: "700", color: "#1a1a1f" }}>Book with {p.name}</Text>
        </Pressable>
      </Link>
    </View>
  );
}
