import { useState, useEffect } from 'react';
import { Users, Search, Plus, Edit, Trash2, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';

interface UserManagementPageProps {
  isDarkMode: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
}

export function UserManagementPage({ isDarkMode }: UserManagementPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Form states for add dialog
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newDepartment, setNewDepartment] = useState('');

  // Form states for edit dialog
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editDepartment, setEditDepartment] = useState('');

  // Load users from localStorage on mount
  useEffect(() => {
    const savedUsers = localStorage.getItem('rsdd-users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      // Initialize with default users
      const defaultUsers: User[] = [
        {
          id: '1',
          name: 'mohammed.aljaberi',
          email: 'mohammed@final.edu.tr',
          role: 'Admin',
          department: 'Computer Engineer',
          status: 'active',
        },
        {
          id: '2',
          name: '7moodi',
          email: '7moodi@final.edu.tr',
          role: 'Admin',
          department: 'Computer Engineer',
          status: 'active',
        },
        {
          id: '3',
          name: 'Dr. Ahmed Hassan',
          email: 'ahmed.hassan@final.edu.tr',
          role: 'Dean',
          department: 'Computer Science',
          status: 'active',
        },
        {
          id: '4',
          name: 'Dr. Sarah Ali',
          email: 'sarah.ali@final.edu.tr',
          role: 'Director',
          department: 'Software Engineering',
          status: 'active',
        },
        {
          id: '5',
          name: 'Prof. Ayse Demir',
          email: 'ayse.demir@final.edu.tr',
          role: 'Dean',
          department: 'Electrical Engineering',
          status: 'active',
        },
      ];
      setUsers(defaultUsers);
      localStorage.setItem('rsdd-users', JSON.stringify(defaultUsers));
    }
  }, []);

  // Save users to localStorage whenever they change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('rsdd-users', JSON.stringify(users));
    }
  }, [users]);

  const filteredUsers = users.filter(
    user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-[#6366f1] hover:bg-[#5558e3]';
      case 'Dean':
        return 'bg-[#f97316] hover:bg-[#ea580c]';
      case 'Director':
        return 'bg-[#10b981] hover:bg-[#059669]';
      default:
        return 'bg-[#6b7280] hover:bg-[#4b5563]';
    }
  };

  const handleAddUser = () => {
    if (!newName || !newEmail || !newRole || !newDepartment) {
      toast.error('Please fill all fields');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: newName,
      email: newEmail,
      role: newRole,
      department: newDepartment,
      status: 'active',
    };

    setUsers([...users, newUser]);
    toast.success('User added successfully');
    
    // Reset form
    setNewName('');
    setNewEmail('');
    setNewRole('');
    setNewDepartment('');
    setIsAddDialogOpen(false);
  };

  const handleEditUser = () => {
    if (!editingUser || !editName || !editEmail || !editRole || !editDepartment) {
      toast.error('Please fill all fields');
      return;
    }

    const updatedUsers = users.map(user =>
      user.id === editingUser.id
        ? { ...user, name: editName, email: editEmail, role: editRole, department: editDepartment }
        : user
    );

    setUsers(updatedUsers);
    toast.success('User updated successfully');
    setIsEditDialogOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      toast.success('User deleted successfully');
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditDepartment(user.department);
    setIsEditDialogOpen(true);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0e1a]' : 'bg-[#f8f9fa]'} p-8`}>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>User Management</h1>
            <p className={isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}>
              Manage system users and their permissions
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#2463eb] hover:bg-[#1d4ed8] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className={isDarkMode ? 'bg-[#1a2332] border-[#2a3544]' : 'bg-white border-[#e5e7eb]'}>
              <DialogHeader>
                <DialogTitle className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Add New User</DialogTitle>
                <DialogDescription className={isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}>
                  Create a new user account for the system
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Full Name</Label>
                  <Input
                    placeholder="Enter full name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className={isDarkMode
                      ? 'bg-[#0f1621] border-[#2a3544] text-white mt-2'
                      : 'bg-[#f8f9fa] border-[#e5e7eb] text-[#1a1a1a] mt-2'
                    }
                  />
                </div>
                <div>
                  <Label className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Email</Label>
                  <Input
                    placeholder="Enter email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className={isDarkMode
                      ? 'bg-[#0f1621] border-[#2a3544] text-white mt-2'
                      : 'bg-[#f8f9fa] border-[#e5e7eb] text-[#1a1a1a] mt-2'
                    }
                  />
                </div>
                <div>
                  <Label className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Role</Label>
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger className={`mt-2 ${isDarkMode
                      ? 'bg-[#0f1621] border-[#2a3544] text-white'
                      : 'bg-[#f8f9fa] border-[#e5e7eb] text-[#1a1a1a]'
                      }`}>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className={isDarkMode ? 'bg-[#1a2332] border-[#2a3544]' : 'bg-white border-[#e5e7eb]'}>
                      <SelectItem value="Admin" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Admin</SelectItem>
                      <SelectItem value="Dean" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Dean</SelectItem>
                      <SelectItem value="Director" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Director</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Department</Label>
                  <Input
                    placeholder="Enter department"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className={isDarkMode
                      ? 'bg-[#0f1621] border-[#2a3544] text-white mt-2'
                      : 'bg-[#f8f9fa] border-[#e5e7eb] text-[#1a1a1a] mt-2'
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                  className={isDarkMode ? 'border-[#2a3544] text-white' : ''}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddUser}
                  className="bg-[#2463eb] hover:bg-[#1d4ed8] text-white"
                >
                  Create User
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className={isDarkMode ? 'bg-[#1a2332] border-[#2a3544]' : 'bg-white border-[#e5e7eb]'}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>
                All Users ({filteredUsers.length})
              </CardTitle>
              <div className="relative w-64">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`} />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 ${isDarkMode
                    ? 'bg-[#0f1621] border-[#2a3544] text-white'
                    : 'bg-[#f8f9fa] border-[#e5e7eb] text-[#1a1a1a]'
                    }`}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`rounded-lg p-4 border ${isDarkMode
                    ? 'bg-[#0f1621] border-[#2a3544]'
                    : 'bg-[#f8f9fa] border-[#e5e7eb]'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 bg-[#2463eb]">
                        <AvatarFallback className="text-white">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>{user.name}</h3>
                          <Badge className={`${getRoleBadgeColor(user.role)} text-white text-xs`}>
                            {user.role}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-sm flex items-center gap-1 ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </span>
                          <span className={`text-sm ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>
                            {user.department}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(user)}
                        className={isDarkMode
                          ? 'border-[#2a3544] text-white hover:bg-[#2a3544]'
                          : 'border-[#e5e7eb] text-[#1a1a1a]'
                        }
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626] hover:text-white"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className={isDarkMode ? 'bg-[#1a2332] border-[#2a3544]' : 'bg-white border-[#e5e7eb]'}>
          <DialogHeader>
            <DialogTitle className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Edit User</DialogTitle>
            <DialogDescription className={isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}>
              Update user information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Full Name</Label>
              <Input
                placeholder="Enter full name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className={isDarkMode
                  ? 'bg-[#0f1621] border-[#2a3544] text-white mt-2'
                  : 'bg-[#f8f9fa] border-[#e5e7eb] text-[#1a1a1a] mt-2'
                }
              />
            </div>
            <div>
              <Label className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Email</Label>
              <Input
                placeholder="Enter email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className={isDarkMode
                  ? 'bg-[#0f1621] border-[#2a3544] text-white mt-2'
                  : 'bg-[#f8f9fa] border-[#e5e7eb] text-[#1a1a1a] mt-2'
                }
              />
            </div>
            <div>
              <Label className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Role</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger className={`mt-2 ${isDarkMode
                  ? 'bg-[#0f1621] border-[#2a3544] text-white'
                  : 'bg-[#f8f9fa] border-[#e5e7eb] text-[#1a1a1a]'
                  }`}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className={isDarkMode ? 'bg-[#1a2332] border-[#2a3544]' : 'bg-white border-[#e5e7eb]'}>
                  <SelectItem value="Admin" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Admin</SelectItem>
                  <SelectItem value="Dean" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Dean</SelectItem>
                  <SelectItem value="Director" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Director</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Department</Label>
              <Input
                placeholder="Enter department"
                value={editDepartment}
                onChange={(e) => setEditDepartment(e.target.value)}
                className={isDarkMode
                  ? 'bg-[#0f1621] border-[#2a3544] text-white mt-2'
                  : 'bg-[#f8f9fa] border-[#e5e7eb] text-[#1a1a1a] mt-2'
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              className={isDarkMode ? 'border-[#2a3544] text-white' : ''}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditUser}
              className="bg-[#2463eb] hover:bg-[#1d4ed8] text-white"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
