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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants/theme';

interface CustomInputProps extends TextInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: TextInputProps['onBlur'];
  isPassword?: boolean;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  numberOfLines?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string | any;
  touched?: boolean | any;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  placeholder,
  value,
  onChangeText,
  onBlur,
  isPassword = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  autoCapitalize = 'sentences',
  error,
  touched,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isError = touched && Boolean(error);

  return (
    <View style={styles.container}>
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
          secureTextEntry={isPassword ? !showPassword : false}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          autoCapitalize={autoCapitalize}
          style={[styles.input, multiline && styles.multilineInput]}
        />

        {isPassword && !multiline && (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setShowPassword((prev) => !prev)}
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

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
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
  },
});