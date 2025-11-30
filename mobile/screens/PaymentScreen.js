import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { supabase } from '../supabase';

export default function PaymentScreen() {
  const [clientId, setClientId] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [brand, setBrand] = useState('');
  const [last4, setLast4] = useState('');
  const [exp, setExp] = useState('');

  const save = async () => {
    if (!paymentMethodId) {
      Alert.alert('Add a Stripe payment method ID first.');
      return;
    }

    const [expMonth, expYear] = exp.split('/').map((v) => parseInt(v.trim(), 10));
    const { error } = await supabase.from('payment_methods').insert({
      client_id: clientId || null,
      stripe_payment_method_id: paymentMethodId,
      brand: brand || null,
      last4: last4 || null,
      exp_month: expMonth || null,
      exp_year: expYear || null,
    });

    if (error) {
      Alert.alert('Unable to save payment method', error.message);
    } else {
      Alert.alert('Saved! Card lives in Stripe, not in-app.');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Stripe on file</Text>
      <Text>Client ID (Supabase)</Text>
      <TextInput value={clientId} onChangeText={setClientId} placeholder="Client UUID" style={{ borderWidth: 1, marginBottom: 10 }} />
      <Text>Payment Method ID (Stripe)</Text>
      <TextInput value={paymentMethodId} onChangeText={setPaymentMethodId} placeholder="pm_123" style={{ borderWidth: 1, marginBottom: 10 }} />
      <Text>Brand (e.g., Visa)</Text>
      <TextInput value={brand} onChangeText={setBrand} style={{ borderWidth: 1, marginBottom: 10 }} />
      <Text>Last 4</Text>
      <TextInput value={last4} onChangeText={setLast4} keyboardType="numeric" style={{ borderWidth: 1, marginBottom: 10 }} />
      <Text>Expiration (MM/YYYY)</Text>
      <TextInput value={exp} onChangeText={setExp} placeholder="02/2027" style={{ borderWidth: 1, marginBottom: 10 }} />
      <Button title="Save Stripe Payment Method" onPress={save} />
      <Text style={{ color: '#6b7280', marginTop: 10 }}>
        Use @stripe/stripe-react-native to tokenize cards securely; only store the payment_method ID in Supabase.
      </Text>
    </View>
  );
}
