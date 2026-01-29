'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Save, UserPlus, Pencil, Trash2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/content/data-table';
import { Badge } from '@/components/ui/badge';
import { settings as settingsApi, users, type User } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

const roleOptions = [
  { label: 'Super admin', value: 'SUPER_ADMIN' },
  { label: 'Admin mairie', value: 'ADMIN_MAIRIE' },
  { label: 'Agent', value: 'AGENT' },
  { label: 'Contributeur', value: 'CONTRIBUTOR' },
  { label: 'Lecteur', value: 'READER' },
];

type AccountForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type UserForm = {
  firstName: string;
  lastName: string;
  email: string;
  role: User['role'];
  isActive: boolean;
  password: string;
};

type SiteForm = {
  siteName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
};

const defaultUserForm: UserForm = {
  firstName: '',
  lastName: '',
  email: '',
  role: 'READER',
  isActive: true,
  password: '',
};

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSavingAccount, setIsSavingAccount] = React.useState(false);
  const [isSavingSite, setIsSavingSite] = React.useState(false);
  const [accountForm, setAccountForm] = React.useState<AccountForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [siteForm, setSiteForm] = React.useState<SiteForm>({
    siteName: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
  });
  const [usersData, setUsersData] = React.useState<User[]>([]);
  const [usersLoading, setUsersLoading] = React.useState(true);
  const [userDialogOpen, setUserDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [userForm, setUserForm] = React.useState<UserForm>(defaultUserForm);
  const [isSavingUser, setIsSavingUser] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setAccountForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: '',
      });
    }
  }, [user]);

  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await settingsApi.get();
        const addressValue = data.address ? JSON.stringify(data.address, null, 2) : '';
        setSiteForm({
          siteName: data.siteName || '',
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || '',
          address: addressValue,
        });
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  React.useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await users.list();
        setUsersData(data);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setUsersLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleAccountSave = async () => {
    if (!user) return;
    setIsSavingAccount(true);
    try {
      await users.update(user.id, {
        firstName: accountForm.firstName,
        lastName: accountForm.lastName,
        email: accountForm.email,
        password: accountForm.password || undefined,
      });
      setAccountForm((prev) => ({ ...prev, password: '' }));
      await refreshUser();
      toast.success('Compte mis à jour');
    } catch (error) {
      console.error('Failed to update account:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsSavingAccount(false);
    }
  };

  const parseAddress = (value: string) => {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  };

  const handleSiteSave = async () => {
    setIsSavingSite(true);
    try {
      await settingsApi.update({
        siteName: siteForm.siteName,
        contactEmail: siteForm.contactEmail || null,
        contactPhone: siteForm.contactPhone || null,
        address: parseAddress(siteForm.address),
      });
      toast.success('Paramètres enregistrés');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Erreur lors de l’enregistrement');
    } finally {
      setIsSavingSite(false);
    }
  };

  const openUserDialog = React.useCallback((userToEdit?: User) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setUserForm({
        firstName: userToEdit.firstName,
        lastName: userToEdit.lastName,
        email: userToEdit.email,
        role: userToEdit.role,
        isActive: userToEdit.isActive,
        password: '',
      });
    } else {
      setEditingUser(null);
      setUserForm(defaultUserForm);
    }
    setUserDialogOpen(true);
  }, [setEditingUser, setUserForm, setUserDialogOpen, defaultUserForm]);

  const handleUserSave = async () => {
    setIsSavingUser(true);
    try {
      if (editingUser) {
        await users.update(editingUser.id, {
          firstName: userForm.firstName,
          lastName: userForm.lastName,
          email: userForm.email,
          role: userForm.role,
          isActive: userForm.isActive,
          password: userForm.password || undefined,
        });
      } else {
        await users.create({
          firstName: userForm.firstName,
          lastName: userForm.lastName,
          email: userForm.email,
          role: userForm.role,
          isActive: userForm.isActive,
          password: userForm.password,
        });
      }
      setUserDialogOpen(false);
      setUserForm(defaultUserForm);
      setEditingUser(null);
      const data = await users.list();
      setUsersData(data);
      toast.success('Utilisateur enregistré');
    } catch (error) {
      console.error('Failed to save user:', error);
      toast.error('Erreur lors de l’enregistrement');
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleUserDelete = React.useCallback(async (userId: string) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
      await users.delete(userId);
      setUsersData((prev) => prev.filter((u) => u.id !== userId));
      toast.success('Utilisateur supprimé');
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Erreur lors de la suppression');
    }
  }, [setUsersData]);

  const userColumns = React.useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'firstName',
        meta: { mobile: 'primary', label: 'Utilisateur' },
        header: 'Utilisateur',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.firstName} {row.original.lastName}</p>
            <p className="text-sm text-muted-foreground">{row.original.email}</p>
          </div>
        ),
      },
      {
        accessorKey: 'role',
        meta: { label: 'Rôle' },
        header: 'Rôle',
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.role}</Badge>
        ),
      },
      {
        accessorKey: 'isActive',
        meta: { label: 'Statut' },
        header: 'Statut',
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? 'success' : 'secondary'}>
            {row.original.isActive ? 'Actif' : 'Inactif'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        meta: { mobile: 'actions', label: 'Actions' },
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => openUserDialog(row.original)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleUserDelete(row.original.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [openUserDialog, handleUserDelete]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">Gérez votre compte, les utilisateurs et les informations du site.</p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account">Compte</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="site">Site</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Compte</CardTitle>
              <CardDescription>Mettre à jour les informations de connexion.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Prénom</Label>
                  <Input
                    value={accountForm.firstName}
                    onChange={(e) => setAccountForm((prev) => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input
                    value={accountForm.lastName}
                    onChange={(e) => setAccountForm((prev) => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={accountForm.email}
                  onChange={(e) => setAccountForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Nouveau mot de passe</Label>
                <Input
                  type="password"
                  value={accountForm.password}
                  onChange={(e) => setAccountForm((prev) => ({ ...prev, password: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">Laissez vide pour conserver le mot de passe actuel.</p>
              </div>
              <Button onClick={handleAccountSave} disabled={isSavingAccount}>
                <Save className="mr-2 h-4 w-4" />
                {isSavingAccount ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Utilisateurs</CardTitle>
              <CardDescription>Gestion des comptes et des rôles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  {usersData.length} compte(s)
                </div>
                <Button onClick={() => openUserDialog()} className="w-full sm:w-auto">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Ajouter un utilisateur
                </Button>
              </div>
              <DataTable columns={userColumns} data={usersData} searchKey="email" isLoading={usersLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="site">
          <Card>
            <CardHeader>
              <CardTitle>Informations du site</CardTitle>
              <CardDescription>Coordonnées et informations publiques.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nom du site</Label>
                <Input
                  value={siteForm.siteName}
                  onChange={(e) => setSiteForm((prev) => ({ ...prev, siteName: e.target.value }))}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email de contact</Label>
                  <Input
                    type="email"
                    value={siteForm.contactEmail}
                    onChange={(e) => setSiteForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input
                    value={siteForm.contactPhone}
                    onChange={(e) => setSiteForm((prev) => ({ ...prev, contactPhone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Adresse (texte ou JSON)</Label>
                <Textarea
                  rows={4}
                  value={siteForm.address}
                  onChange={(e) => setSiteForm((prev) => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <Button onClick={handleSiteSave} disabled={isSavingSite}>
                <Save className="mr-2 h-4 w-4" />
                {isSavingSite ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Modifier' : 'Nouvel'} utilisateur</DialogTitle>
            <DialogDescription>Gérez le rôle et l&apos;accès au back-office.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input
                  value={userForm.firstName}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input
                  value={userForm.lastName}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Mot de passe</Label>
              <Input
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm((prev) => ({ ...prev, password: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                {editingUser ? 'Laissez vide pour conserver le mot de passe.' : 'Min. 8 caractères.'}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Rôle</Label>
                <Select
                  value={userForm.role}
                  onValueChange={(value) => setUserForm((prev) => ({ ...prev, role: value as User['role'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label>Compte actif</Label>
                  <p className="text-xs text-muted-foreground">Autorise la connexion</p>
                </div>
                <Switch
                  checked={userForm.isActive}
                  onCheckedChange={(checked) => setUserForm((prev) => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUserSave} disabled={isSavingUser}>
              <Shield className="mr-2 h-4 w-4" />
              {isSavingUser ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
