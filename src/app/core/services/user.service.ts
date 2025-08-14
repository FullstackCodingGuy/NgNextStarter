import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map } from 'rxjs';
import { User, UserRole } from '../models/user.model';
import { PaginatedResponse, PaginationParams } from '../models/common.model';
import { environment } from '../../../environments/environment';

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  password: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = `${environment.apiUrl}/users`;
  
  // Mock data for demonstration
  private mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@securities.com',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      email: 'john.smith@securities.com',
      firstName: 'John',
      lastName: 'Smith',
      role: UserRole.MANAGER,
      isActive: true,
      createdAt: new Date('2023-02-01'),
      updatedAt: new Date('2024-01-10')
    },
    {
      id: '3',
      email: 'sarah.johnson@securities.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: UserRole.MANAGER,
      isActive: true,
      createdAt: new Date('2023-02-15'),
      updatedAt: new Date('2024-01-12')
    },
    {
      id: '4',
      email: 'mike.davis@securities.com',
      firstName: 'Mike',
      lastName: 'Davis',
      role: UserRole.ANALYST,
      isActive: true,
      createdAt: new Date('2023-03-01'),
      updatedAt: new Date('2024-01-08')
    },
    {
      id: '5',
      email: 'jane.wilson@securities.com',
      firstName: 'Jane',
      lastName: 'Wilson',
      role: UserRole.ANALYST,
      isActive: true,
      createdAt: new Date('2023-03-15'),
      updatedAt: new Date('2024-01-11')
    },
    {
      id: '6',
      email: 'bob.brown@securities.com',
      firstName: 'Bob',
      lastName: 'Brown',
      role: UserRole.VIEWER,
      isActive: false,
      createdAt: new Date('2023-04-01'),
      updatedAt: new Date('2023-12-20')
    }
  ];

  constructor(private http: HttpClient) {}

  getUsers(params: PaginationParams): Observable<PaginatedResponse<User>> {
    return of(this.mockUsers).pipe(
      delay(500),
      map(users => {
        let filteredUsers = [...users];

        // Apply filters
        if (params.filters) {
          params.filters.forEach(filter => {
            filteredUsers = filteredUsers.filter(user => {
              const value = (user as any)[filter.field];
              switch (filter.operator) {
                case 'contains':
                  return value?.toString().toLowerCase().includes(filter.value.toLowerCase());
                case 'eq':
                  return value === filter.value;
                default:
                  return true;
              }
            });
          });
        }

        // Apply sorting
        if (params.sortBy) {
          filteredUsers.sort((a, b) => {
            const aValue = (a as any)[params.sortBy!];
            const bValue = (b as any)[params.sortBy!];
            const direction = params.sortDirection === 'desc' ? -1 : 1;
            
            if (aValue < bValue) return -1 * direction;
            if (aValue > bValue) return 1 * direction;
            return 0;
          });
        }

        // Apply pagination
        const startIndex = (params.pageNumber - 1) * params.pageSize;
        const endIndex = startIndex + params.pageSize;
        const paginatedItems = filteredUsers.slice(startIndex, endIndex);
        const totalCount = filteredUsers.length;
        const totalPages = Math.ceil(totalCount / params.pageSize);

        return {
          items: paginatedItems,
          totalCount,
          pageNumber: params.pageNumber,
          pageSize: params.pageSize,
          totalPages,
          hasPreviousPage: params.pageNumber > 1,
          hasNextPage: params.pageNumber < totalPages
        };
      })
    );
  }

  getUser(id: string): Observable<User> {
    const user = this.mockUsers.find(u => u.id === id);
    return of(user!).pipe(delay(300));
  }

  createUser(request: CreateUserRequest): Observable<User> {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: request.email,
      firstName: request.firstName,
      lastName: request.lastName,
      role: request.role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.mockUsers.push(newUser);
    return of(newUser).pipe(delay(500));
  }

  updateUser(id: string, request: UpdateUserRequest): Observable<User> {
    const index = this.mockUsers.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('User not found');
    }

    const user = { ...this.mockUsers[index] };
    
    if (request.firstName !== undefined) {
      user.firstName = request.firstName;
    }
    
    if (request.lastName !== undefined) {
      user.lastName = request.lastName;
    }
    
    if (request.role !== undefined) {
      user.role = request.role;
    }
    
    if (request.isActive !== undefined) {
      user.isActive = request.isActive;
    }

    user.updatedAt = new Date();
    this.mockUsers[index] = user;
    
    return of(user).pipe(delay(500));
  }

  deleteUser(id: string): Observable<void> {
    const index = this.mockUsers.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('User not found');
    }

    this.mockUsers.splice(index, 1);
    return of(void 0).pipe(delay(300));
  }

  getUserRoles(): UserRole[] {
    return Object.values(UserRole);
  }

  getUserStats(): Observable<any> {
    const stats = {
      totalUsers: this.mockUsers.length,
      activeUsers: this.mockUsers.filter(u => u.isActive).length,
      inactiveUsers: this.mockUsers.filter(u => !u.isActive).length,
      roleDistribution: this.getRoleDistribution()
    };

    return of(stats).pipe(delay(300));
  }

  private getRoleDistribution(): any {
    const roleCounts: { [key: string]: number } = {};
    
    Object.values(UserRole).forEach(role => {
      roleCounts[role] = this.mockUsers.filter(u => u.role === role).length;
    });

    return Object.keys(roleCounts).map(role => ({
      role,
      count: roleCounts[role],
      percentage: this.mockUsers.length > 0 ? (roleCounts[role] / this.mockUsers.length) * 100 : 0
    }));
  }
}