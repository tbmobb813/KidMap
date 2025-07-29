// components/ApprovalManager.tsx - Comprehensive approval management system
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Animated,
} from 'react-native';
import { PendingApproval } from '@/types';
import {
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Tag,
  Users,
  Route,
  AlertCircle,
  Eye,
  MessageCircle,
  Calendar,
  Star,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import Colors from '../constants/colors';
import AccessibleButton from './AccessibleButton';
import { useParentalControlStoreWithHelpers } from '@/stores/parentalControlStore';

interface ApprovalManagerProps {
  visible: boolean;
  onClose: () => void;
}

interface FilterState {
  type: string;
  status: string;
  priority: string;
  dateRange: string;
}

export default function ApprovalManager({ visible, onClose }: ApprovalManagerProps) {
  const { 
    pendingApprovals, 
    approvalHistory, 
    approveRequest, 
    rejectRequest,
    getPendingApprovalsCount 
  } = useParentalControlStoreWithHelpers();
  
  const [selectedTab, setSelectedTab] = useState<'pending' | 'history'>('pending');
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    status: 'all',
    priority: 'all',
    dateRange: 'all',
  });
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const handleApprove = useCallback(async (approvalId: string, comments?: string) => {
    try {
      await approveRequest(approvalId, comments);
      Alert.alert('Approved', 'The request has been approved successfully.');
      setShowDetailModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to approve the request. Please try again.');
    }
  }, [approveRequest]);

  const handleReject = useCallback(async (approvalId: string, reason?: string) => {
    try {
      await rejectRequest(approvalId, reason);
      Alert.alert('Rejected', 'The request has been rejected.');
      setShowDetailModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to reject the request. Please try again.');
    }
  }, [rejectRequest]);

  const handleBulkApprove = () => {
    const pendingIds = pendingApprovals.map(approval => approval.id);
    if (pendingIds.length === 0) return;

    Alert.alert(
      'Approve All Requests',
      `Are you sure you want to approve all ${pendingIds.length} pending requests?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve All',
          onPress: async () => {
            for (const id of pendingIds) {
              await approveRequest(id, 'Bulk approval');
            }
            Alert.alert('Success', `${pendingIds.length} requests have been approved.`);
          }
        }
      ]
    );
  };

  const toggleItemExpansion = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getApprovalIcon = (type: PendingApproval['type']) => {
    switch (type) {
      case 'category':
        return <Tag size={20} color={Colors.primary} />;
      case 'safe-zone':
        return <MapPin size={20} color={Colors.primary} />;
      case 'contact':
        return <Users size={20} color={Colors.primary} />;
      case 'route':
        return <Route size={20} color={Colors.primary} />;
      default:
        return <AlertCircle size={20} color={Colors.primary} />;
    }
  };

  const getPriorityColor = (priority: PendingApproval['priority']) => {
    switch (priority) {
      case 'high':
        return Colors.error;
      case 'medium':
        return Colors.warning;
      case 'low':
        return Colors.success;
      default:
        return Colors.text.primaryLight;
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredApprovals = (selectedTab === 'pending' ? pendingApprovals : approvalHistory)
    .filter(approval => {
      if (searchQuery && !approval.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !approval.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      if (filters.type !== 'all' && approval.type !== filters.type) return false;
      if (selectedTab === 'history' && filters.status !== 'all' && approval.status !== filters.status) return false;
      if (filters.priority !== 'all' && approval.priority !== filters.priority) return false;
      
      return true;
    })
    .sort((a, b) => {
      // Sort by priority first, then by timestamp
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority] || 0;
      const bPriority = priorityOrder[b.priority] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return b.timestamp - a.timestamp;
    });

  const renderApprovalItem = (approval: PendingApproval) => {
    const isExpanded = expandedItems.has(approval.id);
    
    return (
      <View key={approval.id} style={styles.approvalItem}>
        <TouchableOpacity
          style={styles.approvalHeader}
          onPress={() => toggleItemExpansion(approval.id)}
          activeOpacity={0.7}
        >
          <View style={styles.approvalInfo}>
            <View style={styles.approvalIcon}>
              {getApprovalIcon(approval.type)}
            </View>
            <View style={styles.approvalContent}>
              <View style={styles.approvalTitleRow}>
                <Text style={styles.approvalTitle}>{approval.title}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(approval.priority) + '20' }]}>
                  <Text style={[styles.priorityText, { color: getPriorityColor(approval.priority) }]}>
                    {approval.priority.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.approvalDescription} numberOfLines={isExpanded ? undefined : 2}>
                {approval.description}
              </Text>
              <View style={styles.approvalMeta}>
                <Text style={styles.approvalTime}>{formatTimeAgo(approval.timestamp)}</Text>
                {approval.status && (
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: approval.status === 'approved' ? Colors.success + '20' : Colors.error + '20' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: approval.status === 'approved' ? Colors.success : Colors.error }
                    ]}>
                      {approval.status.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          <View style={styles.expandIcon}>
            {isExpanded ? (
              <ChevronUp size={20} color={Colors.text.primaryLight} />
            ) : (
              <ChevronDown size={20} color={Colors.text.primaryLight} />
            )}
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.approvalDetails}>
            {approval.metadata && (
              <View style={styles.metadataSection}>
                <Text style={styles.metadataTitle}>Details:</Text>
                {Object.entries(approval.metadata).map(([key, value]) => (
                  <View key={key} style={styles.metadataItem}>
                    <Text style={styles.metadataKey}>{key}:</Text>
                    <Text style={styles.metadataValue}>{String(value)}</Text>
                  </View>
                ))}
              </View>
            )}

            {selectedTab === 'pending' && (
              <View style={styles.approvalActions}>
                <AccessibleButton
                  title="View Details"
                  onPress={() => {
                    setSelectedApproval(approval);
                    setShowDetailModal(true);
                  }}
                  style={styles.detailButton}
                  textStyle={styles.detailButtonText}
                />
                <View style={styles.actionButtons}>
                  <AccessibleButton
                    title="Reject"
                    onPress={() => handleReject(approval.id, 'Quick rejection')}
                    style={styles.rejectButton}
                    textStyle={styles.rejectButtonText}
                  />
                  <AccessibleButton
                    title="Approve"
                    onPress={() => handleApprove(approval.id, 'Quick approval')}
                    style={styles.approveButton}
                    textStyle={styles.approveButtonText}
                  />
                </View>
              </View>
            )}

            {selectedTab === 'history' && approval.reviewComments && (
              <View style={styles.reviewComments}>
                <Text style={styles.reviewTitle}>Review Comments:</Text>
                <Text style={styles.reviewText}>{approval.reviewComments}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderDetailModal = () => {
    if (!selectedApproval) return null;

    return (
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Approval Details</Text>
            <TouchableOpacity
              onPress={() => setShowDetailModal(false)}
              style={styles.closeButton}
            >
              <XCircle size={24} color={Colors.text.primaryLight} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.detailSection}>
              <View style={styles.detailHeader}>
                {getApprovalIcon(selectedApproval.type)}
                <Text style={styles.detailTitle}>{selectedApproval.title}</Text>
              </View>
              <Text style={styles.detailDescription}>{selectedApproval.description}</Text>
            </View>

            {selectedApproval.metadata && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Request Details</Text>
                {Object.entries(selectedApproval.metadata).map(([key, value]) => (
                  <View key={key} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{key}:</Text>
                    <Text style={styles.detailValue}>{String(value)}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Request Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type:</Text>
                <Text style={styles.detailValue}>{selectedApproval.type}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Priority:</Text>
                <Text style={[styles.detailValue, { color: getPriorityColor(selectedApproval.priority) }]}>
                  {selectedApproval.priority.toUpperCase()}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Submitted:</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedApproval.timestamp).toLocaleString()}
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <AccessibleButton
              title="Reject Request"
              onPress={() => {
                Alert.alert(
                  'Reject Request',
                  'Are you sure you want to reject this request?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Reject',
                      style: 'destructive',
                      onPress: () => handleReject(selectedApproval.id, 'Rejected from detail view')
                    }
                  ]
                );
              }}
              style={styles.modalRejectButton}
              textStyle={styles.modalRejectText}
            />
            <AccessibleButton
              title="Approve Request"
              onPress={() => {
                Alert.alert(
                  'Approve Request',
                  'Are you sure you want to approve this request?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Approve',
                      onPress: () => handleApprove(selectedApproval.id, 'Approved from detail view')
                    }
                  ]
                );
              }}
              style={styles.modalApproveButton}
              textStyle={styles.modalApproveText}
            />
          </View>
        </View>
      </Modal>
    );
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <XCircle size={24} color={Colors.text.primaryLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Approval Center</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setShowFilters(!showFilters)}
              style={styles.filterButton}
            >
              <Filter size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'pending' && styles.activeTab]}
            onPress={() => setSelectedTab('pending')}
          >
            <Clock size={16} color={selectedTab === 'pending' ? Colors.primary : Colors.text.primaryLight} />
            <Text style={[styles.tabText, selectedTab === 'pending' && styles.activeTabText]}>
              Pending ({getPendingApprovalsCount()})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'history' && styles.activeTab]}
            onPress={() => setSelectedTab('history')}
          >
            <CheckCircle size={16} color={selectedTab === 'history' ? Colors.primary : Colors.text.primaryLight} />
            <Text style={[styles.tabText, selectedTab === 'history' && styles.activeTabText]}>
              History ({approvalHistory.length})
            </Text>
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filtersContainer}>
            <View style={styles.searchContainer}>
              <Search size={16} color={Colors.text.primaryLight} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search approvals..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={Colors.text.primaryLight}
              />
            </View>
          </View>
        )}

        {selectedTab === 'pending' && pendingApprovals.length > 0 && (
          <View style={styles.bulkActions}>
            <AccessibleButton
              title="Approve All"
              onPress={handleBulkApprove}
              style={styles.bulkApproveButton}
              textStyle={styles.bulkApproveText}
            />
          </View>
        )}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {filteredApprovals.length === 0 ? (
            <View style={styles.emptyState}>
              {selectedTab === 'pending' ? (
                <>
                  <Clock size={48} color={Colors.text.primaryLight} />
                  <Text style={styles.emptyTitle}>No Pending Approvals</Text>
                  <Text style={styles.emptySubtitle}>
                    All requests have been reviewed. New requests will appear here.
                  </Text>
                </>
              ) : (
                <>
                  <CheckCircle size={48} color={Colors.text.primaryLight} />
                  <Text style={styles.emptyTitle}>No Approval History</Text>
                  <Text style={styles.emptySubtitle}>
                    Previous approval decisions will be shown here.
                  </Text>
                </>
              )}
            </View>
          ) : (
            filteredApprovals.map(renderApprovalItem)
          )}
        </ScrollView>

        {renderDetailModal()}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary + '15',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    margin: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: Colors.background,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primaryLight,
  },
  activeTabText: {
    color: Colors.primary,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    paddingVertical: 12,
  },
  bulkActions: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  bulkApproveButton: {
    backgroundColor: Colors.success,
    alignSelf: 'flex-end',
  },
  bulkApproveText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  approvalItem: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  approvalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  approvalInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  approvalIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  approvalContent: {
    flex: 1,
  },
  approvalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  approvalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  approvalDescription: {
    fontSize: 14,
    color: Colors.text.primaryLight,
    lineHeight: 18,
    marginBottom: 8,
  },
  approvalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  approvalTime: {
    fontSize: 12,
    color: Colors.text.primaryLight,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  expandIcon: {
    marginLeft: 8,
  },
  approvalDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: 16,
  },
  metadataSection: {
    marginBottom: 16,
  },
  metadataTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  metadataItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  metadataKey: {
    fontSize: 14,
    color: Colors.text.primaryLight,
    fontWeight: '500',
    minWidth: 80,
  },
  metadataValue: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
  },
  approvalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  detailButton: {
    backgroundColor: Colors.primary + '15',
    borderWidth: 1,
    borderColor: Colors.primary,
    flex: 1,
  },
  detailButtonText: {
    color: Colors.primary,
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectButton: {
    backgroundColor: Colors.error,
    minWidth: 80,
  },
  rejectButtonText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  approveButton: {
    backgroundColor: Colors.success,
    minWidth: 80,
  },
  approveButtonText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  reviewComments: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  reviewText: {
    fontSize: 14,
    color: Colors.text.primaryLight,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.text.primaryLight,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  detailSection: {
    marginVertical: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  detailDescription: {
    fontSize: 16,
    color: Colors.text.primaryLight,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.text.primaryLight,
    fontWeight: '500',
    minWidth: 100,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  modalRejectButton: {
    backgroundColor: Colors.error,
    flex: 1,
  },
  modalRejectText: {
    color: Colors.background,
    fontWeight: '600',
  },
  modalApproveButton: {
    backgroundColor: Colors.success,
    flex: 1,
  },
  modalApproveText: {
    color: Colors.background,
    fontWeight: '600',
  },
});
