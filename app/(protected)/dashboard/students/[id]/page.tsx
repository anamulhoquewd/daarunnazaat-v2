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

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentProfileHeader } from "@/components/students/student/header";

export default function StudentProfilePage() {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [student, setStudent] = useState<any>(null);
  const { isLoading, handleUpdate } = useStudentActions();
  const params = useParams();
  const id = params.id as string;

  const { getStudentById } = useStudentActions();

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const data = await getStudentById(id);
        setStudent(data);
      } catch (error: any) {
        console.error("Error fetching student data:", error);
        setStudent(null);
      }
    };
    fetchStudent();
  }, [id]);

  if (!student && !isLoading) return <StudentNotFound />;

  return (
    <main className="min-h-screen bg-background">
      <StudentProfileHeader data={student} />

      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-fit">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="additional">More Info</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <PersonalInfoSection
                isEditing={editingSection === "personal"}
                onEditChange={(isEditing) =>
                  setEditingSection(isEditing ? "personal" : null)
                }
                data={student}
                onSave={handleUpdate}
              />
              <ContactInfoSection
                isEditing={editingSection === "contact"}
                onEditChange={(isEditing) =>
                  setEditingSection(isEditing ? "contact" : null)
                }
                data={student}
                onSave={handleUpdate}
              />
            </div>
            <AddressSection
              isEditing={editingSection === "address"}
              onEditChange={(isEditing) =>
                setEditingSection(isEditing ? "address" : null)
              }
              data={student}
              onSave={handleUpdate}
            />
            <FeesSection
              isEditing={editingSection === "fees"}
              onEditChange={(isEditing) =>
                setEditingSection(isEditing ? "fees" : null)
              }
              data={student}
              onSave={handleUpdate}
            />
          </TabsContent>

          {/* Academic Tab */}
          <TabsContent value="academic" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <AcademicInfoSection
                isEditing={editingSection === "academic"}
                onEditChange={(isEditing) =>
                  setEditingSection(isEditing ? "academic" : null)
                }
                data={student}
                onSave={handleUpdate}
              />
              <ClassDetails data={student} />
            </div>
            <SessionHistorySection data={student} />
          </TabsContent>

          {/* Additional Info Tab */}
          <TabsContent value="additional" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <AdministrationSection data={student} />
              <GuardianDetails data={student} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function StudentProfile() {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [student, setStudent] = useState<any>(null);
  const { isLoading, handleUpdate } = useStudentActions();
  const params = useParams();
  const id = params.id as string;

  const { getStudentById } = useStudentActions();

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const data = await getStudentById(id);
        setStudent(data);
      } catch (error: any) {
        console.error("Error fetching student data:", error);
        setStudent(null);
      }
    };
    fetchStudent();
  }, [id]);

  if (!student && !isLoading) return <StudentNotFound />;

  return (
    <main className="min-h-screen p-2">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Student Profile
          </h1>
          <p className="text-muted-foreground">
            View and edit student information. Click the Edit button on each
            section to modify details.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {/* Personal Info Section */}
          <PersonalInfoSection
            isEditing={editingSection === "personal"}
            onEditChange={(isEditing) =>
              setEditingSection(isEditing ? "personal" : null)
            }
            data={student}
            onSave={handleUpdate}
          />

          {/* Contact Info Section */}
          <ContactInfoSection
            isEditing={editingSection === "contact"}
            onEditChange={(isEditing) =>
              setEditingSection(isEditing ? "contact" : null)
            }
            data={student}
            onSave={handleUpdate}
          />

          {/* Address Section */}
          <AddressSection
            isEditing={editingSection === "address"}
            onEditChange={(isEditing) =>
              setEditingSection(isEditing ? "address" : null)
            }
            data={student}
            onSave={handleUpdate}
          />

          {/* Academic Info Section */}
          <AcademicInfoSection
            isEditing={editingSection === "academic"}
            onEditChange={(isEditing) =>
              setEditingSection(isEditing ? "academic" : null)
            }
            data={student}
            onSave={handleUpdate}
          />

          {/* Fees Section */}
          <FeesSection
            isEditing={editingSection === "fees"}
            onEditChange={(isEditing) =>
              setEditingSection(isEditing ? "fees" : null)
            }
            data={student}
            onSave={handleUpdate}
          />

          {/* Administration Section */}
          <AdministrationSection data={student} />

          {/* Class details Section */}
          <ClassDetails data={student} />

          {/* Session History Section */}
          <SessionHistorySection data={student} />

          {/* Guardian details Section */}
          <GuardianDetails data={student} />
        </div>
      </div>
    </main>
  );
}
