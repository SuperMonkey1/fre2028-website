import type { FingerParams } from '@/lib/fingerprint/layout';
import CheckoutDialog from '@/components/bambum/CheckoutDialog';

const fmt = (n: number) => (Math.round(n * 10) / 10).toString();
const euro = (cents: number) => `€${(cents / 100).toFixed(2)}`;

function HandSummary({ title, p }: { title: string; p: FingerParams }) {
  const rows: [string, number | null, number][] = [
    ['Pinky', 0, p.width.pinky],
    ['Ring', p.offset.ring, p.width.ring],
    ['Middle', p.offset.middle, p.width.middle],
    ['Index', p.offset.index, p.width.index],
  ];
  return (
    <div>
      <div className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">{title}</div>
      <table className="w-full text-xs text-slate-600">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-slate-400">
            <th className="py-0.5 text-left font-bold">Finger</th>
            <th className="py-0.5 text-right font-bold">Length</th>
            <th className="py-0.5 text-right font-bold">Width</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, len, w]) => (
            <tr key={name} className="border-t border-slate-200/70">
              <td className="py-0.5">{name}</td>
              <td className="py-0.5 text-right tabular-nums">{fmt(len ?? 0)} mm</td>
              <td className="py-0.5 text-right tabular-nums">{fmt(w)} mm</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface Props {
  clientSecret: string;
  publishableKey: string;
  shippingUrl: string;
  livemode: boolean;
  /** The design being ordered, shown in the order summary. */
  design: { left: FingerParams; right: FingerParams; locked: boolean };
  priceCents: number;
  onClose: () => void;
}

export default function FingerPrintCheckoutDialog({ design, priceCents, ...rest }: Props) {
  return (
    <CheckoutDialog
      {...rest}
      title="FingerPrint set"
      subtitle="Custom crimp edges for your left and right hand, made to your measurements."
      summary={
        design.locked ? (
          <HandSummary title="Both hands" p={design.left} />
        ) : (
          <>
            <HandSummary title="Left hand" p={design.left} />
            <HandSummary title="Right hand" p={design.right} />
          </>
        )
      }
      rows={[
        { label: 'FingerPrint set (left + right)', value: euro(priceCents) },
        { label: 'Shipping', value: '€2.99 Belgium · €4.99 rest of the EU' },
      ]}
    />
  );
}
