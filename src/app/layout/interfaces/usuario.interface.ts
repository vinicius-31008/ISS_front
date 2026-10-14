import { IEmpresaResumo } from './empresa.interface';

export type PerfilUsuario = 'ADMIN' | 'USUARIO';

export interface IUsuario {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  empresa: IEmpresaResumo;
  criado_em: string;
}

/** Corpo do POST/PUT. No PUT, campos ausentes mantêm o valor atual. */
export interface IUsuarioPayload {
  empresa_id?: number;
  nome?: string;
  email?: string;
  senha?: string;
  perfil?: PerfilUsuario;
  ativo?: boolean;
}

export interface IFiltrosUsuarios {
  pagina?: number;
  por_pagina?: number;
  busca?: string;
  empresa_id?: number | null;
  perfil?: PerfilUsuario | '' | null;
  ativo?: boolean | null;
}

export interface IPaginacao {
  pagina: number;
  por_pagina: number;
  total_registros: number;
  total_paginas: number;
}

export interface IUsuariosResponse {
  sucesso: boolean;
  dados: { usuarios: IUsuario[]; paginacao: IPaginacao };
}

export interface IUsuarioResponse {
  sucesso: boolean;
  mensagem?: string;
  dados: IUsuario;
}
