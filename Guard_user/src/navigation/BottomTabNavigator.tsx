import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../constants/them';
import { BottomTabParamList } from './types';

import { DashboardScreen } from '../screens/Dashboard/DashboardScreen';
import { MyRequestsScreen } from '../screens/Requests/MyRequestsScreen';
import { NotificationsScreen } from '../screens/Notifications/NotificationsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator<BottomTabParamList>();

export const BottomTabNavigator = ({ navigation }: any) => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          height: 62,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyRequestsTab"
        component={MyRequestsScreen}
        options={{
          tabBarLabel: 'My Requests',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="HireTab"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Hire',
          tabBarButton: () => (
            <TouchableOpacity
              style={styles.hireCenterBtn}
              onPress={() => navigation.navigate('GuardCategory')}
              activeOpacity={0.85}
            >
              <Ionicons name="person-add-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Notifications',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  hireCenterBtn: {
    top: -16,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf:"center",
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
});