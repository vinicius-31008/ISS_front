export function somenteDigitos(valor: string | null | undefined): string {
    return (valor ?? '').replace(/\D/g, '');
}

/** 12345678000190 -> 12.345.678/0001-90. Aplica a máscara parcialmente enquanto se digita. */
export function formatarCnpj(valor: string | null | undefined): string {
    const d = somenteDigitos(valor).slice(0, 14);

    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
    if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
    if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

/** Documento completo: 11 dígitos vira CPF (123.456.789-01), o resto segue a máscara de CNPJ. */
export function formatarCpfCnpj(valor: string | null | undefined): string {
    const d = somenteDigitos(valor);

    if (d.length === 11) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
    return formatarCnpj(d);
}
