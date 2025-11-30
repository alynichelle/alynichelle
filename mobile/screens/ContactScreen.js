import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import { supabase } from '../supabase';

export default function ContactScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [clientId, setClientId] = useState('');

  const loadMessages = async () => {
    const query = supabase.from('messages').select('*').order('sent_at', { ascending: false });
    if (clientId) query.eq('client_id', clientId);
    const { data } = await query;
    setMessages(data || []);
  };

  useEffect(() => {
    loadMessages();
  }, [clientId]);

  const send = async () => {
    await supabase.from('messages').insert({ content: message, sender: 'client', client_id: clientId || null });
    setMessage('');
    loadMessages();
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Client ID (for threading)</Text>
      <TextInput
        value={clientId}
        onChangeText={setClientId}
        placeholder="Client UUID"
        style={{ borderWidth: 1, marginBottom: 10 }}
      />
      <TextInput
        value={message}
        onChangeText={setMessage}
        style={{ borderWidth: 1, marginBottom: 10 }}
        placeholder="Message"
      />
      <Button title="Send" onPress={send} />
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text>{item.sender}: {item.content}</Text>
        )}
      />
    </View>
  );
}
