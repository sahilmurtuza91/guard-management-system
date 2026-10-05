import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    StatusBar,
    Platform,
    Alert,
    KeyboardAvoidingView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { COLORS } from '../../constants/theme';
import { CustomInput } from '../../components/CustomInput';
import { PrimaryButton } from '../../components/PrimaryButton';

import { authApi } from '../../api/endpoints';

const ChangePasswordSchema = Yup.object().shape({
    currentPassword: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Current password is required'),
    newPassword: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('New password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Passwords must match')
        .required('Please confirm your new password'),
});

export const ChangePasswordScreen = ({ navigation }: { navigation: any }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(ChangePasswordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: { currentPassword: string; newPassword: string }) => {
        setIsSubmitting(true);
        try {
            await authApi.changePassword(data.currentPassword, data.newPassword);
            setIsSubmitting(false);
            Alert.alert(
                'Password Changed',
                'Your account password has been updated successfully.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch(error:any){
            setIsSubmitting(false);
            const message = error?.response?.data?.message || 'your current password is wrong. Please try again.' ;
            Alert.alert('Change Failed',message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle="dark-content"
                {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})}
            />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Change Password</Text>
                <View style={styles.placeholderBox} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
                style={styles.flexOne}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >

                    <Text style={styles.fieldLabel}>Current Password</Text>
                    <Controller
                        control={control}
                        name="currentPassword"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <CustomInput
                                placeholder="Enter current password"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                secureTextEntry={true}
                                error={errors.currentPassword?.message}
                                touched={Boolean(errors.currentPassword)}
                            />
                        )}
                    />

                    <Text style={styles.fieldLabel}>New Password</Text>
                    <Controller
                        control={control}
                        name="newPassword"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <CustomInput
                                placeholder="Enter new password"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                secureTextEntry={true}
                                error={errors.newPassword?.message}
                                touched={Boolean(errors.newPassword)}
                            />
                        )}
                    />

                    <Text style={styles.fieldLabel}>Confirm New Password</Text>
                    <Controller
                        control={control}
                        name="confirmPassword"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <CustomInput
                                placeholder="Re-enter new password"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                secureTextEntry={true}
                                error={errors.confirmPassword?.message}
                                touched={Boolean(errors.confirmPassword)}
                            />
                        )}
                    />

                    <PrimaryButton
                        title="Update Password"
                        onPress={handleSubmit(onSubmit)}
                        isLoading={isSubmitting}
                        style={styles.submitBtn}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    flexOne: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    placeholderBox: {
        width: 38,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    fieldLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    submitBtn: {
        backgroundColor: COLORS.primary,
        height: 52,
        borderRadius: 12,
        marginTop: 12,
    },
})