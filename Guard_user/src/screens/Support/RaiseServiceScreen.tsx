import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { IssueOptionCard } from '../../components/IssueOptionCard';

const ISSUE_TYPES = [
  { id: 'behavior', title: 'Guard Behavior', desc: 'Report an issue related to behavior' },
  { id: 'arrival', title: 'Guard Late Arrived', desc: 'Guard arrived later than scheduled time' },
  { id: 'service', title: 'Poor Service', desc: 'Dissatisfied with overall service quality' },
  { id: 'other', title: 'Other Issue', desc: 'Any other issues or concerns' },
];

export const RaiseServiceScreen: React.FC<ScreenProps<'RaiseService'>> = ({
  navigation,
  route,
}) => {
  const [selectedIssue, setSelectedIssue] = useState<string>('behavior');

  const handleNext = () => {
    navigation.navigate('IssueDetails', { issueType: selectedIssue, requestId: route.params?.requestId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader title="Raise Service" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Select the type of issue you are facing:</Text>

        <View style={styles.list}>
          {ISSUE_TYPES.map(item => (
            <IssueOptionCard
              key={item.id}
              title={item.title}
              desc={item.desc}
              isSelected={selectedIssue === item.id}
              onPress={() => setSelectedIssue(item.id)}
            />
          ))}
        </View>

        <PrimaryButton
          title="Next: Issue Details"
          onPress={handleNext}
          style={styles.nextBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default RaiseServiceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: { padding: 20 },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 16, fontWeight: '600' },
  list: { gap: 12 },
  nextBtn: { marginTop: 30 },
});