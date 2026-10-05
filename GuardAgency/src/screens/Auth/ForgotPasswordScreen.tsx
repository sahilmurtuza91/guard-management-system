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

const ForgotSchema = Yup.object({
    emailOrPhone: Yup.string()
        .trim()
        .required('Email or mobile number is required'),
});

type ForgotForm = Yup.InferType<typeof ForgotSchema>;

export const ForgotPasswordScreen: React.FC<ScreenProps<'ForgotPassword'>> = ({ navigation }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors } } = useForm<ForgotForm>({
            resolver: yupResolver(ForgotSchema),
            defaultValues: { emailOrPhone: '' },
        });

    const handleSubmitForm = async ({ emailOrPhone }: ForgotForm) => {
        setIsSubmitting(true);
        try {
            const response = await authApi.forgotPassword(emailOrPhone.trim());
            const { userId } = response.data.data;
            navigation.navigate('OTPVerification',
                { userId, identifier: emailOrPhone.trim() }
            );
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Could not send OTP. Please try again.';
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
                    <Text style={styles.title}>Forgot Password</Text>
                    <Text style={styles.subtitle}>
                        Enter your registered email or mobile number.
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <Controller
                        control={control}
                        name="emailOrPhone"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <CustomInput
                                label="Email or Mobile Number"
                                placeholder="Email or Mobile Number"
                                value={value ?? ''}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                autoCapitalize="none"
                                error={errors.emailOrPhone?.message}
                                touched={Boolean(errors.emailOrPhone)}
                            />
                        )}
                    />

                    <PrimaryButton
                        title="Send Reset Link"
                        onPress={handleSubmit(handleSubmitForm)}
                        isLoading={isSubmitting}
                        style={styles.actionBtn}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ForgotPasswordScreen;

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
    actionBtn: {
        marginTop: 24,
    },
});