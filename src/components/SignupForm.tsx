import React, { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { ShipWheel, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { useThemeSettings } from "@/context/ThemeSettingsContext";

const signupSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z
    .string()
    .min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
});

const SignupForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { settings } = useThemeSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
  }>({});

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = () => {
    try {
      signupSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: {
          email?: string;
          password?: string;
          name?: string;
        } = {};

        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof typeof newErrors] = err.message;
          }
        });

        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      console.log("Signing up with:", formData.email);
      
      // In mock mode, we'll simulate a successful signup
      // Create a mock user ID
      const mockUserId = `mock-user-${Date.now()}`;
      
      // Check if this is the first user
      const isFirstUser = localStorage.getItem('userCount') === null;
      if (isFirstUser) {
        localStorage.setItem('userCount', '1');
      }
      
      // Create a mock user profile
      const mockProfile = {
        id: mockUserId,
        full_name: formData.name,
        email: formData.email,
        role: isFirstUser ? 'admin' : 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Store the user in localStorage for demonstration
      const existingUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
      existingUsers.push({
        id: mockUserId,
        email: formData.email,
        password: formData.password, // Note: In a real app, never store passwords in plain text
        profile: mockProfile
      });
      localStorage.setItem('mockUsers', JSON.stringify(existingUsers));
      
      console.log("Signup successful:", mockUserId);
      
      toast.success("Conta criada com sucesso!");
      onSuccess();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Erro ao criar conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h1 className="text-2xl font-bold text-white text-center mb-2">
        Crie sua conta
      </h1>
      <p className="text-white/80 text-center mb-6">
        Junte-se ao {settings.brandName}
      </p>

      <div className="space-y-4">
        <div className="relative group">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5 group-hover:text-valore-gold transition-colors duration-300" />
          <Input
            type="text"
            name="name"
            placeholder="Nome completo"
            value={formData.name}
            onChange={handleChange}
            className={`pl-10 h-12 bg-white/10 border-white/20 text-white rounded-md transition-all duration-300 hover:border-valore-gold/50 ${
              errors.name ? "border-red-400" : "focus:border-valore-gold"
            }`}
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div className="relative group">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5 group-hover:text-valore-gold transition-colors duration-300" />
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={`pl-10 h-12 bg-white/10 border-white/20 text-white rounded-md transition-all duration-300 hover:border-valore-gold/50 ${
              errors.email ? "border-red-400" : "focus:border-valore-gold"
            }`}
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5 group-hover:text-valore-gold transition-colors duration-300" />
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Senha"
            value={formData.password}
            onChange={handleChange}
            className={`pl-10 h-12 bg-white/10 border-white/20 text-white rounded-md transition-all duration-300 hover:border-valore-gold/50 ${
              errors.password ? "border-red-400" : "focus:border-valore-gold"
            }`}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5 hover:text-valore-gold transition-colors duration-300"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
          {errors.password && (
            <p className="text-red-400 text-sm mt-1">{errors.password}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full button-hover-effect font-bold py-3 px-4 rounded-md flex items-center justify-center transition-all duration-300"
        style={{
          backgroundColor: settings.secondaryColor,
          color: settings.accentColor,
        }}
      >
        {isLoading ? (
          <div
            className="h-5 w-5 border-2 border-t-transparent rounded-full animate-spin mr-2"
            style={{
              borderColor: settings.accentColor,
              borderTopColor: "transparent",
            }}
          ></div>
        ) : (
          <ShipWheel className="mr-2 h-5 w-5" />
        )}
        {isLoading ? "Criando conta..." : "Criar conta"}
      </button>
    </form>
  );
};

export default SignupForm;