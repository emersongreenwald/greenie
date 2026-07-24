import { TouchableOpacity, Text } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  loadingLabel?: string;
  variant?: 'primary' | 'danger';
  disabled?: boolean;
}

export function Button({
  label,
  onPress,
  loading = false,
  loadingLabel,
  variant = 'primary',
  disabled = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  if (variant === 'danger') {
    return (
      <TouchableOpacity onPress={onPress} disabled={isDisabled}>
        <Text className="text-red-500 font-medium text-base">{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      className="bg-brand rounded-xl py-4 items-center"
      onPress={onPress}
      disabled={isDisabled}
      style={{ opacity: isDisabled ? 0.6 : 1 }}
    >
      <Text className="text-white font-semibold text-base">
        {loading && loadingLabel ? loadingLabel : label}
      </Text>
    </TouchableOpacity>
  );
}
