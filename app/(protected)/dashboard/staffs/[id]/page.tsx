"use client";

import { useState } from "react";
import { StaffProfileHeader } from "@/components/staffs/staff/header";
import { StaffNotFound } from "@/components/staffs/staff/notFound";
import { ProfileHeaderSkeleton } from "@/components/students/student/headerSkeleton";
import { InfoSectionSkeleton } from "@/components/students/student/InfoSectionSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStaffActions } from "@/hooks/staff/useStaffActions";
import { ContactInfoSection } from "@/components/students/student/contactInfo";
import { PersonalInfoSection } from "@/components/staffs/staff/personalInfo";
import { AddressSection } from "@/components/students/student/addressInfo";
import StaffInformation from "@/components/staffs/new/StaffInfo";
import { StaffInfoSection } from "@/components/staffs/staff/staffInfo";

export default function StaffProfilePage() {
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const { staff, loading, handleUpdate } = useStaffActions();

  if (!staff && !loading.fetch) return <StaffNotFound />;

  return (
    <main className="min-h-screen bg-background">
      {loading.fetch ? (
        <ProfileHeaderSkeleton />
      ) : (
        staff && <StaffProfileHeader data={staff} />
      )}

      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-fit">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="staffInfo">Staff Info</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          {loading.fetch ? (
            <InfoSectionSkeleton />
          ) : (
            <>
              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <PersonalInfoSection
                    isEditing={editingSection === "personal"}
                    onEditChange={(isEditing) =>
                      setEditingSection(isEditing ? "personal" : null)
                    }
                    data={staff ?? undefined}
                    onSave={handleUpdate}
                  />
                  <ContactInfoSection
                    isEditing={editingSection === "contact"}
                    onEditChange={(isEditing) =>
                      setEditingSection(isEditing ? "contact" : null)
                    }
                    data={staff ?? undefined}
                    onSave={handleUpdate}
                  />
                </div>
                <AddressSection
                  isEditing={editingSection === "address"}
                  onEditChange={(isEditing) =>
                    setEditingSection(isEditing ? "address" : null)
                  }
                  data={staff ?? undefined}
                  onSave={handleUpdate}
                />
              </TabsContent>

              <TabsContent value="staffInfo" className="space-y-6 mt-6">
                <StaffInfoSection
                  isEditing={editingSection === "staffInfo"}
                  onEditChange={(isEditing) =>
                    setEditingSection(isEditing ? "staffInfo" : null)
                  }
                  data={staff ?? undefined}
                  onSave={handleUpdate}
                />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </main>
  );
}
