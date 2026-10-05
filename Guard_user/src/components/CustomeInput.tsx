import React, { useState } from 'react';
import {
  TextInput,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardTypeOptions,
  TextInputProps,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../constants/them';

export interface CustomInputProps extends TextInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: TextInputProps['onBlur'];
  label?: string;
  isPassword?: boolean;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  numberOfLines?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string | any;
  touched?: boolean | any;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  isPassword = false,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  autoCapitalize = 'sentences',
  error,
  touched,
  style,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const shouldHideText = (isPassword || secureTextEntry) && !showPassword;
  const isPasswordField = isPassword || secureTextEntry;
  const isError = touched && Boolean(error);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputContainer,
          multiline && styles.multilineContainer,
          isError && styles.inputErrorBorder,
        ]}
      >
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          secureTextEntry={shouldHideText}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          autoCapitalize={autoCapitalize}
          style={[styles.input, multiline && styles.multilineInput, style]}
          {...props}
        />

        {isPasswordField && !multiline && (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setShowPassword(prev => !prev)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {isError && <Text style={styles.errorText}>{String(error)}</Text>}
    </View>
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 52,
    paddingHorizontal: 16,
  },
  multilineContainer: {
    height: 110,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    height: '100%',
    paddingVertical: 0,
  },
  multilineInput: {
    textAlignVertical: 'top',
    height: '100%',
  },
  iconBtn: {
    paddingLeft: 10,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputErrorBorder: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
});