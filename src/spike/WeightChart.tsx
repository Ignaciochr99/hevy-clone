import { View } from 'react-native';
import { CartesianChart, Line } from 'victory-native';

const DATA = [
  { day: 1, weight: 60 },
  { day: 2, weight: 62.5 },
  { day: 3, weight: 62.5 },
  { day: 4, weight: 65 },
  { day: 5, weight: 67.5 },
];

export function WeightChart() {
  return (
    <View style={{ height: 240, width: '100%' }}>
      <CartesianChart data={DATA} xKey="day" yKeys={['weight']}>
        {({ points }) => (
          <Line points={points.weight} color="#4f9cff" strokeWidth={3} />
        )}
      </CartesianChart>
    </View>
  );
}
