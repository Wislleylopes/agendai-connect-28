import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { 
  clientSignUpSchema, 
  professionalSignUpSchema, 
  ClientSignUpData, 
  ProfessionalSignUpData 
} from "@/schemas/authSchemas";

interface SignUpFormProps {
  userType: 'client' | 'professional';
  onSubmit: (data: ClientSignUpData | ProfessionalSignUpData) => Promise<void>;
  loading: boolean;
}

export function SignUpForm({ userType, onSubmit, loading }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  if (userType === 'client') {
    const {
      register,
      handleSubmit,
      formState: { errors }
    } = useForm<ClientSignUpData>({
      resolver: zodResolver(clientSignUpSchema)
    });

    const handleFormSubmit = async (data: ClientSignUpData) => {
      await onSubmit(data);
    };

    return (
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Nome Completo */}
        <div className="space-y-2">
          <Label htmlFor="fullName">Nome Completo *</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Seu nome completo"
            {...register('fullName')}
            className={errors.fullName ? "border-destructive" : ""}
          />
          {errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        {/* E-mail */}
        <div className="space-y-2">
          <Label htmlFor="email">E-mail *</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            {...register('email')}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Endereço (cliente) */}
        <div className="space-y-2">
          <Label htmlFor="address">Endereço Completo *</Label>
          <Input
            id="address"
            type="text"
            placeholder="Rua, número, bairro, cidade"
            {...register('address')}
            className={errors.address ? "border-destructive" : ""}
          />
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address.message}</p>
          )}
        </div>

        {/* Senha */}
        <div className="space-y-2">
          <Label htmlFor="password">Senha *</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Sua senha"
              {...register('password')}
              className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Eye className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-primary hover:bg-primary-hover text-white"
          disabled={loading}
        >
          {loading ? "Criando conta..." : "Cadastrar como Cliente"}
        </Button>
      </form>
    );
  }

  // Professional form
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProfessionalSignUpData>({
    resolver: zodResolver(professionalSignUpSchema)
  });

  const handleFormSubmit = async (data: ProfessionalSignUpData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Nome Completo */}
      <div className="space-y-2">
        <Label htmlFor="fullName">Nome Completo *</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Seu nome completo"
          {...register('fullName')}
          className={errors.fullName ? "border-destructive" : ""}
        />
        {errors.fullName && (
          <p className="text-sm text-destructive">{errors.fullName.message}</p>
        )}
      </div>

      {/* E-mail */}
      <div className="space-y-2">
        <Label htmlFor="email">E-mail *</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          {...register('email')}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Telefone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Telefone *</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="(11) 99999-9999"
          {...register('phone')}
          className={errors.phone ? "border-destructive" : ""}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      {/* Nome da Empresa */}
      <div className="space-y-2">
        <Label htmlFor="companyName">Nome da Empresa *</Label>
        <Input
          id="companyName"
          type="text"
          placeholder="Nome da sua empresa"
          {...register('companyName')}
          className={errors.companyName ? "border-destructive" : ""}
        />
        {errors.companyName && (
          <p className="text-sm text-destructive">{errors.companyName.message}</p>
        )}
      </div>

      {/* CNPJ */}
      <div className="space-y-2">
        <Label htmlFor="cnpj">CNPJ</Label>
        <Input
          id="cnpj"
          type="text"
          placeholder="00.000.000/0000-00"
          {...register('cnpj')}
          className={errors.cnpj ? "border-destructive" : ""}
        />
        {errors.cnpj && (
          <p className="text-sm text-destructive">{errors.cnpj.message}</p>
        )}
      </div>

      {/* Endereço da Empresa */}
      <div className="space-y-2">
        <Label htmlFor="companyAddress">Endereço da Empresa *</Label>
        <Input
          id="companyAddress"
          type="text"
          placeholder="Endereço completo da empresa"
          {...register('companyAddress')}
          className={errors.companyAddress ? "border-destructive" : ""}
        />
        {errors.companyAddress && (
          <p className="text-sm text-destructive">{errors.companyAddress.message}</p>
        )}
      </div>

      {/* Senha */}
      <div className="space-y-2">
        <Label htmlFor="password">Senha *</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Sua senha"
            {...register('password')}
            className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Eye className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-primary hover:bg-primary-hover text-white"
        disabled={loading}
      >
        {loading ? "Criando conta..." : "Cadastrar como Profissional"}
      </Button>
    </form>
  );
}