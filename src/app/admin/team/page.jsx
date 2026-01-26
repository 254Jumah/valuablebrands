'use client';
import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
  Users,
  UserPlus,
  Briefcase,
  Clock,
  DollarSign,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Timer,
  Pause,
  Download,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';

const initialTeamMembers = [
  {
    id: 'tm1',
    name: 'Sarah Wanjiku',
    email: 'sarah@valuablebrands.co.ke',
    phone: '+254 722 123 456',
    role: 'Event Director',
    department: 'Management',
    employmentType: 'Full-time',
    startDate: '2022-01-15T00:00:00.000Z',
    status: 'Active',
  },
  {
    id: 'tm2',
    name: 'James Ochieng',
    email: 'james@valuablebrands.co.ke',
    phone: '+254 733 234 567',
    role: 'Operations Manager',
    department: 'Operations',
    employmentType: 'Full-time',
    startDate: '2022-03-01T00:00:00.000Z',
    status: 'Active',
  },
  {
    id: 'tm3',
    name: 'Grace Muthoni',
    email: 'grace@valuablebrands.co.ke',
    phone: '+254 711 345 678',
    role: 'Marketing Lead',
    department: 'Marketing',
    employmentType: 'Full-time',
    startDate: '2023-06-01T00:00:00.000Z',
    status: 'Active',
  },
  {
    id: 'tm4',
    name: 'Jane Mwangi',
    email: 'jane.mwangi@gmail.com',
    phone: '+254 700 456 789',
    role: 'Event Coordinator',
    department: 'Operations',
    employmentType: 'Contractor',
    contractAmount: 75000,
    startDate: '2024-02-01T00:00:00.000Z',
    endDate: '2024-04-30T00:00:00.000Z',
    status: 'Active',
  },
  {
    id: 'tm5',
    name: 'Peter Kamau',
    email: 'peter.k@techsolutions.co.ke',
    phone: '+254 722 567 890',
    role: 'AV Technician',
    department: 'Technical',
    employmentType: 'Contractor',
    hourlyRate: 2500,
    startDate: '2024-03-01T00:00:00.000Z',
    endDate: '2024-03-31T00:00:00.000Z',
    status: 'Active',
  },
  {
    id: 'tm6',
    name: 'Mary Akinyi',
    email: 'mary.a@email.com',
    phone: '+254 733 678 901',
    role: 'Registration Desk Lead',
    department: 'Support',
    employmentType: 'Part-time',
    hourlyRate: 800,
    startDate: '2024-03-15T00:00:00.000Z',
    status: 'Active',
  },
  {
    id: 'tm7',
    name: 'David Njoroge',
    email: 'david.njoroge@photography.co.ke',
    phone: '+254 711 789 012',
    role: 'Event Photographer',
    department: 'Marketing',
    employmentType: 'Contractor',
    contractAmount: 45000,
    startDate: '2024-03-20T00:00:00.000Z',
    endDate: '2024-03-25T00:00:00.000Z',
    status: 'Active',
  },
  {
    id: 'tm8',
    name: 'Faith Wambui',
    email: 'faith.wambui@email.com',
    phone: '+254 700 890 123',
    role: 'Usher Team Lead',
    department: 'Support',
    employmentType: 'Part-time',
    hourlyRate: 600,
    startDate: '2024-03-20T00:00:00.000Z',
    status: 'Active',
  },
  {
    id: 'tm9',
    name: 'Michael Otieno',
    email: 'michael@financeplus.co.ke',
    phone: '+254 722 901 234',
    role: 'Finance Assistant',
    department: 'Finance',
    employmentType: 'Full-time',
    startDate: '2023-09-01T00:00:00.000Z',
    status: 'On Leave',
  },
  {
    id: 'tm10',
    name: 'Nancy Chebet',
    email: 'nancy.volunteer@email.com',
    phone: '+254 733 012 345',
    role: 'Event Volunteer',
    department: 'Support',
    employmentType: 'Volunteer',
    startDate: '2024-03-22T00:00:00.000Z',
    endDate: '2024-03-25T00:00:00.000Z',
    status: 'Active',
  },
];

