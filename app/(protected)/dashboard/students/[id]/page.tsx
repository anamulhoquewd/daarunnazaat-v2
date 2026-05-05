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
import { useState } from "react";

import { StudentProfileHeader } from "@/components/students/student/header";
import { ProfileHeaderSkeleton } from "@/components/students/student/headerSkeleton";
import { InfoSectionSkeleton } from "@/components/students/student/InfoSectionSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IUpdateStaff, IUpdateStudent } from "@/validations";
import { BookOpen, DollarSign, Info, LayoutDashboard } from "lucide-react";

export default function StudentProfilePage() {
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const {
    student,
    loading,
    handleUpdate,
    activateStudent,
    deactivateStudent,
    blockStudent,
    unblockStudent,
    softDeleteStudent,
    restoreStudent,
    permanentDeleteStudent,
  } = useStudentActions();

  const handleSave = async (data: IUpdateStudent | IUpdateStaff) => {
    const transformedData = {
      ...data,
      avatar: typeof data.avatar === "object" ? (data.avatar as any)?.url : data.avatar,
    };
    await handleUpdate(transformedData as IUpdateStudent);
  };

  if (!student && !loading.fetch) return <StudentNotFound />;

  return (
    <div className="flex flex-col gap-0">
      {loading.fetch ? (
        <ProfileHeaderSkeleton />
      ) : (
        student && (
          <StudentProfileHeader
            data={student}
            actionLoading={loading.action}
            onActivate={activateStudent}
            onDeactivate={deactivateStudent}
            onBlock={blockStudent}
            onUnblock={unblockStudent}
            onSoftDelete={softDeleteStudent}
            onRestore={restoreStudent}
            onPermanentDelete={permanentDeleteStudent}
          />
        )
      )}

      <div className="max-w-6xl mx-auto w-full px-4 py-6">
        {loading.fetch ? (
          <InfoSectionSkeleton />
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6 h-10 bg-muted/60 p-1 w-full sm:w-auto">
              <TabsTrigger value="overview" className="gap-1.5 text-sm">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="financial" className="gap-1.5 text-sm">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Financial</span>
              </TabsTrigger>
              <TabsTrigger value="academic" className="gap-1.5 text-sm">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Academic</span>
              </TabsTrigger>
              <TabsTrigger value="additional" className="gap-1.5 text-sm">
                <Info className="h-4 w-4" />
                <span className="hidden sm:inline">More Info</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-4 mt-0">
              <div className="grid gap-4 md:grid-cols-2">
                <PersonalInfoSection
                  isEditing={editingSection === "personal"}
                  onEditChange={(e) => setEditingSection(e ? "personal" : null)}
                  data={student ?? undefined}
                  onSave={handleSave}
                />
                <ContactInfoSection
                  isEditing={editingSection === "contact"}
                  onEditChange={(e) => setEditingSection(e ? "contact" : null)}
                  data={student ?? undefined}
                  onSave={handleSave}
                />
              </div>
              <AddressSection
                isEditing={editingSection === "address"}
                onEditChange={(e) => setEditingSection(e ? "address" : null)}
                data={student ?? undefined}
                onSave={handleSave}
              />
            </TabsContent>

            {/* Financial */}
            <TabsContent value="financial" className="mt-0">
              <FeesSection
                isEditing={editingSection === "fees"}
                onEditChange={(e) => setEditingSection(e ? "fees" : null)}
                data={student ?? undefined}
                onSave={handleSave}
              />
            </TabsContent>

            {/* Academic */}
            <TabsContent value="academic" className="space-y-4 mt-0">
              <div className="grid gap-4 md:grid-cols-2">
                <AcademicInfoSection
                  isEditing={editingSection === "academic"}
                  onEditChange={(e) => setEditingSection(e ? "academic" : null)}
                  data={student ?? undefined}
                  onSave={handleSave}
                />
                <ClassDetails data={student ?? undefined} />
              </div>
              <SessionHistorySection data={student ?? undefined} />
            </TabsContent>

            {/* More Info */}
            <TabsContent value="additional" className="space-y-4 mt-0">
              <div className="grid gap-4 md:grid-cols-2">
                <AdministrationSection data={student ?? undefined} />
                <GuardianDetails data={student ?? undefined} />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
