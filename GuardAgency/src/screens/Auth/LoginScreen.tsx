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
import { useDispatch } from 'react-redux';
import { COLORS } from '../../constants/theme';
import { ScreenProps } from '../../navigation/types';
import { CustomInput } from '../../components/CustomeInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { authApi } from '../../api/endpoints';
import { storage } from '../../utils/storage';
import { setCredentials } from '../../redux/agencySlice';
import { connectSocket } from '../../services/socket';


const LoginSchema = Yup.object({
    emailOrPhone: Yup.string()
        .trim()
        .required('Email or mobile number is required'),
    password: Yup.string()
        .required('Password is required'),
});

type LoginForm = Yup.InferType<typeof LoginSchema>;

export const LoginScreen: React.FC<ScreenProps<'Login'>> = ({ navigation }) => {
    const dispatch = useDispatch();
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors } } = useForm<LoginForm>({
            resolver: yupResolver(LoginSchema),
            defaultValues: { emailOrPhone: '', password: '' },
        });

    const handleLogin = async ({ emailOrPhone, password }: LoginForm) => {
        setIsLoggingIn(true);
        try {
            const response = await authApi.login(emailOrPhone.trim(), password);
            const { token, user } = response.data.data;
            await storage.setToken(token);
            await storage.setUser(user);
            dispatch(setCredentials({ token, user }));
            connectSocket(token, user?.agency);
            navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }]
            });
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Login failed. Please check your credentials.';
            Alert.alert('Login Failed', message);
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleForgotPassword = () => {
        navigation.navigate('ForgotPassword');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle="dark-content"
                {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})}
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.headerContainer}>
                    <View style={styles.logoBadge}>
                        <Ionicons name="shield" size={32} color={COLORS.primary} />
                    </View>
                    <Text style={styles.welcomeTitle}>Welcome Back!</Text>
                    <Text style={styles.welcomeSubtitle}>Login to your agency account</Text>
                </View>

                <View style={styles.formContainer}>
                    <Controller
                        control={control}
                        name="emailOrPhone"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <CustomInput
                                label="Email or Mobile Number"
                                placeholder="Enter email or mobile number"
                                value={value ?? ''}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                autoCapitalize="none"
                                error={errors.emailOrPhone?.message}
                                touched={Boolean(errors.emailOrPhone)}
                            />
                        )}
                    />

                    <View style={styles.labelRow}>
                        <Text style={styles.label}>Password</Text>
                        <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
                            <Text style={styles.forgotText}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>

                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <CustomInput
                                placeholder="Password"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                isPassword
                                autoCapitalize="none"
                                error={errors.password?.message}
                                touched={Boolean(errors.password)}
                            />
                        )}
                    />

                    <PrimaryButton
                        title="Login"
                        onPress={handleSubmit(handleLogin)}
                        isLoading={isLoggingIn}
                        style={styles.loginBtn}
                    />

                </View>
            </ScrollView>
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
    scrollContent: {
        padding: 24,
        justifyContent: 'center',
        flexGrow: 1,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoBadge: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#BFDBFE',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.textPrimary,
    },
    welcomeSubtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 4,
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
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 6,
    },
    forgotText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.primary,
    },
    passwordContainer: {
        position: 'relative',
    },
    eyeIcon: {
        position: 'absolute',
        right: 14,
        top: 14,
    },
    loginBtn: {
        marginTop: 24,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    dividerText: {
        marginHorizontal: 12,
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textMuted,
    },
    phoneLoginBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        height: 48,
        gap: 8,
    },
    phoneLoginText: {
        fontSize: 13,
        fontWeight: '800',
        color: COLORS.primary,
    },
    registerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    registerSubText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    registerLinkText: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.primary,
    },
});