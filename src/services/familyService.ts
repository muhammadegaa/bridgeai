/**
 * Family Service - Manages family data, relationships, and settings
 */

import { generateInviteCode } from '../utils/inviteCode';
import { databaseService, DatabaseError, ValidationError } from './database';
import { COLLECTIONS, Family, User, FamilySettings, FamilyAnalytics } from '../types/database';

export class FamilyService {
  private readonly defaultSettings: FamilySettings = {
    allowSharing: true,
    notificationsEnabled: true,
    conversationReminders: 'weekly',
    contentFiltering: 'moderate',
    maxChildAge: 18,
  };

  // Create a new family
  async createFamily(
    name: string,
    parentUserId: string,
    settings: Partial<FamilySettings> = {}
  ): Promise<string> {
    try {
      this.validateFamilyName(name);

      const familyData: Omit<Family, 'id'> = {
        name: name.trim(),
        parentIds: [parentUserId],
        childIds: [],
        inviteCode: generateInviteCode(),
        settings: { ...this.defaultSettings, ...settings },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const familyId = await databaseService.create<Family>(
        COLLECTIONS.FAMILIES,
        familyData,
        this.validateFamily
      );

      // Update the parent user's familyId
      await databaseService.update<User>(
        COLLECTIONS.USERS,
        parentUserId,
        { familyId }
      );

      return familyId;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError('Failed to create family', 'create_family_failed', 'createFamily');
    }
  }

  // Get family by ID
  async getFamily(familyId: string): Promise<Family | null> {
    return databaseService.get<Family>(COLLECTIONS.FAMILIES, familyId);
  }

  // Get family by invite code
  async getFamilyByInviteCode(inviteCode: string): Promise<Family | null> {
    const families = await databaseService.query<Family>(COLLECTIONS.FAMILIES, {
      where: [{ field: 'inviteCode', operator: '==', value: inviteCode }],
      limit: 1,
    });

    return families.length > 0 ? families[0] : null;
  }

  // Join family with invite code
  async joinFamily(userId: string, inviteCode: string, userRole: 'parent' | 'child'): Promise<string> {
    try {
      const family = await this.getFamilyByInviteCode(inviteCode);
      if (!family) {
        throw new ValidationError('Invalid invite code', 'inviteCode', inviteCode);
      }

      if (!family.id) {
        throw new DatabaseError('Family ID not found', 'family_id_missing', 'joinFamily');
      }

      // Update family with new member
      const updateData: Partial<Family> = {};
      if (userRole === 'parent') {
        updateData.parentIds = [...family.parentIds, userId];
      } else {
        updateData.childIds = [...family.childIds, userId];
      }

      await databaseService.update<Family>(COLLECTIONS.FAMILIES, family.id, updateData);

      // Update user's familyId
      await databaseService.update<User>(COLLECTIONS.USERS, userId, {
        familyId: family.id,
      });

      return family.id;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError('Failed to join family', 'join_family_failed', 'joinFamily');
    }
  }

  // Get all family members
  async getFamilyMembers(familyId: string): Promise<User[]> {
    return databaseService.query<User>(COLLECTIONS.USERS, {
      where: [
        { field: 'familyId', operator: '==', value: familyId },
        { field: 'isActive', operator: '==', value: true },
      ],
      orderBy: [{ field: 'role', direction: 'asc' }, { field: 'createdAt', direction: 'asc' }],
    });
  }

  // Get parents in family
  async getFamilyParents(familyId: string): Promise<User[]> {
    return databaseService.query<User>(COLLECTIONS.USERS, {
      where: [
        { field: 'familyId', operator: '==', value: familyId },
        { field: 'role', operator: '==', value: 'parent' },
        { field: 'isActive', operator: '==', value: true },
      ],
      orderBy: [{ field: 'createdAt', direction: 'asc' }],
    });
  }

  // Get children in family
  async getFamilyChildren(familyId: string): Promise<User[]> {
    return databaseService.query<User>(COLLECTIONS.USERS, {
      where: [
        { field: 'familyId', operator: '==', value: familyId },
        { field: 'role', operator: '==', value: 'child' },
        { field: 'isActive', operator: '==', value: true },
      ],
      orderBy: [{ field: 'profile.age', direction: 'asc' }],
    });
  }

  // Update family settings
  async updateFamilySettings(
    familyId: string,
    userId: string,
    settings: Partial<FamilySettings>
  ): Promise<void> {
    // Verify user is a parent in this family
    const isParent = await this.isUserFamilyParent(userId, familyId);
    if (!isParent) {
      throw new ValidationError('Only parents can update family settings', 'permission', userId);
    }

    const family = await this.getFamily(familyId);
    if (!family) {
      throw new DatabaseError('Family not found', 'family_not_found', 'updateFamilySettings', COLLECTIONS.FAMILIES, familyId);
    }

    const updatedSettings = { ...family.settings, ...settings };
    await databaseService.update<Family>(COLLECTIONS.FAMILIES, familyId, {
      settings: updatedSettings,
    });
  }

  // Remove member from family
  async removeFamilyMember(familyId: string, parentUserId: string, memberUserId: string): Promise<void> {
    // Verify requesting user is a parent
    const isParent = await this.isUserFamilyParent(parentUserId, familyId);
    if (!isParent) {
      throw new ValidationError('Only parents can remove family members', 'permission', parentUserId);
    }

    const family = await this.getFamily(familyId);
    if (!family || !family.id) {
      throw new DatabaseError('Family not found', 'family_not_found', 'removeFamilyMember');
    }

    const member = await databaseService.get<User>(COLLECTIONS.USERS, memberUserId);
    if (!member || member.familyId !== familyId) {
      throw new ValidationError('User is not a member of this family', 'membership', memberUserId);
    }

    // Prevent removing the last parent
    if (member.role === 'parent' && family.parentIds.length === 1) {
      throw new ValidationError('Cannot remove the last parent from family', 'last_parent', memberUserId);
    }

    // Update family member lists
    const updateData: Partial<Family> = {};
    if (member.role === 'parent') {
      updateData.parentIds = family.parentIds.filter(id => id !== memberUserId);
    } else {
      updateData.childIds = family.childIds.filter(id => id !== memberUserId);
    }

    await databaseService.update<Family>(COLLECTIONS.FAMILIES, family.id, updateData);

    // Deactivate user account (instead of deleting)
    await databaseService.update<User>(COLLECTIONS.USERS, memberUserId, {
      isActive: false,
      familyId: '', // Remove family association
    });
  }

  // Generate new invite code
  async regenerateInviteCode(familyId: string, userId: string): Promise<string> {
    const isParent = await this.isUserFamilyParent(userId, familyId);
    if (!isParent) {
      throw new ValidationError('Only parents can regenerate invite codes', 'permission', userId);
    }

    const newInviteCode = generateInviteCode();
    await databaseService.update<Family>(COLLECTIONS.FAMILIES, familyId, {
      inviteCode: newInviteCode,
    });

    return newInviteCode;
  }

  // Get family analytics
  async getFamilyAnalytics(
    familyId: string,
    period: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ): Promise<FamilyAnalytics | null> {
    const analytics = await databaseService.query<FamilyAnalytics>(COLLECTIONS.FAMILY_ANALYTICS, {
      where: [
        { field: 'familyId', operator: '==', value: familyId },
        { field: 'period', operator: '==', value: period },
      ],
      orderBy: [{ field: 'generatedAt', direction: 'desc' }],
      limit: 1,
    });

    return analytics.length > 0 ? analytics[0] : null;
  }

  // Subscribe to family updates
  subscribeToFamily(
    familyId: string,
    callback: (family: Family | null) => void,
    onError?: (error: Error) => void
  ): string {
    return databaseService.subscribeToDocument<Family>(
      COLLECTIONS.FAMILIES,
      familyId,
      callback,
      { onError }
    );
  }

  // Subscribe to family members
  subscribeToFamilyMembers(
    familyId: string,
    callback: (members: User[]) => void,
    onError?: (error: Error) => void
  ): string {
    return databaseService.subscribeToQuery<User>(
      COLLECTIONS.USERS,
      {
        where: [
          { field: 'familyId', operator: '==', value: familyId },
          { field: 'isActive', operator: '==', value: true },
        ],
        orderBy: [{ field: 'role', direction: 'asc' }, { field: 'createdAt', direction: 'asc' }],
        onError,
      }
    );
  }

  // Helper methods
  private async isUserFamilyParent(userId: string, familyId: string): Promise<boolean> {
    const user = await databaseService.get<User>(COLLECTIONS.USERS, userId);
    return user?.familyId === familyId && user?.role === 'parent' && user?.isActive === true;
  }

  private validateFamilyName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Family name is required', 'name', name);
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      throw new ValidationError('Family name must be at least 2 characters', 'name', name);
    }

    if (trimmedName.length > 50) {
      throw new ValidationError('Family name must not exceed 50 characters', 'name', name);
    }

    // Check for inappropriate content (basic implementation)
    const inappropriateWords = ['admin', 'system', 'null', 'undefined'];
    if (inappropriateWords.some(word => trimmedName.toLowerCase().includes(word))) {
      throw new ValidationError('Family name contains restricted words', 'name', name);
    }
  }

  private validateFamily(family: Omit<Family, 'id'>): void {
    this.validateFamilyName(family.name);

    if (!family.parentIds || family.parentIds.length === 0) {
      throw new ValidationError('Family must have at least one parent', 'parentIds', family.parentIds);
    }

    if (!family.inviteCode || family.inviteCode.length < 6) {
      throw new ValidationError('Invalid invite code', 'inviteCode', family.inviteCode);
    }
  }
}

export const familyService = new FamilyService();