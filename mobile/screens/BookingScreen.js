import React, { useMemo, useState } from 'react';
import { View, Text, Button, TextInput, ScrollView, Switch, Alert, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../supabase';

const SERVICE_DEFINITIONS = [
  { key: 'classic', name: 'Classic Lash Extensions', basePrice: 120, minPrice: 120, duration: 120, points: 80 },
  { key: 'hybrid', name: 'Hybrid Volume Lash Extensions', basePrice: 160, minPrice: 160, duration: 150, points: 100 },
  { key: 'mega', name: 'Mega Glam Full Volume Lash Extensions', basePrice: 250, minPrice: 250, duration: 210, points: 140 },
  { key: 'emergency', name: 'Emergency Fill', basePrice: 115, minPrice: 115, duration: 60, isFill: true, points: 60 },
  { key: 'fill2', name: '2 Week Fill', basePrice: 60, minPrice: 60, duration: 60, isFill: true, points: 40 },
  { key: 'fill3', name: '3 Week Fill', basePrice: 80, minPrice: 60, duration: 90, isFill: true, points: 50 },
  { key: 'lashTint', name: 'Lash Tint', basePrice: 55, minPrice: 55, duration: 60, points: 30 },
  { key: 'lashLift', name: 'Lash Lift', basePrice: 75, minPrice: 75, duration: 60, points: 40 },
  { key: 'browLam', name: 'Brow Lamination', basePrice: 115, minPrice: 115, duration: 60, points: 45 },
  { key: 'browTint', name: 'Brow Tint', basePrice: 55, minPrice: 55, duration: 45, points: 25 },
  { key: 'browShape', name: 'Brow Shape (Wax/Tweeze/Shave)', basePrice: 55, minPrice: 55, duration: 15, points: 20 },
];

const TIER_DISCOUNTS = {
  standard: 0,
  tier1: 5,
  tier2: 10,
  tier3: 15,
};

const AVAILABILITY_WINDOWS = {
  5: { start: 15 * 60, end: 24 * 60 }, // Friday 3:00 PM – 12:00 AM
  6: { start: 0, end: 21 * 60 }, // Saturday 12:00 AM – 9:00 PM
  0: { start: 0, end: 21 * 60 }, // Sunday 12:00 AM – 9:00 PM
};

const END_OF_2025 = new Date('2025-12-31T23:59:59Z');

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1c4e9',
    borderRadius: 12,
    backgroundColor: 'rgba(214,210,255,0.35)',
  },
  label: { fontWeight: '600', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 8 },
  pill: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  header: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#5b4b8a' },
});

