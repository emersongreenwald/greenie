import { TextInput } from 'react-native';
import type { TextInputProps } from 'react-native';
import { fonts } from '../../constants/theme';

interface InputProps extends Pick<TextInputProps,
  | 'secureTextEntry'
  | 'autoCapitalize'
  | 'autoCorrect'
  | 'keyboardType'
> {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
}

export function Input({ placeholder, value, onChangeText, ...props }: InputProps) {
  return (
    <TextInput
      className="border border-[#e0d9d0] rounded-2xl px-4 py-3.5 text-[15px] text-charcoal mb-4 bg-white"
      placeholder={placeholder}
      placeholderTextColor="#7e9488"
      value={value}
      onChangeText={onChangeText}
      style={{ fontFamily: fonts.regular }}
      {...props}
    />
  );
}
