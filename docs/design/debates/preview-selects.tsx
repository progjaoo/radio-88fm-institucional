import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CalendarDays, CalendarRange } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../src/components/ui/select';

function PreviewSelect({ native }: { native: HTMLSelectElement }) {
  const [value, setValue] = useState(native.value || 'all');
  useEffect(() => {
    const sync = () => setValue(native.value || 'all');
    window.addEventListener('debate-filters-sync', sync);
    return () => window.removeEventListener('debate-filters-sync', sync);
  }, [native]);
  const Icon = native.id === 'year' ? CalendarDays : CalendarRange;
  return <Select value={value} onValueChange={(next) => {
    native.value = next === 'all' ? '' : next;
    setValue(next);
    native.dispatchEvent(new Event('change', { bubbles: true }));
  }}>
    <SelectTrigger id={`${native.id}-trigger`} aria-label={native.id === 'year' ? 'Ano' : 'Mês'} className="debate-select-trigger">
      <Icon aria-hidden="true" className="debate-filter-icon" />
      <SelectValue />
    </SelectTrigger>
    <SelectContent className="debate-select-content" sideOffset={6}>
      {Array.from(native.options).map(option => <SelectItem className="debate-select-item" key={option.value || 'all'} value={option.value || 'all'}>{option.text}</SelectItem>)}
    </SelectContent>
  </Select>;
}
for (const id of ['year', 'month']) {
  const native = document.getElementById(id) as HTMLSelectElement;
  native.hidden = true;
  native.tabIndex = -1;
  native.setAttribute('aria-hidden', 'true');
  native.closest('label')?.setAttribute('for', `${id}-trigger`);
  const mount = document.createElement('div');
  native.after(mount);
  createRoot(mount).render(<PreviewSelect native={native} />);
}
