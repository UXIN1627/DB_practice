import streamlit as st
import pymssql
import pandas as pd

st.set_page_config(page_title="資料維護系統", page_icon="🗂️", layout="wide")

# ── 資料庫連線 ────────────────────────────────────────────────
def get_conn():
    s = st.secrets["db"]
    return pymssql.connect(
        server=s["server"],
        port=int(s["port"]),
        database=s["database"],
        user=s["user"],
        password=s["password"],
        charset="UTF-8",
    )

def run_query(sql, params=None, fetch=True):
    conn = get_conn()
    cur = conn.cursor(as_dict=True)
    cur.execute(sql, params or ())
    if fetch:
        rows = cur.fetchall()
        conn.close()
        return rows
    conn.commit()
    conn.close()

# ── Session state 初始化 ──────────────────────────────────────
for key, val in {"page": "login", "user": None, "mode": None, "edit_row": None}.items():
    if key not in st.session_state:
        st.session_state[key] = val

def go(page, mode=None, edit_row=None):
    st.session_state.page = page
    st.session_state.mode = mode
    st.session_state.edit_row = edit_row

# ── 登入頁 ────────────────────────────────────────────────────
def page_login():
    col1, col2, col3 = st.columns([1, 1.2, 1])
    with col2:
        st.markdown("<h2 style='text-align:center'>🗂️ 資料維護系統</h2>", unsafe_allow_html=True)
        st.markdown("---")
        with st.form("login_form"):
            user_id  = st.text_input("帳號")
            password = st.text_input("密碼", type="password")
            submit   = st.form_submit_button("登入", use_container_width=True)
        if submit:
            if not user_id or not password:
                st.error("請輸入帳號和密碼")
            else:
                rows = run_query(
                    "SELECT user_id, user_name FROM [user] WHERE user_id=%s AND password=%s",
                    (user_id, password),
                )
                if rows:
                    st.session_state.user = rows[0]
                    go("main")
                    st.rerun()
                else:
                    st.error("帳號或密碼錯誤")

# ── 主選單 ────────────────────────────────────────────────────
def page_main():
    uname = st.session_state.user["user_name"]
    col_t, col_u = st.columns([4, 1])
    col_t.title("🗂️ 資料維護系統")
    if col_u.button(f"登出 ({uname})", use_container_width=True):
        st.session_state.user = None
        go("login")
        st.rerun()

    st.markdown("### 請選擇功能")
    c1, c2, c3, c4 = st.columns(4)
    if c1.button("👥 客戶維護\n\ncust",  use_container_width=True, key="btn_cust"):
        go("cust"); st.rerun()
    if c2.button("🏭 廠商維護\n\nfact",  use_container_width=True, key="btn_fact"):
        go("fact"); st.rerun()
    if c3.button("📦 商品維護\n\nitem",  use_container_width=True, key="btn_item"):
        go("item"); st.rerun()
    if c4.button("🔑 用戶維護\n\nuser",  use_container_width=True, key="btn_user"):
        go("user"); st.rerun()

