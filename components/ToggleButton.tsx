import AppearanceButton from './AppearanceButton';

interface ToggleButtonProps {
  isEnabled: boolean;
  onToggle: () => void;
  label: string;
}

export default function ToggleButton({ isEnabled, onToggle, label }: ToggleButtonProps) {
  return (
    <AppearanceButton 
      isSelected={isEnabled} 
      onPress={onToggle}
    >
      {`${label}: ${isEnabled ? 'ON' : 'OFF'}`}
    </AppearanceButton>
  );
}
