"use client";
import { AcademicInfoSection } from "@/components/students/student/academicInfo";
import { AddressSection } from "@/components/students/student/addressInfo";
import { ContactInfoSection } from "@/components/students/student/contactInfo";
import { FeesSection } from "@/components/students/student/feeInfo";
import { PersonalInfoSection } from "@/components/students/student/personalInfo";
import {
  AcademicInfo,
  Addresses,
  ContactInfo,
  Fees,
  PersonalInfo,
} from "@/validations/student";
import { useState } from "react";

// Mock student data - Replace with actual data from your API
const mockStudentData = {
  personalInfo: {
    firstName: "yuoyuo",
    lastName: "skjfs",
    dateOfBirth: new Date("2010-01-13"),
    gender: "male" as const,
    bloodGroup: undefined,
    fatherName: undefined,
    motherName: undefined,
    nid: undefined,
    birthCertificateNumber: undefined,
  },
  contactInfo: {
    email: "student_tow@gmail.com",
    phone: "01912345683",
    alternativePhone: "01601024262",
    whatsApp: undefined,
  },
  addresses: {
    presentAddress: {
      village: "yoyo",
      postOffice: "yo",
      upazila: "oyuoy",
      district: "yoy",
      division: "ytit",
    },
    permanentAddress: {
      village: "tyiti",
      postOffice: "t",
      upazila: "ityi",
      district: "tyity",
      division: "tyiyt",
    },
  },
  academicInfo: {
    studentId: "STU-2026-0002",
    classId: "uniqueClassName",
    branch: "branch_1",
    batchType: "january_december",
    currentSessionId: "InvalidInput",
    admissionDate: new Date("2026-01-22"),
  },
  fees: {
    admissionFee: 2,
    admissionDiscount: 4,
    monthlyFee: 3,
    residentialFee: 4,
    mealFee: 4,
    isResidential: true,
    isMealIncluded: true,
  },
};

export default function StudentProfile() {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [studentData, setStudentData] = useState(mockStudentData);
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePersonalInfo = async (data: PersonalInfo) => {
    setIsSaving(true);
    try {
      // Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStudentData((prev) => ({
        ...prev,
        personalInfo: data,
      }));
      console.log("Personal info saved:", data);
    } catch (error) {
      console.error("Error saving personal info:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveContactInfo = async (data: ContactInfo) => {
    setIsSaving(true);
    try {
      // Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStudentData((prev) => ({
        ...prev,
        contactInfo: data,
      }));
      console.log("Contact info saved:", data);
    } catch (error) {
      console.error("Error saving contact info:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAddresses = async (data: Addresses) => {
    setIsSaving(true);
    try {
      // Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStudentData((prev) => ({
        ...prev,
        addresses: data,
      }));
      console.log("Addresses saved:", data);
    } catch (error) {
      console.error("Error saving addresses:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAcademicInfo = async (data: AcademicInfo) => {
    setIsSaving(true);
    try {
      // Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStudentData((prev) => ({
        ...prev,
        academicInfo: data,
      }));
      console.log("Academic info saved:", data);
    } catch (error) {
      console.error("Error saving academic info:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFees = async (data: Fees) => {
    setIsSaving(true);
    try {
      // Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStudentData((prev) => ({
        ...prev,
        fees: data,
      }));
      console.log("Fees saved:", data);
    } catch (error) {
      console.error("Error saving fees:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-background p-6">
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
            data={studentData.personalInfo}
            onSave={handleSavePersonalInfo}
          />

          {/* Contact Info Section */}
          <ContactInfoSection
            isEditing={editingSection === "contact"}
            onEditChange={(isEditing) =>
              setEditingSection(isEditing ? "contact" : null)
            }
            data={studentData.contactInfo}
            onSave={handleSaveContactInfo}
          />

          {/* Address Section */}
          <AddressSection
            isEditing={editingSection === "address"}
            onEditChange={(isEditing) =>
              setEditingSection(isEditing ? "address" : null)
            }
            data={studentData.addresses}
            onSave={handleSaveAddresses}
          />

          {/* Academic Info Section */}
          <AcademicInfoSection
            isEditing={editingSection === "academic"}
            onEditChange={(isEditing) =>
              setEditingSection(isEditing ? "academic" : null)
            }
            data={studentData.academicInfo}
            onSave={handleSaveAcademicInfo}
          />

          {/* Fees Section */}
          <FeesSection
            isEditing={editingSection === "fees"}
            onEditChange={(isEditing) =>
              setEditingSection(isEditing ? "fees" : null)
            }
            data={studentData.fees}
            onSave={handleSaveFees}
          />
        </div>
      </div>
    </main>
  );
}
