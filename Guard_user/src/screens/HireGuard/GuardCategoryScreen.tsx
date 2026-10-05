import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform
} from 'react-native';
import { useDispatch } from 'react-redux';
import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { CategoryCard } from '../../components/CategoryCard';
import { LoadingState } from '../../components/LoadingState';
import { updateHireDraft } from '../../redux/hireGuardSlice';

import { userApi } from '../../api/endpoints';

const CATEGORY_STYLE: Record<string, { desc: string; icon: string; iconColor: string; iconBg: string }> = {
  'CAT-1': { desc: 'For high security areas & cash management', icon: 'shield', iconColor: '#2563EB', iconBg: '#EFF6FF' },
  'CAT-2': { desc: 'For general security, residential & commercial', icon: 'person', iconColor: '#16A34A', iconBg: '#DCFCE7' },
  'CAT-3': { desc: 'For crowd control, parties & VIP events', icon: 'people', iconColor: '#7C3AED', iconBg: '#F5F3FF' },
  'CAT-4': { desc: 'For close executive & VIP personal protection', icon: 'walk', iconColor: '#D97706', iconBg: '#FEF3C7' },
  'CAT-5': { desc: 'Custom security guard requirements', icon: 'apps', iconColor: '#64748B', iconBg: '#F1F5F9' },
};
const DEFAULT_STYLE = { desc: 'Custom security guard requirements', icon: 'apps', iconColor: '#64748B', iconBg: '#F1F5F9' };

interface CategoryUI {
  id: string;
  title: string;
  desc: string;
  icon: string;
  iconColor: string;
  iconBg: string;
}

export const GuardCategoryScreen: React.FC<ScreenProps<'GuardCategory'>> = ({
  navigation,
}) => {
  const dispatch = useDispatch();
  const [categories, setCategories] = useState<CategoryUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    userApi
      .getCategories()
      .then((res) => {
        const list = res.data.data.categories || [];
        if (!isMounted) return;
        setCategories(
          list.map((cat: any) => ({
            id: cat.id,
            title: cat.name,
            ...(CATEGORY_STYLE[cat.id] || DEFAULT_STYLE),
          }))
        );
      })
      .catch((error) => console.log('Categories load error: ', error))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectCategory = (cat: CategoryUI) => {
    dispatch(
      updateHireDraft({
        categoryId: cat.id,
        categoryName: cat.title,
        serviceType: cat.title,
      })
    );
    navigation.navigate('ServiceDetails', {
      categoryId: cat.id,
      categoryName: cat.title,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader title="Select Service Category" onBackPress={() => navigation.navigate('MainTabs')} />

      {isLoading ? (
        <LoadingState message="Loading categories..." />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.heading}>Choose Service Type</Text>
          <Text style={styles.subHeading}>Choose the type of security service you need</Text>

          <View style={styles.list}>
            {categories.map(cat => (
              <CategoryCard
                key={cat.id}
                title={cat.title}
                desc={cat.desc}
                icon={cat.icon}
                iconColor={cat.iconColor}
                iconBg={cat.iconBg}
                onPress={() => handleSelectCategory(cat)}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default GuardCategoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    padding: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  subHeading: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  list: {
    gap: 12,
  },
});