# ── 通用 CRUD 頁面 ────────────────────────────────────────────
def crud_page(title, table, id_field, columns):
    """
    columns: list of dict
        { name, label, required, type }
        type: 'text' | 'password' | 'textarea' | 'select'
        For 'select': provide options=[{value, label}]
    """
    # 頁頭
    hcol1, hcol2 = st.columns([1, 6])
    if hcol1.button("← 返回"):
        go("main"); st.rerun()
    hcol2.title(title)
    st.markdown("---")

    # 搜尋
    search = st.text_input("🔍 搜尋", placeholder=f"輸入 {id_field} 或名稱後按 Enter")

    # 查詢資料
    name_col = next((c["name"] for c in columns if "name" in c["name"]), columns[1]["name"])
    if search:
        rows = run_query(
            f"SELECT * FROM [{table}] WHERE [{id_field}] LIKE %s OR [{name_col}] LIKE %s",
            (f"%{search}%", f"%{search}%"),
        )
    else:
        rows = run_query(f"SELECT * FROM [{table}] ORDER BY [{id_field}]")

    # 顯示資料表
    if rows:
        df = pd.DataFrame(rows)
        st.dataframe(df, use_container_width=True, hide_index=True)
    else:
        st.info("無資料")

    st.markdown("---")

    # 操作按鈕列
    mode = st.session_state.mode
    btn1, btn2, btn3, *_ = st.columns([1, 1, 1, 3])
    if btn1.button("➕ 新增", use_container_width=True):
        go(st.session_state.page, mode="add"); st.rerun()
    if btn2.button("✏️ 修改", use_container_width=True):
        go(st.session_state.page, mode="edit"); st.rerun()
    if btn3.button("🗑️ 刪除", use_container_width=True):
        go(st.session_state.page, mode="delete"); st.rerun()

    # ── 新增表單 ──────────────────────
    if mode == "add":
        st.markdown("#### 新增資料")
        with st.form("add_form"):
            form_vals = {}
            for col in columns:
                form_vals[col["name"]] = _render_field(col)
            submitted = st.form_submit_button("儲存", use_container_width=True)
        if submitted:
            id_val = form_vals[id_field]
            if not id_val:
                st.error(f"{id_field} 為必填")
            else:
                fields  = [c["name"] for c in columns]
                placeholders = ",".join(["%s"] * len(fields))
                vals    = [form_vals[f] or None for f in fields]
                try:
                    run_query(
                        f"INSERT INTO [{table}] ({','.join(f'[{f}]' for f in fields)}) VALUES ({placeholders})",
                        vals, fetch=False,
                    )
                    st.success("新增成功")
                    go(st.session_state.page); st.rerun()
                except Exception as e:
                    st.error(f"新增失敗：{e}")

    # ── 修改表單 ──────────────────────
    elif mode == "edit":
        st.markdown("#### 修改資料")
        edit_id = st.text_input(f"請輸入要修改的 {id_field}")
        if edit_id:
            rec = run_query(f"SELECT * FROM [{table}] WHERE [{id_field}]=%s", (edit_id,))
            if not rec:
                st.warning("找不到該筆資料")
            else:
                rec = rec[0]
                with st.form("edit_form"):
                    st.text_input(id_field, value=rec[id_field], disabled=True)
                    form_vals = {}
                    for col in columns:
                        if col["name"] == id_field:
                            continue
                        form_vals[col["name"]] = _render_field(col, default=rec.get(col["name"], ""))
                    submitted = st.form_submit_button("儲存", use_container_width=True)
                if submitted:
                    set_clause = ", ".join(f"[{c['name']}]=%s" for c in columns if c["name"] != id_field)
                    vals = [form_vals[c["name"]] or None for c in columns if c["name"] != id_field]
                    vals.append(edit_id)
                    try:
                        run_query(
                            f"UPDATE [{table}] SET {set_clause} WHERE [{id_field}]=%s",
                            vals, fetch=False,
                        )
                        st.success("修改成功")
                        go(st.session_state.page); st.rerun()
                    except Exception as e:
                        st.error(f"修改失敗：{e}")

    # ── 刪除 ──────────────────────────
    elif mode == "delete":
        st.markdown("#### 刪除資料")
        del_id = st.text_input(f"請輸入要刪除的 {id_field}")
        if del_id:
            rec = run_query(f"SELECT * FROM [{table}] WHERE [{id_field}]=%s", (del_id,))
            if not rec:
                st.warning("找不到該筆資料")
            else:
                st.warning(f"確定要刪除 **{del_id}** 嗎？此動作無法復原。")
                if st.button("確認刪除", type="primary"):
                    try:
                        run_query(f"DELETE FROM [{table}] WHERE [{id_field}]=%s", (del_id,), fetch=False)
                        st.success("刪除成功")
                        go(st.session_state.page); st.rerun()
                    except Exception as e:
                        st.error(f"刪除失敗：{e}")


def _render_field(col, default=""):
    label = col["label"]
    t = col.get("type", "text")
    req = col.get("required", True)
    lbl = f"{label} {'*' if req else ''}"
    if t == "password":
        return st.text_input(lbl, value=default, type="password")
    if t == "textarea":
        return st.text_area(lbl, value=default)
    if t == "select":
        options = [""] + [o["value"] for o in col.get("options", [])]
        labels  = ["-- 請選擇 --"] + [o["label"] for o in col.get("options", [])]
        idx = options.index(default) if default in options else 0
        chosen = st.selectbox(lbl, options=options, index=idx, format_func=lambda v: labels[options.index(v)])
        return chosen
    return st.text_input(lbl, value=default)

