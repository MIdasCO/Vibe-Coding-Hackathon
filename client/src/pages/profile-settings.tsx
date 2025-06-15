import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { getAuthHeaders } from "@/lib/auth";
import { 
  User, 
  Lock, 
  Bell, 
  Trash2, 
  Save, 
  Upload,
  Mail,
  Phone,
  MapPin,
  Shield,
  AlertTriangle
} from "lucide-react";

// Схемы валидации
const profileSchema = z.object({
  firstName: z.string().min(1, "Имя обязательно").max(50, "Имя не должно превышать 50 символов"),
  lastName: z.string().min(1, "Фамилия обязательна").max(50, "Фамилия не должна превышать 50 символов"),
  email: z.string().email("Неверный формат email"),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Введите текущий пароль"),
  newPassword: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  confirmPassword: z.string().min(1, "Подтвердите новый пароль"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

const deleteAccountSchema = z.object({
  confirmText: z.string().refine((val) => val === "УДАЛИТЬ", {
    message: "Введите 'УДАЛИТЬ' для подтверждения",
  }),
  password: z.string().min(1, "Введите пароль для подтверждения"),
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;
type DeleteAccountForm = z.infer<typeof deleteAccountSchema>;

export default function ProfileSettings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");

  // Настройки уведомлений
  const [notifications, setNotifications] = useState({
    emailMessages: true,
    emailListings: true,
    emailPromotions: false,
    pushMessages: true,
    pushListings: false,
  });

  // Формы
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const deleteForm = useForm<DeleteAccountForm>({
    resolver: zodResolver(deleteAccountSchema),
  });

  // Мутации
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordForm) => {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to change password");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Пароль изменен",
        description: "Ваш пароль успешно обновлен",
      });
      passwordForm.reset();
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить пароль",
        variant: "destructive",
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (data: DeleteAccountForm) => {
      const response = await fetch("/api/auth/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ password: data.password }),
      });
      if (!response.ok) throw new Error("Failed to delete account");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Аккаунт удален",
        description: "Ваш аккаунт был успешно удален",
      });
      logout();
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить аккаунт",
        variant: "destructive",
      });
    },
  });

  const onProfileSubmit = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordForm) => {
    changePasswordMutation.mutate(data);
  };

  const onDeleteSubmit = (data: DeleteAccountForm) => {
    deleteAccountMutation.mutate(data);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-warm-cream">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-600">
                Пожалуйста, войдите в систему для доступа к настройкам профиля.
              </p>
              <div className="flex justify-center mt-4">
                <Button asChild>
                  <Link href="/login">Войти</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-cream">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('profileSettings.title')}</h1>
          <p className="text-gray-600 mt-2">{t('profileSettings.subtitle')}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {t('profileSettings.tabs.profile')}
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              {t('profileSettings.tabs.security')}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              {t('profileSettings.tabs.notifications')}
            </TabsTrigger>
            <TabsTrigger value="danger" className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              {t('profileSettings.tabs.danger')}
            </TabsTrigger>
          </TabsList>

          {/* Профиль */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Личная информация
                </CardTitle>
                <CardDescription>
                  Обновите свою личную информацию и контактные данные
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Аватар */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-lg">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Загрузить фото
                    </Button>
                    <p className="text-sm text-gray-500 mt-1">
                      JPG, PNG до 2MB
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Форма профиля */}
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Имя</Label>
                      <Input
                        id="firstName"
                        {...profileForm.register("firstName")}
                      />
                      {profileForm.formState.errors.firstName && (
                        <p className="text-sm text-red-600 mt-1">
                          {profileForm.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Фамилия</Label>
                      <Input
                        id="lastName"
                        {...profileForm.register("lastName")}
                      />
                      {profileForm.formState.errors.lastName && (
                        <p className="text-sm text-red-600 mt-1">
                          {profileForm.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...profileForm.register("email")}
                    />
                    {profileForm.formState.errors.email && (
                      <p className="text-sm text-red-600 mt-1">
                        {profileForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Телефон
                    </Label>
                    <Input
                      id="phone"
                      {...profileForm.register("phone")}
                      placeholder="+996 XXX XXX XXX"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={updateProfileMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {updateProfileMutation.isPending ? "Сохранение..." : "Сохранить изменения"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Безопасность */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Безопасность аккаунта
                </CardTitle>
                <CardDescription>
                  Измените пароль и управляйте настройками безопасности
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Текущий пароль</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      {...passwordForm.register("currentPassword")}
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-sm text-red-600 mt-1">
                        {passwordForm.formState.errors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="newPassword">Новый пароль</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      {...passwordForm.register("newPassword")}
                    />
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-sm text-red-600 mt-1">
                        {passwordForm.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Подтвердите новый пароль</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...passwordForm.register("confirmPassword")}
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-600 mt-1">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    disabled={changePasswordMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    {changePasswordMutation.isPending ? "Изменение..." : "Изменить пароль"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Уведомления */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Настройки уведомлений
                </CardTitle>
                <CardDescription>
                  Выберите, какие уведомления вы хотите получать
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Email уведомления</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Новые сообщения</Label>
                        <p className="text-sm text-gray-500">Получать уведомления о новых сообщениях</p>
                      </div>
                      <Switch
                        checked={notifications.emailMessages}
                        onCheckedChange={(checked) => 
                          setNotifications(prev => ({ ...prev, emailMessages: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Новые объявления</Label>
                        <p className="text-sm text-gray-500">Уведомления о новых объявлениях по вашим запросам</p>
                      </div>
                      <Switch
                        checked={notifications.emailListings}
                        onCheckedChange={(checked) => 
                          setNotifications(prev => ({ ...prev, emailListings: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Рекламные предложения</Label>
                        <p className="text-sm text-gray-500">Получать информацию о скидках и акциях</p>
                      </div>
                      <Switch
                        checked={notifications.emailPromotions}
                        onCheckedChange={(checked) => 
                          setNotifications(prev => ({ ...prev, emailPromotions: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">Push уведомления</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Сообщения</Label>
                        <p className="text-sm text-gray-500">Мгновенные уведомления о сообщениях</p>
                      </div>
                      <Switch
                        checked={notifications.pushMessages}
                        onCheckedChange={(checked) => 
                          setNotifications(prev => ({ ...prev, pushMessages: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Объявления</Label>
                        <p className="text-sm text-gray-500">Уведомления о новых объявлениях</p>
                      </div>
                      <Switch
                        checked={notifications.pushListings}
                        onCheckedChange={(checked) => 
                          setNotifications(prev => ({ ...prev, pushListings: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <Button className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Сохранить настройки
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Опасная зона */}
          <TabsContent value="danger">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Опасная зона
                </CardTitle>
                <CardDescription>
                  Необратимые действия с вашим аккаунтом
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>Внимание!</strong> Удаление аккаунта необратимо. Все ваши данные, объявления и сообщения будут удалены навсегда.
                  </AlertDescription>
                </Alert>

                <form onSubmit={deleteForm.handleSubmit(onDeleteSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="confirmText">
                      Введите <strong>УДАЛИТЬ</strong> для подтверждения
                    </Label>
                    <Input
                      id="confirmText"
                      {...deleteForm.register("confirmText")}
                      placeholder="УДАЛИТЬ"
                    />
                    {deleteForm.formState.errors.confirmText && (
                      <p className="text-sm text-red-600 mt-1">
                        {deleteForm.formState.errors.confirmText.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="deletePassword">Введите ваш пароль</Label>
                    <Input
                      id="deletePassword"
                      type="password"
                      {...deleteForm.register("password")}
                    />
                    {deleteForm.formState.errors.password && (
                      <p className="text-sm text-red-600 mt-1">
                        {deleteForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    variant="destructive"
                    disabled={deleteAccountMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deleteAccountMutation.isPending ? "Удаление..." : "Удалить аккаунт"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 