import { INotice } from "@/validations";
import mongoose from "mongoose";
import { User } from "../models/users.model";
import { Notice } from "../models/notices.model";

export const register = async ({
  body,
  authorId,
}: {
  authorId: string;
  body: INotice;
}) => {
  try {
    // 1️⃣ Get publisher info
    const user = await User.findById(authorId).populate("profile");

    if (!user || !user.profile) {
      return {
        error: {
          message: "User or profile not found",
        },
      };
    }

    const profile = user.profile;

    // Create notice
    const notice = await Notice.create({
      ...body,
      publishedBy: authorId,
      publisherName: `${profile.firstName} ${profile.lastName}`,
      publisherRole: user.role,
      publisherAvatar: profile.avatar,
      publishedAt: body.isPublished ? new Date() : undefined,
      views: 0,
      viewedBy: [],
      isPinned: false,
      isArchived: false,
    });

    return {
      success: {
        success: true,
        message: "Notice created successfully",
        data: notice,
      },
    };
  } catch (error: any) {
    return {
      serverError: {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};

// Get notices for logged-in user
export const getNotices = async (
  authorId: string,
  filters?: {
    type?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }
) => {
  try {
    // 1️⃣ Get user info
    const user = await User.findById(authorId).populate("profile");

    if (!user) {
      return {
        error: { message: "User not found" },
      };
    }

    // 2️⃣ Build query based on user role and profile
    const query: any = {
      isPublished: true,
      isArchived: false,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } },
      ],
    };

    // Audience filtering
    const audienceConditions = [{ audience: NoticeAudience.ALL }];

    if (user.role === "STUDENT") {
      audienceConditions.push({ audience: NoticeAudience.STUDENTS });

      const student = user.profile as any;
      if (student?.classId) {
        audienceConditions.push({
          audience: NoticeAudience.SPECIFIC_CLASS,
          targetClasses: student.classId,
        });
      }
      if (student?.branch) {
        audienceConditions.push({
          audience: NoticeAudience.SPECIFIC_BRANCH,
          targetBranches: student.branch,
        });
      }
    } else if (user.role === "STAFF") {
      audienceConditions.push({ audience: NoticeAudience.STAFF });

      const staff = user.profile as any;
      if (staff?.branch) {
        audienceConditions.push({
          audience: NoticeAudience.SPECIFIC_BRANCH,
          targetBranches: staff.branch,
        });
      }
    } else if (user.role === "GUARDIAN") {
      audienceConditions.push({ audience: NoticeAudience.GUARDIANS });
    }

    query.$and = [{ $or: audienceConditions }];

    // Additional filters
    if (filters?.type) {
      query.type = filters.type;
    }
    if (filters?.priority) {
      query.priority = filters.priority;
    }

    // 3️⃣ Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    // 4️⃣ Fetch notices
    const notices = await Notice.find(query)
      .sort({ isPinned: -1, publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Notice.countDocuments(query);

    return {
      success: {
        success: true,
        data: {
          notices,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      },
    };
  } catch (error: any) {
    return {
      serverError: {
        success: false,
        message: error.message,
      },
    };
  }
};

// Get single notice and mark as viewed
export const getNotice = async (noticeId: string, authorId: string) => {
  try {
    const notice = await Notice.findById(noticeId);

    if (!notice) {
      return {
        error: { message: "Notice not found" },
      };
    }

    // Check if user already viewed
    const hasViewed = notice.viewedBy.some((id) => id.toString() === authorId);

    // Mark as viewed if not already
    if (!hasViewed) {
      notice.views += 1;
      notice.viewedBy.push(new mongoose.Types.ObjectId(authorId));
      await notice.save();
    }

    return {
      success: {
        success: true,
        data: notice,
      },
    };
  } catch (error: any) {
    return {
      serverError: {
        success: false,
        message: error.message,
      },
    };
  }
};

// Update notice
export const updateNotice = async (
  noticeId: string,
  authorId: string,
  updates: Partial<INotice>
) => {
  try {
    const notice = await Notice.findById(noticeId);

    if (!notice) {
      return {
        error: { message: "Notice not found" },
      };
    }

    // Check if user is the publisher or admin
    if (notice.publishedBy.toString() !== authorId) {
      const user = await User.findById(authorId);
      if (user?.role !== "ADMIN") {
        return {
          error: { message: "Unauthorized to update this notice" },
        };
      }
    }

    // Update notice
    Object.assign(notice, updates);

    // If publishing now
    if (updates.isPublished && !notice.publishedAt) {
      notice.publishedAt = new Date();
    }

    await notice.save();

    return {
      success: {
        success: true,
        message: "Notice updated successfully",
        data: notice,
      },
    };
  } catch (error: any) {
    return {
      serverError: {
        success: false,
        message: error.message,
      },
    };
  }
};

// Delete notice
export const deleteNotice = async (noticeId: string, authorId: string) => {
  try {
    const notice = await Notice.findById(noticeId);

    if (!notice) {
      return {
        error: { message: "Notice not found" },
      };
    }

    // Check authorization
    if (notice.publishedBy.toString() !== authorId) {
      const user = await User.findById(authorId);
      if (user?.role !== "ADMIN") {
        return {
          error: { message: "Unauthorized to delete this notice" },
        };
      }
    }

    await Notice.findByIdAndDelete(noticeId);

    return {
      success: {
        success: true,
        message: "Notice deleted successfully",
      },
    };
  } catch (error: any) {
    return {
      serverError: {
        success: false,
        message: error.message,
      },
    };
  }
};

// Toggle pin status
export const togglePinNotice = async (noticeId: string) => {
  try {
    const notice = await Notice.findById(noticeId);

    if (!notice) {
      return {
        error: { message: "Notice not found" },
      };
    }

    notice.isPinned = !notice.isPinned;
    await notice.save();

    return {
      success: {
        success: true,
        message: `Notice ${
          notice.isPinned ? "pinned" : "unpinned"
        } successfully`,
        data: notice,
      },
    };
  } catch (error: any) {
    return {
      serverError: {
        success: false,
        message: error.message,
      },
    };
  }
};

// Archive notice
export const archiveNotice = async (noticeId: string) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      noticeId,
      { isArchived: true },
      { new: true }
    );

    if (!notice) {
      return {
        error: { message: "Notice not found" },
      };
    }

    return {
      success: {
        success: true,
        message: "Notice archived successfully",
        data: notice,
      },
    };
  } catch (error: any) {
    return {
      serverError: {
        success: false,
        message: error.message,
      },
    };
  }
};
