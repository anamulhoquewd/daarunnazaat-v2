"use client";
import { AcademicInfoSection } from "@/components/students/student/academicInfo";
import { AddressSection } from "@/components/students/student/addressInfo";
import { ContactInfoSection } from "@/components/students/student/contactInfo";
import { FeesSection } from "@/components/students/student/feeInfo";
import { PersonalInfoSection } from "@/components/students/student/personalInfo";
import { StudentNotFound } from "@/components/students/student/studenNotFound";
import { useStudentActions } from "@/hooks/students/useStudentActions";
import { useState } from "react";

export default function StudentProfile() {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const { isLoading, student, handleUpdate } = useStudentActions();

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
        </div>
      </div>
    </main>
  );
}
