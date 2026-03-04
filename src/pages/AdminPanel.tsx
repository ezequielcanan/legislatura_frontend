import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, UserCheck, UserX, Search, AlertCircle, Users, Loader2 } from 'lucide-react';
import axiosInstance from "../config/axios.config";
import { useAuth } from '../contexts/AuthContext'; // Asumo que tienes esto para el token
import Container from '../components/containers/Container';
import Title from '../components/layout/Title';
import { Navbar } from '../components/layout/Navbar';

interface UserPermission {
  id: string; // Mapeado de _id
  email: string;
  username: string;
  role: 'admin' | 'user' | 'unknown';
  lastLogin: string;
}

export function AdminPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);


  // 1. Cargar usuarios del Backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/users?limit=100');

      // Mapear respuesta del back (UserDocument) a la interfaz del front
      const mappedUsers: UserPermission[] = response.data.users.map((u: any) => {
        console.log(u)
        return {
          id: u._id,
          email: u.email,
          username: u.fullName || u.username || 'Sin Nombre',
          role: u.role || 'unknown',
          lastLogin: u.lastLoginAt
            ? new Date(u.lastLoginAt).toLocaleString()
            : 'Nunca',
        }
      });

      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error fetching users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Función conectada al Backend para cambiar rol
  const changeRole = async (userId: string, newRole: 'admin' | 'user' | "unknown", user) => {
    console.log(user)
    try {
      console.log(userId)
      await axiosInstance.put(`/users/${userId}/role`, { role: newRole });
      const previousUsers = [...users];
      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error("Error updating role", error);
      // Revertir si falla
      alert("Error al actualizar el rol");
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    user.username?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  const stats = [
    { label: 'Total Usuarios', value: users.length, icon: Users, gradient: 'from-violet-600 to-purple-600' },
    { label: 'Con Acceso', value: users.filter(u => u.role !== "unknown").length, icon: UserCheck, gradient: 'from-green-600 to-emerald-600' },
    { label: 'Sin Acceso', value: users.filter(u => u.role === "unknown").length, icon: UserX, gradient: 'from-red-600 to-rose-600' },
    { label: 'Administradores', value: users.filter(u => u.role === 'admin').length, icon: Shield, gradient: 'from-amber-600 to-orange-600' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center string h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
      </div>
    )
  }

  return (
    <Container>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Title fontSize={'text-3xl'}>Administración de Usuarios</Title>
          <p className="text-muted-foreground mt-2">Gestiona permisos y accesos del sistema</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-background/80 backdrop-blur-lg rounded-2xl p-5 border border-border/50 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient} shadow-md`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar usuario..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-background/50 border border-border focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
          />
        </div>

        {/* Users Table */}
        <div className="bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Usuario</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Rol</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Último Acceso</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-6 py-4">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => changeRole(user.id, e.target.value as any, user)}
                      className="px-3 py-1 rounded bg-muted border border-border text-sm outline-none focus:border-violet-500"
                    >
                      <option value="admin">Administrador</option>
                      <option value="user">Usuario</option>
                      <option value="unknown">Desconocido</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {user.role !== 'unknown' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {user.lastLogin}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No se encontraron usuarios
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}