const initialTaskAssignments = [
  {
    id: 'task1',
    title: 'Venue setup coordination',
    description:
      'Coordinate with venue staff for table arrangements, stage setup, and décor',
    assignedTo: 'tm4',
    eventName: 'SME Excellence Awards 2024',
    status: 'Completed',
    priority: 'High',
    dueDate: '2024-03-20T00:00:00.000Z',
    estimatedHours: 16,
    actualHours: 18,
    estimatedCost: 40000,
    actualCost: 45000,
    createdAt: '2024-03-01T00:00:00.000Z',
    completedAt: '2024-03-20T00:00:00.000Z',
  },
  {
    id: 'task2',
    title: 'AV equipment setup & testing',
    description:
      'Install and test all audio-visual equipment including projectors, microphones, and speakers',
    assignedTo: 'tm5',
    eventName: 'SME Excellence Awards 2024',
    status: 'Completed',
    priority: 'High',
    dueDate: '2024-03-22T00:00:00.000Z',
    estimatedHours: 8,
    actualHours: 10,
    estimatedCost: 20000,
    actualCost: 25000,
    createdAt: '2024-03-15T00:00:00.000Z',
    completedAt: '2024-03-22T00:00:00.000Z',
  },
  {
    id: 'task3',
    title: 'Guest registration management',
    description: 'Manage guest check-in, distribute badges and event materials',
    assignedTo: 'tm6',
    eventName: 'SME Excellence Awards 2024',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2024-03-25T00:00:00.000Z',
    estimatedHours: 6,
    estimatedCost: 4800,
    createdAt: '2024-03-18T00:00:00.000Z',
  },
  {
    id: 'task4',
    title: 'Social media coverage',
    description:
      'Live social media updates, stories, and post-event content creation',
    assignedTo: 'tm3',
    eventName: 'SME Excellence Awards 2024',
    status: 'In Progress',
    priority: 'Medium',
    dueDate: '2024-03-28T00:00:00.000Z',
    estimatedHours: 12,
    estimatedCost: 0,
    createdAt: '2024-03-10T00:00:00.000Z',
  },
  {
    id: 'task5',
    title: 'Event photography',
    description:
      'Capture key moments, award presentations, and networking sessions',
    assignedTo: 'tm7',
    eventName: 'SME Excellence Awards 2024',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2024-03-25T00:00:00.000Z',
    estimatedHours: 8,
    estimatedCost: 45000,
    createdAt: '2024-03-15T00:00:00.000Z',
  },
  {
    id: 'task6',
    title: 'Usher coordination',
    description: 'Lead team of 8 ushers for guest guidance and seating',
    assignedTo: 'tm8',
    eventName: 'SME Excellence Awards 2024',
    status: 'Not Started',
    priority: 'Medium',
    dueDate: '2024-03-25T00:00:00.000Z',
    estimatedHours: 6,
    estimatedCost: 3600,
    createdAt: '2024-03-20T00:00:00.000Z',
  },
  {
    id: 'task7',
    title: 'Vendor payments processing',
    description: 'Process all vendor invoices and ensure timely payments',
    assignedTo: 'tm2',
    eventName: 'SME Excellence Awards 2024',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2024-03-30T00:00:00.000Z',
    estimatedHours: 8,
    estimatedCost: 0,
    createdAt: '2024-03-22T00:00:00.000Z',
  },
  {
    id: 'task8',
    title: 'Brand Summit venue scouting',
    description: 'Visit and evaluate 3 potential venues for the Brand Summit',
    assignedTo: 'tm4',
    eventName: 'Brand Innovation Summit',
    status: 'Not Started',
    priority: 'Medium',
    dueDate: '2024-04-15T00:00:00.000Z',
    estimatedHours: 10,
    estimatedCost: 25000,
    createdAt: '2024-04-01T00:00:00.000Z',
  },
];

