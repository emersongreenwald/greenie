import { TouchableOpacity, Text } from 'react-native';
import { fonts } from '../../constants/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  loadingLabel?: string;
  variant?: 'primary' | 'ghost' | 'danger';
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
  const displayLabel = loading && loadingLabel ? loadingLabel : label;

  if (variant === 'danger') {
    return (
      <TouchableOpacity onPress={onPress} disabled={isDisabled} className="items-center py-2">
        <Text style={{ fontFamily: fonts.medium }} className="text-[#dc4f4f] text-sm">
          {displayLabel}
        </Text>
      </TouchableOpacity>
    );
  }

  if (variant === 'ghost') {
    return (
      <TouchableOpacity
        className="border border-brand rounded-2xl py-4 items-center"
        onPress={onPress}
        disabled={isDisabled}
        style={{ opacity: isDisabled ? 0.5 : 1 }}
      >
        <Text style={{ fontFamily: fonts.semibold }} className="text-brand text-[13px]">
          {displayLabel}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      className="bg-brand rounded-2xl py-4 items-center"
      onPress={onPress}
      disabled={isDisabled}
      style={{ opacity: isDisabled ? 0.5 : 1 }}
    >
      <Text style={{ fontFamily: fonts.semibold }} className="text-white text-[13px]">
        {displayLabel}
      </Text>
    </TouchableOpacity>
  );
}
