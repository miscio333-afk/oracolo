import { useLocalSearchParams } from 'expo-router';
import { ReadingScreenContent } from '../../components/ReadingScreen';

export default function ReadingRoute() {
  const { type } = useLocalSearchParams<{ type: string }>();
  return <ReadingScreenContent type={type ?? 'free'} />;
}