const initialPayrollRecords = [
  {
    id: 'pr1',
    teamMemberId: 'tm4',
    period: 'March 2024',
    amount: 75000,
    status: 'Pending',
    notes: 'Event coordination for SME Awards',
  },
  {
    id: 'pr2',
    teamMemberId: 'tm5',
    period: 'March 2024',
    amount: 25000,
    status: 'Paid',
    paidDate: '2024-03-25T00:00:00.000Z',
    notes: '10 hours @ KES 2,500/hr',
  },
  {
    id: 'pr3',
    teamMemberId: 'tm6',
    period: 'March 2024',
    amount: 4800,
    status: 'Processing',
    notes: '6 hours @ KES 800/hr',
  },
  {
    id: 'pr4',
    teamMemberId: 'tm7',
    period: 'March 2024',
    amount: 45000,
    status: 'Pending',
    notes: 'Event photography package',
  },
  {
    id: 'pr5',
    teamMemberId: 'tm8',
    period: 'March 2024',
    amount: 3600,
    status: 'Processing',
    notes: '6 hours @ KES 600/hr',
  },
];

const employmentTypeColors = {
  'Full-time': 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  'Part-time': 'bg-blue-500/10 text-blue-600 border-blue-200',
  Contractor: 'bg-orange-500/10 text-orange-600 border-orange-200',
  Volunteer: 'bg-purple-500/10 text-purple-600 border-purple-200',
};

const departmentColors = {
  Management: 'bg-violet-500/10 text-violet-600 border-violet-200',
  Operations: 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
  Marketing: 'bg-pink-500/10 text-pink-600 border-pink-200',
  Finance: 'bg-amber-500/10 text-amber-600 border-amber-200',
  Technical: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
  Support: 'bg-teal-500/10 text-teal-600 border-teal-200',
};

const taskStatusColors = {
  'Not Started': 'bg-gray-500/10 text-gray-600 border-gray-200',
  'In Progress': 'bg-blue-500/10 text-blue-600 border-blue-200',
  Completed: 'bg-green-500/10 text-green-600 border-green-200',
  'On Hold': 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
};

const taskStatusIcons = {
  'Not Started': <AlertCircle className="h-4 w-4" />,
  'In Progress': <Timer className="h-4 w-4" />,
  Completed: <CheckCircle2 className="h-4 w-4" />,
  'On Hold': <Pause className="h-4 w-4" />,
};

const payrollStatusColors = {
  Pending: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  Paid: 'bg-green-500/10 text-green-700 border-green-200',
  Processing: 'bg-blue-500/10 text-blue-700 border-blue-200',
};

function formatKES(amount) {
  return `KES ${amount.toLocaleString()}`;
}

