import { describe, it, expect, vi } from 'vitest';

// Mock do cenário de validação de skills (Lógica que foi para o RLS, mas testamos a lógica aqui)
const checkAccess = (userSkills: string[], requiredSkills: string[]) => {
  if (!requiredSkills || requiredSkills.length === 0) return true;
  return requiredSkills.every(skill => userSkills.includes(skill));
};

describe('Controle de Acesso - Qualificações', () => {
  
  it('Deve permitir acesso se o serviço não exigir skills', () => {
    const userSkills: string[] = [];
    const requiredSkills: string[] = [];
    expect(checkAccess(userSkills, requiredSkills)).toBe(true);
  });

  it('Deve permitir acesso se o montador tiver todas as skills exigidas', () => {
    const userSkills = ['A', 'B', 'C'];
    const requiredSkills = ['A', 'B'];
    expect(checkAccess(userSkills, requiredSkills)).toBe(true);
  });

  it('Deve BLOQUEAR acesso se faltar uma skill exigida', () => {
    const userSkills = ['A'];
    const requiredSkills = ['A', 'B'];
    expect(checkAccess(userSkills, requiredSkills)).toBe(false);
  });

  it('Deve permitir acesso exato', () => {
    const userSkills = ['A'];
    const requiredSkills = ['A'];
    expect(checkAccess(userSkills, requiredSkills)).toBe(true);
  });
});