# ── item 頁面（需動態載入廠商選單）─────────────────────────────
def page_item():
    facts = run_query("SELECT fact_id, fact_name FROM fact ORDER BY fact_id")
    fact_options = [{"value": f["fact_id"], "label": f"{f['fact_id']} {f['fact_name']}"} for f in facts]

    # 覆寫查詢以 JOIN fact 名稱
    title   = "商品維護"
    table   = "item"
    id_field = "item_id"

    hcol1, hcol2 = st.columns([1, 6])
    if hcol1.button("← 返回"):
        go("main"); st.rerun()
    hcol2.title(title)
    st.markdown("---")

    search = st.text_input("🔍 搜尋", placeholder="輸入商品代碼或名稱")
    base_sql = """
        SELECT i.item_id, i.item_name, i.fact_code, f.fact_name
        FROM item i LEFT JOIN fact f ON i.fact_code = f.fact_id
    """
    if search:
        rows = run_query(base_sql + " WHERE i.item_id LIKE %s OR i.item_name LIKE %s ORDER BY i.item_id",
                         (f"%{search}%", f"%{search}%"))
    else:
        rows = run_query(base_sql + " ORDER BY i.item_id")

    if rows:
        st.dataframe(pd.DataFrame(rows), use_container_width=True, hide_index=True)
    else:
        st.info("無資料")

    st.markdown("---")
    mode = st.session_state.mode
    btn1, btn2, btn3, *_ = st.columns([1, 1, 1, 3])
    if btn1.button("➕ 新增", use_container_width=True): go("item", mode="add");    st.rerun()
    if btn2.button("✏️ 修改", use_container_width=True): go("item", mode="edit");   st.rerun()
    if btn3.button("🗑️ 刪除", use_container_width=True): go("item", mode="delete"); st.rerun()

    columns = [
        {"name": "item_id",   "label": "商品代碼", "required": True},
        {"name": "item_name", "label": "商品名稱", "required": True},
        {"name": "fact_code", "label": "供應商",   "required": False, "type": "select", "options": fact_options},
    ]

    if mode == "add":
        st.markdown("#### 新增商品")
        with st.form("item_add"):
            vals = {c["name"]: _render_field(c) for c in columns}
            ok = st.form_submit_button("儲存", use_container_width=True)
        if ok:
            if not vals["item_id"] or not vals["item_name"]:
                st.error("商品代碼和名稱為必填")
            else:
                try:
                    run_query("INSERT INTO item (item_id, item_name, fact_code) VALUES (%s,%s,%s)",
                              (vals["item_id"], vals["item_name"], vals["fact_code"] or None), fetch=False)
                    st.success("新增成功"); go("item"); st.rerun()
                except Exception as e:
                    st.error(f"新增失敗：{e}")

    elif mode == "edit":
        st.markdown("#### 修改商品")
        edit_id = st.text_input("請輸入要修改的 item_id")
        if edit_id:
            rec = run_query("SELECT * FROM item WHERE item_id=%s", (edit_id,))
            if not rec:
                st.warning("找不到該商品")
            else:
                rec = rec[0]
                with st.form("item_edit"):
                    st.text_input("商品代碼", value=rec["item_id"], disabled=True)
                    new_name = _render_field({"name": "item_name", "label": "商品名稱"}, default=rec["item_name"])
                    new_fact = _render_field({"name": "fact_code", "label": "供應商", "required": False,
                                              "type": "select", "options": fact_options}, default=rec.get("fact_code", ""))
                    ok = st.form_submit_button("儲存", use_container_width=True)
                if ok:
                    try:
                        run_query("UPDATE item SET item_name=%s, fact_code=%s WHERE item_id=%s",
                                  (new_name, new_fact or None, edit_id), fetch=False)
                        st.success("修改成功"); go("item"); st.rerun()
                    except Exception as e:
                        st.error(f"修改失敗：{e}")

    elif mode == "delete":
        st.markdown("#### 刪除商品")
        del_id = st.text_input("請輸入要刪除的 item_id")
        if del_id:
            rec = run_query("SELECT * FROM item WHERE item_id=%s", (del_id,))
            if not rec:
                st.warning("找不到該商品")
            else:
                st.warning(f"確定要刪除 **{del_id}** 嗎？")
                if st.button("確認刪除", type="primary"):
                    try:
                        run_query("DELETE FROM item WHERE item_id=%s", (del_id,), fetch=False)
                        st.success("刪除成功"); go("item"); st.rerun()
                    except Exception as e:
                        st.error(f"刪除失敗：{e}")

# ── 路由 ──────────────────────────────────────────────────────
page = st.session_state.page

if page == "login":
    page_login()
elif st.session_state.user is None:
    go("login"); st.rerun()
elif page == "main":
    page_main()
elif page == "cust":
    crud_page("👥 客戶維護", "cust", "cust_id", [
        {"name": "cust_id",   "label": "客戶代碼", "required": True},
        {"name": "cust_name", "label": "客戶名稱", "required": True},
        {"name": "remark",    "label": "備註說明", "required": False, "type": "textarea"},
    ])
elif page == "fact":
    crud_page("🏭 廠商維護", "fact", "fact_id", [
        {"name": "fact_id",   "label": "廠商代碼", "required": True},
        {"name": "fact_name", "label": "廠商名稱", "required": True},
        {"name": "remark",    "label": "備註說明", "required": False, "type": "textarea"},
    ])
elif page == "item":
    page_item()
elif page == "user":
    crud_page("🔑 用戶維護", "user", "user_id", [
        {"name": "user_id",   "label": "用戶代碼", "required": True},
        {"name": "user_name", "label": "用戶名稱", "required": True},
        {"name": "password",  "label": "用戶密碼", "required": True, "type": "password"},
    ])
