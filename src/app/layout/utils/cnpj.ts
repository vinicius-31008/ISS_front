export function somenteDigitos(valor: string): string {
    return valor.replace(/\D/g, '');
}

/** 12345678000190 -> 12.345.678/0001-90. Aplica a máscara parcialmente enquanto se digita. */
export function formatarCnpj(valor: string): string {
    const d = somenteDigitos(valor).slice(0, 14);

    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
    if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
    if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}
