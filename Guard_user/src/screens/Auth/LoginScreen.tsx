import React, { use, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useDispatch } from 'react-redux';

import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { CustomInput } from '../../components/CustomeInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { setClientLogin } from '../../redux/authSlice';

import { authApi } from '../../api/endpoints';
import { storage } from '../../utils/storage';
import { connectSocket } from '../../services/socket';

const loginSchema = Yup.object().shape({
    identifier: Yup.string()
        .required("Mobile number or email is required"),
    password: Yup.string()
        .min(6, "PAssword mut be at least 6 character")
        .required("Password is required"),
});

export const LoginScreen: React.FC<ScreenProps<'Login'>> = ({ navigation }) => {

    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(loginSchema),
        defaultValues: {
            identifier: "",
            password: "",
        },
    });

    const onSubmit = async(data: { identifier: string; password: string }) => {
        setIsSubmitting(true);
        try {
            const response = await authApi.login(data.identifier, data.password);
            const { token, user } = response.data.data;

            if (user.role !== 'client') {
                Alert.alert("Wrong App", "This account is not for the user app.")
                return;
            }

            await storage.setToken(token);
            await storage.setUser(user);
            dispatch(setClientLogin({ user, token }));
            connectSocket(token);

            navigation.reset({
                index: 0,
                routes: [{ name: "MainTabs" }],
            });
        } catch (error: any) {
            const message = error?.response?.data?.message || "Invalid credentials. Please try again.";
            Alert.alert("Login failed", message);
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

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.flexOne}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Welcome Back!</Text>
                        <Text style={styles.subtitle}>Login to continue</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.label}>Mobile Number / Email</Text>
                        <Controller
                            control={control}
                            name="identifier"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <CustomInput
                                    placeholder="Enter mobile number or email"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    autoCapitalize="none"
                                    error={errors.identifier?.message}
                                    touched={Boolean(errors.identifier)}
                                />
                            )}
                        />

                        <Text style={styles.label}>Password</Text>
                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <CustomInput
                                    placeholder="Enter password"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    isPassword={true}
                                    error={errors.password?.message}
                                    touched={Boolean(errors.password)}
                                />
                            )}
                        />

                        <TouchableOpacity
                            style={styles.forgotBtn}
                            onPress={() => navigation.navigate('ForgotPassword')}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.forgotText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <PrimaryButton
                            title="Login"
                            onPress={handleSubmit(onSubmit)}
                            isLoading={isSubmitting}
                            style={styles.loginBtn}
                        />
                    </View>

                    <View style={styles.footerRow}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SignUp')} activeOpacity={0.7}>
                            <Text style={styles.signupLink}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    flexOne: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 36,
        paddingBottom: 28,
    },
    header: {
        marginBottom: 28,
    },
    title: {
        fontSize: 26,
        fontWeight: '900',
        color: COLORS.primary,
    },
    subtitle: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginTop: 6,
    },
    formContainer: {
        width: '100%',
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 6,
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginTop: -4,
        marginBottom: 22,
    },
    forgotText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#2563EB',
    },
    loginBtn: {
        backgroundColor: COLORS.primary,
        height: 52,
        borderRadius: 12,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 22,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    orText: {
        marginHorizontal: 12,
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: '600',
    },
    phoneLoginBtn: {
        flexDirection: 'row',
        height: 52,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        borderWidth: 1.5,
        borderColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    phoneLoginText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 36,
    },
    footerText: {
        fontSize: 13,
        color: COLORS.textMuted,
    },
    signupLink: {
        fontSize: 13,
        fontWeight: '800',
        color: '#2563EB',
    },
});
