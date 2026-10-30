/** Rola suavemente até a seção da landing com o id informado. */
export function rolarPara(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
