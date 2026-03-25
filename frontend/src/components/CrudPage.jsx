import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './CrudPage.module.css';

/**
 * 通用 CRUD 頁面元件
 * @param {string} title      - 頁面標題
 * @param {string} apiPath    - API 路徑 (e.g. '/api/cust')
 * @param {string} idField    - 主鍵欄位名稱
 * @param {Array}  fields     - 欄位定義 [{ name, label, type?, options?, required? }]
 */
export default function CrudPage({ title, apiPath, idField, fields, tableFields }) {
  const displayTableFields = tableFields || fields;
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // modal state
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(apiPath, { params: search ? { search } : {} });
      setRows(res.data);
    } catch {
      showMsg('載入資料失敗', 'error');
    } finally {
      setLoading(false);
    }
  }, [apiPath, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function openAdd() {
    const init = {};
    fields.forEach(f => { init[f.name] = ''; });
    setForm(init);
    setModal('add');
  }

  function openEdit(row) {
    const init = {};
    fields.forEach(f => { init[f.name] = row[f.name] ?? ''; });
    setForm(init);
    setModal({ type: 'edit', id: row[idField] });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modal === 'add') {
        await axios.post(apiPath, form);
        showMsg('新增成功');
      } else {
        await axios.put(`${apiPath}/${modal.id}`, form);
        showMsg('修改成功');
      }
      setModal(null);
      fetchData();
    } catch (err) {
      showMsg(err.response?.data?.message || '操作失敗', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(`確定要刪除「${id}」嗎？`)) return;
    try {
      await axios.delete(`${apiPath}/${id}`);
      showMsg('刪除成功');
      fetchData();
    } catch (err) {
      showMsg(err.response?.data?.message || '刪除失敗', 'error');
    }
  }

  const displayFields = fields.filter(f => f.name !== idField || modal === 'add');
  const idFieldDef = fields.find(f => f.name === idField);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>← 返回主選單</button>
        <h1>{title}</h1>
        <div style={{ width: 120 }} />
      </header>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="搜尋..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchData()}
          />
          <button onClick={fetchData}>搜尋</button>
        </div>
        <button className={styles.addBtn} onClick={openAdd}>+ 新增</button>
      </div>

      {msg.text && (
        <div className={`${styles.msg} ${msg.type === 'error' ? styles.msgError : styles.msgSuccess}`}>
          {msg.text}
        </div>
      )}

      <div className={styles.tableWrap}>
        {loading ? (
          <p className={styles.loading}>載入中...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                {displayTableFields.map(f => <th key={f.name}>{f.label}</th>)}
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={displayTableFields.length + 1} className={styles.empty}>無資料</td></tr>
              ) : (
                rows.map(row => (
                  <tr key={row[idField]}>
                    {displayTableFields.map(f => (
                      <td key={f.name}>{row[f.name] ?? ''}</td>
                    ))}
                    <td className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => openEdit(row)}>修改</button>
                      <button className={styles.delBtn} onClick={() => handleDelete(row[idField])}>刪除</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className={styles.overlay} onClick={() => setModal(null)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <h2>{modal === 'add' ? '新增' : '修改'}{title}</h2>
            <form onSubmit={handleSubmit} className={styles.modalForm}>
              {modal === 'add' && idFieldDef && (
                <div className={styles.formField}>
                  <label>{idFieldDef.label}<span className={styles.req}>*</span></label>
                  <input
                    value={form[idField] ?? ''}
                    onChange={e => setForm(p => ({ ...p, [idField]: e.target.value }))}
                    required
                  />
                </div>
              )}
              {modal !== 'add' && idFieldDef && (
                <div className={styles.formField}>
                  <label>{idFieldDef.label}</label>
                  <input value={modal.id} disabled className={styles.disabled} />
                </div>
              )}
              {fields.filter(f => f.name !== idField).map(f => (
                <div key={f.name} className={styles.formField}>
                  <label>{f.label}{f.required !== false && <span className={styles.req}>*</span>}</label>
                  {f.type === 'select' ? (
                    <select
                      value={form[f.name] ?? ''}
                      onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                    >
                      <option value="">-- 請選擇 --</option>
                      {(f.options || []).map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea
                      value={form[f.name] ?? ''}
                      onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                      rows={3}
                    />
                  ) : (
                    <input
                      type={f.type || 'text'}
                      value={form[f.name] ?? ''}
                      onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                      required={f.required !== false}
                    />
                  )}
                </div>
              ))}
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setModal(null)} className={styles.cancelBtn}>取消</button>
                <button type="submit" className={styles.saveBtn} disabled={submitting}>
                  {submitting ? '儲存中...' : '儲存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
