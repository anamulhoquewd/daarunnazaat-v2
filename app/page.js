'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { 
  Users, 
  GraduationCap, 
  DollarSign, 
  BookOpen, 
  LogOut, 
  Home,
  UserPlus,
  CreditCard,
  BarChart3,
  Settings,
  Building2
} from 'lucide-react'

const API_BASE = '/api'

function App() {
  const { toast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [currentView, setCurrentView] = useState('public')
  const [branches, setBranches] = useState([])
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [sessions, setSessions] = useState([])
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [dashboardData, setDashboardData] = useState(null)
  const [publicInfo, setPublicInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  // Login form
  const [loginData, setLoginData] = useState({ identifier: '', password: '' })

  // Student admission form
  const [studentForm, setStudentForm] = useState({
    name: '',
    phone: '',
    email: '',
    guardian_name: '',
    guardian_phone: '',
    address: '',
    date_of_birth: '',
    branch_id: '',
    session_id: '',
    class_id: '',
    roll_number: 1,
    fee_structure: {
      monthly_fee: 0,
      residential_fee: 0,
      meal_fee: 0,
      utility_fee: 0,
      examination_fee: 0,
      other_fees: 0
    }
  })

  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    student_id: '',
    amount: 0,
    fee_type: 'monthly_fee',
    remarks: ''
  })

  // Teacher form
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    phone: '',
    email: '',
    designation: '',
    rank: 1,
    primary_branch_id: '',
    branch_ids: [],
    recruitment_date: new Date().toISOString().split('T')[0],
    monthly_salary: 0
  })

  // Session form
  const [sessionForm, setSessionForm] = useState({
    name: '',
    branch_id: '',
    is_active: true,
    start_date: new Date().toISOString().split('T')[0]
  })

  // Class form
  const [classForm, setClassForm] = useState({
    name: '',
    branch_id: '',
    order: 1
  })

  useEffect(() => {
    loadPublicInfo()
    const token = localStorage.getItem('token')
    if (token) {
      loadUserData(token)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && selectedBranch) {
      loadBranchData()
    }
  }, [isAuthenticated, selectedBranch])

  const loadPublicInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE}/public/info`)
      setPublicInfo(response.data)
    } catch (error) {
      console.error('Failed to load public info:', error)
    }
  }

  const loadUserData = async (token) => {
    try {
      const response = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUser(response.data)
      setIsAuthenticated(true)
      setCurrentView('dashboard')
      await loadBranches(token)
    } catch (error) {
      localStorage.removeItem('token')
    }
  }

  const loadBranches = async (token) => {
    try {
      const response = await axios.get(`${API_BASE}/branches`, {
        headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` }
      })
      setBranches(response.data)
      if (response.data.length > 0) {
        setSelectedBranch(response.data[0].id)
      }
    } catch (error) {
      console.error('Failed to load branches:', error)
    }
  }

  const loadBranchData = async () => {
    if (!selectedBranch) return
    
    const token = localStorage.getItem('token')
    try {
      const [sessionsRes, classesRes, studentsRes, teachersRes, dashboardRes] = await Promise.all([
        axios.get(`${API_BASE}/sessions?branch_id=${selectedBranch}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/classes?branch_id=${selectedBranch}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/students?branch_id=${selectedBranch}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/teachers?branch_id=${selectedBranch}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/dashboard?branch_id=${selectedBranch}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      setSessions(sessionsRes.data)
      setClasses(classesRes.data)
      setStudents(studentsRes.data)
      setTeachers(teachersRes.data)
      setDashboardData(dashboardRes.data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load branch data',
        variant: 'destructive'
      })
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post(`${API_BASE}/auth/login`, loginData)
      localStorage.setItem('token', response.data.token)
      setUser(response.data.user)
      setIsAuthenticated(true)
      setCurrentView('dashboard')
      await loadBranches(response.data.token)
      toast({
        title: 'Success',
        description: 'Logged in successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Login failed',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    setUser(null)
    setCurrentView('public')
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully'
    })
  }

  const handleStudentAdmission = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post(`${API_BASE}/students`, studentForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      toast({
        title: 'Success',
        description: 'Student admitted successfully'
      })
      loadBranchData()
      // Reset form
      setStudentForm({
        name: '',
        phone: '',
        email: '',
        guardian_name: '',
        guardian_phone: '',
        address: '',
        date_of_birth: '',
        branch_id: selectedBranch,
        session_id: '',
        class_id: '',
        roll_number: 1,
        fee_structure: {
          monthly_fee: 0,
          residential_fee: 0,
          meal_fee: 0,
          utility_fee: 0,
          examination_fee: 0,
          other_fees: 0
        }
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Admission failed',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post(
        `${API_BASE}/students/${paymentForm.student_id}/payment`,
        paymentForm,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      )
      toast({
        title: 'Success',
        description: 'Payment processed successfully'
      })
      loadBranchData()
      setPaymentForm({
        student_id: '',
        amount: 0,
        fee_type: 'monthly_fee',
        remarks: ''
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Payment failed',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTeacherCreate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post(`${API_BASE}/teachers`, teacherForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      toast({
        title: 'Success',
        description: 'Teacher added successfully'
      })
      loadBranchData()
      setTeacherForm({
        name: '',
        phone: '',
        email: '',
        designation: '',
        rank: 1,
        primary_branch_id: selectedBranch,
        branch_ids: [selectedBranch],
        recruitment_date: new Date().toISOString().split('T')[0],
        monthly_salary: 0
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to add teacher',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSessionCreate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post(`${API_BASE}/sessions`, sessionForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      toast({
        title: 'Success',
        description: 'Session created successfully'
      })
      loadBranchData()
      setSessionForm({
        name: '',
        branch_id: selectedBranch,
        is_active: true,
        start_date: new Date().toISOString().split('T')[0]
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create session',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClassCreate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post(`${API_BASE}/classes`, classForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      toast({
        title: 'Success',
        description: 'Class created successfully'
      })
      loadBranchData()
      setClassForm({
        name: '',
        branch_id: selectedBranch,
        order: 1
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create class',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Public page
  if (!isAuthenticated && currentView === 'public') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <GraduationCap className="h-16 w-16 text-emerald-600" />
            </div>
            <h1 className="text-5xl font-bold text-emerald-900 mb-2">Darun Nazat Madrasa</h1>
            <p className="text-xl text-emerald-700">Kawla Zamindarbari, Dakshinkhan, Dhaka</p>
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mb-8">
            <Button onClick={() => setCurrentView('public')}>Home</Button>
            <Button onClick={() => setCurrentView('about')} variant="outline">About</Button>
            <Button onClick={() => setCurrentView('contact')} variant="outline">Contact</Button>
            <Button onClick={() => setCurrentView('login')} variant="default">
              Login
            </Button>
          </div>

          {/* Branch Information */}
          {publicInfo && (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {publicInfo.branches.map((branch) => (
                <Card key={branch.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {branch.name}
                    </CardTitle>
                    <CardDescription>{branch.address}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="font-medium">Total Students:</span>
                        <Badge>{branch.student_count}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Total Teachers:</span>
                        <Badge>{branch.teacher_count}</Badge>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Classes:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {branch.classes.map((cls) => (
                            <div key={cls.id} className="flex justify-between text-sm">
                              <span>{cls.name}</span>
                              <span className="text-muted-foreground">{cls.student_count} students</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Stats */}
          {publicInfo && (
            <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{publicInfo.total_students}</CardTitle>
                  <CardDescription>Total Students</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{publicInfo.total_teachers}</CardTitle>
                  <CardDescription>Total Teachers</CardDescription>
                </CardHeader>
              </Card>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Login page
  if (!isAuthenticated && currentView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <GraduationCap className="h-12 w-12 text-emerald-600" />
            </div>
            <CardTitle className="text-center text-2xl">Darun Nazat Madrasa</CardTitle>
            <CardDescription className="text-center">Login to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="identifier">Phone or Email</Label>
                <Input
                  id="identifier"
                  value={loginData.identifier}
                  onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
                  placeholder="Enter phone or email"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="Enter password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => setCurrentView('public')}
              >
                Back to Home
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // About page
  if (!isAuthenticated && currentView === 'about') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button onClick={() => setCurrentView('public')} variant="outline" className="mb-6">
            Back to Home
          </Button>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">About Darun Nazat Madrasa</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-lg mb-4">
                Darun Nazat Madrasa is a leading Islamic educational institution dedicated to providing 
                quality education combining traditional Islamic studies with modern academic curriculum.
              </p>
              <p className="mb-4">
                Located in Kawla Zamindarbari, Dakshinkhan, Dhaka, we serve the community through our 
                two branches, offering comprehensive educational programs for students at all levels.
              </p>
              <h3 className="text-xl font-semibold mt-6 mb-2">Our Mission</h3>
              <p className="mb-4">
                To nurture young minds with Islamic values and modern education, preparing them to be 
                responsible citizens who contribute positively to society.
              </p>
              <h3 className="text-xl font-semibold mt-6 mb-2">Our Vision</h3>
              <p>
                To become a center of excellence in Islamic education, recognized for academic achievement 
                and moral development of students.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Contact page
  if (!isAuthenticated && currentView === 'contact') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button onClick={() => setCurrentView('public')} variant="outline" className="mb-6">
            Back to Home
          </Button>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Address</h3>
                <p className="text-muted-foreground">Kawla Zamindarbari, Dakshinkhan, Dhaka</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Email</h3>
                <p className="text-muted-foreground">info@darunnazat.edu.bd</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Phone</h3>
                <p className="text-muted-foreground">+880 1975024262</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Authenticated Dashboard
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <GraduationCap className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Darun Nazat Madrasa</h1>
                <p className="text-sm text-muted-foreground">{user?.name} ({user?.role})</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {branches.length > 0 && (
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={currentView} onValueChange={setCurrentView} className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
            <TabsTrigger value="dashboard">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="students">
              <Users className="h-4 w-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="teachers">
              <GraduationCap className="h-4 w-4 mr-2" />
              Teachers
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="h-4 w-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {dashboardData && (
              <>
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData.total_students}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData.total_teachers}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">৳{dashboardData.monthly_income}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">৳{dashboardData.pending_fees}</div>
                      <p className="text-xs text-muted-foreground">{dashboardData.pending_fees_count} students</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Students by Class</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {dashboardData.students_by_class.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span>{item.class_name}</span>
                          <Badge>{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dashboardData.recent_transactions.map((txn) => (
                          <TableRow key={txn.id}>
                            <TableCell>{new Date(txn.date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge variant={txn.type === 'income' ? 'default' : 'destructive'}>
                                {txn.type}
                              </Badge>
                            </TableCell>
                            <TableCell>{txn.category}</TableCell>
                            <TableCell>৳{txn.amount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            {['super_admin', 'admin'].includes(user?.role) && (
              <Card>
                <CardHeader>
                  <CardTitle>Admit New Student</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleStudentAdmission} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Student Name</Label>
                        <Input
                          value={studentForm.name}
                          onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={studentForm.phone}
                          onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Email (Optional)</Label>
                        <Input
                          type="email"
                          value={studentForm.email}
                          onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Guardian Name</Label>
                        <Input
                          value={studentForm.guardian_name}
                          onChange={(e) => setStudentForm({ ...studentForm, guardian_name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Guardian Phone</Label>
                        <Input
                          value={studentForm.guardian_phone}
                          onChange={(e) => setStudentForm({ ...studentForm, guardian_phone: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Roll Number</Label>
                        <Input
                          type="number"
                          value={studentForm.roll_number}
                          onChange={(e) => setStudentForm({ ...studentForm, roll_number: parseInt(e.target.value) })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Session</Label>
                        <Select
                          value={studentForm.session_id}
                          onValueChange={(value) => setStudentForm({ ...studentForm, session_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Session" />
                          </SelectTrigger>
                          <SelectContent>
                            {sessions.map((session) => (
                              <SelectItem key={session.id} value={session.id}>
                                {session.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Class</Label>
                        <Select
                          value={studentForm.class_id}
                          onValueChange={(value) => setStudentForm({ ...studentForm, class_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id}>
                                {cls.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Monthly Fee (৳)</Label>
                        <Input
                          type="number"
                          value={studentForm.fee_structure.monthly_fee}
                          onChange={(e) => setStudentForm({
                            ...studentForm,
                            fee_structure: { ...studentForm.fee_structure, monthly_fee: parseFloat(e.target.value) }
                          })}
                        />
                      </div>
                      <div>
                        <Label>Meal Fee (৳)</Label>
                        <Input
                          type="number"
                          value={studentForm.fee_structure.meal_fee}
                          onChange={(e) => setStudentForm({
                            ...studentForm,
                            fee_structure: { ...studentForm.fee_structure, meal_fee: parseFloat(e.target.value) }
                          })}
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={loading || !studentForm.session_id || !studentForm.class_id}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      {loading ? 'Admitting...' : 'Admit Student'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>All Students ({students.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => {
                      const studentClass = classes.find(c => c.id === student.class_id)
                      return (
                        <TableRow key={student.id}>
                          <TableCell>{student.roll_number}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.phone}</TableCell>
                          <TableCell>{studentClass?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={student.running_balance >= 0 ? 'default' : 'destructive'}>
                              ৳{student.running_balance}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="teachers" className="space-y-6">
            {['super_admin', 'admin'].includes(user?.role) && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Teacher</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleTeacherCreate} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={teacherForm.name}
                          onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={teacherForm.phone}
                          onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Email (Optional)</Label>
                        <Input
                          type="email"
                          value={teacherForm.email}
                          onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Designation</Label>
                        <Input
                          value={teacherForm.designation}
                          onChange={(e) => setTeacherForm({ ...teacherForm, designation: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Rank</Label>
                        <Input
                          type="number"
                          value={teacherForm.rank}
                          onChange={(e) => setTeacherForm({ ...teacherForm, rank: parseInt(e.target.value) })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Monthly Salary (৳)</Label>
                        <Input
                          type="number"
                          value={teacherForm.monthly_salary}
                          onChange={(e) => setTeacherForm({ ...teacherForm, monthly_salary: parseFloat(e.target.value) })}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={loading}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      {loading ? 'Adding...' : 'Add Teacher'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>All Teachers ({teachers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teachers.map((teacher) => (
                      <TableRow key={teacher.id}>
                        <TableCell>{teacher.name}</TableCell>
                        <TableCell>{teacher.designation}</TableCell>
                        <TableCell>{teacher.phone}</TableCell>
                        <TableCell>৳{teacher.monthly_salary}</TableCell>
                        <TableCell>
                          <Badge>{teacher.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            {['super_admin', 'admin'].includes(user?.role) && (
              <Card>
                <CardHeader>
                  <CardTitle>Process Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePayment} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Student</Label>
                        <Select
                          value={paymentForm.student_id}
                          onValueChange={(value) => setPaymentForm({ ...paymentForm, student_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Student" />
                          </SelectTrigger>
                          <SelectContent>
                            {students.map((student) => (
                              <SelectItem key={student.id} value={student.id}>
                                {student.name} (Roll: {student.roll_number})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Amount (৳)</Label>
                        <Input
                          type="number"
                          value={paymentForm.amount}
                          onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Fee Type</Label>
                        <Select
                          value={paymentForm.fee_type}
                          onValueChange={(value) => setPaymentForm({ ...paymentForm, fee_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly_fee">Monthly Fee</SelectItem>
                            <SelectItem value="residential_fee">Residential Fee</SelectItem>
                            <SelectItem value="meal_fee">Meal Fee</SelectItem>
                            <SelectItem value="utility_fee">Utility Fee</SelectItem>
                            <SelectItem value="examination_fee">Examination Fee</SelectItem>
                            <SelectItem value="other_fees">Other Fees</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Remarks</Label>
                        <Input
                          value={paymentForm.remarks}
                          onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={loading || !paymentForm.student_id}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      {loading ? 'Processing...' : 'Process Payment'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {['super_admin', 'admin'].includes(user?.role) && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Create Session</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSessionCreate} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Session Name</Label>
                          <Input
                            value={sessionForm.name}
                            onChange={(e) => setSessionForm({ ...sessionForm, name: e.target.value })}
                            placeholder="e.g., 2026"
                            required
                          />
                        </div>
                        <div>
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={sessionForm.start_date}
                            onChange={(e) => setSessionForm({ ...sessionForm, start_date: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Session'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Create Class</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleClassCreate} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Class Name</Label>
                          <Input
                            value={classForm.name}
                            onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                            placeholder="e.g., Class 1"
                            required
                          />
                        </div>
                        <div>
                          <Label>Order</Label>
                          <Input
                            type="number"
                            value={classForm.order}
                            onChange={(e) => setClassForm({ ...classForm, order: parseInt(e.target.value) })}
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Class'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Existing Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {sessions.map((session) => (
                        <div key={session.id} className="flex justify-between items-center p-2 border rounded">
                          <span>{session.name}</span>
                          <Badge variant={session.is_active ? 'default' : 'secondary'}>
                            {session.is_active ? 'Active' : 'Closed'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Existing Classes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {classes.map((cls) => (
                        <div key={cls.id} className="flex justify-between items-center p-2 border rounded">
                          <span>{cls.name}</span>
                          <Badge>Order: {cls.order}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  )
}

export default App
