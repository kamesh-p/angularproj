import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(text: string, length: number = 100): string {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  }
}
