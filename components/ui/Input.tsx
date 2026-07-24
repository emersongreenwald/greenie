import { TextInput } from 'react-native';
import type { TextInputProps } from 'react-native';

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
      className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 mb-4"
      placeholder={placeholder}
      placeholderTextColor="#9ca3af"
      value={value}
      onChangeText={onChangeText}
      {...props}
    />
  );
}
