import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  OtpVerification: { target: string; userId?: string; mode?: 'signup' | 'reset' };
  ForgotPassword: undefined;
  ResetPassword: { target?: string; userId?: string; otp?: string };
  CreateProfile: undefined;
  MainTabs: undefined;
  GuardCategory: undefined;
  ServiceDetails: { categoryId: string; categoryName: string };
  SelectDateTime: undefined;
  GuardCountRequirements: undefined;
  SelectDutyLocation: undefined;
  AdditionalInstructions: undefined;
  RequestReview: undefined;
  RequestSuccess: { requestId: string };
  MyRequests: undefined;
  RequestDetails: { requestId: string };
  RequestTimeline: { requestId: string };
  AssignedGuardDetails: { requestId: string; guardId?: string };
  ActiveDutyTracking: { requestId: string };

  ModifyRequest: { requestId: string };
  CancelRequest: { requestId: string };
  RequestReplacement: { requestId: string };
  SOS: { requestId?: string };
  ServiceSummary: { requestId: string };
  RateReview: { requestId: string };

  Notifications: undefined;
  Profile: undefined;
  EditProfile: undefined;
  SavedAddresses: undefined;
  NotificationSettings: undefined;
  ChangePassword: undefined;
  ReviewRequest: undefined;
  RequestStatusTimeline: { requestId: string };
  RaiseService: { requestId?: string } | undefined;
  IssueDetails: { issueType: string; requestId?: string };

  HelpSupport: undefined;
};

export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type BottomTabParamList = {
  HomeTab: undefined;
  MyRequestsTab: undefined;
  HireTab: undefined;
  NotificationsTab: undefined;
  ProfileTab: undefined;
};