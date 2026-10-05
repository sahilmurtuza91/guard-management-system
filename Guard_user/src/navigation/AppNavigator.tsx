import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

// Auth Screens
import { SplashScreen } from '../screens/Splash/SplashScreen';
import { WelcomeScreen } from '../screens/Auth/WelcomeScreen';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { SignUpScreen } from '../screens/Auth/SignUpScreen';
import { OtpVerificationScreen } from '../screens/Auth/OtpVerificationScreen';
import { ForgotPasswordScreen } from '../screens/Auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/Auth/ResetPasswordScreen';
import { CreateProfileScreen } from '../screens/Auth/CreateProfileScreen';

// Main Tab Flow
import { BottomTabNavigator } from './BottomTabNavigator';

// Hire a Guard Flow
import GuardCategoryScreen from '../screens/HireGuard/GuardCategoryScreen';
import { ServiceDetailsScreen } from '../screens/HireGuard/ServiceDetailsScreen';
import { SelectDateTimeScreen } from '../screens/HireGuard/SelectDateTimeScreen';
import { GuardCountRequirementsScreen } from '../screens/HireGuard/GuardCountRequirementsScreen';
import { SelectDutyLocationScreen } from '../screens/HireGuard/SelectDutyLocationScreen';
import { AdditionalInstructionsScreen } from '../screens/HireGuard/AdditionalInstructionsScreen';
import { ReviewRequestScreen } from '../screens/HireGuard/RequestReviewScreen';
import { RequestSuccessScreen } from '../screens/HireGuard/RequestSuccessScreen';

// Requests & Tracking Screens
import { MyRequestsScreen } from '../screens/Requests/MyRequestsScreen';
import { RequestDetailsScreen } from '../screens/Requests/RequestDetailsScreen';
import { RequestStatusTimelineScreen } from '../screens/Requests/RequestStatusTimelineScreen';
import { AssignedGuardDetailsScreen } from '../screens/Guards/AssignedGuardDetailsScreen';
import { ActiveDutyTrackingScreen } from '../screens/Guards/ActiveDutyTrackingScreen';

import { ModifyRequestScreen } from '../screens/Requests/ModifyRequestScreen';
import { CancelRequestScreen } from '../screens/Requests/CancelRequestScreen';
import { RequestReplacementScreen } from '../screens/Requests/RequestReplacementScreen';
import { ServiceSummaryScreen } from '../screens/Requests/ServiceSummaryScreen';
import { RateReviewScreen } from '../screens/Requests/RateReviewScreen';
import { SOSScreen } from '../screens/Support/SOSScreen';


// Notifications & Support Screens
import { NotificationsScreen } from '../screens/Notifications/NotificationsScreen';
import { RaiseServiceScreen } from '../screens/Support/RaiseServiceScreen';
import { IssueDetailsScreen } from '../screens/Support/IssueDetailsScreen';

import { HelpSupportScreen } from '../screens/Support/HelpSupportScreen';

import { SavedAddressesScreen } from '../screens/Profile/SavedAddressesScreen';
import { EditProfileScreen } from '../screens/Profile/EditProfileScreen';
import { ChangePasswordScreen } from '../screens/Profile/ChangePasswordScreen';
import { NotificationSettingsScreen } from '../screens/Profile/NotificationSettingsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />

        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />

        <Stack.Screen name="GuardCategory" component={GuardCategoryScreen} />
        <Stack.Screen name="ServiceDetails" component={ServiceDetailsScreen} />
        <Stack.Screen name="SelectDateTime" component={SelectDateTimeScreen} />
        <Stack.Screen name="GuardCountRequirements" component={GuardCountRequirementsScreen} />
        <Stack.Screen name="SelectDutyLocation" component={SelectDutyLocationScreen} />
        <Stack.Screen name="AdditionalInstructions" component={AdditionalInstructionsScreen} />
        <Stack.Screen name="ReviewRequest" component={ReviewRequestScreen} />
        <Stack.Screen name="RequestSuccess" component={RequestSuccessScreen} />

        <Stack.Screen name="MyRequests" component={MyRequestsScreen} />
        <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} />
        <Stack.Screen name="RequestStatusTimeline" component={RequestStatusTimelineScreen} />
        <Stack.Screen name="AssignedGuardDetails" component={AssignedGuardDetailsScreen} />
        <Stack.Screen name="ActiveDutyTracking" component={ActiveDutyTrackingScreen} />

        <Stack.Screen name="ModifyRequest" component={ModifyRequestScreen} />
        <Stack.Screen name="CancelRequest" component={CancelRequestScreen} />
        <Stack.Screen name="RequestReplacement" component={RequestReplacementScreen} />
        <Stack.Screen name="ServiceSummary" component={ServiceSummaryScreen} />
        <Stack.Screen name="RateReview" component={RateReviewScreen} />
        <Stack.Screen name="SOS" component={SOSScreen} />

        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="RaiseService" component={RaiseServiceScreen} />
        <Stack.Screen name="IssueDetails" component={IssueDetailsScreen} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />

        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="SavedAddresses" component={SavedAddressesScreen} />
        <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;