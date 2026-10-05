import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

import SplashScreen from '../screens/Splash/SplashScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import OTPVerificationScreen from '../screens/Auth/OTPVerificationScreen';
import CreateNewPasswordScreen from '../screens/Auth/CreateNewPasswordScreen';

import ShiftDetailsScreen from '../screens/Shifts/ShiftDetailsScreen';
import ReportIncidentScreen from '../screens/Incidents/ReportIncidentScreen';
import IncidentDetailsScreen from '../screens/Incidents/IncidentDetailsScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import DutyLocationMapScreen from '../Map/DutyLocationMapScreen';
import ChangePasswordScreen from '../screens/Profile/ChangePasswordScreen';
import HelpSupportScreen from '../screens/Profile/HelpSupportScreen';

import BottomTabNavigator from './BottomTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="OtpVerification" component={OTPVerificationScreen} />
        <Stack.Screen name="SetPassword" component={CreateNewPasswordScreen} />

        <Stack.Screen name="Dashboard" component={BottomTabNavigator} />

        <Stack.Screen name='ShiftDetails' component={ShiftDetailsScreen} />
        <Stack.Screen name="ReportIncident" component={ReportIncidentScreen} />
        <Stack.Screen name='IncidentDetails' component={IncidentDetailsScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name='Notifications' component={NotificationsScreen} />
        <Stack.Screen name='DutyLocationMap' component={DutyLocationMapScreen} />
        <Stack.Screen name='ChangePassword' component={ChangePasswordScreen} />
        <Stack.Screen name='HelpSupport' component={HelpSupportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;