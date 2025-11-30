import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { supabase } from '../supabase';

export default function PortalScreen() {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('clients').select('*');
      setClients(data || []);
    };
    load();
  }, []);

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      {clients.map((c) => (
        <View key={c.id} style={{ marginBottom: 16, padding: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '700' }}>{c.first_name} {c.last_name}</Text>
          <Text>{c.email}</Text>
          <Text>{c.phone}</Text>
          <Text>{c.home_address}</Text>
          <Text>DOB: {c.date_of_birth}</Text>
          <Text>Race/Ethnicity: {c.race_ethnicity}</Text>
          <Text>Medications: {c.current_medications}</Text>
          <Text>Pregnant: {c.is_pregnant ? 'Yes' : 'No'} | Breastfeeding: {c.is_breastfeeding ? 'Yes' : 'No'}</Text>
          <Text>VIP: {c.is_vip ? 'Yes ($25 off fills)' : 'No'}</Text>
          <Text>Loyalty Tier: {c.loyalty_tier} | Points: {c.loyalty_points}</Text>
          <Text>Card Token on file: {c.card_token ? 'Yes' : 'No'}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
