export interface ITotaisDashboard {
    notas: number;
    valor_servico: number;
    valor_iss: number;
    importacoes: number;
    linhas_com_erro: number;
    prestadores: number;
    tomadores: number;
}

export interface IMesDashboard {
    /** YYYY-MM */
    mes: string;
    notas: number;
    valor_servico: number;
    valor_iss: number;
}

export interface IStatusDashboard {
    status: 'PROCESSADA' | 'PROCESSADA_COM_ERROS' | 'ERRO';
    total: number;
}

export interface IServicoDashboard {
    codigo_lc116: string;
    descricao: string;
    notas: number;
    valor_iss: number;
}

export interface ITomadorDashboard {
    cpf_cnpj: string;
    razao_social: string | null;
    notas: number;
    valor_servico: number;
    valor_iss: number;
}

export interface IImportacaoDashboard {
    id: number;
    arquivo: string;
    data_importacao: string;
    status: string;
    total_processadas: number;
    total_erros: number;
    iss_total: number;
}

export interface IDadosDashboard {
    totais: ITotaisDashboard;
    por_mes: IMesDashboard[];
    importacoes_por_status: IStatusDashboard[];
    top_servicos: IServicoDashboard[];
    top_tomadores: ITomadorDashboard[];
    ultimas_importacoes: IImportacaoDashboard[];
}

export interface IDashboardResponse {
    sucesso: boolean;
    dados: IDadosDashboard;
}
