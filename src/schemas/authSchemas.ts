import { z } from "zod";

// Regex patterns for validation
const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

// Custom validation functions
const validateCPF = (cpf: string): boolean => {
  const cleanCpf = cpf.replace(/[^\d]/g, '');
  if (cleanCpf.length !== 11 || /^(\d)\1+$/.test(cleanCpf)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cleanCpf.charAt(10));
};

const validateCNPJ = (cnpj: string): boolean => {
  const cleanCnpj = cnpj.replace(/[^\d]/g, '');
  if (cleanCnpj.length !== 14 || /^(\d)\1+$/.test(cleanCnpj)) return false;
  
  let sum = 0;
  let weight = 2;
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cleanCnpj.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(cleanCnpj.charAt(12)) !== digit1) return false;
  
  sum = 0;
  weight = 2;
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cleanCnpj.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  return parseInt(cleanCnpj.charAt(13)) === digit2;
};

export const clientSignUpSchema = z.object({
  fullName: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),
  email: z
    .string()
    .email("E-mail inválido")
    .toLowerCase(),
  password: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .max(100, "Senha muito longa")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Senha deve conter ao menos: 1 letra minúscula, 1 maiúscula e 1 número"),
  cpf: z
    .string()
    .regex(cpfRegex, "CPF deve estar no formato XXX.XXX.XXX-XX")
    .refine(validateCPF, "CPF inválido"),
  phone: z
    .string()
    .regex(phoneRegex, "Telefone deve estar no formato (XX) XXXXX-XXXX"),
  address: z
    .string()
    .min(10, "Endereço deve ter pelo menos 10 caracteres")
    .max(200, "Endereço muito longo"),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato AAAA-MM-DD")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 16 && age <= 120;
    }, "Idade deve estar entre 16 e 120 anos"),
});

export const professionalSignUpSchema = z.object({
  fullName: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),
  email: z
    .string()
    .email("E-mail inválido")
    .toLowerCase(),
  password: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .max(100, "Senha muito longa")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Senha deve conter ao menos: 1 letra minúscula, 1 maiúscula e 1 número"),
  phone: z
    .string()
    .regex(phoneRegex, "Telefone deve estar no formato (XX) XXXXX-XXXX"),
  companyName: z
    .string()
    .min(2, "Nome da empresa deve ter pelo menos 2 caracteres")
    .max(100, "Nome da empresa muito longo"),
  cnpj: z
    .string()
    .regex(cnpjRegex, "CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX")
    .refine(validateCNPJ, "CNPJ inválido")
    .optional()
    .or(z.literal("")),
  companyAddress: z
    .string()
    .min(10, "Endereço da empresa deve ter pelo menos 10 caracteres")
    .max(200, "Endereço muito longo"),
});

export const serviceSchema = z.object({
  name: z
    .string()
    .min(2, "Nome do serviço deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  description: z
    .string()
    .max(500, "Descrição muito longa")
    .optional(),
  price: z
    .number()
    .min(0.01, "Preço deve ser maior que zero")
    .max(10000, "Preço muito alto"),
  duration: z
    .number()
    .min(15, "Duração mínima de 15 minutos")
    .max(480, "Duração máxima de 8 horas"),
});

export const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),
  phone: z
    .string()
    .regex(phoneRegex, "Telefone deve estar no formato (XX) XXXXX-XXXX")
    .optional(),
  address: z
    .string()
    .min(10, "Endereço deve ter pelo menos 10 caracteres")
    .max(200, "Endereço muito longo")
    .optional(),
});

export type ClientSignUpData = z.infer<typeof clientSignUpSchema>;
export type ProfessionalSignUpData = z.infer<typeof professionalSignUpSchema>;