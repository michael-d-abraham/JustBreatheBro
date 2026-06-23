import { Pressable, Text, View } from 'react-native';
import { Exercise } from '@/lib/storage';
import { useTheme } from './Theme';

interface ExerciseContainerProps {
  exercise: Exercise;
  onPress: () => void;
  onInfoPress: () => void;
}

const ExerciseContainer = ({ exercise, onPress, onInfoPress }: ExerciseContainerProps) => {
  const { tokens } = useTheme();

  return (
    <Pressable
      style={{
        backgroundColor: tokens.accentMuted,
        borderRadius: 16,
        padding: 16,
        flex: 1,
        minHeight: 200,
        justifyContent: 'space-between',
      }}
      onPress={onPress}
    >
      {/* Top Section - Symbol and Info Icon */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start' 
      }}>
        {/* Symbol */}
        <View style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: tokens.accentPrimary + '40',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: 32 }}>
            {exercise.symbol}
          </Text>
        </View>

        {/* Info Icon */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation(); // Prevent triggering the card press
            onInfoPress();
          }}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: tokens.textOnAccent,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ 
            color: tokens.textOnAccent, 
            fontSize: 18, 
            fontWeight: '600' 
          }}>
            i
          </Text>
        </Pressable>
      </View>

      {/* Middle Section - Title and Short Description */}
      <View style={{ marginTop: 16 }}>
        <Text style={{ 
          color: tokens.textOnAccent, 
          fontSize: 20, 
          fontWeight: '700',
          marginBottom: 8,
        }}>
          {exercise.title}
        </Text>
        <Text style={{ 
          color: tokens.textOnAccent, 
          fontSize: 14, 
          opacity: 0.8,
          lineHeight: 20,
        }}>
          {exercise.shortDescription}
        </Text>
      </View>
    </Pressable>
  );
};

export default ExerciseContainer;

