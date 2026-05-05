"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useChangePassword from "@/hooks/auth/useChangePassword";
import {
  GuardianProfile,
  StaffProfile,
  useProfile,
} from "@/hooks/me/useProfile";
import { BloodGroup, Gender, UserRole } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  Building2,
  Calendar,
  Check,
  Edit2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Me {
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    roles: UserRole[];
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const roleLabel: Record<string, string> = {
  [UserRole.SUPER_ADMIN]: "Super Admin",
  [UserRole.ADMIN]: "Admin",
  [UserRole.STAFF]: "Staff",
  [UserRole.GUARDIAN]: "Guardian",
};

const roleVariant: Record<string, "default" | "secondary" | "outline"> = {
  [UserRole.SUPER_ADMIN]: "default",
  [UserRole.ADMIN]: "default",
  [UserRole.STAFF]: "secondary",
  [UserRole.GUARDIAN]: "outline",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

// ── Zod schemas ────────────────────────────────────────────────────────────────

const personalSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  gender: z.nativeEnum(Gender).optional(),
  bloodGroup: z.nativeEnum(BloodGroup).optional(),
  nid: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

const contactSchema = z.object({
  whatsApp: z.string().optional(),
  alternativePhone: z.string().optional(),
});

const addressSchema = z.object({
  presentVillage: z.string().optional(),
  presentPostOffice: z.string().optional(),
  presentUpazila: z.string().optional(),
  presentDistrict: z.string().optional(),
  presentDivision: z.string().optional(),
  permanentVillage: z.string().optional(),
  permanentPostOffice: z.string().optional(),
  permanentUpazila: z.string().optional(),
  permanentDistrict: z.string().optional(),
  permanentDivision: z.string().optional(),
});

// ── SectionCard ────────────────────────────────────────────────────────────────

function SectionCard({
  title,
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSave,
  children,
  canEdit = true,
}: {
  title: string;
  isEditing: boolean;
  isSaving?: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  children: React.ReactNode;
  canEdit?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          {canEdit && (
            <div className="flex gap-2">
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="gap-1.5"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onCancel}
                    disabled={isSaving}
                    className="gap-1.5"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={onSave}
                    disabled={isSaving}
                    className="gap-1.5"
                  >
                    {isSaving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    Save
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// ── Personal Info ──────────────────────────────────────────────────────────────

function PersonalInfoSection({
  profile,
  isSaving,
  onSave,
}: {
  profile: StaffProfile | GuardianProfile | null;
  isSaving: boolean;
  onSave: (data: any) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);

  const form = useForm<z.infer<typeof personalSchema>>({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      fullName: "",
      gender: undefined,
      bloodGroup: undefined,
      nid: "",
      dateOfBirth: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.fullName ?? "",
        gender: profile.gender,
        bloodGroup: profile.bloodGroup,
        nid: profile.nid ?? "",
        dateOfBirth: profile.dateOfBirth
          ? format(new Date(profile.dateOfBirth), "yyyy-MM-dd")
          : "",
      });
    }
  }, [profile]);

  const handleSave = form.handleSubmit(async (data) => {
    await onSave({
      fullName: data.fullName,
      gender: data.gender,
      bloodGroup: data.bloodGroup,
      nid: data.nid || undefined,
      dateOfBirth: data.dateOfBirth || undefined,
    });
    setEditing(false);
  });

  if (!editing) {
    return (
      <SectionCard
        title="Personal Information"
        isEditing={false}
        onEdit={() => setEditing(true)}
        onCancel={() => setEditing(false)}
        onSave={handleSave}
        canEdit={!!profile}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <InfoRow icon={User} label="Full Name" value={profile?.fullName} />
          <InfoRow
            icon={Calendar}
            label="Date of Birth"
            value={
              profile?.dateOfBirth
                ? format(new Date(profile.dateOfBirth), "dd MMM yyyy")
                : null
            }
          />
          <InfoRow icon={User} label="Gender" value={profile?.gender} />
          <InfoRow
            icon={Shield}
            label="Blood Group"
            value={profile?.bloodGroup}
          />
          <InfoRow icon={User} label="NID" value={profile?.nid} />
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Personal Information"
      isEditing
      isSaving={isSaving}
      onEdit={() => setEditing(true)}
      onCancel={() => {
        form.reset();
        setEditing(false);
      }}
      onSave={handleSave}
    >
      <Form {...form}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={Gender.MALE}>Male</SelectItem>
                    <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bloodGroup"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Blood Group</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(BloodGroup)
                      .filter((v, i, arr) => arr.indexOf(v) === i)
                      .map((val) => (
                        <SelectItem key={val} value={val}>
                          {val}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NID</FormLabel>
                <FormControl>
                  <Input placeholder="National ID number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </SectionCard>
  );
}

// ── Contact Section ────────────────────────────────────────────────────────────

function ContactSection({
  me,
  profile,
  isStaff,
  isSaving,
  onSave,
}: {
  me: Me | null;
  profile: StaffProfile | GuardianProfile | null;
  isStaff: boolean;
  isSaving: boolean;
  onSave: (data: any) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: { whatsApp: "", alternativePhone: "" },
  });

  useEffect(() => {
    form.reset({
      whatsApp: profile?.whatsApp ?? "",
      alternativePhone: (profile as StaffProfile)?.alternativePhone ?? "",
    });
  }, [profile]);

  const handleSave = form.handleSubmit(async (data) => {
    await onSave({
      whatsApp: data.whatsApp || undefined,
      ...(isStaff
        ? { alternativePhone: data.alternativePhone || undefined }
        : {}),
    });
    setEditing(false);
  });

  if (!editing) {
    return (
      <SectionCard
        title="Contact Information"
        isEditing={false}
        onEdit={() => setEditing(true)}
        onCancel={() => setEditing(false)}
        onSave={handleSave}
        canEdit={!!profile}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <InfoRow icon={Phone} label="Phone" value={me?.user.phone} />
          <InfoRow icon={Mail} label="Email" value={me?.user.email} />
          <InfoRow icon={Phone} label="WhatsApp" value={profile?.whatsApp} />
          {isStaff && (
            <InfoRow
              icon={Phone}
              label="Alternative Phone"
              value={(profile as StaffProfile)?.alternativePhone}
            />
          )}
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Contact Information"
      isEditing
      isSaving={isSaving}
      onEdit={() => setEditing(true)}
      onCancel={() => {
        form.reset();
        setEditing(false);
      }}
      onSave={handleSave}
    >
      <Form {...form}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormItem>
            <FormLabel>Phone</FormLabel>
            <Input value={me?.user.phone ?? ""} disabled className="bg-muted" />
          </FormItem>
          <FormItem>
            <FormLabel>Email</FormLabel>
            <Input value={me?.user.email ?? ""} disabled className="bg-muted" />
          </FormItem>
          <FormField
            control={form.control}
            name="whatsApp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp</FormLabel>
                <FormControl>
                  <Input placeholder="+880 1XXX-XXXXXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {isStaff && (
            <FormField
              control={form.control}
              name="alternativePhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alternative Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+880 1XXX-XXXXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </Form>
    </SectionCard>
  );
}

// ── Address Section ────────────────────────────────────────────────────────────

function AddressSection({
  profile,
  isSaving,
  onSave,
}: {
  profile: StaffProfile | GuardianProfile | null;
  isSaving: boolean;
  onSave: (data: any) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);

  const form = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      presentVillage: "",
      presentPostOffice: "",
      presentUpazila: "",
      presentDistrict: "",
      presentDivision: "",
      permanentVillage: "",
      permanentPostOffice: "",
      permanentUpazila: "",
      permanentDistrict: "",
      permanentDivision: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        presentVillage: profile.address?.village ?? "",
        presentPostOffice: profile.address?.postOffice ?? "",
        presentUpazila: profile.address?.upazila ?? "",
        presentDistrict: profile.address?.district ?? "",
        presentDivision: profile.address?.division ?? "",
        permanentVillage: profile.permanentAddress?.village ?? "",
        permanentPostOffice: profile.permanentAddress?.postOffice ?? "",
        permanentUpazila: profile.permanentAddress?.upazila ?? "",
        permanentDistrict: profile.permanentAddress?.district ?? "",
        permanentDivision: profile.permanentAddress?.division ?? "",
      });
    }
  }, [profile]);

  const handleSave = form.handleSubmit(async (data) => {
    await onSave({
      address: {
        village: data.presentVillage ?? "",
        postOffice: data.presentPostOffice ?? "",
        upazila: data.presentUpazila ?? "",
        district: data.presentDistrict ?? "",
        division: data.presentDivision,
      },
      permanentAddress: {
        village: data.permanentVillage,
        postOffice: data.permanentPostOffice,
        upazila: data.permanentUpazila,
        district: data.permanentDistrict,
        division: data.permanentDivision,
      },
    });
    setEditing(false);
  });

  const presentAddr = profile?.address;
  const permanentAddr = profile?.permanentAddress;

  if (!editing) {
    return (
      <SectionCard
        title="Address"
        isEditing={false}
        onEdit={() => setEditing(true)}
        onCancel={() => setEditing(false)}
        onSave={handleSave}
        canEdit={!!profile}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Present Address
            </p>
            <InfoRow
              icon={MapPin}
              label="Village / Area"
              value={presentAddr?.village}
            />
            <InfoRow
              icon={MapPin}
              label="Post Office"
              value={presentAddr?.postOffice}
            />
            <InfoRow
              icon={MapPin}
              label="Upazila"
              value={presentAddr?.upazila}
            />
            <InfoRow
              icon={MapPin}
              label="District"
              value={presentAddr?.district}
            />
            {presentAddr?.division && (
              <InfoRow
                icon={MapPin}
                label="Division"
                value={presentAddr.division}
              />
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Permanent Address
            </p>
            <InfoRow
              icon={MapPin}
              label="Village / Area"
              value={permanentAddr?.village}
            />
            <InfoRow
              icon={MapPin}
              label="Post Office"
              value={permanentAddr?.postOffice}
            />
            <InfoRow
              icon={MapPin}
              label="Upazila"
              value={permanentAddr?.upazila}
            />
            <InfoRow
              icon={MapPin}
              label="District"
              value={permanentAddr?.district}
            />
            {permanentAddr?.division && (
              <InfoRow
                icon={MapPin}
                label="Division"
                value={permanentAddr.division}
              />
            )}
          </div>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Address"
      isEditing
      isSaving={isSaving}
      onEdit={() => setEditing(true)}
      onCancel={() => {
        form.reset();
        setEditing(false);
      }}
      onSave={handleSave}
    >
      <Form {...form}>
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium mb-3">Present Address</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(
                [
                  ["presentVillage", "Village / Area"],
                  ["presentPostOffice", "Post Office"],
                  ["presentUpazila", "Upazila"],
                  ["presentDistrict", "District"],
                  ["presentDivision", "Division (optional)"],
                ] as const
              ).map(([name, label]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium mb-3">Permanent Address</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(
                [
                  ["permanentVillage", "Village / Area"],
                  ["permanentPostOffice", "Post Office"],
                  ["permanentUpazila", "Upazila"],
                  ["permanentDistrict", "District"],
                  ["permanentDivision", "Division (optional)"],
                ] as const
              ).map(([name, label]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </Form>
    </SectionCard>
  );
}

// ── Professional Section (staff only) ─────────────────────────────────────────

function ProfessionalSection({ staff }: { staff: StaffProfile }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Professional Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <InfoRow icon={Building2} label="Staff ID" value={staff.staffId} />
          <InfoRow
            icon={Building2}
            label="Designation"
            value={staff.designation}
          />
          <InfoRow
            icon={Building2}
            label="Department"
            value={staff.department}
          />
          <InfoRow
            icon={Calendar}
            label="Join Date"
            value={
              staff.joinDate
                ? format(new Date(staff.joinDate), "dd MMM yyyy")
                : null
            }
          />
          <InfoRow
            icon={Building2}
            label="Branch"
            value={staff.branch?.join(", ")}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Change Password ────────────────────────────────────────────────────────────

function ChangePasswordSection() {
  const [open, setOpen] = useState(false);
  const {
    form,
    onSubmit,
    isLoading,
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
  } = useChangePassword(() => setOpen(false));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Change Password</CardTitle>
          {!open && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(true)}
              className="gap-1.5"
            >
              <Lock className="h-3.5 w-3.5" />
              Change
            </Button>
          )}
        </div>
      </CardHeader>
      {open && (
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 max-w-sm"
            >
              {(
                [
                  [
                    "currentPassword",
                    "Current Password",
                    showCurrentPassword,
                    setShowCurrentPassword,
                  ],
                  [
                    "newPassword",
                    "New Password",
                    showNewPassword,
                    setShowNewPassword,
                  ],
                  [
                    "confirmPassword",
                    "Confirm New Password",
                    showConfirmPassword,
                    setShowConfirmPassword,
                  ],
                ] as const
              ).map(([name, label, show, setShow]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={show ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShow((p: boolean) => !p)}
                          >
                            {show ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    form.reset();
                    setOpen(false);
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading}
                  className="gap-1.5"
                >
                  {isLoading && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  Update Password
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      )}
    </Card>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function MePage() {
  const {
    me,
    profile,
    staffProfile,
    isStaff,
    isGuardian,
    loadingProfile,
    savingProfile,
    updateProfile,
  } = useProfile();

  const hasProfile = isStaff || isGuardian;
  const displayName = profile?.fullName ?? me?.user.email ?? "User";
  const avatarUrl = profile?.avatar;
  const profileId = isStaff
    ? (staffProfile as StaffProfile | null)?.staffId
    : isGuardian
      ? (profile as any)?.guardianId
      : null;

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your personal information and account settings
        </p>
      </div>

      {/* Header card */}
      <Card>
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-20 w-20 border-2 border-border">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
              <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                {initials(displayName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-xl font-bold">
                  {loadingProfile ? (
                    <span className="text-muted-foreground text-base">
                      Loading…
                    </span>
                  ) : (
                    displayName
                  )}
                </h2>
                {profileId && (
                  <Badge
                    variant="outline"
                    className="font-mono text-xs w-fit mx-auto sm:mx-0"
                  >
                    {profileId}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground mt-0.5">
                {me?.user.email}
              </p>
              <p className="text-sm text-muted-foreground">{me?.user.phone}</p>

              <div className="flex flex-wrap gap-1.5 mt-3 justify-center sm:justify-start">
                {me?.user.roles.map((role) => (
                  <Badge key={role} variant={roleVariant[role] ?? "secondary"}>
                    {roleLabel[role] ?? role}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList className="mb-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-0">
          {hasProfile && !profile && loadingProfile && (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground text-sm">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                Loading profile…
              </CardContent>
            </Card>
          )}

          {hasProfile && !profile && !loadingProfile && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                Profile data not available. Contact an administrator.
              </CardContent>
            </Card>
          )}

          {(profile || !hasProfile) && (
            <>
              <PersonalInfoSection
                profile={profile}
                isSaving={savingProfile}
                onSave={updateProfile}
              />
              <ContactSection
                me={me}
                profile={profile}
                isStaff={isStaff}
                isSaving={savingProfile}
                onSave={updateProfile}
              />
              <AddressSection
                profile={profile}
                isSaving={savingProfile}
                onSave={updateProfile}
              />
              {isStaff && staffProfile && (
                <ProfessionalSection staff={staffProfile} />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="security" className="space-y-4 mt-0">
          <ChangePasswordSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
