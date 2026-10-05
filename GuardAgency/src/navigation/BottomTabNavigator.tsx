import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../constants/theme';
import { BottomTabParamList } from './types';

import AgencyDashboardScreen from '../screens/Dashboard/AgencyDashboardScreen';
import GuardRequestsListScreen from '../screens/Requests/GuardRequestsListScreen';
import GuardsListScreen from '../screens/Guards/GuardsListScreen';
import ShiftCalendarScreen from '../screens/Operations/ShiftCalendarScreen';
import AgencyProfileScreen from '../screens/Profile/AgencyProfileScreen';

const Tab = createBottomTabNavigator<BottomTabParamList>();

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 6 },
        tabBarIcon: ({ color, size }) => {
          let iconName: string = 'square';
          if (route.name === 'DashboardTab') iconName = 'home';
          else if (route.name === 'RequestsTab') iconName = 'document-text';
          else if (route.name === 'GuardsTab') iconName = 'shield';
          else if (route.name === 'OperationsTab') iconName = 'calendar';
          else if (route.name === 'ProfileTab') iconName = 'person';

          return <Ionicons name={iconName as any} size={size || 22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="DashboardTab" component={AgencyDashboardScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="RequestsTab" component={GuardRequestsListScreen} options={{ title: 'Requests' }} />
      <Tab.Screen
        name="GuardsTab"
        component={GuardsListScreen as React.ComponentType<any>}
        options={{ title: 'Guards' }}
      />
      <Tab.Screen
        name="OperationsTab"
        component={ShiftCalendarScreen as React.ComponentType<any>}
        options={{ title: 'Operations' }}
      />
      <Tab.Screen name="ProfileTab" component={AgencyProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;