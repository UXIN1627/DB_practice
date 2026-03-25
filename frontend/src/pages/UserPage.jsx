import CrudPage from '../components/CrudPage';

const FIELDS = [
  { name: 'user_id',   label: '用戶代碼', required: true },
  { name: 'user_name', label: '用戶名稱', required: true },
  { name: 'password',  label: '用戶密碼', required: true },
];

export default function UserPage() {
  return (
    <CrudPage
      title="用戶維護"
      apiPath="/api/user"
      idField="user_id"
      fields={FIELDS}
    />
  );
}
