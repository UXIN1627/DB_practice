import { useEffect, useState } from 'react';
import axios from 'axios';
import CrudPage from '../components/CrudPage';

export default function ItemPage() {
  const [factOptions, setFactOptions] = useState([]);

  useEffect(() => {
    axios.get('/api/fact').then(res => {
      setFactOptions(res.data.map(f => ({ value: f.fact_id, label: `${f.fact_id} ${f.fact_name}` })));
    }).catch(() => {});
  }, []);

  // 表單欄位（新增/修改用）
  const fields = [
    { name: 'item_id',   label: '商品代碼', required: true },
    { name: 'item_name', label: '商品名稱', required: true },
    { name: 'fact_code', label: '供應商',   required: false, type: 'select', options: factOptions },
  ];

  // 表格欄位（查詢顯示，多一欄 fact_name）
  const tableFields = [
    { name: 'item_id',   label: '商品代碼' },
    { name: 'item_name', label: '商品名稱' },
    { name: 'fact_code', label: '供應商代碼' },
    { name: 'fact_name', label: '供應商名稱' },
  ];

  return (
    <CrudPage
      title="商品維護"
      apiPath="/api/item"
      idField="item_id"
      fields={fields}
      tableFields={tableFields}
    />
  );
}