function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export default function TeamManagement() {
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const [tasks, setTasks] = useState(initialTaskAssignments);
  const [payroll, setPayroll] = useState(initialPayrollRecords);
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Summary calculations
  const summary = useMemo(() => {
    const activeMembers = teamMembers.filter(
      (m) => m.status === 'Active'
    ).length;
    const contractors = teamMembers.filter(
      (m) => m.employmentType === 'Contractor'
    ).length;
    const totalPayrollPending = payroll
      .filter((p) => p.status === 'Pending' || p.status === 'Processing')
      .reduce((sum, p) => sum + p.amount, 0);
    const tasksInProgress = tasks.filter(
      (t) => t.status === 'In Progress'
    ).length;
    const tasksCompleted = tasks.filter((t) => t.status === 'Completed').length;
    const totalTaskCost = tasks.reduce(
      (sum, t) => sum + (t.actualCost || t.estimatedCost),
      0
    );

    return {
      activeMembers,
      contractors,
      totalPayrollPending,
      tasksInProgress,
      tasksCompleted,
      totalTasks: tasks.length,
      totalTaskCost,
    };
  }, [teamMembers, tasks, payroll]);

  // Filtered team members
  const filteredMembers = useMemo(() => {
    return teamMembers.filter((m) => {
      const matchesDepartment =
        filterDepartment === 'all' || m.department === filterDepartment;
      const matchesType =
        filterType === 'all' || m.employmentType === filterType;
      const matchesSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDepartment && matchesType && matchesSearch;
    });
  }, [teamMembers, filterDepartment, filterType, searchTerm]);

  const getMemberById = (id) => teamMembers.find((m) => m.id === id);

  const handleDeleteMember = () => {
    if (selectedMember) {
      setTeamMembers((prev) => prev.filter((m) => m.id !== selectedMember.id));
      setSelectedMember(null);
      setIsDeleteOpen(false);
    }
  };

  const handleUpdateTaskStatus = (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus,
              completedAt:
                newStatus === 'Completed'
                  ? new Date().toISOString()
                  : undefined,
            }
          : t
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">
            Manage employees, contractors, and task assignments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={() => setIsFormOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Team Member
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Team</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.activeMembers}</div>
            <p className="text-xs text-muted-foreground">
              {summary.contractors} contractors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Tasks Progress
            </CardTitle>
            <Briefcase className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.tasksCompleted}/{summary.totalTasks}
            </div>
            <Progress
              value={(summary.tasksCompleted / summary.totalTasks) * 100}
              className="mt-2 h-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {summary.tasksInProgress} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Task Costs</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatKES(summary.totalTaskCost)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payroll
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {formatKES(summary.totalPayrollPending)}
            </div>
            <p className="text-xs text-muted-foreground">
              {payroll.filter((p) => p.status !== 'Paid').length} payments
              pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="team" className="space-y-4">
        <TabsList>
          <TabsTrigger value="team">
            <Users className="mr-2 h-4 w-4" />
            Team Directory
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <Briefcase className="mr-2 h-4 w-4" />
            Task Assignments
          </TabsTrigger>
          <TabsTrigger value="payroll">
            <DollarSign className="mr-2 h-4 w-4" />
            Payroll
          </TabsTrigger>
        </TabsList>

        {/* Team Directory Tab */}
        <TabsContent value="team" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <Input
                    placeholder="Search team members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Select
                    value={filterDepartment}
                    onValueChange={(v) => setFilterDepartment(v)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="Management">Management</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Technical">Technical</SelectItem>
                      <SelectItem value="Support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filterType}
                    onValueChange={(v) => setFilterType(v)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contractor">Contractor</SelectItem>
                      <SelectItem value="Volunteer">Volunteer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-start gap-4 p-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{member.name}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setSelectedMember(member)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelectedMember(member);
                                setIsDeleteOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {member.role}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <Badge
                          variant="outline"
                          className={departmentColors[member.department]}
                        >
                          {member.department}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            employmentTypeColors[member.employmentType]
                          }
                        >
                          {member.employmentType}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="border-t bg-muted/30 px-4 py-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        <Mail className="h-3 w-3" />
                        Email
                      </a>
                      <a
                        href={`tel:${member.phone}`}
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        <Phone className="h-3 w-3" />
                        Call
                      </a>
                      {member.status !== 'Active' && (
                        <Badge
                          variant="outline"
                          className="ml-auto bg-amber-500/10 text-amber-600"
                        >
                          {member.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setIsTaskFormOpen(true)}>
              <Briefcase className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Est. Cost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => {
                    const assignee = getMemberById(task.assignedTo);
                    return (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {task.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {assignee && (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {getInitials(assignee.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{assignee.name}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {task.eventName}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>{formatKES(task.estimatedCost)}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${
                              taskStatusColors[task.status]
                            } flex w-fit items-center gap-1`}
                          >
                            {taskStatusIcons[task.status]}
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setSelectedTask(task)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {task.status !== 'Completed' && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateTaskStatus(task.id, 'Completed')
                                  }
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Mark Complete
                                </DropdownMenuItem>
                              )}
                              {task.status === 'Not Started' && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateTaskStatus(
                                      task.id,
                                      'In Progress'
                                    )
                                  }
                                >
                                  <Timer className="mr-2 h-4 w-4" />
                                  Start Task
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll Tab */}
        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll & Contractor Payments</CardTitle>
              <CardDescription>
                Track payments to contractors and part-time staff
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Member</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payroll.map((record) => {
                    const member = getMemberById(record.teamMemberId);
                    return (
                      <TableRow key={record.id}>
                        <TableCell>
                          {member && (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {getInitials(member.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {member.role}
                                </p>
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{record.period}</TableCell>
                        <TableCell className="font-medium">
                          {formatKES(record.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={payrollStatusColors[record.status]}
                          >
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {record.notes}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {record.status !== 'Paid' && (
                                <DropdownMenuItem>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Mark as Paid
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Team Member Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Add Team Member</SheetTitle>
            <SheetDescription>
              Add a new employee, contractor, or volunteer
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input placeholder="e.g., John Doe" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="john@email.com" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="+254 7XX XXX XXX" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input placeholder="e.g., Event Coordinator" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Management">Management</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Employment Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contractor">Contractor</SelectItem>
                    <SelectItem value="Volunteer">Volunteer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hourly Rate (KES)</Label>
                <Input type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Contract Amount (KES)</Label>
                <Input type="number" placeholder="0" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsFormOpen(false)}>Add Member</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Task Sheet */}
      <Sheet open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Add Task Assignment</SheetTitle>
            <SheetDescription>
              Create a new task and assign to a team member
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Task Title</Label>
              <Input placeholder="e.g., Venue setup coordination" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe the task details..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Event</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SME Excellence Awards 2024">
                      SME Excellence Awards 2024
                    </SelectItem>
                    <SelectItem value="Brand Innovation Summit">
                      Brand Innovation Summit
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Est. Hours</Label>
                <Input type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Est. Cost (KES)</Label>
                <Input type="number" placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsTaskFormOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setIsTaskFormOpen(false)}>
                Create Task
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedMember?.name}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Member Profile Sheet */}
      <Sheet
        open={!!selectedMember && !isDeleteOpen}
        onOpenChange={() => setSelectedMember(null)}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Team Member Profile</SheetTitle>
          </SheetHeader>
          {selectedMember && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-xl bg-primary/10 text-primary">
                    {getInitials(selectedMember.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedMember.name}
                  </h3>
                  <p className="text-muted-foreground">{selectedMember.role}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {selectedMember.email}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {selectedMember.phone}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Started{' '}
                  {format(new Date(selectedMember.startDate), 'MMM d, yyyy')}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className={departmentColors[selectedMember.department]}
                >
                  {selectedMember.department}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    employmentTypeColors[selectedMember.employmentType]
                  }
                >
                  {selectedMember.employmentType}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    selectedMember.status === 'Active'
                      ? 'bg-green-500/10 text-green-600'
                      : 'bg-amber-500/10 text-amber-600'
                  }
                >
                  {selectedMember.status}
                </Badge>
              </div>

              {(selectedMember.hourlyRate || selectedMember.contractAmount) && (
                <div className="rounded-lg border bg-muted/50 p-4">
                  <h4 className="text-sm font-medium mb-2">Compensation</h4>
                  {selectedMember.hourlyRate && (
                    <p className="text-sm text-muted-foreground">
                      Hourly Rate: {formatKES(selectedMember.hourlyRate)}/hr
                    </p>
                  )}
                  {selectedMember.contractAmount && (
                    <p className="text-sm text-muted-foreground">
                      Contract: {formatKES(selectedMember.contractAmount)}
                    </p>
                  )}
                </div>
              )}

              {/* Assigned Tasks */}
              <div>
                <h4 className="text-sm font-medium mb-2">Assigned Tasks</h4>
                <div className="space-y-2">
                  {tasks
                    .filter((t) => t.assignedTo === selectedMember.id)
                    .map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="text-sm font-medium">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {task.eventName}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={taskStatusColors[task.status]}
                        >
                          {task.status}
                        </Badge>
                      </div>
                    ))}
                  {tasks.filter((t) => t.assignedTo === selectedMember.id)
                    .length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No tasks assigned
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