export default function BookingScreen() {
  const [clientId, setClientId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
  const [showPicker, setShowPicker] = useState(false);
  const [selectedServices, setSelectedServices] = useState({});
  const [travelFee, setTravelFee] = useState('0');
  const [tip, setTip] = useState('0');
  const [taxRate, setTaxRate] = useState('8.5');
  const [loyaltyTier, setLoyaltyTier] = useState('standard');
  const [isVip, setIsVip] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const toggleService = (key) => {
    setSelectedServices((prev) => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        const def = SERVICE_DEFINITIONS.find((s) => s.key === key);
        next[key] = { price: def.basePrice.toString(), duration: def.duration.toString(), quantity: '1' };
      }
      return next;
    });
  };

  const updateServiceField = (key, field, value) => {
    setSelectedServices((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const selectedDefinitions = useMemo(() => SERVICE_DEFINITIONS.filter((s) => selectedServices[s.key]), [selectedServices]);

  const totals = useMemo(() => {
    let subtotal = 0;
    let points = 0;
    let fillsDiscount = 0;
    let totalDuration = 0;

    selectedDefinitions.forEach((def) => {
      const config = selectedServices[def.key];
      const quantity = parseInt(config?.quantity || '1', 10) || 1;
      const price = Math.max(Number(config?.price || def.basePrice), def.minPrice || def.basePrice);
      const duration = Math.max(Number(config?.duration || def.duration), def.duration);
      subtotal += price * quantity;
      totalDuration += duration * quantity;
      points += (def.points || 0) * quantity;

      if (def.isFill) {
        const tierDiscount = TIER_DISCOUNTS[loyaltyTier] || 0;
        const vipDiscount = isVip ? 25 : 0;
        const combined = Math.min(25, tierDiscount + vipDiscount);
        fillsDiscount += combined * quantity;
      }
    });

    const travel = Number(travelFee || 0);
    const tipAmount = Number(tip || 0);
    const taxPct = Number(taxRate || 0) / 100;
    const discount = fillsDiscount;
    const tax = (subtotal - discount + travel + tipAmount) * taxPct;
    const total = subtotal - discount + travel + tipAmount + tax;
    const approvalExpiresAt = new Date(selectedDate.getTime() + 48 * 60 * 60 * 1000);

    return { subtotal, tax, travel, tipAmount, discount, total, points, totalDuration, approvalExpiresAt };
  }, [selectedDefinitions, selectedServices, travelFee, tip, taxRate, loyaltyTier, isVip, selectedDate]);

  const validateDate = (date, durationMinutes) => {
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
    if (date < twoWeeksFromNow) return 'Bookings must be at least 2 weeks in advance.';
    if (date > END_OF_2025) return 'Availability is only open through 2025. 2026 is pending.';

    const day = date.getUTCDay();
    const minutes = date.getUTCHours() * 60 + date.getUTCMinutes();
    const window = AVAILABILITY_WINDOWS[day];
    if (!window) return 'That day is outside available hours (Fri-Sun only).';
    const endMinutes = minutes + durationMinutes;
    if (minutes < window.start || endMinutes > window.end) {
      return 'Selected time is outside available hours for that day.';
    }
    return '';
  };

  const book = async () => {
    setStatusMessage('');
    if (!selectedDefinitions.length) {
      Alert.alert('Select at least one service');
      return;
    }

    const validationMessage = validateDate(selectedDate, totals.totalDuration || 0);
    if (validationMessage) {
      Alert.alert(validationMessage);
      return;
    }

    const servicePayload = selectedDefinitions.map((def) => ({
      name: def.name,
      base_price: def.basePrice,
      default_duration_minutes: def.duration,
      is_fill: !!def.isFill,
      min_price: def.minPrice,
      points_awarded: def.points,
      category: def.category,
    }));

    const { data: serviceRows, error: serviceError } = await supabase
      .from('services')
      .upsert(servicePayload, { onConflict: 'name' })
      .select();

    if (serviceError) {
      setStatusMessage(`Error saving services: ${serviceError.message}`);
      return;
    }

    const nowIso = new Date(selectedDate).toISOString();
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        client_id: clientId || null,
        requested_time: nowIso,
        duration_minutes: totals.totalDuration,
        status: 'pending',
        approval_expires_at: totals.approvalExpiresAt.toISOString(),
      })
      .select()
      .single();

    if (appointmentError || !appointment) {
      setStatusMessage(`Error creating appointment: ${appointmentError?.message}`);
      return;
    }

    const appointmentServices = selectedDefinitions.map((def) => {
      const config = selectedServices[def.key];
      const quantity = parseInt(config?.quantity || '1', 10) || 1;
      const price = Math.max(Number(config?.price || def.basePrice), def.minPrice || def.basePrice);
      const duration = Math.max(Number(config?.duration || def.duration), def.duration);
      const serviceRow = serviceRows.find((s) => s.name === def.name);
      return {
        appointment_id: appointment.id,
        service_id: serviceRow?.id,
        custom_price: price,
        custom_duration_minutes: duration,
        quantity,
      };
    });

    const { error: appointmentServicesError } = await supabase.from('appointment_services').insert(appointmentServices);
    if (appointmentServicesError) {
      setStatusMessage(`Error linking services: ${appointmentServicesError.message}`);
      return;
    }

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        appointment_id: appointment.id,
        client_id: clientId || null,
        subtotal: totals.subtotal,
        tax: totals.tax,
        travel_fee: totals.travel,
        tip: totals.tipAmount,
        discount: totals.discount,
        total: totals.total,
      })
      .select()
      .single();

    if (invoiceError || !invoice) {
      setStatusMessage(`Error creating invoice: ${invoiceError?.message}`);
      return;
    }

    const invoiceItems = selectedDefinitions.map((def) => {
      const config = selectedServices[def.key];
      const quantity = parseInt(config?.quantity || '1', 10) || 1;
      const price = Math.max(Number(config?.price || def.basePrice), def.minPrice || def.basePrice);
      const serviceRow = serviceRows.find((s) => s.name === def.name);
      return {
        invoice_id: invoice.id,
        service_id: serviceRow?.id,
        description: def.name,
        unit_price: price,
        quantity,
        line_total: price * quantity,
      };
    });

    const { error: invoiceItemsError } = await supabase.from('invoice_items').insert(invoiceItems);
    if (invoiceItemsError) {
      setStatusMessage(`Error saving invoice items: ${invoiceItemsError.message}`);
      return;
    }

    setStatusMessage('Appointment request sent. It will auto-expire in 48 hours if not approved.');
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#f5f3ff' }}>
      <Text style={{ fontSize: 24, fontWeight: '800', color: '#6a4ea4', marginBottom: 12 }}>Alyssa's Esthetics Scheduler</Text>

      <View style={styles.section}>
        <Text style={styles.header}>Client & Loyalty</Text>
        <Text style={styles.label}>Client ID (Supabase)</Text>
        <TextInput value={clientId} onChangeText={setClientId} placeholder="Client UUID" style={styles.input} />
        <View style={styles.pill}>
          <Text style={styles.label}>VIP (automatic $25 off fills)</Text>
          <Switch value={isVip} onValueChange={setIsVip} />
        </View>
        <Text style={styles.label}>Loyalty Tier (annual points)</Text>
        <TextInput
          value={loyaltyTier}
          onChangeText={setLoyaltyTier}
          placeholder="standard | tier1 | tier2 | tier3"
          style={styles.input}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Services (multi-select)</Text>
        {SERVICE_DEFINITIONS.map((service) => (
          <View key={service.key} style={{ marginBottom: 12 }}>
            <View style={styles.pill}>
              <Text style={{ fontWeight: '700' }}>{service.name}</Text>
              <Switch value={!!selectedServices[service.key]} onValueChange={() => toggleService(service.key)} />
            </View>
            {selectedServices[service.key] && (
              <View>
                <Text style={styles.label}>Price (base {service.basePrice})</Text>
                <TextInput
                  keyboardType="numeric"
                  value={selectedServices[service.key].price}
                  onChangeText={(v) => updateServiceField(service.key, 'price', v)}
                  style={styles.input}
                />
                <Text style={styles.label}>Duration minutes (base {service.duration})</Text>
                <TextInput
                  keyboardType="numeric"
                  value={selectedServices[service.key].duration}
                  onChangeText={(v) => updateServiceField(service.key, 'duration', v)}
                  style={styles.input}
                />
                <Text style={styles.label}>Quantity</Text>
                <TextInput
                  keyboardType="numeric"
                  value={selectedServices[service.key].quantity}
                  onChangeText={(v) => updateServiceField(service.key, 'quantity', v)}
                  style={styles.input}
                />
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Date & Time</Text>
        <Button title="Pick Date & Time" onPress={() => setShowPicker(true)} />
        {showPicker && (
          <DateTimePicker
            value={selectedDate}
            mode="datetime"
            display="default"
            onChange={(event, selected) => {
              setShowPicker(false);
              if (selected) setSelectedDate(selected);
            }}
          />
        )}
        <Text style={{ marginTop: 8 }}>Selected: {selectedDate.toString()}</Text>
        <Text style={{ color: '#6b7280', marginTop: 4 }}>
          Available: Fri 3 PM–12 AM, Sat/Sun 12 AM–9 PM | At least 2 weeks ahead | Auto-deny after 48 hours if unapproved
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Invoice Builder</Text>
        <Text style={styles.label}>Travel Fee</Text>
        <TextInput keyboardType="numeric" value={travelFee} onChangeText={setTravelFee} style={styles.input} />
        <Text style={styles.label}>Tip</Text>
        <TextInput keyboardType="numeric" value={tip} onChangeText={setTip} style={styles.input} />
        <Text style={styles.label}>Tax %</Text>
        <TextInput keyboardType="numeric" value={taxRate} onChangeText={setTaxRate} style={styles.input} />

        <Text style={{ fontWeight: '700', marginTop: 8 }}>Subtotal: ${totals.subtotal.toFixed(2)}</Text>
        <Text>Discounts (VIP + tier on fills): -${totals.discount.toFixed(2)}</Text>
        <Text>Travel Fee: ${totals.travel.toFixed(2)}</Text>
        <Text>Tip: ${totals.tipAmount.toFixed(2)}</Text>
        <Text>Tax: ${totals.tax.toFixed(2)}</Text>
        <Text style={{ fontSize: 18, fontWeight: '800', marginTop: 4 }}>Total: ${totals.total.toFixed(2)}</Text>
        <Text style={{ color: '#374151' }}>Duration: {totals.totalDuration} minutes</Text>
        <Text style={{ color: '#6b7280' }}>Estimated points earned: {totals.points}</Text>
      </View>

      <View style={{ marginBottom: 32 }}>
        <Button title="Request Appointment & Save Invoice" onPress={book} />
        {statusMessage ? <Text style={{ marginTop: 8, color: '#047857' }}>{statusMessage}</Text> : null}
      </View>
    </ScrollView>
  );
}
