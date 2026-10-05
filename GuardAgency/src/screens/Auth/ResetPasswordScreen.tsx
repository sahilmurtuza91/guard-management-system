import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    StatusBar,
    Platform,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/theme';
import { ScreenProps } from '../../navigation/types';
import { CustomInput } from '../../components/CustomeInput';
import { PrimaryButton } from '../../components/PrimaryButton';

import { authApi } from '../../api/endpoints';

const ResetSchema = Yup.object({
    newPassword: Yup.string()
        .min(6, 'Password must be at least 6 characters long')
        .required('New password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Passwords do not match')
        .required('Please confirm your password'),
});

type ResetForm = Yup.InferType<typeof ResetSchema>;

export const ResetPasswordScreen: React.FC<ScreenProps<'ResetPassword'>> = ({ navigation, route }) => {
    const { userId, otp } = route.params || {};
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { 
        control, 
        handleSubmit, 
        formState: { errors } } = useForm<ResetForm>({
        resolver: yupResolver(ResetSchema),
        defaultValues: { newPassword: '', confirmPassword: '' },
    });

    const handleResetPassword = async ({ newPassword }: ResetForm) => {
        if (!userId || !otp) {
            Alert.alert('Error', 'Session expired. Please restart the forgot password process.');
            navigation.navigate('ForgotPassword');
            return;
        }

        setIsSubmitting(true);
        try {
            await authApi.resetPassword(userId, otp, newPassword);
            Alert.alert('Success', 'Password reset successfully! Please login with your new password.', [
                { text: 'Login Now', onPress: () => navigation.navigate('Login') },
            ]);
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Could not reset password. Please try again.';
            Alert.alert('Error', message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle="dark-content"
                {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})}
            />

            <View style={styles.headerBar}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Create New Password</Text>
                    <Text style={styles.subtitle}>
                        Your new password must be different from your previous password.
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <Controller
                        control={control}
                        name="newPassword"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <CustomInput
                                label="New Password"
                                placeholder="New Password"
                                value={value ?? ''}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                isPassword
                                autoCapitalize="none"
                                error={errors.newPassword?.message}
                                touched={Boolean(errors.newPassword)}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="confirmPassword"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <CustomInput
                                label="Confirm Password"
                                placeholder="Confirm Password"
                                value={value ?? ''}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                isPassword
                                autoCapitalize="none"
                                error={errors.confirmPassword?.message}
                                touched={Boolean(errors.confirmPassword)}
                            />
                        )}
                    />

                    <PrimaryButton
                        title="Reset Password"
                        onPress={handleSubmit(handleResetPassword)}
                        isLoading={isSubmitting}
                        style={styles.actionBtn}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    headerBar: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        padding: 24,
        flexGrow: 1,
    },
    headerContainer: {
        marginBottom: 28,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.textPrimary,
    },
    subtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 6,
        lineHeight: 18,
    },
    formContainer: {
        width: '100%',
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 6,
    },
    inputWrapper: {
        position: 'relative',
    },
    eyeIcon: {
        position: 'absolute',
        right: 14,
        top: 14,
    },
    actionBtn: {
        marginTop: 28,
    },
});