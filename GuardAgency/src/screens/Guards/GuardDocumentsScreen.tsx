import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useSelector } from 'react-redux';
import { COLORS } from '../../constants/theme';
import { ScreenProps } from '../../navigation/types';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LoadingState } from '../../components/LoadingState';
import { guardManagementApi } from '../../api/endpoints';
import { resolveAssetUrl } from '../../api/client';
import { pickFromGallery, pickFromCamera, PickedImage } from '../../utils/imagePicker';

const REQUIRED_DOCS = [
  'Aadhaar Card',
  'PAN Card',
  'PSARA / Security License',
  'Police Verification',
  'Address Proof',
];
const OTHER_DOC_NAME = 'Other Document';
interface DocumentItem {
  id: string;
  title: string;
  fileUrl?: string;
  uploadedAt?: string;
  status: 'Verified' | 'Pending';
}

type PickerTarget = {
  name: string;
  replaceDocId?: string;
};

const isPdfFile = (url?: string) =>
  !!url && url.toLowerCase().endsWith('.pdf');

export const GuardDocumentsScreen: React.FC<ScreenProps<'GuardDocuments'>> = ({ navigation, route }) => {
  const { guardId, fromAddGuard } = route.params;
  const user = useSelector((state: any) => state.agency?.user);
  const canManage = user?.role === 'agency_admin' || user?.role === 'operations_manager';

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [viewerDoc, setViewerDoc] = useState<DocumentItem | null>(null);

  const mapDocuments = (docs: any[] = []): DocumentItem[] => {
    return docs.map((document: any) => ({
      id: String(document._id),
      title: document.name,
      fileUrl: document.fileUrl,
      uploadedAt: document.uploadedAt,
      status: document.verified ? 'Verified' : 'Pending',
    }));
  };

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const response = await guardManagementApi.getDocuments(guardId);
        setDocuments(mapDocuments(response.data.data.documents));
      } catch (error) {
        console.log('Documents load error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadDocuments();
  }, [guardId]);
  const usedDocumentIds = new Set<string>();
  const checklist = REQUIRED_DOCS.map((title) => {
    const document = documents.find((item) => item.title === title);
    if (document) {
      usedDocumentIds.add(document.id);
    }
    return { title, doc: document };
  });
  const extraDocs = documents.filter(
    (document) => !usedDocumentIds.has(document.id)
  );
  const uploadedRequired = checklist.filter(
    (item) => item.doc
  ).length;

  const uploadPickedFile = async (
    target: PickerTarget,
    image: PickedImage
  ) => {
    setLoadingMessage('Uploading document...');
    try {
      const formData = new FormData();
      formData.append('name', target.name);
      formData.append(
        'file',
        {
          uri: image.uri,
          name: image.name,
          type: image.type,
        } as any
      );
      const response = await guardManagementApi.uploadDocument(guardId, formData);
      if (target.replaceDocId) {
        try {
          await guardManagementApi.deleteDocument(guardId, target.replaceDocId);
        } catch (error) {
          console.log('Old document delete failed:', error);
        }
      }
      let freshDocuments = mapDocuments(response.data.data.documents);
      if (target.replaceDocId) {
        const latestResponse = await guardManagementApi.getDocuments(guardId);
        freshDocuments = mapDocuments(latestResponse.data.data.documents);
      }
      setDocuments(freshDocuments);
      setViewerDoc(null);
      if (!target.replaceDocId) {
        const uploaded = freshDocuments[freshDocuments.length - 1];
        if (uploaded) {
          setViewerDoc(uploaded);
        }
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Could not upload document. Please try again.';
      Alert.alert('Upload Failed', message);
    } finally {
      setLoadingMessage(null);
    }
  };

  const chooseSourceAndUpload = (target: PickerTarget) => {
    Alert.alert(
      target.replaceDocId ? `Replace ${target.name}` : `Upload ${target.name}`, 'Select a source:',
      [
        { text: 'Cancel', style: 'cancel', },
        {
          text: 'Gallery',
          onPress: async () => {
            const image = await pickFromGallery();
            if (image) {
              await uploadPickedFile(target, image);
            }
          },
        },
        {
          text: 'Camera',
          onPress: async () => {
            const image = await pickFromCamera();
            if (image) {
              await uploadPickedFile(target, image);
            }
          },
        },
      ]
    );
  };

  const handleToggleVerify = async (
    document: DocumentItem
  ) => {
    setLoadingMessage('Updating...');
    try {
      const response = await guardManagementApi.verifyDocument(guardId, document.id, document.status !== 'Verified');
      const updatedDocuments = mapDocuments(response.data.data.documents);
      setDocuments(updatedDocuments);
      const updatedDocument = updatedDocuments.find(
        (item) => item.id === document.id
      );
      setViewerDoc(updatedDocument || null);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Could not update the document.');
    } finally {
      setLoadingMessage(null);
    }
  };

  const handleDelete = (document: DocumentItem) => {
    Alert.alert('Delete Document', `Delete "${document.title}"? You can upload it again afterwards.`,
      [{ text: 'Cancel', style: 'cancel', },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          setLoadingMessage('Deleting...');
          try {
            const response = await guardManagementApi.deleteDocument(guardId, document.id);
            setDocuments(mapDocuments(response.data.data.documents));
            setViewerDoc(null);
          } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message || 'Could not delete the document.');
          } finally {
            setLoadingMessage(null);
          }
        },
      },
      ]
    );
  };

  const closeViewerThenPick = (
    target: PickerTarget
  ) => {
    setViewerDoc(null);
    setTimeout(() => {
      chooseSourceAndUpload(target);
    }, 400);
  };

  const handleDone = () => {
    if (fromAddGuard) {
      navigation.popToTop();
    } else {
      navigation.goBack();
    }
  };

  const renderStatus = (status: DocumentItem['status']) => (
    <View style={[styles.statusBadge, status !== 'Verified' && styles.pendingBadge,]}>
      <Text style={[styles.statusText, status !== 'Verified' && styles.pendingText,]}>
        {status}
      </Text>
    </View>
  );

  const renderDocCard = (
    title: string,
    document?: DocumentItem
  ) => (
    <View key={document ? document.id : title} style={styles.docCard}>
      <TouchableOpacity
        style={styles.docLeft}
        activeOpacity={document ? 0.7 : 1}
        onPress={() => {
          if (document) {
            setViewerDoc(document);
          }
        }}
      >
        <View style={styles.iconBox}>
          <Ionicons
            name={document ? 'document-text' : 'document-text-outline'}
            size={20}
            color={document ? COLORS.primary : COLORS.textMuted
            }
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.docTitle}>{title}</Text>
          <Text style={styles.docHint}>
            {document ? 'Tap to view' : 'Not uploaded yet'}
          </Text>
        </View>
      </TouchableOpacity>

      {document ? (
        renderStatus(document.status)
      ) : (
        <TouchableOpacity
          style={styles.rowUploadBtn}
          onPress={() => chooseSourceAndUpload({ name: title })}
          activeOpacity={0.8}
        >
          <Ionicons
            name="cloud-upload-outline"
            size={14}
            color={COLORS.white}
          />
          <Text style={styles.rowUploadText}>
            Upload
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        {...(Platform.OS === 'android'
          ? { backgroundColor: COLORS.white }
          : {})}
      />

      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={COLORS.textPrimary}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Guard Documents
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <LoadingState message="Loading documents..." />
        ) : (
          <>
            <View style={styles.progressCard}>
              <Text style={styles.progressTitle}>
                {uploadedRequired} of{' '}
                {REQUIRED_DOCS.length} required
                documents uploaded
              </Text>
              <Text style={styles.progressSub}>
                {fromAddGuard
                  ? 'Upload documents now or add them later.'
                  : 'Tap a document to view or upload it.'}
              </Text>
            </View>
            <Text style={styles.sectionLabel}>
              Required Documents
            </Text>

            <View style={styles.listContainer}>
              {checklist.map((row) =>
                renderDocCard(row.title, row.doc)
              )}
            </View>
            {extraDocs.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>
                  Other Documents
                </Text>
                <View style={styles.listContainer}>
                  {extraDocs.map((document) =>
                    renderDocCard(
                      document.title,
                      document
                    )
                  )}
                </View>
              </>
            )}
            <TouchableOpacity
              style={styles.addMoreBtn}
              onPress={() =>
                chooseSourceAndUpload({
                  name: OTHER_DOC_NAME,
                })
              }
              activeOpacity={0.8}
            >
              <Ionicons
                name="add-circle-outline"
                size={18}
                color={COLORS.primary}
              />

              <Text style={styles.addMoreText}>
                Upload Another Document
              </Text>
            </TouchableOpacity>

            <PrimaryButton
              title={
                fromAddGuard
                  ? 'Done'
                  : 'Back to Profile'
              }
              onPress={handleDone}
              style={styles.uploadBtn}
            />
          </>
        )}
      </ScrollView>

      <Modal
        visible={!!viewerDoc}
        animationType="fade"
        onRequestClose={() => setViewerDoc(null)}
      >
        <SafeAreaView style={styles.viewerContainer}>
          <View style={styles.viewerHeader}>
            <TouchableOpacity
              style={styles.viewerClose}
              onPress={() => setViewerDoc(null)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="close"
                size={22}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <View style={{ flex: 1, marginHorizontal: 12, }}>
              <Text style={styles.viewerTitle} numberOfLines={1}>
                {viewerDoc?.title}
              </Text>

              {viewerDoc?.uploadedAt ? (
                <Text style={styles.viewerSub}>
                  Uploaded{' '}
                  {new Date(viewerDoc.uploadedAt).toLocaleDateString()}
                </Text>
              ) : null}
            </View>

            {viewerDoc
              ? renderStatus(viewerDoc.status)
              : null}
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.viewerImageWrap}
            maximumZoomScale={4}
            minimumZoomScale={1}
            centerContent
          >
            {viewerDoc?.fileUrl &&
              !isPdfFile(viewerDoc.fileUrl) ? (
              <Image
                source={{
                  uri: resolveAssetUrl(
                    viewerDoc.fileUrl
                  ),
                }}
                style={styles.viewerImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.pdfMessage}>
                <Ionicons
                  name="document-text-outline"
                  size={64}
                  color="#94A3B8"
                />

                <Text style={styles.pdfText}>
                  PDF preview is not available in the
                  app.
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.viewerActions}>
            {canManage && viewerDoc && (
              <TouchableOpacity
                style={[
                  styles.viewerBtn,
                  {
                    backgroundColor:
                      viewerDoc.status === 'Verified'
                        ? '#475569'
                        : '#16A34A',
                  },
                ]}
                onPress={() =>
                  handleToggleVerify(viewerDoc)
                }
                activeOpacity={0.85}
              >
                <Ionicons
                  name={
                    viewerDoc.status === 'Verified'
                      ? 'close-circle-outline'
                      : 'checkmark-circle-outline'
                  }
                  size={18}
                  color="#FFFFFF"
                />

                <Text style={styles.viewerBtnText}>
                  {viewerDoc.status === 'Verified'
                    ? 'Mark as Pending'
                    : 'Mark as Verified'}
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.viewerRow}>
              <TouchableOpacity
                style={[
                  styles.viewerBtn,
                  styles.viewerBtnHalf,
                  {
                    backgroundColor: COLORS.accent,
                  },
                ]}
                onPress={() =>
                  viewerDoc &&
                  closeViewerThenPick({
                    name: viewerDoc.title,
                    replaceDocId: viewerDoc.id,
                  })
                }
                activeOpacity={0.85}
              >
                <Ionicons
                  name="swap-horizontal-outline"
                  size={18}
                  color="#FFFFFF"
                />

                <Text style={styles.viewerBtnText}>
                  Replace
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.viewerBtn,
                  styles.viewerBtnHalf,
                  {
                    backgroundColor: COLORS.white,
                  },
                ]}
                onPress={() =>
                  closeViewerThenPick({
                    name: OTHER_DOC_NAME,
                  })
                }
                activeOpacity={0.85}
              >
                <Ionicons
                  name="add"
                  size={18}
                  color={COLORS.primary}
                />

                <Text
                  style={[
                    styles.viewerBtnText,
                    {
                      color: COLORS.primary,
                    },
                  ]}
                >
                  Upload Another
                </Text>
              </TouchableOpacity>
            </View>

            {canManage && viewerDoc && (
              <TouchableOpacity
                style={styles.viewerDelete}
                onPress={() =>
                  handleDelete(viewerDoc)
                }
                activeOpacity={0.7}
              >
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color="#FCA5A5"
                />

                <Text style={styles.viewerDeleteText}>
                  Delete this document
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {loadingMessage && (
        <View style={styles.busyOverlay}>
          <View style={styles.busyBox}>
            <ActivityIndicator
              color={COLORS.primary}
            />

            <Text style={styles.busyText}>
              {loadingMessage}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default GuardDocumentsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop:
      Platform.OS === 'android'
        ? StatusBar.currentHeight
        : 0,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  listContainer: {
    gap: 12,
    marginBottom: 24,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
  },
  docLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  statusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  pendingText: {
    color: '#B45309',
  },
  uploadBtn: {
    marginTop: 10,
  },
  docHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  progressCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.primary,
  },
  progressSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  rowUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  rowUploadText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 4,
  },
  addMoreText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  viewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop:
      Platform.OS === 'android'
        ? (StatusBar.currentHeight || 0) + 12
        : 12,
  },
  viewerClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  viewerSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  viewerImageWrap: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerImage: {
    width: '100%',
    height: 480,
  },
  pdfMessage: {
    alignItems: 'center',
  },
  pdfText: {
    color: '#CBD5E1',
    marginTop: 10,
    fontSize: 13,
  },
  viewerActions: {
    padding: 16,
    gap: 10,
  },
  viewerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  viewerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
  },
  viewerBtnHalf: {
    flex: 1,
  },
  viewerBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  viewerDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  viewerDeleteText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '700',
  },
  busyOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  busyBox: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  busyText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});