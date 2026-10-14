export interface IErroLinhaImportacao {
  linha: number;
  mensagem: string;
  original: string;
}

export interface IResultadoImportacao {
  importacao_id: number;
  arquivo: string;
  status: string;
  total_linhas: number;
  total_processadas: number;
  total_erros: number;
  iss_total: number;
  erros: IErroLinhaImportacao[];
}

export interface IImportacaoResponse {
  sucesso: boolean;
  mensagem: string;
  dados: IResultadoImportacao;
}
