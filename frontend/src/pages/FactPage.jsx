import CrudPage from '../components/CrudPage';

const FIELDS = [
  { name: 'fact_id',   label: '廠商代碼', required: true },
  { name: 'fact_name', label: '廠商名稱', required: true },
  { name: 'remark',    label: '備註說明', required: false, type: 'textarea' },
];

export default function FactPage() {
  return (
    <CrudPage
      title="廠商維護"
      apiPath="/api/fact"
      idField="fact_id"
      fields={FIELDS}
    />
  );
}
