export interface IImportacaoHistorico {
  id: number;
  arquivo: string;
  data_importacao: string;
  status: string;
  total_linhas: number;
  total_processadas: number;
  total_erros: number;
  iss_total: number;
}

export interface IPaginacaoHistorico {
  pagina: number;
  por_pagina: number;
  total_registros: number;
  total_paginas: number;
}

export interface IResumoHistorico {
  iss_total: number;
}

export interface IDadosHistorico {
  importacoes: IImportacaoHistorico[];
  paginacao: IPaginacaoHistorico;
  resumo: IResumoHistorico;
}

export interface IHistoricoResponse {
  sucesso: boolean;
  dados: IDadosHistorico;
}
