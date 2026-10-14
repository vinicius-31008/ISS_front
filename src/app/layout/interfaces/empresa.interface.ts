import { IPaginacao } from './usuario.interface';

export interface IEmpresaResumo {
  id: number;
  cnpj: string;
  razao_social: string;
}

export interface IEmpresa extends IEmpresaResumo {
  ativo: boolean;
  usuarios_ativos: number;
  criado_em: string;
}

/** Corpo do POST/PUT. No PUT, campos ausentes mantêm o valor atual. */
export interface IEmpresaPayload {
  cnpj?: string;
  razao_social?: string;
  ativo?: boolean;
}

export interface IFiltrosEmpresas {
  pagina?: number;
  por_pagina?: number;
  busca?: string;
  ativo?: boolean | null;
}

export interface IEmpresasResponse {
  sucesso: boolean;
  dados: { empresas: IEmpresa[]; paginacao: IPaginacao };
}

export interface IEmpresaResponse {
  sucesso: boolean;
  mensagem?: string;
  dados: IEmpresa;
}
