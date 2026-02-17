"use client";

import { GuardianProfileHeader } from "@/components/guardians/guardian/header";
import { GuardianNotFound } from "@/components/guardians/guardian/notFound";
import { PersonalInfoSection } from "@/components/guardians/guardian/personalInfo";
import { AddressSection } from "@/components/students/student/addressInfo";
import { ContactInfoSection } from "@/components/students/student/contactInfo";
import { ProfileHeaderSkeleton } from "@/components/students/student/headerSkeleton";
import { InfoSectionSkeleton } from "@/components/students/student/InfoSectionSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGuardianActions } from "@/hooks/guardians/useGuardianActions";
import { useState } from "react";

export default function StaffProfilePage() {
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const { guardian, loading, handleUpdate } = useGuardianActions();

  if (!guardian && !loading.fetch) return <GuardianNotFound />;

  return (
    <main className="min-h-screen bg-background">
      {loading.fetch ? (
        <ProfileHeaderSkeleton />
      ) : (
        guardian && <GuardianProfileHeader data={guardian} />
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
                    data={guardian ?? undefined}
                    onSave={(data) =>
                      handleUpdate(data as Parameters<typeof handleUpdate>[0])
                    }
                  />
                  <ContactInfoSection
                    isEditing={editingSection === "contact"}
                    onEditChange={(isEditing) =>
                      setEditingSection(isEditing ? "contact" : null)
                    }
                    data={guardian ?? undefined}
                    onSave={(data) =>
                      handleUpdate(data as Parameters<typeof handleUpdate>[0])
                    }
                  />
                </div>
                <AddressSection
                  isEditing={editingSection === "address"}
                  onEditChange={(isEditing) =>
                    setEditingSection(isEditing ? "address" : null)
                  }
                  data={guardian ?? undefined}
                  onSave={(data) =>
                    handleUpdate(data as Parameters<typeof handleUpdate>[0])
                  }
                />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </main>
  );
}
