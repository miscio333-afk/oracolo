import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Speech from 'expo-speech';
import { supabase } from './supabase';

const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function toBase64(bytes: Uint8Array) {
  let output = '';
  for (let index = 0; index < bytes.length; index += 3) {
    const a = bytes[index];
    const b = index + 1 < bytes.length ? bytes[index + 1] : 0;
    const c = index + 2 < bytes.length ? bytes[index + 2] : 0;
    const triple = (a << 16) | (b << 8) | c;
    output += BASE64[(triple >> 18) & 63];
    output += BASE64[(triple >> 12) & 63];
    output += index + 1 < bytes.length ? BASE64[(triple >> 6) & 63] : '=';
    output += index + 2 < bytes.length ? BASE64[triple & 63] : '=';
  }
  return output;
}

export async function synthesizeReading(text: string) {
  if (Platform.OS === 'web' || !supabase || !text.trim() || !FileSystem.cacheDirectory) return null;

  const response = await supabase.functions.invoke('belline-tts', {
    body: { text: text.trim(), voice: 'it-IT-IsabellaNeural' },
  });
  if (response.error || !response.data) return null;

  const data = response.data as Blob | ArrayBuffer;
  const bytes = data instanceof ArrayBuffer
    ? new Uint8Array(data)
    : new Uint8Array(await data.arrayBuffer());
  if (!bytes.length) return null;

  const uri = `${FileSystem.cacheDirectory}belline-tts-${Date.now()}.mp3`;
  await FileSystem.writeAsStringAsync(uri, toBase64(bytes), {
    encoding: FileSystem.EncodingType.Base64,
  });
  return uri;
}

export function speakWithSystemVoice(text: string) {
  Speech.stop();
  Speech.speak(text, { language: 'it-IT', rate: 0.9, pitch: 0.95 });
}

export function stopSystemVoice() {
  Speech.stop();
}
