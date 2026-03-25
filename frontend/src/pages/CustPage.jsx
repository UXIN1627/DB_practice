import CrudPage from '../components/CrudPage';

const FIELDS = [
  { name: 'cust_id',   label: '客戶代碼', required: true },
  { name: 'cust_name', label: '客戶名稱', required: true },
  { name: 'remark',    label: '備註說明', required: false, type: 'textarea' },
];

export default function CustPage() {
  return (
    <CrudPage
      title="客戶維護"
      apiPath="/api/cust"
      idField="cust_id"
      fields={FIELDS}
    />
  );
}
