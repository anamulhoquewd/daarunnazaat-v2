"use client";
import { AcademicInfoSection } from "@/components/students/student/academicInfo";
import { AddressSection } from "@/components/students/student/addressInfo";
import { AdministrationSection } from "@/components/students/student/administrationSection";
import { ClassDetails } from "@/components/students/student/classDetails";
import { ContactInfoSection } from "@/components/students/student/contactInfo";
import { FeesSection } from "@/components/students/student/feeInfo";
import { GuardianDetails } from "@/components/students/student/guardianDetails";
import { PersonalInfoSection } from "@/components/students/student/personalInfo";
import { SessionHistorySection } from "@/components/students/student/sessionHistory";
import { StudentNotFound } from "@/components/students/student/studenNotFound";
import { useStudentActions } from "@/hooks/students/useStudentActions";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { StudentProfileHeader } from "@/components/students/student/header";
import { StudentProfileHeaderSkeleton } from "@/components/students/student/studentHeaderSkeleton";
import { PersonalInfoSectionSkeleton } from "@/components/students/student/studentInfoSectionSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StudentProfilePage() {
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const { student, loading, handleUpdate } = useStudentActions();

  if (!student && !loading.fetch) return <StudentNotFound />;

  return (
    <main className="min-h-screen bg-background">
      {loading.fetch ? (
        <StudentProfileHeaderSkeleton />
      ) : (
        student && <StudentProfileHeader data={student} />
      )}

      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-fit">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="additional">More Info</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          {loading.fetch ? (
            <PersonalInfoSectionSkeleton />
          ) : (
            <>
              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <PersonalInfoSection
                    isEditing={editingSection === "personal"}
                    onEditChange={(isEditing) =>
                      setEditingSection(isEditing ? "personal" : null)
                    }
                    data={student ?? undefined}
                    onSave={handleUpdate}
                  />
                  <ContactInfoSection
                    isEditing={editingSection === "contact"}
                    onEditChange={(isEditing) =>
                      setEditingSection(isEditing ? "contact" : null)
                    }
                    data={student ?? undefined}
                    onSave={handleUpdate}
                  />
                </div>
                <AddressSection
                  isEditing={editingSection === "address"}
                  onEditChange={(isEditing) =>
                    setEditingSection(isEditing ? "address" : null)
                  }
                  data={student ?? undefined}
                  onSave={handleUpdate}
                />
                <FeesSection
                  isEditing={editingSection === "fees"}
                  onEditChange={(isEditing) =>
                    setEditingSection(isEditing ? "fees" : null)
                  }
                  data={student ?? undefined}
                  onSave={handleUpdate}
                />
              </TabsContent>

              <TabsContent value="academic" className="space-y-6 mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <AcademicInfoSection
                    isEditing={editingSection === "academic"}
                    onEditChange={(isEditing) =>
                      setEditingSection(isEditing ? "academic" : null)
                    }
                    data={student ?? undefined}
                    onSave={handleUpdate}
                  />
                  <ClassDetails data={student ?? undefined} />
                </div>
                <SessionHistorySection data={student ?? undefined} />
              </TabsContent>

              <TabsContent value="additional" className="space-y-6 mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <AdministrationSection data={student ?? undefined} />
                  <GuardianDetails data={student ?? undefined} />
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </main>
  );
}


