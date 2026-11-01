import { formatMoney } from '@primedesign/persian';
import { Button } from '@primedesign/react';
import { Store } from './store';
export default function Page() {
  return (
    <main>
      <h1>{formatMoney(100000)}</h1>
      <Button>سرور به کلاینت</Button>
      <Store />
    </main>
  );
}
