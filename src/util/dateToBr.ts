import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export function dateToBr(date: Date): string {
  return format(date, 'd LLL Y', {
    locale: ptBR,
  }).toUpperCase();
}
