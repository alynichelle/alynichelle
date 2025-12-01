import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { supabase } from "../../../lib/supabase";
import { ensureInvoiceForBooking } from "../../../services/payments";
import { Services } from "../../../services/booking";

export default function BookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [b, setB] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  async function refresh() {
    const [{ data: booking }, { data: reqs }, { data: s }] = await Promise.all([
      supabase.from("bookings").select("*").eq("id", id).single(),
      supabase.from("cancellation_requests").select("*").eq("booking_id", id).order("requested_at", { ascending: false }),
      supabase.from("business_settings").select("*").limit(1).maybeSingle(),
    ]);
    setB(booking);
    setRequests(reqs || []);
    setSettings(s);
    const { data: inv } = await supabase.from("invoices").select("id").eq("booking_id", id).limit(1);
    setInvoiceId(inv?.[0]?.id ?? null);
  }
  useEffect(() => {
    refresh();
  }, [id]);

  async function approve(reqId: string) {
    if (!b) return;
    const start = new Date(b.start_at).getTime();
    const hours = Math.round((start - Date.now()) / (1000 * 60 * 60));
    const late = hours < (settings?.late_cancel_hours ?? 48);
    const fee = late ? (settings?.late_cancel_fee_cents ?? 2500) : 0;
    await supabase
      .from("bookings")
      .update({ status: "canceled", canceled_at: new Date().toISOString(), cancellation_reason: "client" })
      .eq("id", id);
    await supabase.from("cancellation_requests").update({ status: "approved" }).eq("id", reqId);
    if (late && settings?.auto_charge_enabled && b.client_id) {
      await fetch("/api/charge-card-on-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: b.client_id, amount_cents: fee, reason: "Late cancel fee" }),
      });
    }
    setMsg(late ? `${settings?.auto_charge_enabled ? "Late fee charged." : "Late fee applicable (not auto-charged)."}` : "Approved.");
    refresh();
  }
  async function deny(reqId: string) {
    await supabase.from("cancellation_requests").update({ status: "denied" }).eq("id", reqId);
    setMsg("Denied.");
    refresh();
  }

  async function createInvoice() {
    const r = await ensureInvoiceForBooking(id!);
    if ((r as any).error) {
      setMsg((r as any).error);
      return;
    }
    setInvoiceId((r as any).invoice.id);
    setMsg("Invoice created from booking ✅");
  }

  function toSplitPay() {
    if (!invoiceId) {
      setMsg("Create the invoice first.");
    }
  }

  if (!b) return <View style={{ padding: 16 }}><Text>Loading…</Text></View>;
  const svcName = b?.service_id ? Services.find((s) => s.id === b.service_id)?.name || b.service_id : "—";
  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Booking</Text>
      <Text>{new Date(b.start_at).toLocaleString()} – {new Date(b.end_at).toLocaleTimeString()}</Text>
      <Text>Status: {b.status}</Text>
      <Text>Client: {b.client_name} {b.client_id ? `(${b.client_id.slice(0, 6)}…)` : ""}</Text>
      <Text>Service: {svcName}</Text>
      <Text>Artist: {b.artist_name || "Alyssa Collins"}</Text>
      <Text>Deposit: ${(b.deposit_cents / 100).toFixed(2)}</Text>

      <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
        <Pressable onPress={createInvoice} style={{ backgroundColor: "#c6b1e6", padding: 10, borderRadius: 10 }}>
          <Text style={{ fontWeight: "700", color: "#1a1a1f" }}>
            {invoiceId ? "Recreate/Ensure Invoice" : "Create invoice from booking"}
          </Text>
        </Pressable>
        {invoiceId ? (
          <Link href={`/payments/invoice/${invoiceId}`} asChild>
            <Pressable onPress={toSplitPay} style={{ backgroundColor: "#eaf3ff", padding: 10, borderRadius: 10 }}>
              <Text style={{ fontWeight: "700" }}>Take split payment now →</Text>
            </Pressable>
          </Link>
        ) : null}
      </View>

      <Text style={{ marginTop: 10, fontWeight: "700" }}>Cancellation Requests</Text>
      {requests.length === 0 && <Text style={{ opacity: 0.7 }}>None</Text>}
      {requests.map((r) => (
        <View key={r.id} style={{ padding: 10, borderWidth: 1, borderColor: "#eee", borderRadius: 12, marginBottom: 8 }}>
          <Text>Requested: {new Date(r.requested_at).toLocaleString()}</Text>
          <Text>Status: {r.status}</Text>
          {r.reason ? <Text>Reason: {r.reason}</Text> : null}
          {r.status === "pending" && (
            <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }}>
              <Pressable onPress={() => approve(r.id)} style={{ backgroundColor: "#c6b1e6", padding: 8, borderRadius: 8 }}>
                <Text style={{ fontWeight: "600", color: "#1a1a1f" }}>Approve</Text>
              </Pressable>
              <Pressable onPress={() => deny(r.id)} style={{ backgroundColor: "#eee", padding: 8, borderRadius: 8 }}>
                <Text style={{ fontWeight: "600" }}>Deny</Text>
              </Pressable>
            </View>
          )}
        </View>
      ))}
      {!!msg && <Text>{msg}</Text>}
    </View>
  );
}
