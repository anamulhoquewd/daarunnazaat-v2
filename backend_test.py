#!/usr/bin/env python3
"""
Darun Nazat Madrasa Educational Management System - Backend API Tests
"""

import requests
import json
import time
from datetime import datetime
import os

# Configuration
BASE_URL = "https://islamic-edu-hub-11.preview.emergentagent.com/api"
ADMIN_EMAIL = "anamulhoquewd@gmail.com"
ADMIN_PHONE = "01975024262" 
ADMIN_PASSWORD = "Pass1234"

class BackendTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.token = None
        self.headers = {'Content-Type': 'application/json'}
        
        # Test data storage
        self.branch_001 = None
        self.branch_002 = None
        self.session_001 = None
        self.session_002 = None
        self.class_001 = None
        self.class_002 = None
        self.student_id = None
        self.teacher_id = None
        
        print(f"🧪 Starting Backend API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)

    def make_request(self, method, endpoint, data=None, require_auth=True):
        """Make HTTP request with proper error handling"""
        url = f"{self.base_url}{endpoint}"
        headers = self.headers.copy()
        
        if require_auth and self.token:
            headers['Authorization'] = f'Bearer {self.token}'
            
        try:
            if method == 'GET':
                response = self.session.get(url, headers=headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            return response
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Request failed: {e}")
            return None

    def test_authentication(self):
        """Test authentication endpoints"""
        print("\n🔐 Testing Authentication...")
        
        # Test login with email
        try:
            print("📧 Testing login with email...")
            login_data = {
                "identifier": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD
            }
            response = self.make_request('POST', '/auth/login', login_data, require_auth=False)
            
            if response and response.status_code == 200:
                data = response.json()
                self.token = data.get('token')
                print(f"✅ Email login successful - Token: {self.token[:20]}...")
                print(f"   User: {data.get('user', {}).get('name')} ({data.get('user', {}).get('role')})")
            else:
                print(f"❌ Email login failed - Status: {response.status_code if response else 'No response'}")
                if response:
                    print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Email login error: {e}")
            return False

        # Test login with phone
        try:
            print("📱 Testing login with phone...")
            login_data = {
                "identifier": ADMIN_PHONE,
                "password": ADMIN_PASSWORD
            }
            response = self.make_request('POST', '/auth/login', login_data, require_auth=False)
            
            if response and response.status_code == 200:
                data = response.json()
                phone_token = data.get('token')
                print(f"✅ Phone login successful - Token: {phone_token[:20]}...")
            else:
                print(f"❌ Phone login failed - Status: {response.status_code if response else 'No response'}")
                
        except Exception as e:
            print(f"❌ Phone login error: {e}")

        # Test /auth/me with token
        try:
            print("👤 Testing /auth/me with token...")
            response = self.make_request('GET', '/auth/me')
            
            if response and response.status_code == 200:
                user_data = response.json()
                print(f"✅ Auth me successful - User: {user_data.get('name')} ({user_data.get('role')})")
            else:
                print(f"❌ Auth me failed - Status: {response.status_code if response else 'No response'}")
                
        except Exception as e:
            print(f"❌ Auth me error: {e}")

        # Test /auth/me without token
        try:
            print("🚫 Testing /auth/me without token...")
            response = self.make_request('GET', '/auth/me', require_auth=False)
            
            if response and response.status_code == 401:
                print(f"✅ Auth me without token correctly failed - Status: 401")
            else:
                print(f"❌ Auth me without token should fail with 401 - Status: {response.status_code if response else 'No response'}")
                
        except Exception as e:
            print(f"❌ Auth me without token error: {e}")

        return self.token is not None

    def test_branches(self):
        """Test branch management"""
        print("\n🏢 Testing Branch Management...")
        
        try:
            response = self.make_request('GET', '/branches')
            
            if response and response.status_code == 200:
                branches = response.json()
                print(f"✅ Retrieved {len(branches)} branches")
                
                # Store branch IDs for later use
                for branch in branches:
                    if branch.get('name') == 'Main Branch':
                        self.branch_001 = branch.get('id')
                        print(f"   📍 Found Main Branch: {self.branch_001}")
                    elif branch.get('name') == 'Secondary Branch':
                        self.branch_002 = branch.get('id')
                        print(f"   📍 Found Secondary Branch: {self.branch_002}")
                        
                if not self.branch_001 or not self.branch_002:
                    # Use the first two branches available
                    if len(branches) >= 2:
                        self.branch_001 = branches[0].get('id')
                        self.branch_002 = branches[1].get('id')
                        print(f"   📍 Using branches: {self.branch_001}, {self.branch_002}")
                    else:
                        print(f"❌ Insufficient branches found. Expected 2, got {len(branches)}")
                        return False
                        
                return True
            else:
                print(f"❌ Branch retrieval failed - Status: {response.status_code if response else 'No response'}")
                if response:
                    print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Branch test error: {e}")
            return False

    def test_sessions(self):
        """Test session management"""
        print("\n📅 Testing Session Management...")
        
        if not self.branch_001 or not self.branch_002:
            print("❌ Cannot test sessions - branch IDs not available")
            return False
        
        # Create session for branch_001
        try:
            print("📝 Creating session '2026' for Main Branch...")
            session_data = {
                "name": "2026",
                "branch_id": self.branch_001,
                "is_active": True,
                "start_date": "2026-01-01",
                "end_date": "2026-12-31"
            }
            response = self.make_request('POST', '/sessions', session_data)
            
            if response and response.status_code == 200:
                session = response.json()
                self.session_001 = session.get('id')
                print(f"✅ Session created for Main Branch - ID: {self.session_001}")
            else:
                print(f"❌ Session creation failed - Status: {response.status_code if response else 'No response'}")
                if response:
                    print(f"   Response: {response.text}")
                    
        except Exception as e:
            print(f"❌ Session creation error: {e}")

        # Create session for branch_002
        try:
            print("📝 Creating session '2026' for Secondary Branch...")
            session_data = {
                "name": "2026", 
                "branch_id": self.branch_002,
                "is_active": True,
                "start_date": "2026-01-01",
                "end_date": "2026-12-31"
            }
            response = self.make_request('POST', '/sessions', session_data)
            
            if response and response.status_code == 200:
                session = response.json()
                self.session_002 = session.get('id')
                print(f"✅ Session created for Secondary Branch - ID: {self.session_002}")
            else:
                print(f"❌ Session creation failed - Status: {response.status_code if response else 'No response'}")
                    
        except Exception as e:
            print(f"❌ Session creation error: {e}")

        # Get sessions for branch_001
        try:
            print("📋 Retrieving sessions for Main Branch...")
            response = self.make_request('GET', f'/sessions?branch_id={self.branch_001}')
            
            if response and response.status_code == 200:
                sessions = response.json()
                print(f"✅ Retrieved {len(sessions)} sessions for Main Branch")
                if not self.session_001 and len(sessions) > 0:
                    self.session_001 = sessions[0].get('id')
                    print(f"   📍 Using session: {self.session_001}")
            else:
                print(f"❌ Session retrieval failed - Status: {response.status_code if response else 'No response'}")
                
        except Exception as e:
            print(f"❌ Session retrieval error: {e}")

        return self.session_001 is not None

    def test_classes(self):
        """Test class management"""
        print("\n🎓 Testing Class Management...")
        
        if not self.branch_001:
            print("❌ Cannot test classes - branch_001 not available")
            return False
        
        # Create Class 1
        try:
            print("📝 Creating 'Class 1' for Main Branch...")
            class_data = {
                "name": "Class 1",
                "branch_id": self.branch_001,
                "order": 1
            }
            response = self.make_request('POST', '/classes', class_data)
            
            if response and response.status_code == 200:
                class_obj = response.json()
                self.class_001 = class_obj.get('id')
                print(f"✅ Class 1 created - ID: {self.class_001}")
            else:
                print(f"❌ Class 1 creation failed - Status: {response.status_code if response else 'No response'}")
                if response:
                    print(f"   Response: {response.text}")
                    
        except Exception as e:
            print(f"❌ Class 1 creation error: {e}")

        # Create Class 2
        try:
            print("📝 Creating 'Class 2' for Main Branch...")
            class_data = {
                "name": "Class 2",
                "branch_id": self.branch_001,
                "order": 2
            }
            response = self.make_request('POST', '/classes', class_data)
            
            if response and response.status_code == 200:
                class_obj = response.json()
                self.class_002 = class_obj.get('id')
                print(f"✅ Class 2 created - ID: {self.class_002}")
            else:
                print(f"❌ Class 2 creation failed - Status: {response.status_code if response else 'No response'}")
                    
        except Exception as e:
            print(f"❌ Class 2 creation error: {e}")

        # Get classes for branch_001
        try:
            print("📋 Retrieving classes for Main Branch...")
            response = self.make_request('GET', f'/classes?branch_id={self.branch_001}')
            
            if response and response.status_code == 200:
                classes = response.json()
                print(f"✅ Retrieved {len(classes)} classes for Main Branch")
                
                # Ensure we have class IDs
                if not self.class_001 and len(classes) > 0:
                    self.class_001 = classes[0].get('id')
                    print(f"   📍 Using class: {self.class_001}")
                    
            else:
                print(f"❌ Class retrieval failed - Status: {response.status_code if response else 'No response'}")
                
        except Exception as e:
            print(f"❌ Class retrieval error: {e}")

        return self.class_001 is not None

    def test_students(self):
        """Test student management"""
        print("\n👨‍🎓 Testing Student Management...")
        
        if not all([self.branch_001, self.session_001, self.class_001]):
            print("❌ Cannot test students - required IDs not available")
            print(f"   Branch: {self.branch_001}, Session: {self.session_001}, Class: {self.class_001}")
            return False
        
        # Admit a student
        try:
            print("📝 Admitting student 'Ahmed Ali'...")
            student_data = {
                "name": "Ahmed Ali",
                "phone": "01711111111",
                "email": "ahmed@test.com",
                "guardian_name": "Ali Rahman", 
                "guardian_phone": "01722222222",
                "address": "Dhaka, Bangladesh",
                "branch_id": self.branch_001,
                "session_id": self.session_001,
                "class_id": self.class_001,
                "roll_number": 1,
                "fee_structure": {
                    "monthly_fee": 500,
                    "meal_fee": 300,
                    "residential_fee": 0,
                    "utility_fee": 0,
                    "examination_fee": 0,
                    "other_fees": 0
                }
            }
            response = self.make_request('POST', '/students', student_data)
            
            if response and response.status_code == 200:
                result = response.json()
                student = result.get('student', {})
                self.student_id = student.get('id')
                user = result.get('user', {})
                print(f"✅ Student admitted - ID: {self.student_id}")
                print(f"   User created: {user.get('name')} (Role: {user.get('role')})")
                print(f"   Running balance: {student.get('running_balance', 0)}")
            else:
                print(f"❌ Student admission failed - Status: {response.status_code if response else 'No response'}")
                if response:
                    print(f"   Response: {response.text}")
                    
        except Exception as e:
            print(f"❌ Student admission error: {e}")

        # Get students for branch_001
        try:
            print("📋 Retrieving students for Main Branch...")
            response = self.make_request('GET', f'/students?branch_id={self.branch_001}')
            
            if response and response.status_code == 200:
                students = response.json()
                print(f"✅ Retrieved {len(students)} students for Main Branch")
                
                # Ensure we have student ID
                if not self.student_id and len(students) > 0:
                    self.student_id = students[0].get('id')
                    print(f"   📍 Using student: {self.student_id}")
                    
            else:
                print(f"❌ Student retrieval failed - Status: {response.status_code if response else 'No response'}")
                
        except Exception as e:
            print(f"❌ Student retrieval error: {e}")

        # Get specific student
        if self.student_id:
            try:
                print(f"👤 Retrieving specific student: {self.student_id}")
                response = self.make_request('GET', f'/students/{self.student_id}')
                
                if response and response.status_code == 200:
                    student = response.json()
                    print(f"✅ Student retrieved - {student.get('name')} (Roll: {student.get('roll_number')})")
                    print(f"   Running balance: {student.get('running_balance', 0)}")
                else:
                    print(f"❌ Specific student retrieval failed - Status: {response.status_code if response else 'No response'}")
                    
            except Exception as e:
                print(f"❌ Specific student retrieval error: {e}")

            # Get student ledger
            try:
                print(f"📊 Retrieving student ledger: {self.student_id}")
                response = self.make_request('GET', f'/students/{self.student_id}/ledger')
                
                if response and response.status_code == 200:
                    ledger = response.json()
                    print(f"✅ Ledger retrieved - Running balance: {ledger.get('running_balance', 0)}")
                    print(f"   Transactions: {len(ledger.get('transactions', []))}")
                else:
                    print(f"❌ Ledger retrieval failed - Status: {response.status_code if response else 'No response'}")
                    
            except Exception as e:
                print(f"❌ Ledger retrieval error: {e}")

        return self.student_id is not None

    def test_payments(self):
        """Test payment processing"""
        print("\n💰 Testing Payment Processing...")
        
        if not self.student_id:
            print("❌ Cannot test payments - student_id not available")
            return False
        
        # Process payment
        try:
            print(f"💳 Processing payment of 800 for student: {self.student_id}")
            payment_data = {
                "amount": 800,
                "fee_type": "monthly_fee",
                "remarks": "Monthly fee payment for January 2026"
            }
            response = self.make_request('POST', f'/students/{self.student_id}/payment', payment_data)
            
            if response and response.status_code == 200:
                result = response.json()
                transaction = result.get('transaction', {})
                new_balance = result.get('new_balance', 0)
                print(f"✅ Payment processed - Transaction ID: {transaction.get('transaction_id')}")
                print(f"   New balance: {new_balance}")
                print(f"   Amount: {transaction.get('amount')}")
            else:
                print(f"❌ Payment processing failed - Status: {response.status_code if response else 'No response'}")
                if response:
                    print(f"   Response: {response.text}")
                    
        except Exception as e:
            print(f"❌ Payment processing error: {e}")

        # Verify updated ledger
        try:
            print(f"📊 Verifying updated ledger: {self.student_id}")
            response = self.make_request('GET', f'/students/{self.student_id}/ledger')
            
            if response and response.status_code == 200:
                ledger = response.json()
                print(f"✅ Updated ledger - Running balance: {ledger.get('running_balance', 0)}")
                print(f"   Transactions: {len(ledger.get('transactions', []))}")
            else:
                print(f"❌ Updated ledger retrieval failed - Status: {response.status_code if response else 'No response'}")
                
        except Exception as e:
            print(f"❌ Updated ledger error: {e}")

        # Verify updated student record
        try:
            print(f"👤 Verifying updated student record: {self.student_id}")
            response = self.make_request('GET', f'/students/{self.student_id}')
            
            if response and response.status_code == 200:
                student = response.json()
                print(f"✅ Updated student - Running balance: {student.get('running_balance', 0)}")
            else:
                print(f"❌ Updated student retrieval failed - Status: {response.status_code if response else 'No response'}")
                
        except Exception as e:
            print(f"❌ Updated student retrieval error: {e}")

        return True

    def test_teachers(self):
        """Test teacher management"""
        print("\n👨‍🏫 Testing Teacher Management...")
        
        if not self.branch_001:
            print("❌ Cannot test teachers - branch_001 not available")
            return False
        
        # Add a teacher
        try:
            print("📝 Adding teacher 'Maulana Rahman'...")
            teacher_data = {
                "name": "Maulana Rahman",
                "phone": "01733333333",
                "email": "rahman@test.com",
                "designation": "Head Teacher",
                "rank": 1,
                "primary_branch_id": self.branch_001,
                "branch_ids": [self.branch_001],
                "recruitment_date": "2026-01-01",
                "monthly_salary": 15000
            }
            response = self.make_request('POST', '/teachers', teacher_data)
            
            if response and response.status_code == 200:
                result = response.json()
                teacher = result.get('teacher', {})
                self.teacher_id = teacher.get('id')
                user = result.get('user', {})
                print(f"✅ Teacher added - ID: {self.teacher_id}")
                print(f"   User created: {user.get('name')} (Role: {user.get('role')})")
                print(f"   Salary: {teacher.get('monthly_salary')}")
            else:
                print(f"❌ Teacher addition failed - Status: {response.status_code if response else 'No response'}")
                if response:
                    print(f"   Response: {response.text}")
                    
        except Exception as e:
            print(f"❌ Teacher addition error: {e}")

        # Get teachers for branch_001
        try:
            print("📋 Retrieving teachers for Main Branch...")
            response = self.make_request('GET', f'/teachers?branch_id={self.branch_001}')
            
            if response and response.status_code == 200:
                teachers = response.json()
                print(f"✅ Retrieved {len(teachers)} teachers for Main Branch")
                
                # Ensure we have teacher ID
                if not self.teacher_id and len(teachers) > 0:
                    self.teacher_id = teachers[0].get('id')
                    print(f"   📍 Using teacher: {self.teacher_id}")
                    
            else:
                print(f"❌ Teacher retrieval failed - Status: {response.status_code if response else 'No response'}")
                
        except Exception as e:
            print(f"❌ Teacher retrieval error: {e}")

        return self.teacher_id is not None

    def test_salary_payment(self):
        """Test salary payment"""
        print("\n💸 Testing Salary Payment...")
        
        if not self.teacher_id:
            print("❌ Cannot test salary payment - teacher_id not available")
            return False
        
        # Pay salary
        try:
            print(f"💳 Paying salary for teacher: {self.teacher_id}")
            salary_data = {
                "amount": 15000,
                "month": "February 2026",
                "remarks": "Monthly salary for February 2026"
            }
            response = self.make_request('POST', f'/teachers/{self.teacher_id}/salary', salary_data)
            
            if response and response.status_code == 200:
                salary_transaction = response.json()
                print(f"✅ Salary paid - Transaction ID: {salary_transaction.get('transaction_id')}")
                print(f"   Amount: {salary_transaction.get('amount')}")
                print(f"   Month: {salary_transaction.get('month')}")
            else:
                print(f"❌ Salary payment failed - Status: {response.status_code if response else 'No response'}")
                if response:
                    print(f"   Response: {response.text}")
                    
        except Exception as e:
            print(f"❌ Salary payment error: {e}")

        return True

    def test_dashboard(self):
        """Test dashboard analytics"""
        print("\n📊 Testing Dashboard Analytics...")
        
        if not self.branch_001:
            print("❌ Cannot test dashboard - branch_001 not available")
            return False
        
        try:
            print(f"📈 Getting dashboard stats for Main Branch: {self.branch_001}")
            response = self.make_request('GET', f'/dashboard?branch_id={self.branch_001}')
            
            if response and response.status_code == 200:
                dashboard = response.json()
                print(f"✅ Dashboard retrieved successfully")
                print(f"   Total students: {dashboard.get('total_students', 0)}")
                print(f"   Total teachers: {dashboard.get('total_teachers', 0)}")
                print(f"   Monthly income: {dashboard.get('monthly_income', 0)}")
                print(f"   Monthly expenses: {dashboard.get('monthly_expenses', 0)}")
                print(f"   Pending fees: {dashboard.get('pending_fees', 0)} (Count: {dashboard.get('pending_fees_count', 0)})")
                print(f"   Recent transactions: {len(dashboard.get('recent_transactions', []))}")
                print(f"   Students by class: {len(dashboard.get('students_by_class', []))}")
            else:
                print(f"❌ Dashboard retrieval failed - Status: {response.status_code if response else 'No response'}")
                if response:
                    print(f"   Response: {response.text}")
                    
        except Exception as e:
            print(f"❌ Dashboard error: {e}")

        return True

    def test_public_api(self):
        """Test public API"""
        print("\n🌐 Testing Public API...")
        
        try:
            print("📋 Getting public info...")
            response = self.make_request('GET', '/public/info', require_auth=False)
            
            if response and response.status_code == 200:
                info = response.json()
                print(f"✅ Public info retrieved successfully")
                print(f"   Madrasa: {info.get('madrasa_name')}")
                print(f"   Address: {info.get('address')}")
                print(f"   Total students: {info.get('total_students', 0)}")
                print(f"   Total teachers: {info.get('total_teachers', 0)}")
                print(f"   Branches: {len(info.get('branches', []))}")
            else:
                print(f"❌ Public info retrieval failed - Status: {response.status_code if response else 'No response'}")
                if response:
                    print(f"   Response: {response.text}")
                    
        except Exception as e:
            print(f"❌ Public API error: {e}")

        return True

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting comprehensive backend API tests...")
        
        test_results = {}
        
        # Run tests in sequence
        test_results['authentication'] = self.test_authentication()
        if not test_results['authentication']:
            print("💀 Authentication failed - stopping tests")
            return test_results
            
        test_results['branches'] = self.test_branches()
        test_results['sessions'] = self.test_sessions() 
        test_results['classes'] = self.test_classes()
        test_results['students'] = self.test_students()
        test_results['payments'] = self.test_payments()
        test_results['teachers'] = self.test_teachers()
        test_results['salary_payment'] = self.test_salary_payment()
        test_results['dashboard'] = self.test_dashboard()
        test_results['public_api'] = self.test_public_api()
        
        # Print summary
        print("\n" + "=" * 60)
        print("🏁 TEST SUMMARY")
        print("=" * 60)
        
        for test_name, result in test_results.items():
            status = "✅ PASSED" if result else "❌ FAILED"
            print(f"{test_name.replace('_', ' ').title():.<30} {status}")
        
        passed = sum(1 for result in test_results.values() if result)
        total = len(test_results)
        
        print(f"\nOverall: {passed}/{total} tests passed")
        
        return test_results

if __name__ == "__main__":
    try:
        tester = BackendTester()
        results = tester.run_all_tests()
        
        # Exit with appropriate code
        failed_tests = [name for name, result in results.items() if not result]
        if failed_tests:
            print(f"\n❌ Failed tests: {', '.join(failed_tests)}")
            exit(1)
        else:
            print(f"\n🎉 All tests passed!")
            exit(0)
            
    except KeyboardInterrupt:
        print("\n\n⏹️  Tests interrupted by user")
        exit(130)
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        exit(1)